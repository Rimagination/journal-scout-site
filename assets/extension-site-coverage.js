(() => {
  const section = document.getElementById('site-coverage');
  if (!section) return;

  const scroll = document.getElementById('site-coverage-scroll');
  const rows = document.getElementById('site-coverage-rows');
  const input = document.getElementById('site-coverage-search');
  const status = document.getElementById('site-coverage-status');
  const more = document.getElementById('site-coverage-more');
  const retry = document.getElementById('site-coverage-retry');
  const categories = [...section.querySelectorAll('[data-coverage-language]')];
  const manualVersion = document.querySelector('meta[name="journal-scout-manual-version"]')?.content;
  const batchSize = 20;
  let sites = null;
  let filtered = [];
  let rendered = 0;
  let lastLanguage = '';
  let language = 'all';
  let loading = null;

  function setStatus() {
    status.textContent = filtered.length
      ? `已显示 ${rendered} / ${filtered.length} 个网站`
      : '没有找到符合条件的网站。';
    more.hidden = rendered >= filtered.length;
  }

  function renderMore() {
    if (!sites || rendered >= filtered.length) return;
    const fragment = document.createDocumentFragment();
    const end = Math.min(rendered + batchSize, filtered.length);
    for (const site of filtered.slice(rendered, end)) {
      if (site.language !== lastLanguage) {
        const group = document.createElement('tr');
        group.className = 'site-coverage__group';
        const heading = document.createElement('th');
        heading.colSpan = 3;
        heading.scope = 'rowgroup';
        heading.textContent = site.language === 'zh' ? '中文网站' : '英文网站';
        group.append(heading);
        fragment.append(group);
        lastLanguage = site.language;
      }
      const row = document.createElement('tr');
      const siteCell = document.createElement('td');
      const link = document.createElement('a');
      const host = site.hosts.includes('scholar.google.com') ? 'scholar.google.com' : site.hosts[0].replace(/^\*\./, '');
      link.href = `https://${host}/`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = site.name;
      const domain = document.createElement('span');
      domain.className = 'site-coverage__domain';
      domain.textContent = site.hosts.length > 1 ? `${host} 等` : host;
      siteCell.append(link, domain);
      const pages = document.createElement('td');
      pages.textContent = site.pages;
      const note = document.createElement('td');
      note.textContent = site.note || '部分页面可识别。';
      row.append(siteCell, pages, note);
      fragment.append(row);
    }
    rows.append(fragment);
    rendered = end;
    setStatus();
  }

  function filterSites() {
    if (!sites) return;
    const terms = input.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    filtered = sites.filter(site => {
      if (language !== 'all' && site.language !== language) return false;
      const searchable = [site.name, ...site.hosts, site.pages, site.note, site.keywords].join(' ').toLocaleLowerCase();
      return terms.every(term => searchable.includes(term));
    });
    rows.replaceChildren();
    rendered = 0;
    lastLanguage = '';
    scroll.scrollTop = 0;
    if (!filtered.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = '试试其他网站名称或域名。';
      row.append(cell);
      rows.append(row);
    }
    renderMore();
    setStatus();
  }

  function validSite(site) {
    return site && ['zh', 'en'].includes(site.language) && typeof site.name === 'string' &&
      typeof site.pages === 'string' && typeof site.note === 'string' && typeof site.keywords === 'string' &&
      Array.isArray(site.hosts) && site.hosts.length > 0 &&
      site.hosts.every(host => typeof host === 'string' && /^(?:\*\.)?[a-z0-9.-]+$/i.test(host));
  }

  function loadSites() {
    if (sites) return Promise.resolve();
    if (loading) return loading;
    status.textContent = '正在加载网站目录…';
    retry.hidden = true;
    loading = fetch('./data/extension-site-coverage.json?v=20261112-v010')
      .then(response => {
        if (!response.ok) throw new Error('Coverage data unavailable');
        return response.json();
      })
      .then(data => {
        if (data.manualVersion !== manualVersion || !Array.isArray(data.sites) || !data.sites.length || !data.sites.every(validSite)) {
          throw new Error('Invalid coverage data');
        }
        sites = data.sites;
        filterSites();
      })
      .catch(() => {
        status.textContent = '网站目录加载失败，请重试。';
        retry.hidden = false;
      })
      .finally(() => { loading = null; });
    return loading;
  }

  input.addEventListener('focus', loadSites);
  input.addEventListener('input', async () => { await loadSites(); filterSites(); });
  categories.forEach(button => button.addEventListener('click', async () => {
    language = button.dataset.coverageLanguage;
    categories.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    await loadSites();
    filterSites();
  }));
  more.addEventListener('click', renderMore);
  retry.addEventListener('click', loadSites);

  if ('IntersectionObserver' in window) {
    const pageObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      pageObserver.disconnect();
      void loadSites();
    }, { rootMargin: '400px' });
    pageObserver.observe(section);
    const rowObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) renderMore();
    }, { root: scroll, rootMargin: '0px 0px 120px 0px' });
    rowObserver.observe(more);
  } else {
    void loadSites();
    scroll.addEventListener('scroll', () => {
      if (scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 120) renderMore();
    }, { passive: true });
  }
})();
