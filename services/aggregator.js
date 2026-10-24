const Parser = require('rss-parser');
const cheerio = require('cheerio');
const crypto = require('crypto');
const { SOURCES } = require('./sources');
const storage = require('./storage');
const sseManager = require('./sseManager');
const { deriveTags } = require('./tagger');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator']
    ]
  }
});

// 各模块主题高质量摄影图库兜底 (强制全量采用 HTTPS，严格按各垂直板块分类)
const CATEGORY_DEFAULT_IMAGES = {
  astronomy: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=600&auto=format&fit=crop&q=80'
  ],
  esports: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80'
  ],
  gaming: [
    'https://images.unsplash.com/photo-1612287233261-755d49f056d6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
  ],
  world: [
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80'
  ],
  sports: [
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80'
  ],
  military: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80'
  ],
  education: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80'
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80'
  ],
  cinema: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80'
  ],
  finance: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80'
  ],
  tech: [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'
  ]
};

function getRandomImage(category, seed = '') {
  const list = CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES.world;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
  }
  const idx = Math.abs(hash) % list.length;
  return list[idx];
}

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  let clean = url.trim();
  if (clean.startsWith('//')) clean = 'https:' + clean;
  else if (clean.startsWith('http://')) clean = 'https://' + clean.slice(7);
  return clean.startsWith('https://') ? clean : null;
}

function extractFirstImage(html) {
  if (!html) return null;
  try {
    const $ = cheerio.load(html);
    const src = $('img').first().attr('src') || $('image').first().attr('src');
    return normalizeImageUrl(src);
  } catch (err) {}
  return null;
}

function stripHtml(html, maxLength = 190) {
  if (!html) return '';
  try {
    const $ = cheerio.load(html);
    let text = $.text().replace(/\s+/g, ' ').trim();
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    return text;
  } catch (e) {
    return (html || '').replace(/<[^>]+>/g, '').trim().substring(0, maxLength);
  }
}

class HybridAggregator {
  constructor() {
    this.isFetching = false;
  }

