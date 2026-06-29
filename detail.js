const SOURCE_INFO = {
  core: {
    title: "核心指标说明",
    body: `
      <p>本页展示期刊投稿常用的核心评价信息，帮助你快速判断目标期刊定位与风险。</p>
      <p>主要包括 JCR 分区、影响因子、中科院分区、预警信息与科协分级等维度。</p>
      <p>若同一期刊存在多年份数据，页面默认优先展示最新年份结果。</p>
    `,
  },
  showjcr: {
    title: "历年数据说明",
    body: `
      <p>趋势图用于展示同一期刊在不同年份中的 IF 与中科院分区变化。</p>
      <p>你可以将鼠标移动到图中节点，查看该年的具体数值。</p>
      <p>图表用于辅助比较，不替代你所在单位的正式认定规则。</p>
    `,
  },
  hq: {
    title: "科协高质量期刊分级说明",
    body: `
      <p>为贯彻落实《关于深化改革 培育世界一流科技期刊的意见》，推动建设中外期刊同质等效的评价导向，引导更多高水平成果在国内期刊发表，中国科协自 2019 年起分批支持全国学会面向学科领域国内外科技期刊编制并发布高质量期刊分级目录，为科技工作者论文发表和科研机构学术评价提供参考。截至 2025 年 12 月 1 日，已完成 59 个学科领域的分级目录编制。</p>
      <p>2025 年度《高质量科技期刊分级目录总汇（第五版）》新增药学领域分级目录，并由 20 家全国学会牵头对已发布的 20 个学科领域目录进行了优化调整，持续完善分级标准与目录结构。</p>
      <p>参与优化调整的学会包括：中国自动化学会、中国地理学会、中国细胞生物学学会、中国汽车工程学会、中国生态学学会、中国材料研究学会、中国通信学会、中国仪器仪表学会、中国计算机学会、中国核学会、中国硅酸盐学会、中华预防医学会、中国环境科学学会、中国仿真学会、中国纺织工程学会、中国兵工学会、中国地球物理学会、中国航海学会、中国公路学会、中国优选法统筹法与经济数学研究会。</p>
      <p>本页面中的“科协评级”展示对应期刊在相关学科目录中的分级结果（如 T1、T2）。同一期刊可能在多个学科目录中出现并对应多条记录，建议与 JCR、中科院分区及本单位政策结合使用。</p>
    `,
  },
  warning: {
    title: "预警信息说明",
    body: `
      <p>高风险仅由中科院预警、新锐预警等强预警信号触发，帮助你在选刊阶段优先规避明确问题。</p>
      <p>CAR/JCAR、撤稿与更正记录属于复核线索，不单独等同于高风险或剔除结论。</p>
      <p>不同年份的预警标签可能存在口径差异，建议以当年官方说明和本单位政策为准。</p>
      <p>最终是否投稿，请结合课题方向、单位政策与导师建议综合判断。</p>
    `,
  },
  citescore: {
    title: "CiteScore 说明",
    body: `
      <p>CiteScore 是 Scopus 期刊评价指标之一，本页同时展示 SJR、SNIP 与学科分区信息。</p>
      <p>学科表格包含大类/小类、分区、排名和百分位，便于横向比较期刊位置。</p>
      <p>当官方数据暂不可用时，页面只提示接口状态，不使用公开聚合数据替代官方 CiteScore。</p>
    `,
  },
  predicted_if: {
    title: "动态预测IF说明",
    body: `
      <p>“动态预测IF”是非官方估算值，不是 Clarivate / JCR 发布的正式影响因子。</p>
      <p>本地服务会调用 OpenAlex 公开 Source 数据，比较目标年度前两年论文群与上一轮官方 IF 对应论文群的引用率变化，并用最新官方 IF 做收缩校准。</p>
      <p>简化公式：预测 IF ≈ 最新官方 IF × 校准后的 OpenAlex 引用率变化；校准会降低近年累积引用不足带来的系统性低估。</p>
      <p>它会受到 OpenAlex 覆盖范围、索引延迟、论文类型口径与 JCR 清洗规则影响，只适合早期选刊筛查，不建议用于正式评价。</p>
    `,
  },
  annual_articles: {
    title: "年发文量说明",
    body: `
      <p>“年发文量”及右侧“年发文量变化”图主要来自 OpenAlex 的公开聚合数据（按期刊 Source 分组统计）。</p>
      <p>该口径受数据收录范围、索引延迟、期刊更名/合并及回溯更新影响，可能与出版社官网、JCR 或 Scopus 的正式统计存在差异。</p>
      <p>本页面数据用于选刊阶段的趋势参考，不建议作为单位考核或正式评价的唯一依据。</p>
    `,
  },
  index_type: {
    title: "收录类型说明",
    body: `
      <p>这里按 Web of Science / Clarivate 的官方索引名称展示，如 SCIE、SSCI、AHCI、ESCI 等。</p>
      <p>国内常说的“SCI期刊”多是习惯性泛称；在当前 WoS / Master Journal List 口径下，科学类期刊的正式索引名通常是 SCIE（Science Citation Index Expanded）。</p>
      <p>因此，若官方记录为 SCIE，页面只显示 SCIE，不再额外写成“SCI / SCIE”。</p>
    `,
  },
  apc: {
    title: "APC 费用说明",
    body: `
      <p>APC 参考价用于提示开放获取或 Hybrid OA 发表选项可能涉及的文章处理费，不代表这本期刊所有文章都要缴费，也不代表最终账单金额。</p>
      <p>页面优先匹配本地整理的出版社官方 APC 数据库；官方库缺失时展示 DOAJ 等本地目录字段中的 APC 金额；仍缺失时，使用 OpenAlex 的 apc_prices / apc_usd 作为参考价。</p>
      <p>外币价格会同时折算为人民币约值，页面用“≈”标记。汇率优先来自 Frankfurter 公开 API，并在浏览器本地缓存 12 小时。</p>
      <p>官方 APC 数据库来自 Elsevier、Wiley、Springer Nature、MDPI、Frontiers、SAGE、Cambridge University Press、IEEE、PLOS、Emerald 等出版社公开价目表或期刊收费页面。能按 ISSN 匹配时优先使用 ISSN；仅有期刊名的来源会结合出版社线索后再匹配。</p>
      <p>OpenAlex 对 APC 的口径属于粗略估算，可能来自期刊标价、出版社页面或 OpenAPC 等实际支付样本。</p>
      <p>实际费用会受到文章类型、OA 协议、机构折扣、税费、币种和出版社更新影响，投稿前请以期刊官网或出版社价目表为准。</p>
    `,
  },
  oa: {
    title: "OA 模式说明",
    body: `
      <p>OA 模式不是简单的“是/否”。完全 OA 期刊通常整刊开放获取；Hybrid OA 期刊通常是订阅期刊，但作者可以选择将单篇文章开放发表并支付 APC；非完全 OA 表示暂未识别为整刊 OA，仍可能存在 Hybrid OA 选项。</p>
      <p>页面会优先使用出版社官方 APC 价目表中的业务模式，其次参考 DOAJ/本地字段和 OpenAlex 的来源标记。</p>
    `,
  },
};

const els = {
  title: document.getElementById("title"),
  subtitle: document.getElementById("subtitle"),
  topTags: document.getElementById("topTags"),
  coreGrid: document.getElementById("coreGrid"),
  spotlightCover: document.getElementById("spotlightCover"),
  journalSummary: document.getElementById("journalSummary"),
  journalWebsite: document.getElementById("journalWebsite"),
  citeScoreCard: document.getElementById("citeScoreCard"),
  impactIfValue: document.getElementById("impactIfValue"),
  impactIfDelta: document.getElementById("impactIfDelta"),
  impactIfMeta: document.getElementById("impactIfMeta"),
  impactIfNewBadge: document.getElementById("impactIfNewBadge"),
  predictedIfValue: document.getElementById("predictedIfValue"),
  predictedIfMeta: document.getElementById("predictedIfMeta"),
  citeScoreValue: document.getElementById("citeScoreValue"),
  citeScoreMetrics: document.getElementById("citeScoreMetrics"),
  citeScoreStars: document.getElementById("citeScoreStars"),
  citeScoreMeta: document.getElementById("citeScoreMeta"),
  citeScoreSource: document.getElementById("citeScoreSource"),
  citeScorePercentLabel: document.getElementById("citeScorePercentLabel"),
  citeScorePercentValue: document.getElementById("citeScorePercentValue"),
  citeScorePercentFill: document.getElementById("citeScorePercentFill"),
  citeScoreBreakdown: document.getElementById("citeScoreBreakdown"),
  spotPublisher: document.getElementById("spotPublisher"),
  spotIndexType: document.getElementById("spotIndexType"),
  spotOA: document.getElementById("spotOA"),
  spotApc: document.getElementById("spotApc"),
  spotPublishYear: document.getElementById("spotPublishYear"),
  spotAnnualArticles: document.getElementById("spotAnnualArticles"),
  ifTrendChart: document.getElementById("ifTrendChart"),
  casTrendChart: document.getElementById("casTrendChart"),
  annualTrendChart: document.getElementById("annualTrendChart"),
  trendTabs: Array.from(document.querySelectorAll("[data-trend-tab]")),
  trendStageTitle: document.getElementById("trendStageTitle"),
  trendStageZoom: document.getElementById("trendStageZoom"),
  hqMetaGrid: document.getElementById("hqMetaGrid"),
  hqRecordList: document.getElementById("hqRecordList"),
  submissionSection: document.querySelector(".panel--submission"),
  submissionPanel: document.getElementById("submissionPanel"),
  paperEvidencePanel: document.getElementById("paperEvidencePanel"),
  relatedList: document.getElementById("relatedList"),
  sourceModal: document.getElementById("sourceModal"),
  sourceModalTitle: document.getElementById("sourceModalTitle"),
  sourceModalBody: document.getElementById("sourceModalBody"),
  sourceModalClose: document.getElementById("sourceModalClose"),
  chartModal: document.getElementById("chartModal"),
  chartModalTitle: document.getElementById("chartModalTitle"),
  chartModalBody: document.getElementById("chartModalBody"),
  chartModalClose: document.getElementById("chartModalClose"),
};
const homepagePreviewImageCache = new Map();
const annualArticlesSeriesCache = new Map();
const paperEvidenceCache = new Map();
const predictedIfCache = new Map();
const predictedIfRequestCache = new Map();
const citeScoreMetricCache = new Map();
const citeScoreRequestCache = new Map();
const apcExchangeRateCache = new Map();
const apcExchangeRateRequestCache = new Map();
const publicationStartYearCache = new Map();
const officialApcIndexCache = new Map();
let chartPointTipEl = null;
let activeChartTipPoint = null;
const officialApcIndexRequestCache = new Map();
const officialApcCatalogCache = new Map();
const officialApcCatalogRequestCache = new Map();
const officialApcRecordChunkCache = new Map();
const officialApcRecordChunkRequestCache = new Map();
const pageState = {
  journal: null,
  latestCas: null,
  openAlexSource: null,
  paperEvidence: null,
  submissionStats: null,
  submissionNotice: null,
  submissionLoading: false,
  apcRateKey: "",
  officialApcKey: "",
};

const API_BASE = getApiBase();
const DETAIL_API_TIMEOUT_MS = 15000;
const DETAIL_API_RETRY_DELAY_MS = 500;
const STATIC_DATA_FALLBACK_ENABLED =
  window.JOURNAL_SCOUT_ALLOW_STATIC_DATA === true ||
  new URLSearchParams(window.location.search).get("staticData") === "1";
const STATIC_OFFICIAL_APC_ENABLED =
  STATIC_DATA_FALLBACK_ENABLED ||
  window.JOURNAL_SCOUT_ALLOW_STATIC_APC === true ||
  new URLSearchParams(window.location.search).get("staticApc") === "1";
const ELSEVIER_API_TIMEOUT_MS = 8000;
const PREDICTED_IF_TIMEOUT_MS = 9000;
const METRIC_CACHE_PREFIX = "journalScoutMetric";
const CITESCORE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CITESCORE_NEGATIVE_CACHE_TTL_MS = 5 * 60 * 1000;
const PREDICTED_IF_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PREDICTED_IF_NEGATIVE_CACHE_TTL_MS = 60 * 60 * 1000;
const SCHOLAR_EVIDENCE_TIMEOUT_MS = 5000;
const SCHOLAR_EVIDENCE_ROWS = 8;
const CAR_RISK_TIMEOUT_MS = 4500;
const PUBLICATION_START_YEAR_TIMEOUT_MS = 4500;
const DETAIL_PAGE_REV = "20260617-jcr-v31";
const DATA_REV = "20260617-jcr-2025-full-v2";
const LATEST_OFFICIAL_JIF_YEAR = 2025;
const APC_EXCHANGE_RATE_API_URL = "https://api.frankfurter.dev/v2/rates";
const APC_EXCHANGE_RATE_TTL_MS = 12 * 60 * 60 * 1000;
const OFFICIAL_APC_CATALOG_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const OFFICIAL_APC_TIMEOUT_MS = 3500;
const APC_FALLBACK_CNY_RATE_DATE = "2026-06-16";
const APC_CNY_REFERENCE_RATES = {
  CNY: 1,
  RMB: 1,
  USD: 6.76,
  EUR: 7.84,
  GBP: 9.07,
  JPY: 0.042,
  CHF: 8.37,
};

function getApiBase() {
  if (["127.0.0.1", "localhost"].includes(window.location.hostname) && /^https?:$/.test(window.location.protocol)) {
    return `${window.location.origin}/api`;
  }
  return "https://www.scansci.com/api";
}

const TREND_CHARTS = {
  if: {
    chartId: "ifTrendChart",
    title: "IF 历年变化",
    zoomLabel: "放大 IF 历年变化图",
  },
  cas: {
    chartId: "casTrendChart",
    title: "中科院分区变化（发布年份）",
    zoomLabel: "放大中科院分区变化图",
  },
  annual: {
    chartId: "annualTrendChart",
    title: "年发文量变化",
    zoomLabel: "放大年发文量变化图",
  },
};

const OFFICIAL_APC_PRICE_PATHS = [
  `./data/official_apc_prices.json?v=${DETAIL_PAGE_REV}`,
  `/data/official_apc_prices.json?v=${DETAIL_PAGE_REV}`,
  `./xuankan/demo_site/data/official_apc_prices.json?v=${DETAIL_PAGE_REV}`,
  `/xuankan/demo_site/data/official_apc_prices.json?v=${DETAIL_PAGE_REV}`,
];

const OFFICIAL_APC_ISSN_INDEX_PATHS = [
  `./data/official_apc_issns.json?v=${DETAIL_PAGE_REV}`,
  `/data/official_apc_issns.json?v=${DETAIL_PAGE_REV}`,
  `./xuankan/demo_site/data/official_apc_issns.json?v=${DETAIL_PAGE_REV}`,
  `/xuankan/demo_site/data/official_apc_issns.json?v=${DETAIL_PAGE_REV}`,
];

const OFFICIAL_APC_LOOKUP_INDEX_PATHS = [
  `./data/official_apc_lookup_index.json?v=${DETAIL_PAGE_REV}`,
  `/data/official_apc_lookup_index.json?v=${DETAIL_PAGE_REV}`,
  `./xuankan/demo_site/data/official_apc_lookup_index.json?v=${DETAIL_PAGE_REV}`,
  `/xuankan/demo_site/data/official_apc_lookup_index.json?v=${DETAIL_PAGE_REV}`,
];

const OFFICIAL_APC_RECORD_CHUNK_PATHS = [
  `./data/official_apc_records/chunk-{chunk}.json?v=${DETAIL_PAGE_REV}`,
  `/data/official_apc_records/chunk-{chunk}.json?v=${DETAIL_PAGE_REV}`,
  `./xuankan/demo_site/data/official_apc_records/chunk-{chunk}.json?v=${DETAIL_PAGE_REV}`,
  `/xuankan/demo_site/data/official_apc_records/chunk-{chunk}.json?v=${DETAIL_PAGE_REV}`,
];

const CHUNK_MANIFEST_PATHS = [
  "./data/journal_chunks_manifest.json",
  "/data/journal_chunks_manifest.json",
  "./xuankan/demo_site/data/journal_chunks_manifest.json",
  "/xuankan/demo_site/data/journal_chunks_manifest.json",
];

const SEARCH_INDEX_PATHS = [
  "./data/search_index.json",
  "/data/search_index.json",
  "./xuankan/demo_site/data/search_index.json",
  "/xuankan/demo_site/data/search_index.json",
];

const RELATED_INDEX_PATHS = [
  "./data/related_index.json",
  "/data/related_index.json",
  "./xuankan/demo_site/data/related_index.json",
  "/xuankan/demo_site/data/related_index.json",
];

const FULL_DATA_PATHS = [
  "./data/journals.json",
  "/data/journals.json",
  "./xuankan/demo_site/data/journals.json",
  "/xuankan/demo_site/data/journals.json",
];

function safe(v) {
  return v === null || v === undefined || v === "" ? "-" : String(v);
}

function isBlankValue(v) {
  return v === null || v === undefined || String(v).trim() === "" || String(v).trim() === "-";
}

function setSoftValue(el, value, fallback = "待补充") {
  if (!el) return;
  const blank = isBlankValue(value);
  el.textContent = blank ? fallback : String(value);
  el.classList.toggle("is-muted", blank);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toBoolText(v) {
  if (v === true) return "是";
  if (v === false) return "否";
  return "-";
}

function levelRank(level) {
  const s = String(level || "").trim();
  const su = s.toUpperCase();
  if (/^T[1-4]$/i.test(s)) return Number(s.slice(1));
  if (su === "A+" || su === "A类") return 11;
  if (su === "A") return 12;
  if (su === "B类" || su === "B") return 13;
  if (su === "C类" || su === "C") return 14;
  if (su === "D") return 15;
  return 99;
}

function yearNum(v) {
  const n = Number(String(v || "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatIFAcademicYear(rawYear) {
  const y = yearNum(rawYear);
  if (!y) return "";
  return `${y}-${y + 1}年度`;
}

function formatOfficialJifMeta(rawYear) {
  const y = yearNum(rawYear);
  if (!y) return "";
  return `${y} JIF · ${y + 1} JCR`;
}

function isLatestOfficialJifYear(rawYear) {
  const y = yearNum(rawYear);
  return y >= LATEST_OFFICIAL_JIF_YEAR;
}

function formatDateShort(raw) {
  const text = String(raw || "").trim();
  if (!text) return "-";
  const parsed = new Date(text);
  if (!Number.isFinite(parsed.getTime())) return text.slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function casRankNumber(raw) {
  const m = String(raw || "").match(/([1-4])\s*区/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function formatCASSubcategoriesMultiline(subcategories) {
  const rows = Array.isArray(subcategories)
    ? subcategories
        .map((r) => ({
          name: String(r?.name || "").trim(),
          rank: String(r?.rank || "").trim(),
        }))
        .filter((r) => r.name || r.rank)
    : [];
  if (!rows.length) return "-";
  return rows
    .map((r) => {
      if (r.name && r.rank) return `${r.name}（${r.rank}）`;
      return r.name || r.rank;
    })
    .join("\n");
}

function collectIndexSignals(j, latestCas = null) {
  const casRows = Array.isArray(j?.cas_history) ? j.cas_history : [];
  const texts = [];
  if (latestCas?.wos) texts.push(String(latestCas.wos));
  for (const row of casRows) {
    if (row?.wos) texts.push(String(row.wos));
  }
  const tags = Array.isArray(j?.tags) ? j.tags : [];
  for (const t of tags) {
    if (t !== null && t !== undefined) texts.push(String(t));
  }

  const merged = texts.join(" ").toUpperCase();
  const tokenSet = new Set(
    merged
      .replace(/[^A-Z0-9]+/g, " ")
      .split(/\s+/)
      .map((x) => x.trim())
      .filter(Boolean)
  );

  const hasSCIE = merged.includes("SCIE") || tokenSet.has("SCIE");
  const hasESCI = merged.includes("ESCI") || tokenSet.has("ESCI");

  return {
    hasSCI: tokenSet.has("SCI"),
    hasSCIE,
    hasESCI,
    hasEI: tokenSet.has("EI"),
    hasSSCI: merged.includes("SSCI") || tokenSet.has("SSCI"),
  };
}

function buildInclusionTypeText(signals) {
  const types = [];
  if (signals?.hasSCIE) types.push("SCIE");
  else if (signals?.hasSCI) types.push("SCI");
  if (signals?.hasSSCI) types.push("SSCI");
  if (signals?.hasESCI) types.push("ESCI");
  if (signals?.hasEI) types.push("EI");
  return types.length ? types.join(" / ") : "-";
}

function numberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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

function cloneJson(value) {
  if (value === null || value === undefined) return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return value;
  }
}

function metricStorageKey(kind, key) {
  const safeKey = String(key || "")
    .replace(/[^A-Za-z0-9_.:-]+/g, "_")
    .slice(0, 220);
  return `${METRIC_CACHE_PREFIX}:${kind}:${safeKey}`;
}

function readMetricCache(memoryCache, kind, key) {
  const normalizedKey = String(key || "");
  if (!normalizedKey) return null;
  const now = Date.now();
  const memoryItem = memoryCache.get(normalizedKey);
  if (memoryItem && memoryItem.expiresAt > now) return cloneJson(memoryItem.payload);
  if (memoryItem) memoryCache.delete(normalizedKey);

  try {
    const raw = window.localStorage?.getItem(metricStorageKey(kind, normalizedKey));
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (!item || Number(item.expiresAt) <= now) {
      window.localStorage?.removeItem(metricStorageKey(kind, normalizedKey));
      return null;
    }
    memoryCache.set(normalizedKey, { expiresAt: Number(item.expiresAt), payload: item.payload });
    return cloneJson(item.payload);
  } catch (_) {
    return null;
  }
}

function writeMetricCache(memoryCache, kind, key, payload, ttlMs) {
  const normalizedKey = String(key || "");
  const ttl = Number(ttlMs);
  if (!normalizedKey || !payload || !Number.isFinite(ttl) || ttl <= 0) return;
  const item = { expiresAt: Date.now() + ttl, payload: cloneJson(payload) };
  memoryCache.set(normalizedKey, item);
  try {
    window.localStorage?.setItem(metricStorageKey(kind, normalizedKey), JSON.stringify(item));
  } catch (_) {
    // Browser storage may be disabled or full; memory cache still covers this page session.
  }
}

function deleteMetricCache(memoryCache, kind, key) {
  const normalizedKey = String(key || "");
  if (!normalizedKey) return;
  memoryCache.delete(normalizedKey);
  try {
    window.localStorage?.removeItem(metricStorageKey(kind, normalizedKey));
  } catch (_) {
    // Ignore storage failures.
  }
}

function extractYearToken(raw) {
  const m = String(raw || "").match(/(20\d{2})/);
  return m ? Number(m[1]) : null;
}

function walkObject(node, visitor, path = []) {
  if (node === null || node === undefined) return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkObject(v, visitor, path.concat(String(i))));
    return;
  }
  if (typeof node === "object") {
    Object.entries(node).forEach(([k, v]) => {
      visitor(k, v, path.concat(k));
      walkObject(v, visitor, path.concat(k));
    });
  }
}

function getParams() {
  const u = new URL(window.location.href);
  return {
    id: Number(u.searchParams.get("id") || 0),
    q: u.searchParams.get("q") || "",
  };
}

function ensureDetailPageRevision() {
  const u = new URL(window.location.href);
  if (u.searchParams.get("v") === DETAIL_PAGE_REV) return;
  u.searchParams.set("v", DETAIL_PAGE_REV);
  window.history.replaceState(null, "", u.toString());
}

function lastYearToken(text) {
  const arr = String(text || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return arr.length ? arr[arr.length - 1] : "";
}

function buildPriorityTags(row) {
  const tags = [];
  const rowTags = Array.isArray(row.tags) ? row.tags.map((x) => String(x || "").trim()).filter(Boolean) : [];
  const pushTag = (text, cls) => {
    const t = String(text || "").trim();
    if (!t) return;
    if (tags.some((x) => x.text === t)) return;
    tags.push({ text: t, cls });
  };

  if (row.jcr_quartile) {
    pushTag(`JCR ${row.jcr_quartile}`, "tag--jcr");
  }
  if (row.xuankan_2026) {
    pushTag(`新锐${row.xuankan_2026}`, "tag--xuankan");
  }
  if (row.cas_2025) {
    const top = row.is_top === true ? " (Top)" : "";
    pushTag(`中科院${row.cas_2025}${top}`, "tag--cas");
  }
  if (row.hq_level) {
    pushTag(`科协-${row.hq_level}`, "tag--hq");
  }
  if (row.ni_journal === true || rowTags.includes("NI期刊")) {
    pushTag("NI期刊", "tag--ni");
  }
  if (row.pku_core === true || rowTags.includes("北大核心")) {
    pushTag("北大核心", "tag--pku");
  }
  let cssciType = String(row.cssci_type || "").trim();
  if (!cssciType) {
    if (rowTags.includes("CSSCI(扩展)") || rowTags.includes("CSSCI扩展")) cssciType = "扩展版";
    else if (rowTags.includes("CSSCI")) cssciType = "来源版";
  }
  if (cssciType) {
    pushTag(cssciType === "扩展版" ? "CSSCI(扩展)" : "CSSCI", "tag--cssci");
  }
  let cscdType = String(row.cscd_type || "").trim();
  if (!cscdType) {
    const cscdTag = rowTags.find((t) => t.startsWith("CSCD-"));
    if (cscdTag) cscdType = cscdTag.slice(5);
    else if (rowTags.includes("CSCD(核心)") || rowTags.includes("CSCD核心")) cscdType = "核心库";
    else if (rowTags.includes("CSCD(扩展)") || rowTags.includes("CSCD扩展")) cscdType = "扩展库";
    else if (rowTags.includes("CSCD")) cscdType = "核心库";
  }
  if (cscdType) {
    pushTag(`CSCD-${cscdType}`, "tag--cscd");
  }

  const wosKnown = new Set(["SCI", "SCIE", "SSCI", "ESCI", "AHCI"]);
  const wosOut = new Set();
  for (const raw of rowTags) {
    const upper = String(raw || "").toUpperCase();
    const parts = upper.replace(/[^A-Z]+/g, " ").split(/\s+/).filter(Boolean);
    for (const p of parts) {
      if (wosKnown.has(p)) wosOut.add(p);
    }
    if (upper.includes("SCIE")) wosOut.add("SCIE");
    if (upper.includes("SSCI")) wosOut.add("SSCI");
    if (upper.includes("ESCI")) wosOut.add("ESCI");
    if (upper.includes("AHCI")) wosOut.add("AHCI");
    if (/\bSCI\b/.test(upper.replace(/[^A-Z]/g, " "))) wosOut.add("SCI");
  }
  for (const token of wosOut) {
    pushTag(token, "tag--wos");
  }
  if (rowTags.some((t) => String(t).toUpperCase() === "EI")) {
    pushTag("EI", "tag--ei");
  }
  if (row.xuankan_warning) {
    pushTag("新锐预警", "tag--xuankan-warn");
  }
  if (row.warning_latest) {
    pushTag("中科院预警", "tag--warn");
  }
  return tags;
}

function hasNatureIndexNewSignal(row) {
  const rowTags = Array.isArray(row?.tags) ? row.tags.map((x) => String(x || "").trim()).filter(Boolean) : [];
  return row?.ni_new === true || rowTags.includes("NEW") || rowTags.includes("NI新增");
}

function buildNatureIndexCoreValue(row) {
  if (!hasNatureIndexNewSignal(row)) return "是";
  return `是<span class="ni-new-label" title="Nature Index 2026 新增" aria-label="Nature Index 2026 新增">NEW</span>`;
}

function renderTopTags(row) {
  const tags = buildPriorityTags(row);
  els.topTags.innerHTML = tags.length
    ? tags.map((t) => `<span class="tag ${t.cls}">${escapeHtml(t.text)}</span>`).join("")
    : "<span class='tag tag--empty'>无核心标签</span>";
}

function infoButton(infoKey) {
  return `<button class="inline-info" type="button" data-info="${escapeHtml(infoKey)}" aria-label="查看数据说明">?</button>`;
}

function textHash(input) {
  let h = 0;
  const s = String(input || "");
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) % 360;
  }
  return h;
}

function normalizeHttpUrl(raw) {
  let s = String(raw || "").trim();
  if (!s) return "";
  s = s
    .replace(/^https?:\/\/(https?)\/\//i, "$1://")
    .replace(/^(https?)\/\//i, "$1://")
    .replace(/^\/\//, "https://");
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const url = new URL(s);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (/^https?$/i.test(url.hostname) && /^\/\//.test(url.pathname)) {
      const repaired = `${url.hostname.toLowerCase()}://${url.pathname.replace(/^\/+/, "")}${url.search}${url.hash}`;
      return new URL(repaired).href;
    }
    return url.href;
  } catch (_) {
    return "";
  }
}

const NON_OFFICIAL_HOST_PATTERNS = [
  /(^|\.)dblp\.org$/i,
  /(^|\.)dblp\.uni-trier\.de$/i,
  /(^|\.)letpub\.com\.cn$/i,
  /(^|\.)wikipedia\.org$/i,
  /(^|\.)baidu\.com$/i,
  /(^|\.)resurchify\.com$/i,
  /(^|\.)scijournal\.org$/i,
  /(^|\.)x-mol\.com$/i,
  /(^|\.)aminer\.cn$/i,
  /(^|\.)ccf\.org\.cn$/i,
];

function isLikelyOfficialWebsite(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (NON_OFFICIAL_HOST_PATTERNS.some((r) => r.test(host))) return false;
    if (u.pathname.toLowerCase().includes("/db/journals/")) return false;
    return true;
  } catch (_) {
    return false;
  }
}

function resolveWebsite(j) {
  const normalized = normalizeHttpUrl(j.official_url);
  return isLikelyOfficialWebsite(normalized) ? normalized : "";
}

function parseDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./i, "");
  } catch (_) {
    return "";
  }
}

