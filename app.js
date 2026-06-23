const state = {
  rows: [],
  suggestions: [],
  activeIndex: -1,
  minIF: null,
  meta: null,
  isDataReady: false,
  isDataLoading: false,
  loadError: null,
  loadPromise: null,
  searchRequestSeq: 0,
};

const DATA_PATHS = [
  "./data/search_index.json",
  "/data/search_index.json",
  "./xuankan/demo_site/data/search_index.json",
  "/xuankan/demo_site/data/search_index.json",
];

const DATA_PATH_CACHE_KEY = "journal_scout_data_path";
const API_BASE = getApiBase();
const SEARCH_API_TIMEOUT_MS = 4500;
const STATIC_DATA_FALLBACK_ENABLED =
  window.JOURNAL_SCOUT_ALLOW_STATIC_DATA === true ||
  new URLSearchParams(window.location.search).get("staticData") === "1";

function getApiBase() {
  if (["127.0.0.1", "localhost"].includes(window.location.hostname) && /^https?:$/.test(window.location.protocol)) {
    return `${window.location.origin}/api`;
  }
  return "https://www.scansci.com/api";
}

const TAG_TEXT = {
  casPrefix: "\u4e2d\u79d1\u9662",
  hqPrefix: "\u79d1\u534f-",
  ni: "NI\u671f\u520a",
  pku: "\u5317\u5927\u6838\u5fc3",
  cssci: "CSSCI",
  cssciExt: "CSSCI(\u6269\u5c55)",
  cssciSourceType: "\u6765\u6e90\u7248",
  cssciExpandType: "\u6269\u5c55\u7248",
  cscdCore: "\u6838\u5fc3\u5e93",
  cscdExt: "\u6269\u5c55\u5e93",
  cscdPrefix: "CSCD-",
  warning: "\u4e2d\u79d1\u9662\u9884\u8b66",
  empty: "\u65e0\u6838\u5fc3\u6807\u7b7e",
};

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

const DETAIL_PAGE_REV = "20260617-jcr-v31";
const DATA_REV = "20260617-jcr-2025-full-v2";
const LATEST_OFFICIAL_JIF_YEAR = 2025;

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

function isAbbrQuery(query) {
  return /^[a-z0-9]{2,10}$/.test(query);
}

