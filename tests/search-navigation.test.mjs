import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";

const appPath = process.env.JOURNAL_SCOUT_APP_JS || fileURLToPath(new URL("../app.js", import.meta.url));
const appSource = readFileSync(appPath, "utf8");

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function response(items) {
  return { ok: true, json: async () => ({ items }) };
}

function createApp(fetch) {
  const listeners = new Map();
  const input = {
    value: "",
    addEventListener(type, handler) { listeners.set(type, handler); },
    focus() {},
  };
  const panel = {
    buttons: [],
    classList: { add() {}, remove() {} },
    set innerHTML(html) {
      this.html = html;
      this.buttons = [...html.matchAll(/data-id="([^"]*)" data-idx="(\d+)"/g)].map((match) => {
        const handlers = {};
        return {
          dataset: { id: match[1], idx: match[2] },
          classList: { add() {}, remove() {} },
          addEventListener(type, handler) { handlers[type] = handler; },
          click() { handlers.click({ stopPropagation() {} }); },
        };
      });
    },
    querySelectorAll(selector) { return selector === ".suggestion" ? this.buttons : []; },
    querySelector() { return null; },
  };
  let timerId = 0;
  const timers = new Map();
  const location = { href: "https://journal.scansci.com/index.html", hostname: "journal.scansci.com", protocol: "https:" };
  const window = {
    location,
    JournalScoutBadges: { build: () => [] },
    setTimeout(callback) { const id = ++timerId; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); },
    localStorage: { getItem: () => null, setItem() {} },
  };
  const document = {
    getElementById(id) { return id === "searchInput" ? input : id === "suggestionPanel" ? panel : null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
  };
  const context = vm.createContext({ window, document, fetch, URL, URLSearchParams, AbortController, console });
  vm.runInContext(appSource, context, { filename: appPath });
  return { context, input, panel, location, listeners, timers };
}

const nature = { id: 12993, title: "Nature Communications", issn: "2041-1723", eissn: "2041-1723" };
const wrong = { id: 229, title: "Journal of Comparative Physiology B", issn: "0174-1578" };
const flush = () => new Promise((resolve) => setImmediate(resolve));

test("clicking a seed during a slow search resolves its current ID by ISSN", async () => {
  const initial = deferred();
  const calls = [];
  const app = createApp((url) => {
    const query = new URL(url).searchParams.get("q");
    calls.push(query);
    return query === "2041-1723" ? Promise.resolve(response([wrong, nature])) : initial.promise;
  });
  app.input.value = "Nature Communications";
  vm.runInContext("void renderSuggestions()", app.context);
  assert.equal(app.panel.buttons.length, 1);
  app.panel.buttons[0].click();
  assert.match(app.panel.html, /正在确认期刊信息/);
  await flush();
  assert.deepEqual(calls, ["Nature Communications", "2041-1723"]);
  assert.equal(new URL(app.location.href).searchParams.get("id"), "12993");
  initial.resolve(response([wrong]));
  await flush();
  assert.equal(new URL(app.location.href).searchParams.get("id"), "12993");
});

test("an unmatched seed never opens an unrelated journal", async () => {
  const app = createApp(() => Promise.resolve(response([wrong])));
  app.input.value = "Nature Communications";
  await vm.runInContext("gotoSuggestion(SEED_SUGGESTIONS[1], 'Nature Communications')", app.context);
  assert.equal(app.location.href, "https://journal.scansci.com/index.html");
  assert.match(app.panel.html, /无法确认期刊信息/);
});

test("changing the input cancels a pending seed selection", async () => {
  const lookup = deferred();
  const app = createApp(() => lookup.promise);
  app.input.value = "Nature Communications";
  const selected = vm.runInContext("gotoSuggestion(SEED_SUGGESTIONS[1], 'Nature Communications')", app.context);
  app.input.value = "Science";
  app.listeners.get("input")();
  lookup.resolve(response([nature]));
  await selected;
  assert.equal(app.location.href, "https://journal.scansci.com/index.html");
});

test("old search results cannot replace a newer input during debounce", async () => {
  const oldSearch = deferred();
  const app = createApp(() => oldSearch.promise);
  app.input.value = "Nature";
  const searching = vm.runInContext("renderSuggestions()", app.context);
  app.input.value = "Science";
  app.listeners.get("input")();
  oldSearch.resolve(response([nature]));
  await searching;
  assert.equal(app.panel.buttons.length, 0);
  assert.equal(vm.runInContext("state.suggestions.length", app.context), 0);
});

test("Enter during debounce searches the current input and opens the result", async () => {
  const calls = [];
  const app = createApp((url) => {
    calls.push(new URL(url).searchParams.get("q"));
    return Promise.resolve(response([nature]));
  });
  app.input.value = "Nature Communications";
  app.listeners.get("input")();
  const scheduled = vm.runInContext("state.searchInputTimer", app.context);
  await vm.runInContext("gotoPickedSuggestion()", app.context);
  assert.deepEqual(calls, ["Nature Communications"]);
  assert.equal(app.timers.has(scheduled), false);
  assert.equal(new URL(app.location.href).searchParams.get("id"), "12993");
});

test("all seeds use an ISSN rather than a hard-coded database ID", () => {
  const app = createApp(() => Promise.resolve(response([])));
  assert.equal(vm.runInContext("SEED_SUGGESTIONS.every(row => row.id == null && suggestionIssnKey(row.issn || row.eissn))", app.context), true);
});
