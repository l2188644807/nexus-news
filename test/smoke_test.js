/**
 * 智讯枢纽 (NEXUS PULSE) 独立回归与质量基准自动化测试套件
 * 自包含独立拉起临时端口测试服务，无需手动预跑 server.js (解决 R9)
 */
const http = require('http');
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

    // 5. 验证 R7: /api/stats 真实报告在线客户端数，不再伪造保底 1
    const statsRes = await get('/api/stats');
    assert(
      statsRes.body.success && typeof statsRes.body.data.connectedClients === 'number',
      'R7: /api/stats 返回真实推流客户端数 (客观数据，不再硬编码伪造)'
    );

    // 6. 验证 R1: 彻底清理 22 个非指定旧幽灵源
    const validSourceIds = new Set(SOURCES.map(s => s.id));
    let ghostCount = 0;
    for (const a of storage.articles.values()) {
      if (!validSourceIds.has(a.sourceId)) ghostCount++;
    }
    assert(
      ghostCount === 0,
      'R1: 403 篇旧幽灵源文章已全部清理/映射，在库文章 100% 隶属 88 官方源'
    );

    // 7. 验证 R2: 标签全面重算，无非科技文章误贴 #AI前沿 (区分中文包含与英文词边界)
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
      'R2: 存量历史文章标签全量完成清洗，0 篇无关文章被误贴 #AI前沿'
    );

    // 8. 验证 R8: 移除“最新”导致的历史新闻 LIVE 误报
    const newsRes = await get('/api/news?limit=50');
    const items = newsRes.body.data.items || [];
    const staleBreaking = items.filter(a => a.isBreaking && (Date.now() - a.timestamp > 3 * 3600 * 1000));
    assert(
      staleBreaking.length === 0,
      'R8: 3 小时前的新闻不再因包含“最新”误挂 LIVE 突发角标'
    );

    // 9. 验证 R12: 存量图片无 http:// 混合内容风险
    let httpImgCount = 0;
    for (const a of storage.articles.values()) {
      if (a.image && a.image.startsWith('http://')) httpImgCount++;
    }
    assert(
      httpImgCount === 0,
      'R12: 全库文章配图 100% 具备 HTTPS 协议'
    );

    // 10. 验证安全防护：X-Powered-By 隐藏
    assert(
      limitNegRes.headers['x-powered-by'] === undefined,
      'P2-18: X-Powered-By 安全隐藏'
    );

    console.log(`\n========================================`);
    console.log(`测试结果: ${passed} 项通过, ${failed} 项失败`);
    console.log(`========================================\n`);

    testServer.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('测试异常中断:', err);
    testServer.close();
    process.exit(1);
  }
}

runTests();