function buildLogoUrl(url) {
  const domain = parseDomain(url);
  if (!domain) return "";
  return `https://logo.clearbit.com/${domain}?size=360`;
}

function setSpotlightWebsite(url, label = "访问期刊官网") {
  if (!url) {
    els.journalWebsite.href = "#";
    els.journalWebsite.textContent = "官网待识别";
    els.journalWebsite.classList.add("is-disabled");
    return;
  }
  els.journalWebsite.href = url;
  els.journalWebsite.textContent = label;
  els.journalWebsite.classList.remove("is-disabled");
}

function resetSpotlight(reason = "无数据") {
  els.spotlightCover.style.background = "transparent";
  els.spotlightCover.innerHTML = `<p class="placeholder">${escapeHtml(reason)}</p>`;
  els.journalSummary.textContent = "";
  els.journalSummary.classList.add("is-muted");
  setSpotlightWebsite("");
  setSoftValue(els.spotPublisher, null);
  setSoftValue(els.spotIndexType, null);
  setOaModeDisplay(null);
  setApcDisplay(null);
  setSoftValue(els.spotPublishYear, null);
  setSoftValue(els.spotAnnualArticles, null);
  if (els.impactIfValue) els.impactIfValue.textContent = "-";
  if (els.impactIfDelta) {
    els.impactIfDelta.hidden = true;
    els.impactIfDelta.textContent = "";
    els.impactIfDelta.removeAttribute("title");
  }
  if (els.impactIfMeta) {
    els.impactIfMeta.textContent = "暂无 JCR 数据";
    els.impactIfMeta.classList.add("is-muted");
  }
  if (els.impactIfNewBadge) els.impactIfNewBadge.hidden = true;
  resetPredictedImpactFactor("暂无预测数据");
  setCiteScoreCardState({
    score: null,
    year: "",
    percentile: null,
    meta: "暂无 CiteScore 数据",
    source: "数据来源：待更新",
  });
}

async function fetchElsevierViaApi(issn) {
  const normalizedIssn = String(issn || "").trim();
  if (!normalizedIssn) return { ok: false, reason: "missing_issn", payload: null };

  const url = `${API_BASE}/elsevier/serial-title?issn=${encodeURIComponent(normalizedIssn)}`;
  const headers = { Accept: "application/json" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ELSEVIER_API_TIMEOUT_MS);

  try {
    const resp = await fetch(url, { method: "GET", headers, signal: controller.signal });
    let payload = null;
    try {
      payload = await resp.json();
    } catch (_) {
      payload = null;
    }
    if (!resp.ok) {
      const proxyError = String(payload?.error || "").trim();
      const reason = proxyError ? `api_${proxyError}` : `api_http_${resp.status}`;
      return { ok: false, reason, payload };
    }
    return { ok: true, reason: "", payload };
  } catch (_) {
    return { ok: false, reason: "api_unreachable", payload: null };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHomepagePreviewImage(url) {
  const normalizedUrl = normalizeHttpUrl(url);
  if (!normalizedUrl) return "";
  if (homepagePreviewImageCache.has(normalizedUrl)) {
    return homepagePreviewImageCache.get(normalizedUrl) || "";
  }

  const endpoint = `${API_BASE}/web/preview-image?url=${encodeURIComponent(normalizedUrl)}`;
  try {
    const resp = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!resp.ok) {
      homepagePreviewImageCache.set(normalizedUrl, "");
      return "";
    }
    const payload = await resp.json();
    const coverUrl = normalizeHttpUrl(payload?.cover_url || "");
    homepagePreviewImageCache.set(normalizedUrl, coverUrl || "");
    return coverUrl || "";
  } catch (_) {
    homepagePreviewImageCache.set(normalizedUrl, "");
    return "";
  }
}

function buildCiteScoreStars(rating5) {
  const safeRating = Math.max(0, Math.min(Number(rating5) || 0, 5));
  const stars = [];
  for (let i = 0; i < 5; i += 1) {
    const fill = Math.max(0, Math.min(safeRating - i, 1));
    stars.push(
      `<span class="cs-star"><span class="cs-star__base">★</span><span class="cs-star__fill" style="width:${(
        fill * 100
      ).toFixed(1)}%">★</span></span>`
    );
  }
  return stars.join("");
}

function normalizeCiteScoreToStars(score, percentile = null) {
  if (percentile !== null && percentile !== undefined) {
    const p = Math.max(0, Math.min(Number(percentile), 100));
    return (p / 100) * 5;
  }
  const s = Math.max(0, Number(score) || 0);
  return Math.min(s / 20, 5);
}

function deriveQuartileFromPercentile(percentile) {
  const p = Number(percentile);
  if (!Number.isFinite(p)) return "";
  if (p >= 75) return "Q1";
  if (p >= 50) return "Q2";
  if (p >= 25) return "Q3";
  return "Q4";
}

function normalizeCiteScoreSubjectRows(subjects) {
  if (!Array.isArray(subjects)) return [];
  const normalized = subjects
    .map((item) => {
      const level = String(item?.level || "").trim();
      const category = String(item?.category || "").trim();
      const subject = String(item?.subject || "").trim();
      const name = String(item?.name || "").trim();
      const rank = String(item?.rank || "").trim();
      const quartileRaw = String(item?.quartile || "").trim().toUpperCase();
      const quartile = /^Q[1-4]$/.test(quartileRaw)
        ? quartileRaw
        : deriveQuartileFromPercentile(item?.percentile);
      const percentileNum = parseFloatLoose(item?.percentile);
      const percentile = percentileNum !== null ? Math.max(0, Math.min(percentileNum, 100)) : null;
      const displayName = name || [category, subject].filter(Boolean).join(" / ");
      if (!displayName) return null;
      if (!quartile && !rank && percentile === null) return null;
      return {
        level: level || "学科",
        name: displayName,
        rank,
        quartile,
        percentile,
      };
    })
    .filter(Boolean);

  const deduped = [];
  const seen = new Set();
  for (const row of normalized) {
    const key = `${row.level}|${row.name}|${row.quartile}|${row.rank}|${row.percentile}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }

  deduped.sort((a, b) => {
    const levelOrder = { 大类: 1, 小类: 2, 学科: 3 };
    const la = levelOrder[a.level] || 9;
    const lb = levelOrder[b.level] || 9;
    if (la !== lb) return la - lb;
    const pa = a.percentile === null ? -1 : a.percentile;
    const pb = b.percentile === null ? -1 : b.percentile;
    if (pa !== pb) return pb - pa;
    return a.name.localeCompare(b.name, "zh-CN");
  });

  return deduped;
}

function formatMetricValue(v, digits = 3) {
  const n = parseFloatLoose(v);
  if (n === null) return "-";
  if (Math.abs(n) >= 100) return n.toFixed(1);
  return n.toFixed(digits).replace(/\.?0+$/, "");
}

function formatImpactFactorValue(value) {
  const n = parseFloatLoose(value);
  if (n === null) return "-";
  return n.toFixed(n >= 10 ? 1 : 2).replace(/\.?0+$/, "");
}

function findPreviousIfFromHistory(j, currentYear) {
  const rows = Array.isArray(j?.if_history) ? j.if_history : [];
  const targetYear = yearNum(currentYear || j?.if_year);
  if (!targetYear) return null;
  let best = null;
  for (const row of rows) {
    const rowYear = yearNum(row?.year);
    const rowValue = parseFloatLoose(row?.if_value);
    if (!rowYear || rowYear >= targetYear || rowValue === null) continue;
    if (!best || rowYear > best.year) {
      best = { year: rowYear, value: rowValue };
    }
  }
  return best;
}

function getIfDeltaInfo(j, currentYear = "") {
  const explicitDelta = parseFloatLoose(j?.if_delta);
  const explicitFromYear = String(j?.if_delta_from_year || "").trim();
  if (explicitDelta !== null && explicitFromYear) {
    return { delta: explicitDelta, fromYear: explicitFromYear };
  }

  const currentValue = parseFloatLoose(j?.if_2023);
  const previous = findPreviousIfFromHistory(j, currentYear || j?.if_year);
  if (currentValue === null || !previous) return null;
  return { delta: currentValue - previous.value, fromYear: String(previous.year) };
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

function parseJcrQuartile(value) {
  const match = String(value || "").trim().toUpperCase().match(/^Q([1-4])$/);
  return match ? Number(match[1]) : null;
}

function formatJcrReleaseYear(jifYear) {
  const year = yearNum(jifYear);
  return year ? String(year + 1) : "";
}

function findPreviousJcrQuartileFromHistory(j, currentYear = "") {
  const rows = Array.isArray(j?.if_history) ? j.if_history : [];
  const targetYear = yearNum(currentYear || j?.if_year);
  if (!targetYear) return null;
  let best = null;
  for (const row of rows) {
    const rowYear = yearNum(row?.year);
    const rowQuartile = String(row?.quartile || "").trim().toUpperCase();
    if (!rowYear || rowYear >= targetYear || parseJcrQuartile(rowQuartile) === null) continue;
    if (!best || rowYear > best.year) {
      best = { year: rowYear, quartile: rowQuartile };
    }
  }
  return best;
}

function buildJcrQuartileCoreValue(j, currentYear = "") {
  const currentQuartile = String(j?.jcr_quartile || "").trim().toUpperCase();
  const currentRank = parseJcrQuartile(currentQuartile);
  if (!currentQuartile || currentRank === null) return escapeHtml(safe(j?.jcr_quartile));

  const previous = findPreviousJcrQuartileFromHistory(j, currentYear || j?.if_year);
  const previousRank = previous ? parseJcrQuartile(previous.quartile) : null;
  if (!previous || previousRank === null || previousRank === currentRank) {
    return escapeHtml(currentQuartile);
  }

  const improved = currentRank < previousRank;
  const releaseYear = formatJcrReleaseYear(previous.year);
  const title = `较 ${releaseYear || previous.year} JCR：${previous.quartile} → ${currentQuartile}`;
  const cls = improved ? "jcr-quartile-trend--up" : "jcr-quartile-trend--down";
  const arrow = improved ? "↑" : "↓";
  return `${escapeHtml(currentQuartile)} <span class="jcr-quartile-trend ${cls}" title="${escapeHtml(title)}">${arrow} ${escapeHtml(
    previous.quartile
  )}→${escapeHtml(currentQuartile)}</span>`;
}

function renderIfDelta(j, currentYear = "") {
  if (!els.impactIfDelta) return;
  const info = getIfDeltaInfo(j, currentYear);
  if (!info) {
    els.impactIfDelta.hidden = true;
    els.impactIfDelta.textContent = "";
    els.impactIfDelta.removeAttribute("title");
    return;
  }
  const tone = ifDeltaTone(info.delta);
  els.impactIfDelta.hidden = false;
  els.impactIfDelta.textContent = formatIfDelta(info.delta);
  els.impactIfDelta.className = `impact-if-delta if-delta if-delta--${tone}`;
  els.impactIfDelta.title = `较 ${info.fromYear} JIF`;
}

function renderImpactFactor(j, ifYear = "") {
  if (!els.impactIfValue || !els.impactIfMeta) return;
  const value = parseFloatLoose(j?.if_2023);
  els.impactIfValue.textContent = formatImpactFactorValue(value);
  const jifMeta = formatOfficialJifMeta(ifYear || j?.if_year);
  els.impactIfMeta.textContent = value === null ? "暂无 JCR 数据" : (jifMeta || "JCR 最新数据");
  els.impactIfMeta.classList.toggle("is-muted", value === null);
  if (value === null) {
    if (els.impactIfDelta) els.impactIfDelta.hidden = true;
  } else {
    renderIfDelta(j, ifYear);
  }
  if (els.impactIfNewBadge) {
    els.impactIfNewBadge.hidden = value === null || !isLatestOfficialJifYear(ifYear || j?.if_year);
  }
}

function formatPredictedImpactFactorValue(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "-";
  return n.toFixed(n >= 10 ? 1 : 2).replace(/\.?0+$/, "");
}

function resetPredictedImpactFactor(meta = "计算中") {
  if (els.predictedIfValue) els.predictedIfValue.textContent = "-";
  if (els.predictedIfMeta) {
    els.predictedIfMeta.textContent = meta;
    els.predictedIfMeta.classList.add("is-muted");
  }
}

function setPredictedImpactFactorState(payload = {}) {
  if (!els.predictedIfValue || !els.predictedIfMeta) return;
  const value = parseFloatLoose(payload?.value ?? payload?.predicted_if);
  if (value === null || String(payload?.status || "").toLowerCase() === "unavailable") {
    els.predictedIfValue.textContent = "-";
    els.predictedIfMeta.textContent = payload?.message || "预测暂不可用";
    els.predictedIfMeta.classList.add("is-muted");
    return;
  }

  els.predictedIfValue.textContent = formatPredictedImpactFactorValue(value);
  els.predictedIfMeta.textContent = "基于OpenAlex实时估算，可能低估";
  els.predictedIfMeta.classList.remove("is-muted");
}

function buildPredictedImpactFactorUrl(j, ifYear = "") {
  const issn = normalizeIssnForQuery(j?.issn || j?.eissn || "");
  if (!issn) return "";
  const params = new URLSearchParams({ issn });
  const officialIf = parseFloatLoose(j?.if_2023);
  const officialYear = extractYearToken(ifYear || j?.if_year || "");
  if (officialIf !== null) params.set("official_if", String(officialIf));
  if (officialYear) params.set("official_year", String(officialYear));
  const eissn = normalizeIssnForQuery(j?.eissn || "");
  if (eissn && eissn !== issn) params.set("eissn", eissn);
  return `${API_BASE}/impact/predicted-if?${params.toString()}`;
}

function getPredictedImpactFactorCacheTtl(payload) {
  return String(payload?.status || "").toLowerCase() === "ok" ? PREDICTED_IF_CACHE_TTL_MS : PREDICTED_IF_NEGATIVE_CACHE_TTL_MS;
}

function buildOpenAlexPredictionSourceUrl(issn) {
  const params = new URLSearchParams({
    filter: `issn:${issn}`,
    "per-page": "1",
    select: "id,display_name,issn_l,issn,counts_by_year",
  });
  return `https://api.openalex.org/sources?${params.toString()}`;
}

async function fetchOpenAlexPredictionSource(j) {
  const issns = [...new Set([j?.issn, j?.eissn].filter(Boolean).map(normalizeIssnForQuery).filter(Boolean))];
  if (!issns.length) return null;
  const results = await Promise.all(
    issns.map(async (issn) => {
      const payload = await fetchJsonWithTimeout(buildOpenAlexPredictionSourceUrl(issn), 8000, {
        headers: { Accept: "application/json" },
      });
      return pickOpenAlexSource(payload?.results || [], j);
    })
  );
  return results.find(Boolean) || null;
}

function getOpenAlexYearCounts(source) {
  const rows = Array.isArray(source?.counts_by_year) ? source.counts_by_year : [];
  const counts = new Map();
  for (const row of rows) {
    const year = Number(row?.year);
    if (!Number.isFinite(year)) continue;
    counts.set(Math.trunc(year), {
      works_count: Math.max(0, Number(row?.works_count) || 0),
      cited_by_count: Math.max(0, Number(row?.cited_by_count) || 0),
    });
  }
  return counts;
}

function sumOpenAlexPredictionCounts(counts, years) {
  let works = 0;
  let cited = 0;
  const presentYears = [];
  for (const year of years) {
    const row = counts.get(year);
    if (!row) continue;
    presentYears.push(year);
    works += Number(row.works_count || 0);
    cited += Number(row.cited_by_count || 0);
  }
  return {
    years,
    present_years: presentYears,
    works_count: works,
    cited_by_count: cited,
    citation_rate: works > 0 ? cited / works : null,
  };
}

async function estimatePredictedImpactFactorFromOpenAlex(j, ifYear = "") {
  const officialIf = parseFloatLoose(j?.if_2023);
  const currentYear = new Date().getFullYear();
  const officialYear = extractYearToken(ifYear || j?.if_year || "") || currentYear - 2;
  const targetYear = officialYear + 1;
  const source = await fetchOpenAlexPredictionSource(j);
  if (!source) {
    return {
      status: "unavailable",
      error: "openalex_source_not_found",
      message: "未找到可用于预测的 OpenAlex Source",
      target_year: targetYear,
    };
  }

  const counts = getOpenAlexYearCounts(source);
  const baseline = sumOpenAlexPredictionCounts(counts, [officialYear - 1, officialYear - 2]);
  const target = sumOpenAlexPredictionCounts(counts, [targetYear - 1, targetYear - 2]);
  const baselineRate = baseline.citation_rate;
  const targetRate = target.citation_rate;
  if (!baselineRate || !targetRate) {
    return {
      status: "unavailable",
      error: "insufficient_openalex_counts",
      message: "OpenAlex 年度引用数据不足",
      target_year: targetYear,
      source_id: source.id,
      source_name: source.display_name,
      baseline,
      target,
    };
  }

  const rawRatio = Number(targetRate) / Number(baselineRate);
  const shrinkage = 0.35;
  let adjustedRatio = rawRatio;
  let value = Number(targetRate);
  let method = "openalex_cohort_rate";
  if (officialIf !== null) {
    adjustedRatio = 1 + (rawRatio - 1) * shrinkage;
    value = officialIf * adjustedRatio;
    method = "official_if_calibrated_openalex_cohort_shrunken";
  }

  const minWorks = Math.min(Number(baseline.works_count || 0), Number(target.works_count || 0));
  return {
    status: "ok",
    metric: "predicted_if",
    value: Number(value.toFixed(3)),
    target_year: targetYear,
    official_year: officialYear,
    official_if: officialIf,
    method,
    confidence: officialIf !== null && minWorks >= 50 ? "medium" : "low",
    source: "OpenAlex",
    source_id: source.id,
    source_name: source.display_name,
    baseline,
    target,
    ratio: Number(adjustedRatio.toFixed(5)),
    openalex_raw_ratio: Number(rawRatio.toFixed(5)),
    openalex_shrinkage: shrinkage,
    fetched_at: new Date().toISOString().slice(0, 10),
    note: "非官方预测值，仅用于投稿前信息参考。",
  };
}

async function fetchPredictedImpactFactorFromApi(url) {
  if (!predictedIfRequestCache.has(url)) {
    predictedIfRequestCache.set(
      url,
      fetchJsonWithTimeout(url, PREDICTED_IF_TIMEOUT_MS, {
        headers: { Accept: "application/json" },
      }).finally(() => predictedIfRequestCache.delete(url))
    );
  }
  return predictedIfRequestCache.get(url);
}

async function loadPredictedImpactFactor(j, ifYear = "") {
  const url = buildPredictedImpactFactorUrl(j, ifYear);
  if (!url) {
    resetPredictedImpactFactor("缺少 ISSN");
    return;
  }
  const currentJournal = j;
  const cachedPayload = readMetricCache(predictedIfCache, "predicted-if", url);
  if (cachedPayload) {
    setPredictedImpactFactorState(cachedPayload);
    return;
  }

  resetPredictedImpactFactor("计算中");
  try {
    let payload = null;
    if (!isLocalPreviewHost()) {
      payload = await estimatePredictedImpactFactorFromOpenAlex(j, ifYear);
    }
    if (!payload || String(payload?.status || "").toLowerCase() === "unavailable") {
      payload = payload || (await fetchPredictedImpactFactorFromApi(url));
    }
    if (!payload && isLocalPreviewHost()) {
      payload = await estimatePredictedImpactFactorFromOpenAlex(j, ifYear);
    }
    if (pageState.journal !== currentJournal) return;
    if (payload && typeof payload === "object") {
      writeMetricCache(predictedIfCache, "predicted-if", url, payload, getPredictedImpactFactorCacheTtl(payload));
    }
    setPredictedImpactFactorState(payload);
  } catch (_) {
    if (pageState.journal !== currentJournal) return;
    resetPredictedImpactFactor("预测暂不可用");
  }
}

function renderCiteScoreMetrics({ year = "", sjr = null, snip = null } = {}) {
  if (!els.citeScoreMetrics) return;
  const yearText = year ? (/年$/.test(String(year)) ? String(year) : `${year}年`) : "最新";
  const chips = [
    `<span class="citescore-metric-chip"><b>CiteScore</b><em>${escapeHtml(yearText)}</em></span>`,
    `<span class="citescore-metric-chip"><b>SJR</b><em>${escapeHtml(formatMetricValue(sjr, 3))}</em></span>`,
    `<span class="citescore-metric-chip"><b>SNIP</b><em>${escapeHtml(formatMetricValue(snip, 3))}</em></span>`,
  ];
  els.citeScoreMetrics.innerHTML = chips.join("");
  els.citeScoreMetrics.classList.remove("is-proxy");
}

function renderCiteScoreBreakdown(subjects) {
  if (!els.citeScoreBreakdown) return;
  const rows = normalizeCiteScoreSubjectRows(subjects);
  if (!rows.length) {
    els.citeScoreBreakdown.innerHTML = "<div class='citescore-breakdown-empty'>暂无学科分区明细</div>";
    return;
  }

  const maxRows = 10;
  const visible = rows.slice(0, maxRows);
  const header = `
    <div class="citescore-breakdown-head">
      <span>学科</span>
      <span>分区</span>
      <span>排名</span>
      <span>百分位</span>
    </div>
  `;
  const body = visible
    .map((row) => {
      const percentileText = row.percentile === null ? "-" : `${Math.round(row.percentile)}%`;
      const fill = row.percentile === null ? 0 : Math.max(0, Math.min(Math.round(row.percentile), 100));
      return `
        <div class="citescore-breakdown-item">
          <div class="citescore-breakdown-name-cell">
            <span class="citescore-breakdown-level">${escapeHtml(row.level)}</span>
            <span class="citescore-breakdown-name" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</span>
          </div>
          <div class="citescore-breakdown-q">${escapeHtml(row.quartile || "-")}</div>
          <div class="citescore-breakdown-rank">${escapeHtml(row.rank || "-")}</div>
          <div class="citescore-breakdown-percent">
            <span>${escapeHtml(percentileText)}</span>
            <i><b style="width:${fill}%"></b></i>
          </div>
        </div>
      `;
    })
    .join("");
  const extra = rows.length > maxRows ? `<div class="citescore-breakdown-more">另有 ${rows.length - maxRows} 条学科记录</div>` : "";
  els.citeScoreBreakdown.innerHTML = header + body + extra;
}

function renderCiteScoreSourceLine({ sourceText = "", reason = "" } = {}) {
  if (!els.citeScoreSource) return;
  const normalizedReason = String(reason || "").trim();
  const reasonText = normalizedReason ? mapElsevierFailureReason(normalizedReason) : "";

  let displayText = String(sourceText || "").trim() || "数据来源：待更新";
  if (reasonText) {
    displayText = `${displayText} · ${reasonText}`;
  }

  const actionButtons = [];
  if (normalizedReason && normalizedReason !== "api_missing_api_key" && normalizedReason !== "missing_issn") {
    actionButtons.push(`<button class="citescore-inline-btn" type="button" data-citescore-refresh="1">重试</button>`);
  }

  const actionsHtml = actionButtons.length
    ? `<span class="citescore-inline-actions">${actionButtons.join("")}</span>`
    : "";
  els.citeScoreSource.innerHTML = `<span>${escapeHtml(displayText)}</span>${actionsHtml}`;
}

function setCiteScoreCardState({
  score = null,
  year = "",
  percentile = null,
  subjects = [],
  sjr = null,
  snip = null,
  meta = "",
  source = "",
  reason = "",
} = {}) {
  if (!els.citeScoreCard) return;
  const hasScore = score !== null && score !== undefined && Number.isFinite(Number(score));
  const numericScore = hasScore ? Number(score) : null;

  els.citeScoreCard.classList.remove("is-proxy");
  els.citeScoreCard.classList.toggle("is-empty", !hasScore);
  els.citeScoreValue.textContent = hasScore ? numericScore.toFixed(numericScore >= 10 ? 1 : 2) : "-";

  if (hasScore) {
    els.citeScoreMeta.classList.remove("is-muted");
    const stars = normalizeCiteScoreToStars(numericScore, percentile);
    els.citeScoreStars.innerHTML = `<span class="citescore-empty">官方 CiteScore · ${escapeHtml(formatMetricValue(stars, 1))}/5 参考星级</span>`;
    renderCiteScoreMetrics({ year, sjr, snip });

    const pct = percentile !== null && percentile !== undefined ? Math.max(0, Math.min(Number(percentile), 100)) : null;
    const showPercentile = pct !== null;
    els.citeScorePercentLabel.textContent = "学科百分位";
    els.citeScorePercentValue.textContent = showPercentile ? `${Math.round(pct)}%` : "-";
    els.citeScorePercentFill.style.width = showPercentile ? `${Math.round(pct)}%` : "0%";

    const yearLabel = year ? `${year} 年` : "最新年度";
    els.citeScoreMeta.textContent = meta || `更新：${yearLabel} · CiteScore ${numericScore.toFixed(2)}`;
    renderCiteScoreSourceLine({
      sourceText: source || "数据来源：Scopus CiteScore",
      reason,
    });
    renderCiteScoreBreakdown(subjects);
  } else {
    els.citeScoreMeta.classList.add("is-muted");
    els.citeScoreStars.innerHTML = "<span class='citescore-empty'>未获取官方 CiteScore</span>";
    renderCiteScoreMetrics({ year, sjr, snip });
    els.citeScorePercentLabel.textContent = "学科百分位";
    els.citeScorePercentValue.textContent = "-";
    els.citeScorePercentFill.style.width = "0%";
    els.citeScoreMeta.textContent = meta || (reason ? mapElsevierFailureReason(reason) : "暂无官方 CiteScore");
    renderCiteScoreSourceLine({
      sourceText: source || "数据来源：待更新",
      reason,
    });
    renderCiteScoreBreakdown(subjects);
  }
}

function normalizeIntroText(text, maxLen = 300) {
  const noLangLabel = String(text || "")
    .replace(/（\s*(?:英语|英語|英文|英文名)\s*[：:]\s*([^（）]+?)\s*）/g, "（$1）")
    .replace(/\(\s*english\s*[：:]\s*([^)]+?)\s*\)/gi, "（$1）");
  const clean = noLangLabel.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1)}…`;
}

function parseWikidataQid(rawUrl) {
  const m = String(rawUrl || "").match(/Q\d+/i);
  return m ? m[0].toUpperCase() : "";
}

async function fetchWikipediaExtract(title, lang) {
  const t = String(title || "").trim();
  if (!t) return "";
  const params = new URLSearchParams({
    action: "query",
    prop: "extracts",
    exintro: "1",
    explaintext: "1",
    format: "json",
    origin: "*",
    titles: t,
  });
  const url = `https://${lang}.wikipedia.org/w/api.php?${params.toString()}`;
  const payload = await fetchJsonWithTimeout(url, 6500);
  const pages = payload?.query?.pages || {};
  const first = Object.values(pages)[0];
  return normalizeIntroText(first?.extract || "");
}

