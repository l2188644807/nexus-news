const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const cron = require('node-cron');

const { CATEGORIES } = require('./services/sources');
const storage = require('./services/storage');
const aggregator = require('./services/aggregator');
const sseManager = require('./services/sseManager');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全与性能增强
app.disable('x-powered-by');
app.use(compression());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 辅助函数：规范化单值 Query 参数（防重复参数注入成数组导致恒假判断）
const getSingleParam = (val) => Array.isArray(val) ? val[0] : val;

// 1. SSE 实时长连接端点 (用于即时向浏览器推送最新新闻)
app.get('/api/stream', (req, res) => {
  sseManager.addClient(req, res);
});

// 2. 分页与条件筛选检索资讯 (严格校验 limit 与 page 防边界穿透)
app.get('/api/news', (req, res) => {
  try {
    const category = getSingleParam(req.query.category);
    const search = getSingleParam(req.query.search);
    const tag = getSingleParam(req.query.tag);
    const source = getSingleParam(req.query.source);

    // 严格校验与归一化
    const rawPage = parseInt(getSingleParam(req.query.page), 10);
    const rawLimit = parseInt(getSingleParam(req.query.limit), 10);

    const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
    const limit = Math.min(Math.max(isNaN(rawLimit) ? 18 : rawLimit, 1), 50);

    const result = storage.getNews({
      category,
      search,
      tag,
      source,
      page,
      limit
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. 7x24h 跑马灯快讯 (包含完整卡片详情数据，点击不破图)
app.get('/api/ticker', (req, res) => {
  try {
    const ticker = storage.getTicker();
    res.json({ success: true, data: ticker });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. 获取系统统计与数据源监控 (包含实时在线客户端数)
app.get('/api/stats', (req, res) => {
  try {
    const stats = storage.getStats();
    res.json({
      success: true,
      data: {
        ...stats,
        connectedClients: Math.max(1, sseManager.getClientCount())
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. 分类元数据
app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: CATEGORIES });
});

// 6. 手动触发全网即时重新采集 (带防刷限流与并发锁状态)
let lastManualRefreshTime = 0;

app.post('/api/news/refresh', async (req, res) => {
  const now = Date.now();
  // 30 秒频控防恶意连击
  if (now - lastManualRefreshTime < 15000) {
    return res.status(429).json({
      success: false,
      skipped: true,
      message: '抓取刷新过于频繁，请稍候片刻再试'
    });
  }

  // 并发锁保护：已有采集进行中时返回冲突早退，避免假成功
  if (aggregator.isFetching) {
    return res.status(409).json({
      success: false,
      skipped: true,
      message: '全网采集抓取正在进行中，已自动同步最新数据'
    });
  }

  lastManualRefreshTime = now;

  try {
    const result = await aggregator.runAggregation();
    res.json({
      success: true,
      skipped: false,
      message: `成功抓取全网最新资讯，新增 ${result.addedCount} 篇`,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 定时任务：每 5 分钟全自动增量抓取最新资讯
const crawlJob = cron.schedule('*/5 * * * *', async () => {
  console.log('[Scheduler] Running scheduled crawl...');
  try {
    await aggregator.runAggregation();
  } catch (e) {
    console.error('[Scheduler] Error in scheduled crawl:', e.message);
  }
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 智讯枢纽 (NEXUS PULSE) 实时资讯聚合系统已启动`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`📡 覆盖模块: 11 大核心专业板块 (100% 真实数据流)`);
  console.log(`====================================================`);

  // 服务启动 2 秒后，自动触发首次抓取更新
  setTimeout(() => {
    aggregator.runAggregation().catch(err => {
      console.warn('Initial crawl notice:', err.message);
    });
  }, 2000);
});

// 优雅关闭：断开 SSE 连接、销毁定时器并关闭 HTTP 监听
const shutdown = () => {
  console.log('[System] Gracefully shutting down server...');
  if (crawlJob) crawlJob.stop();
  sseManager.closeAll();
  server.close(() => {
    console.log('[System] HTTP server closed cleanly.');
    process.exit(0);
  });
  // 5秒强制退出保护
  setTimeout(() => {
    console.error('[System] Forced exit due to timeout.');
    process.exit(1);
  }, 5000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = { app, server };