function buildTitleAbbrVariants(title) {
  const words = String(title || "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  if (!words.length) return [];

  const variants = new Set();
  const allInitials = words.map((w) => w[0]).join("").toLowerCase();
  if (allInitials.length >= 2) variants.add(allInitials);

  const coreWords = words.filter((w) => !ABBR_STOPWORDS.has(w.toLowerCase()));
  const coreInitials = coreWords.map((w) => w[0]).join("").toLowerCase();
  if (coreInitials.length >= 2) variants.add(coreInitials);

  if (coreWords.length >= 2) {
    variants.add((coreWords[0][0] + coreWords[1][0]).toLowerCase());
  }

  return [...variants];
}

function getAbbrVariants(row) {
  if (Array.isArray(row.__abbrVariants)) return row.__abbrVariants;
  const variants = buildTitleAbbrVariants(row.title);
  row.__abbrVariants = variants;
  return variants;
}

function yearNum(v) {
  const n = Number(String(v || "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseFloatLoose(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).trim();
  if (!s) return null;
  const m = s.match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

function formatIFAcademicYear(rawYear) {
  const y = yearNum(rawYear);
  if (!y) return "";
  return `${y}-${y + 1}\u5e74\u5ea6`;
}

function formatOfficialJifShort(rawYear) {
  const y = yearNum(rawYear);
  if (!y) return "";
  return `${y} JIF`;
}

function isLatestOfficialJifYear(rawYear) {
  const y = yearNum(rawYear);
  return y >= LATEST_OFFICIAL_JIF_YEAR;
}

function formatIfDelta(delta) {
  const n = Number(delta);
  if (!Number.isFinite(n)) return "";
  const abs = Math.abs(n);
  const digits = abs > 0 && abs < 1 ? 2 : 1;
  const text = abs.toFixed(digits).replace(/\.?0+$/, "");
  return `${n > 0 ? "+" : n < 0 ? "-" : ""}${text}`;
}

function ifDeltaTone(delta) {
  const n = Number(delta);
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "flat";
}

function buildIfDeltaBadge(row) {
  const delta = parseFloatLoose(row?.if_delta);
  if (delta === null) return "";
  const fromYear = String(row?.if_delta_from_year || "").trim();
  const title = fromYear ? ` title="较 ${escapeHtml(fromYear)} JIF"` : "";
  return ` <span class="if-delta if-delta--${ifDeltaTone(delta)}"${title}>${escapeHtml(formatIfDelta(delta))}</span>`;
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
  if (title.startsWith(q)) score += 450;
  if (issn.startsWith(q) || eissn.startsWith(q) || cn.startsWith(q)) score += 330;
  if (abbrExact) score += 280;
  else if (abbrPrefix) score += 220;
  if (q.length >= 3 && title.includes(q)) score += 180;
  if (q.length >= 3 && getHaystack(row).includes(q)) score += 70;
  if (row.if_2023 !== null && row.if_2023 !== undefined) score += Math.min(80, Number(row.if_2023) / 8);
  if (row.jcr_quartile === "Q1") score += 40;
  if (String(row.cas_2025 || "").trim() === `1\u533a`) score += 30;
  return score;
}

function pushTag(tags, text, cls) {
  const t = String(text || "").trim();
  if (!t) return;
  if (tags.some((x) => x.text === t)) return;
  tags.push({ text: t, cls });
}

function collectCnkiWosTokens(rowTags) {
  const known = new Set(["SCI", "SCIE", "SSCI", "ESCI", "AHCI"]);
  const out = new Set();

  for (const raw of rowTags) {
    const upper = String(raw || "").toUpperCase();
    const parts = upper.replace(/[^A-Z]+/g, " ").split(/\s+/).filter(Boolean);
    for (const p of parts) {
      if (known.has(p)) out.add(p);
    }
    if (upper.includes("SCIE")) out.add("SCIE");
    if (upper.includes("SSCI")) out.add("SSCI");
    if (upper.includes("ESCI")) out.add("ESCI");
    if (upper.includes("AHCI")) out.add("AHCI");
    if (/\bSCI\b/.test(upper.replace(/[^A-Z]/g, " "))) out.add("SCI");
  }

  return [...out];
}

function deriveHqLevel(row, rowTags) {
  const raw = String(row.hq_level || "").trim();
  if (raw) return raw;
  for (const tag of rowTags) {
    const m = String(tag).trim().match(/^HQ-(.+)$/i);
    if (m && m[1]) return m[1].trim().toUpperCase();
  }
  return "";
}

function buildPriorityTags(row) {
  const tags = [];
  const rowTags = Array.isArray(row.tags)
    ? row.tags.map((x) => String(x || "").trim()).filter(Boolean)
    : [];

  if (row.jcr_quartile) {
    pushTag(tags, `JCR ${row.jcr_quartile}`, "tag--jcr");
  }

  if (row.xuankan_2026) {
    pushTag(tags, `新锐${row.xuankan_2026}`, "tag--xuankan");
  }

  if (row.cas_2025) {
    const suffix = row.is_top === true ? " (Top)" : "";
    pushTag(tags, `${TAG_TEXT.casPrefix}${row.cas_2025}${suffix}`, "tag--cas");
  }

  const hqLevel = deriveHqLevel(row, rowTags);
  if (hqLevel) {
    pushTag(tags, `${TAG_TEXT.hqPrefix}${hqLevel}`, "tag--hq");
  }

  if (row.ni_journal === true || rowTags.includes(TAG_TEXT.ni)) {
    pushTag(tags, TAG_TEXT.ni, "tag--ni");
  }
  if (row.pku_core === true || rowTags.includes(TAG_TEXT.pku)) {
    pushTag(tags, TAG_TEXT.pku, "tag--pku");
  }

  let cssciType = String(row.cssci_type || "").trim();
  if (!cssciType) {
    if (rowTags.includes(TAG_TEXT.cssciExt) || rowTags.includes("CSSCI\u6269\u5c55")) {
      cssciType = TAG_TEXT.cssciExpandType;
    } else if (rowTags.includes(TAG_TEXT.cssci)) {
      cssciType = TAG_TEXT.cssciSourceType;
    }
  }
  if (cssciType) {
    const text = cssciType === TAG_TEXT.cssciExpandType ? TAG_TEXT.cssciExt : TAG_TEXT.cssci;
    pushTag(tags, text, "tag--cssci");
  }

  let cscdType = String(row.cscd_type || "").trim();
  if (!cscdType) {
    const cscdTag = rowTags.find((t) => t.startsWith(TAG_TEXT.cscdPrefix));
    if (cscdTag) cscdType = cscdTag.slice(TAG_TEXT.cscdPrefix.length).trim();
    else if (rowTags.includes("CSCD(\u6838\u5fc3)") || rowTags.includes("CSCD\u6838\u5fc3")) cscdType = TAG_TEXT.cscdCore;
    else if (rowTags.includes("CSCD(\u6269\u5c55)") || rowTags.includes("CSCD\u6269\u5c55")) cscdType = TAG_TEXT.cscdExt;
    else if (rowTags.includes("CSCD")) cscdType = TAG_TEXT.cscdCore;
  }
  if (cscdType) {
    pushTag(tags, `${TAG_TEXT.cscdPrefix}${cscdType}`, "tag--cscd");
  }

  for (const token of collectCnkiWosTokens(rowTags)) {
    pushTag(tags, token, "tag--wos");
  }

  if (rowTags.some((t) => String(t).toUpperCase() === "EI")) {
    pushTag(tags, "EI", "tag--ei");
  }

  if (row.xuankan_warning) {
    pushTag(tags, "新锐预警", "tag--xuankan-warn");
  }

  if (row.warning_latest) {
    pushTag(tags, TAG_TEXT.warning, "tag--warn");
  }

  return tags;
}

function renderTagList(tags) {
  if (!tags.length) return `<span class="tag tag--empty">${TAG_TEXT.empty}</span>`;
  return tags.map((t) => `<span class="tag ${t.cls}">${escapeHtml(t.text)}</span>`).join("");
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
      if (state.minIF === null) return true;
      const v = Number(row.if_2023);
      return Number.isFinite(v) && v >= state.minIF;
    })
    .map((row) => ({ row, score: scoreRow(row, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.row);
}

async function fetchSearchApi(query, limit = 12) {
  const url = new URL(`${API_BASE}/journals/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  if (state.minIF !== null) url.searchParams.set("min_if", String(state.minIF));

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

async function findSuggestionsRemoteFirst(query, limit = 12) {
  try {
    return await fetchSearchApi(query, limit);
  } catch (err) {
    if (!STATIC_DATA_FALLBACK_ENABLED) throw err;
    if (!state.isDataReady) await ensureDataReady();
    return findSuggestions(query, limit);
  }
}

function isAbbreviationMatch(row, query) {
  const qAbbr = normalizeAbbrQuery(query);
  if (!isAbbrQuery(qAbbr)) return false;
  return getAbbrVariants(row).some((abbr) => abbr === qAbbr || abbr.startsWith(qAbbr));
}

function suggestionItem(row, idx) {
  const query = String(els.searchInput?.value || "").trim();
  const ids = [row.issn, row.cn_number].filter(Boolean).join(" / ");
  const tagsHtml = renderTagList(buildPriorityTags(row));
  const ifYear = formatOfficialJifShort(row.if_year);
  const ifYearText = ifYear ? `(${ifYear})` : "";
  const ifText = row.if_2023 === null || row.if_2023 === undefined ? "-" : safe(row.if_2023);
  const ifNewBadge =
    row.if_2023 === null || row.if_2023 === undefined || !isLatestOfficialJifYear(row.if_year)
      ? ""
      : ` <span class="if-new-badge if-new-badge--inline">NEW</span>`;
  const ifDeltaBadge = buildIfDeltaBadge(row);
  const activeCls = idx === state.activeIndex ? "is-active" : "";
  const matchHint = isAbbreviationMatch(row, query)
    ? `<span class="suggestion__match-hint">缩写匹配</span>`
    : "";

  return `
    <button class="suggestion ${activeCls}" data-id="${escapeHtml(String(row.id))}" data-idx="${idx}" type="button">
      <div class="suggestion__main">
        <div class="suggestion__title-row">
          <div class="suggestion__title">${escapeHtml(row.title || "\u672a\u77e5\u671f\u520a")}</div>
          ${matchHint}
        </div>
        <div class="suggestion__meta">${escapeHtml(safe(ids))}</div>
      </div>
      <div class="suggestion__side">
        <div class="suggestion__if">IF${escapeHtml(ifYearText)}${ifNewBadge} ${escapeHtml(ifText)}${ifDeltaBadge}</div>
        <div class="tags">${tagsHtml}</div>
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

async function gotoPickedSuggestion() {
  if (!els.searchInput) return;
  const q = els.searchInput.value.trim();
  if (!q) return;

  let picked = state.suggestions[state.activeIndex >= 0 ? state.activeIndex : 0];
  if (picked) {
    gotoDetail(picked.id, q);
    return;
  }

  const fallback = await findSuggestionsRemoteFirst(q, 1).catch((err) => {
    showLoadError(err);
    return [];
  });
  picked = fallback[0];
  if (picked) gotoDetail(picked.id, q);
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
      "<p class='placeholder'>\u672a\u627e\u5230\u5339\u914d\u671f\u520a\uff0c\u8bf7\u5c1d\u8bd5\u66f4\u5b8c\u6574\u7684\u540d\u79f0\u3001ISSN \u6216 CN \u53f7</p>";
    return;
  }

  els.suggestionPanel.innerHTML = state.suggestions.map((row, i) => suggestionItem(row, i)).join("");
  els.suggestionPanel.querySelectorAll(".suggestion").forEach((btn) => {
    btn.addEventListener("click", () => gotoDetail(Number(btn.dataset.id), query));
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
  let rows = [];
  try {
    rows = await findSuggestionsRemoteFirst(q);
  } catch (err) {
    console.error("Journal search API failed:", err);
    if (seq === state.searchRequestSeq) {
      setPanelMessage("\u68c0\u7d22\u670d\u52a1\u6682\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5");
    }
    return;
  }

  if (seq !== state.searchRequestSeq) return;
  renderSuggestionRows(q, rows);
}

function applyFilterHint() {
  if (!els.activeFilter) return;
  if (state.minIF === null) {
    els.activeFilter.hidden = true;
    els.activeFilter.textContent = "";
    return;
  }
  els.activeFilter.hidden = false;
  els.activeFilter.innerHTML = `<span class="status-badge status-badge--neutral">\u7b5b\u9009\u4e2d\uff1aIF &gt;= ${escapeHtml(String(
    state.minIF
  ))}</span>`;
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
  const m = input.match(/^\s*>\s*filter\s+if\s*>\s*(\d+(?:\.\d+)?)\s*$/i);
  if (!m) return null;
  return Number(m[1]);
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
      key: "reset-filter",
      title: "\u6e05\u9664 IF \u7b5b\u9009",
      desc: "\u6062\u590d\u4e0d\u5e26 IF \u9608\u503c\u7684\u8054\u60f3\u7ed3\u679c",
      run: () => {
        state.minIF = null;
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
        title: `\u5e94\u7528\u7b5b\u9009\uff1aIF >= ${filterValue}`,
        desc: "\u4ec5\u4fdd\u7559\u6ee1\u8db3\u9608\u503c\u7684\u671f\u520a\u8054\u60f3\u7ed3\u679c",
        run: () => {
          state.minIF = filterValue;
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
    void renderSuggestions();
  });
  els.searchInput.addEventListener("focus", () => {
    if (els.searchInput.value.trim()) void renderSuggestions();
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
      void renderSuggestions();
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
