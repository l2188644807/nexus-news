const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

const { CATEGORIES } = require('./services/sources');
const storage = require('./services/storage');
const aggregator = require('./services/aggregator');
const sseManager = require('./services/sseManager');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. SSE 实时长连接端点 (用于即时向浏览器推送最新新闻)
app.get('/api/stream', (req, res) => {
  sseManager.addClient(req, res);
});

// 2. 分页与条件筛选检索资讯
app.get('/api/news', (req, res) => {
  try {
    const { category, search, tag, source, page, limit } = req.query;
    const result = storage.getNews({
      category,
      search,
      tag,
      source,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 18
    });
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. 7x24h 跑马灯快讯
app.get('/api/ticker', (req, res) => {
  try {
    const ticker = storage.getTicker();
    res.json({ success: true, data: ticker });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. 获取系统统计与数据源监控
app.get('/api/stats', (req, res) => {
  try {
    const stats = storage.getStats();
    res.json({
      success: true,
      data: {
        ...stats,
        connectedClients: sseManager.getClientCount()
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

// 6. 手动触发全网即时重新采集
app.post('/api/news/refresh', async (req, res) => {
  try {
    const result = await aggregator.runAggregation();
    res.json({
      success: true,
      message: `成功抓取全网最新资讯，新增 ${result.addedCount} 篇`,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 定时任务：每 5 分钟全自动增量抓取最新资讯
cron.schedule('*/5 * * * *', async () => {
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
  console.log(`📡 覆盖模块: 每日实时新闻 | 实时电竞 | 游戏前沿 | 全球大事`);
  console.log(`====================================================`);

  // 服务启动 2 秒后，自动触发首次抓取更新
  setTimeout(() => {
    aggregator.runAggregation().catch(err => {
      console.warn('Initial crawl notice:', err.message);
    });
  }, 2000);
});

// 优雅关闭
process.on('SIGTERM', () => {
  server.close(() => console.log('Server stopped'));
});
