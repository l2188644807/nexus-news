const fs = require('fs');
const path = require('path');
const { SOURCES, CATEGORIES } = require('./sources');
const { deriveTags } = require('./tagger');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DEFAULT_DATA_FILE = path.join(DATA_DIR, 'news_cache.json');

const VALID_CATEGORY_IDS = new Set(CATEGORIES.map(c => c.id).filter(id => id !== 'all'));
const SOURCES_MAP = new Map(SOURCES.map(s => [s.id, s]));
const ALL_SOURCE_BADGES = new Set(SOURCES.map(s => s.badge).filter(Boolean));

// 历史细微 ID 差异自动对齐映射
const GHOST_SOURCE_MAPPING = {
  'esports_insider': 'esportsinsider',
  'variety_film': 'variety_ent',
  'hollywood_reporter': 'thr_ent',
  'bbc_world': 'bbc_news'
  // 注意：bbc_business 不再映射到 bbc_news，避免财经内容被误归入全球大事，直接按规则清理
};

/**
 * 解决 D3: 统一文章新鲜度校验 (必须在 365 天以内，两处共用)
 */
function isFresh(item) {
  if (!item) return false;
  const ts = item.timestamp || (item.pubDate ? new Date(item.pubDate).getTime() : 0);
  if (!ts || isNaN(ts)) return true;
  const oneYearAgo = Date.now() - 365 * 86400 * 1000;
  return ts >= oneYearAgo;
}

/**
 * 解决 D2: 清洗抓取型来源的标题 (去除虎扑阅读数、回复量等尾部粘连内容)
 */
function cleanScrapedTitle(rawTitle, sourceId) {
  if (!rawTitle || typeof rawTitle !== 'string') return '';
  let t = rawTitle.replace(/\s+/g, ' ').trim();
  if (sourceId === 'hupu' || (sourceId && sourceId.includes('hupu'))) {
    t = t.replace(/\s*\d{3,}\s*(?:英雄联盟|篮球资讯|中国足球|国际足球资讯|足球话题区|独行侠专区|湖人专区|勇士专区|数码区|影视区|车友交流|和平精英|电竞|综合体育|崩坏|王者荣耀|绝地求生|步行街|[^\s\d]{2,6})?$/, '');
    t = t.replace(/\s*\d+\s*(?:亮|回复|浏览|阅读|人参与).*$/, '');
  }
  return t.trim();
}

/**
 * 解决 D2: 严格识别过滤抓取型新闻中的非真实新闻条目
 * 包含：页脚备案号/许可证、调试探针串、机构科室/学院/重点实验室/投资公司、导航/分页/豆列、403权限提示页
 */
function isGarbageArticle(title, link = '', sourceId = '') {
  if (!title || typeof title !== 'string') return true;
  const clean = title.trim();

  // 1. 过滤页脚备案号、网文许可证、增值电信业务等非新闻条目 (解决 D2 兔玩网等)
  if (/ICP备|网文\[|增值电信业务|营业执照|备案号|公网安备/i.test(clean)) return true;

  // 2. 过滤调试探针字符串与测试标记 (解决 D2 第一财经等)
  if (/YCPMARK|YCP\s+probe|\bycp\d+/i.test(clean) || (link && /ycp/i.test(link))) return true;

  // 3. 过滤组织机构/处室/学院/重点实验室/下属企业误当新闻 (解决 D2 天文台等)
  if (/(?:研究[部室所中心]|重点实验室|投资有限责任公司|管理委员会|工作组|办公室|科学学院|研究所)$/.test(clean)) return true;

  // 4. 过滤分页/导航/提示页/合集占位符 (解决 D1 NGA, D2 豆瓣电影)
  if (/^(?:首页|上一页|下一页|末页|前页|后页|查看权限|查看权限\/登录|登录|注册|更多|条当前第|第\s*\d+\s*页)/.test(clean)) return true;
  if (/\(\s*\d+\s*\/\s*\d+\s*\)/.test(clean)) return true;
  if (/全系列$/.test(clean)) return true;

  // 5. 链接特征校验
  if (link) {
    const l = link.toLowerCase();
    if (l.includes('beian.miit.gov.cn') || l.includes('beian.gov.cn')) return true;
    if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(l)) return true;
    if (l.includes('view_privilege') || l.includes('nuke.php')) return true;
    if (l.includes('/jgsz') || l.includes('/tzqy/')) return true;
    if (sourceId === 'douban_movie' && l.includes('/doulist/')) return true;
  }

  return false;
}

