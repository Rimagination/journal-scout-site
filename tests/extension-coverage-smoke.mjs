// Run with PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE set to local installations.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  try {
    const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(content);
  } catch { response.writeHead(404).end(); }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const url = `http://127.0.0.1:${server.address().port}/extension-install.html`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true });
const siteData = JSON.parse(await readFile(path.join(root, 'data', 'extension-site-coverage.json'), 'utf8'));
try {
  for (const viewport of [{ width: 1440, height: 800 }, { width: 1366, height: 768 }, { width: 390, height: 844 }, { width: 320, height: 700 }]) {
    const page = await browser.newPage({ viewport });
    await page.route('https://**/*', route => route.abort());
    let requests = 0;
    const errors = [];
    page.on('request', request => { if (request.url().includes('/data/extension-site-coverage.json')) requests++; });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url, { waitUntil: 'load' });
    assert.equal(requests, 0, 'coverage data should not load at the top of the page');
    assert.deepEqual(await page.locator('main h2').allTextContents(), ['效果展示', '选择你的浏览器', '更新说明', '网站覆盖']);
    const nav = page.locator('.extension-section-nav');
    assert.equal(await nav.locator('[href="#install-guide"]').getAttribute('aria-current'), 'page');
    assert.equal(await page.locator('#release-history').isVisible(), false);
    assert.equal(await page.locator('#site-coverage').isVisible(), false);
    assert.equal(await page.locator('#showcase').isVisible(), true);
    assert.equal(await page.locator('#showcase .extension-showcase-card').count(), 5);
    assert.ok((await page.locator('#showcase .extension-showcase-card').first().boundingBox()).y < viewport.height, 'showcase begins within the first screen');
    assert.ok((await page.locator('#showcase').boundingBox()).y < (await page.locator('#install-guide').boundingBox()).y, 'showcase comes before installation options');
    assert.equal(await page.locator('.extension-actions [href="#release-history"], .extension-actions [href="#site-coverage"]').count(), 0);
    assert.equal(await page.locator('.browser-guide').count(), 3);
    const guides = page.locator('.browser-guide');
    const boxes = await Promise.all([0, 1, 2].map(index => guides.nth(index).boundingBox()));
    if (viewport.width > 760) {
      assert.equal(boxes[0].y, boxes[1].y);
      assert.equal(boxes[1].y, boxes[2].y);
      assert.ok(boxes[0].width < (await page.locator('.browser-guides').boundingBox()).width / 2);
    } else {
      assert.ok(boxes[0].y < boxes[1].y && boxes[1].y < boxes[2].y);
    }
    for (const index of [0, 1, 2]) {
      const icon = await guides.nth(index).locator('.browser-chevron').boundingBox();
      assert.ok(Math.abs((icon.y + icon.height / 2) - (boxes[index].y + boxes[index].height / 2)) < 1, 'chevrons are vertically centered');
      assert.equal(await guides.nth(index).getAttribute('aria-expanded'), 'false');
    }
    if (process.env.COVERAGE_SCREENSHOT_DIR) {
      await page.screenshot({ path: path.join(process.env.COVERAGE_SCREENSHOT_DIR, `home-compact-${viewport.width}.png`) });
      await page.locator('#install-guide').screenshot({ path: path.join(process.env.COVERAGE_SCREENSHOT_DIR, `browser-cards-${viewport.width}.png`) });
    }
    const history = await page.locator('.release-history__list strong').allTextContents();
    assert.ok(history.includes(`v${siteData.manualVersion}`));
    assert.ok(!history.includes('v0.1.11'));
    await page.locator('.extension-primary').click();
    assert.ok(page.url().endsWith('#install-guide'));
    assert.equal(await page.locator('#showcase').isVisible(), true);
    assert.ok((await page.locator('#install-guide').boundingBox()).y < viewport.height, 'installation button scrolls to browser options');
    await page.locator('#edge-install').click();
    assert.equal(await page.locator('#edge-install-panel').isVisible(), true);
    await page.locator('#edge-offline-toggle').click();
    assert.equal(await page.locator('#edge-offline-details').isVisible(), true);
    assert.ok((await page.locator('#edge-offline-details a.extension-download').getAttribute('href')).includes(siteData.manualVersion));
    await page.locator('#chrome-install').click();
    assert.equal(await page.locator('#edge-install-panel').isVisible(), false);
    assert.equal(await page.locator('#edge-install').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#chrome-install-panel').isVisible(), true);
    await page.locator('#chrome-store-toggle').click();
    assert.equal(await page.locator('#chrome-store-details').isVisible(), true);
    await page.locator('#chrome-offline-toggle').click();
    assert.equal(await page.locator('#chrome-store-details').isVisible(), false);
    assert.equal(await page.locator('#chrome-offline-details').isVisible(), true);
    await page.locator('#firefox-install').click();
    assert.equal(await page.locator('#chrome-install-panel').isVisible(), false);
    assert.equal(await page.locator('#firefox-install-panel').isVisible(), true);
    await page.locator('#firefox-store-toggle').click();
    assert.equal(await page.locator('#firefox-store-details').isVisible(), true);
    assert.match(await page.locator('#firefox-store-details a.extension-download').getAttribute('href'), /^https:\/\/addons\.mozilla\.org\/zh-CN\/firefox\/addon\/journal-scout-/);
    assert.equal(await page.locator('#firefox-test-details').isVisible(), false);
    await page.locator('#firefox-test-toggle').click();
    assert.equal(await page.locator('#firefox-store-details').isVisible(), false);
    assert.equal(await page.locator('#firefox-test-details').isVisible(), true);
    assert.ok((await page.locator('#firefox-test-details a.extension-download').getAttribute('href')).includes(siteData.manualVersion));
    if (process.env.COVERAGE_SCREENSHOT_DIR) {
      await page.locator('#install-guide').screenshot({ path: path.join(process.env.COVERAGE_SCREENSHOT_DIR, `browser-open-${viewport.width}.png`) });
    }
    await page.locator('#firefox-install').click();
    assert.equal(await page.locator('#firefox-install-panel').isVisible(), false);
    await page.locator('#edge-install').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#edge-install-panel').isVisible(), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    await nav.locator('[href="#release-history"]').click();
    assert.equal(await page.locator('#release-history').isVisible(), true);
    assert.equal(await page.locator('#install-guide').isVisible(), false);
    assert.equal(await page.locator('#showcase').isVisible(), false);
    assert.equal(await nav.locator('[href="#release-history"]').getAttribute('aria-current'), 'page');
    assert.ok(page.url().endsWith('#release-history'));
    if (process.env.COVERAGE_SCREENSHOT_DIR) {
      await page.screenshot({ path: path.join(process.env.COVERAGE_SCREENSHOT_DIR, `section-history-${viewport.width}.png`) });
    }
    await nav.locator('[href="#showcase"]').click();
    assert.equal(await page.locator('#showcase').isVisible(), true);
    assert.equal(await page.locator('#release-history').isVisible(), false);
    assert.equal(await page.locator('#install-guide').isVisible(), false);
    await page.goBack();
    assert.equal(await page.locator('#release-history').isVisible(), true);
    await page.goForward();
    assert.equal(await page.locator('#showcase').isVisible(), true);
    await nav.locator('[href="#site-coverage"]').click();
    assert.equal(await page.locator('#showcase').isVisible(), false);
    assert.equal(await page.locator('#site-coverage').isVisible(), true);
    await page.locator('#site-coverage-rows a').first().waitFor();
    if (process.env.COVERAGE_SCREENSHOT_DIR) {
      await page.screenshot({ path: path.join(process.env.COVERAGE_SCREENSHOT_DIR, `section-coverage-${viewport.width}.png`) });
    }
    assert.equal(requests, 1);
    const rowCount = () => page.locator('#site-coverage-rows tr:not(.site-coverage__group)').count();
    assert.equal(await rowCount(), 20, 'initial batch');
    assert.equal(await page.locator('#site-coverage-status').innerText(), `已显示 20 / ${siteData.sites.length} 个网站`);
    assert.deepEqual(await page.locator('.site-coverage__group th').allTextContents(), ['中文网站', '英文网站']);

    await page.locator('[data-coverage-language="zh"]').click();
    assert.equal(await rowCount(), siteData.sites.filter(site => site.language === 'zh').length);
    assert.deepEqual(await page.locator('.site-coverage__group th').allTextContents(), ['中文网站']);
    assert.equal(await page.locator('[data-coverage-language="zh"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-coverage-language="en"]').click();
    const search = page.locator('#site-coverage-search');
    await search.fill('谷歌学术');
    assert.equal(await page.locator('#site-coverage-rows a').count(), 1);
    assert.equal(await page.locator('#site-coverage-rows a').innerText(), 'Google Scholar');
    await search.fill('jstage.jst.go.jp');
    assert.equal(await page.locator('#site-coverage-rows a').innerText(), 'J-STAGE');
    await search.fill('Dove Press');
    assert.equal(await page.locator('#site-coverage-rows a').innerText(), 'Dove Medical Press');
    await nav.locator('[href="#release-history"]').click();
    await nav.locator('[href="#site-coverage"]').click();
    assert.equal(await search.inputValue(), 'Dove Press');
    assert.equal(await page.locator('#site-coverage-rows a').innerText(), 'Dove Medical Press');
    await search.fill('not-a-real-journal-site');
    assert.match(await page.locator('#site-coverage-status').innerText(), /没有找到/);
    await search.fill('');
    await page.locator('[data-coverage-language="all"]').click();
    let previous = await rowCount();
    while (previous < siteData.sites.length) {
      await page.locator('#site-coverage-scroll').evaluate(node => { node.scrollTop = node.scrollHeight; });
      await page.waitForFunction(old => document.querySelectorAll('#site-coverage-rows tr:not(.site-coverage__group)').length > old, previous, { timeout: 5000 });
      previous = await rowCount();
    }
    assert.equal(previous, siteData.sites.length);
    assert.equal(await page.locator('#site-coverage-status').innerText(), `已显示 ${siteData.sites.length} / ${siteData.sites.length} 个网站`);
    assert.equal(await page.locator('#site-coverage-more').isVisible(), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    if (viewport.width < 500) {
      assert.equal(await page.locator('#site-coverage-scroll').evaluate(node => node.scrollWidth > node.clientWidth), true);
      await page.locator('#site-coverage-scroll').evaluate(node => { node.scrollLeft = node.scrollWidth; });
      assert.ok(await page.locator('#site-coverage-scroll').evaluate(node => node.scrollLeft) > 0);
      const stickyName = page.locator('#site-coverage-rows tr:not(.site-coverage__group) td:first-child').first();
      assert.equal(await stickyName.evaluate(node => getComputedStyle(node).position), 'sticky');
    }
    await page.locator('[data-coverage-language="all"]').click();
    if (process.env.COVERAGE_SCREENSHOT_DIR) {
      await page.locator('#site-coverage').screenshot({ path: path.join(process.env.COVERAGE_SCREENSHOT_DIR, `coverage-table-${viewport.width}.png`) });
    }
    await nav.locator('[href="#install-guide"]').click();
    assert.equal(await page.locator('#showcase').isVisible(), true);
    assert.equal(await page.locator('#install-guide').isVisible(), true);
    assert.equal(await page.locator('#site-coverage').isVisible(), false);
    assert.deepEqual(errors, []);
    console.log(`${viewport.width}px: section navigation, history, search, scrolling and layout passed`);
    await page.close();
  }

  const page = await browser.newPage();
  let fail = true;
  await page.route('**/data/extension-site-coverage.json*', route => fail ? route.fulfill({ status: 503 }) : route.continue());
  await page.route('https://**/*', route => route.abort());
  await page.goto(url + '#site-coverage', { waitUntil: 'load' });
  assert.equal(await page.locator('#site-coverage').isVisible(), true);
  assert.equal(await page.locator('#release-history').isVisible(), false);
  assert.equal(await page.locator('.extension-section-nav [href="#site-coverage"]').getAttribute('aria-current'), 'page');
  await page.locator('#site-coverage-retry').waitFor({ state: 'visible' });
  assert.match(await page.locator('#site-coverage-status').innerText(), /加载失败/);
  fail = false;
  await page.locator('#site-coverage-retry').click();
  await page.locator('#site-coverage-rows a').first().waitFor();
  assert.equal(await page.locator('#site-coverage-retry').isVisible(), false);
  await page.close();
  console.log('coverage data failure and retry passed');

  const linkedPage = await browser.newPage();
  await linkedPage.route('https://**/*', route => route.abort());
  await linkedPage.goto(url + '#edge-install', { waitUntil: 'load' });
  assert.equal(await linkedPage.locator('#edge-install-panel').isVisible(), true);
  await linkedPage.close();

  const noScriptPage = await browser.newPage({ javaScriptEnabled: false });
  await noScriptPage.route('https://**/*', route => route.abort());
  await noScriptPage.goto(url, { waitUntil: 'load' });
  for (const selector of ['#edge-store-details', '#edge-offline-details', '#chrome-store-details', '#chrome-offline-details', '#firefox-store-details', '#firefox-test-details']) {
    assert.equal(await noScriptPage.locator(selector).isVisible(), true, `${selector} works without JavaScript`);
  }
  await noScriptPage.close();
  console.log('direct browser link and JavaScript-free installation instructions passed');
} finally {
  await browser.close();
  server.close();
}
