const { createApp, ref, computed, onMounted, nextTick } = Vue;

createApp({
  setup() {
    const articles = ref([]);
    const tickerItems = ref([]);
    const sourcesList = ref([]);
    const showAllSources = ref(false);
    const showMobileSearch = ref(false);
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
      connectedClients: 1
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
      return d.toLocaleString('zh-CN', { hour12: false });
    };

    const refreshIcons = () => {
      nextTick(() => {
        if (window.lucide) {
          window.lucide.createIcons();
        }
      });
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
      try {
        const params = new URLSearchParams({
          category: currentCategory.value,
          source: selectedSource.value,
          search: searchQuery.value,
          tag: selectedTag.value,
          page: currentPage.value,
          limit: 18
        });

        const res = await fetch(`/api/news?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          articles.value = data.data.items;
          totalCount.value = data.data.total;
          totalPages.value = data.data.totalPages || 1;
          pendingNewCount.value = 0;
        }
      } catch (err) {
        console.error('Fetch news error:', err);
        showToast('获取新闻流失败，请重试', 'error');
      } finally {
        isLoading.value = false;
        refreshIcons();
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
      } finally {
        refreshIcons();
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.success) {
          stats.value = data.data;
          sourcesList.value = data.data.sources || [];
        }
      } catch (err) {
        console.error('Fetch stats error:', err);
      }
    };

    const forceRefresh = async () => {
      if (isRefreshing.value) return;
      isRefreshing.value = true;
      showToast('正在向全网 88 个权威媒体与空间天文机构发起全网并发采集...', 'info');

      try {
        const res = await fetch('/api/news/refresh', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast(`采集完成！${data.message}`, 'success');
          await fetchNews(true);
          await fetchTicker();
          await fetchStats();
        } else {
          showToast(`刷新失败: ${data.error}`, 'error');
        }
      } catch (err) {
        showToast('网络错误，无法触发抓取', 'error');
      } finally {
        isRefreshing.value = false;
        refreshIcons();
      }
    };

    const initSSE = () => {
      const evtSource = new EventSource('/api/stream');

      evtSource.addEventListener('connected', () => {
        sseConnected.value = true;
        console.log('[SSE] 已连接到智讯枢纽实时推送管道');
      });

      evtSource.addEventListener('new_articles', (event) => {
        try {
          const payload = JSON.parse(event.data);
          pendingNewCount.value += payload.count;
          showToast(`🔔 刚刚收到 ${payload.count} 条最新指定渠道快讯！`, 'success');
          fetchStats();
        } catch (e) {
          console.error('[SSE] Parse new_articles error:', e);
        }
      });

      evtSource.addEventListener('ticker_update', (event) => {
        try {
          const payload = JSON.parse(event.data);
          tickerItems.value = payload;
          refreshIcons();
        } catch (e) {
          console.error('[SSE] Parse ticker_update error:', e);
        }
      });

      evtSource.addEventListener('stats_update', (event) => {
        try {
          const payload = JSON.parse(event.data);
          stats.value = payload;
        } catch (e) {
          console.error('[SSE] Parse stats_update error:', e);
        }
      });

      evtSource.onerror = () => {
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
      selectedArticle.value = article;
      document.body.style.overflow = 'hidden';
      refreshIcons();
    };

    const closeArticle = () => {
      selectedArticle.value = null;
      document.body.style.overflow = '';
      refreshIcons();
    };

    const copyLink = (link) => {
      navigator.clipboard.writeText(link || window.location.href);
      showToast('原文链接已复制到剪贴板！', 'success');
    };

    const toggleTheme = () => {
      darkMode.value = !darkMode.value;
      if (darkMode.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      refreshIcons();
    };

    const startClock = () => {
      const update = () => {
        const now = new Date();
        currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false });
      };
      update();
      setInterval(update, 1000);
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

    onMounted(async () => {
      document.documentElement.classList.remove('dark');
      startClock();
      await fetchNews();
      await fetchTicker();
      await fetchStats();
      initSSE();
      refreshIcons();
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
      availableCategorySources,
      topFocusedTags,
      hasActiveFilters,
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
      toggleTheme
    };
  }
}).mount('#app');
