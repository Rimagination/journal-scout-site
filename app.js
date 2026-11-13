const state = {
  rows: [],
  suggestions: [],
  activeIndex: -1,
  minIF: null,
  minIF5: null,
  meta: null,
  isDataReady: false,
  isDataLoading: false,
  loadError: null,
  loadPromise: null,
  searchRequestSeq: 0,
  searchInputTimer: null,
  searchWarmPromise: null,
};

const DATA_PATHS = [
  "./data/search_index.json",
  "/data/search_index.json",
  "./xuankan/demo_site/data/search_index.json",
  "/xuankan/demo_site/data/search_index.json",
];

const DATA_PATH_CACHE_KEY = "journal_scout_data_path";
const API_BASE = getApiBase();
const SEARCH_API_TIMEOUT_MS = 12000;
const SEARCH_INPUT_DEBOUNCE_MS = 180;
const SEARCH_API_RETRY_DELAY_MS = 450;
const CLASSIFICATION_API_TIMEOUT_MS = 2500;
const classificationCache = new Map();
let conferenceCatalogPromise;
const STATIC_DATA_FALLBACK_ENABLED =
  window.JOURNAL_SCOUT_ALLOW_STATIC_DATA === true ||
  new URLSearchParams(window.location.search).get("staticData") === "1";

const SEED_SUGGESTIONS = [
  {
    title: "PHYSICAL REVIEW LETTERS",
    issn: "0031-9007",
    eissn: "1079-7114",
    if_2023: 9.4,
    if_year: "2025",
    jcr_quartile: "Q1",
    cas_2025: "1区",
    is_top: true,
    hq_level: "T1",
    ni_journal: true,
    tags: ["1区", "HQ-T1", "NI期刊", "Q1", "SCIE", "中科院Top", "新锐1区", "高质量目录"],
  },
  {
    title: "Nature Communications",
    issn: "2041-1723",
    eissn: "2041-1723",
    if_2023: 18.1,
    if_year: "2025",
    jcr_quartile: "Q1",
    cas_2025: "1区",
    is_top: true,
    hq_level: "T1",
    ni_journal: true,
    tags: ["1区", "HQ-T1", "NI期刊", "Q1", "SCIE", "中科院Top", "新锐1区", "高质量目录"],
  },
  {
    title: "ENVIRONMENTAL RESEARCH",
    issn: "0013-9351",
    eissn: "1096-0953",
    if_2023: 8.2,
    if_year: "2025",
    jcr_quartile: "Q1",
    cas_2025: "2区",
    is_top: false,
    hq_level: "T1",
    ni_journal: true,
    tags: ["2区", "HQ-T1", "NEW", "NI期刊", "Q1", "SCIE", "新锐2区", "高质量目录"],
  },
  {
    title: "ENVIRONMENTAL POLLUTION",
    issn: "0269-7491",
    eissn: "1873-6424",
    if_2023: 7.2,
    if_year: "2025",
    jcr_quartile: "Q1",
    cas_2025: "2\u533a",
    is_top: false,
    hq_level: "",
    ni_journal: false,
    tags: ["2\u533a", "Q1", "SCIE"],
  },
  {
    title: "Journal of Cleaner Production",
    issn: "0959-6526",
    eissn: "1879-1786",
    if_2023: 10.7,
    if_year: "2025",
    jcr_quartile: "Q1",
    cas_2025: "1区",
    is_top: true,
    hq_level: "T1",
    ni_journal: true,
    tags: ["1区", "HQ-T1", "NEW", "NI期刊", "Q1", "SCIE", "中科院Top", "新锐1区", "高质量目录"],
  },
  {
    title: "NATURE",
    issn: "0028-0836",
    eissn: "1476-4687",
    if_2023: 56.1,
    if_year: "2025",
    jcr_quartile: "Q1",
    cas_2025: "1区",
    is_top: true,
    hq_level: "T1",
    ni_journal: true,
    tags: ["1区", "HQ-T1", "NI期刊", "Q1", "SCIE", "中科院Top", "新锐1区", "高质量目录"],
  },
  {
    title: "SCIENCE",
    issn: "0036-8075",
    eissn: "1095-9203",
    if_2023: 47.3,
    if_year: "2025",
    jcr_quartile: "Q1",
    cas_2025: "1区",
    is_top: true,
    hq_level: "T1",
    ni_journal: true,
    tags: ["1区", "HQ-T1", "NI期刊", "Q1", "SCIE", "中科院Top", "新锐1区", "高质量目录"],
  },
  {
    title: "CELL",
    issn: "0092-8674",
    eissn: "1097-4172",
    if_2023: 45.1,
    if_year: "2025",
    jcr_quartile: "Q1",
    cas_2025: "1区",
    is_top: true,
    hq_level: "T1",
    ni_journal: true,
    tags: ["1区", "HQ-T1", "NI期刊", "Q1", "SCIE", "中科院Top", "新锐1区", "高质量目录"],
  },
];

