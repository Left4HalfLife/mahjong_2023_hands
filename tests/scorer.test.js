import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreHand, validateHand, winningTiles, findDecompositions, HandValidationError,
  FANS, instancesConflict, countOnceCompatible, selectFans
} from '../static/scorer.js';

const chow = tile => ({ type: 'chow', tiles: [tile, tile + 1, tile + 2], concealed: false });
const pung = tile => ({ type: 'pung', tiles: [tile, tile, tile], concealed: false });
const kong = (tile, concealed = false) => ({ type: 'kong', tiles: Array(4).fill(tile), concealed });
const state = (tiles, options = {}) => ({
  concealed_tiles: tiles, melds: [], winning_tile: tiles.at(-1),
  win_type: 'discard', seat_wind: 27, prevalent_wind: 27, flowers_count: 0, flags: {},
  ...options
});
function standard(sets, pair, options = {}) {
  const { declared = [0, 1, 2, 3], ...rest } = options;
  const isDeclared = (set, index) => declared.includes(index) || set.type === 'kong';
  return state([...sets.filter((set, index) => !isDeclared(set, index)).flatMap(set => set.tiles), pair, pair], {
    melds: sets.filter(isDeclared), winning_tile: pair, ...rest
  });
}
const ids = result => result.fans.map(fan => fan.id);
const has = (result, id) => ids(result).includes(id);
const count = (result, id) => result.fans.filter(fan => fan.id === id).length;
const knit = [0, 3, 6, 10, 13, 16, 20, 23, 26];
const orphanTiles = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
const pairs = tiles => tiles.flatMap(tile => [tile, tile]);

