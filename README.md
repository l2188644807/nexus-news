# 智讯枢纽 (NEXUS PULSE) - 全网权威实时资讯矩阵 (白底典雅版)

一套专为高时效性需求打造的**多源实时资讯聚合与推流系统**。默认采用清爽高质感的白底典雅现代门户排版，严格接入您指定的 88 个全网顶级权威渠道与空间天文机构。

---

## 🌟 11 大核心模块与专属指定渠道一览 (全覆盖 88 源)

| 核心模块 | 您指定的权威接入渠道 (已全部实装 88 源) | 采集与内容特色 |
| :--- | :--- | :--- |
| 🔭 **天文学 & 深空前沿** | **NASA**、**ESA (欧空局)**、**ESO (欧洲南方天文台)**、**AAS (美国天文学会)**、**IAU (国际天文学联合会)**、**Nature/Science 天文**、**Quanta Magazine**、**Sky & Telescope**、**arXiv 天体物理**、**国家天文台 (NAO)**、**中国国家天文**、**中国天文学会**、**紫金山天文台**、**上海天文台**、**国家天文科学数据中心 (NADC)**、**中国科学报天文** | 韦伯望远镜新发现、FAST天眼脉冲星、黑洞与引力波、系外宜居行星与深空探测前沿。 |
| 🎮 **实时电竞** | **英雄联盟全球总决赛 (LoL Esports)**、**玩加电竞 (Score)**、**兔玩网**、**Dot Esports**、**HLTV**、**Esports Insider**、**Liquipedia** | CS2 Major 战报、英雄联盟全球总决赛赛程积分、无畏契约CN赛区高光、赛事赛况与选手动态。 |
| 🕹️ **游戏前沿** | **机核 Gcores**、**NGA 玩家社区**、**游民星空 / 3DM**、**IGN**、**Eurogamer**、**GamesIndustry.biz**、**Game Developer** | 核聚变展会、NGA硬核开荒攻略、游民星空实机报道、欧洲权威评测与次世代引擎开发。 |
| 🌍 **全球大事** | **新华网**、**人民网**、**央视新闻网**、**Reuters (路透社)**、**Associated Press (美联社)**、**BBC News**、**Al Jazeera English (半岛电视台)** | 国家通讯社头条、央视时政独家、全球半导体芯片光刻机路线图、国际清洁电网协定与地缘大事。 |
| ⚽ **体育竞技** | **新体育网 (官方)**、**虎扑体育**、**直播吧**、**ESPN**、**BBC Sport**、**The Athletic**、**Motorsport.com** | 体育总局冰雪行动方案、虎扑JR热评专区、直播吧实时比分战报、The Athletic战术深拆、F1世界赛车。 |
| 🛡️ **军事防务** | **中国军网 (81.cn)**、**国防部网 (mod.gov.cn)**、**观察者网军事板块**、**Defense News**、**The War Zone (TWZ)**、**Janes 防务情报**、**Breaking Defense**、**Institute for the Study of War (ISW)** | 解放军演训实况、国防部例行答记者问、第六代战机有源相控阵雷达、无人僚机空防与ISW战役地图。 |
| 🎓 **教育资讯** | **中国教育在线 (eol.cn)**、**教育部官网 (moe.gov.cn)**、**学堂在线**、**Times Higher Education (THE)**、**Inside Higher Ed**、**Education Week**、**Nature (自然)** | 中办国办科创深度融合指导意见、卓越工程师培养计划、THE跨学科大学排名与Nature全球科研突破。 |
| 🌟 **娱乐圈** | **哔哩哔哩 (Bilibili)**、**抖音热榜 (Douyin)**、**新浪娱乐**、**豆瓣小组 / 豆瓣娱乐**、**Variety**、**Deadline**、**The Hollywood Reporter (THR)**、**People** | B站热门精选、抖音实时上升热搜、演艺独家追踪专访、好莱坞大作首发与文娱动态。 |
| 🎬 **影视文化** | **豆瓣电影**、**1905电影网 (央视电影官方)**、**IndieWire**、**Sight and Sound (BFI)**、**RogerEbert.com**、**The Criterion Collection (标准收藏)** | 豆瓣高分影评、央视电影频道《中国电影报道》、IndieWire独立电影节、CC标准收藏4K蓝光大师修复。 |
| 📈 **财经商业** | **财新网**、**第一财经**、**东方财富网**、**Bloomberg (彭博社)**、**Financial Times (金融时报)**、**CNBC**、**The Wall Street Journal (华尔街日报)** | 财新独家商业调查、A股大盘与东方财富资金流、彭博全球资产追踪、FT与华尔街日报宏观动向。 |
| 💡 **科技前沿** | **36氪**、**爱范儿 Ifanr**、**TechWeb**、**Ars Technica**、**MIT Technology Review (麻省理工科技评论)**、**The Verge**、**TechCrunch**、**IEEE Spectrum** | 硅谷独角兽动向、爱范儿明日产品美学、Ars Technica硬核拆解、IEEE半导体芯片与大模型前沿。 |

---

## 🚀 启动与体验方式

### 方式 1：双击运行 (Windows)
在工作区目录下直接双击：
```cmd
start.bat
```

### 方式 2：终端命令
```bash
cd realtime-news-portal
npm install
npm test       # 运行自动化质检与回归测试
npm start      # 启动正式生产服务
```

浏览器访问：
👉 **http://localhost:3000**

---

## 💡 核心工程特性
1. **纯原生 Vue SVG 图标引擎**：零外部 Lucide DOM 侵入，100% 保持 Vue 响应式与 Virtual DOM 完整性。
2. **多模态混合抓取管道**：集成了「标准 RSS + 深度 XML 清洗 + Cheerio 结构化提取 + 官方 API 实时热榜」，覆盖 88 个权威信标。
3. **实时推送与健壮并发**：内置轻量 Server-Sent Events (SSE) 毫秒级推流管道，具备 15 秒限流防刷与并发锁早退保护机制。
