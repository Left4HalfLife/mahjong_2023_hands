import test from 'node:test';
import assert from 'node:assert/strict';
import { searchTiles } from '../static/tiles.js';
import { EXAMPLES } from '../static/examples.js';
import { scoreHand } from '../static/scorer.js';

test('search supports Pinyin with or without tones, English, Chinese, and tile codes', () => {
  for (const query of ['san wan', 'sān wàn', '3m', '3万', '3 characters']) {
    assert.deepEqual(searchTiles(query).map(tile => tile.id), [2]);
  }
  assert.deepEqual(searchTiles('dong').map(tile => tile.id), [27]);
  assert.deepEqual(searchTiles('lv fa').map(tile => tile.id), [32]);
  assert.deepEqual(searchTiles('lu: fa').map(tile => tile.id), [32]);
  assert.deepEqual(searchTiles('lü fa').map(tile => tile.id), [32]);
  assert.deepEqual(searchTiles('lu fa').map(tile => tile.id), [32]);
  assert.equal(searchTiles('not a mahjong tile').length, 0);
});

test('sample hand descriptions agree with actual scores and win status', () => {
  assert.deepEqual(EXAMPLES.slice(0, 3).map(example => scoreHand(example.hand).fan_points), [25, 32, 88]);
  for (const example of EXAMPLES.slice(0, -1)) assert.equal(scoreHand(example.hand).status, 'winning');
  const below = scoreHand(EXAMPLES.at(-1).hand);
  assert.equal(below.fan_points, 7);
  assert.equal(below.total_points, 15);
  assert.equal(below.status, 'below_minimum');
});
