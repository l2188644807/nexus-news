/**
 * 智讯枢纽 (NEXUS PULSE) 专属定制多源矩阵
 * 覆盖 11 大核心垂直板块 (含全新天文学模块)
 */

const SOURCES = [
  // ================= 1. 电竞模块 =================
  {
    id: 's16_worlds',
    name: '英雄联盟赛事 (LoL Esports)',
    category: 'esports',
    categoryLabel: '实时电竞',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%E8%8B%B1%E9%9B%84%E8%81%94%E7%9B%9F%E5%85%A8%E7%90%83%E6%80%BB%E5%86%B3%E8%B5%9B&hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
    icon: 'crown',
    badge: '全球总决赛/职业赛',
    lang: 'zh'
  },
  {
    id: 'wanplus',
    name: '玩加电竞 (Score)',
    category: 'esports',
    categoryLabel: '实时电竞',
    type: 'scrape',
    url: 'https://www.wanplus.com/',
    icon: 'trophy',
    badge: '赛况/数据',
    lang: 'zh'
  },
  {
    id: 'tuwan',
    name: '兔玩网',
    category: 'esports',
    categoryLabel: '实时电竞',
    type: 'scrape',
    url: 'https://www.tuwan.com/',
    icon: 'crosshair',
    badge: '战队/集锦',
    lang: 'zh'
  },
  {
    id: 'dotesports',
    name: 'Dot Esports',
    category: 'esports',
    categoryLabel: '实时电竞',
    type: 'rss_clean',
    url: 'https://dotesports.com/feed',
    icon: 'flame',
    badge: 'LoL/瓦罗兰特',
    lang: 'en'
  },
  {
    id: 'hltv',
    name: 'HLTV',
    category: 'esports',
    categoryLabel: '实时电竞',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:hltv.org&hl=en-US&gl=US&ceid=US:en',
    icon: 'target',
    badge: 'CS2全球权威',
    lang: 'en'
  },
  {
    id: 'esportsinsider',
    name: 'Esports Insider',
    category: 'esports',
    categoryLabel: '实时电竞',
    type: 'rss',
    url: 'https://esportsinsider.com/feed',
    icon: 'award',
    badge: '职业联盟/转会',
    lang: 'en'
  },
  {
    id: 'liquipedia',
    name: 'Liquipedia',
    category: 'esports',
    categoryLabel: '实时电竞',
    type: 'rss',
    url: 'https://liquipedia.net/commons/api.php?action=feedrecentchanges&feedformat=atom',
    icon: 'layers',
    badge: '百科/赛程对阵',
    lang: 'en'
  },

  // ================= 2. 游戏前沿 =================
  {
    id: 'gcores',
    name: '机核 Gcores',
    category: 'gaming',
    categoryLabel: '游戏前沿',
    type: 'rss',
    url: 'https://www.gcores.com/rss',
    icon: 'sparkles',
    badge: '主机文化/深度',
    lang: 'zh'
  },
  {
    id: 'nga',
    name: 'NGA 玩家社区',
    category: 'gaming',
    categoryLabel: '游戏前沿',
    type: 'scrape',
    url: 'https://bbs.nga.cn/',
    icon: 'message-square',
    badge: '硬核玩家/攻略',
    lang: 'zh'
  },
  {
    id: 'gamersky_3dm',
    name: '游民星空 / 3DM',
    category: 'gaming',
    categoryLabel: '游戏前沿',
    type: 'scrape',
    url: 'https://www.gamersky.com/news/',
    icon: 'gamepad-2',
    badge: '新游特惠/实机',
    lang: 'zh'
  },
  {
    id: 'ign',
    name: 'IGN',
    category: 'gaming',
    categoryLabel: '游戏前沿',
    type: 'rss',
    url: 'https://feeds.feedburner.com/ign/all',
    icon: 'flame',
    badge: '全球第一评测',
    lang: 'en'
  },
  {
    id: 'eurogamer',
    name: 'Eurogamer',
    category: 'gaming',
    categoryLabel: '游戏前沿',
    type: 'rss',
    url: 'https://www.eurogamer.net/feed',
    icon: 'compass',
    badge: '欧洲权威评测',
    lang: 'en'
  },
  {
    id: 'gamesindustry',
    name: 'GamesIndustry.biz',
    category: 'gaming',
    categoryLabel: '游戏前沿',
    type: 'rss',
    url: 'https://www.gamesindustry.biz/feed',
    icon: 'trending-up',
    badge: '全球游戏产业',
    lang: 'en'
  },
  {
    id: 'gamedeveloper',
    name: 'Game Developer',
    category: 'gaming',
    categoryLabel: '游戏前沿',
    type: 'rss',
    url: 'https://www.gamedeveloper.com/rss.xml',
    icon: 'code-2',
    badge: '引擎/开发设计',
    lang: 'en'
  },

  // ================= 3. 全球大事 =================
  {
    id: 'xinhua',
    name: '新华网',
    category: 'world',
    categoryLabel: '全球大事',
    type: 'rss',
    url: 'http://www.xinhuanet.com/world/news_world.xml',
    icon: 'globe',
    badge: '国家通讯社',
    lang: 'zh'
  },
  {
    id: 'people',
    name: '人民网',
    category: 'world',
    categoryLabel: '全球大事',
    type: 'rss',
    url: 'http://www.people.com.cn/rss/world.xml',
    icon: 'newspaper',
    badge: '权威要闻',
    lang: 'zh'
  },
  {
    id: 'cctv_news',
    name: '央视新闻网',
    category: 'world',
    categoryLabel: '全球大事',
    type: 'scrape',
    url: 'http://news.cctv.com/',
    icon: 'tv',
    badge: '总台时政独家',
    lang: 'zh'
  },
  {
    id: 'reuters',
    name: 'Reuters (路透社)',
    category: 'world',
    categoryLabel: '全球大事',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:reuters.com&hl=en-US&gl=US&ceid=US:en',
    icon: 'zap',
    badge: '国际快讯头条',
    lang: 'en'
  },
  {
    id: 'ap_news',
    name: 'Associated Press (美联社)',
    category: 'world',
    categoryLabel: '全球大事',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en',
    icon: 'radio',
    badge: '全球独立快讯',
    lang: 'en'
  },
  {
    id: 'bbc_news',
    name: 'BBC News',
    category: 'world',
    categoryLabel: '全球大事',
    type: 'rss',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    icon: 'globe-2',
    badge: '国际权威视点',
    lang: 'en'
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera English',
    category: 'world',
    categoryLabel: '全球大事',
    type: 'rss',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    icon: 'send',
    badge: '半岛全球视点',
    lang: 'en'
  },

  // ================= 4. 体育竞技 =================
  {
    id: 'sports_cn',
    name: '新体育网 (官方)',
    category: 'sports',
    categoryLabel: '体育竞技',
    type: 'scrape',
    url: 'http://www.sports.cn/',
    icon: 'activity',
    badge: '国家体育总局',
    lang: 'zh'
  },
  {
    id: 'hupu',
    name: '虎扑体育',
    category: 'sports',
    categoryLabel: '体育竞技',
    type: 'scrape',
    url: 'https://m.hupu.com/',
    icon: 'flame',
    badge: 'NBA/欧冠专区',
    lang: 'zh'
  },
  {
    id: 'zhibo8',
    name: '直播吧',
    category: 'sports',
    categoryLabel: '体育竞技',
    type: 'scrape',
    url: 'https://news.zhibo8.com/',
    icon: 'play-circle',
    badge: '实时比分战报',
    lang: 'zh'
  },
  {
    id: 'espn',
    name: 'ESPN',
    category: 'sports',
    categoryLabel: '体育竞技',
    type: 'rss',
    url: 'https://www.espn.com/espn/rss/news',
    icon: 'award',
    badge: '美职篮/世界体坛',
    lang: 'en'
  },
  {
    id: 'bbc_sport',
    name: 'BBC Sport',
    category: 'sports',
    categoryLabel: '体育竞技',
    type: 'rss',
    url: 'https://feeds.bbci.co.uk/sport/rss.xml',
    icon: 'medal',
    badge: '英超/五大联赛',
    lang: 'en'
  },
  {
    id: 'the_athletic',
    name: 'The Athletic',
    category: 'sports',
    categoryLabel: '体育竞技',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:theathletic.com&hl=en-US&gl=US&ceid=US:en',
    icon: 'shield',
    badge: '深度战术剖析',
    lang: 'en'
  },
  {
    id: 'motorsport',
    name: 'Motorsport.com',
    category: 'sports',
    categoryLabel: '体育竞技',
    type: 'rss',
    url: 'https://www.motorsport.com/rss/f1/news/',
    icon: 'gauge',
    badge: 'F1/世界赛车',
    lang: 'en'
  },

  // ================= 5. 军事防务 =================
  {
    id: 'mil_81',
    name: '中国军网 (81.cn)',
    category: 'military',
    categoryLabel: '军事防务',
    type: 'scrape',
    url: 'http://www.81.cn/',
    icon: 'shield',
    badge: '解放军官方网',
    lang: 'zh'
  },
  {
    id: 'mod_gov',
    name: '国防部网 (mod.gov.cn)',
    category: 'military',
    categoryLabel: '军事防务',
    type: 'scrape',
    url: 'http://www.mod.gov.cn/',
    icon: 'shield-alert',
    badge: '国防部权威发布',
    lang: 'zh'
  },
  {
    id: 'guancha_mil',
    name: '观察者网军事板块',
    category: 'military',
    categoryLabel: '军事防务',
    type: 'scrape',
    url: 'https://www.guancha.cn/military-affairs',
    icon: 'crosshair',
    badge: '深防务战略',
    lang: 'zh'
  },
  {
    id: 'defense_news',
    name: 'Defense News',
    category: 'military',
    categoryLabel: '军事防务',
    type: 'rss',
    url: 'https://www.defensenews.com/arc/outboundfeeds/rss/',
    icon: 'flag',
    badge: '全球军工防务',
    lang: 'en'
  },
  {
    id: 'twz',
    name: 'The War Zone (TWZ)',
    category: 'military',
    categoryLabel: '军事防务',
    type: 'rss',
    url: 'https://www.twz.com/feed',
    icon: 'radar',
    badge: '战机/无人尖端',
    lang: 'en'
  },
  {
    id: 'janes',
    name: 'Janes 防务情报',
    category: 'military',
    categoryLabel: '军事防务',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:janes.com&hl=en-US&gl=US&ceid=US:en',
    icon: 'search',
    badge: '全球防务装备库',
    lang: 'en'
  },
  {
    id: 'breaking_defense',
    name: 'Breaking Defense',
    category: 'military',
    categoryLabel: '军事防务',
    type: 'rss',
    url: 'https://breakingdefense.com/feed/',
    icon: 'alert-triangle',
    badge: '尖端战力/军火',
    lang: 'en'
  },
  {
    id: 'isw',
    name: 'Institute for the Study of War (ISW)',
    category: 'military',
    categoryLabel: '军事防务',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:understandingwar.org&hl=en-US&gl=US&ceid=US:en',
    icon: 'map-pin',
    badge: '战局动态沙盘',
    lang: 'en'
  },

  // ================= 6. 天文学模块 (新增！超强权威阵容) =================
  // NASA，ESA, ESO, AAS, IAU, Nature/Science，Quanta Magazine，Sky & telescope，arXiv，国家天文台（NAO)，中国国家天文，中国天文学会，紫金山天文台，上海天文官网，国家天文科学数据中心NADC，中国科学报天文板块
  {
    id: 'nasa',
    name: 'NASA (美国航空航天局)',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'https://www.nasa.gov/news-release/feed/',
    icon: 'orbit',
    badge: 'NASA深空/韦伯',
    lang: 'en'
  },
  {
    id: 'esa',
    name: 'ESA (欧洲空间局)',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science',
    icon: 'compass',
    badge: '欧空局/空间科学',
    lang: 'en'
  },
  {
    id: 'eso',
    name: 'ESO (欧洲南方天文台)',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'https://www.eso.org/public/news/feed/',
    icon: 'telescope',
    badge: 'VLT甚大望远镜',
    lang: 'en'
  },
  {
    id: 'aas',
    name: 'AAS (美国天文学会)',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'https://aasnova.org/feed/',
    icon: 'star',
    badge: 'AAS研究前沿',
    lang: 'en'
  },
  {
    id: 'iau',
    name: 'IAU (国际天文学联合会)',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22International+Astronomical+Union%22+OR+site:iau.org&hl=en-US&gl=US&ceid=US:en',
    icon: 'globe',
    badge: '全球天体命名/权威',
    lang: 'en'
  },
  {
    id: 'nature_science_astro',
    name: 'Nature / Science 天文专刊',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'https://www.nature.com/subjects/astronomy-and-astrophysics.rss',
    icon: 'atom',
    badge: '顶刊天文物理',
    lang: 'en'
  },
  {
    id: 'quanta_astro',
    name: 'Quanta Magazine',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'https://api.quantamagazine.org/feed/',
    icon: 'sparkles',
    badge: '量子与天体物理',
    lang: 'en'
  },
  {
    id: 'sky_and_telescope',
    name: 'Sky & Telescope (天空与望远镜)',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'https://skyandtelescope.org/astronomy-news/feed/',
    icon: 'eye',
    badge: '观星指南/天象',
    lang: 'en'
  },
  {
    id: 'arxiv_astro',
    name: 'arXiv (astro-ph 天体物理)',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'http://export.arxiv.org/api/query?search_query=cat:astro-ph&sortBy=submittedDate&sortOrder=descending&max_results=15',
    icon: 'file-text',
    badge: '国际前沿预印本',
    lang: 'en'
  },
  {
    id: 'naoc',
    name: '国家天文台 (NAO)',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'scrape',
    url: 'http://www.nao.cas.cn/',
    icon: 'satellite',
    badge: 'FAST中国天眼',
    lang: 'zh'
  },
  {
    id: 'chinese_national_astronomy',
    name: '中国国家天文',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22%E4%B8%AD%E5%9B%BD%E5%9B%BD%E5%AE%B6%E5%A4%A9%E6%96%87%22+OR+%22%E5%9B%BD%E5%AE%B6%E5%A4%A9%E6%96%87%E5%8F%B0%22&hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
    icon: 'sun',
    badge: '国家级天文科普',
    lang: 'zh'
  },
  {
    id: 'cas_astronomy_society',
    name: '中国天文学会',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22%E4%B8%AD%E5%9B%BD%E5%A4%A9%E6%96%87%E5%AD%A6%E4%BC%9A%22&hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
    icon: 'award',
    badge: '全国天文学界',
    lang: 'zh'
  },
  {
    id: 'pmo',
    name: '紫金山天文台',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'scrape',
    url: 'http://www.pmo.cas.cn/',
    icon: 'mountain',
    badge: '暗物质探测/小行星',
    lang: 'zh'
  },
  {
    id: 'shao',
    name: '上海天文台官网',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'scrape',
    url: 'http://www.shao.cas.cn/',
    icon: 'radar',
    badge: 'VLBI深空测轨',
    lang: 'zh'
  },
  {
    id: 'nadc',
    name: '国家天文科学数据中心 (NADC)',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22%E5%9B%BD%E5%AE%B6%E5%A4%A9%E6%96%87%E7%A7%91%E5%AD%A6%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83%22&hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
    icon: 'database',
    badge: '海量巡天数据库',
    lang: 'zh'
  },
  {
    id: 'sciencenet_astro',
    name: '中国科学报天文板块',
    category: 'astronomy',
    categoryLabel: '天文学',
    type: 'scrape',
    url: 'https://news.sciencenet.cn/',
    icon: 'newspaper',
    badge: '中科院科学网',
    lang: 'zh'
  },

  // ================= 7. 教育资讯 =================
  {
    id: 'eol',
    name: '中国教育在线',
    category: 'education',
    categoryLabel: '教育资讯',
    type: 'scrape',
    url: 'https://www.eol.cn/',
    icon: 'graduation-cap',
    badge: '高考研招报考',
    lang: 'zh'
  },
  {
    id: 'moe_gov',
    name: '教育部官网 (moe.gov.cn)',
    category: 'education',
    categoryLabel: '教育资讯',
    type: 'scrape',
    url: 'http://www.moe.gov.cn/',
    icon: 'book-open',
    badge: '国家教育政策',
    lang: 'zh'
  },
  {
    id: 'xuetangx',
    name: '学堂在线',
    category: 'education',
    categoryLabel: '教育资讯',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%22%E5%AD%A6%E5%A0%82%E5%9C%A8%E7%BA%BF%22+OR+%22%E6%85%95%E8%AF%BE%22&hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
    icon: 'laptop',
    badge: '高校MOOC学术',
    lang: 'zh'
  },
  {
    id: 'the_higher_ed',
    name: 'Times Higher Education (THE)',
    category: 'education',
    categoryLabel: '教育资讯',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:timeshighereducation.com&hl=en-US&gl=US&ceid=US:en',
    icon: 'award',
    badge: '全球大学排名',
    lang: 'en'
  },
  {
    id: 'inside_higher_ed',
    name: 'Inside Higher Ed',
    category: 'education',
    categoryLabel: '教育资讯',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:insidehighered.com&hl=en-US&gl=US&ceid=US:en',
    icon: 'library',
    badge: '高等教育深度',
    lang: 'en'
  },
  {
    id: 'education_week',
    name: 'Education Week',
    category: 'education',
    categoryLabel: '教育资讯',
    type: 'rss',
    url: 'https://www.edweek.org/rss',
    icon: 'file-text',
    badge: 'K12与基础教育',
    lang: 'en'
  },
  {
    id: 'nature_edu',
    name: 'Nature (自然)',
    category: 'education',
    categoryLabel: '教育资讯',
    type: 'rss',
    url: 'https://www.nature.com/nature.rss',
    icon: 'microscope',
    badge: '全球科研突破',
    lang: 'en'
  },

  // ================= 8. 娱乐圈 =================
  {
    id: 'bilibili',
    name: '哔哩哔哩 (Bilibili)',
    category: 'entertainment',
    categoryLabel: '娱乐圈',
    type: 'bilibili_api',
    url: 'https://www.bilibili.com/',
    icon: 'tv',
    badge: 'B站热门/视频',
    lang: 'zh'
  },
  {
    id: 'douyin',
    name: '抖音热榜 (Douyin)',
    category: 'entertainment',
    categoryLabel: '娱乐圈',
    type: 'douyin_api',
    url: 'https://www.douyin.com/',
    icon: 'video',
    badge: '抖音热榜/爆点',
    lang: 'zh'
  },
  {
    id: 'sina_ent',
    name: '新浪娱乐',
    category: 'entertainment',
    categoryLabel: '娱乐圈',
    type: 'scrape',
    url: 'https://ent.sina.com.cn/',
    icon: 'sparkles',
    badge: '演艺动态/热搜',
    lang: 'zh'
  },
  {
    id: 'douban_ent',
    name: '豆瓣小组 / 豆瓣娱乐',
    category: 'entertainment',
    categoryLabel: '娱乐圈',
    type: 'scrape',
    url: 'https://www.douban.com/group/explore',
    icon: 'message-circle',
    badge: '娱圈讨论/八卦',
    lang: 'zh'
  },
  {
    id: 'variety_ent',
    name: 'Variety',
    category: 'entertainment',
    categoryLabel: '娱乐圈',
    type: 'rss',
    url: 'https://variety.com/feed/',
    icon: 'star',
    badge: '好莱坞星闻',
    lang: 'en'
  },
  {
    id: 'deadline_ent',
    name: 'Deadline',
    category: 'entertainment',
    categoryLabel: '娱乐圈',
    type: 'rss',
    url: 'https://deadline.com/feed/',
    icon: 'flame',
    badge: '好莱坞爆料独家',
    lang: 'en'
  },
  {
    id: 'thr_ent',
    name: 'The Hollywood Reporter (THR)',
    category: 'entertainment',
    categoryLabel: '娱乐圈',
    type: 'rss',
    url: 'https://www.hollywoodreporter.com/feed/',
    icon: 'film',
    badge: '演艺名流',
    lang: 'en'
  },
  {
    id: 'people_mag',
    name: 'People',
    category: 'entertainment',
    categoryLabel: '娱乐圈',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:people.com&hl=en-US&gl=US&ceid=US:en',
    icon: 'heart',
    badge: '人物周刊',
    lang: 'en'
  },

  // ================= 9. 影视文化 =================
  {
    id: 'douban_movie',
    name: '豆瓣电影',
    category: 'cinema',
    categoryLabel: '影视文化',
    type: 'scrape',
    url: 'https://movie.douban.com/',
    icon: 'clapperboard',
    badge: '豆瓣评分/影评',
    lang: 'zh'
  },
  {
    id: 'cctv_1905',
    name: '1905电影网 (央视电影官方)',
    category: 'cinema',
    categoryLabel: '影视文化',
    type: 'scrape',
    url: 'https://www.1905.com/news/',
    icon: 'video',
    badge: '央视电影频道',
    lang: 'zh'
  },
  {
    id: 'indiewire',
    name: 'IndieWire',
    category: 'cinema',
    categoryLabel: '影视文化',
    type: 'rss',
    url: 'https://www.indiewire.com/feed/',
    icon: 'camera',
    badge: '独立电影/国际影节',
    lang: 'en'
  },
  {
    id: 'sight_and_sound',
    name: 'Sight and Sound',
    category: 'cinema',
    categoryLabel: '影视文化',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:bfi.org.uk/sight-and-sound&hl=en-US&gl=US&ceid=US:en',
    icon: 'eye',
    badge: '英国电影协会BFI',
    lang: 'en'
  },
  {
    id: 'roger_ebert',
    name: 'RogerEbert.com',
    category: 'cinema',
    categoryLabel: '影视文化',
    type: 'rss',
    url: 'https://www.rogerebert.com/feed',
    icon: 'thumbs-up',
    badge: '普利策影评名家',
    lang: 'en'
  },
  {
    id: 'criterion',
    name: 'The Criterion Collection',
    category: 'cinema',
    categoryLabel: '影视文化',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:criterion.com&hl=en-US&gl=US&ceid=US:en',
    icon: 'disc',
    badge: '大师经典电影库',
    lang: 'en'
  },

  // ================= 10. 财经商业 =================
  {
    id: 'caixin',
    name: '财新网',
    category: 'finance',
    categoryLabel: '财经商业',
    type: 'scrape',
    url: 'https://www.caixin.com/',
    icon: 'trending-up',
    badge: '财新深度调查',
    lang: 'zh'
  },
  {
    id: 'yicai',
    name: '第一财经',
    category: 'finance',
    categoryLabel: '财经商业',
    type: 'scrape',
    url: 'https://www.yicai.com/',
    icon: 'bar-chart-2',
    badge: '中国商业电视',
    lang: 'zh'
  },
  {
    id: 'eastmoney',
    name: '东方财富网',
    category: 'finance',
    categoryLabel: '财经商业',
    type: 'scrape',
    url: 'https://finance.eastmoney.com/',
    icon: 'pie-chart',
    badge: 'A股大盘/基金',
    lang: 'zh'
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg (彭博社)',
    category: 'finance',
    categoryLabel: '财经商业',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=site:bloomberg.com&hl=en-US&gl=US&ceid=US:en',
    icon: 'dollar-sign',
    badge: '全球金融终端',
    lang: 'en'
  },
  {
    id: 'financial_times',
    name: 'Financial Times (金融时报)',
    category: 'finance',
    categoryLabel: '财经商业',
    type: 'rss',
    url: 'https://www.ft.com/rss/home',
    icon: 'briefcase',
    badge: '英伦金融泰斗',
    lang: 'en'
  },
  {
    id: 'cnbc',
    name: 'CNBC',
    category: 'finance',
    categoryLabel: '财经商业',
    type: 'rss',
    url: 'https://search.cnbc.com/rs/search/view.html?partnerId=2000&keywords=finance&sort=date',
    icon: 'tv-2',
    badge: '美股行情早知道',
    lang: 'en'
  },
  {
    id: 'wsj',
    name: 'The Wall Street Journal (华尔街日报)',
    category: 'finance',
    categoryLabel: '财经商业',
    type: 'rss',
    url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    icon: 'globe',
    badge: '全球商业日报',
    lang: 'en'
  },

  // ================= 11. 科技前沿 =================
  {
    id: '36kr',
    name: '36氪',
    category: 'tech',
    categoryLabel: '科技前沿',
    type: 'rss_clean',
    url: 'https://36kr.com/feed',
    icon: 'zap',
    badge: '创投/科技快讯',
    lang: 'zh'
  },
  {
    id: 'ifanr',
    name: '爱范儿 Ifanr',
    category: 'tech',
    categoryLabel: '科技前沿',
    type: 'rss',
    url: 'https://www.ifanr.com/feed',
    icon: 'smartphone',
    badge: '明日产品未来',
    lang: 'zh'
  },
  {
    id: 'techweb',
    name: 'TechWeb',
    category: 'tech',
    categoryLabel: '科技前沿',
    type: 'scrape',
    url: 'https://www.techweb.com.cn/',
    icon: 'globe',
    badge: '互联网产业要闻',
    lang: 'zh'
  },
  {
    id: 'ars_technica',
    name: 'Ars Technica',
    category: 'tech',
    categoryLabel: '科技前沿',
    type: 'rss',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    icon: 'cpu',
    badge: '极客深度硬核',
    lang: 'en'
  },
  {
    id: 'mit_tech_review',
    name: 'MIT Technology Review',
    category: 'tech',
    categoryLabel: '科技前沿',
    type: 'rss',
    url: 'https://www.technologyreview.com/feed/',
    icon: 'cpu-chip',
    badge: '麻省理工前瞻',
    lang: 'en'
  },
  {
    id: 'the_verge',
    name: 'The Verge',
    category: 'tech',
    categoryLabel: '科技前沿',
    type: 'rss',
    url: 'https://www.theverge.com/rss/index.xml',
    icon: 'monitor',
    badge: '数码文化美学',
    lang: 'en'
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    category: 'tech',
    categoryLabel: '科技前沿',
    type: 'rss',
    url: 'https://techcrunch.com/feed/',
    icon: 'rocket',
    badge: '硅谷独角兽前沿',
    lang: 'en'
  },
  {
    id: 'ieee_spectrum',
    name: 'IEEE Spectrum',
    category: 'tech',
    categoryLabel: '科技前沿',
    type: 'rss',
    url: 'https://spectrum.ieee.org/feeds/feed.rss',
    icon: 'activity',
    badge: '电气与工程前沿',
    lang: 'en'
  }
];

