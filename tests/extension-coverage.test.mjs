import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('coverage directory follows the published manual version and has unique, classified hosts', async () => {
  const html = await readFile(new URL('../extension-install.html', import.meta.url), 'utf8');
  const data = JSON.parse(await readFile(new URL('../data/extension-site-coverage.json', import.meta.url), 'utf8'));
  const version = html.match(/<meta name="journal-scout-manual-version" content="([\d.]+)"/i)?.[1];
  assert.equal(data.manualVersion, version);
  assert.equal(html.match(/class="site-coverage__version">手动安装包 v([\d.]+)</)?.[1], version);
  assert.ok(data.sites.some(site => site.language === 'zh'));
  assert.ok(data.sites.some(site => site.language === 'en'));
  const hosts = data.sites.flatMap(site => site.hosts);
  assert.equal(new Set(hosts).size, hosts.length);
  assert.ok(hosts.every(host => /^(?:\*\.)?[a-z0-9.-]+$/i.test(host)));
  assert.ok(data.sites.every(site => site.name && site.pages && ['zh', 'en'].includes(site.language)));
});