// Declared sets isolate pattern recognition from alternative concealed partitions.
const fanFixtures = [
  ['BIG_FOUR_WINDS', standard([pung(27), pung(28), pung(29), pung(30)], 4)],
  ['BIG_THREE_DRAGONS', standard([pung(31), pung(32), pung(33), chow(3)], 12)],
  ['ALL_GREEN', standard([chow(10), chow(10), pung(14), pung(16)], 32)],
  ['NINE_GATES', state([0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 4])],
  ['FOUR_KONGS', standard([kong(1), kong(12), kong(23), kong(31)], 27)],
  ['SEVEN_SHIFTED_PAIRS', state(pairs([0, 1, 2, 3, 4, 5, 6]))],
  ['THIRTEEN_ORPHANS', state([...orphanTiles, 27])],
  ['ALL_TERMINALS', standard([pung(0), pung(8), pung(9), pung(17)], 18)],
  ['LITTLE_FOUR_WINDS', standard([pung(27), pung(28), pung(29), chow(3)], 30)],
  ['LITTLE_THREE_DRAGONS', standard([pung(31), pung(32), chow(3), chow(12)], 33)],
  ['ALL_HONORS', standard([pung(27), pung(28), pung(31), pung(32)], 33)],
  ['FOUR_CONCEALED_PUNGS', standard([pung(1), pung(12), pung(23), pung(31)], 27, { declared: [] })],
  ['PURE_TERMINAL_CHOWS', standard([chow(0), chow(0), chow(6), chow(6)], 4)],
  ['QUADRUPLE_CHOW', standard([chow(0), chow(0), chow(0), chow(0)], 22)],
  ['FOUR_PURE_SHIFTED_PUNGS', standard([pung(1), pung(2), pung(3), pung(4)], 27)],
  ['FOUR_SHIFTED_CHOWS', standard([chow(0), chow(1), chow(2), chow(3)], 27)],
  ['THREE_KONGS', standard([kong(1), kong(12), kong(23), chow(3)], 27)],
  ['ALL_TERMINALS_AND_HONORS', standard([pung(0), pung(9), pung(27), pung(31)], 33)],
  ['SEVEN_PAIRS', state(pairs([0, 4, 10, 19, 27, 31, 33]))],
  ['GREATER_HONORS_AND_KNITTED', state([...knit.slice(0, 7), 27, 28, 29, 30, 31, 32, 33])],
  ['ALL_EVEN', standard([pung(1), pung(3), pung(12), pung(23)], 25)],
  ['FULL_FLUSH', standard([chow(0), chow(1), chow(4), pung(8)], 4)],
  ['PURE_TRIPLE_CHOW', standard([chow(0), chow(0), chow(0), chow(12)], 27)],
  ['PURE_SHIFTED_PUNGS', standard([pung(1), pung(2), pung(3), chow(12)], 27)],
  ['UPPER_TILES', standard([chow(6), chow(15), pung(24), pung(25)], 26)],
  ['MIDDLE_TILES', standard([chow(3), chow(12), pung(21), pung(22)], 23)],
  ['LOWER_TILES', standard([chow(0), chow(9), pung(18), pung(19)], 20)],
  ['PURE_STRAIGHT', standard([chow(0), chow(3), chow(6), chow(18)], 22)],
  ['THREE_SUITED_TERMINAL_CHOWS', standard([chow(0), chow(6), chow(9), chow(15)], 22)],
  ['PURE_SHIFTED_CHOWS', standard([chow(0), chow(1), chow(2), chow(12)], 27)],
  ['ALL_FIVES', standard([chow(2), chow(12), chow(22), pung(13)], 4)],
  ['TRIPLE_PUNG', standard([pung(1), pung(10), pung(19), chow(3)], 27)],
  ['THREE_CONCEALED_PUNGS', standard([pung(1), pung(12), pung(23), chow(3)], 27, { declared: [3] })],
  ['LESSER_HONORS_AND_KNITTED', state([...knit.slice(0, 8), 27, 28, 29, 30, 31, 32])],
  ['UPPER_FOUR', standard([chow(5), chow(15), pung(24), pung(25)], 26)],
  ['KNITTED_STRAIGHT', state([...knit, 27, 27, 27, 31, 31])],
  ['LOWER_FOUR', standard([chow(1), chow(9), pung(18), pung(19)], 20)],
  ['BIG_THREE_WINDS', standard([pung(27), pung(28), pung(29), chow(3)], 12)],
  ['MIXED_STRAIGHT', standard([chow(0), chow(12), chow(24), pung(28)], 31)],
  ['REVERSIBLE_TILES', standard([chow(18), chow(19), pung(13), pung(17)], 33)],
  ['MIXED_TRIPLE_CHOW', standard([chow(0), chow(9), chow(18), pung(28)], 31)],
  ['MIXED_SHIFTED_PUNGS', standard([pung(1), pung(11), pung(21), chow(4)], 27)],
  ['CHICKEN_HAND', standard([chow(0), chow(13), chow(19), pung(22)], 28, { declared: [0, 1, 2], winning_tile: 22 })],
  ['LAST_TILE_DRAW', standard([chow(0), chow(12), chow(24), pung(28)], 31, { win_type: 'self_draw', flags: { last_tile_draw: true } })],
  ['LAST_TILE_CLAIM', standard([chow(0), chow(12), chow(24), pung(28)], 31, { flags: { last_tile_claim: true } })],
  ['OUT_WITH_REPLACEMENT', standard([kong(0), chow(12), chow(24), pung(28)], 31, { win_type: 'self_draw', flags: { out_with_replacement: true } })],
  ['ROBBING_THE_KONG', standard([chow(0), chow(12), chow(24), pung(28)], 31, { declared: [1, 2, 3], winning_tile: 1, flags: { robbing_the_kong: true } })],
  ['ALL_PUNGS', standard([pung(1), pung(12), pung(23), pung(31)], 27)],
  ['HALF_FLUSH', standard([chow(0), chow(3), pung(7), pung(31)], 27)],
  ['MIXED_SHIFTED_CHOWS', standard([chow(0), chow(10), chow(20), pung(28)], 31)],
  ['ALL_TYPES', standard([chow(0), chow(12), chow(24), pung(28)], 31)],
  ['MELDED_HAND', standard([chow(0), chow(12), chow(24), pung(28)], 31)],
  ['TWO_CONCEALED_KONGS', standard([kong(1, true), kong(12, true), chow(21), chow(3)], 27)],
  ['TWO_DRAGONS', standard([pung(31), pung(32), chow(3), chow(12)], 27)],
  ['OUTSIDE_HAND', standard([chow(0), chow(15), pung(18), pung(28)], 31)],
  ['FULLY_CONCEALED_HAND', standard([chow(0), chow(12), chow(24), pung(28)], 31, { declared: [], win_type: 'self_draw' })],
  ['TWO_MELDED_KONGS', standard([kong(1), kong(12), chow(21), chow(3)], 27)],
  ['LAST_TILE', standard([chow(0), chow(12), chow(24), pung(28)], 31, { declared: [1, 2, 3], winning_tile: 1, flags: { fourth_copy_visible: true } })],
  ['DRAGON_PUNG', standard([pung(31), chow(0), chow(12), chow(24)], 27)],
  ['PREVALENT_WIND', standard([pung(27), chow(0), chow(12), chow(24)], 31)],
  ['SEAT_WIND', standard([pung(27), chow(0), chow(12), chow(24)], 31)],
  ['CONCEALED_HAND', standard([chow(0), chow(12), chow(24), pung(28)], 31, { declared: [] })],
  ['ALL_CHOWS', standard([chow(0), chow(12), chow(24), chow(3)], 10)],
  ['TILE_HOG', state([0, 0, 0, 0, 4, 4, 10, 10, 19, 19, 27, 27, 31, 31])],
  ['DOUBLE_PUNG', standard([pung(1), pung(10), chow(21), chow(3)], 27)],
  ['TWO_CONCEALED_PUNGS', standard([pung(1), pung(12), chow(21), chow(3)], 27, { declared: [2, 3] })],
  ['CONCEALED_KONG', standard([kong(1, true), chow(12), chow(21), chow(3)], 27)],
  ['ALL_SIMPLES', standard([chow(1), chow(12), chow(21), chow(3)], 10)],
  ['PURE_DOUBLE_CHOW', standard([chow(0), chow(0), chow(12), pung(28)], 31)],
  ['MIXED_DOUBLE_CHOW', standard([chow(0), chow(9), chow(22), pung(28)], 31)],
  ['SHORT_STRAIGHT', standard([chow(0), chow(3), chow(22), pung(28)], 31)],
  ['TWO_TERMINAL_CHOWS', standard([chow(0), chow(6), chow(22), pung(28)], 31)],
  ['PUNG_OF_TERMINALS_OR_HONORS', standard([pung(0), chow(12), chow(22), pung(28)], 31)],
  ['MELDED_KONG', standard([kong(1), chow(12), chow(21), chow(3)], 27)],
  ['ONE_VOIDED_SUIT', standard([chow(0), chow(3), chow(12), pung(28)], 31)],
  ['NO_HONORS', standard([chow(0), chow(12), chow(24), pung(19)], 4)],
  ['EDGE_WAIT', standard([chow(0), chow(12), chow(24), pung(28)], 31, { declared: [1, 2, 3], winning_tile: 2 })],
  ['CLOSED_WAIT', standard([chow(0), chow(12), chow(24), pung(28)], 31, { declared: [1, 2, 3], winning_tile: 1 })],
  ['SINGLE_WAIT', standard([chow(0), chow(12), chow(24), pung(28)], 31, { declared: [1, 2, 3] })],
  ['SELF_DRAWN', standard([chow(0), chow(12), chow(24), pung(28)], 31, { win_type: 'self_draw' })],
  ['FLOWER_TILES', standard([chow(0), chow(12), chow(24), pung(28)], 31, { flowers_count: 3 })]
];