async function fetchWikidataEntity(qid) {
  const id = String(qid || "").trim().toUpperCase();
  if (!id) return null;
  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: id,
    props: "descriptions|sitelinks|claims",
    languages: "zh|en",
    format: "json",
    origin: "*",
  });
  const url = `https://www.wikidata.org/w/api.php?${params.toString()}`;
  const payload = await fetchJsonWithTimeout(url, 6500);
  return payload?.entities?.[id] || null;
}

function getWikidataClaimFile(entity, prop) {
  return entity?.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value || "";
}

function buildCommonsImageUrl(fileName, width = 900) {
  const file = String(fileName || "").trim();
  if (!file) return "";
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
}

function pickWikidataCoverUrl(entity) {
  const coverFile = getWikidataClaimFile(entity, "P18");
  if (coverFile) return buildCommonsImageUrl(coverFile, 920);
  const logoFile = getWikidataClaimFile(entity, "P154");
  if (logoFile) return buildCommonsImageUrl(logoFile, 760);
  return "";
}

function normalizePublicationStartYear(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  const year = Math.trunc(n);
  const now = new Date().getFullYear();
  if (year < 1600 || year > now + 1) return null;
  return year;
}

function parseWikidataTimeYear(raw) {
  const text = typeof raw === "string" ? raw : raw?.time;
  const match = String(text || "").match(/^\+?(\d{1,6})-/);
  return match ? normalizePublicationStartYear(match[1]) : null;
}

function getWikidataClaimTimeYears(entity, prop) {
  const claims = Array.isArray(entity?.claims?.[prop]) ? entity.claims[prop] : [];
  return claims
    .map((claim) => parseWikidataTimeYear(claim?.mainsnak?.datavalue?.value))
    .filter((year) => year !== null)
    .sort((a, b) => a - b);
}

function buildWikidataStartYearInfo(entity) {
  const year = getWikidataClaimTimeYears(entity, "P571")[0];
  if (!year) return null;
  return {
    year,
    source: "Wikidata",
    title: "Wikidata inception（P571）",
  };
}

async function fetchJournalIntro(j, source, prefetchedEntity = null) {
  const qid = parseWikidataQid(source?.ids?.wikidata);
  if (qid) {
    const entity = prefetchedEntity || (await fetchWikidataEntity(qid));
    const zhTitle = entity?.sitelinks?.zhwiki?.title || "";
    const enTitle = entity?.sitelinks?.enwiki?.title || source?.display_name || j.title || "";

    const zhExtract = await fetchWikipediaExtract(zhTitle, "zh");
    if (zhExtract) return zhExtract;

    const enExtract = await fetchWikipediaExtract(enTitle, "en");
    if (enExtract) return enExtract;

    const zhDesc = normalizeIntroText(entity?.descriptions?.zh?.value || "", 180);
    if (zhDesc) return zhDesc;
    const enDesc = normalizeIntroText(entity?.descriptions?.en?.value || "", 180);
    if (enDesc) return enDesc;
  }

  const titleZh = await fetchWikipediaExtract(j.title, "zh");
  if (titleZh) return titleZh;

  const titleEn = await fetchWikipediaExtract(source?.display_name || j.title, "en");
  if (titleEn) return titleEn;

  return "";
}

function getSpotlightCoverTitleClass(title) {
  const length = String(title || "").replace(/\s+/g, "").length;
  if (length > 34) return "spotlight-cover__classic-title--dense";
  if (length > 18) return "spotlight-cover__classic-title--compact";
  return "";
}

function renderSpotlightCover(j, latestCas, website, externalCoverUrl = "") {
  const hue = textHash(j.title || j.issn || j.cn_number || "");
  const bg = `linear-gradient(145deg, hsl(${hue} 54% 30%), hsl(${(hue + 28) % 360} 48% 24%))`;
  const previewUrl = externalCoverUrl || "";
  const title = String(j.title || "Unknown Journal").trim();
  const titleClass = getSpotlightCoverTitleClass(title);
  const issnText = safe(j.issn);

  els.spotlightCover.classList.toggle("spotlight-cover--fallback", !previewUrl);
  els.spotlightCover.style.background = previewUrl ? "#f1ece3" : bg;
  els.spotlightCover.innerHTML = `
    ${previewUrl ? `<img class="spotlight-cover__bg spotlight-cover__bg--cover" src="${escapeHtml(previewUrl)}" alt="${escapeHtml(
      `${title} 封面`
    )}" loading="lazy" onerror="const p=this.closest('.spotlight-cover');if(p){p.classList.add('spotlight-cover--fallback');p.style.background='${escapeHtml(
      bg
    )}';}this.remove();" />` : ""}
    <div class="spotlight-cover__classic" aria-hidden="${previewUrl ? "true" : "false"}">
      <div class="spotlight-cover__classic-frame"></div>
      <div class="spotlight-cover__classic-ornament"></div>
      <div class="spotlight-cover__classic-kicker">Journal Archive</div>
      <div class="spotlight-cover__classic-title ${titleClass}"><span>${escapeHtml(title)}</span></div>
      <div class="spotlight-cover__classic-foot">${escapeHtml(issnText)}</div>
    </div>
  `;
}

async function fetchJsonWithTimeout(url, timeoutMs = 4500, fetchOptions = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...fetchOptions, signal: controller.signal });
    if (!resp.ok) return null;
    return await resp.json();
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function isLocalPreviewHost() {
  return ["127.0.0.1", "localhost"].includes(window.location.hostname);
}

function normalizeIssnForQuery(raw) {
  return String(raw || "")
    .trim()
    .replace(/\s+/g, "");
}

function normalizeDoi(raw) {
  return String(raw || "")
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:/i, "")
    .toLowerCase();
}

function formatIntegerCompact(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return Math.trunc(n).toLocaleString("en-US");
}

function getFirstApcField(row, keys) {
  if (!row || typeof row !== "object") return null;
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(row, key)) continue;
    const value = row[key];
    if (!isBlankValue(value)) return value;
  }
  return null;
}

function parseApcBool(raw) {
  if (raw === true || raw === false) return raw;
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return null;
  if (["是", "有", "yes", "y", "true", "1", "paid", "收费"].includes(s)) return true;
  if (["否", "无", "免费", "免費", "no", "n", "false", "0", "none", "free"].includes(s)) return false;
  return null;
}

function normalizeApcCurrency(raw) {
  const currency = String(raw || "").trim().toUpperCase();
  if (!currency) return "";
  const aliases = {
    "$": "USD",
    "US$": "USD",
    "USD$": "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "￥": "CNY",
    RMB: "CNY",
  };
  return aliases[currency] || currency;
}

function formatApcAmount(raw) {
  if (raw === null || raw === undefined) return "";
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return "";
    if (raw <= 0) return "无 APC";
    return Math.round(raw).toLocaleString("en-US");
  }
  const text = String(raw).trim();
  if (!text) return "";
  const numericText = text.replace(/,/g, "");
  if (/^\d+(?:\.\d+)?$/.test(numericText)) {
    const n = Number(numericText);
    if (!Number.isFinite(n)) return text;
    if (n <= 0) return "无 APC";
    return Math.round(n).toLocaleString("en-US");
  }
  return text;
}

function parseApcNumericAmount(raw) {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const text = String(raw || "").trim().replace(/,/g, "");
  if (!/^\d+(?:\.\d+)?$/.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

function getFallbackApcCnyRate(currency = "") {
  const code = normalizeApcCurrency(currency);
  const rate = APC_CNY_REFERENCE_RATES[code];
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

function estimateApcCny(rawPrice, currency = "", rateOverride = null) {
  const amount = parseApcNumericAmount(rawPrice);
  if (amount === null || amount <= 0) return null;
  const code = normalizeApcCurrency(currency);
  const rate = Number.isFinite(rateOverride) && rateOverride > 0 ? rateOverride : getFallbackApcCnyRate(code);
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return amount * rate;
}

function formatCnyEstimate(rawPrice, currency = "", rateOverride = null) {
  const cny = estimateApcCny(rawPrice, currency, rateOverride);
  if (cny === null) return "";
  const rounded = cny >= 1000 ? Math.round(cny / 100) * 100 : Math.round(cny);
  return `¥ ${rounded.toLocaleString("en-US")}`;
}

function formatApcPrice(price, currency = "") {
  const amount = formatApcAmount(price);
  if (!amount) return "";
  if (amount === "无 APC") return amount;
  const code = normalizeApcCurrency(currency);
  return code ? `${code} ${amount}` : amount;
}

function formatApcDisplayPrice(price, currency = "", rateOverride = null) {
  const amount = formatApcAmount(price);
  if (!amount) return "";
  if (amount === "无 APC") return amount;
  const code = normalizeApcCurrency(currency);
  const cny = formatCnyEstimate(price, code, rateOverride);
  if (code === "CNY" || code === "RMB") return cny || `¥ ${amount}`;
  const original = formatApcPrice(price, code);
  return cny ? `${original} ≈ ${cny}` : original;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function formatApcDisplayHtml(value) {
  const text = String(value ?? "");
  const cnyPattern = /¥\s*[\d,]+(?:\.\d+)?/g;
  let html = "";
  let cursor = 0;
  let matched = false;

  text.replace(cnyPattern, (match, offset) => {
    matched = true;
    const normalized = match.replace(/^¥\s*/, "¥ ");
    html += escapeHtml(text.slice(cursor, offset));
    html += `<span class="apc-cny-estimate">${escapeHtml(normalized)}</span>`;
    cursor = offset + match.length;
    return match;
  });

  if (!matched) return escapeHtml(text);
  html += escapeHtml(text.slice(cursor));
  return html;
}

function normalizeOaBusinessModel(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes("hybrid")) {
    return {
      value: "Hybrid OA",
      title: "订阅期刊可选择 OA 发表；APC 只对应该开放发表选项",
    };
  }
  if (lower.includes("fully") || lower.includes("full open") || lower.includes("gold") || lower === "open access") {
    return {
      value: "完全 OA",
      title: "期刊整体以开放获取模式出版",
    };
  }
  return {
    value: text,
    title: `出版社价目表业务模式：${text}`,
  };
}

function normalizeOaStatusValue(raw) {
  if (isBlankValue(raw)) return null;
  const model = normalizeOaBusinessModel(raw);
  if (model && model.value !== String(raw || "").trim()) return model;

  const bool = parseApcBool(raw);
  if (bool === true) {
    return {
      value: "开放获取",
      title: "本地数据标记为 OA；是否收 APC 仍需单独看 APC 字段",
    };
  }
  if (bool === false) {
    return {
      value: "非完全 OA",
      title: "本地数据标记为非整刊 OA；仍可能存在 Hybrid OA 发表选项",
    };
  }
  return {
    value: String(raw).trim(),
    title: "本地 OA 模式字段",
  };
}

function buildOaModeInfo(row = null, source = null, apcInfo = null) {
  const apcModel = normalizeOaBusinessModel(apcInfo?.businessModel || apcInfo?.business_model);
  if (apcModel) {
    return {
      ...apcModel,
      source: apcInfo?.source || "APC 价目表",
    };
  }

  const localStatus = getFirstApcField(row, [
    "oa_mode",
    "oaMode",
    "oa_status",
    "oaStatus",
    "OA mode",
    "OA status",
    "OA模式",
    "是否OA",
    "is_oa",
    "isOA",
  ]);
  const localMode = normalizeOaStatusValue(localStatus);
  if (localMode) return { ...localMode, source: "本地数据" };

  if (source?.is_in_doaj === true) {
    return {
      value: "DOAJ OA",
      title: "OpenAlex 标记该来源收录于 DOAJ；APC 是否收取仍需查看 APC 字段",
      source: "OpenAlex",
    };
  }
  if (source?.is_oa === true) {
    return {
      value: "开放获取",
      title: "OpenAlex 标记该来源为 OA；APC 是否收取仍需查看 APC 字段",
      source: "OpenAlex",
    };
  }
  if (source?.is_oa === false) {
    return {
      value: "非完全 OA",
      title: "OpenAlex 标记该来源不是整刊 OA；仍可能存在 Hybrid OA 发表选项",
      source: "OpenAlex",
    };
  }
  return null;
}

function parseApcCnyRatePayload(payload, currency = "") {
  const code = normalizeApcCurrency(currency);
  const rows = Array.isArray(payload) ? payload : [];
  for (const row of rows) {
    const base = normalizeApcCurrency(row?.base);
    const quote = normalizeApcCurrency(row?.quote);
    const rate = Number(row?.rate);
    if (base === code && quote === "CNY" && Number.isFinite(rate) && rate > 0) {
      return { rate, date: String(row?.date || "").trim() };
    }
  }

  const objectRate = Number(payload?.rates?.CNY ?? payload?.rate);
  if (Number.isFinite(objectRate) && objectRate > 0) {
    return { rate: objectRate, date: String(payload?.date || "").trim() };
  }
  return null;
}

function buildApcExchangeRateUrl(currency = "") {
  const code = normalizeApcCurrency(currency);
  if (!code || code === "CNY" || code === "RMB") return "";
  const params = new URLSearchParams({ base: code, quotes: "CNY" });
  return `${APC_EXCHANGE_RATE_API_URL}?${params.toString()}`;
}

async function fetchApcCnyRate(currency = "") {
  const code = normalizeApcCurrency(currency);
  if (!code || code === "CNY" || code === "RMB") return null;

  const cached = readMetricCache(apcExchangeRateCache, "apc-cny-rate", code);
  if (cached && Number.isFinite(Number(cached.rate)) && Number(cached.rate) > 0) {
    return cached;
  }

  if (!apcExchangeRateRequestCache.has(code)) {
    const requestPromise = (async () => {
      const url = buildApcExchangeRateUrl(code);
      if (!url) return null;
      const payload = await fetchJsonWithTimeout(url, 4500, { headers: { Accept: "application/json" } });
      const parsed = parseApcCnyRatePayload(payload, code);
      if (!parsed) return null;
      const result = {
        rate: parsed.rate,
        date: parsed.date || "",
        source: "Frankfurter",
      };
      writeMetricCache(apcExchangeRateCache, "apc-cny-rate", code, result, APC_EXCHANGE_RATE_TTL_MS);
      return result;
    })().finally(() => apcExchangeRateRequestCache.delete(code));
    apcExchangeRateRequestCache.set(code, requestPromise);
  }
  return apcExchangeRateRequestCache.get(code);
}

function normalizeApcPrices(rawPrices) {
  const rows = Array.isArray(rawPrices) ? rawPrices : [];
  return rows
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rawPrice = item.price ?? item.amount ?? item.value;
      const amount = parseApcNumericAmount(rawPrice);
      const currency = normalizeApcCurrency(item.currency ?? item.currency_code ?? item.currencyCode);
      const formatted = formatApcPrice(rawPrice, currency);
      const display = formatApcDisplayPrice(rawPrice, currency);
      if (!formatted) return null;
      return { amount, price: Number(rawPrice), currency, formatted, display };
    })
    .filter(Boolean);
}

function normalizeApcIssn(raw) {
  return normalizeIssnForQuery(raw).replace(/[^0-9Xx]/g, "").toUpperCase();
}

function getApcIssnCandidates(row, source = null) {
  const values = [
    row?.issn,
    row?.eissn,
    row?.issn_l,
    row?.issnL,
    source?.issn_l,
    source?.issnL,
  ];
  if (Array.isArray(source?.issn)) values.push(...source.issn);
  return [...new Set(values.map(normalizeApcIssn).filter(Boolean))];
}

function normalizeApcTitleKey(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getApcTitleCandidates(row, source = null) {
  const values = [
    row?.title,
    row?.journal,
    row?.name,
    source?.display_name,
    source?.displayName,
    source?.title,
  ];
  return [...new Set(values.map(normalizeApcTitleKey).filter(Boolean))];
}

function officialApcPublisherHint(row, source = null) {
  const text = [
    row?.publisher,
    row?.official_url,
    row?.homepage_url,
    row?.website,
    row?.url,
    source?.host_organization_name,
    source?.homepage_url,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const hints = [
    ["Elsevier", /\belsevier\b|sciencedirect|cell\.com|cell press/],
    ["Wiley", /\bwiley\b|wiley online library/],
    ["Springer Nature", /springer nature|\bspringer\b|nature portfolio|nature\.com|biomed central|\bbmc\b|palgrave|link\.springer\.com/],
    ["MDPI", /\bmdpi\b|multidisciplinary digital publishing institute|mdpi\.com/],
    ["Frontiers", /\bfrontiers\b|frontiersin\.org/],
    ["SAGE", /\bsage\b|sagepub|journals\.sagepub\.com/],
    ["Cambridge University Press", /cambridge university press|cambridge\.org|cambridge core/],
    ["IEEE", /\bieee\b|ieeeauthorcenter|ieeexplore/],
    ["PLOS", /\bplos\b|public library of science|plos\.org/],
    ["Emerald", /\bemerald\b|emeraldgrouppublishing|ice publishing/],
  ];
  const hit = hints.find(([, pattern]) => pattern.test(text));
  return hit ? hit[0] : "";
}

function isLikelyOfficialApcCandidate(row, source = null) {
  return Boolean(officialApcPublisherHint(row, source));
}

function hasOfficialApcIndexMatch(row, source = null, index = null) {
  const issns = Array.isArray(index?.issns) ? index.issns : [];
  if (!issns.length) return false;
  const issnSet = new Set(issns.map(normalizeApcIssn).filter(Boolean));
  return getApcIssnCandidates(row, source).some((issn) => issnSet.has(issn));
}

function pickPrimaryApcPrice(prices) {
  if (!Array.isArray(prices) || !prices.length) return null;
  return prices.find((item) => item.currency === "USD") || prices[0];
}

function resolveOfficialApcRecord(candidate, catalog = null) {
  if (candidate && typeof candidate === "object") return candidate;
  if (Number.isInteger(candidate) && Array.isArray(catalog?.records)) {
    return catalog.records[candidate] || null;
  }
  const numeric = Number(candidate);
  if (Number.isInteger(numeric) && Array.isArray(catalog?.records)) {
    return catalog.records[numeric] || null;
  }
  return null;
}

function findOfficialApcRecordCandidate(row, source = null, catalog = null) {
  const byIssn = catalog?.by_issn;
  if (byIssn && typeof byIssn === "object") {
    for (const issn of getApcIssnCandidates(row, source)) {
      if (Object.prototype.hasOwnProperty.call(byIssn, issn)) return byIssn[issn];
    }
  }

  const byTitle = catalog?.by_title;
  if (!byTitle || typeof byTitle !== "object" || !isLikelyOfficialApcCandidate(row, source)) return null;
  const publisherHint = officialApcPublisherHint(row, source).toLowerCase();
  for (const title of getApcTitleCandidates(row, source)) {
    if (!Object.prototype.hasOwnProperty.call(byTitle, title)) continue;
    const candidate = byTitle[title];
    const record = resolveOfficialApcRecord(candidate, catalog);
    if (!record || typeof record !== "object") return candidate;
    const publisher = String(record.publisher || "").toLowerCase();
    if (publisherHint && publisher && !publisher.includes(publisherHint.split(" ")[0])) continue;
    return candidate;
  }
  return null;
}

function findOfficialApcRecord(row, source = null, catalog = null) {
  return resolveOfficialApcRecord(findOfficialApcRecordCandidate(row, source, catalog), catalog);
}

async function resolveOfficialApcRecordAsync(candidate, catalog = null) {
  const record = resolveOfficialApcRecord(candidate, catalog);
  if (record) return record;

  const recordIndex = Number(candidate);
  const chunkSize = Number(catalog?.chunk_size || catalog?.meta?.chunk_size);
  if (!Number.isInteger(recordIndex) || recordIndex < 0 || !Number.isInteger(chunkSize) || chunkSize <= 0) return null;

  const chunkIndex = Math.floor(recordIndex / chunkSize);
  const chunk = await fetchOfficialApcRecordChunk(chunkIndex, catalog);
  if (!chunk || !Array.isArray(chunk.records)) return null;
  const start = Number.isInteger(Number(chunk.start)) ? Number(chunk.start) : chunkIndex * chunkSize;
  return chunk.records[recordIndex - start] || null;
}

function buildOfficialApcInfoFromRecord(record) {
  if (!record) return null;
  const prices = normalizeApcPrices(record.prices || record.apc_prices);
  const primary = pickPrimaryApcPrice(prices);
  if (!primary) return null;

  const priceList = record.price_note || prices.map((item) => item.formatted).join(" / ");
  const dateText = record.price_date ? `（${record.price_date}）` : "";
  const businessModel = String(record.business_model || "").trim();
  const modelText = businessModel ? `，${businessModel}` : "";
  const publisher = record.publisher || "出版社";
  return {
    value: primary.display || primary.formatted,
    source: `${publisher} 官方价目表`,
    title: `${publisher} 官方 APC${dateText}${modelText}：${priceList}`,
    amount: primary.amount,
    currency: primary.currency,
    businessModel,
  };
}

function buildOfficialApcInfo(row, source = null, catalog = null) {
  return buildOfficialApcInfoFromRecord(findOfficialApcRecord(row, source, catalog));
}

async function buildOfficialApcInfoAsync(row, source = null, catalog = null) {
  const candidate = findOfficialApcRecordCandidate(row, source, catalog);
  const record = await resolveOfficialApcRecordAsync(candidate, catalog);
  return buildOfficialApcInfoFromRecord(record);
}

async function fetchOfficialApcIndex() {
  if (!STATIC_OFFICIAL_APC_ENABLED) return null;
  const cacheKey = "official";
  const cached = officialApcIndexCache.get(cacheKey);
  if (cached?.expiresAt > Date.now() && Array.isArray(cached?.payload?.issns)) {
    return cloneJson(cached.payload);
  }
  if (cached) officialApcIndexCache.delete(cacheKey);

  if (!officialApcIndexRequestCache.has(cacheKey)) {
    const requestPromise = (async () => {
      for (const path of OFFICIAL_APC_ISSN_INDEX_PATHS) {
        const payload = await fetchJsonWithTimeout(path, OFFICIAL_APC_TIMEOUT_MS, { headers: { Accept: "application/json" } });
        if (Array.isArray(payload?.issns)) {
          officialApcIndexCache.set(cacheKey, {
            expiresAt: Date.now() + OFFICIAL_APC_CATALOG_TTL_MS,
            payload: cloneJson(payload),
          });
          return payload;
        }
      }
      return null;
    })().finally(() => officialApcIndexRequestCache.delete(cacheKey));
    officialApcIndexRequestCache.set(cacheKey, requestPromise);
  }
  return officialApcIndexRequestCache.get(cacheKey);
}

function officialApcChunkToken(chunkIndex) {
  return String(chunkIndex).padStart(3, "0");
}

function buildOfficialApcRecordChunkPath(template, chunkIndex) {
  return String(template || "").replace("{chunk}", officialApcChunkToken(chunkIndex));
}

async function fetchOfficialApcRecordChunk(chunkIndex, catalog = null) {
  if (!STATIC_OFFICIAL_APC_ENABLED) return null;
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) return null;
  const cacheKey = `chunk-${chunkIndex}`;
  const cached = officialApcRecordChunkCache.get(cacheKey);
  if (cached?.expiresAt > Date.now() && Array.isArray(cached?.payload?.records)) {
    return cloneJson(cached.payload);
  }
  if (cached) officialApcRecordChunkCache.delete(cacheKey);

  if (!officialApcRecordChunkRequestCache.has(cacheKey)) {
    const requestPromise = (async () => {
      const templates = Array.isArray(catalog?.record_chunk_paths) && catalog.record_chunk_paths.length
        ? catalog.record_chunk_paths
        : OFFICIAL_APC_RECORD_CHUNK_PATHS;
      for (const template of templates) {
        const path = buildOfficialApcRecordChunkPath(template, chunkIndex);
        const payload = await fetchJsonWithTimeout(path, OFFICIAL_APC_TIMEOUT_MS, { headers: { Accept: "application/json" } });
        if (Array.isArray(payload?.records)) {
          officialApcRecordChunkCache.set(cacheKey, {
            expiresAt: Date.now() + OFFICIAL_APC_CATALOG_TTL_MS,
            payload: cloneJson(payload),
          });
          return payload;
        }
      }
      return null;
    })().finally(() => officialApcRecordChunkRequestCache.delete(cacheKey));
    officialApcRecordChunkRequestCache.set(cacheKey, requestPromise);
  }
  return officialApcRecordChunkRequestCache.get(cacheKey);
}

async function fetchOfficialApcCatalog() {
  if (!STATIC_OFFICIAL_APC_ENABLED) return null;
  const cacheKey = "official";
  const cached = officialApcCatalogCache.get(cacheKey);
  if (cached?.expiresAt > Date.now() && (cached?.payload?.by_issn || cached?.payload?.by_title)) {
    return cloneJson(cached.payload);
  }
  if (cached) officialApcCatalogCache.delete(cacheKey);

  if (!officialApcCatalogRequestCache.has(cacheKey)) {
    const requestPromise = (async () => {
      for (const path of OFFICIAL_APC_LOOKUP_INDEX_PATHS) {
        const payload = await fetchJsonWithTimeout(path, OFFICIAL_APC_TIMEOUT_MS, { headers: { Accept: "application/json" } });
        if (((payload?.by_issn && typeof payload.by_issn === "object") || (payload?.by_title && typeof payload.by_title === "object")) && Number(payload?.chunk_size) > 0) {
          officialApcCatalogCache.set(cacheKey, {
            expiresAt: Date.now() + OFFICIAL_APC_CATALOG_TTL_MS,
            payload: cloneJson(payload),
          });
          return payload;
        }
      }
      for (const path of OFFICIAL_APC_PRICE_PATHS) {
        const payload = await fetchJsonWithTimeout(path, OFFICIAL_APC_TIMEOUT_MS, { headers: { Accept: "application/json" } });
        if (Array.isArray(payload?.records) && ((payload?.by_issn && typeof payload.by_issn === "object") || (payload?.by_title && typeof payload.by_title === "object"))) {
          officialApcCatalogCache.set(cacheKey, {
            expiresAt: Date.now() + OFFICIAL_APC_CATALOG_TTL_MS,
            payload: cloneJson(payload),
          });
          return payload;
        }
      }
      return null;
    })().finally(() => officialApcCatalogRequestCache.delete(cacheKey));
    officialApcCatalogRequestCache.set(cacheKey, requestPromise);
  }
  return officialApcCatalogRequestCache.get(cacheKey);
}

function buildOpenAlexApcInfo(source) {
  if (!source || typeof source !== "object") return null;
  const prices = normalizeApcPrices(source.apc_prices);
  const primary = pickPrimaryApcPrice(prices);
  if (primary) {
    const priceList = prices.map((item) => item.formatted).join(" / ");
    const oaMode = source.is_oa === false ? "Hybrid OA 参考价" : "OA 参考价";
    return {
      value: primary.display || primary.formatted,
      source: "OpenAlex",
      title: `OpenAlex ${oaMode}${priceList ? `：${priceList}` : ""}`,
      amount: primary.amount,
      currency: primary.currency,
      businessModel: source.is_oa === false ? "Hybrid" : "",
    };
  }

  const apcUsd = Number(source.apc_usd);
  if (Number.isFinite(apcUsd) && apcUsd > 0) {
    const formatted = formatApcPrice(apcUsd, "USD");
    return {
      value: formatApcDisplayPrice(apcUsd, "USD"),
      source: "OpenAlex",
      title: `OpenAlex APC 参考价：${formatted}`,
      amount: apcUsd,
      currency: "USD",
      businessModel: source.is_oa === false ? "Hybrid" : "",
    };
  }
  return null;
}

function buildLocalApcInfo(row) {
  const amount = getFirstApcField(row, [
    "apc_amount",
    "apcAmount",
    "doaj_apc_amount",
    "doajApcAmount",
    "APC amount",
  ]);
  const currency = getFirstApcField(row, [
    "apc_currency",
    "apcCurrency",
    "doaj_apc_currency",
    "doajApcCurrency",
    "APC currency",
  ]);
  if (amount !== null) {
    const formatted = formatApcPrice(amount, currency);
    return {
      value: formatApcDisplayPrice(amount, currency),
      source: "DOAJ",
      title: `DOAJ 或本地目录 APC 金额${formatted ? `：${formatted}` : ""}`,
      amount: parseApcNumericAmount(amount),
      currency: normalizeApcCurrency(currency),
    };
  }

  const prices = normalizeApcPrices(getFirstApcField(row, ["apc_prices", "apcPrices"]));
  const primary = pickPrimaryApcPrice(prices);
  if (primary) {
    return {
      value: primary.display || primary.formatted,
      source: "本地数据",
      title: `本地 APC 价格：${prices.map((item) => item.formatted).join(" / ")}`,
      amount: primary.amount,
      currency: primary.currency,
    };
  }

  const usd = getFirstApcField(row, ["apc_usd", "apcUsd", "openalex_apc_usd", "openalexApcUsd"]);
  if (usd !== null) {
    return {
      value: formatApcDisplayPrice(usd, "USD"),
      source: "本地数据",
      title: "本地 APC USD 参考价",
      amount: parseApcNumericAmount(usd),
      currency: "USD",
    };
  }

  const hasApc = parseApcBool(getFirstApcField(row, ["apc", "has_apc", "hasApc", "doaj_apc", "doajApc", "APC"]));
  if (hasApc === false) {
    return {
      value: "无 APC",
      source: "DOAJ",
      title: "DOAJ 或本地目录标记为不收 APC",
    };
  }
  if (hasApc === true) {
    return {
      value: "金额待补充",
      source: "DOAJ",
      title: "DOAJ 或本地目录标记为收取 APC，但暂缺金额",
    };
  }
  return null;
}

function buildApcDisplay(row, source = null, officialCatalog = null) {
  return buildOfficialApcInfo(row, source, officialCatalog) || buildLocalApcInfo(row) || buildOpenAlexApcInfo(source);
}

function setOaModeDisplay(info) {
  if (!els.spotOA) return;
  if (!info || isBlankValue(info.value)) {
    setSoftValue(els.spotOA, null, "待识别");
    els.spotOA.removeAttribute("title");
    return;
  }
  setSoftValue(els.spotOA, info.value);
  const title = [info.title, info.source ? `来源：${info.source}` : ""].filter(Boolean).join(" · ");
  if (title) els.spotOA.setAttribute("title", title);
  else els.spotOA.removeAttribute("title");
}

function canRefreshApcCnyEstimate(info) {
  const amount = parseApcNumericAmount(info?.amount);
  const currency = normalizeApcCurrency(info?.currency);
  return Boolean(amount !== null && amount > 0 && currency && currency !== "CNY" && currency !== "RMB");
}

function apcRateTitle(rateInfo = null, fallback = false) {
  if (rateInfo?.source === "Frankfurter" && Number.isFinite(Number(rateInfo.rate))) {
    const dateText = rateInfo.date ? `${rateInfo.date} ` : "";
    return `人民币约值按 Frankfurter ${dateText}汇率动态估算`;
  }
  if (fallback) {
    return `人民币约值暂按 ${APC_FALLBACK_CNY_RATE_DATE} 备用参考汇率估算，实时汇率接口不可用时使用`;
  }
  return "";
}

function applyApcDisplayValue(info, rateInfo = null, fallback = false) {
  if (!els.spotApc || !info) return;
  const value = canRefreshApcCnyEstimate(info)
    ? formatApcDisplayPrice(info.amount, info.currency, rateInfo?.rate)
    : String(info.value || "");
  els.spotApc.innerHTML = formatApcDisplayHtml(value || String(info.value || ""));
  els.spotApc.classList.remove("is-muted");
  const title = [info.title, info.source ? `来源：${info.source}` : "", apcRateTitle(rateInfo, fallback)]
    .filter(Boolean)
    .join(" · ");
  if (title) els.spotApc.setAttribute("title", title);
  else els.spotApc.removeAttribute("title");
}

function setApcDisplay(info) {
  if (!els.spotApc) return;
  if (!info || isBlankValue(info.value)) {
    pageState.apcRateKey = "";
    setSoftValue(els.spotApc, null, "暂无数据");
    els.spotApc.removeAttribute("title");
    return;
  }
  applyApcDisplayValue(info, null, canRefreshApcCnyEstimate(info));

  if (!canRefreshApcCnyEstimate(info)) {
    pageState.apcRateKey = "";
    return;
  }

  const rateKey = [pageState.journal?.id || "", info.amount, normalizeApcCurrency(info.currency), info.source || ""].join("|");
  pageState.apcRateKey = rateKey;
  fetchApcCnyRate(info.currency)
    .then((rateInfo) => {
      if (!rateInfo || pageState.apcRateKey !== rateKey) return;
      applyApcDisplayValue(info, rateInfo, false);
    })
    .catch(() => {
      if (pageState.apcRateKey === rateKey) {
        applyApcDisplayValue(info, null, true);
      }
    });
}

function setPublicationStartYearDisplay(info) {
  if (!els.spotPublishYear) return;
  if (!info || !normalizePublicationStartYear(info.year)) {
    setSoftValue(els.spotPublishYear, null);
    els.spotPublishYear.removeAttribute("title");
    return;
  }
  setSoftValue(els.spotPublishYear, info.year);
  const title = [info.title, info.source ? `来源：${info.source}` : ""].filter(Boolean).join(" · ");
  if (title) els.spotPublishYear.setAttribute("title", title);
  else els.spotPublishYear.removeAttribute("title");
}

async function refreshOfficialApcForCurrentJournal(j, source = null) {
  if (!j) return;
  const key = [j.id || "", ...getApcIssnCandidates(j, source)].join("|");
  pageState.officialApcKey = key;
  let shouldLoadCatalog = isLikelyOfficialApcCandidate(j, source);
  if (!shouldLoadCatalog) {
    const index = await fetchOfficialApcIndex();
    if (pageState.journal !== j || pageState.officialApcKey !== key) return;
    shouldLoadCatalog = hasOfficialApcIndexMatch(j, source, index);
  }
  if (!shouldLoadCatalog) return;
  const catalog = await fetchOfficialApcCatalog();
  if (!catalog || pageState.journal !== j || pageState.officialApcKey !== key) return;
  const info = await buildOfficialApcInfoAsync(j, source, catalog);
  if (pageState.journal !== j || pageState.officialApcKey !== key) return;
  if (info) {
    setApcDisplay(info);
    if (typeof setOaModeDisplay === "function") {
      setOaModeDisplay(buildOaModeInfo(j, source, info));
    }
  }
}

function getCrossrefDateParts(item) {
  const candidates = ["published-online", "published-print", "published", "issued", "created"];
  for (const key of candidates) {
    const parts = item?.[key]?.["date-parts"]?.[0];
    if (Array.isArray(parts) && parts.length) return parts;
  }
  return [];
}

function formatCrossrefDate(item) {
  const parts = getCrossrefDateParts(item);
  if (!parts.length) return "";
  const [year, month, day] = parts.map((x) => Number(x));
  if (!Number.isFinite(year)) return "";
  const mm = Number.isFinite(month) ? String(month).padStart(2, "0") : "01";
  const dd = Number.isFinite(day) ? String(day).padStart(2, "0") : "01";
  return `${year}-${mm}-${dd}`;
}

function dateEpoch(raw) {
  const date = new Date(String(raw || ""));
  return Number.isFinite(date.getTime()) ? date.getTime() : 0;
}

function getCrossrefTitle(item) {
  const title = Array.isArray(item?.title) ? item.title[0] : item?.title;
  return String(title || "").trim();
}

function getCrossrefUpdateTypes(item) {
  const updates = asArray(item?.["update-to"] || item?.updateTo);
  return updates
    .map((u) => String(u?.type || u?.["update-type"] || u?.label || "").trim().toLowerCase())
    .filter(Boolean);
}

function mapCrossrefWork(item) {
  const doi = normalizeDoi(item?.DOI || item?.doi);
  const title = getCrossrefTitle(item);
  const publishedDate = formatCrossrefDate(item);
  const updateTypes = getCrossrefUpdateTypes(item);
  return {
    doi,
    title,
    publishedDate,
    crossrefCitations: Number(item?.["is-referenced-by-count"] || 0),
    updateTypes,
    url: doi ? `https://doi.org/${doi}` : "",
  };
}

