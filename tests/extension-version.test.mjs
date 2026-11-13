import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('update-check metadata matches the displayed manual version and both packages', async () => {
  const html = await readFile(new URL('../extension-install.html', import.meta.url), 'utf8');
  const version = html.match(/<meta name="journal-scout-manual-version" content="([\d.]+)"/i)?.[1];
  assert.match(version || '', /^\d+(?:\.\d+){1,3}$/);
  assert.ok(html.includes(`手动安装包 v${version}`));
  const coverage = JSON.parse(await readFile(new URL('../data/extension-site-coverage.json', import.meta.url), 'utf8'));
  assert.equal(coverage.manualVersion, version, 'coverage data matches the published manual version');
  assert.equal((html.match(new RegExp(`downloads/scansci-chromium-${version.replaceAll('.', '\\.')}\\.zip`, 'g')) || []).length, 2);
  assert.ok(html.includes(`downloads/journal-scout-firefox-signed-${version}.xpi`));
  assert.ok(html.includes(`downloads/journal-scout-safari-mac-test-${version}.zip`));
  for (const file of [`scansci-chromium-${version}.zip`, `journal-scout-firefox-signed-${version}.xpi`, `journal-scout-safari-mac-test-${version}.zip`]) {
    await access(new URL(`../downloads/${file}`, import.meta.url));
  }
  const zoteroVersion = html.match(/downloads\/journal-scout-zotero-([\d.]+)\.xpi/)?.[1];
  assert.match(zoteroVersion || '', /^\d+(?:\.\d+){1,3}$/);
  const zoteroRelease = JSON.parse(await readFile(new URL('../data/zotero-data-release.json', import.meta.url), 'utf8'));
  assert.equal(zoteroRelease.pluginVersion, zoteroVersion, 'Zotero update notice matches the published download');
  const zoteroPage = await readFile(new URL('../zotero.html', import.meta.url), 'utf8');
  assert.match(zoteroPage, /http-equiv="refresh" content="0; url=\.\/extension-install\.html#zotero-install"/);
  assert.ok(html.includes(`XPI · v${zoteroVersion}`));
  assert.ok(html.includes('id="zotero-install"'));
  for (const page of ['index.html', 'journal.html', 'hq_stats.html', 'conference.html', 'updates.html']) {
    const source = await readFile(new URL(`../${page}`, import.meta.url), 'utf8');
    const navigation = source.match(/<nav class="product-links"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || '';
    const links = [...navigation.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
    assert.equal(links.length, page === 'index.html' ? 3 : 2);
    assert.match(links[0][1], /class="extension-install-link" href="\.\/extension-install\.html"/);
    assert.match(links[0][2], /<svg\b[^>]*aria-hidden="true"/);
    assert.match(links[0][2], /插件下载/);
    if (page === 'index.html') assert.match(links[1][1], /href="\.\/catalogs\.html"/);
    assert.match(links.at(-1)[1], /class="updates-nav-link" href="\.\/updates\.html"/);
    assert.equal(links.at(-1)[2], '更新说明');
  }
  const zoteroHistory = html.split('<h3 class="release-history__product">Zotero 插件</h3>')[1]?.split('</ol>')[0] || '';
  assert.ok(zoteroHistory.includes(`<strong>v${zoteroVersion}</strong>`));
  assert.ok(!zoteroPage.includes('class="product-switch"'));
  await access(new URL(`../downloads/journal-scout-zotero-${zoteroVersion}.xpi`, import.meta.url));
  const nativeUpdates = JSON.parse(await readFile(new URL('../updates/zotero.json', import.meta.url), 'utf8'));
  const nativeUpdate = nativeUpdates.addons['journal-scout@scansci.com'].updates.find(update => update.version === zoteroVersion);
  assert.ok(nativeUpdate, 'Native Zotero updater offers the current published version');
  const nativeUrl = new URL(nativeUpdate.update_link);
  assert.equal(nativeUrl.origin, 'https://journal.scansci.com');
  assert.equal(nativeUrl.pathname, `/downloads/journal-scout-zotero-${zoteroVersion}.xpi`);
  const packageBytes = await readFile(new URL(`../downloads/journal-scout-zotero-${zoteroVersion}.xpi`, import.meta.url));
  assert.equal(nativeUpdate.update_hash, `sha256:${createHash('sha256').update(packageBytes).digest('hex')}`);
  assert.deepEqual(nativeUpdate.applications.zotero, { strict_min_version: '7.0', strict_max_version: '10.0.*' });
});