for (const [id, input] of fanFixtures) {
  test(`recognizes ${id} on a qualifying structure`, () => {
    const result = scoreHand(input);
    assert.ok(has(result, id), `missing ${id}; awarded ${ids(result).join(', ')}`);
    assert.equal(result.total_points, result.fans.reduce((sum, fan) => sum + fan.points, 0));
  });
}

test('every documented fan has an exercised hand, and no fixture is duplicated', () => {
  assert.deepEqual(fanFixtures.map(([id]) => id).sort(), Object.keys(FANS).sort());
});

test('full straight example has an independently enumerated 25-point breakdown', () => {
  const result = scoreHand(state([0, 1, 2, 3, 4, 5, 6, 7, 8, 18, 19, 20, 22, 22], { win_type: 'self_draw' }));
  assert.equal(result.fan_points, 25);
  assert.deepEqual(result.fans.map(({ id, points }) => [id, points]), [
    ['ALL_CHOWS', 2], ['FULLY_CONCEALED_HAND', 4], ['MIXED_DOUBLE_CHOW', 1],
    ['ONE_VOIDED_SUIT', 1], ['PURE_STRAIGHT', 16], ['SINGLE_WAIT', 1]
  ]);
});

test('flowers cannot legalize a seven-point structural win', () => {
  const input = standard([chow(0), chow(13), chow(19), pung(26)], 28);
  const result = scoreHand({ ...input, flowers_count: 8 });
  assert.equal(result.fan_points, 7); // Melded Hand (6) + terminal pung (1).
  assert.equal(result.total_points, 15);
  assert.equal(result.status, 'below_minimum');
  assert.equal(result.valid_win, false);
  assert.ok(!has(result, 'CHICKEN_HAND'));
});

test('Chicken Hand depends on zero eligible fans, not zero selected fans or flowers', () => {
  const input = fanFixtures.find(([id]) => id === 'CHICKEN_HAND')[1];
  const result = scoreHand({ ...input, flowers_count: 3 });
  assert.equal(result.fan_points, 8);
  assert.equal(result.total_points, 11);
  assert.deepEqual(ids(result), ['CHICKEN_HAND', 'FLOWER_TILES']);
});

