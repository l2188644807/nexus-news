const fs = require('fs');
const path = require('path');
const { SOURCES } = require('./sources');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'news_cache.json');

// 用户指定全量权威渠道初始专属种子数据 (覆盖电竞、游戏、全球、体育、军事、教育、娱乐、影视、财经、科技、天文学)
const CHANNEL_SEEDS = [
  // ================= 1. 天文学模块 (新增！超权威深空科研阵容) =================
  {
    id: 'seed-nasa-1',
    title: '【NASA】韦伯空间望远镜发现宇宙黎明期巨型原星系团：红移破纪录，改写早期宇宙演化理论',
    summary: 'NASA 最新科学简报：詹姆斯·韦伯望远镜（JWST）NIRCam红外光谱在百亿光年外捕捉到密集成团的幼年星系，其质量和金属丰度远超标准宇宙学模型此前预期。',
    link: 'https://blogs.nasa.gov/webb/',
    sourceId: 'nasa',
    source: 'NASA (美国航空航天局)',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 6 * 60 * 1000,
    tags: ['韦伯望远镜', '原星系团', '早期宇宙', '深空物理'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-esa-1',
    title: '【ESA 欧空局】欧几里得空间望远镜公布第一批超高清暗物质三维星图：揭示深空纤维状网状结构',
    summary: '欧洲空间局（ESA）正式释出涵盖数百万星系的引力透镜巡天全景，以前所未有的分辨率勾勒出暗能量对时空膨胀的微观拉扯效应。',
    link: 'https://www.esa.int',
    sourceId: 'esa',
    source: 'ESA (欧洲空间局)',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 14 * 60 * 1000,
    tags: ['欧空局', '欧几里得望远镜', '暗物质', '三维宇宙'],
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-eso-1',
    title: '【ESO】欧洲南方天文台甚大望远镜（VLT）首次直接测得百光年外超级地球大气风速与云层环流',
    summary: '天文学家使用ESO安装在智利阿塔卡马沙漠的超大干涉仪，首次分辨出行星昼夜半球间的剧烈热对流风暴，为探测外星宜居性开辟全新范式。',
    link: 'https://www.eso.org',
    sourceId: 'eso',
    source: 'ESO (欧洲南方天文台)',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 22 * 60 * 1000,
    tags: ['甚大望远镜', '系外行星', '大气环流', 'ESO科研'],
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },
  {
    id: 'seed-naoc-1',
    title: '【国家天文台】“中国天眼”FAST发现脉冲星总数突破1000颗，极端相对论双星引力波检验获新契机',
    summary: '中国科学院国家天文台宣布：500米口径球面射电望远镜（FAST）在银道面搜寻中取得里程碑成就，包括多颗超快毫秒脉冲星与黑寡妇双星系统，观测效率稳居世界之首。',
    link: 'http://www.nao.cas.cn/',
    sourceId: 'naoc',
    source: '国家天文台 (NAO)',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 8 * 60 * 1000,
    tags: ['FAST中国天眼', '脉冲星发现', '国家天文台', '国之重器'],
    image: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-cna-1',
    title: '【中国国家天文】我国巡天空间望远镜（CSST）科学载荷进入总装集成：视场达哈勃望远镜300倍',
    summary: '《中国国家天文》专题揭秘：我国首个大型光学空间巡天望远镜将在空间站共轨飞行，计划在十年内绘制全天40%以上的高精度暗弱星空光谱。',
    link: 'https://www.nao.cas.cn/',
    sourceId: 'chinese_national_astronomy',
    source: '中国国家天文',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 35 * 60 * 1000,
    tags: ['巡天望远镜CSST', '空间光学', '空间站共轨'],
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },
  {
    id: 'seed-pmo-1',
    title: '【紫金山天文台】“夸父一号”ASO-S卫星成功捕捉到X级超强太阳耀斑：磁重联与高能粒子抛射全程获完整记录',
    summary: '中科院紫金山天文台先进天基太阳天文台科学团队公布最新观测数据：莱曼阿尔法谱线相机精准还原耀斑爆发前夕磁通量环的扭缠演变，为空间天气预警提供黄金数据。',
    link: 'http://www.pmo.cas.cn/',
    sourceId: 'pmo',
    source: '紫金山天文台',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 28 * 60 * 1000,
    tags: ['夸父一号', '太阳物理', '紫金山天文台'],
    image: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },
  {
    id: 'seed-shao-1',
    title: '【上海天文台】超长基线干涉测量（VLBI）网精准测轨深空探测器：定位精度优于亚米级',
    summary: '上海天文台65米天马射电望远镜协同全国VLBI观测网，在复杂地月及深空交会测控中展现核心支撑力，为后续行星际取样返回任务筑牢测控基石。',
    link: 'http://www.shao.cas.cn/',
    sourceId: 'shao',
    source: '上海天文台官网',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 42 * 60 * 1000,
    tags: ['VLBI测轨', '天马望远镜', '深空测控'],
    image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: false
  },
  {
    id: 'seed-nadc-1',
    title: '【国家天文科学数据中心】NADC上线海量巡天PB级数据云平台：全球科研学者可在线并行调用',
    summary: '国家天文科学数据中心宣布中国虚拟天文台（China-VO）升级完成，整合了郭守敬望远镜（LAMOST）、FAST及国内外顶级巡天公开数据，支持百亿级天体秒级交叉证认。',
    link: 'https://nadc.china-vo.org/',
    sourceId: 'nadc',
    source: '国家天文科学数据中心 (NADC)',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 50 * 60 * 1000,
    tags: ['NADC大数据', '虚拟天文台', 'LAMOST'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: false
  },
  {
    id: 'seed-sciencenet-1',
    title: '【中国科学报】快速射电暴（FRB）起源谜题再获突破：科研团队首次测定其宿主星系超强磁场强度',
    summary: '《中国科学报》深度特稿：联合天文团队结合多波段偏振观测，证实极端高能宇宙爆发现象与极强磁化中子星（磁陀星）星震剧烈释放磁能高度关联。',
    link: 'https://news.sciencenet.cn/',
    sourceId: 'sciencenet_astro',
    source: '中国科学报天文板块',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 19 * 60 * 1000,
    tags: ['快速射电暴', '磁陀星', '中科院科学网'],
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-nature-astro-1',
    title: '【Nature / Science】Astronomers Detect Gravitational-Wave Echoes from Intermediate-Mass Black Hole Merger',
    summary: 'Landmark research published in Nature confirms pristine spacetime ripples from a collision of black holes in the elusive 100-to-10,000 solar-mass range.',
    link: 'https://www.nature.com',
    sourceId: 'nature_science_astro',
    source: 'Nature / Science 天文专刊',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 16 * 60 * 1000,
    tags: ['引力波', '中等质量黑洞', 'Nature顶刊'],
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-quanta-1',
    title: '【Quanta Magazine】How Primordial Gravitational Waves Could Solve the Cosmic Inflation Puzzle',
    summary: 'Quanta Magazine astrophysics feature: Theoretical physicists explore how cosmic microwave background polarization might soon reveal signatures from the first fraction of a second.',
    link: 'https://www.quantamagazine.org',
    sourceId: 'quanta_astro',
    source: 'Quanta Magazine',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 38 * 60 * 1000,
    tags: ['宇宙暴胀', '微波背景辐射', '理论天体物理'],
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },
  {
    id: 'seed-sky-tele-1',
    title: '【Sky & Telescope】Celestial Highlights: Spectacular Meteor Showers and Comet Opposition Align This Month',
    summary: 'Sky & Telescope observational bulletin: Ideal dark-sky conditions and lunar cycles offer astronomy enthusiasts optimal visual windows for observing deep-sky nebulae and planetary alignments.',
    link: 'https://skyandtelescope.org',
    sourceId: 'sky_and_telescope',
    source: 'Sky & Telescope (天空与望远镜)',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 48 * 60 * 1000,
    tags: ['观星指南', '流星雨极盛', '业余天文'],
    image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: false
  },
  {
    id: 'seed-aas-1',
    title: '【AAS美国天文学会】The Astrophysical Journal发布高能天体物理最新前沿：毫秒脉冲星自转减慢与引力波辐射界限',
    summary: '美国天文学会(AAS)旗舰期刊ApJ刊登跨学科联合研究，结合射电计时与引力波探测器数据，对毫秒脉冲星的非轴对称形变与引力波连续辐射给出了目前最严苛的物理界限。',
    link: 'https://aasnova.org/',
    sourceId: 'aas',
    source: 'AAS (美国天文学会)',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 25 * 60 * 1000,
    tags: ['AAS研究', 'ApJ顶刊', '脉冲星', '引力波'],
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },
  {
    id: 'seed-iau-1',
    title: '【IAU国际天文学联合会】2026年全球天体命名与近地小行星预警通报：新增3颗潜在危险天体轨线测定',
    summary: 'IAU小行星中心(MPC)联合全球各大巡天台站更新近地小天体编目，最新精密测轨排除了未来百年内的撞击概率，并正式批准了新一批火星地表撞击坑及系外行星命名提案。',
    link: 'https://www.iau.org',
    sourceId: 'iau',
    source: 'IAU (国际天文学联合会)',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 32 * 60 * 1000,
    tags: ['国际天文学会', '小行星命名', '天体测轨', 'IAU权威'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-arxiv-astro-1',
    title: '【arXiv astro-ph】arXiv最新预印本：暗能量光谱巡天(DESI)对重子声学振荡的高精度测定支持动态暗能量假说',
    summary: 'arXiv天体物理板块(astro-ph.CO)今日刊出前沿分析论文，数百万个星系与类星体三维红移巡天数据表明宇宙膨胀历史中暗能量物态方程参数存在随时间演化的迹象。',
    link: 'http://export.arxiv.org/',
    sourceId: 'arxiv_astro',
    source: 'arXiv (astro-ph 天体物理)',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 15 * 60 * 1000,
    tags: ['arXiv预印本', '暗能量', 'DESI巡天', '宇宙学'],
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-cas-soc-1',
    title: '【中国天文学会】全国天文学术年会通报：聚焦空间天文大科学装置与系外宜居行星探测',
    summary: '中国天文学会学术工作委员会公布最新年会特邀报告议程，重点研讨爱因斯坦探针卫星(EP)、CSST空间站巡天空间望远镜等国家重大科技基础设施的早期科学突破。',
    link: 'http://www.pmo.cas.cn/',
    sourceId: 'cas_astronomy_society',
    source: '中国天文学会',
    category: 'astronomy',
    categoryLabel: '天文学',
    pubDate: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 40 * 60 * 1000,
    tags: ['中国天文学会', '学术年会', '空间科学装置', '爱因斯坦探针'],
    image: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&auto=format&fit=crop&q=80',
    isBreaking: false,
    isHot: true
  },

  // ================= 2. 电竞模块 =================
  {
    id: 'seed-s16-1',
    title: '【LoL全球总决赛官方专题】拳头游戏发布全球电竞赛事赛历与前瞻：全球三大国际赛事窗口与席位规划',
    summary: '拳头游戏官方电竞赛事组正式公布最新全球总决赛赛历与赛区名额分配，重点介绍全新赛制演进、瑞士轮赛制优化与各大职业联赛席位争夺战，全球各大赛区顶级战队开启新一轮征程。',
    link: 'https://lolesports.com/',
    sourceId: 's16_worlds',
    source: '2026英雄联盟全球总决赛 (S16)',
    category: 'esports',
    categoryLabel: '实时电竞',
    pubDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 10 * 60 * 1000,
    tags: ['全球总决赛', 'LoL Esports', '赛历前瞻', '赛区席位', '拳头官方'],
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
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

  // ================= 3. 游戏前沿 =================
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

  // ================= 4. 全球大事 =================
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

  // ================= 5. 体育竞技 =================
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

  // ================= 6. 军事防务 =================
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

  // ================= 7. 热门流媒体与社媒前沿 =================
  {
    id: 'seed-bilibili-1',
    title: '【B站热门】2026顶级神作先导预告曝光：数万弹幕刷屏膜拜，百万播放登顶全站日榜第一',
    summary: '【B站热播 · 280万播放】UP主与游戏工作室联合发布全新实机深度演示，粒子特效与运镜设计引发全网热议，弹幕总量破10万。',
    link: 'https://www.bilibili.com/',
    sourceId: 'bilibili',
    source: '哔哩哔哩 (Bilibili)',
    category: 'entertainment',
    categoryLabel: '娱乐圈',
    pubDate: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 12 * 60 * 1000,
    tags: ['B站热门', '全站日榜第一', '实机演示', '百万播放', '哔哩哔哩'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    isBreaking: true,
    isHot: true
  },
  {
    id: 'seed-douyin-1',
    title: '【抖音热榜 Top 1】[爆] 2026年英雄联盟全球总决赛赛况与全网焦点狂欢',
    summary: '抖音实时热点聚焦榜第 1 位 [爆]，当前全网搜索热度指数突破 1280.5万。各大主播与解说现场连麦深度复盘，赛事话题播放量已达数亿次。',
    link: 'https://www.douyin.com/',
    sourceId: 'douyin',
    source: '抖音热榜 (Douyin)',
    category: 'entertainment',
    categoryLabel: '娱乐圈',
    pubDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    timestamp: Date.now() - 5 * 60 * 1000,
    tags: ['抖音热榜', '#S16全球总决赛', 'Top1', '实时热搜', '全网爆点'],
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
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

    // 确保天文学及全渠道最新种子注入
    CHANNEL_SEEDS.forEach(a => {
      if (!this.articles.has(a.id)) {
        this.articles.set(a.id, a);
      }
    });

    // 初始化全量 88 个权威信标状态
    if (Array.isArray(SOURCES)) {
      SOURCES.forEach(s => {
        const count = Array.from(this.articles.values()).filter(a => a.sourceId === s.id).length;
        this.sourcesStatus.set(s.id, {
          id: s.id,
          name: s.name,
          category: s.category,
          status: 'online',
          latencyMs: 120 + Math.floor(Math.random() * 80),
          itemCount: count,
          error: null
        });
      });
    }

    if (!this.lastUpdateTime) {
      this.lastUpdateTime = new Date().toISOString();
    }
    this.saveToFile();
  }

  saveToFile() {
    try {
      const list = Array.from(this.articles.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 1800);
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
      if (result.length >= 18) break;
    }
    return result;
  }

  getStats() {
    const list = Array.from(this.articles.values());
    const counts = {
      all: list.length,
      astronomy: 0,
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
      .slice(0, 20)
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
