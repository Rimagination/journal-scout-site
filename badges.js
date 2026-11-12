(() => {
  const BADGE_ORDER = [
    "impact", "indexing", "jcr", "xinrui", "cas", "top", "hq", "pku", "cssci", "cscd", "scd",
    "natureIndex", "warning", "xinruiWarning", "ccf", "ccft", "ei",
  ];
  const WOS_NAMES = {
    SCI: "科学引文索引",
    SCIE: "科学引文索引扩展版",
    SSCI: "社会科学引文索引",
    AHCI: "艺术与人文引文索引",
    ESCI: "新兴来源引文索引",
  };

  function latestRecords(records) {
    const values = Array.isArray(records) ? records : [];
    const years = values.map((record) => Number(record?.year)).filter((year) => Number.isInteger(year) && year >= 1900 && year <= 2100);
    const latest = years.length ? Math.max(...years) : null;
    return { year: latest, records: values.filter((record) => !latest || Number(record?.year) === latest) };
  }

  function build(row = {}) {
    const tags = [...new Set((Array.isArray(row.tags) ? row.tags : [])
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean))];
    const findTag = (pattern) => tags.find((value) => pattern.test(value)) || "";
    const badges = [];
    const push = (key, text, className, title) => {
      const value = String(text || "").trim();
      if (!value || badges.some((badge) => badge.key === key && badge.text === value)) return;
      badges.push({ key, text: value, className: `tag--${className}`, title });
    };

    if (row.if_2023 !== null && row.if_2023 !== undefined && row.if_2023 !== "" && Number.isFinite(Number(row.if_2023))) {
      push("impact", `IF ${Number(row.if_2023)}`, "impact", `影响因子${row.if_year ? `；数据年份：${row.if_year}` : ""}。`);
    }

    const wos = [...new Set(tags.filter((value) => /^(?:SCI|SCIE|SSCI|AHCI|ESCI)$/i.test(value)).map((value) => value.toUpperCase()))];
    for (const value of wos) push("indexing", value, "wos", `${value}：${WOS_NAMES[value]}，Web of Science 的期刊引文索引类型。`);

    const quartiles = [...new Set(String(row.jcr_quartile || tags.filter((value) => /^Q[1-4]$/i.test(value)).join(" ")).toUpperCase().match(/Q[1-4]/g) || [])];
    for (const value of quartiles) push("jcr", `JCR ${value}`, "jcr", "JCR 分区：根据期刊在所属学科中的排名划分为 Q1 至 Q4。同一期刊在不同学科可能有不同分区。");

    const xinrui = row.xuankan_2026 || findTag(/^新锐[1-4]区$/).replace(/^新锐/, "");
    if (xinrui) push("xinrui", `新锐 ${xinrui}`, "xuankan", `新锐分区：新锐期刊分区表对期刊的分区。${row.xuankan_2026 ? " 数据年份：2026。" : ""}`);

    const cas = row.cas_2025 || row.cas_zone || findTag(/^[1-4]区$/);
    if (cas) push("cas", `中科院 ${cas}`, "cas", `中科院分区：中科院期刊分区表对学术期刊的分区。${row.cas_year ? ` 数据年份：${row.cas_year}。` : ""}`);
    if (row.is_top === true || tags.includes("中科院Top")) push("top", "中科院 Top", "cas", "中科院 Top：该期刊在中科院期刊分区表中被标记为 Top 期刊。");

    const hq = row.hq_level || findTag(/^HQ-[A-Z0-9]+(?:类)?$/i).replace(/^HQ-/i, "");
    if (hq) push("hq", `科协 ${hq}`, "hq", "科协分级：中国科协高质量科技期刊分级目录中的期刊等级。");

    if (row.pku_core === true || tags.includes("北大核心")) {
      push("pku", "北大核心", "pku", `北大中文核心期刊：《中文核心期刊要目总览》收录的核心期刊。${tags.includes("北大核心-2023") ? " 2023版。" : ""}`);
    }
    const cssci = row.cssci_type || (tags.includes("CSSCI(扩展)") || tags.includes("CSSCI扩展") ? "扩展版" : tags.includes("CSSCI") ? "来源版" : "");
    if (cssci) push("cssci", `CSSCI ${cssci}`, "cssci", "CSSCI：中文社会科学引文索引的来源期刊或扩展版期刊。");
    const cscd = row.cscd_type || tags.find((value) => value.startsWith("CSCD-"))?.slice(5) ||
      (tags.includes("CSCD(核心)") || tags.includes("CSCD核心") ? "核心库" :
        tags.includes("CSCD(扩展)") || tags.includes("CSCD扩展") ? "扩展库" : tags.includes("CSCD") ? "核心库" : "");
    if (cscd) push("cscd", `CSCD ${cscd}`, "cscd", "CSCD：中国科学引文数据库收录的期刊，标签显示核心库或扩展库。");
    const scd = tags.filter((value) => /^SCD(?:-\d{4})?$/i.test(value));
    if (scd.length) {
      const year = scd.map((value) => value.match(/\d{4}$/)?.[0] || "").sort().pop();
      push("scd", "SCD", "scd", `SCD：科学引文数据库收录的期刊。${year ? ` ${year}版。` : ""}`);
    }

    if (row.ni_journal === true || tags.includes("NI期刊")) push("natureIndex", "Nature Index", "nature-index", "Nature Index：该期刊属于 Nature Index 追踪的期刊范围。");
    if (row.warning_latest || tags.includes("期刊预警")) {
      push("warning", "中科院预警", "warn", `中科院预警：该期刊被标记在中科院期刊预警相关名单中。${row.warning_latest ? ` 记录：${row.warning_latest}。` : ""}`);
    }
    if (row.xuankan_warning || tags.includes("新锐预警")) push("xinruiWarning", "新锐预警", "warn", "新锐预警：该期刊被标记在新锐期刊预警相关名单中。");

    const isConference = row.venueType === "conference";
    const ccf = latestRecords((Array.isArray(row.ccf_records) ? row.ccf_records : []).filter((record) => isConference
      ? !String(record?.category || "").includes("刊物")
      : !String(record?.category || "").includes("会议")));
    for (const value of [...new Set(ccf.records.map((record) => String(record?.level || "").trim()).filter(Boolean))]) {
      push("ccf", `CCF ${value}${isConference ? "会议" : ""}`, "ccf", `CCF：中国计算机学会推荐目录中的${isConference ? "会议" : "期刊"}等级。${ccf.year ? ` 目录年份：${ccf.year}。` : ""}`);
    }
    if (!badges.some((badge) => badge.key === "ccf")) {
      const value = findTag(/^CCF-[ABC](?:类)?$/i);
      if (value) push("ccf", value.replace(/^CCF-/i, "CCF "), "ccf", "CCF：中国计算机学会推荐目录中的期刊等级；年份以期刊详情为准。");
    }

    const ccft = latestRecords(row.ccft_records);
    for (const value of [...new Set(ccft.records.map((record) => String(record?.tier || "").trim().toUpperCase()).filter((value) => /^T[1-4]$/.test(value)))]) {
      push("ccft", `CCFT ${value}`, "ccft", `CCFT：中国计算机学会科技期刊分级中的期刊等级。${ccft.year ? ` 目录年份：${ccft.year}。` : ""}`);
    }
    if (!badges.some((badge) => badge.key === "ccft")) {
      const value = findTag(/^CCFT-T[1-4]$/i);
      if (value) push("ccft", value.replace(/^CCFT-/i, "CCFT "), "ccft", "CCFT：中国计算机学会科技期刊分级中的期刊等级。");
    }
    if (row.ei_indexed === true || tags.some((value) => /^EI$/i.test(value))) push("ei", "EI", "ei", "EI：该期刊被标记为工程索引（Engineering Index）收录。");

    const order = new Map(BADGE_ORDER.map((key, index) => [key, index]));
    return badges.map((badge, index) => ({ ...badge, index }))
      .sort((a, b) => order.get(a.key) - order.get(b.key) || a.index - b.index)
      .map(({ index, ...badge }) => badge);
  }

  window.JournalScoutBadges = Object.freeze({ build, order: Object.freeze([...BADGE_ORDER]) });
})();