test('seven pairs counts quads as two pairs and tile hogs independently', () => {
  const result = scoreHand(state([0, 0, 0, 0, 4, 4, 4, 4, 10, 10, 27, 27, 31, 31]));
  assert.equal(result.decomposition.form, 'seven_pairs');
  assert.equal(count(result, 'TILE_HOG'), 2);
  assert.ok(has(result, 'SEVEN_PAIRS'));
  assert.ok(!has(result, 'SINGLE_WAIT'));
  assert.ok(!has(result, 'CONCEALED_HAND'));
});

test('Quadruple Chow excludes all three hogs and contained double/triple chows', () => {
  const result = scoreHand(fanFixtures.find(([id]) => id === 'QUADRUPLE_CHOW')[1]);
  for (const id of ['TILE_HOG', 'PURE_DOUBLE_CHOW', 'PURE_TRIPLE_CHOW']) assert.ok(!has(result, id));
  assert.equal(result.fan_points, 57); // 48 + All Chows 2 + missing suit 1 + Melded Hand 6.
});

test('an incompatible content fan can replace Seven Pairs without regaining concealment', () => {
  const result = scoreHand(state([10, 10, 10, 10, 11, 11, 12, 12, 14, 14, 16, 16, 32, 32]));
  assert.equal(result.fan_points, 90);
  assert.deepEqual(ids(result), ['ALL_GREEN', 'TILE_HOG']);
  assert.equal(result.decomposition.form, 'seven_pairs');
});

test('Thirteen Orphans neither double-counts All Types nor ordinary waits', () => {
  const result = scoreHand(state([...orphanTiles, 27]));
  assert.equal(result.fan_points, 88);
  assert.deepEqual(ids(result), ['THIRTEEN_ORPHANS']);
  assert.deepEqual(result.waits, orphanTiles);
});

test('Seven Shifted Pairs competes against, but never borrows, standard partitions', () => {
  const input = fanFixtures.find(([id]) => id === 'SEVEN_SHIFTED_PAIRS')[1];
  const decompositions = findDecompositions(input);
  assert.ok(decompositions.some(d => d.form === 'standard'));
  assert.ok(decompositions.some(d => d.form === 'seven_pairs'));
  const result = scoreHand(input);
  assert.equal(result.fan_points, 88);
  assert.deepEqual(ids(result), ['SEVEN_SHIFTED_PAIRS']);
});

test('discard-completed pung loses concealed-pung credit but not Concealed Hand', () => {
  const input = standard([pung(1), pung(12), pung(23), pung(31)], 27, { declared: [], winning_tile: 31 });
  const discard = scoreHand(input);
  const selfDraw = scoreHand({ ...input, win_type: 'self_draw' });
  assert.ok(has(discard, 'THREE_CONCEALED_PUNGS'));
  assert.ok(!has(discard, 'FOUR_CONCEALED_PUNGS'));
  assert.ok(has(discard, 'CONCEALED_HAND'));
  assert.equal(discard.decomposition.sets.filter(set => set.concealed).length, 3);
  assert.equal(discard.context.exposed_melds, 0);
  assert.ok(has(selfDraw, 'FOUR_CONCEALED_PUNGS'));
  assert.equal(selfDraw.decomposition.sets.filter(set => set.concealed).length, 4);
});

test('discard winning occurrence can be assigned to a chow instead of the same-tile pung', () => {
  const input = standard([pung(1), chow(1), pung(13), pung(23)], 27, { declared: [], winning_tile: 1 });
  const result = scoreHand(input);
  assert.ok(result.interpretations_evaluated >= 2);
  assert.ok(has(result, 'THREE_CONCEALED_PUNGS'));
  const location = result.decomposition.winning_component;
  assert.equal(location.kind, 'set');
  assert.equal(result.decomposition.sets[location.index].type, 'chow');
});

test('winning occurrence in pair vs chow is independently enumerated', () => {
  const input = standard([chow(0), pung(12), pung(23), pung(31)], 1, { declared: [1, 2, 3], winning_tile: 1 });
  const result = scoreHand(input);
  assert.equal(result.interpretations_evaluated, 2);
  assert.ok(result.waits.includes(1));
});

test('concealed kongs preserve hand concealment but are not tile hogs', () => {
  const input = standard([kong(1, true), chow(12), chow(21), chow(3)], 27, { declared: [], win_type: 'self_draw' });
  const result = scoreHand(input);
  assert.ok(has(result, 'FULLY_CONCEALED_HAND'));
  assert.ok(has(result, 'CONCEALED_KONG'));
  assert.ok(!has(result, 'TILE_HOG'));
  assert.equal(result.context.exposed_melds, 0);
  assert.ok(!findDecompositions(input).some(d => d.form === 'seven_pairs'));
});