function buildCrossrefWorksUrl(issn, { rows = SCHOLAR_EVIDENCE_ROWS, updateType = "", fromYear = "" } = {}) {
  const normalizedIssn = normalizeIssnForQuery(issn);
  const filter = [`issn:${normalizedIssn}`];
  if (updateType) {
    filter.push(`update-type:${updateType}`);
  } else {
    filter.push("type:journal-article");
    if (fromYear) filter.push(`from-pub-date:${fromYear}-01-01`);
  }

  const params = new URLSearchParams({
    filter: filter.join(","),
    rows: String(Math.max(1, Math.min(Number(rows) || SCHOLAR_EVIDENCE_ROWS, 20))),
    sort: "published",
    order: "desc",
    select: "DOI,title,published-print,published-online,published,issued,container-title,is-referenced-by-count,update-to",
  });
  return `https://api.crossref.org/v1/works?${params.toString()}`;
}

function buildCrossrefProxyUrl(issn, { rows = SCHOLAR_EVIDENCE_ROWS, updateType = "", fromYear = "" } = {}) {
  const params = new URLSearchParams({
    issn: normalizeIssnForQuery(issn),
    rows: String(Math.max(1, Math.min(Number(rows) || SCHOLAR_EVIDENCE_ROWS, 20))),
  });
  if (updateType) params.set("update_type", updateType);
  if (fromYear) params.set("from_year", String(fromYear));
  return `${API_BASE}/scholar/crossref-works?${params.toString()}`;
}

function crossrefItemsFromPayload(payload) {
  return Array.isArray(payload?.message?.items) ? payload.message.items : [];
}

async function fetchCrossrefWorks(issn, options = {}) {
  const normalizedIssn = normalizeIssnForQuery(issn);
  if (!normalizedIssn) return [];
  const directUrl = buildCrossrefWorksUrl(normalizedIssn, options);
  const candidates = isLocalPreviewHost() ? [buildCrossrefProxyUrl(normalizedIssn, options)] : [directUrl];
  for (const url of candidates) {
    const payload = await fetchJsonWithTimeout(url, SCHOLAR_EVIDENCE_TIMEOUT_MS, {
      headers: { Accept: "application/json" },
    });
    const items = crossrefItemsFromPayload(payload);
    if (items.length) return items;
  }
  return [];
}

function semanticItemsFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload?.papers)) return payload.papers;
  return [];
}

async function fetchSemanticScholarPapers(dois) {
  const ids = [
    ...new Set(
      (Array.isArray(dois) ? dois : [])
        .map((doi) => normalizeDoi(doi))
        .filter(Boolean)
        .slice(0, SCHOLAR_EVIDENCE_ROWS)
        .map((doi) => `DOI:${doi}`)
    ),
  ];
  if (!ids.length) return [];

  const body = JSON.stringify({ ids });
  const fields = [
    "title",
    "year",
    "citationCount",
    "referenceCount",
    "influentialCitationCount",
    "venue",
    "publicationDate",
    "externalIds",
    "url",
    "isOpenAccess",
    "openAccessPdf",
  ].join(",");
  const directUrl = `https://api.semanticscholar.org/graph/v1/paper/batch?fields=${encodeURIComponent(fields)}`;
  const proxyUrl = `${API_BASE}/scholar/semantic-papers`;
  const candidates = isLocalPreviewHost() ? [proxyUrl] : [directUrl];

  for (const url of candidates) {
    const payload = await fetchJsonWithTimeout(url, SCHOLAR_EVIDENCE_TIMEOUT_MS, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body,
    });
    const items = semanticItemsFromPayload(payload).filter(Boolean);
    if (items.length) return items;
  }
  return [];
}

function mergeUniqueWorks(items, limit = SCHOLAR_EVIDENCE_ROWS) {
  const byKey = new Map();
  for (const item of items) {
    const work = mapCrossrefWork(item);
    const key = work.doi || `${work.title.toLowerCase()}|${work.publishedDate}`;
    if (!key || !work.title) continue;
    if (!byKey.has(key)) byKey.set(key, work);
  }
  return [...byKey.values()].sort((a, b) => dateEpoch(b.publishedDate) - dateEpoch(a.publishedDate)).slice(0, limit);
}

function buildSemanticMap(items) {
  const map = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    const doi = normalizeDoi(item?.externalIds?.DOI || item?.externalIds?.doi || "");
    if (doi) map.set(doi, item);
  }
  return map;
}

function getPaperEvidenceIssns(j) {
  return [...new Set([j?.issn, j?.eissn].map(normalizeIssnForQuery).filter(Boolean))];
}

function getPaperEvidenceCacheKey(issns, j = null) {
  const parts = Array.isArray(issns) ? issns : [];
  const title = normalizeTitleKey(j?.title || "");
  return [...parts, title].filter(Boolean).join("|");
}

function buildCarRiskApiUrl(j) {
  const params = new URLSearchParams();
  const issn = normalizeIssnForQuery(j?.issn || j?.eissn || "");
  const eissn = normalizeIssnForQuery(j?.eissn || "");
  const title = safe(j?.title).replace(/^-$/, "");
  if (issn) params.set("issn", issn);
  if (eissn && eissn !== issn) params.set("eissn", eissn);
  if (title) params.set("title", title);
  const query = params.toString();
  return query ? `${API_BASE}/journals/car-risk?${query}` : "";
}

async function fetchCarRisk(j) {
  const url = buildCarRiskApiUrl(j);
  if (!url) return null;
  const payload = await fetchJsonWithTimeout(url, CAR_RISK_TIMEOUT_MS, {
    headers: { Accept: "application/json" },
  });
  return payload?.ok && payload?.item ? payload.item : null;
}

async function buildPaperEvidenceBasePayload(j) {
  const issns = getPaperEvidenceIssns(j);
  if (!issns.length && !safe(j?.title).replace(/^-$/, "")) {
    return { status: "missing_issn", issns: [], updates: [], carRisk: null, fetchedAt: new Date().toISOString() };
  }

  return {
    status: "pending",
    issns,
    updates: [],
    carRisk: null,
    fetchedAt: new Date().toISOString(),
  };
}

async function enrichPaperEvidencePayload(basePayload, j) {
  const base = basePayload && typeof basePayload === "object" ? basePayload : {};
  const issns = Array.isArray(base.issns) ? base.issns : [];
  if (base.status === "missing_issn") return base;
  const carRiskPromise = fetchCarRisk(j).catch(() => null);

  const updateLists = issns.length
    ? await Promise.all(
        issns.flatMap((issn) => [
          fetchCrossrefWorks(issn, { rows: 5, updateType: "retraction" }).catch(() => []),
          fetchCrossrefWorks(issn, { rows: 5, updateType: "correction" }).catch(() => []),
        ])
      )
    : [];

  const updates = mergeUniqueWorks(updateLists.flat(), 10).map((work) => ({
    ...work,
    riskType: work.updateTypes.includes("retraction") ? "retraction" : work.updateTypes.includes("correction") ? "correction" : "update",
  }));
  const carRisk = await carRiskPromise;
  return {
    ...base,
    status: updates.length || carRisk ? "ok" : "empty",
    updates,
    carRisk,
    fetchedAt: new Date().toISOString(),
  };
}

async function buildPaperEvidencePayload(j) {
  const issns = getPaperEvidenceIssns(j);
  const cacheKey = getPaperEvidenceCacheKey(issns, j);
  if (cacheKey && paperEvidenceCache.has(cacheKey)) return paperEvidenceCache.get(cacheKey);

  const basePayload = await buildPaperEvidenceBasePayload(j);
  const payload = await enrichPaperEvidencePayload(basePayload, j);
  if (cacheKey) paperEvidenceCache.set(cacheKey, payload);
  return payload;
}

async function buildAndRenderPaperEvidenceProgressively(j) {
  const issns = getPaperEvidenceIssns(j);
  const cacheKey = getPaperEvidenceCacheKey(issns, j);
  if (cacheKey && paperEvidenceCache.has(cacheKey)) {
    const cached = paperEvidenceCache.get(cacheKey);
    pageState.paperEvidence = cached;
    renderPaperEvidence(cached, j);
    return;
  }

  const basePayload = await buildPaperEvidenceBasePayload(j);
  if (pageState.journal !== j) return;
  pageState.paperEvidence = basePayload;
  renderPaperEvidence(basePayload, j);

  const payload = await enrichPaperEvidencePayload(basePayload, j);
  if (cacheKey) paperEvidenceCache.set(cacheKey, payload);
  if (pageState.journal !== j) return;
  pageState.paperEvidence = payload;
  renderPaperEvidence(payload, j);
}

function normalizeTitleKey(v) {
  return String(v || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\u4e00-\u9fff]+/gu, "");
}

function pickOpenAlexSource(results, j) {
  if (!Array.isArray(results) || !results.length) return null;
  const targetTitle = normalizeTitleKey(j.title);
  const targetIssn = String(j.issn || "").replace("-", "");
  const targetEissn = String(j.eissn || "").replace("-", "");

  for (const item of results) {
    const name = normalizeTitleKey(item.display_name);
    if (targetTitle && name === targetTitle) return item;
  }
  for (const item of results) {
    const issns = Array.isArray(item.issn) ? item.issn.map((x) => String(x || "").replace("-", "")) : [];
    if ((targetIssn && issns.includes(targetIssn)) || (targetEissn && issns.includes(targetEissn))) {
      return item;
    }
  }
  return results[0];
}

async function fetchOpenAlexProfile(j) {
  const select = "id,ids,display_name,homepage_url,host_organization_name,is_oa,is_in_doaj,issn,issn_l,summary_stats,works_count,cited_by_count,apc_usd,apc_prices";
  const issns = [j.issn, j.eissn].filter(Boolean);
  for (const issn of issns) {
    const url = `https://api.openalex.org/sources?filter=issn:${encodeURIComponent(issn)}&per-page=6&select=${select}`;
    const payload = await fetchJsonWithTimeout(url);
    const hit = pickOpenAlexSource(payload?.results || [], j);
    if (hit) return hit;
  }

  if (j.title) {
    const url = `https://api.openalex.org/sources?search=${encodeURIComponent(j.title)}&per-page=8&select=${select}`;
    const payload = await fetchJsonWithTimeout(url);
    const hit = pickOpenAlexSource(payload?.results || [], j);
    if (hit) return hit;
  }
  return null;
}

function parseOpenAlexSourceId(rawId) {
  const m = String(rawId || "").match(/S\d+/i);
  return m ? m[0].toUpperCase() : "";
}

function getPublicationStartYearIssns(j, source = null) {
  const values = [
    j?.issn,
    j?.eissn,
    source?.issn_l,
    ...(Array.isArray(source?.issn) ? source.issn : []),
  ];
  return [...new Set(values.map(normalizeIssnForQuery).filter(Boolean))];
}

function buildCrossrefEarliestWorksUrl(issn) {
  const normalizedIssn = normalizeIssnForQuery(issn);
  const params = new URLSearchParams({
    filter: `issn:${normalizedIssn},type:journal-article`,
    rows: "5",
    sort: "published",
    order: "asc",
  });
  return `https://api.crossref.org/v1/works?${params.toString()}`;
}

function getCrossrefPublicationYear(item) {
  const parts = getCrossrefDateParts(item);
  return normalizePublicationStartYear(parts[0]);
}

async function fetchCrossrefStartYearInfo(j, source = null) {
  for (const issn of getPublicationStartYearIssns(j, source)) {
    const payload = await fetchJsonWithTimeout(buildCrossrefEarliestWorksUrl(issn), PUBLICATION_START_YEAR_TIMEOUT_MS, {
      headers: { Accept: "application/json" },
    });
    const years = crossrefItemsFromPayload(payload).map(getCrossrefPublicationYear).filter((year) => year !== null);
    if (years.length) {
      return {
        year: Math.min(...years),
        source: "Crossref",
        title: `Crossref 按 ISSN ${issn} 查询到的最早 journal-article 发布年`,
      };
    }
  }
  return null;
}

function inferYearFromDoi(rawDoi) {
  const doi = String(rawDoi || "").toLowerCase();
  const fourDigit = doi.match(/(?:^|[./;:_-])((?:19|20)\d{2})(?=$|[./;:_-])/);
  if (fourDigit) return normalizePublicationStartYear(fourDigit[1]);
  const natureYear = doi.match(/\/s\d{5}-(\d{3})(?=[-/])/);
  if (natureYear) return normalizePublicationStartYear(2000 + Number(natureYear[1]));
  return null;
}

function isSuspiciousOpenAlexStartWork(item) {
  const year = normalizePublicationStartYear(item?.publication_year);
  if (!year) return true;
  const doiYear = inferYearFromDoi(item?.doi);
  return Boolean(doiYear && Math.abs(doiYear - year) > 5);
}

