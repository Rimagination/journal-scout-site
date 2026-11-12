(async () => {
  const set = (id, text) => { document.getElementById(id).textContent = text; };
  const id = new URLSearchParams(location.search).get('id') || '';
  try {
    if (!/^[a-f0-9]{16}$/.test(id)) throw new Error('invalid conference');
    const response = await fetch('./data/ccf-conferences.json?v=20261112-ccf');
    if (!response.ok) throw new Error('catalog unavailable');
    const catalog = await response.json();
    CCFConferences.setCatalog(catalog);
    const row = CCFConferences.byId(id);
    if (!row) throw new Error('conference not found');
    document.title = `${row.abbr || row.name} - Journal Scout`;
    set('title', row.name);
    set('subtitle', row.abbr ? `${row.abbr} · ${row.area}` : row.area);
    set('level', `CCF ${row.level}类会议`);
    document.getElementById('level').hidden = false;
    set('acronym', row.abbr || '—');
    set('area', row.area);
    set('edition', `${catalog.edition} 年${catalog.edition === 2026 ? '第七版' : '版'}`);
    set('page', `第 ${row.page} 页`);
  } catch {
    set('title', '暂时无法读取会议目录');
    set('subtitle', '请返回搜索，或稍后重试。');
  }
})();