function getApiBase() {
  if (["127.0.0.1", "localhost"].includes(window.location.hostname) && /^https?:$/.test(window.location.protocol)) {
    return `${window.location.origin}/api`;
  }
  return "https://www.scansci.com/api";
}

const els = {
  searchShell: document.querySelector(".search-shell"),
  searchInput: document.getElementById("searchInput"),
  searchClearBtn: document.getElementById("searchClearBtn"),
  searchGoBtn: document.getElementById("searchGoBtn"),
  homeQueryButtons: document.querySelectorAll("[data-home-query]"),
  activeFilter: document.getElementById("activeFilter"),
  suggestionPanel: document.getElementById("suggestionPanel"),
  cmdModal: document.getElementById("cmdModal"),
  cmdClose: document.getElementById("cmdClose"),
  cmdInput: document.getElementById("cmdInput"),
  cmdList: document.getElementById("cmdList"),
};

const DETAIL_PAGE_REV = "20261104-wiki-intro-v1";
const DATA_REV = "20260617-jcr-2025-full-v2";
function safe(v) {
  return v === null || v === undefined || v === "" ? "-" : String(v);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getHaystack(row) {
  if (typeof row.__haystack === "string") return row.__haystack;
  const haystack = [row.title, row.issn, row.eissn, row.cn_number].join(" ").toLowerCase();
  row.__haystack = haystack;
  return haystack;
}

const ABBR_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "by",
  "for",
  "from",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

function normalizeAbbrQuery(query) {
  return String(query || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function collectExplicitAbbrVariants(rawAbbreviations) {
  const values = Array.isArray(rawAbbreviations)
    ? rawAbbreviations
    : String(rawAbbreviations || "")
        .split(/[;,|]+/)
        .filter(Boolean);
  const variants = new Set();
  for (const value of values) {
    const normalized = normalizeAbbrQuery(value);
    if (normalized.length >= 2) variants.add(normalized);
  }
  return variants;
}

function isAbbrQuery(query) {
  return /^[a-z0-9]{2,10}$/.test(query);
}

function buildTitleAbbrVariants(title) {
  const words = String(title || "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  if (!words.length) return [];

  const variants = new Set();
  const hasLowercase = /[a-z]/.test(String(title || ""));
  const allInitials = words.map((w) => w[0]).join("").toLowerCase();
  if (allInitials.length >= 2) variants.add(allInitials);

  const coreWords = words.filter((w) => !ABBR_STOPWORDS.has(w.toLowerCase()));
  const coreInitials = coreWords.map((w) => w[0]).join("").toLowerCase();
  if (coreInitials.length >= 2) variants.add(coreInitials);
  const coreAcronymAware = coreWords
    .map((w) => (hasLowercase && /^[A-Z0-9]{2,6}$/.test(w) ? w : w[0]))
    .join("")
    .toLowerCase();
  if (coreAcronymAware.length >= 2) variants.add(coreAcronymAware);

  if (coreWords.length >= 2) {
    variants.add((coreWords[0][0] + coreWords[1][0]).toLowerCase());
  }

  return [...variants];
}

function getAbbrVariants(row) {
  if (Array.isArray(row.__abbrVariants)) return row.__abbrVariants;
  const variants = new Set(buildTitleAbbrVariants(row.title));
  for (const variant of collectExplicitAbbrVariants(row.abbreviations)) {
    variants.add(variant);
  }
  row.__abbrVariants = [...variants];
  return row.__abbrVariants;
}

function isCuratedAbbrPriority(row, abbrQuery) {
  return abbrQuery === "ep" && Number(row?.id) === 753;
}

function yearNum(v) {
  const n = Number(String(v || "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function scoreRow(row, query) {
  const q = query.toLowerCase();
  const qAbbr = normalizeAbbrQuery(query);
  const title = String(row.title || "").toLowerCase();
  const issn = String(row.issn || "").toLowerCase();
  const eissn = String(row.eissn || "").toLowerCase();
  const cn = String(row.cn_number || "").toLowerCase();
  const abbrVariants = isAbbrQuery(qAbbr) ? getAbbrVariants(row) : [];
  const abbrExact = abbrVariants.some((abbr) => abbr === qAbbr);
  const abbrPrefix = abbrVariants.some((abbr) => abbr.startsWith(qAbbr));

  let score = 0;
  if (title === q) score += 1000;
  if (issn === q || eissn === q || cn === q) score += 950;
  if (isCuratedAbbrPriority(row, qAbbr)) score += 900;
  if (abbrExact) score += 520;
  else if (abbrPrefix) score += 430;
  if (title.startsWith(q)) score += 450;
  if (issn.startsWith(q) || eissn.startsWith(q) || cn.startsWith(q)) score += 330;
  if (q.length >= 3 && title.includes(q)) score += 180;
  if (q.length >= 3 && getHaystack(row).includes(q)) score += 70;
  if (row.if_2023 !== null && row.if_2023 !== undefined) score += Math.min(80, Number(row.if_2023) / 8);
  if (row.jcr_quartile === "Q1") score += 40;
  if (String(row.cas_2025 || "").trim() === `1\u533a`) score += 30;
  return score;
}

function buildPriorityTags(row) {
  return window.JournalScoutBadges.build(row).map((badge) => ({
    text: badge.text,
    cls: badge.className,
    title: badge.title,
  }));
}

function renderTagList(tags) {
  if (!tags.length) return `<span class="tag tag--empty">无核心标签</span>`;
  return tags.map((tag) => `<span class="tag ${tag.cls}" title="${escapeHtml(tag.title || tag.text)}">${escapeHtml(tag.text)}</span>`).join("");
}
function findSuggestions(query, limit = 12) {
  const q = query.trim();
  if (!q) return [];
  const qLower = q.toLowerCase();
  const qAbbr = normalizeAbbrQuery(q);
  const useAbbrMatch = isAbbrQuery(qAbbr);
  const shortAbbrMode = useAbbrMatch && qAbbr.length <= 4;

  return state.rows
    .filter((row) => {
      if (shortAbbrMode) {
        const title = String(row.title || "").toLowerCase();
        const issn = String(row.issn || "").toLowerCase();
        const eissn = String(row.eissn || "").toLowerCase();
        const cn = String(row.cn_number || "").toLowerCase();
        if (title.startsWith(qLower) || issn.startsWith(qLower) || eissn.startsWith(qLower) || cn.startsWith(qLower)) {
          return true;
        }
        return getAbbrVariants(row).some((abbr) => abbr.startsWith(qAbbr));
      }
      if (getHaystack(row).includes(qLower)) return true;
      if (!useAbbrMatch) return false;
      return getAbbrVariants(row).some((abbr) => abbr.startsWith(qAbbr));
    })
    .filter((row) => {
      const passes = (value, minimum) => minimum === null || (value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) && Number(value) >= minimum);
      return passes(row.if_2023, state.minIF) && (passes(row.if5, state.minIF5) || (state.minIF5 === 0 && row.if5_display === "<0.1"));
    })
    .map((row) => ({ row, score: scoreRow(row, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.row);
}

function findSeedSuggestions(query, limit = 12) {
  if (state.minIF5 !== null) return [];
  const q = query.trim();
  if (!q) return [];
  const qLower = q.toLowerCase();
  const qAbbr = normalizeAbbrQuery(q);
  const useAbbrMatch = isAbbrQuery(qAbbr);

  return SEED_SUGGESTIONS.filter((row) => {
    if (getHaystack(row).includes(qLower)) return true;
    if (!useAbbrMatch) return false;
    return getAbbrVariants(row).some((abbr) => abbr.startsWith(qAbbr));
  })
    .map((row) => ({ row, score: scoreRow(row, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.row);
}

async function fetchSearchApi(query, limit = 12) {
  const url = new URL(`${API_BASE}/journals/search`);
  url.searchParams.set("metric_schema", "if5");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  if (state.minIF !== null) url.searchParams.set("min_if", String(state.minIF));

  if (state.minIF5 !== null) url.searchParams.set("min_if5", String(state.minIF5));

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), SEARCH_API_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), {
      cache: "default",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload || !Array.isArray(payload.items)) {
      throw new Error(payload?.error || `HTTP ${res.status}`);
    }
    return payload.items;
  } finally {
    window.clearTimeout(timer);
  }
}

function compactIssn(value) {
  const key = String(value || "").toUpperCase().replace(/[^0-9X]/g, "");
  return /^\d{7}[\dX]$/.test(key) ? key : "";
}

async function enrichSearchRowsWithClassifications(rows) {
  const keys = [...new Set(rows.flatMap((row) => [row.issn, row.eissn]).map(compactIssn).filter(Boolean))].slice(0, 40);
  if (!keys.length) return rows;
  const missing = keys.filter((key) => !classificationCache.has(key));

  if (missing.length) {
    const url = new URL(`${API_BASE}/reader/journal-classifications`);
    for (const key of missing) url.searchParams.append("issn", key);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), CLASSIFICATION_API_TIMEOUT_MS);
    try {
      const response = await fetch(url.toString(), {
        cache: "default",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok || !Array.isArray(payload.items)) return rows;

      for (const item of payload.items) {
        for (const value of Array.isArray(item.issns) ? item.issns : []) {
          const key = compactIssn(value);
          if (key) classificationCache.set(key, item);
        }
      }
      for (const key of missing) if (!classificationCache.has(key)) classificationCache.set(key, null);
    } catch {
      return rows;
    } finally {
      window.clearTimeout(timer);
    }
  }

  return rows.map((row) => {
    const detail = [row.issn, row.eissn]
      .map(compactIssn)
      .map((key) => classificationCache.get(key))
      .find(Boolean);
    if (!detail) return row;
    return {
      ...row,
      ccf_records: detail.ccf_records,
      ccft_records: detail.ccft_records,
      ei_indexed: detail.ei_indexed,
    };
  });
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isTransientSearchError(error) {
  const name = String(error?.name || "");
  const message = String(error?.message || "");
  return name === "AbortError" || /network|fetch|failed|abort/i.test(message);
}

async function findSuggestionsRemoteFirst(query, limit = 12) {
  try {
    return await fetchSearchApi(query, limit);
  } catch (err) {
    if (isTransientSearchError(err)) {
      await sleep(SEARCH_API_RETRY_DELAY_MS);
      try {
        return await fetchSearchApi(query, limit);
      } catch (retryErr) {
        err = retryErr;
      }
    }
    if (!STATIC_DATA_FALLBACK_ENABLED) throw err;
    if (!state.isDataReady) await ensureDataReady();
    return findSuggestions(query, limit);
  }
}

async function findConferenceSuggestions(query, limit = 12) {
  if (state.minIF !== null || state.minIF5 !== null || query.trim().length < 2 || !window.CCFConferences) return [];
  if (!conferenceCatalogPromise) {
    conferenceCatalogPromise = fetch("./data/ccf-conferences.json?v=20261112-ccf", { cache: "default" })
      .then((response) => {
        if (!response.ok) throw new Error(`CCF catalog HTTP ${response.status}`);
        return response.json();
      }).then((catalog) => window.CCFConferences.setCatalog(catalog))
      .catch((error) => { conferenceCatalogPromise = null; throw error; });
  }
  await conferenceCatalogPromise;
  return window.CCFConferences.search(query, limit).map((record) => ({
    id: `conference:${record.id}`, conferenceId: record.id, venueType: "conference",
    title: record.name, abbreviations: record.abbr ? [record.abbr] : [], acronym: record.abbr,
    area: record.area, tags: [],
    ccf_records: [{ year: String(record.edition), category: "推荐国际学术会议", level: `${record.level}类` }],
  }));
}

async function findAllSuggestions(query, limit = 12) {
  const [journals, conferences] = await Promise.allSettled([
    findSuggestionsRemoteFirst(query, limit), findConferenceSuggestions(query, limit),
  ]);
  const journalRows = journals.status === "fulfilled" ? journals.value : [];
  const conferenceRows = conferences.status === "fulfilled" ? conferences.value : [];
  if (journals.status === "rejected" && !conferenceRows.length) throw journals.reason;
  const q = query.trim().toLowerCase();
  const exact = conferenceRows.filter(row => row.acronym.toLowerCase() === q || row.title.toLowerCase() === q);
  const other = conferenceRows.filter(row => !exact.includes(row));
  return [...exact, ...journalRows, ...other].slice(0, limit);
}

function isAbbreviationMatch(row, query) {
  const qAbbr = normalizeAbbrQuery(query);
  if (!isAbbrQuery(qAbbr)) return false;
  return getAbbrVariants(row).some((abbr) => abbr === qAbbr || abbr.startsWith(qAbbr));
}

function suggestionItem(row, idx) {
  const query = String(els.searchInput?.value || "").trim();
  const ids = row.venueType === "conference"
    ? ["会议", row.acronym, row.area].filter(Boolean).join(" · ")
    : [row.issn, row.cn_number].filter(Boolean).join(" / ");
  const tagsHtml = renderTagList(buildPriorityTags(row));
  const activeCls = idx === state.activeIndex ? "is-active" : "";
  const matchHint = isAbbreviationMatch(row, query)
    ? `<span class="suggestion__match-hint">缩写匹配</span>`
    : "";

  return `
    <button class="suggestion ${activeCls}" data-id="${escapeHtml(String(row.id ?? ""))}" data-idx="${idx}" type="button">
      <div class="suggestion__main">
        <div class="suggestion__title-row">
          <div class="suggestion__title">${escapeHtml(row.title || "\u672a\u77e5\u671f\u520a")}</div>
          ${matchHint}
        </div>
        <div class="suggestion__meta">${escapeHtml(safe(ids))}</div>
        <div class="tags" data-suggestion-badges>${tagsHtml}</div>
      </div>
    </button>
  `;
}

function closeSuggestionPanel() {
  state.suggestions = [];
  state.activeIndex = -1;
  if (!els.suggestionPanel) return;
  els.suggestionPanel.classList.remove("is-open");
  els.suggestionPanel.innerHTML = "";
}

function syncSearchClearButton() {
  if (!els.searchInput || !els.searchClearBtn) return;
  els.searchClearBtn.hidden = !els.searchInput.value;
}

function clearSearchInput() {
  if (!els.searchInput) return;
  state.searchRequestSeq += 1;
  els.searchInput.value = "";
  closeSuggestionPanel();
  syncSearchClearButton();
  els.searchInput.focus();
}

function handleSearchClear(e) {
  e.preventDefault();
  clearSearchInput();
}

function openSuggestionPanel() {
  if (!els.suggestionPanel) return;
  els.suggestionPanel.classList.add("is-open");
}

function setPanelMessage(message) {
  state.suggestions = [];
  state.activeIndex = -1;
  if (!els.suggestionPanel) return;
  openSuggestionPanel();
  els.suggestionPanel.innerHTML = `<p class="placeholder">${escapeHtml(message)}</p>`;
}

function applyLoadedPayload(payload) {
  state.rows = payload.journals;
  state.meta = payload.meta || {};
  state.isDataReady = true;
  state.loadError = null;

}

function gotoDetail(id, q = "") {
  const url = new URL("./journal.html", window.location.href);
  url.searchParams.set("id", String(id));
  if (q) url.searchParams.set("q", q);
  url.searchParams.set("v", DETAIL_PAGE_REV);
  window.location.href = url.toString();
}

function suggestionIssnKey(value) {
  const key = String(value || "").toUpperCase().replace(/[^0-9X]/g, "");
  return /^\d{7}[\dX]$/.test(key) ? key : "";
}

async function gotoSuggestion(row, q) {
  if (!row || !els.searchInput || els.searchInput.value.trim() !== q) return;
  if (state.searchInputTimer) {
    window.clearTimeout(state.searchInputTimer);
    state.searchInputTimer = null;
  }
  const seq = (state.searchRequestSeq += 1);
  if (row.venueType === "conference" && /^[a-f0-9]{16}$/.test(row.conferenceId || "")) {
    const url = new URL("./conference.html", window.location.href);
    url.searchParams.set("id", row.conferenceId);
    window.location.href = url.toString();
    return;
  }
  if (row.id != null && String(row.id).trim()) {
    gotoDetail(row.id, q);
    return;
  }

  // Seed suggestions have no durable database ID; resolve their ISSN first.
  const issn = row.issn || row.eissn;
  const key = suggestionIssnKey(issn);
  if (!key) {
    setPanelMessage("无法确认期刊信息，请重新搜索");
    return;
  }
  setPanelMessage("正在确认期刊信息...");
  try {
    const rows = await findSuggestionsRemoteFirst(issn, 12);
    if (seq !== state.searchRequestSeq || els.searchInput.value.trim() !== q) return;
    const matches = rows.filter((candidate) =>
      candidate.id != null && String(candidate.id).trim() &&
      [candidate.issn, candidate.eissn].some((value) => suggestionIssnKey(value) === key)
    );
    const title = String(row.title || "").trim().toLowerCase();
    const match = matches.find((candidate) => String(candidate.title || "").trim().toLowerCase() === title) ||
      (matches.length === 1 ? matches[0] : null);
    if (match) gotoDetail(match.id, q);
    else setPanelMessage("无法确认期刊信息，请重新搜索");
  } catch (err) {
    if (seq === state.searchRequestSeq && els.searchInput.value.trim() === q) showLoadError(err);
  }
}

async function gotoPickedSuggestion() {
  if (!els.searchInput) return;
  const q = els.searchInput.value.trim();
  if (!q) return;

  let picked = state.suggestions[state.activeIndex >= 0 ? state.activeIndex : 0];
  if (picked) {
    await gotoSuggestion(picked, q);
    return;
  }

  if (state.searchInputTimer) {
    window.clearTimeout(state.searchInputTimer);
    state.searchInputTimer = null;
  }
  const seq = (state.searchRequestSeq += 1);
  setPanelMessage("正在检索期刊...");
  try {
    const fallback = await findAllSuggestions(q, 1);
    if (seq !== state.searchRequestSeq || els.searchInput.value.trim() !== q) return;
    picked = fallback[0];
    if (picked) await gotoSuggestion(picked, q);
    else renderSuggestionRows(q, []);
  } catch (err) {
    if (seq === state.searchRequestSeq && els.searchInput.value.trim() === q) showLoadError(err);
  }
}

function ensureActiveVisible() {
  if (!els.suggestionPanel) return;
  const active = els.suggestionPanel.querySelector(".suggestion.is-active");
  if (active) active.scrollIntoView({ block: "nearest" });
}

function renderSuggestionRows(query, rows) {
  state.suggestions = rows;
  state.activeIndex = state.suggestions.length ? 0 : -1;
  openSuggestionPanel();

  if (!state.suggestions.length) {
    els.suggestionPanel.innerHTML =
      "<p class='placeholder'>未找到匹配的期刊或会议，请尝试更完整的名称、缩写、ISSN 或 CN 号</p>";
    return;
  }

  els.suggestionPanel.innerHTML = state.suggestions.map((row, i) => suggestionItem(row, i)).join("");
  els.suggestionPanel.querySelectorAll(".suggestion").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      void gotoSuggestion(rows[Number(btn.dataset.idx)], query);
    });
    btn.addEventListener("mouseenter", () => {
      state.activeIndex = Number(btn.dataset.idx);
      els.suggestionPanel.querySelectorAll(".suggestion").forEach((s) => s.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });
}

async function renderSuggestions() {
  if (!els.searchInput || !els.suggestionPanel) return;
  const q = els.searchInput.value.trim();
  const seq = (state.searchRequestSeq += 1);
  if (!q) {
    closeSuggestionPanel();
    return;
  }

  setPanelMessage("\u6b63\u5728\u68c0\u7d22\u671f\u520a...");
  const seedRows = findSeedSuggestions(q);
  if (seedRows.length) {
    renderSuggestionRows(q, seedRows);
  }

  let rows = [];
  try {
    rows = await findAllSuggestions(q);
  } catch (err) {
    console.error("Journal search API failed:", err);
    if (seq === state.searchRequestSeq) {
      setPanelMessage("\u7f51\u7edc\u8fde\u63a5\u8f83\u6162\uff0c\u8bf7\u518d\u8f93\u5165\u6216\u6309 Enter \u68c0\u7d22");
    }
    return;
  }

  if (seq !== state.searchRequestSeq) return;
  renderSuggestionRows(q, rows);
  void enrichSearchRowsWithClassifications(rows.filter(row => row.venueType !== "conference")).then((enrichedRows) => {
    if (seq !== state.searchRequestSeq || els.searchInput.value.trim() !== q) return;
    const enrichedById = new Map(enrichedRows.map((row) => [String(row.id), row]));
    state.suggestions = state.suggestions.map((row) => enrichedById.get(String(row.id)) || row);
    for (const button of els.suggestionPanel.querySelectorAll(".suggestion")) {
      const row = enrichedById.get(String(button.dataset.id));
      const badges = button.querySelector("[data-suggestion-badges]");
      if (row && badges) badges.innerHTML = renderTagList(buildPriorityTags(row));
    }
  });
}

function scheduleRenderSuggestions(delay = SEARCH_INPUT_DEBOUNCE_MS) {
  state.searchRequestSeq += 1;
  closeSuggestionPanel();
  if (state.searchInputTimer) window.clearTimeout(state.searchInputTimer);
  state.searchInputTimer = window.setTimeout(() => {
    state.searchInputTimer = null;
    void renderSuggestions();
  }, delay);
}

function warmSearchApi() {
  if (state.searchWarmPromise) return state.searchWarmPromise;
  state.searchWarmPromise = fetchSearchApi("", 1).catch(() => null);
  return state.searchWarmPromise;
}

function applyFilterHint() {
  if (!els.activeFilter) return;
  const labels = [["IF", state.minIF], ["IF5", state.minIF5]].filter(([, value]) => value !== null).map(([key, value]) => `${key} ≥ ${value}`);
  els.activeFilter.hidden = !labels.length;
  els.activeFilter.textContent = labels.length ? `筛选中：${labels.join("；")}` : "";
}

function restoreQueryFromUrl() {
  if (!els.searchInput) return;
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (!q) return;
  els.searchInput.value = q;
  syncSearchClearButton();
  void renderSuggestions();
}

function openCommandPalette() {
  if (!els.cmdModal || !els.cmdInput || !els.cmdList) return;
  els.cmdModal.hidden = false;
  els.cmdInput.value = "";
  renderCommandList("");
  setTimeout(() => els.cmdInput.focus(), 0);
}

function closeCommandPalette() {
  if (!els.cmdModal) return;
  els.cmdModal.hidden = true;
}

function runCommand(handler) {
  closeCommandPalette();
  try {
    const maybePromise = handler();
    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise.catch(showLoadError);
    }
  } catch (err) {
    showLoadError(err);
  }
}

function parseFilterCommand(input) {
  const m = input.match(/^\s*>\s*filter\s+(if5?)\s*>\s*(\d+(?:\.\d+)?)\s*$/i);
  if (!m) return null;
  return { key: m[1].toLowerCase() === "if5" ? "minIF5" : "minIF", label: m[1].toUpperCase(), value: Number(m[2]) };
}

function commandEntries() {
  return [
    {
      key: "hq",
      title: "\u6253\u5f00\u79d1\u534f\u76ee\u5f55\u6838\u5bf9",
      desc: "\u8df3\u8f6c\u5230 59 \u9886\u57df\u76ee\u5f55\u6838\u5bf9\u9875",
      run: () => {
        window.location.href = "./hq_stats.html";
      },
    },
    {
      key: "clear",
      title: "\u6e05\u7a7a\u641c\u7d22\u6846",
      desc: "\u6e05\u7a7a\u5173\u952e\u8bcd\u5e76\u5173\u95ed\u8054\u60f3\u9762\u677f",
      run: () => {
        clearSearchInput();
      },
    },
    {
      key: "if5", title: "筛选五年影响因子 IF5", desc: "输入 > filter IF5 > 10 设置最低 IF5",
      run: () => { openCommandPalette(); els.cmdInput.value = "> filter IF5 > "; renderCommandList(els.cmdInput.value); els.cmdInput.focus(); },
    },
    {
      key: "reset-filter",
      title: "\u6e05\u9664 IF \u7b5b\u9009",
      desc: "\u6062\u590d\u4e0d\u5e26 IF \u9608\u503c\u7684\u8054\u60f3\u7ed3\u679c",
      run: () => {
        state.minIF = state.minIF5 = null;
        applyFilterHint();
        void renderSuggestions();
      },
    },
    {
      key: "sample-nature",
      title: "\u6253\u5f00\u793a\u4f8b\u671f\u520a Nature",
      desc: "\u5feb\u901f\u67e5\u770b Nature \u8be6\u60c5",
      run: async () => {
        const rows = await findSuggestionsRemoteFirst("Nature", 1);
        const row = rows.find((r) => String(r.title || "").toUpperCase() === "NATURE") || rows[0];
        if (row) gotoDetail(row.id, "Nature");
      },
    },
  ];
}

function renderCommandList(input) {
  if (!els.cmdList || !els.cmdInput) return;
  const filterValue = parseFilterCommand(input);
  let list = commandEntries();

  if (filterValue !== null) {
    list = [
      {
        key: "filter-if",
        title: `\u5e94\u7528\u7b5b\u9009\uff1a${filterValue.label} >= ${filterValue.value}`,
        desc: "\u4ec5\u4fdd\u7559\u6ee1\u8db3\u9608\u503c\u7684\u671f\u520a\u8054\u60f3\u7ed3\u679c",
        run: () => {
          state[filterValue.key] = filterValue.value;
          applyFilterHint();
          void renderSuggestions();
        },
      },
    ];
  } else if (input.trim()) {
    const q = input.trim().toLowerCase();
    list = list.filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        x.desc.toLowerCase().includes(q) ||
        x.key.toLowerCase().includes(q)
    );
  }

  if (!list.length) {
    els.cmdList.innerHTML = "<p class='placeholder'>\u65e0\u53ef\u7528\u547d\u4ee4</p>";
    return;
  }

  els.cmdList.innerHTML = list
    .map(
      (item, idx) => `
        <button class="cmd-item ${idx === 0 ? "is-active" : ""}" data-cmd="${escapeHtml(item.key)}" type="button">
          <div class="cmd-item__title">${escapeHtml(item.title)}</div>
          <div class="cmd-item__desc">${escapeHtml(item.desc)}</div>
        </button>
      `
    )
    .join("");

  els.cmdList.querySelectorAll(".cmd-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = list.find((x) => x.key === btn.dataset.cmd);
      if (item) runCommand(item.run);
    });
    btn.addEventListener("mouseenter", () => {
      els.cmdList.querySelectorAll(".cmd-item").forEach((x) => x.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  els.cmdInput.onkeydown = (e) => {
    const items = [...els.cmdList.querySelectorAll(".cmd-item")];
    if (!items.length) return;
    const current = items.findIndex((x) => x.classList.contains("is-active"));

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = current < items.length - 1 ? current + 1 : 0;
      items.forEach((x) => x.classList.remove("is-active"));
      items[next].classList.add("is-active");
      items[next].scrollIntoView({ block: "nearest" });
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = current > 0 ? current - 1 : items.length - 1;
      items.forEach((x) => x.classList.remove("is-active"));
      items[next].classList.add("is-active");
      items[next].scrollIntoView({ block: "nearest" });
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      items[Math.max(0, current)].click();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closeCommandPalette();
    }
  };
}

function bindEvents() {
  if (!els.searchInput || !els.suggestionPanel) return;

  syncSearchClearButton();
  els.searchInput.addEventListener("input", () => {
    syncSearchClearButton();
    scheduleRenderSuggestions();
  });
  els.searchInput.addEventListener("focus", () => {
    if (els.searchInput.value.trim()) scheduleRenderSuggestions(0);
  });

  els.searchInput.addEventListener("keydown", async (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!state.suggestions.length) return;
      e.preventDefault();
      if (e.key === "ArrowDown") {
        state.activeIndex = state.activeIndex < state.suggestions.length - 1 ? state.activeIndex + 1 : 0;
      } else {
        state.activeIndex = state.activeIndex > 0 ? state.activeIndex - 1 : state.suggestions.length - 1;
      }
      els.suggestionPanel.querySelectorAll(".suggestion").forEach((btn, idx) => {
        btn.classList.toggle("is-active", idx === state.activeIndex);
      });
      ensureActiveVisible();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      await gotoPickedSuggestion();
    }
  });

  if (els.searchGoBtn) {
    els.searchGoBtn.addEventListener("click", () => {
      void gotoPickedSuggestion();
    });
  }

  if (els.searchClearBtn) {
    els.searchClearBtn.addEventListener("pointerdown", handleSearchClear);
    els.searchClearBtn.addEventListener("click", handleSearchClear);
  }

  els.homeQueryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const query = String(button.getAttribute("data-home-query") || "").trim();
      if (!query) return;
      els.searchInput.value = query;
      syncSearchClearButton();
      els.searchInput.focus();
      scheduleRenderSuggestions(0);
    });
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (els.searchShell && target instanceof Node && !els.searchShell.contains(target)) closeSuggestionPanel();
    if (target instanceof Element && target.closest("[data-close-cmd]")) closeCommandPalette();
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openCommandPalette();
      return;
    }
    if (e.key === "Escape" && els.cmdModal && !els.cmdModal.hidden) {
      closeCommandPalette();
    }
  });

  if (els.cmdClose) {
    els.cmdClose.addEventListener("click", closeCommandPalette);
  }
  if (els.cmdInput) {
    els.cmdInput.addEventListener("input", () => renderCommandList(els.cmdInput.value));
  }

  window.setTimeout(warmSearchApi, 200);
}