function pickUpperMedianYear(years) {
  const clean = (Array.isArray(years) ? years : [])
    .map(normalizePublicationStartYear)
    .filter((year) => year !== null)
    .sort((a, b) => a - b);
  if (!clean.length) return null;
  return clean[Math.floor(clean.length / 2)];
}

async function fetchOpenAlexStartYearInfo(source) {
  const sourceId = parseOpenAlexSourceId(source?.id);
  if (!sourceId) return null;

  const url = `https://api.openalex.org/works?filter=primary_location.source.id:${encodeURIComponent(
    sourceId
  )}&sort=publication_year:asc&per-page=10&select=publication_year,doi,display_name`;
  const payload = await fetchJsonWithTimeout(url, 6000);
  const rows = Array.isArray(payload?.results) ? payload.results : [];
  const years = rows
    .filter((item) => !isSuspiciousOpenAlexStartWork(item))
    .map((item) => item?.publication_year);
  const year = pickUpperMedianYear(years);
  if (year) {
    const countText = years.length ? `${years.length} 条` : "多条";
    return {
      year,
      source: "OpenAlex",
      title: `OpenAlex 最早 ${countText}作品年份的中位数；仅作兜底参考`,
    };
  }
  return null;
}

async function fetchPublicationStartYearInfo(j, source = null, wikidataEntity = null) {
  const qid = parseWikidataQid(source?.ids?.wikidata);
  const cacheKey = [qid, ...getPublicationStartYearIssns(j, source), normalizeTitleKey(j?.title || source?.display_name || "")].filter(Boolean).join("|");
  const cached = cacheKey ? publicationStartYearCache.get(cacheKey) : null;
  if (cached !== undefined) return cached || null;

  const entity = wikidataEntity || (qid ? await fetchWikidataEntity(qid).catch(() => null) : null);
  const info =
    buildWikidataStartYearInfo(entity) ||
    (await fetchCrossrefStartYearInfo(j, source).catch(() => null)) ||
    (await fetchOpenAlexStartYearInfo(source).catch(() => null));

  if (cacheKey) publicationStartYearCache.set(cacheKey, info || null);
  return info || null;
}

async function fetchOpenAlexAnnualArticlesSeries(source) {
  const sourceId = parseOpenAlexSourceId(source?.id);
  if (!sourceId) return [];
  if (annualArticlesSeriesCache.has(sourceId)) {
    return annualArticlesSeriesCache.get(sourceId) || [];
  }

  const url = `https://api.openalex.org/works?filter=primary_location.source.id:${encodeURIComponent(
    sourceId
  )}&group_by=publication_year&per-page=200`;
  const payload = await fetchJsonWithTimeout(url, 7000);
  const groups = Array.isArray(payload?.group_by) ? payload.group_by : [];
  if (!groups.length) {
    annualArticlesSeriesCache.set(sourceId, []);
    return [];
  }

  const currentYear = new Date().getFullYear();
  const rows = groups
    .map((g) => {
      const y = Number(g?.key);
      const c = Number(g?.count);
      if (!Number.isFinite(y) || !Number.isFinite(c)) return null;
      if (y < 1600 || y > currentYear + 1 || c < 0) return null;
      return { year: Math.trunc(y), count: Math.trunc(c) };
    })
    .filter(Boolean)
    .sort((a, b) => a.year - b.year);

  annualArticlesSeriesCache.set(sourceId, rows);
  return rows;
}

function pickLatestCompletedAnnualArticles(rows) {
  if (!Array.isArray(rows) || !rows.length) return null;
  const currentYear = new Date().getFullYear();
  const sorted = [...rows].sort((a, b) => b.year - a.year);
  const latestCompleted = sorted.find((r) => r.year < currentYear) || sorted[0];
  return latestCompleted || null;
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v === null || v === undefined) return [];
  return [v];
}

function parseIntLoose(v) {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  const m = String(v || "").match(/-?\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function mapElsevierSubjectAreas(entry) {
  const areaMap = new Map();
  const areas = asArray(entry?.["subject-area"] || entry?.subjectArea || entry?.subject_area);
  for (const area of areas) {
    if (!area || typeof area !== "object") continue;
    const code = parseIntLoose(area?.["@code"] ?? area?.code ?? area?.subjectCode);
    if (code === null) continue;
    const name = String(area?.["$"] ?? area?.name ?? area?.subject ?? area?.subjectName ?? "").trim();
    const abbrev = String(area?.["@abbrev"] ?? area?.abbrev ?? "").trim();
    areaMap.set(String(code), { name, abbrev });
  }
  return areaMap;
}

function classifyAsjcLevel(subjectCode) {
  const code = parseIntLoose(subjectCode);
  if (code === null) return "学科";
  return code % 100 === 0 ? "大类" : "小类";
}

function parseElsevierSubjectRanks(rawRanks, subjectAreaMap) {
  const subjects = [];
  for (const row of asArray(rawRanks)) {
    if (!row || typeof row !== "object") continue;
    const code = parseIntLoose(row?.subjectCode ?? row?.["@subjectCode"] ?? row?.code ?? row?.["@code"]);
    const areaFromMap = code === null ? null : subjectAreaMap.get(String(code));
    const majorCode = code === null ? null : Math.floor(code / 100) * 100;
    const majorAreaFromMap = majorCode === null ? null : subjectAreaMap.get(String(majorCode));
    const explicitName = String(row?.subjectName ?? row?.subjectLongName ?? row?.subject ?? row?.category ?? "").trim();
    const displayName = explicitName || areaFromMap?.name || (code === null ? "" : `ASJC ${code}`);
    const rankRaw = String(row?.rank ?? row?.["@rank"] ?? "").trim();
    const rankOutOfRaw = row?.rankOutOf ?? row?.["@rankOutOf"] ?? row?.total ?? row?.["@total"];
    const rankOutOf = parseIntLoose(rankOutOfRaw);
    let rank = /^\d+(?:\.0+)?$/.test(rankRaw) ? String(Math.round(Number(rankRaw))) : rankRaw;
    if (rank && rankOutOf && !rank.includes("/")) rank = `${rank}/${rankOutOf}`;
    const percentile = parseFloatLoose(row?.percentile ?? row?.["@percentile"] ?? row?.percent);
    const quartileRaw = String(row?.quartile ?? row?.["@quartile"] ?? "").trim().toUpperCase();
    const quartile = /^Q[1-4]$/.test(quartileRaw) ? quartileRaw : deriveQuartileFromPercentile(percentile);
    if (!displayName && !rank && percentile === null && !quartile) continue;
    subjects.push({
      level: classifyAsjcLevel(code),
      category: majorAreaFromMap?.name || areaFromMap?.name || "",
      subject: explicitName || displayName,
      name: displayName,
      quartile,
      rank,
      percentile,
    });
  }
  return normalizeCiteScoreSubjectRows(subjects);
}

function getByPath(root, path) {
  let cur = root;
  for (const k of path) {
    if (cur === null || cur === undefined) return null;
    cur = cur[k];
  }
  return cur;
}

function collectElsevierMetricCandidates(entry, metricKeys) {
  const keys = metricKeys.map((k) => String(k).toLowerCase());
  const candidates = [];
  walkObject(entry, (key, value, path) => {
    const keyLower = String(key || "").toLowerCase();
    const pathText = path.map((x) => String(x).toLowerCase()).join(">");
    const hasMetricScope = keys.some((k) => keyLower === k || keyLower.includes(k) || pathText.includes(k));
    if (!hasMetricScope) return;
    if (keyLower.includes("rank") || keyLower.includes("percent") || keyLower.includes("year")) return;
    if (pathText.includes("subjectrank")) return;
    const num = parseFloatLoose(value);
    if (num === null) return;
    if (num < 0 || num > 10000) return;
    const parent = getByPath(entry, path.slice(0, -1)) || {};
    const year = extractYearToken(parent?.["@year"] ?? parent?.year ?? parent?.date ?? "");
    if (pathText.includes("subjects")) return;
    candidates.push({ value: num, year: year || 0, pathText });
  });
  return candidates;
}

function pickElsevierMetric(entry, metricKeys) {
  const candidates = collectElsevierMetricCandidates(entry, metricKeys);
  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.value - a.value;
  });
  return candidates[0].value;
}

function parseElsevierYearInfoRows(entry, subjectAreaMap) {
  const yearInfoRoot = entry?.citeScoreYearInfoList || entry?.["citeScoreYearInfoList"] || {};
  const yearRows = asArray(yearInfoRoot?.citeScoreYearInfo || yearInfoRoot?.["citeScoreYearInfo"]);
  const parsedRows = [];

  for (const row of yearRows) {
    if (!row || typeof row !== "object") continue;
    const infoList = asArray(row?.citeScoreInformationList || row?.["citeScoreInformationList"]);
    const infoNodes = [];
    for (const item of infoList) {
      if (!item || typeof item !== "object") continue;
      const scoreNodes = asArray(item?.citeScoreInfo || item?.["citeScoreInfo"]);
      if (scoreNodes.length) {
        infoNodes.push(...scoreNodes);
      } else {
        infoNodes.push(item);
      }
    }
    if (!infoNodes.length) infoNodes.push(row);

    let scoreNode = infoNodes[0];
    for (const item of infoNodes) {
      const scoreVal = parseFloatLoose(item?.citeScore ?? item?.citeScoreCurrentMetric ?? item?.currentMetric);
      if (scoreVal !== null) {
        scoreNode = item;
        break;
      }
    }

    const year = extractYearToken(row?.["@year"] ?? row?.year ?? scoreNode?.year ?? scoreNode?.["@year"]);
    const score = parseFloatLoose(scoreNode?.citeScore ?? scoreNode?.citeScoreCurrentMetric ?? scoreNode?.currentMetric);
    const subjects = parseElsevierSubjectRanks(
      scoreNode?.citeScoreSubjectRank ??
        scoreNode?.["citeScoreSubjectRank"] ??
        row?.citeScoreSubjectRank ??
        row?.["citeScoreSubjectRank"],
      subjectAreaMap
    );
    const subjectPercentiles = subjects.map((x) => parseFloatLoose(x.percentile)).filter((x) => x !== null);
    const percentileFromSubjects = subjectPercentiles.length ? Math.max(...subjectPercentiles) : null;
    const percentileDirect = parseFloatLoose(scoreNode?.percentile ?? row?.percentile);
    const percentile = percentileFromSubjects !== null ? percentileFromSubjects : percentileDirect;
    const status = String(row?.["@status"] ?? row?.status ?? "").trim();

    if (score === null && !subjects.length && percentile === null) continue;
    parsedRows.push({
      year: year ? String(year) : "",
      score,
      percentile: percentile === null ? null : Math.max(0, Math.min(percentile, 100)),
      status,
      subjects,
    });
  }

  parsedRows.sort((a, b) => {
    const yearDiff = yearNum(b.year) - yearNum(a.year);
    if (yearDiff !== 0) return yearDiff;
    const scoreA = a.score === null ? -1 : a.score;
    const scoreB = b.score === null ? -1 : b.score;
    return scoreB - scoreA;
  });
  return parsedRows;
}

function parseElsevierCiteScorePayload(payload) {
  const entry = payload?.["serial-metadata-response"]?.entry?.[0] || payload?.entry?.[0] || payload;
  if (!entry || typeof entry !== "object") {
    return { score: null, year: "", percentile: null, subjects: [], status: "", sjr: null, snip: null };
  }

  const subjectAreaMap = mapElsevierSubjectAreas(entry);
  const sjr = pickElsevierMetric(entry, ["sjr"]);
  const snip = pickElsevierMetric(entry, ["snip"]);
  const yearRows = parseElsevierYearInfoRows(entry, subjectAreaMap);
  if (yearRows.length) {
    const best = yearRows.find((x) => x.score !== null) || yearRows[0];
    return {
      score: best.score,
      year: best.year,
      percentile: best.percentile,
      subjects: best.subjects || [],
      status: best.status || "",
      sjr,
      snip,
    };
  }

  const scoreCandidates = [];
  const percentileCandidates = [];
  const yearCandidates = [];
  walkObject(entry, (key, value) => {
    const k = String(key || "").toLowerCase();
    const n = parseFloatLoose(value);
    if (n !== null) {
      if (k.includes("citescore") && !k.includes("percent") && !k.includes("rank") && !k.includes("year")) {
        scoreCandidates.push(n);
      }
      if (k.includes("percent")) {
        percentileCandidates.push(n);
      }
    }
    if (k.includes("year")) {
      const y = extractYearToken(value);
      if (y) yearCandidates.push(y);
    }
  });

  const validScores = scoreCandidates.filter((x) => x >= 0 && x <= 500);
  const validPercentiles = percentileCandidates.filter((x) => x >= 0 && x <= 100);
  const score = validScores.length ? Math.max(...validScores) : null;
  const percentile = validPercentiles.length ? Math.max(...validPercentiles) : null;
  const year = yearCandidates.length ? String(Math.max(...yearCandidates)) : "";
  const fallbackSubjects = parseElsevierSubjectRanks(entry?.citeScoreSubjectRank || entry?.["citeScoreSubjectRank"], subjectAreaMap);
  return {
    score,
    year,
    percentile,
    subjects: fallbackSubjects,
    status: "",
    sjr,
    snip,
  };
}

async function fetchElsevierCiteScore(j) {
  const issns = [...new Set([j.issn, j.eissn].filter(Boolean).map((x) => String(x).trim()).filter(Boolean))];
  if (!issns.length) {
    return {
      score: null,
      year: "",
      percentile: null,
      subjects: [],
      status: "",
      sjr: null,
      snip: null,
      source: "数据来源：暂缺 ISSN",
      reason: "missing_issn",
    };
  }

  const proxies = await Promise.all(issns.map((issn) => fetchElsevierViaApi(issn)));
  const failReasons = [];
  for (const proxy of proxies) {
    if (proxy.ok && proxy.payload) {
      const parsed = parseElsevierCiteScorePayload(proxy.payload);
      if (parsed.score !== null || parsed.sjr !== null || parsed.snip !== null || (parsed.subjects || []).length) {
        const statusText = parsed.status ? ` · ${parsed.status}` : "";
        return {
          ...parsed,
          source: `数据来源：Scopus CiteScore${statusText}`,
          reason: "",
        };
      }
      failReasons.push("api_no_metric");
    } else {
      failReasons.push(proxy.reason || "api_failed");
    }
  }

  const reason = failReasons[0] || "elsevier_unavailable";
  return {
    score: null,
    year: "",
    percentile: null,
    subjects: [],
    status: "",
    sjr: null,
    snip: null,
    source: "数据来源：Scopus CiteScore",
    reason,
  };
}

function mapElsevierFailureReason(reason) {
  const r = String(reason || "").trim();
  if (!r) return "";
  if (r === "openalex_unavailable") return "无法识别期刊来源";
  if (r === "citescore_request_failed") return "请求失败";
  if (r === "missing_issn") return "缺少 ISSN";
  if (r === "api_missing_api_key") return "服务端尚未配置 Elsevier Key";
  if (r === "api_elsevier_unreachable") return "Elsevier 服务暂不可达";
  if (r === "api_elsevier_timeout") return "Elsevier 服务响应超时";
  if (r === "api_unreachable") return "CiteScore 服务暂不可用";
  if (r.startsWith("api_http_401")) return "CiteScore 服务认证失败";
  if (r.startsWith("api_http_403")) return "CiteScore 服务请求被拒绝";
  if (r.startsWith("api_http_429")) return "CiteScore 服务请求超限";
  if (r.startsWith("api_elsevier_http_error")) return "Elsevier 接口返回错误";
  if (r === "api_no_metric") return "Elsevier 返回中缺少所需指标字段";
  return `Elsevier 不可用（${r}）`;
}

function getCiteScoreCacheKey(j) {
  const issns = [j?.issn, j?.eissn]
    .filter(Boolean)
    .map((x) => normalizeIssnForQuery(x).toUpperCase())
    .filter(Boolean)
    .sort();
  return [...new Set(issns)].join("|");
}

function getCiteScoreCacheTtl(payload) {
  return parseFloatLoose(payload?.score) !== null ? CITESCORE_CACHE_TTL_MS : CITESCORE_NEGATIVE_CACHE_TTL_MS;
}

async function fetchCiteScoreMetric(j, { force = false } = {}) {
  const cacheKey = getCiteScoreCacheKey(j);
  if (!cacheKey) return fetchElsevierCiteScore(j);
  if (force) {
    deleteMetricCache(citeScoreMetricCache, "citescore", cacheKey);
    citeScoreRequestCache.delete(cacheKey);
  } else {
    const cachedPayload = readMetricCache(citeScoreMetricCache, "citescore", cacheKey);
    if (cachedPayload) return cachedPayload;
  }

  if (!citeScoreRequestCache.has(cacheKey)) {
    citeScoreRequestCache.set(
      cacheKey,
      fetchElsevierCiteScore(j)
        .then((payload) => {
          if (payload && typeof payload === "object") {
            writeMetricCache(citeScoreMetricCache, "citescore", cacheKey, payload, getCiteScoreCacheTtl(payload));
          }
          return payload;
        })
        .finally(() => citeScoreRequestCache.delete(cacheKey))
    );
  }
  return citeScoreRequestCache.get(cacheKey);
}

function applyCiteScoreMetricState(citeScore = {}) {
  setCiteScoreCardState({
    score: citeScore.score,
    year: citeScore.year,
    percentile: citeScore.percentile,
    subjects: citeScore.subjects || [],
    sjr: citeScore.sjr,
    snip: citeScore.snip,
    meta: citeScore.meta || "",
    source: citeScore.source || "",
    reason: citeScore.reason || "",
  });
}

function startCiteScoreMetricLoad(j) {
  setCiteScoreCardState({
    score: null,
    year: "",
    percentile: null,
    meta: "正在刷新官方 CiteScore...",
    source: "数据来源：正在更新",
    reason: "",
  });

  const currentJournal = j;
  const promise = fetchCiteScoreMetric(j).catch(() => ({
    score: null,
    year: "",
    percentile: null,
    subjects: [],
    sjr: null,
    snip: null,
    meta: "官方 CiteScore 请求失败",
    source: "数据来源：Scopus CiteScore",
    reason: "citescore_request_failed",
  }));
  promise.then((citeScore) => {
    if (pageState.journal !== currentJournal) return;
    applyCiteScoreMetricState(citeScore);
  });
  return promise;
}

async function refreshCiteScoreForCurrentJournal({ force = true } = {}) {
  const j = pageState.journal;
  if (!j) return;

  setCiteScoreCardState({
    score: null,
    year: "",
    percentile: null,
    meta: "正在刷新官方 CiteScore...",
    source: "数据来源：正在更新",
    reason: "",
  });

  const citeScore = await fetchCiteScoreMetric(j, { force });
  if (pageState.journal !== j) return;
  applyCiteScoreMetricState(citeScore);
}

async function enrichSpotlightFromOpenAlex(j, latestCas) {
  const source = await fetchOpenAlexProfile(j);
  pageState.openAlexSource = source || null;
  if (!source) {
    const fallbackWebsite = resolveWebsite(j);
    if (fallbackWebsite) {
      setSpotlightWebsite(fallbackWebsite, "访问期刊官网");
      const fallbackCover = await fetchHomepagePreviewImage(fallbackWebsite);
      if (fallbackCover) {
        renderSpotlightCover(j, latestCas, fallbackWebsite, fallbackCover);
      }
    }

    const introWithoutSource = await fetchJournalIntro(j, null, null);
    els.journalSummary.textContent = introWithoutSource || "暂无可用的公开期刊简介。";
    els.journalSummary.classList.toggle("is-muted", !introWithoutSource);
    renderAnnualArticlesTrend([]);
    return;
  }

  const homepage = normalizeHttpUrl(source.homepage_url || "");
  const fallbackWebsite = resolveWebsite(j);
  const effectiveWebsite = homepage || fallbackWebsite;
  if (effectiveWebsite) {
    setSpotlightWebsite(effectiveWebsite, "访问期刊官网");
  }

  const homepageCoverPromise = effectiveWebsite ? fetchHomepagePreviewImage(effectiveWebsite) : Promise.resolve("");

  const qid = parseWikidataQid(source?.ids?.wikidata);
  const wikidataEntityPromise = qid ? fetchWikidataEntity(qid).catch(() => null) : Promise.resolve(null);
  const [homepageCover, wikidataEntity] = await Promise.all([homepageCoverPromise, wikidataEntityPromise]);
  const wikidataCover = pickWikidataCoverUrl(wikidataEntity);
  const selectedCover = homepageCover || wikidataCover || "";
  if (selectedCover || effectiveWebsite) {
    renderSpotlightCover(j, latestCas, effectiveWebsite, selectedCover);
  }

  if (isBlankValue(j.publisher) && source.host_organization_name) {
    setSoftValue(els.spotPublisher, source.host_organization_name);
  }
  const apcInfo = buildApcDisplay(j, source);
  setOaModeDisplay(buildOaModeInfo(j, source, apcInfo));
  setApcDisplay(apcInfo);
  refreshOfficialApcForCurrentJournal(j, source).catch(() => {});

  const startYearInfo = await fetchPublicationStartYearInfo(j, source, wikidataEntity);
  if (startYearInfo) setPublicationStartYearDisplay(startYearInfo);

  const annualSeries = await fetchOpenAlexAnnualArticlesSeries(source);
  const annual = pickLatestCompletedAnnualArticles(annualSeries);
  if (annual && els.spotAnnualArticles) {
    setSoftValue(els.spotAnnualArticles, `${annual.year} 年 · ${annual.count.toLocaleString()} 篇`);
  }
  renderAnnualArticlesTrend(annualSeries);

  const intro = await fetchJournalIntro(j, source, wikidataEntity);
  els.journalSummary.textContent = intro || "暂无可用的公开期刊简介。";
  els.journalSummary.classList.toggle("is-muted", !intro);
}

function renderSpotlight(j, latestCas, indexTypeText = "-") {
  const website = resolveWebsite(j);
  renderSpotlightCover(j, latestCas, website);
  setSpotlightWebsite(website, "访问期刊官网");

  els.journalSummary.textContent = "公开简介待识别";
  els.journalSummary.classList.add("is-muted");
  setSoftValue(els.spotPublisher, j.publisher);
  setSoftValue(els.spotIndexType, indexTypeText);
  const apcInfo = buildApcDisplay(j, null);
  setOaModeDisplay(buildOaModeInfo(j, null, apcInfo));
  setApcDisplay(apcInfo);
  pageState.officialApcKey = "";
  refreshOfficialApcForCurrentJournal(j, null).catch(() => {});
  setPublicationStartYearDisplay(null);
  setSoftValue(els.spotAnnualArticles, null);
  resetPredictedImpactFactor("计算中");
  setCiteScoreCardState({
    score: null,
    year: "",
    percentile: null,
    meta: "等待官方 CiteScore",
    source: "数据来源：待更新",
    reason: "",
  });
}

function renderRow(j, meta) {
  els.title.textContent = j.title || "未知期刊";
  els.subtitle.textContent = [j.issn, j.cn_number].filter(Boolean).join(" / ") || "无 ISSN/CN 信息";
  renderTopTags(j);

  const ifYear = safe(j.if_year || lastYearToken(meta.showjcr_jcr_year)).replace(/^-$/, "");
  const casYear = safe(j.cas_year || lastYearToken(meta.showjcr_fqb_year)).replace(/^-$/, "");
  const jcrReleaseYear = formatJcrReleaseYear(ifYear);
  const jcrLabel = jcrReleaseYear ? `JCR分区（${jcrReleaseYear}）` : "JCR分区";
  const casLabel = casYear ? `中科院分区（${casYear}）` : "中科院分区";
  const xuankanLabel = "新锐分区（2026）";
  const xuankanText = safe(j.xuankan_2026);
  const latestCas = [...(Array.isArray(j.cas_history) ? j.cas_history : [])].sort((a, b) => yearNum(b.year) - yearNum(a.year))[0];
  pageState.journal = j;
  pageState.latestCas = latestCas || null;
  pageState.openAlexSource = null;
  pageState.officialApcKey = "";
  const casText = j.cas_2025 ? `${j.cas_2025}${j.is_top === true ? " (Top)" : ""}` : "-";
  const casSubText = formatCASSubcategoriesMultiline(latestCas?.subcategories);
  const indexSignals = collectIndexSignals(j, latestCas);
  const inclusionTypeText = buildInclusionTypeText(indexSignals);
  const ssciText = indexSignals.hasSSCI ? "是" : "-";
  const pkuCoreText = j.pku_core ? "是" : "-";
  const cssciText = (() => {
    if (j.cssci_type) return safe(j.cssci_type);
    const tags = Array.isArray(j.tags) ? j.tags : [];
    if (tags.includes("CSSCI(扩展)")) return "扩展版";
    if (tags.includes("CSSCI")) return "来源版";
    return "-";
  })();

  renderImpactFactor(j, ifYear);
  renderSpotlight(j, latestCas, inclusionTypeText);
  loadPredictedImpactFactor(j, ifYear);
  startCiteScoreMetricLoad(j);
  enrichSpotlightFromOpenAlex(j, latestCas).catch(() => {
    els.journalSummary.textContent = "暂无可用的公开期刊简介。";
    els.journalSummary.classList.add("is-muted");
    renderAnnualArticlesTrend([]);
  });

  const isChinese = !!j.cn_number;
  const kv = [
    { k: "ISSN", v: safe(j.issn) },
    { k: "eISSN", v: safe(j.eissn) },
    ...(isChinese ? [{ k: "CN号", v: safe(j.cn_number) }] : []),
    { k: jcrLabel, valueHtml: buildJcrQuartileCoreValue(j, ifYear), info: "showjcr" },
    ...(j.ni_journal ? [{ k: "NI期刊", valueHtml: buildNatureIndexCoreValue(j) }] : []),
    { k: xuankanLabel, v: xuankanText },
    { k: casLabel, v: casText, info: "showjcr" },
    { k: `中科院大类${casYear ? `（${casYear}）` : ""}`, v: safe(latestCas?.category || ""), info: "showjcr", span: 2 },
    { k: `中科院小类${casYear ? `（${casYear}）` : ""}`, v: safe(casSubText), info: "showjcr", span: 2, multiline: true },
    ...(isChinese ? [
      { k: "SSCI", v: ssciText },
      { k: "CSCD", v: safe(j.cscd_type) },
      { k: "北大核心", v: pkuCoreText },
      { k: "CSSCI", v: cssciText },
    ] : []),
  ];

  els.coreGrid.innerHTML = kv
    .map((item) => {
      const label = escapeHtml(item.k);
      const cls = item.span === 2 ? "kv is-span-2" : "kv";
      const valueCls = item.multiline ? "v is-multiline" : "v";
      const valueHtml = item.valueHtml !== undefined ? String(item.valueHtml) : escapeHtml(item.v);
      return `<div class="${cls}"><div class="k">${label}</div><div class="${valueCls}">${valueHtml}</div></div>`;
    })
    .join("");
}

