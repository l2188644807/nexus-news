/**
 * 智讯枢纽 (NEXUS PULSE) 智能标签推导引擎
 * 采用预编译正则 + 词边界 (\b) + 垂直分类白名单 (only)，彻底杜绝跨行业歧义误标 (解决 C2, C4, R14)
 */

const KEYWORDS_CONFIG = [
  // 1. 天文学 (限定 astronomy 分类，杜绝 fast break / fast food 误标)
  { tag: 'FAST天眼', keys: ['fast', '中国天眼', '脉冲星', '射电望远镜'], only: ['astronomy'] },
  { tag: '韦伯空间望远镜', keys: ['jwst', 'webb', '韦伯望远镜', '原星系'], only: ['astronomy'] },
  { tag: '欧空局ESA', keys: ['esa', '欧空局', '欧几里得', '盖亚'], only: ['astronomy'] },
  { tag: '系外行星', keys: ['exoplanet', '系外行星', '超级地球', '宜居带'], only: ['astronomy'] },
  { tag: '引力波与黑洞', keys: ['black hole', '黑洞', '引力波', 'gravitational wave'], only: ['astronomy'] },
  { tag: '深空探测', keys: ['nasa', '深空', '深空测轨', '行星探测', '小行星', '彗星'], only: ['astronomy'] },
  
  // 2. 实时电竞 (限定 esports 分类，杜绝手机 S16 发布会误标为英雄联盟)
  { tag: 'CS2', keys: ['cs2', 'counter-strike', 'hltv', 'cs2 major', 'cs major', 'navi', 'faze', 's1mple', 'zywoo'], only: ['esports'] },
  { tag: '英雄联盟', keys: ['lol', 'league of legends', 'lpl', 'lck', 'faker', 's14', 's15', 's16', '全球总决赛'], only: ['esports'] },
  { tag: '无畏契约', keys: ['valorant', 'vct', '无畏契约', '瓦罗兰特'], only: ['esports'] },
  
  // 3. 游戏前沿 (限定 gaming 分类，杜绝 steam expansion / electric switch 误标为 3A大作)
  { tag: '3A大作', keys: ['steam', 'ps5', 'xbox', 'switch', 'gta', '黑神话', '卡普空', '育碧', '任天堂'], only: ['gaming'] },
  
  // 4. 全球大事
  { tag: '国际政经', keys: ['联合国', '气候峰会', '总统', '首脑峰会', '外长会谈'], only: ['world'] },
  
  // 5. 体育竞技
  { tag: '欧冠足球', keys: ['欧冠', '英超', '西甲', '德甲', '意甲', '国足', '世界杯'], only: ['sports'] },
  { tag: 'NBA体坛', keys: ['nba', '篮球', '詹姆斯', '勇士', '湖人', '凯尔特人'], only: ['sports'] },
  
  // 6. 军事防务
  { tag: '军工防务', keys: ['防务', '隐身战机', '无人机', '航空母舰', '驱逐舰', '高超音速', '军演'], only: ['military'] },
  
  // 7. 教育资讯
  { tag: '招考研招', keys: ['考研', '高考', '高校', '大学招生', '教育部'], only: ['education'] },
  
  // 8. 娱乐圈
  { tag: '文娱独家', keys: ['明星', '演员', '恋情', '首谈', '家庭', '热搜'], only: ['entertainment'] },
  
  // 9. 影视文化
  { tag: '院线大片', keys: ['电影', '上映', '票房', '影评', '定档', '好莱坞', 'imax'], only: ['cinema', 'entertainment'] },
  
  // 10. 财经商业
  { tag: '宏观金融', keys: ['股市', '央行', '降息', '加息', '美元汇率', '贸易顺差', '通胀率', 'a股', '港股', '美股'], only: ['finance'] },
  
  // 11. 科技前沿 (限定科技/财经，杜绝 UFC 'Main Card' 误贴)
  { tag: 'AI前沿', keys: ['ai', '大模型', 'gpt', 'openai', '生成式ai', '芯片', '算力', 'deepseek', 'anthropic', 'llm'], only: ['tech', 'finance'] }
];

// 启动时一次性预编译所有英文边界规则
const COMPILED_RULES = KEYWORDS_CONFIG.map(rule => {
  const chineseKeys = rule.keys.filter(k => /[\u4e00-\u9fa5]/.test(k));
  const englishKeys = rule.keys.filter(k => !/[\u4e00-\u9fa5]/.test(k));
  
  const regex = englishKeys.length > 0
    ? new RegExp(`\\b(${englishKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i')
    : null;

  return {
    tag: rule.tag,
    only: rule.only || null,
    chineseKeys,
    regex
  };
});

function deriveTags(title = '', summary = '', source = {}) {
  const text = (String(title) + ' ' + String(summary)).toLowerCase();
  const category = (source && source.category) || '';
  const tags = new Set();

  // 注意：不再将渠道元数据 badge 作为内容 tag 注入，保持内容标签 100% 为真实行业主题 (解决 C4)

  for (const rule of COMPILED_RULES) {
    // 白名单分类过滤 (解决 C2: 彻底消除 fast break 误标天眼、switch 误标游戏、s16 误标总决赛等)
    if (rule.only && (!category || !rule.only.includes(category))) {
      continue;
    }

    let matched = false;
    for (const ck of rule.chineseKeys) {
      if (text.includes(ck)) {
        matched = true;
        break;
      }
    }
    if (!matched && rule.regex && rule.regex.test(text)) {
      matched = true;
    }
    if (matched) {
      tags.add(rule.tag);
    }
  }

  return Array.from(tags).slice(0, 4);
}

module.exports = {
  deriveTags,
  KEYWORDS_CONFIG
};
