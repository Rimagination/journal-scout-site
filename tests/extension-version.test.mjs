import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

test('update-check metadata matches the displayed manual version and both packages', async () => {
  const html = await readFile(new URL('../extension-install.html', import.meta.url), 'utf8');
  const version = html.match(/<meta name="journal-scout-manual-version" content="([\d.]+)"/i)?.[1];
  assert.match(version || '', /^\d+(?:\.\d+){1,3}$/);
  assert.ok(html.includes(`手动安装包 v${version}`));
  const coverage = JSON.parse(await readFile(new URL('../data/extension-site-coverage.json', import.meta.url), 'utf8'));
  assert.equal(coverage.manualVersion, version, 'coverage data matches the published manual version');
  assert.equal((html.match(new RegExp(`downloads/scansci-chromium-${version.replaceAll('.', '\\.')}\\.zip`, 'g')) || []).length, 2);
  assert.ok(html.includes(`downloads/scansci-firefox-${version}.xpi`));
  assert.ok(html.includes(`downloads/journal-scout-safari-mac-test-${version}.zip`));
  for (const file of [`scansci-chromium-${version}.zip`, `scansci-firefox-${version}.xpi`, `journal-scout-safari-mac-test-${version}.zip`]) {
    await access(new URL(`../downloads/${file}`, import.meta.url));
  }
  const zoteroVersion = html.match(/downloads\/journal-scout-zotero-([\d.]+)\.xpi/)?.[1];
  assert.match(zoteroVersion || '', /^\d+(?:\.\d+){1,3}$/);
  const zoteroPage = await readFile(new URL('../zotero.html', import.meta.url), 'utf8');
  assert.match(zoteroPage, /http-equiv="refresh" content="0; url=\.\/extension-install\.html#zotero-install"/);
  assert.ok(html.includes(`XPI · v${zoteroVersion}`));
  assert.ok(html.includes('id="zotero-install"'));
  for (const page of ['index.html', 'journal.html', 'hq_stats.html', 'conference.html', 'updates.html']) {
    const source = await readFile(new URL(`../${page}`, import.meta.url), 'utf8');
    const navigation = source.match(/<nav class="product-links"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || '';
    assert.equal((navigation.match(/class="extension-install-link"/g) || []).length, 2);
    assert.ok(navigation.includes('href="./extension-install.html">插件下载</a>'));
    assert.match(navigation, /href="\.\/updates\.html"[^>]*>更新说明<\/a>/);
  }
  const zoteroHistory = html.split('<h3 class="release-history__product">Zotero 插件</h3>')[1]?.split('</ol>')[0] || '';
  assert.ok(zoteroHistory.includes(`<strong>v${zoteroVersion}</strong>`));
  assert.ok(!zoteroPage.includes('class="product-switch"'));
  await access(new URL(`../downloads/journal-scout-zotero-${zoteroVersion}.xpi`, import.meta.url));
});