function buildTrendPoint({ x, y, radius, className, label }) {
  const safeLabel = escapeHtml(label);
  const xText = x.toFixed(2);
  const yText = y.toFixed(2);
  return `
    <g class="trend-point" tabindex="0" role="button" aria-label="${safeLabel}" data-chart-tip="${safeLabel}">
      <circle cx="${xText}" cy="${yText}" r="12" class="trend-point-hit" aria-hidden="true"></circle>
      <circle cx="${xText}" cy="${yText}" r="${radius}" class="${className}"><title>${safeLabel}</title></circle>
    </g>
  `;
}

function buildIFTrend(ifRows) {
  const rows = ifRows
    .map((r) => ({ year: String(r.year || ""), value: numberOrNull(r.if_value) }))
    .filter((r) => r.value !== null)
    .sort((a, b) => yearNum(a.year) - yearNum(b.year));

  if (!rows.length) {
    return "<p class='placeholder'>可绘制趋势的数据不足</p>";
  }

  const width = 640;
  const height = 280;
  const padLeft = 66;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 52;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const values = rows.map((r) => Number(r.value));
  const minData = Math.min(...values);
  const maxData = Math.max(...values);

  const rawRange = Math.max(maxData - minData, 1e-6);
  const rawStep = rawRange / 4;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const norm = rawStep / mag;
  const stepBase = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  const tickStep = stepBase * mag;
  const tickDecimals = (() => {
    let s = Math.abs(Number(tickStep));
    if (!Number.isFinite(s) || s <= 0) return 0;
    let decimals = 0;
    while (decimals < 6 && Math.abs(s - Math.round(s)) > 1e-9) {
      s *= 10;
      decimals += 1;
    }
    return decimals;
  })();

  let minV = Math.floor(minData / tickStep) * tickStep;
  let maxV = Math.ceil(maxData / tickStep) * tickStep;
  if (minV === maxV) {
    minV -= tickStep;
    maxV += tickStep;
  }

  const xAt = (i) => {
    if (rows.length === 1) return padLeft + chartW / 2;
    return padLeft + (i * chartW) / (rows.length - 1);
  };
  const yAt = (v) => padTop + ((maxV - v) * chartH) / (maxV - minV);

  const points = rows.map((r, i) => ({ x: xAt(i), y: yAt(Number(r.value)), year: r.year, value: r.value }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const areaPath = [
    `M${points[0].x.toFixed(2)} ${(height - padBottom).toFixed(2)}`,
    ...points.map((p) => `L${p.x.toFixed(2)} ${p.y.toFixed(2)}`),
    `L${points[points.length - 1].x.toFixed(2)} ${(height - padBottom).toFixed(2)}`,
    "Z",
  ].join(" ");

  const yTicks = [];
  for (let v = minV; v <= maxV + tickStep * 0.5; v += tickStep) {
    yTicks.push(Number(v.toFixed(6)));
  }

  const yGrid = yTicks
    .map((v) => {
      const y = yAt(v);
      return `<line x1="${padLeft}" y1="${y.toFixed(2)}" x2="${(width - padRight).toFixed(2)}" y2="${y.toFixed(
        2
      )}" class="if-grid-line"></line>`;
    })
    .join("");

  const yLabels = yTicks
    .map((v) => {
      const y = yAt(v);
      const text = Number(v).toFixed(tickDecimals);
      return `<text x="${(padLeft - 10).toFixed(2)}" y="${(y + 4).toFixed(2)}" text-anchor="end" class="if-tick-label">${escapeHtml(
        text
      )}</text>`;
    })
    .join("");

  const xTicks = points
    .map((p) => {
      const y0 = height - padBottom;
      return `<line x1="${p.x.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${p.x.toFixed(2)}" y2="${(y0 + 5).toFixed(
        2
      )}" class="if-axis-tick"></line>`;
    })
    .join("");

  const xLabels = points
    .map((p, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === points.length - 1;
      const anchor = isFirst ? "start" : isLast ? "end" : "middle";
      const x = p.x + (isFirst ? 4 : isLast ? -4 : 0);
      return `<text x="${x.toFixed(2)}" y="${(height - 18).toFixed(2)}" text-anchor="${anchor}" class="if-tick-label">${escapeHtml(
        formatIFAcademicYear(p.year) || p.year
      )}</text>`;
    })
    .join("");

  const pointDots = points
    .map((p) =>
      buildTrendPoint({
        x: p.x,
        y: p.y,
        radius: 3.6,
        className: "if-trend-dot",
        label: `${formatIFAcademicYear(p.year) || p.year} · IF ${p.value}`,
      })
    )
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" class="if-trend-svg" role="img" aria-label="IF 历年变化趋势图">
      ${yGrid}
      <line x1="${padLeft}" y1="${(height - padBottom).toFixed(2)}" x2="${(width - padRight).toFixed(
        2
      )}" y2="${(height - padBottom).toFixed(2)}" class="if-axis-line"></line>
      <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${(height - padBottom).toFixed(2)}" class="if-axis-line"></line>
      <path d="${areaPath}" class="if-trend-area"></path>
      <path d="${linePath}" class="if-trend-line"></path>
      ${pointDots}
      ${xTicks}
      ${xLabels}
      ${yLabels}
      <text x="16" y="${(height / 2).toFixed(2)}" text-anchor="middle" class="if-axis-title" transform="rotate(-90 16 ${
        height / 2
      })">影响因子 (IF)</text>
    </svg>
  `;
}

function buildCASTrend(casRows) {
  const rows = casRows
    .map((r) => ({ year: String(r.year || ""), rankText: String(r.rank || ""), rank: casRankNumber(r.rank) }))
    .filter((r) => r.rank !== null)
    .sort((a, b) => yearNum(a.year) - yearNum(b.year));

  if (!rows.length) {
    return "<p class='placeholder'>暂无可绘制的中科院分区趋势</p>";
  }

  const width = 640;
  const height = 280;
  const padLeft = 66;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 52;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const xAt = (i) => {
    if (rows.length === 1) return padLeft + chartW / 2;
    return padLeft + (i * chartW) / (rows.length - 1);
  };
  const yAt = (rankNum) => {
    const ratio = (Number(rankNum) - 1) / 3;
    return padTop + ratio * chartH;
  };

  const points = rows.map((r, i) => ({ x: xAt(i), y: yAt(r.rank), year: r.year, rank: r.rank, rankText: r.rankText }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

  const yTicks = [1, 2, 3, 4];
  const yGrid = yTicks
    .map((rank) => {
      const y = yAt(rank);
      return `<line x1="${padLeft}" y1="${y.toFixed(2)}" x2="${(width - padRight).toFixed(2)}" y2="${y.toFixed(
        2
      )}" class="cas-grid-line"></line>`;
    })
    .join("");

  const yLabels = yTicks
    .map((rank) => {
      const y = yAt(rank);
      return `<text x="${(padLeft - 10).toFixed(2)}" y="${(y + 4).toFixed(2)}" text-anchor="end" class="cas-tick-label">${escapeHtml(
        `${rank}区`
      )}</text>`;
    })
    .join("");

  const xTicks = points
    .map((p) => {
      const y0 = height - padBottom;
      return `<line x1="${p.x.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${p.x.toFixed(2)}" y2="${(y0 + 5).toFixed(
        2
      )}" class="cas-axis-tick"></line>`;
    })
    .join("");

  const xLabels = points
    .map((p, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === points.length - 1;
      const anchor = isFirst ? "start" : isLast ? "end" : "middle";
      const x = p.x + (isFirst ? 4 : isLast ? -4 : 0);
      return `<text x="${x.toFixed(2)}" y="${(height - 18).toFixed(2)}" text-anchor="${anchor}" class="cas-tick-label">${escapeHtml(
        p.year
      )}</text>`;
    })
    .join("");

  const pointDots = points
    .map((p) =>
      buildTrendPoint({
        x: p.x,
        y: p.y,
        radius: 3.8,
        className: "cas-trend-dot",
        label: `${p.year} · 中科院${p.rankText || `${p.rank}区`}`,
      })
    )
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" class="cas-trend-svg" role="img" aria-label="中科院分区发布年份变化趋势图">
      ${yGrid}
      <line x1="${padLeft}" y1="${(height - padBottom).toFixed(2)}" x2="${(width - padRight).toFixed(
        2
      )}" y2="${(height - padBottom).toFixed(2)}" class="cas-axis-line"></line>
      <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${(height - padBottom).toFixed(2)}" class="cas-axis-line"></line>
      <path d="${linePath}" class="cas-trend-line"></path>
      ${pointDots}
      ${xTicks}
      ${xLabels}
      ${yLabels}
      <text x="16" y="${(height / 2).toFixed(2)}" text-anchor="middle" class="cas-axis-title" transform="rotate(-90 16 ${
        height / 2
      })">中科院分区</text>
    </svg>
  `;
}

function buildAnnualTrend(annualRows) {
  const rows = annualRows
    .map((r) => ({
      year: String(r?.year || "").trim(),
      value: numberOrNull(r?.count),
    }))
    .filter((r) => r.year && r.value !== null)
    .sort((a, b) => yearNum(a.year) - yearNum(b.year));

  if (!rows.length) {
    return "<p class='placeholder'>暂无可绘制的年发文量数据</p>";
  }

  const series = rows.length > 10 ? rows.slice(-10) : rows;
  const width = 640;
  const height = 280;
  const padLeft = 72;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 52;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const values = series.map((r) => Number(r.value));
  const minData = Math.min(...values);
  const maxData = Math.max(...values);

  const rawRange = Math.max(maxData - minData, 1);
  const rawStep = rawRange / 4;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const norm = rawStep / mag;
  const stepBase = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  const tickStep = Math.max(1, Math.round(stepBase * mag));

  let minV = Math.floor(minData / tickStep) * tickStep;
  let maxV = Math.ceil(maxData / tickStep) * tickStep;
  if (minV === maxV) {
    minV = Math.max(0, minV - tickStep);
    maxV += tickStep;
  }
  if (minV > 0) {
    minV = Math.max(0, minV - tickStep);
  }

  const xAt = (i) => {
    if (series.length === 1) return padLeft + chartW / 2;
    return padLeft + (i * chartW) / (series.length - 1);
  };
  const yAt = (v) => padTop + ((maxV - v) * chartH) / Math.max(maxV - minV, 1);

  const points = series.map((r, i) => ({ x: xAt(i), y: yAt(Number(r.value)), year: r.year, value: Number(r.value) }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const areaPath = [
    `M${points[0].x.toFixed(2)} ${(height - padBottom).toFixed(2)}`,
    ...points.map((p) => `L${p.x.toFixed(2)} ${p.y.toFixed(2)}`),
    `L${points[points.length - 1].x.toFixed(2)} ${(height - padBottom).toFixed(2)}`,
    "Z",
  ].join(" ");

  const yTicks = [];
  for (let v = minV; v <= maxV + tickStep * 0.5; v += tickStep) {
    yTicks.push(Math.round(v));
  }

  const yGrid = yTicks
    .map((v) => {
      const y = yAt(v);
      return `<line x1="${padLeft}" y1="${y.toFixed(2)}" x2="${(width - padRight).toFixed(2)}" y2="${y.toFixed(
        2
      )}" class="annual-grid-line"></line>`;
    })
    .join("");

  const yLabels = yTicks
    .map((v) => {
      const y = yAt(v);
      return `<text x="${(padLeft - 10).toFixed(2)}" y="${(y + 4).toFixed(2)}" text-anchor="end" class="annual-tick-label">${escapeHtml(
        Number(v).toLocaleString()
      )}</text>`;
    })
    .join("");

  const xTicks = points
    .map((p) => {
      const y0 = height - padBottom;
      return `<line x1="${p.x.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${p.x.toFixed(2)}" y2="${(y0 + 5).toFixed(
        2
      )}" class="annual-axis-tick"></line>`;
    })
    .join("");

  const xLabels = points
    .map((p, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === points.length - 1;
      const anchor = isFirst ? "start" : isLast ? "end" : "middle";
      const x = p.x + (isFirst ? 4 : isLast ? -4 : 0);
      return `<text x="${x.toFixed(2)}" y="${(height - 18).toFixed(2)}" text-anchor="${anchor}" class="annual-tick-label">${escapeHtml(
        p.year
      )}</text>`;
    })
    .join("");

  const pointDots = points
    .map((p) =>
      buildTrendPoint({
        x: p.x,
        y: p.y,
        radius: 3.8,
        className: "annual-trend-dot",
        label: `${p.year} · 发文量 ${Math.round(p.value).toLocaleString()} 篇`,
      })
    )
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" class="annual-trend-svg" role="img" aria-label="年发文量变化趋势图">
      ${yGrid}
      <line x1="${padLeft}" y1="${(height - padBottom).toFixed(2)}" x2="${(width - padRight).toFixed(
        2
      )}" y2="${(height - padBottom).toFixed(2)}" class="annual-axis-line"></line>
      <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${(height - padBottom).toFixed(2)}" class="annual-axis-line"></line>
      <path d="${areaPath}" class="annual-trend-area"></path>
      <path d="${linePath}" class="annual-trend-line"></path>
      ${pointDots}
      ${xTicks}
      ${xLabels}
      ${yLabels}
      <text x="16" y="${(height / 2).toFixed(2)}" text-anchor="middle" class="annual-axis-title" transform="rotate(-90 16 ${
        height / 2
      })">年发文量（篇）</text>
    </svg>
  `;
}

function renderAnnualArticlesTrend(rows) {
  if (!els.annualTrendChart) return;
  els.annualTrendChart.innerHTML = buildAnnualTrend(Array.isArray(rows) ? rows : []);
}

function renderShowJCRHistory(j) {
  const ifRows = [...(Array.isArray(j.if_history) ? j.if_history : [])].sort((a, b) => yearNum(b.year) - yearNum(a.year));
  const casRows = [...(Array.isArray(j.cas_history) ? j.cas_history : [])].sort((a, b) => yearNum(b.year) - yearNum(a.year));

  els.ifTrendChart.innerHTML = buildIFTrend(ifRows);
  els.casTrendChart.innerHTML = buildCASTrend(casRows);
  if (els.annualTrendChart) {
    els.annualTrendChart.innerHTML = "<p class='placeholder'>正在加载年发文量数据…</p>";
  }
}

function renderHQ(j) {
  const records = Array.isArray(j.hq_records) ? j.hq_records : [];
  const fields = Array.isArray(j.hq_fields) ? j.hq_fields : [];
  const societies = Array.isArray(j.hq_societies) ? j.hq_societies : [];

  const summary = [
    ["科协评级", safe(j.hq_level)],
    ["涉及领域数", String(fields.length || 0)],
    ["涉及学会数", String(societies.length || 0)],
    ["目录条目数", String(records.length || 0)],
  ];

  els.hqMetaGrid.innerHTML = summary
    .map(([k, v]) => `<div class="kv"><div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(v)}</div></div>`)
    .join("");

  if (!records.length) {
    els.hqRecordList.innerHTML = "<p class='placeholder'>该期刊未在科协高质量期刊分级中命中条目</p>";
    return;
  }

  const sorted = [...records].sort((a, b) => {
    const la = levelRank(a.level);
    const lb = levelRank(b.level);
    if (la !== lb) return la - lb;
    return String(a.field || "").localeCompare(String(b.field || ""), "zh-CN");
  });

  els.hqRecordList.innerHTML = sorted
    .map((r) => {
      const sub = r.subfield ? `<div class="hq-record-sub">${escapeHtml(r.subfield)}</div>` : "";
      return `
        <div class="hq-record-item">
          <div>
            <div class="hq-record-field">${escapeHtml(safe(r.field))}</div>
            <div class="hq-record-society">${escapeHtml(safe(r.society))}</div>
            ${sub}
          </div>
          <span class="hq-level">${escapeHtml(safe(r.level))}</span>
        </div>
      `;
    })
    .join("");
}

function renderPaperEvidenceEmpty(title, text = "") {
  if (!els.paperEvidencePanel) return;
  els.paperEvidencePanel.innerHTML = `
    <div class="paper-evidence-empty">
      <div class="paper-evidence-empty__title">${escapeHtml(title || "暂无风险预警")}</div>
      ${text ? `<p>${escapeHtml(text)}</p>` : ""}
    </div>
  `;
}

function buildPaperEvidenceMetric(label, value, note = "", tone = "") {
  const cls = tone ? ` paper-evidence-metric--${tone}` : "";
  return `
    <div class="paper-evidence-metric${cls}">
      <span>${escapeHtml(label)}</span>
      <b>${escapeHtml(value)}</b>
      ${note ? `<em>${escapeHtml(note)}</em>` : ""}
    </div>
  `;
}

function isRiskValuePresent(value) {
  const text = String(value ?? "").trim();
  if (!text || text === "-") return false;
  return !["否", "无", "无预警", "未预警", "false", "none", "no"].includes(text.toLowerCase());
}

function collectJournalWarningSignals(j) {
  const signals = [];
  if (j?.xuankan_warning) {
    signals.push({
      tone: "risk",
      label: "新锐预警",
      value: "命中",
      note: "新锐预警字段命中",
    });
  }

  const casWarning = safe(j?.warning_latest);
  if (isRiskValuePresent(casWarning)) {
    const year = safe(j?.warning_latest_year).replace(/^-$/, "");
    signals.push({
      tone: "risk",
      label: year ? `中科院预警（${year}）` : "中科院预警",
      value: casWarning,
      note: "中科院预警字段命中",
    });
  }

  return signals;
}

function getCarRiskTone(carRisk) {
  if (!carRisk) return "";
  const rank = String(carRisk.risk_rank || "").toLowerCase();
  const index = Number(carRisk.car_index);
  if (rank === "high" || rank === "medium") return "watch";
  if (rank === "low") return "clear";
  if (Number.isFinite(index) && index >= 10) return "watch";
  return "watch";
}

function formatCarRiskRank(carRisk) {
  const rank = String(carRisk?.risk_rank || "").toLowerCase();
  if (rank === "high") return "高";
  if (rank === "medium") return "中";
  if (rank === "low") return "低";
  return safe(carRisk?.risk_rank_raw).replace(/^-$/, "") || "未知";
}

function formatCarRiskMetricValue(carRisk, status = "") {
  if (!carRisk) return status === "pending" ? "核验中" : "暂无";
  const value = formatMetricValue(carRisk.car_index, 2);
  return value === "-" ? formatCarRiskRank(carRisk) : `${value}%`;
}

function formatCarRiskMetricNote(carRisk, status = "") {
  if (!carRisk) return status === "pending" ? "正在核验 JCAR" : "JCAR 暂无匹配";
  const pieces = [`JCAR ${formatCarRiskRank(carRisk)}等级线索`];
  const lastYear = formatMetricValue(carRisk.car_index_last_year, 2);
  if (lastYear !== "-") pieces.push(`去年 ${lastYear}%`);
  return pieces.join(" / ");
}

function buildCarRiskGroup(carRisk, status = "") {
  if (!carRisk) {
    if (status === "pending") return "";
    return `
      <div class="paper-risk-group">
        <div class="paper-risk-group__title">JCAR 学术诚信风险</div>
        <div class="paper-risk-muted">暂未匹配到 CAR 指数，建议结合期刊官网与数据库记录复核。</div>
      </div>
    `;
  }

  const tone = getCarRiskTone(carRisk);
  const carIndex = formatCarRiskMetricValue(carRisk);
  const problemCount = formatIntegerCompact(carRisk.current_year_problem_article_count);
  const articleCount = formatIntegerCompact(carRisk.current_year_article_count);
  const growth = formatMetricValue(carRisk.car_index_growth_rate, 2);
  const sourceLink = carRisk.source_url
    ? `<a class="paper-risk-link" href="${escapeHtml(carRisk.source_url)}" target="_blank" rel="noopener">查看 JCAR 来源</a>`
    : "";

  return `
    <div class="paper-risk-group">
      <div class="paper-risk-group__title">JCAR 学术诚信风险</div>
      <div class="paper-risk-signals">
        ${buildRiskSignalRow({
          tone,
          label: "CAR 指数",
          value: carIndex,
          note: `${formatCarRiskRank(carRisk)}等级 / 复核线索`,
        })}
        ${buildRiskSignalRow({
          tone: "watch",
          label: "问题论文线索",
          value: problemCount === "-" ? "暂无" : `${problemCount} 篇`,
          note: articleCount === "-" ? "当年统计" : `当年发文 ${articleCount} 篇`,
        })}
        ${growth !== "-" ? buildRiskSignalRow({
          tone: "watch",
          label: "指数变化",
          value: growth,
          note: "JCAR 增长率",
        }) : ""}
      </div>
      ${sourceLink ? `<div class="paper-risk-source">${sourceLink}</div>` : ""}
    </div>
  `;
}

function getPaperEvidenceRisk(updates, journalSignals = [], carRisk = null) {
  const rows = Array.isArray(updates) ? updates : [];
  const retractions = rows.filter((x) => x.riskType === "retraction" || x.updateTypes?.includes("retraction"));
  const corrections = rows.filter((x) => x.riskType === "correction" || x.updateTypes?.includes("correction"));
  const signals = Array.isArray(journalSignals) ? journalSignals : [];
  const riskSignals = signals.filter(isOfficialHighRiskSignal);
  const carTone = getCarRiskTone(carRisk);
  if (riskSignals.length) {
    const pieces = [];
    if (riskSignals.length) pieces.push(`${riskSignals.length} 条官方预警`);
    if (retractions.length) pieces.push(`${retractions.length} 条撤稿相关`);
    if (corrections.length) pieces.push(`${corrections.length} 条更正`);
    if (carTone === "watch") pieces.push("CAR 指数需关注");
    return {
      tone: "risk",
      label: "高风险",
      note: pieces.join(" / ") || "需进一步核对",
    };
  }
  if (signals.length || retractions.length || corrections.length || carTone === "watch") {
    const pieces = [];
    if (signals.length) pieces.push(`${signals.length} 条复核线索`);
    if (retractions.length) pieces.push(`${retractions.length} 条撤稿相关`);
    if (corrections.length) pieces.push(`${corrections.length} 条更正`);
    if (carTone === "watch") pieces.push("CAR 指数需关注");
    return { tone: "watch", label: "需关注", note: pieces.join(" / ") || "需进一步核对" };
  }
  return { tone: "clear", label: "未命中", note: rows.length ? `${rows.length} 条其他更新` : "暂无数据库预警或撤稿更新" };
}

function isOfficialHighRiskSignal(signal) {
  const label = String(signal?.label || "");
  return /中科院预警|新锐预警/.test(label);
}

function buildRiskSignalRow(signal) {
  const tone = signal?.tone || "watch";
  return `
    <div class="paper-risk-signal paper-risk-signal--${escapeHtml(tone)}">
      <div>
        <span>${escapeHtml(signal?.label || "风险信号")}</span>
        <b>${escapeHtml(signal?.value || "-")}</b>
      </div>
      ${signal?.note ? `<em>${escapeHtml(signal.note)}</em>` : ""}
    </div>
  `;
}

function renderPaperEvidence(payload, j = pageState.journal) {
  if (!els.paperEvidencePanel) return;
  const data = payload && typeof payload === "object" ? payload : {};
  const updates = Array.isArray(data.updates) ? data.updates : [];
  const journalSignals = collectJournalWarningSignals(j || {});
  const carRisk = data.carRisk || data.car_risk || null;
  const risk = getPaperEvidenceRisk(updates, journalSignals, carRisk);
  const retractions = updates.filter((x) => x.riskType === "retraction" || x.updateTypes?.includes("retraction"));
  const corrections = updates.filter((x) => x.riskType === "correction" || x.updateTypes?.includes("correction"));
  const sourceNote = data.issns?.length ? `ISSN ${data.issns.join(" / ")}` : "缺少可核验 ISSN";
  const databaseSignalHtml = journalSignals.map(buildRiskSignalRow).join("");
  const carRiskGroup = buildCarRiskGroup(carRisk, data.status);
  const hasOfficialHighRiskSignal = journalSignals.some(isOfficialHighRiskSignal);
  const databaseSignalGroup = databaseSignalHtml
    ? `
      <div class="paper-risk-group">
        <div class="paper-risk-group__title">本地数据库预警</div>
        <div class="paper-risk-signals">${databaseSignalHtml}</div>
      </div>
    `
    : "";
  const summaryMetrics = [
    buildPaperEvidenceMetric("综合判断", risk.label, risk.note, risk.tone),
    buildPaperEvidenceMetric(
      "数据库预警",
      journalSignals.length ? `${journalSignals.length} 条` : "未命中",
      "中科院预警 / 新锐预警",
      journalSignals.length ? hasOfficialHighRiskSignal ? "risk" : "watch" : "clear"
    ),
  ];

  summaryMetrics.push(
    buildPaperEvidenceMetric(
      "撤稿与更正",
      retractions.length ? `${retractions.length} 条撤稿记录` : corrections.length ? `${corrections.length} 条更正` : "未见撤稿",
      data.status === "pending" ? "正在核验 Crossref" : sourceNote,
      retractions.length || corrections.length ? "watch" : "clear"
    ),
    buildPaperEvidenceMetric(
      "CAR 指数",
      formatCarRiskMetricValue(carRisk, data.status),
      formatCarRiskMetricNote(carRisk, data.status),
      carRisk ? getCarRiskTone(carRisk) : data.status === "pending" ? "watch" : "clear"
    )
  );

  els.paperEvidencePanel.innerHTML = `
    <div class="paper-evidence-summary paper-evidence-summary--risk">
      ${summaryMetrics.join("")}
    </div>
    ${databaseSignalGroup || carRiskGroup ? `<div class="paper-risk-grid">${databaseSignalGroup}${carRiskGroup}</div>` : ""}
  `;
}

async function loadAndRenderPaperEvidence(j) {
  if (!els.paperEvidencePanel) return;
  els.paperEvidencePanel.innerHTML = "<p class='placeholder'>正在加载风险预警...</p>";
  try {
    await buildAndRenderPaperEvidenceProgressively(j);
  } catch (error) {
    console.warn("Failed to load paper evidence:", error);
    pageState.paperEvidence = null;
    renderPaperEvidence({ status: "error", issns: getPaperEvidenceIssns(j), updates: [] }, j);
  }
}

function getJournalLookupIssn(j) {
  return String(j?.issn || j?.eissn || "").trim();
}

function buildSubmissionStatsApiUrl(issn, suffix) {
  return `${API_BASE}/journals/${encodeURIComponent(String(issn || "").trim())}/${suffix}`;
}

function buildGithubLoginUrl() {
  return `${API_BASE}/auth/github/start?return_to=${encodeURIComponent(window.location.href)}`;
}

function formatSubmissionDate(raw) {
  const text = String(raw || "").trim();
  if (!text) return "-";
  const parsed = new Date(text);
  if (!Number.isFinite(parsed.getTime())) return text;
  return parsed.toISOString().slice(0, 10);
}

function formatSubmissionDays(value, label = "") {
  const explicit = String(label || "").trim();
  if (explicit) return explicit;
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  const rounded = Math.round(num * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text} 天`;
}