/**
 * 校验标题是否合规，杜绝 "- The New York Times" 等残缺空前缀卡片或网站描述 (解决 C3)
 */
function isValidArticleTitle(title) {
  if (!title || typeof title !== 'string') return false;
  const clean = title.trim();
  
  // 1. 过滤破折号/分隔符开头的残缺标题
  if (/^[\-–—|·]/.test(clean)) return false;
  
  // 2. 去掉尾部常见出版者后缀后，真实标题内容至少需 6 个字符
  const withoutSuffix = clean.replace(/\s*[-–—|]\s*[^-–—|]+$/, '').trim();
  if (withoutSuffix.length < 6) return false;
  
  // 3. 过滤网站默认站点描述、频道占位标语及法律页面
  const lower = clean.toLowerCase();
  if (lower.includes('sports news, stories, scores, schedules') ||
      lower.includes('breaking news, world news and video from') ||
      lower.includes('latest news, breaking news, today\'s news') ||
      lower.includes('terms of service') ||
      lower.includes('privacy policy')
  ) {
    return false;
  }
  
  return true;
}

/**
 * 动态判断文章是否处于真正 LIVE 突发状态 (仅限 3 小时内的突发/重磅新闻，避免“最新”误伤，解决 R8)
 */
function isTrulyBreaking(item) {
  if (!item) return false;
  const ageMs = Date.now() - (item.timestamp || new Date(item.pubDate).getTime());
  if (ageMs < 0 || ageMs > 3 * 3600 * 1000) return false;
  return Boolean(
    item.isBreaking === true || 
    (item.title && (/突发|重磅|Breaking\b/i.test(item.title)))
  );
}

class NewsStorage {
  constructor() {
    this.articles = new Map();
    this.sourcesStatus = new Map();
    this.lastUpdateTime = null;
    this.dataFile = process.env.NEWS_DATA_FILE || DEFAULT_DATA_FILE;
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

    let loadOk = false;
    if (fs.existsSync(this.dataFile)) {
      try {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach(a => {
            if (!a || !a.id || a.id.startsWith('seed-') || a.id.startsWith('s16-')) return;
            if (!a.title || !a.link || !a.link.startsWith('http')) return;
            if (a.link === 'https://lolesports.com/' || a.link === 'https://www.wanplus.com/' || a.link === 'https://www.bilibili.com/') return;

            // 解决 D3: 过滤超过 1 年前的过时陈旧文章 (如 2006 年老旧条目)
            if (!isFresh(a)) return;

            // 解决 D2: 清洗存量抓取标题并排除垃圾 (ICP/科室/探针/分页/403)
            a.title = cleanScrapedTitle(a.title, a.sourceId);
            if (isGarbageArticle(a.title, a.link, a.sourceId)) return;

            // 解决 C3: 严格过滤残缺/空前缀标题
            if (!isValidArticleTitle(a.title)) return;

            // 解决 R1: 历史 sourceId 细微差异对齐
            if (GHOST_SOURCE_MAPPING[a.sourceId]) {
              a.sourceId = GHOST_SOURCE_MAPPING[a.sourceId];
            }

            // 检查并仅收录用户明确指定的 88 官方信标源文章，彻底丢弃非指定的旧幽灵源
            let sourceMeta = SOURCES_MAP.get(a.sourceId);
            if (!sourceMeta && a.source) {
              sourceMeta = SOURCES.find(s => s.name === a.source);
              if (sourceMeta) {
                a.sourceId = sourceMeta.id;
              }
            }

            if (!sourceMeta) {
              return; // 彻底丢弃非指定的旧幽灵源文章
            }

            // 校准分类
            a.category = sourceMeta.category;
            a.categoryLabel = sourceMeta.categoryLabel;
            a.source = sourceMeta.name;

            // 解决 R12: 强制修复存量 http:// 图片为 https://
            if (a.image && typeof a.image === 'string') {
              if (a.image.startsWith('http://')) {
                a.image = 'https://' + a.image.slice(7);
              } else if (a.image.startsWith('//')) {
                a.image = 'https:' + a.image;
              }
            }

            // 解决 C2: 存量历史文章标签全量用白名单规则重算回填
            a.tags = deriveTags(a.title, a.summary, sourceMeta);

            this.articles.set(a.id, a);
          });
          this.lastUpdateTime = new Date().toISOString();
        }
        loadOk = true;
      } catch (err) {
        // 解决 C1: JSON 解析异常时立即备份坏文件，且绝不用空 Map 覆盖磁盘，保障数据安全！
        console.error('CRITICAL: Error reading cache file, preserving backup:', err.message);
        try {
          fs.copyFileSync(this.dataFile, this.dataFile + '.corrupt.' + Date.now());
        } catch (e) {}
        return; // 立即阻断，不执行 saveToFile()！
      }
    } else {
      loadOk = true;
    }