test('one exposed and one concealed kong use individual kong fans', () => {
  const result = scoreHand(standard([kong(1), kong(12, true), chow(21), chow(3)], 27));
  assert.ok(has(result, 'MELDED_KONG') && has(result, 'CONCEALED_KONG'));
  assert.ok(!has(result, 'TWO_MELDED_KONGS') && !has(result, 'TWO_CONCEALED_KONGS'));
});

test('Four Kongs retains the explicit local exclusion of concealed-pung scores', () => {
  const result = scoreHand(standard([kong(1, true), kong(12, true), kong(23, true), kong(31, true)], 27));
  assert.ok(has(result, 'FOUR_KONGS'));
  for (const id of ['FOUR_CONCEALED_PUNGS', 'THREE_CONCEALED_PUNGS', 'TWO_CONCEALED_PUNGS', 'CONCEALED_KONG', 'SINGLE_WAIT']) {
    assert.ok(!has(result, id));
  }
});

test('double wind can score twice without suppressing an unrelated terminal pung', () => {
  const result = scoreHand(standard([pung(27), pung(0), chow(12), chow(22)], 31));
  assert.ok(has(result, 'PREVALENT_WIND') && has(result, 'SEAT_WIND'));
  assert.equal(count(result, 'PUNG_OF_TERMINALS_OR_HONORS'), 1);
  const generic = result.fans.find(fan => fan.id === 'PUNG_OF_TERMINALS_OR_HONORS');
  assert.equal(result.decomposition.sets[generic.sets[0]].tiles[0], 0);
});

test('a wind-group exclusion leaves a fourth unrelated terminal pung', () => {
  const result = scoreHand(standard([pung(27), pung(28), pung(29), pung(0)], 4));
  assert.ok(has(result, 'BIG_THREE_WINDS'));
  assert.equal(count(result, 'PUNG_OF_TERMINALS_OR_HONORS'), 1);
});

test('all-honor and mixed-honor hands cannot qualify for suited rank bands', () => {
  for (const input of [
    standard([pung(27), pung(28), pung(31), pung(32)], 33),
    standard([chow(6), chow(15), pung(25), pung(28)], 31)
  ]) {
    const result = scoreHand(input);
    for (const id of ['UPPER_TILES', 'MIDDLE_TILES', 'LOWER_TILES', 'UPPER_FOUR', 'LOWER_FOUR']) {
      assert.ok(!has(result, id));
    }
  }
});

test('Nine Gates suppresses one mandatory terminal pung, not both', () => {
  const result = scoreHand(state([0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 4], { win_type: 'self_draw' }));
  assert.equal(result.fan_points, 92);
  assert.equal(count(result, 'PUNG_OF_TERMINALS_OR_HONORS'), 1);
  assert.ok(!has(result, 'FULLY_CONCEALED_HAND'));
  assert.ok(has(result, 'SELF_DRAWN'));
});

test('nine distinct knitted tiles plus five honors earns Lesser and Knitted Straight', () => {
  const result = scoreHand(state([...knit, 27, 28, 29, 30, 31]));
  assert.equal(result.fan_points, 24);
  assert.deepEqual(ids(result), ['KNITTED_STRAIGHT', 'LESSER_HONORS_AND_KNITTED']);
});

test('knitted straight residual set can be declared, concealed, or a kong', () => {
  for (const meld of [pung(27), kong(27), kong(27, true)]) {
    const result = scoreHand(state([...knit, 31, 31], { melds: [meld] }));
    assert.ok(has(result, 'KNITTED_STRAIGHT'));
    assert.equal(result.decomposition.form, 'knitted_straight');
    for (const id of ['ALL_PUNGS', 'ALL_CHOWS', 'OUTSIDE_HAND', 'ALL_FIVES']) assert.ok(!has(result, id));
  }
});

test('honors-and-knitted must use a common suit permutation and distinct tiles', () => {
  for (const tiles of [
    [0, 3, 6, 9, 12, 15, 18, 27, 28, 29, 30, 31, 32, 33],
    [0, 0, 6, 10, 13, 16, 20, 27, 28, 29, 30, 31, 32, 33]
  ]) {
    assert.equal(scoreHand(state(tiles)).status, 'not_winning');
  }
});

test('all six knitted suit assignments are accepted', () => {
  const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  for (const order of orders) {
    const tiles = order.flatMap((offset, s) => [0, 3, 6].map(r => s * 9 + offset + r));
    assert.ok(has(scoreHand(state([...tiles, 27, 27, 27, 31, 31])), 'KNITTED_STRAIGHT'));
  }
});

