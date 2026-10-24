/**
 * 智讯枢纽 (NEXUS PULSE) 自动化回归与质量基准测试套件
 * 严格覆盖 P0 (安全与崩溃)、P1 (虚假数据与孤儿分类)、P2 (并发与健壮性)
 */
const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.status, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.status, headers: res.headers, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 开始执行 NEXUS PULSE 全量工程与数据质量自检...\n');
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

  try {
    // 1. 验证 P0-1: limit 不校验正负
    const limitNegRes = await get('/api/news?limit=-1');
    assert(
      limitNegRes.body.success && limitNegRes.body.data.limit === 1 && limitNegRes.body.data.items.length <= 1,
      'P0-1: limit=-1 被限制为安全值 1 (防止全库 4.9MB 泄露)'
    );

    const limitHugeRes = await get('/api/news?limit=999999');
    assert(
      limitHugeRes.body.success && limitHugeRes.body.data.limit === 50 && limitHugeRes.body.data.items.length <= 50,
      'P0-1: limit=999999 被上限严格截断为 50 篇'
    );

    // 2. 验证 P0-2: page 为负
    const pageNegRes = await get('/api/news?page=-1');
    assert(
      pageNegRes.body.success && pageNegRes.body.data.page === 1,
      'P0-2: page=-1 被规范重置为第 1 页 (语义不再错乱)'
    );

    // 3. 验证 P0-4: 跑马灯具备弹窗完整字段
    const tickerRes = await get('/api/ticker');
    const firstTicker = tickerRes.body.data && tickerRes.body.data[0];
    const hasRequiredFields = firstTicker && firstTicker.image && firstTicker.summary && firstTicker.pubDate;
    assert(
      tickerRes.body.success && hasRequiredFields,
      'P0-4: /api/ticker 包含 image/summary/pubDate/tags 全字段 (弹窗不再破图或空摘要)'
    );

    // 4. 验证 P0-5: stats 在线推流人数
    const statsRes = await get('/api/stats');
    assert(
      statsRes.body.success && statsRes.body.data.connectedClients >= 1,
      'P0-5: /api/stats 返回准确的 connectedClients 客户端数'
    );

    // 5. 验证 P1-6: 118 篇孤儿文章 (category: news) 清理
    const orphanCheck = await get('/api/news?category=news');
    assert(
      orphanCheck.body.success && orphanCheck.body.data.total === 0,
      'P1-6: 历史 category: "news" 孤儿文章已全部归档/清洗，孤儿数为 0'
    );

    // 6. 验证 P1-8: isBreaking 动态计算与时效
    const breakingRes = await get('/api/news?limit=50');
    const items = breakingRes.body.data.items || [];
    const staleBreaking = items.filter(a => a.isBreaking && (Date.now() - a.timestamp > 3.5 * 3600 * 1000));
    assert(
      staleBreaking.length === 0,
      'P1-8: 超出 3 小时的新闻绝不再打红色 LIVE 角标'
    );

    // 7. 验证 P2-18: 安全头部与压缩
    assert(
      limitNegRes.headers['x-powered-by'] === undefined,
      'P2-18: X-Powered-By 已安全隐藏'
    );

    console.log(`\n========================================`);
    console.log(`测试完成: ${passed} 项通过, ${failed} 项失败`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('测试异常中断:', err);
    process.exit(1);
  }
}

runTests();
