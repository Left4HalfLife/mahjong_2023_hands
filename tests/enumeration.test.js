import test from 'node:test';
import assert from 'node:assert/strict';
import { findDecompositions, winningTiles, scoreHand } from '../static/scorer.js';

const hand = (tiles, winning = tiles.at(-1)) => ({
  concealed_tiles: tiles, melds: [], winning_tile: winning,
  win_type: 'discard', seat_wind: 27, prevalent_wind: 27
});
const histogram = tiles => Array.from({ length: 6 }, (_, tile) => tiles.filter(t => t === tile).length);
const tileList = counts => counts.flatMap((count, tile) => Array(count).fill(tile));
const key = counts => counts.join(',');

// Independent constructive oracle: combine complete sets, rather than recursively
// remove sets from a candidate hand as the production enumerator does.
const sets = [
  ...Array.from({ length: 6 }, (_, t) => [t, t, t]),
  ...Array.from({ length: 4 }, (_, t) => [t, t + 1, t + 2])
];
const oracle = new Set();
for (let a = 0; a < sets.length; a++) {
  for (let b = a; b < sets.length; b++) {
    for (let c = b; c < sets.length; c++) {
      for (let d = c; d < sets.length; d++) {
        for (let pair = 0; pair < 6; pair++) {
          const counts = histogram([...sets[a], ...sets[b], ...sets[c], ...sets[d], pair, pair]);
          if (counts.every(count => count <= 4)) oracle.add(key(counts));
        }
      }
    }
  }
}
function inventories(total, size = 6, prefix = []) {
  if (size === 0) return total === 0 ? [prefix] : [];
  return Array.from({ length: Math.min(4, total) + 1 }, (_, n) =>
    inventories(total - n, size - 1, [...prefix, n])).flat();
}

test('all six-rank 14-tile inventories agree with an independent constructive standard-hand oracle', () => {
  for (const counts of inventories(14)) {
    const tiles = tileList(counts);
    const decompositions = findDecompositions(hand(tiles));
    assert.equal(decompositions.some(d => d.form === 'standard'), oracle.has(key(counts)), key(counts));
    assert.equal(decompositions.some(d => d.form === 'seven_pairs'), counts.every(n => n % 2 === 0), key(counts));
    for (const d of decompositions.filter(d => d.form === 'standard')) {
      assert.deepEqual(
        [...d.sets.flatMap(set => set.tiles), d.pair, d.pair].sort((a, b) => a - b), tiles
      );
    }
  }
});

test('waits match the constructive oracle for every five-rank 13-tile inventory', () => {
  for (const shortCounts of inventories(13, 5)) {
    const counts = [...shortCounts, 0];
    const expected = [];
    // A sixth-rank completion is possible; ranks above six cannot combine with
    // this inventory (which contains no rank six or higher before the win).
    for (let tile = 0; tile < 6; tile++) {
      if (counts[tile] === 4) continue;
      const after = [...counts];
      after[tile]++;
      if (oracle.has(key(after)) || after.every(n => n % 2 === 0)) expected.push(tile);
    }
    if (!expected.length) continue;
    const tiles = [...tileList(counts), expected[0]];
    assert.deepEqual(winningTiles(hand(tiles, expected[0])), expected, key(counts));
  }
});

test('scoring preserves legal structures and arithmetic across deterministic mixed-suit generated hands', () => {
  let seed = 2023;
  const next = max => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  let accepted = 0;
  for (let attempt = 0; accepted < 250 && attempt < 2000; attempt++) {
    const sets = Array.from({ length: 4 }, () => {
      if (next(2)) {
        const t = next(34);
        return { type: 'pung', tiles: [t, t, t], concealed: false };
      }
      const t = next(3) * 9 + next(7);
      return { type: 'chow', tiles: [t, t + 1, t + 2], concealed: false };
    });
    const pair = next(34);
    const tiles = [...sets.flatMap(set => set.tiles), pair, pair];
    if (tiles.some(tile => tiles.filter(t => t === tile).length > 4)) continue;
    const declarations = next(5);
    const input = {
      ...hand([...sets.slice(declarations).flatMap(set => set.tiles), pair, pair], pair),
      melds: sets.slice(0, declarations), win_type: next(2) ? 'self_draw' : 'discard'
    };
    const result = scoreHand(input);
    assert.notEqual(result.status, 'not_winning');
    assert.ok(result.waits.includes(pair));
    assert.equal(result.fan_points, result.fans.reduce((sum, fan) => sum + fan.points, 0));
    assert.equal(result.valid_win, result.fan_points >= 8);
    assert.deepEqual(scoreHand({ ...input, concealed_tiles: [...input.concealed_tiles].reverse() }), result);
    accepted++;
  }
  assert.equal(accepted, 250);
});