test('a sole completion in the knitted component does not get an ordinary wait fan', () => {
  const result = scoreHand(state([...knit, 27, 27, 27, 31, 31], { winning_tile: 0 }));
  assert.deepEqual(result.waits, [0]);
  assert.equal(result.decomposition.winning_component.kind, 'knitted');
  assert.ok(!ids(result).some(id => ['EDGE_WAIT', 'CLOSED_WAIT', 'SINGLE_WAIT'].includes(id)));
});

test('the residual pair of a knitted straight can earn a sole pair wait', () => {
  const result = scoreHand(state([...knit, 27, 27, 27, 31, 31]));
  assert.deepEqual(result.waits, [31]);
  assert.ok(has(result, 'SINGLE_WAIT'));
});

test('two-sided and two-pung waits do not get single-tile wait points', () => {
  const open = [chow(9), chow(21), pung(28)];
  const twoSided = state([1, 2, 3, 31, 31], { melds: open, winning_tile: 3 });
  assert.deepEqual(winningTiles(twoSided), [0, 3]);
  const twoPung = state([0, 0, 0, 31, 31], { melds: open, winning_tile: 0 });
  assert.deepEqual(winningTiles(twoPung), [0, 31]);
  for (const input of [twoSided, twoPung]) {
    assert.ok(!ids(scoreHand(input)).some(id => ['EDGE_WAIT', 'CLOSED_WAIT', 'SINGLE_WAIT'].includes(id)));
  }
});

test('a sole completion assigned to either chow or pair earns only one wait fan', () => {
  const input = state([0, 1, 2, 2, 2], { melds: [chow(9), chow(21), pung(28)], winning_tile: 2 });
  assert.deepEqual(winningTiles(input), [2]);
  // The same sole tile completes either a chow or pair; choose one wait, never both.
  const result = scoreHand(input);
  assert.equal(result.fans.filter(fan => ['EDGE_WAIT', 'CLOSED_WAIT', 'SINGLE_WAIT'].includes(fan.id)).length, 1);
});

test('edge-shaped completion gets no wait fan when another tile can form pungs and pair', () => {
  const input = state([0, 0, 0, 1, 2], { melds: [chow(9), chow(21), pung(28)], winning_tile: 2 });
  assert.deepEqual(winningTiles(input), [1, 2]);
  assert.ok(!has(scoreHand(input), 'EDGE_WAIT'));
});

test('waits include alternate seven-pair and standard forms', () => {
  const input = state(pairs([0, 1, 2, 3, 4, 5, 6]), { winning_tile: 6 });
  assert.deepEqual(winningTiles(input), [0, 3, 6]);
  assert.ok(!has(scoreHand(input), 'SINGLE_WAIT'));
});

test('wait search does not allow a fifth physical copy in declared sets', () => {
  const input = state([1, 2, 3, 31, 31], {
    melds: [kong(0), chow(12), chow(21)], winning_tile: 3
  });
  assert.deepEqual(winningTiles(input), [3]);
});

test('structural waits are independent of events, flowers and eight-point qualification', () => {
  const input = fanFixtures.find(([id]) => id === 'CLOSED_WAIT')[1];
  assert.deepEqual(winningTiles(input), winningTiles({
    ...input, flowers_count: 8, flags: { robbing_the_kong: true, fourth_copy_visible: true }
  }));
});

test('robbing suppresses Last Tile even with public copies', () => {
  const input = fanFixtures.find(([id]) => id === 'ROBBING_THE_KONG')[1];
  const result = scoreHand({ ...input, flags: { robbing_the_kong: true, fourth_copy_visible: true } });
  assert.ok(has(result, 'ROBBING_THE_KONG'));
  assert.ok(!has(result, 'LAST_TILE'));
});

test('last draw and kong replacement may coexist and do not add Self Drawn', () => {
  const input = fanFixtures.find(([id]) => id === 'OUT_WITH_REPLACEMENT')[1];
  const result = scoreHand({ ...input, flags: { last_tile_draw: true, out_with_replacement: true } });
  assert.ok(has(result, 'LAST_TILE_DRAW') && has(result, 'OUT_WITH_REPLACEMENT'));
  assert.ok(!has(result, 'SELF_DRAWN'));
});

test('a valid but non-winning state never receives flowers or a success-shaped score', () => {
  const result = scoreHand(state([0, 0, 1, 3, 5, 7, 9, 11, 13, 15, 18, 20, 22, 24], { flowers_count: 8 }));
  assert.equal(result.status, 'not_winning');
  assert.equal(result.valid_win, false);
  assert.equal(result.total_points, null);
  assert.equal(result.flower_points, 0);
  assert.deepEqual(result.fans, []);
});

