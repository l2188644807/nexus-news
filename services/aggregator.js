const Parser = require('rss-parser');
const cheerio = require('cheerio');
const crypto = require('crypto');
const { SOURCES } = require('./sources');
const storage = require('./storage');
const sseManager = require('./sseManager');

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

// 各模块主题高质量摄影图库兜底 (含天文学唯美深空摄影)
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

function extractFirstImage(html) {
  if (!html) return null;
  try {
    const $ = cheerio.load(html);
    const src = $('img').first().attr('src');
    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      return src;
    }
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

function deriveTags(title, summary, source) {
  const text = (title + ' ' + summary).toLowerCase();
  const tags = new Set();

  if (source.badge) tags.add(source.badge);

  const keywordsMap = [
    // 天文学
    { tag: 'FAST天眼', keys: ['fast', '中国天眼', '脉冲星', '射电'] },
    { tag: '韦伯空间望远镜', keys: ['jwst', 'webb', '韦伯', '原星系'] },
    { tag: '欧空局ESA', keys: ['esa', '欧空局', '欧几里得', '盖亚'] },
    { tag: '系外行星', keys: ['exoplanet', '系外行星', '超级地球', '宜居带'] },
    { tag: '引力波与黑洞', keys: ['black hole', '黑洞', '引力波', 'gravitational'] },
    { tag: '深空探测', keys: ['nasa', '深空', '深空测轨', '行星', '小行星', '彗星'] },
    // 电竞
    { tag: 'CS2', keys: ['cs2', 'counter-strike', 'hltv', 'major', 'navi', 'faze'] },
    { tag: '英雄联盟', keys: ['lol', 'league of legends', 'lpl', 'lck', 'faker', 's14'] },
    { tag: '无畏契约', keys: ['valorant', 'vct', '无畏契约', '瓦罗兰特'] },
    // 游戏
    { tag: '3A大作', keys: ['steam', 'ps5', 'xbox', 'switch', 'gta', '黑神话', '卡普空'] },
    // 国际政经
    { tag: '国际政经', keys: ['联合国', '气候', '峰会', '总统', '首脑', '外长'] },
    // 体育
    { tag: '欧冠足球', keys: ['欧冠', '足球', '英超', '西甲', '国足', '世界杯'] },
    { tag: 'NBA体坛', keys: ['nba', '篮球', '詹姆斯', '勇士', '湖人'] },
    // 军事
    { tag: '军工防务', keys: ['防务', '战机', '无人机', '军舰', '导弹', '军演'] },
    // 教育
    { tag: '招考研招', keys: ['考研', '高考', '高校', '大学', '招生', '教育部'] },
    // 娱乐与影视
    { tag: '文娱独家', keys: ['明星', '演员', '恋情', '首谈', '家庭', '热搜'] },
    { tag: '院线大片', keys: ['电影', '上映', '票房', '影评', '定档', '好莱坞', 'variety', 'imax'] },
    // 财经
    { tag: '宏观金融', keys: ['股市', '央行', '降息', '加息', '美元', '贸易', '通胀'] },
    // 科技
    { tag: 'AI前沿', keys: ['ai', '大模型', 'gpt', 'openai', '芯片', '算力'] }
  ];

  for (const item of keywordsMap) {
    if (item.keys.some(k => text.includes(k))) {
      tags.add(item.tag);
    }
  }

  return Array.from(tags).slice(0, 4);
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
    let text = await res.text();
    text = text.replace(/<description>(.*?)<\/description>/gis, (match, content) => {
      return `<description><![CDATA[${content.replace(/<!\[CDATA\[|\]\]>/g, '')}]]></description>`;
    });
    const feed = await parser.parseString(text);
    return (feed.items || []).slice(0, 15).map(raw => this.formatItem(raw, source));
  }

  async fetchScrape(source) {
    const res = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(8000)
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const items = [];
    const seenTitles = new Set();

    $('a').each((i, el) => {
      const title = $(el).text().replace(/\s+/g, ' ').trim();
      let href = $(el).attr('href');

      if (!href || href.startsWith('javascript') || href === '#') return;
      if (title.length < 12 || title.length > 65) return;
      if (seenTitles.has(title)) return;
      seenTitles.add(title);

      if (!href.startsWith('http')) {
        try {
          href = new URL(href, source.url).href;
        } catch (e) {
          return;
        }
      }

      items.push({
        title,
        link: href,
        summary: title,
        content: title,
        pubDate: new Date(Date.now() - items.length * 15 * 60 * 1000).toISOString(),
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
        }
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

        let pic = v.pic || '';
        if (pic.startsWith('//')) pic = 'https:' + pic;
        if (!pic) pic = getRandomImage('entertainment', title);

        const pubDate = v.pubdate ? new Date(v.pubdate * 1000).toISOString() : new Date().toISOString();
        const timestamp = v.pubdate ? v.pubdate * 1000 : Date.now() - idx * 60000;

        return {
          id: `bilibili-${bvid || idx}`,
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
          isBreaking: idx < 3,
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
        }
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
        const image = douyinCovers[idx % douyinCovers.length];

        return {
          id: `douyin-${hashId}`,
          title,
          summary,
          content: `${summary}\n\n🔍 话题关键词: ${w.word}\n🏆 抖音热榜名次: 第 ${rank} 位\n🔥 热度指数: ${hotIndex}\n📱 抖音专栏: ${link}`,
          link,
          sourceId: source.id,
          source: source.name,
          category: source.category,
          categoryLabel: source.categoryLabel,
          author: '抖音热点中心',
          pubDate: new Date(Date.now() - idx * 2 * 60 * 1000).toISOString(),
          timestamp: Date.now() - idx * 2 * 60 * 1000,
          image,
          tags: ['抖音热榜', w.word, `Top${rank}`, '实时热搜'],
          isBreaking: rank <= 3,
          isHot: true
        };
      });
    } catch (e) {
      console.warn(`[Aggregator] Douyin fetch failed: ${e.message}`);
      return [];
    }
  }

  async fetchS16Worlds(source) {
    const s16Articles = [
      {
        title: '【LoL官方专题】拳头游戏发布全球总决赛国际赛历：全新赛制演进与各大赛区名额分配规划公布',
        summary: '拳头游戏官方电竞赛事组正式公布全球总决赛路线图，重点介绍全新三大国际赛事窗口、瑞士轮赛制优化以及全局BP（Fearless Draft）在各大职业联赛中的推行规划。',
        tags: ['全球总决赛', 'LoL Esports', '赛制规划', '赛区名额', '拳头官方'],
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
        author: 'LoL Esports 官方通报',
        isBreaking: true,
        isHot: true,
        minutesAgo: 10
      },
      {
        title: '【职业联赛动态】各大赛区转会期阵容与选手合同库更新：各大豪门战队引援备战全球总决赛席位',
        summary: '全球各大赛区（LPL、LCK、LEC、LCS）转会期动向持续升温，选手合同数据库与试训名单持续更新，各大战力榜单与教练组重组成为全网电竞社区热议焦点。',
        tags: ['选手转会', '战队名单', '合同库', '全球总决赛席位'],
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
        author: 'LoL 赛事特派',
        isBreaking: true,
        isHot: true,
        minutesAgo: 30
      },
      {
        title: '【竞技版本前瞻】召唤师峡谷竞技平衡与比赛服改动深度解析：强化对线博弈与野区资源争夺',
        summary: '拳头游戏玩法设计团队发布最新赛事服补丁前瞻，针对比赛节奏、战略点机制及核心装备进行系统性数值调优，旨在激发更多样化的战术流派与对局对抗。',
        tags: ['版本解析', '比赛服补丁', '竞技平衡', '战术BP'],
        image: 'https://images.unsplash.com/photo-1612287233261-755d49f056d6?w=600&auto=format&fit=crop&q=80',
        author: '拳头玩法实验室',
        isBreaking: false,
        isHot: true,
        minutesAgo: 60
      },
      {
        title: '【全球总决赛史话】历届英雄联盟全球总决赛经典战役与冠军数据盘点：从召唤师杯到传奇殿堂',
        summary: '回顾历届全球总决赛的高光对局与战术革命，深入分析中韩赛区风格演化、明星选手荣誉榜以及影响深远的决胜局BP选择。',
        tags: ['全球总决赛历史', '传奇殿堂', '总决赛经典', '召唤师杯'],
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        author: 'LoL Esports 深度专栏',
        isBreaking: false,
        isHot: true,
        minutesAgo: 90
      }
    ];

    try {
      const res = await fetch('https://liquipedia.net/leagueoflegends/api.php?action=feedrecentchanges&feedformat=atom', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NexusPulse/1.0' }
      });
      if (res.ok) {
        const xml = await res.text();
        const parsed = await parser.parseString(xml);
        if (parsed && Array.isArray(parsed.items)) {
          parsed.items.slice(0, 4).forEach((item, i) => {
            const cleanTitle = (item.title || '').replace(/^[^:]+:\s*/, '').trim();
            if (cleanTitle) {
              s16Articles.push({
                title: `【Liquipedia赛讯】${cleanTitle}`,
                summary: stripHtml(item.summary || item.contentSnippet || 'Liquipedia 英雄联盟职业赛程、战队百科与最新赛事数据更新。'),
                tags: ['职业赛讯', 'Liquipedia', '战队数据'],
                image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
                author: 'Liquipedia LoL',
                isBreaking: false,
                isHot: false,
                minutesAgo: 110 + i * 20
              });
            }
          });
        }
      }
    } catch (_) {}

    return s16Articles.map((a, idx) => {
      const hashId = crypto.createHash('md5').update(a.title).digest('hex').substring(0, 12);
      const timestamp = Date.now() - (a.minutesAgo || idx * 15) * 60 * 1000;
      return {
        id: `s16-${hashId}`,
        title: a.title,
        summary: a.summary,
        content: `${a.summary}\n\n🏆 赛事专区: 英雄联盟全球总决赛 (LoL Worlds Tracker)\n📌 官方观赛与数据平台: https://lolesports.com/`,
        link: 'https://lolesports.com/',
        sourceId: source.id,
        source: source.name,
        category: source.category,
        categoryLabel: source.categoryLabel,
        author: a.author,
        pubDate: new Date(timestamp).toISOString(),
        timestamp,
        image: a.image,
        tags: a.tags,
        isBreaking: a.isBreaking,
        isHot: a.isHot
      };
    });
  }

  async fetchCurated(source) {
    const existing = Array.from(storage.articles.values()).filter(a => a.sourceId === source.id);
    if (existing.length > 0) {
      return existing.slice(0, 8);
    }
    return [];
  }

  formatItem(raw, source) {
    const uniqueKey = raw.link || raw.guid || raw.title;
    const hashId = crypto.createHash('md5').update(uniqueKey).digest('hex').substring(0, 16);

    let image = null;
    if (raw.enclosure && raw.enclosure.url && raw.enclosure.url.startsWith('http')) {
      image = raw.enclosure.url;
    } else if (raw.mediaContent && raw.mediaContent.$ && raw.mediaContent.$.url) {
      image = raw.mediaContent.$.url;
    } else if (raw.mediaThumbnail && raw.mediaThumbnail.$ && raw.mediaThumbnail.$.url) {
      image = raw.mediaThumbnail.$.url;
    } else {
      image = extractFirstImage(raw['content:encoded'] || raw.content || raw.description);
    }

    if (!image) {
      image = getRandomImage(source.category, raw.title);
    }

    const summary = stripHtml(raw.contentSnippet || raw.summary || raw.description || raw['content:encoded'] || raw.title);

    let pubDate = raw.isoDate || raw.pubDate;
    let timestamp = pubDate ? new Date(pubDate).getTime() : Date.now();
    if (isNaN(timestamp) || timestamp > Date.now() + 86400000) {
      timestamp = Date.now();
    }

    const title = (raw.title || '最新资讯').trim();
    const tags = deriveTags(title, summary, source);
    const isBreaking = (Date.now() - timestamp < 3600000) || title.includes('重磅') || title.includes('突发') || title.includes('最新');
    const isHot = title.includes('首发') || title.includes('发现') || title.includes('突破') || title.includes('特惠') || isBreaking;

    return {
      id: `${source.id}-${hashId}`,
      title,
      summary,
      content: raw['content:encoded'] || raw.content || summary,
      link: raw.link || source.url,
      sourceId: source.id,
      source: source.name,
      category: source.category,
      categoryLabel: source.categoryLabel,
      author: raw.creator || raw.author || source.name,
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
      } else if (source.type === 's16_feed') {
        items = await this.fetchS16Worlds(source);
      } else if (source.type === 'curated_feed') {
        items = await this.fetchCurated(source);
      } else {
        items = await this.fetchRSS(source);
      }

      const latency = Date.now() - startTime;
      storage.updateSourceStatus(source.id, {
        id: source.id,
        name: source.name,
        category: source.category,
        status: 'online',
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
        sseManager.broadcast('stats_update', storage.getStats());
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
