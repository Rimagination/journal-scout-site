import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

test('update-check metadata matches the displayed manual version and both packages', async () => {
  const html = await readFile(new URL('../extension-install.html', import.meta.url), 'utf8');
  const version = html.match(/<meta name="journal-scout-manual-version" content="([\d.]+)"/i)?.[1];
  assert.match(version || '', /^\d+(?:\.\d+){1,3}$/);
  assert.ok(html.includes(`手动安装包 v${version}`));
  assert.equal((html.match(new RegExp(`downloads/scansci-chromium-${version.replaceAll('.', '\\.')}\\.zip`, 'g')) || []).length, 2);
  assert.ok(html.includes(`downloads/scansci-firefox-${version}.xpi`));
  assert.ok(html.includes(`downloads/journal-scout-safari-mac-test-${version}.zip`));
  for (const file of [`scansci-chromium-${version}.zip`, `scansci-firefox-${version}.xpi`, `journal-scout-safari-mac-test-${version}.zip`]) {
    await access(new URL(`../downloads/${file}`, import.meta.url));
  }
});