function dataPathCandidates() {
  const remembered = window.localStorage.getItem(DATA_PATH_CACHE_KEY);
  if (!remembered) return DATA_PATHS.slice();
  if (!DATA_PATHS.includes(remembered)) {
    window.localStorage.removeItem(DATA_PATH_CACHE_KEY);
    return DATA_PATHS.slice();
  }
  const all = [remembered, ...DATA_PATHS];
  return [...new Set(all)];
}

async function tryLoadPayload(path) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${path}${sep}v=${DATA_REV}`, {
    cache: "force-cache",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const payload = await res.json();
  if (!payload || !Array.isArray(payload.journals)) {
    throw new Error("invalid_payload");
  }
  return payload;
}

async function loadPayloadWithFallback() {
  let lastError = null;
  for (const path of dataPathCandidates()) {
    try {
      const payload = await tryLoadPayload(path);
      window.localStorage.setItem(DATA_PATH_CACHE_KEY, path);
      return payload;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("load_failed");
}

async function ensureDataReady() {
  if (state.isDataReady) return;
  if (state.loadError) throw state.loadError;
  if (state.loadPromise) {
    await state.loadPromise;
    return;
  }

  state.isDataLoading = true;
  state.loadPromise = (async () => {
    const payload = await loadPayloadWithFallback();
    applyLoadedPayload(payload);
  })();

  try {
    await state.loadPromise;
  } catch (err) {
    state.loadError = err;
    throw err;
  } finally {
    state.isDataLoading = false;
    state.loadPromise = null;
  }
}

function showLoadError(err) {
  console.error("Journal data load failed:", err);
  setPanelMessage("\u6570\u636e\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u5237\u65b0\u91cd\u8bd5");
}

async function bootstrap() {
  if (!els.searchInput || !els.suggestionPanel) return;

  applyFilterHint();
  bindEvents();
  restoreQueryFromUrl();
}

bootstrap().catch(showLoadError);
