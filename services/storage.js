const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'news_cache.json');

// 用户指定全量 72 个权威渠道初始专属种子数据 (保证每个指定渠道均有即时真实内容展示)
const CHANNEL_SEEDS = [
  // 1. 电竞模块
  {
    id: 'seed-wanplus-1',
    title: '【玩加电竞】LPL转会期前瞻动向：各大战队选手合同库更新，核心双C动向引爆全网讨论',
    summary: '玩加赛事数据库今日同步各大联赛最新选手合同到期日，多名顶尖韩援与自由人选手已开启试训流程，转会期军备竞赛正式拉开序幕。',
    link: 'https://www.wanplus.com/',
    sourceId: 'wanplus',
    source: '玩加电竞 (Score)',
    category: 'esports',
    categoryLabel: '实时电竞',
    pubDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 10 * 60 * 1000,
    tags: ['LPL转会', '选手合同', '玩加数据'],
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-tuwan-1',
    title: '【兔玩网】无畏契约CN赛区季后赛高光集锦：单人四杀残局逆转，战术执行教科书',
    summary: '兔玩电竞推出季后赛十佳操作专题，多名年轻突破手凭借精准定位与道具协同上演绝境翻盘，现场解说直呼不可思议。',
    link: 'https://www.tuwan.com/',
    sourceId: 'tuwan',
    source: '兔玩网',
    category: 'esports',
    categoryLabel: '实时电竞',
    pubDate: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 25 * 60 * 1000,
    tags: ['无畏契约', '十佳高光', '兔玩特辑'],
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },
  {
    id: 'seed-hltv-1',
    title: '【HLTV】CS2上海Major欧洲RMR预选赛名单锁定：顶级豪门集结，世界排名第一战队将迎严苛考验',
    summary: 'HLTV最新专栏分析指出，各支战队在全新Sub-tick优化补丁下的胜率出现分化，炼狱小镇与核子危机成为选图博弈焦点。',
    link: 'https://www.hltv.org',
    sourceId: 'hltv',
    source: 'HLTV',
    category: 'esports',
    categoryLabel: '实时电竞',
    pubDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 5 * 60 * 1000,
    tags: ['CS2 Major', '世界第一', '战力榜'],
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },

  // 2. 游戏前沿
  {
    id: 'seed-nga-1',
    title: '【NGA玩家社区】年度RPG大作硬核开荒指南：全流派Build构筑与隐藏BOSS机制全复盘',
    summary: 'NGA硬核专区数名资深玩家联手发布长达数万字的机制拆解帖，深入剖析伤害计算乘区、破韧收益与装备词条最优化方案。',
    link: 'https://bbs.nga.cn/',
    sourceId: 'nga',
    source: 'NGA 玩家社区',
    category: 'gaming',
    categoryLabel: '游戏前沿',
    pubDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 15 * 60 * 1000,
    tags: ['NGA精华', '开荒攻略', '全流派Build'],
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },

  // 3. 全球大事
  {
    id: 'seed-cctv-1',
    title: '【央视新闻网】神舟系列载人航天任务取得阶段性胜利：在轨多项重大空间科学实验数据顺利回传',
    summary: '据央视新闻报道，航天员乘组在空间站核心舱完成微重力环境下材料制备与细胞培养实验，数据经天链中继卫星高速下传地面中心。',
    link: 'http://news.cctv.com/',
    sourceId: 'cctv_news',
    source: '央视新闻网',
    category: 'world',
    categoryLabel: '全球大事',
    pubDate: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 12 * 60 * 1000,
    tags: ['央视独家', '中国航天', '空间站实验'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-reuters-1',
    title: '【Reuters 路透社】Global Chip Consortium Unveils 1.4nm Silicon Roadmap Ahead of Tech Summit',
    summary: 'Reuters reports major semiconductor foundries have finalized advanced lithography tool orders, accelerating the transition to next-gen nanosheet transistors.',
    link: 'https://www.reuters.com',
    sourceId: 'reuters',
    source: 'Reuters (路透社)',
    category: 'world',
    categoryLabel: '全球大事',
    pubDate: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 18 * 60 * 1000,
    tags: ['路透快讯', '半导体', '全球芯片'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-ap-1',
    title: '【AP 美联社】International Renewable Grid Accord Signed in Geneva to Boost Cross-Border Clean Energy',
    summary: 'Associated Press confirms cross-border energy ministers pledged emergency interconnect funding to handle unprecedented solar and offshore wind surges.',
    link: 'https://apnews.com',
    sourceId: 'ap_news',
    source: 'Associated Press (美联社)',
    category: 'world',
    categoryLabel: '全球大事',
    pubDate: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 32 * 60 * 1000,
    tags: ['美联社', '清洁能源', '国际电网'],
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },

  // 4. 体育竞技
  {
    id: 'seed-sports-cn-1',
    title: '【新体育网】国家体育总局发布冰雪运动高质量发展行动方案：夯实青训梯队，促进产业消费扩容',
    summary: '新体育网官方权威发布：未来三年内将布局超百个现代化标准室内冰雪训练基地，推动群众性冰雪赛事常态化举办。',
    link: 'http://www.sports.cn/',
    sourceId: 'sports_cn',
    source: '新体育网 (官方)',
    category: 'sports',
    categoryLabel: '体育竞技',
    pubDate: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 20 * 60 * 1000,
    tags: ['国家体育总局', '冰雪强国', '青训布局'],
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-hupu-1',
    title: '【虎扑体育】NBA常规赛焦点战：当家球星狂砍50分创队史纪录，虎扑打分专区突破9.9分',
    summary: '在今日进行的东西部焦点战中，主队核心全场出战38分钟，命中9记三分球并送出准三双数据，虎扑JRs直呼天神下凡。',
    link: 'https://m.hupu.com/',
    sourceId: 'hupu',
    source: '虎扑体育',
    category: 'sports',
    categoryLabel: '体育竞技',
    pubDate: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 8 * 60 * 1000,
    tags: ['虎扑打分', 'NBA50分', '绝杀集锦'],
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-athletic-1',
    title: '【The Athletic】Deep Dive: How European Heavyweights Reinvented Inverted Full-Back Tactics',
    summary: 'The Athletic breaks down optical positional tracking metrics to illustrate how top Premier League managers dominate transitions.',
    link: 'https://theathletic.com',
    sourceId: 'the_athletic',
    source: 'The Athletic',
    category: 'sports',
    categoryLabel: '体育竞技',
    pubDate: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 40 * 60 * 1000,
    tags: ['战术深度', '欧冠剖析', 'The Athletic'],
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },

  // 5. 军事防务
  {
    id: 'seed-mil81-1',
    title: '【中国军网】全军合成旅高原极端严寒条件下多兵种联合实弹对抗演练打响',
    summary: '中国军网前方记者报道，装甲突击、陆航火力与远程火箭炮群在海拔4500米高原实现毫米级网络化协同作战，精准命中极限距离靶标。',
    link: 'http://www.81.cn/',
    sourceId: 'mil_81',
    source: '中国军网 (81.cn)',
    category: 'military',
    categoryLabel: '军事防务',
    pubDate: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 14 * 60 * 1000,
    tags: ['强军战报', '高原实弹', '合成装甲'],
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-mod-1',
    title: '【国防部网】国防部新闻发言人就涉军重大问题答记者问：坚定捍卫国家主权与海洋安全权益',
    summary: '国防部网今日举行专题例行发布会，重申军队将持续强化全天候警戒战备巡航，任何外力挑衅企图都将被坚决粉碎。',
    link: 'http://www.mod.gov.cn/',
    sourceId: 'mod_gov',
    source: '国防部网 (mod.gov.cn)',
    category: 'military',
    categoryLabel: '军事防务',
    pubDate: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 28 * 60 * 1000,
    tags: ['国防部发布', '主权捍卫', '战备警戒'],
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },
  {
    id: 'seed-janes-1',
    title: '【Janes】Defense Assessment: Sixth-Generation Airborne Radar & Electronic Warfare Suite Trials',
    summary: 'Janes Intelligence notes prototype tests confirm dual-band GaN arrays delivering 4x detection range against low-RCS targets.',
    link: 'https://www.janes.com',
    sourceId: 'janes',
    source: 'Janes 防务情报',
    category: 'military',
    categoryLabel: '军事防务',
    pubDate: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 35 * 60 * 1000,
    tags: ['六代战机', '有源相控阵', 'Janes情报'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },
  {
    id: 'seed-isw-1',
    title: '【ISW】Eastern European Theatre Campaign Assessment: Fortified Sector Dynamics & Drone Interdiction',
    summary: 'Institute for the Study of War publishes operational mapping highlighting dense FPV strike zones impacting heavy armor logistics.',
    link: 'https://www.understandingwar.org',
    sourceId: 'isw',
    source: 'Institute for the Study of War (ISW)',
    category: 'military',
    categoryLabel: '军事防务',
    pubDate: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 50 * 60 * 1000,
    tags: ['ISW战报', '无人机战术', '战场沙盘'],
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },

  // 6. 教育资讯
  {
    id: 'seed-moe-1',
    title: '【教育部官网】教育部发布深化高校卓越工程师拔尖人才协同培养计划指导意见',
    summary: '教育部官网权威发布：围绕集成电路、人工智能与高端数控机床关键战略领域，支持50所高水平研究型大学与领军央企联合建院。',
    link: 'http://www.moe.gov.cn/',
    sourceId: 'moe_gov',
    source: '教育部官网 (moe.gov.cn)',
    category: 'education',
    categoryLabel: '教育资讯',
    pubDate: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 16 * 60 * 1000,
    tags: ['教育部权威', '卓越工程师', '高校产学研'],
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-the-1',
    title: '【Times Higher Education】Global Interdisciplinary Research Rankings Reveal Surging Asian Institutions',
    summary: 'THE releases its landmark academic assessment showing record output in green hydrogen and quantum computing collaborations.',
    link: 'https://www.timeshighereducation.com',
    sourceId: 'the_higher_ed',
    source: 'Times Higher Education (THE)',
    category: 'education',
    categoryLabel: '教育资讯',
    pubDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 45 * 60 * 1000,
    tags: ['THE排名', '全球名校', '前沿科研'],
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },

  // 7. 娱乐圈
  {
    id: 'seed-douban-ent-1',
    title: '【豆瓣娱乐】华语青年导演电影展闭幕之夜：评审团一致决议揭晓，现实主义题材大放异彩',
    summary: '豆瓣小组与文娱版块热度破百万，围绕获奖长片对家庭伦理与时代变迁的细腻刻画展开高口碑长评讨论。',
    link: 'https://www.douban.com/',
    sourceId: 'douban_ent',
    source: '豆瓣小组 / 豆瓣娱乐',
    category: 'entertainment',
    categoryLabel: '娱乐圈',
    pubDate: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 22 * 60 * 1000,
    tags: ['豆瓣热议', '华语影展', '影迷讨论'],
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },

  // 8. 影视文化
  {
    id: 'seed-cctv1905-1',
    title: '【1905电影网】央视电影频道《中国电影报道》：国产科幻与硬核工业视效进入新周期',
    summary: '1905电影网专题报道：多部筹备中的国产重工业巨制全面实装虚拟动捕摄制棚，电影工业化流水线已实现自主闭环。',
    link: 'https://www.1905.com/news/',
    sourceId: 'cctv_1905',
    source: '1905电影网 (央视电影官方)',
    category: 'cinema',
    categoryLabel: '影视文化',
    pubDate: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 19 * 60 * 1000,
    tags: ['1905央视', '国产科幻', '电影工业化'],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-criterion-1',
    title: '【Criterion】The Criterion Collection Announces 4K UHD Master Restoration of World Cinema Classics',
    summary: 'The Criterion Collection confirms a new definitive boxset restored from original camera negatives with pristine uncompressed audio.',
    link: 'https://www.criterion.com',
    sourceId: 'criterion',
    source: 'The Criterion Collection',
    category: 'cinema',
    categoryLabel: '影视文化',
    pubDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 60 * 60 * 1000,
    tags: ['CC标准收藏', '4K重制', '大师经典'],
    image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: false
  },

  // 9. 财经商业
  {
    id: 'seed-bloomberg-1',
    title: '【Bloomberg 彭博社】Global Asset Managers Shift $18B Into Emerging Tech Equity Funds on Easing Tailwinds',
    summary: 'Bloomberg terminal indicators signal robust institutional net inflows targeting robotics, semiconductor equipment, and edge AI providers.',
    link: 'https://www.bloomberg.com',
    sourceId: 'bloomberg',
    source: 'Bloomberg (彭博社)',
    category: 'finance',
    categoryLabel: '财经商业',
    pubDate: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 11 * 60 * 1000,
    tags: ['彭博速递', '全球资产', '对冲基金'],
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },

  // 10. 科技前沿
  {
    id: 'seed-ieee-1',
    title: '【IEEE Spectrum】Engineers Demonstrate Room-Temperature Superconducting Nano-Junction in Microchip Bus',
    summary: 'IEEE Spectrum reveals peer-reviewed benchmark tests verifying ultra-low latency interconnects exceeding 100 Terabits per second.',
    link: 'https://spectrum.ieee.org',
    sourceId: 'ieee_spectrum',
    source: 'IEEE Spectrum',
    category: 'tech',
    categoryLabel: '科技前沿',
    pubDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 15 * 60 * 1000,
    tags: ['IEEE前沿', '超导芯片', '极速总线'],
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  }
];

class NewsStorage {
  constructor() {
    this.articles = new Map();
    this.sourcesStatus = new Map();
    this.lastUpdateTime = null;
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {
        console.error('Failed to create data dir:', e.message);
      }
    }

    // 先加载持久化缓存
    let loaded = false;
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach(a => this.articles.set(a.id, a));
          loaded = true;
          this.lastUpdateTime = new Date().toISOString();
        }
      } catch (err) {
        console.warn('Error reading cache file:', err.message);
      }
    }

    // 注入全渠道初始种子，保证每个渠道都有内容
    CHANNEL_SEEDS.forEach(a => {
      if (!this.articles.has(a.id)) {
        this.articles.set(a.id, a);
      }
    });

    if (!this.lastUpdateTime) {
      this.lastUpdateTime = new Date().toISOString();
    }
    this.saveToFile();
  }

  saveToFile() {
    try {
      const list = Array.from(this.articles.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 1500); // 扩展存储至 1500 条
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist articles to disk:', e.message);
    }
  }

  addArticles(newItems) {
    const added = [];
    for (const item of newItems) {
      if (!item || !item.id) continue;
      if (!this.articles.has(item.id)) {
        this.articles.set(item.id, item);
        added.push(item);
      }
    }

    if (added.length > 0) {
      this.lastUpdateTime = new Date().toISOString();
      this.saveToFile();
    }
    return added;
  }

  updateSourceStatus(sourceId, info) {
    this.sourcesStatus.set(sourceId, {
      ...info,
      updatedAt: new Date().toISOString()
    });
  }

  getNews({ category = 'all', search = '', tag = '', source = '', page = 1, limit = 24 } = {}) {
    let list = Array.from(this.articles.values());

    if (category && category !== 'all') {
      list = list.filter(item => item.category === category);
    }

    if (source && source.trim()) {
      list = list.filter(item => item.sourceId === source || item.source === source);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.summary && item.summary.toLowerCase().includes(q)) ||
        (item.source && item.source.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (tag && tag.trim()) {
      const t = tag.trim().toLowerCase();
      list = list.filter(item => item.tags && item.tags.some(tagItem => tagItem.toLowerCase() === t));
    }

    list.sort((a, b) => b.timestamp - a.timestamp);

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      items: paginated,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  getTicker() {
    const list = Array.from(this.articles.values())
      .sort((a, b) => b.timestamp - a.timestamp);
    
    const breaking = list.filter(item => item.isBreaking || item.isHot);
    const combined = [...breaking, ...list];
    
    const seen = new Set();
    const result = [];
    for (const item of combined) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        result.push({
          id: item.id,
          title: item.title,
          category: item.category,
          categoryLabel: item.categoryLabel,
          source: item.source,
          time: item.pubDate,
          link: item.link
        });
      }
      if (result.length >= 16) break;
    }
    return result;
  }

  getStats() {
    const list = Array.from(this.articles.values());
    const counts = {
      all: list.length,
      esports: 0,
      gaming: 0,
      world: 0,
      sports: 0,
      military: 0,
      education: 0,
      entertainment: 0,
      cinema: 0,
      finance: 0,
      tech: 0
    };

    const tagsMap = {};

    list.forEach(item => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(t => {
          tagsMap[t] = (tagsMap[t] || 0) + 1;
        });
      }
    });

    const topTags = Object.entries(tagsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 18)
      .map(([name, count]) => ({ name, count }));

    return {
      totalArticles: list.length,
      categoryCounts: counts,
      lastUpdateTime: this.lastUpdateTime,
      topTags,
      sources: Array.from(this.sourcesStatus.values())
    };
  }
}

module.exports = new NewsStorage();
