import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FANS, scoreHand } from '../static/scorer.js';
import { EXAMPLES } from '../static/examples.js';

const readDocument = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test('reference tables preserve every executable fan value and explicit exclusion', () => {
  const rows = [...readDocument('RULES.md').matchAll(
    /^\| `([A-Z_]+)` \| (\d+)(?: each)? \| ([^|]+) \| ([^|]+) \|$/gm
  )];
  assert.deepEqual(rows.map(row => row[1]).sort(), Object.keys(FANS).sort());
  for (const [, id, points, condition, exclusions] of rows) {
    assert.equal(Number(points), FANS[id].points, id);
    assert.ok(condition.trim(), `${id} has no condition`);
    assert.deepEqual(
      [...exclusions.matchAll(/`([A-Z_]+)`/g)].map(match => match[1]).sort(),
      [...FANS[id].excludes].sort(),
      `${id} exclusions`
    );
    if (id === 'CHICKEN_HAND') assert.match(exclusions, /All other non-flower fans/);
  }
});

test('documented Unicode hand and tabulated breakdown match actual self-draw and discard scores', () => {
  const example = EXAMPLES[0].hand;
  const selfDraw = scoreHand(example);
  const discard = scoreHand({ ...example, win_type: 'discard' });
  for (const name of ['README.md', 'RULES.md']) {
    const document = readDocument(name);
    const unicodeLine = document.match(/^> (.+)$/m)?.[1];
    assert.ok(unicodeLine, `${name} has no Unicode example`);
    const tiles = [...unicodeLine].filter(char => {
      const code = char.codePointAt(0);
      return code >= 0x1f000 && code <= 0x1f021;
    }).map(char => {
      const code = char.codePointAt(0);
      return code >= 0x1f007 ? code - 0x1f007 : code - 0x1f000 + 27;
    });
    assert.deepEqual(tiles, example.concealed_tiles, name);
    const breakdown = [...document.matchAll(/^\| ([A-Za-z][A-Za-z ]+) \| (\d+) \|/gm)]
      .map(([, label, points]) => [label.toUpperCase().replaceAll(' ', '_'), Number(points)]);
    assert.deepEqual(breakdown.sort(), selfDraw.fans.map(fan => [fan.id, fan.points]).sort(), name);
    assert.match(document, new RegExp(`\\*\\*Total\\*\\* \\| \\*\\*${selfDraw.fan_points}\\*\\*`));
    assert.ok(document.includes(`**${discard.fan_points}** instead`));
  }
});
