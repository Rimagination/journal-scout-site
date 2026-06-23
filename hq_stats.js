const els = {
  summary: document.getElementById("statsSummary"),
  tableBody: document.querySelector("#statsTable tbody"),
  genInfo: document.getElementById("genInfo"),
};

function safe(v) {
  return v === null || v === undefined || v === "" ? "-" : String(v);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtNum(v) {
  return toNum(v).toLocaleString("zh-CN");
}

function readStatus(r) {
  if (r.match_declared) {
    if (r.match_by_parsed_count) return { text: "一致", cls: "status-badge--ok" };
    if (r.match_by_unique_count) return { text: "去重后一致", cls: "status-badge--warn" };
    return { text: "一致", cls: "status-badge--ok" };
  }
  return { text: "不一致", cls: "status-badge--bad" };
}

function renderSummary(rows) {
  const total = rows.length;
  const matched = rows.filter((r) => !!r.match_declared).length;
  const unmatched = total - matched;
  const declaredSum = rows.reduce((acc, r) => acc + toNum(r.declared_count), 0);
  const parsedSum = rows.reduce((acc, r) => acc + toNum(r.parsed_count), 0);
  const uniqueSum = rows.reduce((acc, r) => acc + toNum(r.parsed_unique_count), 0);

  els.summary.innerHTML = `
    <span class="status-badge status-badge--ok">领域总数 ${fmtNum(total)}</span>
    <span class="status-badge status-badge--ok">匹配 ${fmtNum(matched)}</span>
    <span class="status-badge ${unmatched ? "status-badge--bad" : "status-badge--ok"}">未匹配 ${fmtNum(unmatched)}</span>
    <span class="status-badge status-badge--neutral">声明总数 ${fmtNum(declaredSum)}</span>
    <span class="status-badge status-badge--neutral">解析总数 ${fmtNum(parsedSum)}</span>
    <span class="status-badge status-badge--neutral">去重总数 ${fmtNum(uniqueSum)}</span>
  `;
}

function renderTable(rows) {
  const sorted = [...rows].sort((a, b) => toNum(a.index) - toNum(b.index));
  els.tableBody.innerHTML = sorted
    .map((r) => {
      const st = readStatus(r);
      return `
        <tr>
          <td>${fmtNum(r.index)}</td>
          <td>${escapeHtml(safe(r.field))}</td>
          <td>${escapeHtml(safe(r.society))}</td>
          <td>${fmtNum(r.declared_count)}</td>
          <td>${fmtNum(r.parsed_count)}</td>
          <td>${fmtNum(r.parsed_unique_count)}</td>
          <td><span class="status-badge ${st.cls}">${escapeHtml(st.text)}</span></td>
        </tr>
      `;
    })
    .join("");
}

async function loadGeneratedTime() {
  try {
    const resp = await fetch("./data/hq_field_stats.json", { method: "HEAD" });
    const lastModified = resp.headers.get("Last-Modified");
    if (lastModified) {
      const dt = new Date(lastModified);
      if (!Number.isNaN(dt.getTime())) {
        return dt.toLocaleString("zh-CN");
      }
    }
  } catch (_) {
    // ignore
  }
  return "-";
}

async function bootstrap() {
  const res = await fetch("./data/hq_field_stats.json");
  const rows = await res.json();
  const list = Array.isArray(rows) ? rows : [];

  renderSummary(list);
  renderTable(list);

  const ts = await loadGeneratedTime();
  els.genInfo.textContent = `数据文件时间：${ts}`;
}

bootstrap().catch((err) => {
  console.error(err);
  els.summary.innerHTML = "<span class='status-badge status-badge--bad'>加载失败</span>";
  els.tableBody.innerHTML = "<tr><td colspan='7'>数据加载失败，请刷新重试</td></tr>";
  els.genInfo.textContent = "数据文件时间：-";
});