const valid = standard([chow(0), chow(12), chow(24), pung(28)], 31);
const invalidCases = [
  ['out-of-range tile', { ...valid, concealed_tiles: [34, 34], winning_tile: 34 }],
  ['fractional tile', { ...valid, concealed_tiles: [1.5, 31] }],
  ['sparse standing array', { ...valid, concealed_tiles: Array(2) }],
  ['sparse meld array', { ...valid, melds: Array(4) }],
  ['sparse meld tiles', { ...valid, melds: [{ ...chow(0), tiles: Array(3) }, ...valid.melds.slice(1)] }],
  ['wrong structural count', { ...valid, concealed_tiles: [31] }],
  ['winning tile only in meld', { ...valid, winning_tile: 0 }],
  ['fifth copy across kong and hand', { ...valid, melds: [kong(31), ...valid.melds.slice(1)] }],
  ['missing required wind', { ...valid, seat_wind: undefined }],
  ['invalid prevalent wind', { ...valid, prevalent_wind: 31 }],
  ['unknown win type', { ...valid, win_type: 'ron' }],
  ['negative flowers', { ...valid, flowers_count: -1 }],
  ['fractional flowers', { ...valid, flowers_count: 1.5 }],
  ['too many flowers', { ...valid, flowers_count: 9 }],
  ['unknown hand key', { ...valid, flower_count: 1 }],
  ['unknown flag key', { ...valid, flags: { last_draw: true } }],
  ['nonboolean flag', { ...valid, flags: { last_tile_claim: 'true' } }],
  ['null flags', { ...valid, flags: null }],
  ['self-draw flag on discard', { ...valid, flags: { last_tile_draw: true } }],
  ['discard flag on self-draw', { ...valid, win_type: 'self_draw', flags: { last_tile_claim: true } }],
  ['robbing on self-draw', { ...valid, win_type: 'self_draw', flags: { robbing_the_kong: true } }],
  ['robbing last discard', { ...valid, flags: { robbing_the_kong: true, last_tile_claim: true } }],
  ['robbing to complete a pair', { ...valid, flags: { robbing_the_kong: true } }],
  ['replacement without kong', { ...valid, win_type: 'self_draw', flags: { out_with_replacement: true } }],
  ['hidden second copy claimed visible', { ...valid, flags: { fourth_copy_visible: true } }],
  ['concealed declared chow', { ...valid, melds: [{ ...chow(0), concealed: true }, ...valid.melds.slice(1)] }],
  ['missing concealment', { ...valid, melds: [{ type: 'chow', tiles: [0, 1, 2] }, ...valid.melds.slice(1)] }],
  ['meld key typo', { ...valid, melds: [{ ...chow(0), conclealed: false }, ...valid.melds.slice(1)] }],
  ['claim outside meld', { ...valid, melds: [{ ...chow(0), claimed_tile: 3 }, ...valid.melds.slice(1)] }],
  ['claim on concealed kong', { ...valid, melds: [{ ...kong(0, true), claimed_tile: 0 }, ...valid.melds.slice(1)] }],
  ['suit-wrapping chow', { ...valid, melds: [{ ...chow(8) }, ...valid.melds.slice(1)] }],
  ['honor chow', { ...valid, melds: [{ ...chow(27) }, ...valid.melds.slice(1)] }],
  ['mixed pung', { ...valid, melds: [{ type: 'pung', tiles: [0, 0, 1], concealed: false }, ...valid.melds.slice(1)] }],
  ['three-tile kong', { ...valid, melds: [{ type: 'kong', tiles: [0, 0, 0], concealed: false }, ...valid.melds.slice(1)] }],
  ['null meld', { ...valid, melds: [null] }],
  ['five melds', { ...valid, melds: [...valid.melds, pung(32)] }],
  ['null state', null]
];
for (const [name, input] of invalidCases) {
  test(`rejects ${name} explicitly`, () => {
    assert.throws(() => scoreHand(input), error => error instanceof HandValidationError && error.issues.length > 0);
  });
}

test('input order, meld order and property order cannot change the result', () => {
  for (const [, input] of fanFixtures) {
    const snapshot = JSON.stringify(input);
    const result = scoreHand(input);
    const shuffled = {
      ...input, concealed_tiles: [...input.concealed_tiles].reverse(),
      melds: [...input.melds].reverse().map(meld => ({
        concealed: meld.concealed, tiles: [...meld.tiles].reverse(), type: meld.type
      }))
    };
    assert.deepEqual(scoreHand(shuffled), result);
    assert.equal(JSON.stringify(input), snapshot);
  }
});

test('normalization and scoring do not mutate frozen nested input', () => {
  const input = structuredClone(valid);
  const freeze = value => {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  };
  freeze(input);
  assert.doesNotThrow(() => scoreHand(input));
  assert.notEqual(validateHand(input).melds, input.melds);
});

