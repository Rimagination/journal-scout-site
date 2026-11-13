import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const script = await readFile(new URL('../assets/browser-install-options.js', import.meta.url), 'utf8');

function newBadges(versions) {
  const channels = versions.map(version => ({
    dataset: { channelVersion: version },
    badge: { hidden: false },
    querySelector() { return this.badge; },
  }));
  const group = { querySelectorAll: () => channels };
  vm.runInNewContext(script, {
    document: { querySelectorAll: selector => selector === '.browser-guide__body .install-options' ? [group] : [] },
    window: { addEventListener() {} }, location: { hash: '' },
  });
  return channels.map(channel => !channel.badge.hidden);
}

test('NEW marks only the newer channel, comparing each numeric component', () => {
  assert.deepEqual(newBadges(['0.1.10.2', '0.1.11']), [false, true]);
  assert.deepEqual(newBadges(['0.1.12', '0.1.11']), [true, false]);
  assert.deepEqual(newBadges(['0.1.9', '0.1.10']), [false, true]);
  assert.deepEqual(newBadges(['0.1.11.1', '0.1.11']), [true, false]);
});

test('matching, unknown or unpaired versions do not display NEW', () => {
  assert.deepEqual(newBadges(['0.1.11', '0.1.11']), [false, false]);
  assert.deepEqual(newBadges(['0.1.11.0', '0.1.11']), [false, false]);
  assert.deepEqual(newBadges(['', '0.1.11']), [false, false]);
  assert.deepEqual(newBadges(['pending', '0.1.11']), [false, false]);
  assert.deepEqual(newBadges(['0.1.11']), [false]);
});

test('browser channel labels match their comparison values and download versions', async () => {
  const html = await readFile(new URL('../extension-install.html', import.meta.url), 'utf8');
  for (const browser of ['edge', 'chrome', 'firefox']) {
    const panel = html.split(`id="${browser}-install-panel"`)[1].split('<section class="browser-guide__body"')[0];
    const cards = [...panel.matchAll(/<div class="install-option(?: install-option--offline)?" data-channel-version="([\d.]+)">([\s\S]*?)<\/div>/g)];
    assert.equal(cards.length, 2);
    for (const [, version, card] of cards) {
      assert.ok(card.includes(`v${version}`));
      assert.ok(card.includes('class="install-option__new"'));
      if (card.includes(' download=')) assert.ok(card.includes(`-${version}.`));
    }
  }
});
