const { createApp, ref, computed, onMounted, onBeforeUnmount } = Vue;

const app = createApp({
  setup() {
    const articles = ref([]);
    const tickerItems = ref([]);
    const sourcesList = ref([]);
    const showAllSources = ref(false);
    const showMobileSearch = ref(false);
    const astronomySpotlight = ref([]);
    const sportsSpotlight = ref([]);

    const stats = ref({
      totalArticles: 0,
      categoryCounts: {
        all: 0,
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
      },
      lastUpdateTime: null,
      topTags: [],
      sources: [],
      connectedClients: 0
    });

    const currentCategory = ref('all');
    const selectedSource = ref('');
    const searchQuery = ref('');
    const selectedTag = ref('');
    const currentPage = ref(1);
    const totalPages = ref(1);
    const totalCount = ref(0);

    const isLoading = ref(false);
    const isRefreshing = ref(false);
    const sseConnected = ref(false);
    const darkMode = ref(false);
    const selectedArticle = ref(null);
    const toast = ref({ show: false, message: '', type: 'info' });
    const pendingNewCount = ref(0);
    const currentTime = ref('');

    let clockTimer = null;
    let sseSource = null;
    let newsAbortController = null;

    // 11 大核心板块配置 (含全新天文学模块)
    const categories = [
      { id: 'all', label: '全部要闻', icon: 'flame' },
      { id: 'astronomy', label: '天文学', icon: 'telescope' },
      { id: 'esports', label: '实时电竞', icon: 'trophy' },
      { id: 'gaming', label: '游戏前沿', icon: 'gamepad-2' },
      { id: 'world', label: '全球大事', icon: 'globe' },
      { id: 'sports', label: '体育竞技', icon: 'activity' },
      { id: 'military', label: '军事防务', icon: 'shield' },
      { id: 'education', label: '教育资讯', icon: 'graduation-cap' },
      { id: 'entertainment', label: '娱乐圈', icon: 'sparkles' },
      { id: 'cinema', label: '影视文化', icon: 'clapperboard' },
      { id: 'finance', label: '财经商业', icon: 'trending-up' },
      { id: 'tech', label: '科技前沿', icon: 'cpu' }
    ];

    const timeAgo = (dateStr) => {
      if (!dateStr) return '刚刚';
      const now = Date.now();
      const past = new Date(dateStr).getTime();
      const diffMs = now - past;
      if (diffMs < 0 || isNaN(diffMs)) return '刚刚';

      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${diffSec}秒前`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}分钟前`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}小时前`;
      const diffDay = Math.floor(diffHour / 24);
      return `${diffDay}天前`;
    };

    const formatFullTime = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '' : d.toLocaleString('zh-CN', { hour12: false });
    };

    const showToast = (message, type = 'info') => {
      toast.value = { show: true, message, type };
      setTimeout(() => {
        toast.value.show = false;
      }, 4000);
    };

    const fetchNews = async (resetPage = false) => {
      if (resetPage) currentPage.value = 1;
      isLoading.value = true;

      // 竞态保护：取消旧的未完成请求 (解决 P2-27)
      if (newsAbortController) {
        newsAbortController.abort();
      }
      newsAbortController = new AbortController();

      try {
        const params = new URLSearchParams({
          category: currentCategory.value,
          source: selectedSource.value,
          search: searchQuery.value,
          tag: selectedTag.value,
          page: currentPage.value,
          limit: 18
        });

        const res = await fetch(`/api/news?${params.toString()}`, {
          signal: newsAbortController.signal
        });
        const data = await res.json();
        if (data.success) {
          articles.value = data.data.items;
          totalCount.value = data.data.total;
          totalPages.value = data.data.totalPages || 1;
          pendingNewCount.value = 0;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Fetch news error:', err);
        showToast('获取新闻流失败，请重试', 'error');
      } finally {
        isLoading.value = false;
      }
    };

    const fetchTicker = async () => {
      try {
        const res = await fetch('/api/ticker');
        const data = await res.json();
        if (data.success) {
          tickerItems.value = data.data;
        }
      } catch (err) {
        console.error('Fetch ticker error:', err);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.success) {
          stats.value = {
            ...stats.value,
            ...data.data,
            connectedClients: data.data.connectedClients !== undefined ? data.data.connectedClients : stats.value.connectedClients
          };
          sourcesList.value = data.data.sources || [];
        }
      } catch (err) {
        console.error('Fetch stats error:', err);
      }
    };

    const fetchSpotlights = async () => {
      try {
        const [astroRes, sportRes] = await Promise.allSettled([
          fetch('/api/news?category=astronomy&limit=4'),
          fetch('/api/news?category=esports&limit=4')
        ]);

        if (astroRes.status === 'fulfilled') {
          const astroData = await astroRes.value.json();
          if (astroData.success) astronomySpotlight.value = astroData.data.items || [];
        }
        if (sportRes.status === 'fulfilled') {
          const sportData = await sportRes.value.json();
          if (sportData.success) sportsSpotlight.value = sportData.data.items || [];
        }
      } catch (e) {
        console.error('Spotlight fetch error:', e);
      }
    };

    const forceRefresh = async () => {
      if (isRefreshing.value) return;
      isRefreshing.value = true;
      showToast(`正在向全网 ${totalSourcesCount.value} 个权威媒体与空间天文机构发起并发采集...`, 'info');

      try {
        const res = await fetch('/api/news/refresh', { method: 'POST' });
        const data = await res.json();
        if (res.status === 409 || (data.skipped && res.status !== 429)) {
          showToast('全网资讯并发采集正在后台进行中，数据即将自动同步...', 'info');
          await fetchNews();
          await fetchTicker();
          await fetchStats();
          await fetchSpotlights();
        } else if (res.status === 429) {
          showToast(data.error || '刷新过于频繁，请稍候片刻再试（15秒冷却）', 'warning');
        } else if (data.success) {
          showToast(`采集完成！${data.message}`, 'success');
          await fetchNews(true);
          await fetchTicker();
          await fetchStats();
          await fetchSpotlights();
        } else {
          showToast(`刷新失败: ${data.error || '请求受限'}`, 'error');
        }
      } catch (err) {
        showToast('网络错误，无法触发抓取', 'error');
      } finally {
        isRefreshing.value = false;
      }
    };

    const initSSE = () => {
      if (sseSource) {
        sseSource.close();
      }
      sseSource = new EventSource('/api/stream');

      sseSource.addEventListener('connected', () => {
        sseConnected.value = true;
      });

      sseSource.addEventListener('new_articles', (event) => {
        try {
          const payload = JSON.parse(event.data);
          pendingNewCount.value += payload.count;
          showToast(`🔔 刚刚收到 ${payload.count} 条最新指定渠道快讯！`, 'success');
          fetchStats();
          fetchSpotlights();
        } catch (e) {
          console.error('[SSE] Parse new_articles error:', e);
        }
      });

      sseSource.addEventListener('ticker_update', (event) => {
        try {
          const payload = JSON.parse(event.data);
          tickerItems.value = payload;
        } catch (e) {
          console.error('[SSE] Parse ticker_update error:', e);
        }
      });

      sseSource.addEventListener('stats_update', (event) => {
        try {
          const payload = JSON.parse(event.data);
          // 增量合并，防止冲掉 connectedClients 或 categoryCounts (解决 P0-5)
          stats.value = {
            ...stats.value,
            ...payload,
            connectedClients: payload.connectedClients !== undefined ? payload.connectedClients : stats.value.connectedClients
          };
        } catch (e) {
          console.error('[SSE] Parse stats_update error:', e);
        }
      });

      sseSource.onerror = () => {
        sseConnected.value = false;
      };
    };

    const setCategory = (catId) => {
      currentCategory.value = catId;
      selectedSource.value = '';
      selectedTag.value = '';
      fetchNews(true);
    };

    const onSourceChange = () => {
      fetchNews(true);
    };

    const toggleTag = (tagName) => {
      if (selectedTag.value === tagName) {
        selectedTag.value = '';
      } else {
        selectedTag.value = tagName;
      }
      fetchNews(true);
    };

    let searchTimer = null;
    const onSearchInput = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        fetchNews(true);
      }, 400);
    };

    const clearAllFilters = () => {
      searchQuery.value = '';
      selectedSource.value = '';
      selectedTag.value = '';
      fetchNews(true);
    };

    const changePage = (newPage) => {
      if (newPage < 1 || newPage > totalPages.value) return;
      currentPage.value = newPage;
      fetchNews();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openArticle = (article) => {
      if (!article) return;
      // 容错：若点击的是跑马灯精简对象，优先从现有列表匹配全字段数据 (解决 P0-4)
      const full = articles.value.find(a => a.id === article.id);
      selectedArticle.value = full || article;
      document.body.style.overflow = 'hidden';
    };

    const closeArticle = () => {
      selectedArticle.value = null;
      document.body.style.overflow = '';
    };

    const quickFilterSource = (sourceId) => {
      selectedSource.value = sourceId;
      searchQuery.value = '';
      selectedTag.value = '';
      fetchNews(true);
    };

    const copyLink = async (link) => {
      const text = link || window.location.href;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // 局域网 HTTP 下的剪贴板降级机制 (解决 P2 copyLink 失败)
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        showToast('原文链接已复制到剪贴板！', 'success');
      } catch (err) {
        showToast('请手动复制链接', 'info');
      }
    };

    const toggleTheme = () => {
      darkMode.value = !darkMode.value;
      if (darkMode.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    const startClock = () => {
      const update = () => {
        const now = new Date();
        currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false });
      };
      update();
      clockTimer = setInterval(update, 1000);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedArticle.value) {
        closeArticle();
      }
    };

    const heroArticle = computed(() => {
      if (articles.value.length === 0) return null;
      return articles.value.find(a => a.isBreaking || a.isHot) || articles.value[0];
    });

    const feedArticles = computed(() => {
      if (articles.value.length === 0) return [];
      if (!heroArticle.value) return articles.value;
      return articles.value.filter(a => a.id !== heroArticle.value.id);
    });

    const availableCategorySources = computed(() => {
      if (!stats.value.sources) return [];
      if (currentCategory.value === 'all') return stats.value.sources;
      return stats.value.sources.filter(s => s.category === currentCategory.value);
    });

    const topFocusedTags = computed(() => {
      if (!stats.value.topTags) return [];
      return stats.value.topTags.slice(0, 6);
    });

    const hasActiveFilters = computed(() => {
      return Boolean(selectedSource.value || selectedTag.value || searchQuery.value);
    });

    const selectedSourceName = computed(() => {
      if (!selectedSource.value) return '';
      const found = (stats.value.sources || []).find(s => s.id === selectedSource.value);
      return found ? found.name : selectedSource.value;
    });

    // 动态信标状态与通道数据计算 (解决 P1-11 写死 88 信标全通道运转)
    const onlineSourcesCount = computed(() => {
      return (stats.value.sources || []).filter(s => s.status === 'online').length;
    });

    const totalSourcesCount = computed(() => {
      return (stats.value.sources || []).length || 79;
    });

    const isAllChannelsOnline = computed(() => {
      return totalSourcesCount.value > 0 && onlineSourcesCount.value === totalSourcesCount.value;
    });

    onMounted(async () => {
      document.documentElement.classList.remove('dark');
      startClock();
      window.addEventListener('keydown', handleKeyDown);
      await fetchNews();
      await fetchTicker();
      await fetchStats();
      await fetchSpotlights();
      initSSE();
    });

    onBeforeUnmount(() => {
      if (clockTimer) clearInterval(clockTimer);
      if (sseSource) sseSource.close();
      if (newsAbortController) newsAbortController.abort();
      window.removeEventListener('keydown', handleKeyDown);
    });

    return {
      articles,
      heroArticle,
      feedArticles,
      tickerItems,
      stats,
      sourcesList,
      categories,
      currentCategory,
      selectedSource,
      selectedSourceName,
      searchQuery,
      selectedTag,
      currentPage,
      totalPages,
      totalCount,
      isLoading,
      isRefreshing,
      sseConnected,
      darkMode,
      selectedArticle,
      toast,
      pendingNewCount,
      currentTime,
      showAllSources,
      showMobileSearch,
      astronomySpotlight,
      sportsSpotlight,
      availableCategorySources,
      topFocusedTags,
      hasActiveFilters,
      onlineSourcesCount,
      totalSourcesCount,
      isAllChannelsOnline,
      timeAgo,
      formatFullTime,
      fetchNews,
      forceRefresh,
      setCategory,
      onSourceChange,
      toggleTag,
      onSearchInput,
      clearAllFilters,
      changePage,
      openArticle,
      closeArticle,
      copyLink,
      quickFilterSource,
      toggleTheme
    };
  }
});

// 注册纯原生 NexusIcon 组件，根治 lucide DOM 吃掉/脱离 VDOM 缺陷 (解决 P0-3)
app.component('icon', NexusIcon);
app.mount('#app');
