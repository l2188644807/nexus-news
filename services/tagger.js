/**
 * 智讯枢纽 (NEXUS PULSE) 智能标签推导引擎
 * 采用预编译正则与单词边界 (\b)，杜绝循环内重复编译，彻底消除短词误伤 (解决 R2, R10, R14)
 */

const KEYWORDS_CONFIG = [
  // 1. 天文学
  { tag: 'FAST天眼', keys: ['fast', '中国天眼', '脉冲星', '射电望远镜'] },
  { tag: '韦伯空间望远镜', keys: ['jwst', 'webb', '韦伯望远镜', '原星系'] },
  { tag: '欧空局ESA', keys: ['esa', '欧空局', '欧几里得', '盖亚'] },
  { tag: '系外行星', keys: ['exoplanet', '系外行星', '超级地球', '宜居带'] },
  { tag: '引力波与黑洞', keys: ['black hole', '黑洞', '引力波', 'gravitational wave'] },
  { tag: '深空探测', keys: ['nasa', '深空', '深空测轨', '行星探测', '小行星', '彗星'] },
  
  // 2. 实时电竞 (避免普通英文 major 误伤)
  { tag: 'CS2', keys: ['cs2', 'counter-strike', 'hltv', 'cs2 major', 'cs major', 'navi', 'faze', 's1mple', 'zywoo'] },
  { tag: '英雄联盟', keys: ['lol', 'league of legends', 'lpl', 'lck', 'faker', 's14', 's15', 's16', '全球总决赛'] },
  { tag: '无畏契约', keys: ['valorant', 'vct', '无畏契约', '瓦罗兰特'] },
  
  // 3. 游戏前沿
  { tag: '3A大作', keys: ['steam', 'ps5', 'xbox', 'switch', 'gta', '黑神话', '卡普空', '育碧', '任天堂'] },
  
  // 4. 全球大事
  { tag: '国际政经', keys: ['联合国', '气候峰会', '总统', '首脑峰会', '外长会谈'] },
  
  // 5. 体育竞技
  { tag: '欧冠足球', keys: ['欧冠', '英超', '西甲', '德甲', '意甲', '国足', '世界杯'] },
  { tag: 'NBA体坛', keys: ['nba', '篮球', '詹姆斯', '勇士', '湖人', '凯尔特人'] },
  
  // 6. 军事防务
  { tag: '军工防务', keys: ['防务', '隐身战机', '无人机', '航空母舰', '驱逐舰', '高超音速', '军演'] },
  
  // 7. 教育资讯
  { tag: '招考研招', keys: ['考研', '高考', '高校', '大学招生', '教育部'] },
  
  // 8. 娱乐圈
  { tag: '文娱独家', keys: ['明星', '演员', '恋情', '首谈', '家庭', '热搜'] },
  
  // 9. 影视文化
  { tag: '院线大片', keys: ['电影', '上映', '票房', '影评', '定档', '好莱坞', 'imax'] },
  
  // 10. 财经商业
  { tag: '宏观金融', keys: ['股市', '央行', '降息', '加息', '美元汇率', '贸易顺差', '通胀率', 'a股', '港股', '美股'] },
  
  // 11. 科技前沿 (严格限定词边界，防止 Main Card / Maintain 中的 ai 误判)
  { tag: 'AI前沿', keys: ['ai', '大模型', 'gpt', 'openai', '生成式ai', '芯片', '算力', 'deepseek', 'anthropic', 'llm'] }
];

// 启动时一次性预编译所有英文边界规则，0 次循环内编译
const COMPILED_RULES = KEYWORDS_CONFIG.map(rule => {
  const chineseKeys = rule.keys.filter(k => /[\u4e00-\u9fa5]/.test(k));
  const englishKeys = rule.keys.filter(k => !/[\u4e00-\u9fa5]/.test(k));
  
  const regex = englishKeys.length > 0
    ? new RegExp(`\\b(${englishKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i')
    : null;

  return {
    tag: rule.tag,
    chineseKeys,
    regex
  };
});

function deriveTags(title = '', summary = '', source = {}) {
  const text = (String(title) + ' ' + String(summary)).toLowerCase();
  const tags = new Set();

  if (source && source.badge) {
    tags.add(source.badge);
  }

  for (const rule of COMPILED_RULES) {
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