function formatSubmissionReviewCycleCompact(item) {
  if (!item || typeof item !== "object") return "-";
  const numericDays = Number(item.review_time_days);
  if (Number.isFinite(numericDays) && numericDays > 0) {
    return formatSubmissionDays(numericDays);
  }

  const label = String(item.review_time_label || "").trim();
  if (!label) return "-";
  if (!/(day|days|天)/i.test(label)) return label;

  const match = label.match(/(\d+(?:\.\d+)?)/);
  if (!match) return label;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) return label;
  return formatSubmissionDays(parsed);
}

function formatSubmissionPercent(value) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  const rounded = Math.round(num * 10) / 10;
  return `${Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)}%`;
}

function formatSubmissionSampleSize(value) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "-";
  return String(Math.round(num));
}

function formatSubmissionScore(value) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  const rounded = Math.round(num * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function buildSubmissionMetric(label, value, tone = "") {
  const cls = tone ? ` submission-metric--${tone}` : "";
  return `
    <div class="submission-metric${cls}">
      <div class="submission-metric__label">${escapeHtml(label)}</div>
      <div class="submission-metric__value">${escapeHtml(value)}</div>
    </div>
  `;
}

function buildSubmissionOverviewCard(title, value, note, tone = "") {
  const cls = tone ? ` submission-overview__card--${tone}` : "";
  return `
    <article class="submission-overview__card${cls}">
      <div class="submission-overview__label">${escapeHtml(title)}</div>
      <div class="submission-overview__value">${escapeHtml(value)}</div>
      <p class="submission-overview__note">${escapeHtml(note)}</p>
    </article>
  `;
}

function buildSubmissionHero(data, viewerAuthenticated) {
  const officialCount = Array.isArray(data?.official_sources) ? data.official_sources.length : 0;
  const communityCount = Array.isArray(data?.community_sources) ? data.community_sources.length : 0;
  const totalRatings = Number(data?.user_rating_summary?.total_ratings || 0);

  const cards = [
    buildSubmissionOverviewCard(
      "公开指标",
      officialCount ? `${officialCount} 条` : "待补充",
      "官网或出版社可核验的数据。",
      "official"
    ),
    buildSubmissionOverviewCard(
      "投稿经验",
      communityCount ? `${communityCount} 条` : "待补充",
      "公开经验样本，用来辅助判断节奏。",
      "community"
    ),
    buildSubmissionOverviewCard(
      "用户评分",
      totalRatings ? `${totalRatings} 人` : viewerAuthenticated ? "等你评分" : "登录可评",
      "站内结构化评分，不和公开数据混算。",
      "rating"
    ),
  ];

  return `
    <section class="submission-hero">
      <div class="submission-hero__copy">
        <div class="submission-hero__eyebrow">投稿参考</div>
        <h3>公开指标、投稿经验和用户评分分开展示</h3>
        <p>先看官网披露，再用经验样本补充，不把不同来源揉成一个总分。</p>
      </div>
      <div class="submission-overview">
        ${cards.join("")}
      </div>
    </section>
  `;
}

function buildSubmissionEmptyState(title, text, tone = "") {
  const cls = tone ? ` submission-empty--${tone}` : "";
  return `
    <div class="submission-empty${cls}">
      <div class="submission-empty__title">${escapeHtml(title)}</div>
      <p class="submission-empty__text">${escapeHtml(text)}</p>
    </div>
  `;
}

function buildSubmissionSourceCard(item, kind) {
  const isOfficial = kind === "official";
  const metrics = isOfficial
    ? [
        buildSubmissionMetric("审稿时间", formatSubmissionDays(item.review_time_days, item.review_time_label), "official"),
        buildSubmissionMetric("首轮决定", formatSubmissionDays(item.first_decision_days), "official"),
        buildSubmissionMetric("录用率", formatSubmissionPercent(item.accept_rate_pct), "official"),
      ]
    : [
        buildSubmissionMetric("审稿周期", formatSubmissionDays(item.review_time_days, item.review_time_label), "community"),
        buildSubmissionMetric("录用率参考", formatSubmissionPercent(item.accept_rate_pct), "community"),
        buildSubmissionMetric("站点评分", formatSubmissionScore(item.overall_score), "community"),
        buildSubmissionMetric("样本量", safe(item.sample_size), "community"),
      ];

  const pillLabel = isOfficial ? "公开页面" : "经验站点";
  const pillCls = isOfficial ? "submission-pill--official" : "submission-pill--community";
  const metaBits = [`更新：${formatSubmissionDate(item.updated_at || item.fetched_at)}`];
  if (!isOfficial) metaBits.push("仅作选刊参考");

  const sourceUrl = String(item.source_url || "").trim();
  const sourceLinkHtml = sourceUrl
    ? `<a class="submission-source-card__link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">查看来源</a>`
    : `<span class="submission-source-card__link submission-source-card__link--disabled">来源待补充</span>`;

  return `
    <article class="submission-source-card submission-source-card--${escapeHtml(kind)}">
      <div class="submission-source-card__head">
        <div class="submission-source-card__main">
          <div class="submission-source-card__kicker">
            <span class="submission-pill ${pillCls}">${escapeHtml(pillLabel)}</span>
            <span class="submission-source-card__meta">${escapeHtml(metaBits.join(" · "))}</span>
          </div>
          <div class="submission-source-card__title">${escapeHtml(item.source_name || "未知来源")}</div>
        </div>
        ${sourceLinkHtml}
      </div>
      <div class="submission-source-card__metrics">
        ${metrics.join("")}
      </div>
    </article>
  `;
}

function buildSubmissionSourceBlock(config) {
  const {
    eyebrow = "",
    title = "",
    description = "",
    items = [],
    kind = "official",
    emptyTitle = "",
    emptyText = "",
  } = config || {};
  const list = Array.isArray(items) ? items : [];
  const body = list.length
    ? `<div class="submission-source-list">${list.map((item) => buildSubmissionSourceCard(item, kind)).join("")}</div>`
    : buildSubmissionEmptyState(emptyTitle, emptyText, kind);
  const metaText = list.length ? `${list.length} 条记录` : "暂无记录";

  return `
    <section class="submission-section submission-section--${escapeHtml(kind)}">
      <div class="submission-section__head">
        <div class="submission-section__titlewrap">
          <div class="submission-section__eyebrow">${escapeHtml(eyebrow)}</div>
          <h3>${escapeHtml(title)}</h3>
          <p class="submission-section__desc">${escapeHtml(description)}</p>
        </div>
        <span class="submission-section__meta">${escapeHtml(metaText)}</span>
      </div>
      ${body}
    </section>
  `;
}

function parseSubmissionDateEpoch(raw) {
  const text = String(raw || "").trim();
  if (!text) return 0;
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSubmissionCommentInsights(item) {
  if (!item || typeof item !== "object") return null;
  const candidate = item.comment_insights;
  if (!candidate || typeof candidate !== "object") return null;
  return candidate;
}

function resolveSubmissionSampleSize(item) {
  if (!item || typeof item !== "object") return null;
  const direct = Number(item.sample_size);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const insights = getSubmissionCommentInsights(item);
  const fromInsight = Number(insights?.sample_size);
  if (Number.isFinite(fromInsight) && fromInsight > 0) return fromInsight;
  return null;
}

function pickSubmissionPrimarySource(data) {
  const communitySources = Array.isArray(data?.community_sources) ? data.community_sources : [];
  const officialSources = Array.isArray(data?.official_sources) ? data.official_sources : [];
  const pool = communitySources.length ? communitySources : officialSources;
  if (!pool.length) return null;

  const ranked = pool.map((item, index) => {
    const sampleSize = resolveSubmissionSampleSize(item) || 0;
    const reviewValue = formatSubmissionDays(item.review_time_days, item.review_time_label);
    const acceptValue = formatSubmissionPercent(item.accept_rate_pct);
    let completeness = 0;
    if (reviewValue !== "-") completeness += 1;
    if (acceptValue !== "-") completeness += 1;
    if (sampleSize > 0) completeness += 1;
    const updatedEpoch = parseSubmissionDateEpoch(item.updated_at || item.fetched_at);
    return { item, index, sampleSize, completeness, updatedEpoch };
  });

  ranked.sort((a, b) => {
    if (b.sampleSize !== a.sampleSize) return b.sampleSize - a.sampleSize;
    if (b.completeness !== a.completeness) return b.completeness - a.completeness;
    if (b.updatedEpoch !== a.updatedEpoch) return b.updatedEpoch - a.updatedEpoch;
    return a.index - b.index;
  });

  return ranked[0]?.item || null;
}

function buildSubmissionCompactItem(label, value) {
  return `
    <span class="submission-compact__item">
      <span class="submission-compact__label">${escapeHtml(label)}</span>
      <strong class="submission-compact__value">${escapeHtml(value)}</strong>
    </span>
  `;
}

function formatSubmissionRatingScore10(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "";
  const score10 = Math.max(0, Math.min(num * 2, 10));
  return score10.toFixed(1);
}

function buildSubmissionRatingStars(score10) {
  const rating5 = Math.max(0, Math.min(Number(score10) / 2, 5));
  const stars = [];
  for (let i = 0; i < 5; i += 1) {
    const fill = Math.max(0, Math.min(rating5 - i, 1));
    stars.push(
      `<span class="submission-rating-star" aria-hidden="true"><span class="submission-rating-star__base">★</span><span class="submission-rating-star__fill" style="width:${(
        fill * 100
      ).toFixed(1)}%">★</span></span>`
    );
  }
  return stars.join("");
}

function buildSubmissionCompactRating(summary) {
  const data = summary && typeof summary === "object" ? summary : {};
  const total = Math.max(0, Number(data.total_ratings || 0) || 0);
  const score10 = formatSubmissionRatingScore10(data.overall_avg);
  if (!total || !score10) {
    return `
      <span class="submission-compact-rating submission-compact-rating--empty">
        <span class="submission-compact__label">站内评分</span>
        <strong class="submission-compact-rating__score">暂无</strong>
        <span class="submission-compact-rating__count">0人评价</span>
      </span>
    `;
  }

  return `
    <span class="submission-compact-rating">
      <span class="submission-compact__label">站内评分</span>
      <strong class="submission-compact-rating__score">${escapeHtml(score10)}</strong>
      <span class="submission-compact-rating__stars" aria-label="${escapeHtml(`${score10} 分`)}">${buildSubmissionRatingStars(score10)}</span>
      <span class="submission-compact-rating__count">${escapeHtml(String(total))}人评价</span>
    </span>
  `;
}

function buildSubmissionFlash(notice) {
  if (!notice || typeof notice !== "object" || !notice.text) return "";
  const type = notice.type === "error" ? "error" : "success";
  return `<div class="submission-flash submission-flash--${type}">${escapeHtml(notice.text)}</div>`;
}

function buildSubmissionCompactSummary(data, viewerAuthenticated, issn = "", myRating = null, notice = null) {
  const source = pickSubmissionPrimarySource(data);
  const reviewValue = source ? formatSubmissionReviewCycleCompact(source) : "-";
  const ratingSummary = data?.user_rating_summary && typeof data.user_rating_summary === "object" ? data.user_rating_summary : {};
  const metricHtml = reviewValue && reviewValue !== "-" ? buildSubmissionCompactItem("审稿周期", reviewValue) : "";
  const ratingHtml = buildSubmissionCompactRating(ratingSummary);
  const hasExistingRating = Boolean(myRating && typeof myRating === "object" && (myRating.speed_score || myRating.editor_score || myRating.recommend_score));
  const actionHtml = viewerAuthenticated
    ? `<span class="submission-compact__status">已登录</span>
        <span class="submission-compact__sep">/</span>
        <button class="submission-compact__action submission-compact__action--button" type="button" data-rating-toggle aria-expanded="false" aria-controls="submissionRatingDrawer">${
          hasExistingRating ? "修改评分" : "补充评分"
        }</button>`
    : `<a class="submission-compact__action" href="${escapeHtml(buildGithubLoginUrl())}">登录后补充评分</a>`;
  const metricLineHtml = metricHtml
    ? `
      <p class="submission-compact__line submission-compact__line--metrics">
        ${metricHtml}
      </p>
    `
    : "";
  const drawerHtml =
    viewerAuthenticated && issn
      ? `
        <div class="submission-rating-drawer" id="submissionRatingDrawer" hidden>
          ${buildUserRatingForm(issn, myRating)}
        </div>
      `
      : "";

  return `
    <div class="submission-compact">
      ${buildSubmissionFlash(notice)}
      ${metricLineHtml}
      <p class="submission-compact__line submission-compact__line--meta">
        ${ratingHtml}
        <span class="submission-compact__sep">/</span>
        ${actionHtml}
      </p>
      ${drawerHtml}
    </div>
  `;
}

function buildSubmissionKeyMetricsSection(data) {
  const source = pickSubmissionPrimarySource(data);
  if (!source) {
    return `
      <section class="submission-section submission-section--community submission-section--key">
        <div class="submission-section__head">
          <div class="submission-section__titlewrap">
            <h3>投稿数据</h3>
            <p class="submission-section__desc submission-section__desc--compact">基于已收集样本的投稿概况。</p>
          </div>
        </div>
        ${buildSubmissionEmptyState("暂无投稿数据", "当前样本不足，暂时无法展示审稿周期、录用率和样本数。", "community")}
      </section>
    `;
  }

  const reviewValue = formatSubmissionReviewCycleCompact(source);
  const acceptValue = formatSubmissionPercent(source.accept_rate_pct);
  const sampleValue = formatSubmissionSampleSize(resolveSubmissionSampleSize(source));

  return `
    <section class="submission-section submission-section--community submission-section--key">
      <div class="submission-section__head">
        <div class="submission-section__titlewrap">
          <h3>投稿数据</h3>
          <p class="submission-section__desc submission-section__desc--compact">基于已收集样本的投稿概况。</p>
        </div>
      </div>
      <div class="submission-source-card__metrics submission-source-card__metrics--compact submission-key-metrics">
        ${buildSubmissionMetric("审稿周期", reviewValue, "community")}
        ${buildSubmissionMetric("录用率", acceptValue, "community")}
        ${buildSubmissionMetric("样本数", sampleValue, "community")}
      </div>
    </section>
  `;
}

function normalizeInsightList(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === "object");
}

function buildSubmissionInsightTags(tagsTop) {
  const items = normalizeInsightList(tagsTop).slice(0, 8);
  if (!items.length) return "";
  return `
    <div class="submission-insight-block">
      <div class="submission-insight-subtitle">高频标签</div>
      <div class="submission-insight-tag-row">
        ${items
          .map((item) => `<span class="submission-insight-chip">${escapeHtml(String(item.tag || "unknown"))} · ${escapeHtml(String(item.count || 0))}</span>`)
          .join("")}
      </div>
    </div>
  `;
}

function buildSubmissionInsightDistribution(title, rows) {
  const items = normalizeInsightList(rows).slice(0, 6);
  if (!items.length) return "";
  return `
    <div class="submission-insight-block">
      <div class="submission-insight-subtitle">${escapeHtml(title)}</div>
      <ul class="submission-insight-list">
        ${items
          .map((item) => {
            const label = String(item.label || "unknown");
            const count = Number(item.count || 0);
            const pct = item.pct === null || item.pct === undefined ? "-" : formatSubmissionPercent(item.pct);
            return `<li>${escapeHtml(label)} · ${escapeHtml(String(count))} (${escapeHtml(String(pct))})</li>`;
          })
          .join("")}
      </ul>
    </div>
  `;
}

function buildSubmissionInsightSamples(samples) {
  const items = normalizeInsightList(samples).slice(0, 6);
  if (!items.length) return "";
  return `
    <div class="submission-insight-block">
      <div class="submission-insight-subtitle">脱敏样本摘要</div>
      <ul class="submission-insight-samples">
        ${items
          .map((item) => {
            const bits = [];
            const month = String(item.month || "").trim();
            const result = String(item.result || "").trim();
            const cycle = String(item.cycle_bucket || "").trim();
            const likes = String(item.likes_bucket || "").trim();
            if (month) bits.push(`月份 ${month}`);
            if (result) bits.push(`结果 ${result}`);
            if (cycle) bits.push(`周期 ${cycle}`);
            if (likes) bits.push(`互动 ${likes}`);
            const tags = Array.isArray(item.tags)
              ? item.tags.map((tag) => String(tag || "").trim()).filter(Boolean).slice(0, 4)
              : [];
            if (tags.length) bits.push(`标签 ${tags.join(", ")}`);
            return `<li>${escapeHtml(bits.join(" · ") || "样本信息待补充")}</li>`;
          })
          .join("")}
      </ul>
    </div>
  `;
}

function buildSubmissionCommentInsightsBlock(communitySources) {
  const list = Array.isArray(communitySources) ? communitySources : [];
  const cards = list
    .map((source) => {
      const insights = getSubmissionCommentInsights(source);
      if (!insights) return "";
      const metrics = [
        buildSubmissionMetric("样本量", safe(insights.sample_size), "community"),
        buildSubmissionMetric("估计录用率", formatSubmissionPercent(insights.accepted_rate_pct), "community"),
        buildSubmissionMetric("周期中位数", formatSubmissionDays(insights.review_time_days_p50), "community"),
        buildSubmissionMetric("近12月样本", safe(insights.recent_comment_count_12m), "community"),
      ];
      const updatedMonth = String(insights.updated_month || "").trim();
      const metaText = updatedMonth ? `更新月：${updatedMonth}` : "更新月：-";
      return `
        <article class="submission-source-card submission-source-card--community">
          <div class="submission-source-card__head">
            <div class="submission-source-card__main">
              <div class="submission-source-card__kicker">
                <span class="submission-pill submission-pill--community">脱敏洞察</span>
                <span class="submission-source-card__meta">${escapeHtml(metaText)}</span>
              </div>
              <div class="submission-source-card__title">${escapeHtml(source.source_name || "社区来源")}</div>
            </div>
          </div>
          <div class="submission-source-card__metrics">
            ${metrics.join("")}
          </div>
          ${buildSubmissionInsightTags(insights.tags_top)}
          ${buildSubmissionInsightDistribution("结果分布", insights.result_distribution)}
          ${buildSubmissionInsightDistribution("周期分布", insights.cycle_distribution)}
          ${buildSubmissionInsightSamples(insights.summary_samples)}
        </article>
      `;
    })
    .filter(Boolean);

  if (!cards.length) {
    return buildSubmissionSourceBlock({
      eyebrow: "Community",
      title: "评论洞察（脱敏）",
      description: "只展示聚合指标和脱敏摘要，不展示原始评论全文。",
      items: [],
      kind: "community",
      emptyTitle: "暂无评论洞察",
      emptyText: "可在完成评论脱敏后通过社区来源同步。",
    });
  }

  return `
    <section class="submission-section submission-section--community-insights">
      <div class="submission-section__head">
        <div class="submission-section__titlewrap">
          <div class="submission-section__eyebrow">Community</div>
          <h3>评论洞察（脱敏）</h3>
          <p class="submission-section__desc">仅保留聚合结果、标签与摘要样本，不保留昵称、楼层与原文。</p>
        </div>
        <span class="submission-section__meta">${escapeHtml(`${cards.length} 个来源`)}</span>
      </div>
      <div class="submission-source-list">
        ${cards.join("")}
      </div>
    </section>
  `;
}

function buildUserRatingSummary(summary, viewerAuthenticated) {
  const data = summary && typeof summary === "object" ? summary : {};
  const total = Number(data.total_ratings || 0);
  if (!total) {
    return buildSubmissionEmptyState(
      "还没有站内评分",
      viewerAuthenticated ? "欢迎提交你的投稿体验，之后可以随时修改。" : "登录后可提交评分，帮助其他用户判断投稿体验。",
      "rating"
    );
  }

  const cards = [
    ["速度", formatSubmissionScore(data.speed_avg)],
    ["编辑体验", formatSubmissionScore(data.editor_avg)],
    ["推荐度", formatSubmissionScore(data.recommend_avg)],
    ["综合均分", formatSubmissionScore(data.overall_avg)],
  ];

  return `
    <div class="submission-rating-summary">
      ${cards
        .map(
          ([label, value]) => `
            <div class="submission-rating-summary__item">
              <div class="submission-rating-summary__label">${escapeHtml(label)}</div>
              <div class="submission-rating-summary__value">${escapeHtml(value)}</div>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="submission-rating-summary__count">共有 ${escapeHtml(String(total))} 位用户参与评分</div>
  `;
}

function buildScoreOptions(selectedValue) {
  const selected = Number(selectedValue);
  const options = [`<option value="">请选择</option>`];
  for (let i = 1; i <= 5; i += 1) {
    options.push(`<option value="${i}"${selected === i ? " selected" : ""}>${i} 分</option>`);
  }
  return options.join("");
}

function buildUserRatingForm(issn, myRating) {
  const rating = myRating && typeof myRating === "object" ? myRating : {};
  const updatedText = rating.updated_at ? `你上次提交于 ${formatSubmissionDate(rating.updated_at)}` : "提交后仍可继续修改";
  return `
    <form class="submission-rating-form" data-rating-form="1" data-issn="${escapeHtml(issn)}">
      <div class="submission-rating-form__grid">
        <label class="submission-field">
          <span>审稿速度</span>
          <select name="speed_score" required>${buildScoreOptions(rating.speed_score)}</select>
        </label>
        <label class="submission-field">
          <span>编辑体验</span>
          <select name="editor_score" required>${buildScoreOptions(rating.editor_score)}</select>
        </label>
        <label class="submission-field">
          <span>总体推荐</span>
          <select name="recommend_score" required>${buildScoreOptions(rating.recommend_score)}</select>
        </label>
      </div>
      <div class="submission-rating-form__foot">
        <span class="submission-rating-form__hint">${escapeHtml(updatedText)}</span>
        <button class="submission-submit-btn" type="submit">提交评分</button>
      </div>
    </form>
  `;
}

function buildSubmissionLoginCta() {
  return `
    <div class="submission-auth-cta">
      <p>登录后可提交你的投稿体验评分，帮助其他用户更快判断是否投稿。</p>
      <div class="submission-auth-cta__actions">
        <a class="submission-login-btn" href="${escapeHtml(buildGithubLoginUrl())}">GitHub 登录后评分</a>
        <a class="submission-secondary-link" href="https://www.scansci.com/">邮箱登录请前往 ScanSci 首页</a>
      </div>
    </div>
  `;
}

function buildUserRatingSection(summary, viewerAuthenticated, issn, myRating) {
  const summaryHtml = buildUserRatingSummary(summary, viewerAuthenticated);
  const formHtml = viewerAuthenticated ? buildUserRatingForm(issn, myRating) : buildSubmissionLoginCta();

  return `
    <section class="submission-section submission-section--rating">
      <div class="submission-section__head">
        <div class="submission-section__titlewrap">
          <div class="submission-section__eyebrow">ScanSci</div>
          <h3>用户评分</h3>
          <p class="submission-section__desc">分享你的投稿体验，帮助后来者做判断。</p>
        </div>
        <span class="submission-section__meta">${escapeHtml(viewerAuthenticated ? "已登录" : "未登录")}</span>
      </div>
      ${summaryHtml}
      ${formHtml}
    </section>
  `;
}

function showSubmissionSection() {
  if (els.submissionSection) els.submissionSection.hidden = false;
}

function hideSubmissionSection() {
  if (els.submissionSection) els.submissionSection.hidden = true;
  if (els.submissionPanel) els.submissionPanel.innerHTML = "";
}

function hasUsefulSubmissionStats(data) {
  return Boolean(data && typeof data === "object" && data.ok !== false);
}

function renderSubmissionStatsError() {
  hideSubmissionSection();
}

function renderSubmissionStats(payload, j) {
  if (!els.submissionPanel) return;
  const data = payload && typeof payload === "object" ? payload : {};
  if (!hasUsefulSubmissionStats(data)) {
    hideSubmissionSection();
    return;
  }
  showSubmissionSection();
  const viewerAuthenticated = Boolean(data.viewer_authenticated);
  const issn = getJournalLookupIssn(j);

  els.submissionPanel.innerHTML = buildSubmissionCompactSummary(data, viewerAuthenticated, issn, data.my_rating, pageState.submissionNotice);
}

async function fetchSubmissionStats(issn) {
  const resp = await fetch(buildSubmissionStatsApiUrl(issn, "submission-stats"), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const payload = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const error = new Error(String(payload?.error || `HTTP_${resp.status}`));
    error.status = resp.status;
    throw error;
  }
  return payload;
}

async function submitSubmissionRating(issn, body) {
  const resp = await fetch(buildSubmissionStatsApiUrl(issn, "ratings"), {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const error = new Error(String(payload?.error || `HTTP_${resp.status}`));
    error.status = resp.status;
    throw error;
  }
  return payload;
}

async function loadAndRenderSubmissionStats(j) {
  if (!els.submissionPanel) return;
  const issn = getJournalLookupIssn(j);
  if (!issn) {
    pageState.submissionStats = null;
    hideSubmissionSection();
    return;
  }

  hideSubmissionSection();
  try {
    const payload = await fetchSubmissionStats(issn);
    pageState.submissionStats = payload;
    renderSubmissionStats(payload, j);
  } catch (error) {
    console.warn("Submission stats unavailable:", error);
    pageState.submissionStats = null;
    renderSubmissionStatsError();
  }
}

function normalizeCASKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\u4e00-\u9fff]+/gu, "");
}

function addDomainTerm(set, nameMap, value) {
  const name = String(value || "").trim();
  if (!name) return;
  const key = normalizeCASKey(name);
  if (!key) return;
  set.add(key);
  if (!nameMap.has(key)) nameMap.set(key, name);
}

function addDomainArray(set, nameMap, values) {
  if (!Array.isArray(values)) return;
  for (const value of values) addDomainTerm(set, nameMap, value);
}

function addDomainFromCASHistory(profile, row) {
  const rows = Array.isArray(row?.cas_history) ? row.cas_history : [];
  if (!rows.length) return;
  const sortedRows = [...rows].sort((a, b) => yearNum(b?.year) - yearNum(a?.year));
  for (const rec of sortedRows) {
    addDomainTerm(profile.majorKeys, profile.majorNameMap, rec?.category);
    const subRows = Array.isArray(rec?.subcategories) ? rec.subcategories : [];
    for (const item of subRows) {
      addDomainTerm(profile.subKeys, profile.subNameMap, item?.name);
    }
  }
}

function addDomainFromHQRecords(profile, row) {
  addDomainArray(profile.hqFieldKeys, profile.hqFieldNameMap, row?.hq_fields);
  addDomainArray(profile.hqSubfieldKeys, profile.hqSubfieldNameMap, row?.hq_subfields);
  const records = Array.isArray(row?.hq_records) ? row.hq_records : [];
  for (const rec of records) {
    addDomainTerm(profile.hqFieldKeys, profile.hqFieldNameMap, rec?.field);
    addDomainTerm(profile.hqSubfieldKeys, profile.hqSubfieldNameMap, rec?.subfield);
  }
}

function buildDomainProfile(row) {
  const profile = {
    majorKeys: new Set(),
    majorNameMap: new Map(),
    subKeys: new Set(),
    subNameMap: new Map(),
    hqFieldKeys: new Set(),
    hqFieldNameMap: new Map(),
    hqSubfieldKeys: new Set(),
    hqSubfieldNameMap: new Map(),
  };

  addDomainArray(profile.majorKeys, profile.majorNameMap, row?.cas_categories);
  addDomainArray(profile.subKeys, profile.subNameMap, row?.cas_subcategories);
  addDomainFromCASHistory(profile, row);
  addDomainFromHQRecords(profile, row);
  return profile;
}

function collectDomainMatches(baseSet, candidateSet, baseNameMap, candidateNameMap) {
  const matches = [];
  for (const key of baseSet) {
    if (!candidateSet.has(key)) continue;
    matches.push(baseNameMap.get(key) || candidateNameMap.get(key) || key);
  }
  return matches;
}

function formatDomainReason(label, names) {
  const text = names.slice(0, 2).join(" / ");
  return text ? `${label}（${text}）` : label;
}

function computeRelatedSimilarity(base, candidate, baseDomain = null, candidateDomain = null) {
  let score = 0;
  const reasons = [];
  const baseProfile = baseDomain || buildDomainProfile(base);
  const candidateProfile = candidateDomain || buildDomainProfile(candidate);
  const matchedSubNames = collectDomainMatches(baseProfile.subKeys, candidateProfile.subKeys, baseProfile.subNameMap, candidateProfile.subNameMap);
  const matchedMajorNames = collectDomainMatches(baseProfile.majorKeys, candidateProfile.majorKeys, baseProfile.majorNameMap, candidateProfile.majorNameMap);
  const matchedHqFieldNames = collectDomainMatches(
    baseProfile.hqFieldKeys,
    candidateProfile.hqFieldKeys,
    baseProfile.hqFieldNameMap,
    candidateProfile.hqFieldNameMap,
  );
  const matchedHqSubfieldNames = collectDomainMatches(
    baseProfile.hqSubfieldKeys,
    candidateProfile.hqSubfieldKeys,
    baseProfile.hqSubfieldNameMap,
    candidateProfile.hqSubfieldNameMap,
  );
  const subMatchCount = matchedSubNames.length;
  const majorMatchCount = matchedMajorNames.length;
  const hqFieldMatchCount = matchedHqFieldNames.length;
  const hqSubfieldMatchCount = matchedHqSubfieldNames.length;

  if (subMatchCount > 0) {
    score += 520 + Math.min(subMatchCount, 4) * 58;
    reasons.push(formatDomainReason("同领域：中科院小类", matchedSubNames));
  }
  if (hqSubfieldMatchCount > 0) {
    score += 390 + Math.min(hqSubfieldMatchCount, 3) * 46;
    reasons.push(formatDomainReason("同领域：科协子领域", matchedHqSubfieldNames));
  }
  if (hqFieldMatchCount > 0) {
    score += 320 + Math.min(hqFieldMatchCount, 4) * 38;
    reasons.push(formatDomainReason("同领域：科协目录", matchedHqFieldNames));
  }
  if (majorMatchCount > 0) {
    score += 220 + Math.min(majorMatchCount, 2) * 28;
    reasons.push(formatDomainReason("同领域：中科院大类", matchedMajorNames));
  }

  if (base.cas_2025 && candidate.cas_2025 && base.cas_2025 === candidate.cas_2025) {
    score += 56;
    reasons.push("同中科院分区");
  }
  if (base.jcr_quartile && candidate.jcr_quartile && base.jcr_quartile === candidate.jcr_quartile) {
    score += 34;
    reasons.push("同JCR分区");
  }
  if (base.hq_level && candidate.hq_level && base.hq_level === candidate.hq_level) {
    score += 10;
    reasons.push("同科协等级");
  }
  if (base.is_top === true && candidate.is_top === true) {
    score += 8;
    reasons.push("均为Top");
  }

  const baseIF = numberOrNull(base.if_2023);
  const candIF = numberOrNull(candidate.if_2023);
  let ifDiff = Number.POSITIVE_INFINITY;
  if (baseIF !== null && candIF !== null) {
    ifDiff = Math.abs(baseIF - candIF);
    score += Math.max(0, 18 - ifDiff * 1.8);
  }

  const sameFieldLevel =
    subMatchCount > 0 || hqSubfieldMatchCount > 0 ? 4 : hqFieldMatchCount > 0 ? 3 : majorMatchCount > 0 ? 2 : 0;
  const fieldPriority =
    sameFieldLevel * 1000 + subMatchCount * 100 + hqSubfieldMatchCount * 80 + hqFieldMatchCount * 60 + majorMatchCount * 40;
  return {
    score,
    reasons,
    ifDiff,
    fieldPriority,
    sameFieldLevel,
    subMatchCount,
    majorMatchCount,
    hqFieldMatchCount,
    hqSubfieldMatchCount,
  };
}

function findRelated(all, current, limit = 24) {
  const baseDomain = buildDomainProfile(current);
  const candidates = all
    .filter((r) => r.id !== current.id)
    .map((r) => {
      const candidateDomain = buildDomainProfile(r);
      return { journal: r, sim: computeRelatedSimilarity(current, r, baseDomain, candidateDomain) };
    })
    .filter((x) => x.sim.score > 0);

  candidates.sort((a, b) => {
    if (b.sim.fieldPriority !== a.sim.fieldPriority) return b.sim.fieldPriority - a.sim.fieldPriority;
    if (b.sim.sameFieldLevel !== a.sim.sameFieldLevel) return b.sim.sameFieldLevel - a.sim.sameFieldLevel;
    if (b.sim.subMatchCount !== a.sim.subMatchCount) return b.sim.subMatchCount - a.sim.subMatchCount;
    if (b.sim.hqSubfieldMatchCount !== a.sim.hqSubfieldMatchCount) return b.sim.hqSubfieldMatchCount - a.sim.hqSubfieldMatchCount;
    if (b.sim.hqFieldMatchCount !== a.sim.hqFieldMatchCount) return b.sim.hqFieldMatchCount - a.sim.hqFieldMatchCount;
    if (b.sim.majorMatchCount !== a.sim.majorMatchCount) return b.sim.majorMatchCount - a.sim.majorMatchCount;
    if (b.sim.score !== a.sim.score) return b.sim.score - a.sim.score;
    if (a.sim.ifDiff !== b.sim.ifDiff) return a.sim.ifDiff - b.sim.ifDiff;
    return (numberOrNull(b.journal.if_2023) || -1) - (numberOrNull(a.journal.if_2023) || -1);
  });

  return candidates.slice(0, limit).map((x) => ({
    ...x.journal,
    _relatedScore: x.sim.score,
    _relatedReasons: x.sim.reasons,
    _relatedFieldPriority: x.sim.fieldPriority,
  }));
}

function renderRelated(all, current, q) {
  const rel = findRelated(all, current);
  if (!rel.length) {
    els.relatedList.innerHTML = "<p class='placeholder'>暂无相近期刊建议</p>";
    return;
  }

  els.relatedList.innerHTML = rel
    .map((r) => {
      const u = new URL("./journal.html", window.location.href);
      u.searchParams.set("id", String(r.id));
      if (q) u.searchParams.set("q", q);
      u.searchParams.set("v", DETAIL_PAGE_REV);
      const casTag = r.is_top === true ? `${safe(r.cas_2025)} (Top)` : safe(r.cas_2025);
      const reason = Array.isArray(r._relatedReasons) && r._relatedReasons.length ? r._relatedReasons[0] : "";
      return `
        <a class="related-item" href="${u.toString()}">
          <div class="related-title">${escapeHtml(r.title || "未知期刊")}</div>
          <div class="related-meta">${escapeHtml(safe(r.issn))} / ${escapeHtml(safe(r.cn_number))}</div>
          <div class="related-meta">IF ${escapeHtml(safe(r.if_2023))} · ${escapeHtml(safe(r.jcr_quartile))} · ${escapeHtml(casTag)}</div>
          ${reason ? `<div class="related-reason">${escapeHtml(reason)}</div>` : ""}
        </a>
      `;
    })
    .join("");
}

function openSourceModal(key) {
  const conf = SOURCE_INFO[key] || SOURCE_INFO.core;
  els.sourceModalTitle.textContent = conf.title;
  els.sourceModalBody.innerHTML = conf.body;
  els.sourceModal.hidden = false;
}

function closeSourceModal() {
  els.sourceModal.hidden = true;
}

function activateTrendChart(trendKey = "if") {
  hideChartPointTip();
  const key = TREND_CHARTS[trendKey] ? trendKey : "if";
  const config = TREND_CHARTS[key];

  for (const button of els.trendTabs || []) {
    const active = button.dataset.trendTab === key;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  }

  for (const [chartKey, chartConfig] of Object.entries(TREND_CHARTS)) {
    const chart = document.getElementById(chartConfig.chartId);
    if (!chart) continue;
    const active = chartKey === key;
    chart.hidden = !active;
    chart.classList.toggle("is-active", active);
  }

  if (els.trendStageTitle) {
    els.trendStageTitle.textContent = config.title;
  }
  if (els.trendStageZoom) {
    els.trendStageZoom.dataset.chartZoom = config.chartId;
    els.trendStageZoom.dataset.chartTitle = config.title;
    els.trendStageZoom.setAttribute("aria-label", config.zoomLabel);
  }
}

function bindTrendTabs() {
  if (!els.trendTabs || !els.trendTabs.length) return;
  for (const button of els.trendTabs) {
    button.addEventListener("click", () => {
      activateTrendChart(button.dataset.trendTab || "if");
    });
  }
  activateTrendChart("if");
}

function openChartModal(chartId, chartTitle = "") {
  if (!els.chartModal || !els.chartModalBody || !els.chartModalTitle) return;
  hideChartPointTip();
  const id = String(chartId || "").trim();
  const chart = id ? document.getElementById(id) : null;
  if (!chart) return;

  const content = String(chart.innerHTML || "").trim();
  if (!content) {
    els.chartModalBody.innerHTML = "<p class='placeholder'>暂无可放大的图表</p>";
  } else {
    els.chartModalBody.innerHTML = `<div class="chart-modal__chart-wrap">${content}</div>`;
  }
  els.chartModalTitle.textContent = chartTitle ? `${chartTitle}（大图）` : "图表大图";
  els.chartModal.hidden = false;
}

function closeChartModal() {
  if (!els.chartModal || !els.chartModalBody) return;
  hideChartPointTip();
  els.chartModal.hidden = true;
  els.chartModalBody.innerHTML = "";
}

function getChartPointTipEl() {
  if (!chartPointTipEl) {
    chartPointTipEl = document.createElement("div");
    chartPointTipEl.className = "chart-point-tip";
    chartPointTipEl.setAttribute("role", "status");
    chartPointTipEl.setAttribute("aria-live", "polite");
    chartPointTipEl.hidden = true;
    document.body.appendChild(chartPointTipEl);
  }
  return chartPointTipEl;
}

function getChartTipPoint(target) {
  return target instanceof Element ? target.closest("[data-chart-tip]") : null;
}

function positionChartPointTip(point, tipEl) {
  const anchor = point.querySelector(".if-trend-dot, .cas-trend-dot, .annual-trend-dot") || point;
  const rect = anchor.getBoundingClientRect();
  if (!rect.width && !rect.height) return;

  const margin = 8;
  const gap = 10;
  const tipWidth = tipEl.offsetWidth || 0;
  const tipHeight = tipEl.offsetHeight || 0;
  let left = rect.left + rect.width / 2;
  let top = rect.top - tipHeight - gap;

  if (tipWidth) {
    left = Math.max(margin + tipWidth / 2, Math.min(window.innerWidth - margin - tipWidth / 2, left));
  }
  if (top < margin) {
    top = rect.bottom + gap;
  }
  if (tipHeight && top + tipHeight > window.innerHeight - margin) {
    top = window.innerHeight - tipHeight - margin;
  }

  tipEl.style.left = `${left}px`;
  tipEl.style.top = `${Math.max(margin, top)}px`;
}

function showChartPointTip(point) {
  const label = point?.dataset?.chartTip;
  if (!label) return;
  if (activeChartTipPoint && activeChartTipPoint !== point) {
    activeChartTipPoint.classList.remove("is-tip-active");
  }

  const tipEl = getChartPointTipEl();
  activeChartTipPoint = point;
  point.classList.add("is-tip-active");
  tipEl.textContent = label;
  tipEl.hidden = false;
  tipEl.classList.add("is-visible");
  positionChartPointTip(point, tipEl);
}

function hideChartPointTip() {
  if (activeChartTipPoint) {
    activeChartTipPoint.classList.remove("is-tip-active");
  }
  activeChartTipPoint = null;
  if (!chartPointTipEl) return;
  chartPointTipEl.classList.remove("is-visible");
  chartPointTipEl.hidden = true;
}

function bindChartPointTooltipEvents() {
  document.addEventListener("click", (event) => {
    const point = getChartTipPoint(event.target);
    if (point) {
      event.preventDefault();
      showChartPointTip(point);
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    if (!target || !target.closest(".chart-point-tip")) {
      hideChartPointTip();
    }
  });

  document.addEventListener("focusin", (event) => {
    const point = getChartTipPoint(event.target);
    if (point) showChartPointTip(point);
  });

  document.addEventListener("focusout", (event) => {
    const nextPoint = getChartTipPoint(event.relatedTarget);
    if (!nextPoint) hideChartPointTip();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideChartPointTip();
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") return;
    const point = getChartTipPoint(document.activeElement);
    if (!point) return;
    event.preventDefault();
    showChartPointTip(point);
  });

  window.addEventListener("resize", () => {
    if (activeChartTipPoint && document.body.contains(activeChartTipPoint)) {
      positionChartPointTip(activeChartTipPoint, getChartPointTipEl());
    } else {
      hideChartPointTip();
    }
  });

  document.addEventListener("scroll", hideChartPointTip, true);
}

function bindSourceModalEvents() {
  document.addEventListener("click", async (e) => {
    const retryTrigger = e.target.closest("[data-citescore-refresh]");
    if (retryTrigger) {
      await refreshCiteScoreForCurrentJournal();
      return;
    }

    const infoTrigger = e.target.closest("[data-info]");
    if (infoTrigger) {
      openSourceModal(infoTrigger.dataset.info || "core");
      return;
    }
    if (e.target.closest("[data-close-source]")) {
      closeSourceModal();
    }
  });

  els.sourceModalClose.addEventListener("click", closeSourceModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.sourceModal.hidden) {
      closeSourceModal();
    }
  });
}

function bindChartModalEvents() {
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-chart-zoom]");
    if (trigger) {
      const chartId = trigger.dataset.chartZoom || "";
      const chartTitle = trigger.dataset.chartTitle || "";
      openChartModal(chartId, chartTitle);
      return;
    }
    if (e.target.closest("[data-close-chart]")) {
      closeChartModal();
    }
  });

  if (els.chartModalClose) {
    els.chartModalClose.addEventListener("click", closeChartModal);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && els.chartModal && !els.chartModal.hidden) {
      closeChartModal();
    }
  });
}

function bindSubmissionEvents() {
  if (!els.submissionPanel) return;
  els.submissionPanel.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const trigger = target ? target.closest("[data-rating-toggle]") : null;
    if (!trigger || !els.submissionPanel.contains(trigger)) return;

    const drawer = els.submissionPanel.querySelector("#submissionRatingDrawer");
    if (!drawer) return;
    const shouldOpen = drawer.hidden;
    drawer.hidden = !shouldOpen;
    trigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    if (shouldOpen) {
      const firstSelect = drawer.querySelector("select");
      if (firstSelect) firstSelect.focus();
    }
  });

  els.submissionPanel.addEventListener("submit", async (event) => {
    const form = event.target.closest("[data-rating-form]");
    if (!form || pageState.submissionLoading || !pageState.journal) return;

    event.preventDefault();
    const issn = String(form.dataset.issn || getJournalLookupIssn(pageState.journal)).trim();
    if (!issn) return;

    const formData = new FormData(form);
    const payload = {
      speed_score: Number(formData.get("speed_score")),
      editor_score: Number(formData.get("editor_score")),
      recommend_score: Number(formData.get("recommend_score")),
    };

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.setAttribute("disabled", "disabled");
    pageState.submissionLoading = true;

    try {
      await submitSubmissionRating(issn, payload);
      pageState.submissionNotice = { type: "success", text: "评分已提交，你可以随时修改。" };
      await loadAndRenderSubmissionStats(pageState.journal);
    } catch (error) {
      console.error("Failed to submit journal rating:", error);
      pageState.submissionNotice = {
        type: "error",
        text: error?.status === 401 ? "请先登录后再评分。" : "评分提交失败，请稍后重试。",
      };
      if (pageState.submissionStats) {
        renderSubmissionStats(pageState.submissionStats, pageState.journal);
      } else {
        renderSubmissionStatsError();
      }
    } finally {
      pageState.submissionLoading = false;
      if (submitBtn) submitBtn.removeAttribute("disabled");
    }
  });
}

async function tryFetchJson(path, cache = "default") {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${path}${sep}v=${DATA_REV}`, { cache, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${path}`);
  return res.json();
}

async function fetchJsonWithFallback(paths, cache = "default") {
  let lastError = null;
  for (const path of paths) {
    try {
      return await tryFetchJson(path, cache);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("json_fetch_failed");
}

function resolveDataPathCandidates(relativePath) {
  const clean = String(relativePath || "").replace(/^\.?\/*/, "");
  if (!clean) return [];
  return [
    `./data/${clean}`,
    `/data/${clean}`,
    `./xuankan/demo_site/data/${clean}`,
    `/xuankan/demo_site/data/${clean}`,
  ];
}

function toSafeBucket(id, chunkCount) {
  const n = Number(id);
  if (!Number.isFinite(n) || chunkCount <= 0) return 0;
  return Math.abs(Math.trunc(n)) % chunkCount;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchApiJsonWithTimeout(url, timeoutMs = 4500, fetchOptions = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...fetchOptions, signal: controller.signal });
    const payload = await resp.json().catch(() => null);
    if (!resp.ok) {
      const error = new Error(payload?.error || `api_http_${resp.status}`);
      error.status = resp.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

function isTransientDetailApiError(error) {
  const name = String(error?.name || "");
  const message = String(error?.message || "");
  return name === "AbortError" || /network|fetch|failed|abort|unreachable|timeout/i.test(message);
}

async function fetchJournalDetailFromApi(id) {
  const url = new URL(`${API_BASE}/journals/detail`);
  url.searchParams.set("id", String(id));
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const payload = await fetchApiJsonWithTimeout(url.toString(), DETAIL_API_TIMEOUT_MS, {
        headers: { Accept: "application/json" },
      });
      if (!payload) throw new Error("journal_detail_unreachable");

      const row = payload?.journal || payload?.row || null;
      if (!payload?.ok || !row) {
        throw new Error(payload?.error || "journal_detail_not_found");
      }
      return {
        row,
        meta: payload?.data || payload?.meta || {},
        rows: Array.isArray(payload?.related) ? payload.related : [],
        related: Array.isArray(payload?.related) ? payload.related : [],
        source: payload?.source || "journal-detail-api",
      };
    } catch (error) {
      if (attempt === 0 && isTransientDetailApiError(error)) {
        await sleep(DETAIL_API_RETRY_DELAY_MS);
        continue;
      }
      throw error;
    }
  }
  throw new Error("journal_detail_unreachable");
}

async function loadJournalFromChunks(id) {
  const manifest = await fetchJsonWithFallback(CHUNK_MANIFEST_PATHS, "force-cache");
  const meta = manifest?.meta || {};
  const chunkCountRaw = Number(meta.chunk_count);
  const chunkCount = Number.isFinite(chunkCountRaw) && chunkCountRaw > 0 ? chunkCountRaw : 64;
  const bucket = toSafeBucket(id, chunkCount);

  const chunkMeta = Array.isArray(manifest?.chunks)
    ? manifest.chunks.find((x) => Number(x?.bucket) === bucket)
    : null;
  const defaultRel = `journal_chunks/chunk-${String(bucket).padStart(2, "0")}.json`;
  const rel = String(chunkMeta?.file || defaultRel);

  const chunkPayload = await fetchJsonWithFallback(resolveDataPathCandidates(rel), "force-cache");
  const rows = Array.isArray(chunkPayload?.journals) ? chunkPayload.journals : [];
  const row = rows.find((r) => Number(r?.id) === Number(id)) || null;
  return { row, meta, rows };
}

async function loadJournalFromFullData(id) {
  const payload = await fetchJsonWithFallback(FULL_DATA_PATHS, "force-cache");
  const rows = Array.isArray(payload?.journals) ? payload.journals : [];
  const meta = payload?.meta || {};
  const row = rows.find((r) => Number(r?.id) === Number(id)) || null;
  return { row, meta, rows };
}

async function loadJournalById(id) {
  try {
    return await fetchJournalDetailFromApi(id);
  } catch (err) {
    console.warn("Journal detail API failed:", err);
    if (!STATIC_DATA_FALLBACK_ENABLED) throw err;
  }

  try {
    const chunkResult = await loadJournalFromChunks(id);
    if (chunkResult.row) return chunkResult;
  } catch (err) {
    console.warn("Chunk loading failed, fallback to full data:", err);
  }
  return loadJournalFromFullData(id);
}

async function loadRelatedRows() {
  if (!STATIC_DATA_FALLBACK_ENABLED) {
    return { rows: [], meta: {} };
  }
  const payload = await fetchJsonWithFallback(RELATED_INDEX_PATHS, "default");
  return {
    rows: Array.isArray(payload?.journals) ? payload.journals : [],
    meta: payload?.meta || {},
  };
}

async function bootstrap() {
  ensureDetailPageRevision();
  bindSourceModalEvents();
  bindChartModalEvents();
  bindChartPointTooltipEvents();
  bindTrendTabs();
  bindSubmissionEvents();
  const { id, q } = getParams();

  hideSubmissionSection();
  if (els.paperEvidencePanel) {
    els.paperEvidencePanel.innerHTML = "<p class='placeholder'>正在加载风险预警...</p>";
  }

  const relatedPromise = loadRelatedRows().catch(() => ({ rows: [], meta: {} }));
  const detailPayload = await loadJournalById(id);
  const row = detailPayload.row;
  const meta = detailPayload.meta || {};
  if (!row) {
    pageState.journal = null;
    pageState.paperEvidence = null;
    pageState.submissionStats = null;
    pageState.submissionNotice = null;
    els.title.textContent = "未找到期刊";
    els.subtitle.textContent = "请返回查询页重新检索";
    els.topTags.innerHTML = "";
    els.coreGrid.innerHTML = "";
    resetSpotlight("无数据");
    els.ifTrendChart.innerHTML = "<p class='placeholder'>无数据</p>";
    els.casTrendChart.innerHTML = "<p class='placeholder'>无数据</p>";
    if (els.annualTrendChart) els.annualTrendChart.innerHTML = "<p class='placeholder'>无数据</p>";
    els.hqMetaGrid.innerHTML = "";
    els.hqRecordList.innerHTML = "<p class='placeholder'>无数据</p>";
    hideSubmissionSection();
    if (els.paperEvidencePanel) els.paperEvidencePanel.innerHTML = "<p class='placeholder'>无数据</p>";
    els.relatedList.innerHTML = "<p class='placeholder'>无数据</p>";
    return;
  }

  pageState.journal = row;
  pageState.paperEvidence = null;
  pageState.submissionStats = null;
  pageState.submissionNotice = null;
  renderRow(row, meta);
  renderShowJCRHistory(row);
  renderHQ(row);
  loadAndRenderSubmissionStats(row);
  loadAndRenderPaperEvidence(row);
  els.relatedList.innerHTML = "<p class='placeholder'>正在加载相近期刊...</p>";
  relatedPromise.then((relatedPayload) => {
    const relatedRows =
      Array.isArray(relatedPayload.rows) && relatedPayload.rows.length
        ? relatedPayload.rows
        : Array.isArray(detailPayload.rows)
        ? detailPayload.rows
        : [];
    renderRelated(relatedRows, row, q);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  els.title.textContent = "加载失败";
  els.subtitle.textContent = "请刷新重试";
  resetSpotlight("加载失败");
  if (els.ifTrendChart) els.ifTrendChart.innerHTML = "<p class='placeholder'>无数据</p>";
  if (els.casTrendChart) els.casTrendChart.innerHTML = "<p class='placeholder'>无数据</p>";
  if (els.annualTrendChart) els.annualTrendChart.innerHTML = "<p class='placeholder'>无数据</p>";
  hideSubmissionSection();
  if (els.paperEvidencePanel) els.paperEvidencePanel.innerHTML = "<p class='placeholder'>无数据</p>";
});

