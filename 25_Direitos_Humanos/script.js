(() => {
  const root = document.documentElement;
  const navToggle = document.querySelector('#navToggle');
  const nav = document.querySelector('#mainNav');
  const themeToggle = document.querySelector('#themeToggle');
  const progressBar = document.querySelector('#progressBar');
  const searchInput = document.querySelector('#conductSearch');
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const cards = [...document.querySelectorAll('.conduct-card')];
  const resultsStatus = document.querySelector('#resultsStatus');
  const emptyState = document.querySelector('#emptyState');
  const clearSearch = document.querySelector('#clearSearch');
  let activeFilter = 'all';

  const preferenceKey = 'antigravity:a11y:v1';
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)');
  let a11yPrefs = { theme: 'dark' };

  try {
    const shared = JSON.parse(localStorage.getItem(preferenceKey) || 'null');
    const legacyTheme = localStorage.getItem('direitos-humanos-theme');
    if (shared && typeof shared === 'object' && ['system', 'light', 'dark'].includes(shared.theme)) {
      a11yPrefs = { ...a11yPrefs, ...shared };
    } else if (legacyTheme === 'light' || legacyTheme === 'dark') {
      a11yPrefs.theme = legacyTheme;
    }
  } catch (_) {
    a11yPrefs = { theme: 'dark' };
  }

  const resolveTheme = () => a11yPrefs.theme === 'system'
    ? (systemTheme.matches ? 'light' : 'dark')
    : a11yPrefs.theme;

  const syncTheme = () => {
    const resolvedTheme = resolveTheme();
    root.dataset.theme = resolvedTheme;
    themeToggle?.setAttribute('aria-pressed', String(resolvedTheme === 'light'));
    themeToggle?.setAttribute(
      'aria-label',
      resolvedTheme === 'light' ? 'Ativar visualização escura' : 'Ativar visualização clara'
    );
  };

  syncTheme();

  themeToggle?.addEventListener('click', () => {
    a11yPrefs.theme = resolveTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(preferenceKey, JSON.stringify(a11yPrefs));
    localStorage.setItem('direitos-humanos-theme', a11yPrefs.theme);
    syncTheme();
  });

  systemTheme.addEventListener?.('change', syncTheme);
  systemTheme.addListener?.(syncTheme);

  navToggle?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  const normalize = (value) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const applyFilters = () => {
    const query = normalize(searchInput.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const contexts = card.dataset.context.split(' ');
      const haystack = normalize(`${card.dataset.search} ${card.textContent}`);
      const matchesContext = activeFilter === 'all' || contexts.includes(activeFilter);
      const matchesSearch = !query || haystack.includes(query);
      const visible = matchesContext && matchesSearch;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    resultsStatus.textContent = `${visibleCount} ${visibleCount === 1 ? 'conduta exibida' : 'condutas exibidas'}`;
    emptyState.hidden = visibleCount !== 0;
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      applyFilters();
    });
  });

  searchInput?.addEventListener('input', applyFilters);
  clearSearch?.addEventListener('click', () => {
    searchInput.value = '';
    activeFilter = 'all';
    filterButtons.forEach((item) => {
      const active = item.dataset.filter === 'all';
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
    searchInput.focus();
  });

  const updateProgress = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
    progressBar.style.width = `${progress}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px' });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
  }
})();