test('a fourth visible copy may join a chow when the other copies are in an exposed pung', () => {
  const input = standard([pung(1), chow(0), chow(12), chow(24)], 27, {
    declared: [0, 2, 3], winning_tile: 1, flags: { fourth_copy_visible: true }
  });
  assert.ok(has(scoreHand(input), 'LAST_TILE'));
  assert.throws(() => scoreHand({ ...input, flags: { robbing_the_kong: true } }), /other three copies/);
});

const instance = (id, sets = []) => ({ id, sets, points: FANS[id].points });
test('asymmetric exclusions are symmetric, scoped, and not transitive', () => {
  const straight = instance('PURE_STRAIGHT', [0, 1, 2]);
  const contained = instance('SHORT_STRAIGHT', [0, 1]);
  const extra = instance('SHORT_STRAIGHT', [1, 3]);
  assert.equal(instancesConflict(straight, contained), true);
  assert.equal(instancesConflict(contained, straight), true);
  assert.equal(instancesConflict(straight, extra), false);
  assert.equal(instancesConflict(instance('FOUR_CONCEALED_PUNGS', [0, 1, 2, 3]), instance('SELF_DRAWN')), false);
});

test('non-identical fans cannot overlap, but disjoint repeated fans can score', () => {
  const a = instance('PURE_DOUBLE_CHOW', [0, 1]);
  assert.equal(instancesConflict(a, instance('PURE_DOUBLE_CHOW', [1, 2])), true);
  assert.equal(instancesConflict(a, instance('PURE_DOUBLE_CHOW', [2, 3])), false);
  assert.equal(selectFans([a, instance('PURE_DOUBLE_CHOW', [2, 3])]).points, 2);
});

test('Count-Once rejects hypercycles and third uses, not just pairwise conflicts', () => {
  const a = instance('PURE_DOUBLE_CHOW', [0, 1]);
  const b = instance('MIXED_DOUBLE_CHOW', [1, 2]);
  const c = instance('SHORT_STRAIGHT', [0, 2]);
  assert.ok(countOnceCompatible([a, b]));
  assert.equal(countOnceCompatible([a, b, c]), false);
  assert.equal(countOnceCompatible([
    a, instance('MIXED_DOUBLE_CHOW', [0, 2]), instance('SHORT_STRAIGHT', [0, 3])
  ]), false);
  assert.equal(countOnceCompatible([
    instance('PURE_STRAIGHT', [0, 1, 2]), instance('PURE_SHIFTED_CHOWS', [1, 2, 3])
  ]), false);
  assert.ok(countOnceCompatible([
    instance('PURE_STRAIGHT', [0, 1, 2]), instance('MIXED_DOUBLE_CHOW', [1, 3])
  ]));
});

test('exact optimization resolves a tied high-fan choice using the compatible total', () => {
  const candidates = [
    instance('SEVEN_PAIRS'),
    instance('UPPER_TILES'),
    instance('FULLY_CONCEALED_HAND')
  ];
  // Exercise the optimizer independently of structure-specific candidate generation.
  const optimized = selectFans(candidates);
  assert.equal(optimized.points, 28);
  assert.deepEqual(optimized.fans.map(fan => fan.id), ['FULLY_CONCEALED_HAND', 'UPPER_TILES']);
});

test('optimizer agrees with independent exhaustive subsets over a conflict/hypergraph fixture', () => {
  const pool = [
    instance('PURE_TRIPLE_CHOW', [0, 1, 2]),
    instance('PURE_DOUBLE_CHOW', [0, 1]),
    instance('PURE_DOUBLE_CHOW', [2, 3]),
    instance('MIXED_DOUBLE_CHOW', [0, 3]),
    instance('SHORT_STRAIGHT', [1, 3]),
    instance('TWO_TERMINAL_CHOWS', [2, 3]),
    instance('NO_HONORS'),
    instance('ALL_CHOWS')
  ];
  for (let n = 1; n <= pool.length; n++) {
    const candidates = pool.slice(0, n);
    let maximum = 0;
    for (let bits = 0; bits < 2 ** n; bits++) {
      const picked = candidates.filter((_, index) => bits & (1 << index));
      if (picked.some((a, i) => picked.slice(i + 1).some(b => instancesConflict(a, b)))) continue;
      if (!countOnceCompatible(picked)) continue;
      maximum = Math.max(maximum, picked.reduce((sum, fan) => sum + fan.points, 0));
    }
    const result = selectFans(candidates);
    assert.equal(result.points, maximum);
    assert.deepEqual(selectFans([...candidates].reverse()), result);
  }
});