const CATEGORIES = [
  { id: 'all', label: '全部要闻', icon: 'flame', desc: '全网指定渠道聚合大信息流' },
  { id: 'astronomy', label: '天文学', icon: 'telescope', desc: 'NASA、ESA、ESO、国家天文台FAST、韦伯望远镜与深空物理' },
  { id: 'esports', label: '实时电竞', icon: 'trophy', desc: '2026英雄联盟全球总决赛(S16)、玩加、兔玩、Dot Esports、HLTV、Liquipedia' },
  { id: 'gaming', label: '游戏前沿', icon: 'gamepad-2', desc: '机核、NGA、游民星空/3DM、IGN、Eurogamer、GamesIndustry、Game Developer' },
  { id: 'world', label: '全球大事', icon: 'globe', desc: '新华网、人民网、央视新闻、路透社、美联社、BBC、半岛电视台' },
  { id: 'sports', label: '体育竞技', icon: 'activity', desc: '新体育网、虎扑、直播吧、ESPN、BBC Sport、The Athletic、Motorsport' },
  { id: 'military', label: '军事防务', icon: 'shield', desc: '中国军网、国防部网、观察者网、Defense News、TWZ、Janes、Breaking Defense、ISW' },
  { id: 'education', label: '教育资讯', icon: 'graduation-cap', desc: '中国教育在线、教育部官网、学堂在线、THE、Inside Higher Ed、Education Week、Nature' },
  { id: 'entertainment', label: '娱乐圈', icon: 'sparkles', desc: '抖音热榜、哔哩哔哩热门、新浪娱乐、豆瓣娱乐、Variety、Deadline' },
  { id: 'cinema', label: '影视文化', icon: 'clapperboard', desc: '豆瓣电影、1905电影网、IndieWire、Sight and Sound、RogerEbert、Criterion' },
  { id: 'finance', label: '财经商业', icon: 'trending-up', desc: '财新网、第一财经、东方财富、Bloomberg、FT、CNBC、华尔街日报' },
  { id: 'tech', label: '科技前沿', icon: 'cpu', desc: '36氪、爱范儿、TechWeb、Ars Technica、MIT科技评论、The Verge、TechCrunch、IEEE' }
];

module.exports = { SOURCES, CATEGORIES };
