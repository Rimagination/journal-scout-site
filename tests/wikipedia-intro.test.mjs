import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";

const detailPath = process.env.JOURNAL_SCOUT_DETAIL_JS || fileURLToPath(new URL("../detail.js", import.meta.url));
const source = readFileSync(detailPath, "utf8");
const firstStart = source.indexOf("function normalizeIntroText(");
const firstEnd = source.indexOf("function getWikidataClaimFile(", firstStart);
const introStart = source.indexOf("async function fetchJournalIntro(", firstEnd);
const introEnd = source.indexOf("function getSpotlightCoverTitleClass(", introStart);
assert.ok(firstStart >= 0 && firstEnd > firstStart && introStart > firstEnd && introEnd > introStart);
const functions = source.slice(firstStart, firstEnd) + source.slice(introStart, introEnd);

function harness(handler) {
  const calls = [];
  const context = vm.createContext({
    URLSearchParams,
    fetchJsonWithTimeout: async (url) => {
      const parsed = new URL(url);
      calls.push(parsed);
      return handler(parsed);
    },
  });
  vm.runInContext(functions, context, { filename: detailPath });
  return { context, calls };
}

const page = (data) => ({ query: { pages: { 42: { pageid: 42, ns: 0, ...data } } } });

test("redirected Chinese title returns the actual journal introduction", async () => {
  const app = harness((url) => {
    assert.equal(url.hostname, "zh.wikipedia.org");
    assert.equal(url.searchParams.get("redirects"), "1");
    assert.equal(url.searchParams.get("exsentences"), "3");
    assert.match(url.searchParams.get("prop"), /info/);
    return page({ title: "自然-通讯", extract: "《自然-通讯》（英語：Nature Communications）是开放获取的科学期刊。" });
  });
  const intro = await vm.runInContext("fetchJournalIntro({title: 'Nature Communications'}, null)", app.context);
  assert.match(intro, /^《自然-通讯》/);
  assert.doesNotMatch(intro, /重定向/);
  assert.equal(app.calls.length, 1);
});

test("a redirect page is rejected and the English journal introduction is used", async () => {
  const app = harness((url) => url.hostname.startsWith("zh.")
    ? page({ redirect: "", extract: "英語重定向：这是由英语名称指向中文名称的重定向。" })
    : page({ extract: "Nature Communications is a peer-reviewed scientific journal." }));
  const intro = await vm.runInContext("fetchJournalIntro({title: 'Nature Communications'}, null)", app.context);
  assert.equal(intro, "Nature Communications is a peer-reviewed scientific journal.");
  assert.deepEqual(app.calls.map((url) => url.hostname), ["zh.wikipedia.org", "en.wikipedia.org"]);
});

test("editorial, missing and disambiguation pages are never treated as summaries", async () => {
  for (const entry of [
    { extract: "英语重定向：这是编辑者维护重定向的说明。" },
    { missing: "", extract: "Missing page" },
    { pageprops: { disambiguation: "" }, extract: "This title may refer to several topics." },
    { ns: 10, extract: "Template page" },
  ]) {
    const app = harness(() => page(entry));
    assert.equal(await vm.runInContext("fetchWikipediaExtract('Example', 'zh')", app.context), "");
  }
});

test("a failed Chinese request falls back to the English introduction", async () => {
  const app = harness((url) => {
    if (url.hostname.startsWith("zh.")) throw new Error("network unavailable");
    return page({ extract: "A reliable English journal introduction." });
  });
  const intro = await vm.runInContext("fetchJournalIntro({title: 'Example'}, null)", app.context);
  assert.equal(intro, "A reliable English journal introduction.");
});

test("a same-named non-journal page falls back to the journal article", async () => {
  const app = harness((url) => {
    const title = url.searchParams.get("titles");
    if (url.hostname.startsWith("zh.")) return page({ title: "Cell (微處理器)", extract: "Cell微處理器架構由多家公司联合开发。" });
    if (title === "Cell") return page({ title: "Cell", extract: "A cell is the basic unit of life." });
    assert.equal(title, "Cell (journal)");
    return page({ title, extract: "Cell is a peer-reviewed scientific journal." });
  });
  const intro = await vm.runInContext("fetchJournalIntro({title: 'Cell'}, null)", app.context);
  assert.equal(intro, "Cell is a peer-reviewed scientific journal.");
  assert.deepEqual(app.calls.map((url) => url.searchParams.get("titles")), ["Cell", "Cell", "Cell (journal)"]);
});

test("an uppercase database title can resolve the case-sensitive journal page", async () => {
  const app = harness((url) => {
    const title = url.searchParams.get("titles");
    if (url.hostname.startsWith("zh.") || title === "CELL") return page({ missing: "" });
    if (title === "Cell") return page({ extract: "A cell is the basic unit of life." });
    assert.equal(title, "Cell (journal)");
    return page({ extract: "Cell is a peer-reviewed scientific journal." });
  });
  const intro = await vm.runInContext("fetchJournalIntro({title: 'CELL'}, null)", app.context);
  assert.equal(intro, "Cell is a peer-reviewed scientific journal.");
});

test("a title-case article is tried separately from its uppercase database name", async () => {
  const app = harness((url) => {
    const title = url.searchParams.get("titles");
    if (url.hostname.startsWith("zh.") || title === "PHYSICAL REVIEW LETTERS") return page({ missing: "" });
    assert.equal(title, "Physical Review Letters");
    return page({ extract: "Physical Review Letters is a physics journal." });
  });
  const intro = await vm.runInContext("fetchJournalIntro({title: 'PHYSICAL REVIEW LETTERS'}, null)", app.context);
  assert.equal(intro, "Physical Review Letters is a physics journal.");
});

test("Wikidata descriptions or an empty result are used when Wikipedia is unavailable", async () => {
  const app = harness(() => { throw new Error("network unavailable"); });
  const intro = await vm.runInContext(`fetchJournalIntro(
    {title: 'Example'}, {ids: {wikidata: 'https://www.wikidata.org/entity/Q123'}},
    {sitelinks: {zhwiki: {title: '示例'}, enwiki: {title: 'Example'}}, descriptions: {zh: {value: '科学期刊'}}}
  )`, app.context);
  assert.equal(intro, "科学期刊");
  assert.equal(await vm.runInContext("fetchJournalIntro({title: 'Example'}, null)", app.context), "");
});