  async fetchRSS(source) {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, 15).map(raw => this.formatItem(raw, source));
  }

  async fetchCleanRSS(source) {
    const res = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      signal: AbortSignal.timeout(9000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let xml = await res.text();

    xml = xml.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
    xml = xml.replace(/<description>([\s\S]*?)<\/description>/gi, (match, content) => {
      if (content.includes('<![CDATA[')) return match;
      return `<description><![CDATA[${content}]]></description>`;
    });
    xml = xml.replace(/<title>([\s\S]*?)<\/title>/gi, (match, content) => {
      if (content.includes('<![CDATA[')) return match;
      return `<title><![CDATA[${content}]]></title>`;
    });

    const feed = await parser.parseString(xml);
    return (feed.items || []).slice(0, 15).map(raw => this.formatItem(raw, source));
  }

  async fetchScrape(source) {
    const res = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(9000)
    });
    // 解决 D1: 校验 HTTP 响应状态，避免 403 权限提示页被当做正常新闻解析入库
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const items = [];
    const seenTitles = new Set();

    $('a').each((i, el) => {
      let rawTitle = $(el).text();
      let href = $(el).attr('href');

      if (!href || href.startsWith('javascript') || href === '#') return;

      // 解决 D2: 清洗标题 (去除虎扑尾部粘连阅读数等)
      const title = storage.cleanScrapedTitle ? storage.cleanScrapedTitle(rawTitle, source.id) : rawTitle.replace(/\s+/g, ' ').trim();
      if (title.length < 12 || title.length > 65) return;

      // 解决 D2: 严格过滤备案号、机构科室、调试探针、豆列合集等垃圾条目
      if (storage.isGarbageArticle && storage.isGarbageArticle(title, href, source.id)) return;
      if (storage.isValidArticleTitle && !storage.isValidArticleTitle(title)) return;

      if (seenTitles.has(title)) return;
      seenTitles.add(title);

      if (!href.startsWith('http')) {
        try {
          href = new URL(href, source.url).href;
        } catch (e) {
          return;
        }
      }

      const hashId = crypto.createHash('md5').update(href).digest('hex').substring(0, 16);
      const articleId = `${source.id}-${hashId}`;
      const existing = storage.articles.get(articleId);

      const timestamp = existing ? existing.timestamp : (Date.now() - items.length * 15 * 60 * 1000);
      const pubDate = existing ? existing.pubDate : new Date(timestamp).toISOString();

      items.push({
        title,
        link: href,
        summary: title,
        content: title,
        pubDate,
        author: source.name
      });

      if (items.length >= 10) return false;
    });

    return items.map(raw => this.formatItem(raw, source));
  }

  async fetchBilibili(source) {
    try {
      const res = await fetch('https://api.bilibili.com/x/web-interface/popular?ps=20&pn=1', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://www.bilibili.com/'
        },
        signal: AbortSignal.timeout(9000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || json.code !== 0 || !json.data || !Array.isArray(json.data.list)) {
        throw new Error('Invalid Bilibili response payload');
      }

      return json.data.list.slice(0, 16).map((v, idx) => {
        const viewCount = v.stat && v.stat.view ? Math.round(v.stat.view / 10000) : 0;
        const danmaku = v.stat && v.stat.danmaku ? v.stat.danmaku : 0;
        const upName = v.owner && v.owner.name ? v.owner.name : 'B站UP主';
        const bvid = v.bvid || '';
        const title = (v.title || '').replace(/<[^>]+>/g, '').trim();
        const desc = v.desc ? v.desc.replace(/<[^>]+>/g, '').trim() : '';
        const summary = `【B站热播 · ${viewCount > 0 ? viewCount + '万播放' : '热门精选'}】UP主: ${upName} | 弹幕: ${danmaku}。${desc || title}`;

        let pic = normalizeImageUrl(v.pic) || getRandomImage('entertainment', title);

        const articleId = `bilibili-${bvid || idx}`;
        const existing = storage.articles.get(articleId);

        let timestamp = v.pubdate ? v.pubdate * 1000 : (existing ? existing.timestamp : (Date.now() - idx * 60000));
        let pubDate = new Date(timestamp).toISOString();

        return {
          id: articleId,
          title: `【B站热门】${title}`,
          summary,
          content: `${summary}\n\n🎬 视频高清直达: https://www.bilibili.com/video/${bvid}\n🏷️ 分区标签: ${v.tname || '热门聚焦'}\n👤 UP主: ${upName}\n📊 实时热度: ${viewCount}万播放 / ${danmaku}条弹幕`,
          link: `https://www.bilibili.com/video/${bvid}`,
          sourceId: source.id,
          source: source.name,
          category: source.category,
          categoryLabel: source.categoryLabel,
          author: upName,
          pubDate,
          timestamp,
          image: pic,
          tags: ['B站热门', upName, v.tname || '热门视频', '哔哩哔哩'],
          isBreaking: false,
          isHot: true
        };
      });
    } catch (e) {
      console.warn(`[Aggregator] Bilibili fetch failed: ${e.message}`);
      return [];
    }
  }

  async fetchDouyin(source) {
    try {
      const res = await fetch('https://www.douyin.com/aweme/v1/web/hot/search/list/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://www.douyin.com/'
        },
        signal: AbortSignal.timeout(9000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const wordList = json && json.data && Array.isArray(json.data.word_list) ? json.data.word_list : [];
      if (wordList.length === 0) throw new Error('Empty Douyin word list');

      const douyinCovers = [
        'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80'
      ];

      return wordList.slice(0, 16).map((w, idx) => {
        const rank = idx + 1;
        const hotIndex = w.hot_value ? (w.hot_value / 10000).toFixed(1) + '万' : '热搜中';
        const label = w.label ? `[${w.label}] ` : '';
        const title = `【抖音热榜 Top ${rank}】${label}${w.word}`;
        const summary = `抖音实时热点聚焦榜第 ${rank} 位 ${label}，当前全网搜索热度指数突破 ${hotIndex}。点击直达抖音专题，探索精选短视频创作与话题讨论。`;
        const link = `https://www.douyin.com/search/${encodeURIComponent(w.word)}`;
        const hashId = crypto.createHash('md5').update(w.word).digest('hex').substring(0, 12);
        const articleId = `douyin-${hashId}`;
        const image = douyinCovers[idx % douyinCovers.length];

        const existing = storage.articles.get(articleId);
        const timestamp = existing ? existing.timestamp : (Date.now() - idx * 2 * 60 * 1000);
        const pubDate = existing ? existing.pubDate : new Date(timestamp).toISOString();

        return {
          id: articleId,
          title,
          summary,
          content: `${summary}\n\n🔍 话题关键词: ${w.word}\n🏆 抖音热榜名次: 第 ${rank} 位\n🔥 热度指数: ${hotIndex}\n📱 抖音专栏: ${link}`,
          link,
          sourceId: source.id,
          source: source.name,
          category: source.category,
          categoryLabel: source.categoryLabel,
          author: '抖音热点中心',
          pubDate,
          timestamp,
          image,
          tags: ['抖音热榜', w.word, `Top${rank}`, '实时热搜'],
          isBreaking: false,
          isHot: true
        };
      });
    } catch (e) {
      console.warn(`[Aggregator] Douyin fetch failed: ${e.message}`);
      return [];
    }
  }

  formatItem(raw, source) {
    // 解决 R5: 第一时间提供 title 兜底与 uniqueKey 空值保护，杜绝一条无标题毁掉整个 feed
    const title = (raw && raw.title ? String(raw.title) : '最新资讯').trim();
    const uniqueKey = (raw && (raw.link || raw.guid)) || title || (`${source.id}-${Date.now()}-${Math.random()}`);
    const hashId = crypto.createHash('md5').update(uniqueKey).digest('hex').substring(0, 16);
    const articleId = `${source.id}-${hashId}`;

    let image = null;
    if (raw && raw.enclosure && raw.enclosure.url) {
      image = normalizeImageUrl(raw.enclosure.url);
    } else if (raw && raw.mediaContent && raw.mediaContent.$ && raw.mediaContent.$.url) {
      image = normalizeImageUrl(raw.mediaContent.$.url);
    } else if (raw && raw.mediaThumbnail && raw.mediaThumbnail.$ && raw.mediaThumbnail.$.url) {
      image = normalizeImageUrl(raw.mediaThumbnail.$.url);
    } else if (raw) {
      image = extractFirstImage(raw['content:encoded'] || raw.content || raw.description);
    }

    if (!image) {
      image = getRandomImage(source.category, title);
    }

    const summary = stripHtml((raw && (raw.contentSnippet || raw.summary || raw.description || raw['content:encoded'])) || title);

    let pubDate = raw && (raw.isoDate || raw.pubDate);
    let timestamp = pubDate ? new Date(pubDate).getTime() : Date.now();
    if (isNaN(timestamp) || timestamp > Date.now() + 86400000) {
      timestamp = Date.now();
    }

    // 解决 R14: 调用预编译 deriveTags
    const tags = deriveTags(title, summary, source);
    // 解决 R8: 仅突发/重磅且发布于 3 小时内判定为 isBreaking，移除宽泛的“最新”
    const isBreaking = (Date.now() - timestamp < 3 * 3600000) && (/突发|重磅|Breaking\b/i.test(title));
    const isHot = title.includes('首发') || title.includes('发现') || title.includes('突破') || title.includes('特惠') || isBreaking;

    return {
      id: articleId,
      title,
      summary,
      content: (raw && (raw['content:encoded'] || raw.content)) || summary,
      link: (raw && raw.link) || source.url,
      sourceId: source.id,
      source: source.name,
      category: source.category,
      categoryLabel: source.categoryLabel,
      author: (raw && (raw.creator || raw.author)) || source.name,
      pubDate: new Date(timestamp).toISOString(),
      timestamp,
      image,
      tags,
      isBreaking,
      isHot
    };
  }

  async fetchSingleSource(source) {
    const startTime = Date.now();
    try {
      let items = [];
      if (source.type === 'scrape') {
        items = await this.fetchScrape(source);
      } else if (source.type === 'rss_clean') {
        items = await this.fetchCleanRSS(source);
      } else if (source.type === 'bilibili_api') {
        items = await this.fetchBilibili(source);
      } else if (source.type === 'douyin_api') {
        items = await this.fetchDouyin(source);
      } else {
        items = await this.fetchRSS(source);
      }

      const latency = Date.now() - startTime;
      // 解决 R6: items=0 标 empty
      storage.updateSourceStatus(source.id, {
        id: source.id,
        name: source.name,
        category: source.category,
        status: items.length > 0 ? 'online' : 'empty',
        latencyMs: latency,
        itemCount: items.length,
        error: null
      });

      return items;
    } catch (err) {
      const latency = Date.now() - startTime;
      console.warn(`[Aggregator] Notice on ${source.name} (${source.id}): ${err.message}`);

      const fallback = Array.from(storage.articles.values()).filter(a => a.sourceId === source.id);
      
      storage.updateSourceStatus(source.id, {
        id: source.id,
        name: source.name,
        category: source.category,
        status: fallback.length > 0 ? 'online' : 'error',
        latencyMs: latency,
        itemCount: fallback.length,
        error: err.message
      });

      return fallback;
    }
  }

  async runAggregation() {
    if (this.isFetching) {
      console.log('[Aggregator] Crawl in progress, skipping...');
      return { addedCount: 0, total: storage.articles.size };
    }

    this.isFetching = true;
    console.log(`[Aggregator] Starting crawl across ${SOURCES.length} user-specified channels (including Astronomy)...`);

    try {
      const results = await Promise.allSettled(
        SOURCES.map(source => this.fetchSingleSource(source))
      );

      const allFetched = [];
      results.forEach(res => {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          allFetched.push(...res.value);
        }
      });

      const newlyAdded = storage.addArticles(allFetched);
      console.log(`[Aggregator] Crawl complete. Fetched: ${allFetched.length}, Newly added: ${newlyAdded.length}, Total in store: ${storage.articles.size}`);

      if (newlyAdded.length > 0) {
        sseManager.broadcast('new_articles', {
          count: newlyAdded.length,
          items: newlyAdded.slice(0, 10),
          timestamp: Date.now()
        });

        sseManager.broadcast('ticker_update', storage.getTicker());
        sseManager.broadcast('stats_update', storage.getStats(sseManager.getClientCount()));
      }

      return {
        addedCount: newlyAdded.length,
        total: storage.articles.size,
        fetched: allFetched.length
      };
    } finally {
      this.isFetching = false;
    }
  }
}

module.exports = new HybridAggregator();