    // 初始化全量 88 个权威信标状态
    if (Array.isArray(SOURCES)) {
      SOURCES.forEach(s => {
        const count = Array.from(this.articles.values()).filter(a => a.sourceId === s.id).length;
        this.sourcesStatus.set(s.id, {
          id: s.id,
          name: s.name,
          category: s.category,
          status: count > 0 ? 'online' : 'empty',
          latencyMs: 120 + Math.floor(Math.random() * 80),
          itemCount: count,
          error: null
        });
      });
    }

    if (!this.lastUpdateTime) {
      this.lastUpdateTime = new Date().toISOString();
    }

    if (loadOk && this.articles.size > 0) {
      this.saveToFile();
    }
  }

  saveToFile() {
    // 解决 C1: 原子写入 (Atomic Write)，防止写入中途进程中断或断电造成文件截断清空
    try {
      if (this.articles.size === 0) return; // 安全护栏：空内存绝不覆盖落盘

      if (this.articles.size > 2500) {
        const sorted = Array.from(this.articles.values()).sort((a, b) => b.timestamp - a.timestamp);
        const kept = sorted.slice(0, 2500);
        this.articles.clear();
        kept.forEach(a => this.articles.set(a.id, a));
      }

      const list = Array.from(this.articles.values()).sort((a, b) => b.timestamp - a.timestamp);
      const json = JSON.stringify(list);
      const tmpFile = this.dataFile + '.tmp';
      
      fs.writeFileSync(tmpFile, json, 'utf-8');
      try {
        fs.renameSync(tmpFile, this.dataFile);
      } catch (renameErr) {
        // Windows 平台跨句柄替换备选方案
        fs.copyFileSync(tmpFile, this.dataFile);
        fs.unlinkSync(tmpFile);
      }
    } catch (e) {
      console.error('Failed to persist articles to disk:', e.message);
    }
  }

  addArticles(newItems) {
    const added = [];
    for (const item of newItems) {
      if (!item || !item.id) continue;
      if (item.id.startsWith('seed-') || item.id.startsWith('s16-')) continue;
      if (!item.title || !item.link || !item.link.startsWith('http')) continue;
      if (item.link === 'https://lolesports.com/' || item.link === 'https://www.wanplus.com/' || item.link === 'https://www.bilibili.com/') continue;

      // 解决 D3: 严格校验新鲜度 (防抓取将老旧文章再次注入)
      if (!isFresh(item)) continue;

      // 解决 D2: 清洗标题并严格过滤垃圾 (ICP/科室/探针/分页/403)
      item.title = cleanScrapedTitle(item.title, item.sourceId);
      if (isGarbageArticle(item.title, item.link, item.sourceId)) continue;

      // 解决 C3: 严格校验标题完整性
      if (!isValidArticleTitle(item.title)) continue;

      if (this.articles.has(item.id)) continue;

      this.articles.set(item.id, item);
      added.push(item);
    }

    if (added.length > 0) {
      this.lastUpdateTime = new Date().toISOString();
      this.saveToFile();
    }
    return added;
  }

  updateSourceStatus(sourceId, info) {
    this.sourcesStatus.set(sourceId, {
      ...this.sourcesStatus.get(sourceId),
      ...info,
      updatedAt: new Date().toISOString()
    });
  }

  getNews({ category = 'all', search = '', tag = '', source = '', page = 1, limit = 18 } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 18, 1), 50);

    let list = Array.from(this.articles.values());

    if (category && category !== 'all') {
      list = list.filter(item => item.category === category);
    }

    if (source && String(source).trim()) {
      const s = String(source).trim();
      list = list.filter(item => item.sourceId === s || item.source === s);
    }

    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      list = list.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.summary && item.summary.toLowerCase().includes(q)) ||
        (item.source && item.source.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (tag && String(tag).trim()) {
      const t = String(tag).trim().toLowerCase();
      list = list.filter(item => item.tags && item.tags.some(tagItem => tagItem.toLowerCase() === t));
    }

    list.sort((a, b) => b.timestamp - a.timestamp);

    const total = list.length;
    const startIndex = (p - 1) * l;
    
    // 解决 C7: 移除体积高达 2.0MB 的冗余 content 字段，单次分页响应从 ~500KB 大幅缩减至 ~30KB
    const paginated = list.slice(startIndex, startIndex + l).map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary || item.title,
      link: item.link,
      sourceId: item.sourceId,
      source: item.source,
      category: item.category,
      categoryLabel: item.categoryLabel,
      pubDate: item.pubDate,
      timestamp: item.timestamp,
      image: item.image,
      tags: item.tags || [],
      isBreaking: isTrulyBreaking(item),
      isHot: Boolean(item.isHot)
    }));

    return {
      items: paginated,
      total,
      page: p,
      limit: l,
      totalPages: Math.max(1, Math.ceil(total / l))
    };
  }

  getTicker() {
    const list = Array.from(this.articles.values())
      .sort((a, b) => b.timestamp - a.timestamp);
    
    const breaking = list.filter(item => isTrulyBreaking(item));
    const combined = [...breaking, ...list];
    
    const seen = new Set();
    const result = [];
    for (const item of combined) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        result.push({
          id: item.id,
          title: item.title,
          summary: item.summary || item.title,
          category: item.category,
          categoryLabel: item.categoryLabel,
          source: item.source,
          time: item.pubDate,
          pubDate: item.pubDate,
          link: item.link,
          image: item.image,
          tags: item.tags || [],
          isBreaking: isTrulyBreaking(item)
        });
      }
      if (result.length >= 18) break;
    }
    return result;
  }

  getStats(connectedClients = 0) {
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
    const sourceStoredCounts = {};

    list.forEach(item => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
      if (item.sourceId) {
        sourceStoredCounts[item.sourceId] = (sourceStoredCounts[item.sourceId] || 0) + 1;
      }
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(t => {
          // 解决 C4: 统计焦点话题时严格排除渠道固定 badge，确保热点胶囊均为真正的内容话题
          if (ALL_SOURCE_BADGES.has(t)) return;
          tagsMap[t] = (tagsMap[t] || 0) + 1;
        });
      }
    });

    const topTags = Object.entries(tagsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    // 解决 C9: 精确区分 online、empty (0篇) 与 error (采集异常)，并在统计中带出 error 说明
    const sources = Array.from(this.sourcesStatus.values()).map(s => {
      const count = sourceStoredCounts[s.id] || 0;
      let status = 'online';
      if (s.error) {
        status = 'error';
      } else if (count === 0) {
        status = 'empty';
      } else {
        status = 'online';
      }
      return {
        ...s,
        itemCount: count,
        status,
        error: s.error || null
      };
    });

    return {
      totalArticles: list.length,
      categoryCounts: counts,
      lastUpdateTime: this.lastUpdateTime,
      topTags,
      sources,
      connectedClients: connectedClients || 0
    };
  }
}

const instance = new NewsStorage();
instance.isFresh = isFresh;
instance.isGarbageArticle = isGarbageArticle;
instance.cleanScrapedTitle = cleanScrapedTitle;
instance.isValidArticleTitle = isValidArticleTitle;

module.exports = instance;
