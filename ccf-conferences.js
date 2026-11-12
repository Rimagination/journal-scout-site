(() => {
  let catalog = { schemaVersion: 1, edition: 0, entries: [] };
  let index = new Map();
  const text = value => String(value || '').normalize('NFKC').trim();
  const key = value => text(value).toLowerCase().replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
  const cleaned = value => text(value)
    .replace(/^proceedings\s+of\s+(?:the\s+)?/i, '')
    .replace(/^(?:19|20)\d{2}\s+/i, '')
    .replace(/^(?:the\s+)?(?:\d{1,3}(?:st|nd|rd|th)\s+)?/i, '')
    .replace(/\s*[(（]?\b(?:19|20)\d{2}\b[)）]?\s*$/i, '').trim();

  function setCatalog(value) {
    if (!value || value.schemaVersion !== 1 || !Number.isInteger(value.edition) ||
        value.edition < 2020 || value.edition > 2100 || !Array.isArray(value.entries) ||
        !value.entries.length || value.entries.length > 2000) throw new Error('Invalid CCF conference catalog');
    const next = new Map();
    const ids = new Set();
    const add = (name, record) => {
      const normalized = key(name);
      if (!normalized) return;
      if (!next.has(normalized)) next.set(normalized, new Set());
      next.get(normalized).add(record);
    };
    for (const row of value.entries) {
      if (!row || typeof row.id !== 'string' || !/^[a-f0-9]{16}$/.test(row.id) || ids.has(row.id) ||
          typeof row.name !== 'string' || !row.name.trim() || row.name.length > 300 ||
          typeof row.abbr !== 'string' || row.abbr.length > 100 ||
          !['A', 'B', 'C'].includes(row.level) || typeof row.area !== 'string' || row.area.length > 150 ||
          !Array.isArray(row.aliases) || row.aliases.length > 10 || row.aliases.some(a => typeof a !== 'string' || a.length > 300)) {
        throw new Error('Invalid CCF conference entry');
      }
      ids.add(row.id);
      for (const name of [row.name, row.abbr, ...row.aliases]) {
        add(name, row);
        add(cleaned(name), row);
      }
    }
    catalog = value;
    index = next;
    return value.entries.length;
  }

  function match(...hints) {
    const inputs = hints.flat().map(text).filter(Boolean).slice(0, 3);
    if (!inputs.length || inputs.some(value => value.length > 500 || /\.\.\.|…/.test(value))) return null;
    let candidates = null;
    for (const value of inputs) {
      const normalized = key(cleaned(value));
      let found = index.get(normalized);
      // Common proceedings titles append the official acronym in parentheses.
      // Require both the acronym and a strong overlap with the full name.
      if (!found) {
        const suffix = value.match(/[（(]([A-Za-z][A-Za-z0-9 &+./-]{1,30})[）)]\s*$/);
        const possible = suffix && index.get(key(suffix[1]));
        if (possible) {
          const stop = new Set(['the', 'of', 'on', 'and', 'international', 'conference', 'symposium', 'proceedings', 'annual', 'ieee', 'acm']);
          const tokens = input => new Set(key(input).split(' ').filter(word => word.length > 2 && !stop.has(word) && !/^\d+$/.test(word)));
          const observed = tokens(value);
          const matches = [...possible].filter(row => {
            const expected = tokens(row.name);
            const common = [...expected].filter(word => observed.has(word)).length;
            return expected.size >= 3 && common >= 3 && common / expected.size >= 0.8;
          });
          if (matches.length) found = new Set(matches);
        }
      }
      // A workshop or other companion event is not the main conference. An
      // independently listed workshop can still match its own full name.
      if (/\b(?:workshop|workshops|demo|short paper|findings|companion)\b/i.test(value) &&
          !(found && [...found].some(row => key(row.name) === normalized))) return null;
      if (!found) continue;
      candidates = candidates ? new Set([...candidates].filter(row => found.has(row))) : new Set(found);
      if (!candidates.size) return null;
    }
    if (candidates?.size !== 1) return null;
    const record = candidates.values().next().value;
    return { title: record.name, venueType: 'conference', conferenceId: record.id, acronym: record.abbr,
      ccf_records: [{ year: String(catalog.edition), area: record.area, category: '推荐国际学术会议', level: `${record.level}类` }],
      tags: [], source: catalog.source, sourcePage: record.page };
  }

  function search(query, limit = 12) {
    const q = key(query);
    if (q.length < 2) return [];
    return catalog.entries.map((record, i) => {
      const names = [record.abbr, record.name, ...record.aliases].map(key).filter(Boolean);
      const score = Math.max(0, ...names.map(name => name === q ? 100 : name.startsWith(q) ? 70 : q.length >= 3 && name.includes(q) ? 30 : 0));
      return { record, i, score };
    }).filter(item => item.score).sort((a, b) => b.score - a.score || a.record.name.localeCompare(b.record.name))
      .slice(0, Math.max(0, Math.min(Number(limit) || 12, 50)))
      .map(({ record, i }) => ({ ...record, catalogIndex: i, venueType: 'conference', edition: catalog.edition }));
  }

  const edition = () => catalog.edition;
  const dataRevision = () => Number.isSafeInteger(catalog.dataRevision) ? catalog.dataRevision : 1;
  const byId = id => /^[a-f0-9]{16}$/.test(String(id || '')) ? catalog.entries.find(row => row.id === id) || null : null;
  globalThis.CCFConferences = Object.freeze({ setCatalog, match, search, edition, dataRevision, byId });
})();
