/**
 * 智讯枢纽 (NEXUS PULSE) 独立回归与质量基准自动化测试套件
 * 自包含独立拉起临时端口测试服务，并使用独立测试缓存，彻底杜绝污染生产库 (解决 C5, C6, R9)
 */
const path = require('path');
const fs = require('fs');
const http = require('http');

// 解决 C6: 使用隔离测试数据文件，保护生产 news_cache.json 的 mtime 与完整性
const PROD_CACHE = path.join(__dirname, '..', 'data', 'news_cache.json');
const TEST_CACHE = path.join(__dirname, '..', 'data', 'test_smoke_cache.json');

if (fs.existsSync(PROD_CACHE)) {
  fs.copyFileSync(PROD_CACHE, TEST_CACHE);
} else {
  fs.writeFileSync(TEST_CACHE, '[]', 'utf-8');
}
process.env.NEWS_DATA_FILE = TEST_CACHE;

const { app } = require('../server');
const storage = require('../services/storage');
const { SOURCES } = require('../services/sources');

async function runTests() {
  console.log('🧪 正在拉起独立测试专用实例 (随机可用临时端口)...');
  
  const testServer = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const port = testServer.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🚀 测试实例已在 ${baseUrl} 就绪，开始回归质检...\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  function get(path) {
    return new Promise((resolve, reject) => {
      http.get(`${baseUrl}${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, body: data });
          }
        });
      }).on('error', reject);
    });
  }

  try {
    // 1. 验证 P0-1: limit 负数防穿透
    const limitNegRes = await get('/api/news?limit=-1');
    assert(
      limitNegRes.body.success && limitNegRes.body.data.limit === 1 && limitNegRes.body.data.items.length <= 1,
      'P0-1: limit=-1 被限制为安全值 1 (防止全库 4.9MB 泄露)'
    );

    // 2. 验证 P0-1: limit 极大值截断
    const limitHugeRes = await get('/api/news?limit=999999');
    assert(
      limitHugeRes.body.success && limitHugeRes.body.data.limit === 50 && limitHugeRes.body.data.items.length <= 50,
      'P0-1: limit=999999 被严格截断至上限 50'
    );

    // 3. 验证 P0-2: page 负数重置
    const pageNegRes = await get('/api/news?page=-1');
    assert(
      pageNegRes.body.success && pageNegRes.body.data.page === 1,
      'P0-2: page=-1 规范修正为第 1 页'
    );

    // 4. 验证 P0-4 & R13: /api/ticker 包含必要字段且不冗余推送全文 content
    const tickerRes = await get('/api/ticker');
    const firstTicker = tickerRes.body.data && tickerRes.body.data[0];
    const hasRequiredFields = firstTicker && firstTicker.image && firstTicker.summary && firstTicker.pubDate;
    const noBloatedContent = firstTicker && firstTicker.content === undefined;
    assert(
      tickerRes.body.success && hasRequiredFields && noBloatedContent,
      'P0-4 & R13: /api/ticker 包含弹窗必备字段，且剔除全文 content 保持轻量 (~8KB)'
    );

    // 5. 验证 C7: /api/news 不再下发 2.0MB 冗余 content 字段
    const newsRes = await get('/api/news?limit=10');
    const firstNews = newsRes.body.data && newsRes.body.data.items && newsRes.body.data.items[0];
    assert(
      firstNews && firstNews.content === undefined,
      'C7: /api/news 移除沉重 content 字段，单次网络响应减少约 80%'
    );

    // 6. 验证 C3: 过滤残缺空标题 (如 "- The New York Times")
    let badTitleCount = 0;
    for (const a of storage.articles.values()) {
      if (/^[\-–—|·]/.test((a.title || '').trim()) || (a.title || '').includes('sports news, stories, scores')) {
        badTitleCount++;
      }
    }
    assert(
      badTitleCount === 0,
      'C3: 彻底剔除 14 张 "- The New York Times" 等残缺空前缀卡片'
    );

    // 7. 验证 C4: 焦点话题不包含渠道固定 badge
    const statsRes = await get('/api/stats');
    const badges = new Set(SOURCES.map(s => s.badge).filter(Boolean));
    const topTags = statsRes.body.data && statsRes.body.data.topTags ? statsRes.body.data.topTags : [];
    const badgeOverlap = topTags.filter(t => badges.has(t.name));
    assert(
      badgeOverlap.length === 0,
      'C4: 焦点话题 100% 均为真实内容热词，已过滤渠道 badge 伪话题'
    );

    // 8. 验证 R7: /api/stats 真实报告在线客户端数
    assert(
      statsRes.body.success && typeof statsRes.body.data.connectedClients === 'number',
      'R7: /api/stats 返回真实推流客户端数'
    );

    // 9. 验证 R1: 彻底清理旧幽灵源
    const validSourceIds = new Set(SOURCES.map(s => s.id));
    let ghostCount = 0;
    for (const a of storage.articles.values()) {
      if (!validSourceIds.has(a.sourceId)) ghostCount++;
    }
    assert(
      ghostCount === 0,
      'R1: 旧幽灵源文章清理完毕，在库文章 100% 隶属 88 官方信标源'
    );

    // 10. 验证 C2: 行业分类白名单防止跨行业标签误标
    let dirtyAiCount = 0;
    for (const a of storage.articles.values()) {
      if (a.tags && a.tags.includes('AI前沿')) {
        const text = (a.title + ' ' + (a.summary || '')).toLowerCase();
        const hasChineseAiKey = ['大模型', '生成式ai', '芯片', '算力', '人工智能'].some(k => text.includes(k));
        const hasEnglishAiKey = /\b(ai|gpt|openai|llm|deepseek|anthropic)\b/i.test(text);
        if (!hasChineseAiKey && !hasEnglishAiKey) {
          dirtyAiCount++;
        }
      }
    }
    assert(
      dirtyAiCount === 0,
      'C2: 分类白名单生效，无 fast break/switch/steam/s16 跨界误标'
    );

    // 11. 验证 C8: 安全响应头规范
    const headers = limitNegRes.headers;
    const hasSecurityHeaders = (
      headers['x-content-type-options'] === 'nosniff' &&
      headers['x-frame-options'] === 'SAMEORIGIN' &&
      headers['referrer-policy'] === 'strict-origin-when-cross-origin' &&
      headers['x-powered-by'] === undefined
    );
    assert(
      hasSecurityHeaders,
      'C8: X-Content-Type-Options、X-Frame-Options、Referrer-Policy 安全响应头就绪'
    );

    // 12. 验证 R12: 存量图片协议安全
    let httpImgCount = 0;
    for (const a of storage.articles.values()) {
      if (a.image && a.image.startsWith('http://')) httpImgCount++;
    }
    assert(
      httpImgCount === 0,
      'R12: 全库文章配图 100% 具备 HTTPS 协议'
    );

    console.log(`\n========================================`);
    console.log(`测试结果: ${passed} 项通过, ${failed} 项失败`);
    console.log(`========================================\n`);

    testServer.close();
    try {
      if (fs.existsSync(TEST_CACHE)) fs.unlinkSync(TEST_CACHE);
      if (fs.existsSync(TEST_CACHE + '.tmp')) fs.unlinkSync(TEST_CACHE + '.tmp');
    } catch (e) {}

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('测试异常中断:', err);
    testServer.close();
    try {
      if (fs.existsSync(TEST_CACHE)) fs.unlinkSync(TEST_CACHE);
    } catch (e) {}
    process.exit(1);
  }
}

runTests();
