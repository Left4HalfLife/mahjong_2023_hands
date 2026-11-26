export const RULE_PROFILE = 'workspace-2023-v1';

const scopedFans = new Set([
  'BIG_FOUR_WINDS', 'BIG_THREE_DRAGONS', 'LITTLE_FOUR_WINDS',
  'LITTLE_THREE_DRAGONS', 'BIG_THREE_WINDS', 'TWO_DRAGONS',
  'FOUR_KONGS', 'THREE_KONGS', 'TWO_CONCEALED_KONGS', 'TWO_MELDED_KONGS',
  'FOUR_CONCEALED_PUNGS', 'THREE_CONCEALED_PUNGS', 'TWO_CONCEALED_PUNGS',
  'DRAGON_PUNG', 'PREVALENT_WIND', 'SEAT_WIND', 'PUNG_OF_TERMINALS_OR_HONORS',
  'CONCEALED_KONG', 'MELDED_KONG'
]);
const relationalFans = new Set([
  'PURE_TERMINAL_CHOWS', 'QUADRUPLE_CHOW', 'FOUR_PURE_SHIFTED_PUNGS',
  'FOUR_SHIFTED_CHOWS', 'PURE_TRIPLE_CHOW', 'PURE_SHIFTED_PUNGS',
  'PURE_STRAIGHT', 'THREE_SUITED_TERMINAL_CHOWS', 'PURE_SHIFTED_CHOWS',
  'TRIPLE_PUNG', 'MIXED_STRAIGHT', 'MIXED_TRIPLE_CHOW', 'MIXED_SHIFTED_PUNGS',
  'MIXED_SHIFTED_CHOWS', 'DOUBLE_PUNG', 'PURE_DOUBLE_CHOW', 'MIXED_DOUBLE_CHOW',
  'SHORT_STRAIGHT', 'TWO_TERMINAL_CHOWS'
]);

const fanRows = [
  ['BIG_FOUR_WINDS', 88, 'BIG_THREE_WINDS ALL_PUNGS PREVALENT_WIND SEAT_WIND PUNG_OF_TERMINALS_OR_HONORS'],
  ['BIG_THREE_DRAGONS', 88, 'LITTLE_THREE_DRAGONS TWO_DRAGONS DRAGON_PUNG'],
  ['ALL_GREEN', 88, 'SEVEN_PAIRS HALF_FLUSH ONE_VOIDED_SUIT'],
  ['NINE_GATES', 88, 'FULL_FLUSH HALF_FLUSH CONCEALED_HAND FULLY_CONCEALED_HAND ONE_VOIDED_SUIT NO_HONORS'],
  ['FOUR_KONGS', 88, 'THREE_KONGS TWO_CONCEALED_KONGS TWO_MELDED_KONGS CONCEALED_KONG MELDED_KONG ALL_PUNGS SINGLE_WAIT FOUR_CONCEALED_PUNGS THREE_CONCEALED_PUNGS TWO_CONCEALED_PUNGS'],
  ['SEVEN_SHIFTED_PAIRS', 88, 'SEVEN_PAIRS FULL_FLUSH HALF_FLUSH CONCEALED_HAND FULLY_CONCEALED_HAND ONE_VOIDED_SUIT NO_HONORS'],
  ['THIRTEEN_ORPHANS', 88, 'ALL_TERMINALS_AND_HONORS ALL_TYPES OUTSIDE_HAND CONCEALED_HAND FULLY_CONCEALED_HAND SINGLE_WAIT'],
  ['ALL_TERMINALS', 64, 'ALL_TERMINALS_AND_HONORS SEVEN_PAIRS TRIPLE_PUNG ALL_PUNGS OUTSIDE_HAND DOUBLE_PUNG PUNG_OF_TERMINALS_OR_HONORS NO_HONORS'],
  ['LITTLE_FOUR_WINDS', 64, 'BIG_THREE_WINDS PUNG_OF_TERMINALS_OR_HONORS'],
  ['LITTLE_THREE_DRAGONS', 64, 'TWO_DRAGONS DRAGON_PUNG'],
  ['ALL_HONORS', 64, 'ALL_TERMINALS_AND_HONORS SEVEN_PAIRS ALL_PUNGS HALF_FLUSH OUTSIDE_HAND ONE_VOIDED_SUIT PUNG_OF_TERMINALS_OR_HONORS'],
  ['FOUR_CONCEALED_PUNGS', 64, 'THREE_CONCEALED_PUNGS TWO_CONCEALED_PUNGS ALL_PUNGS CONCEALED_HAND FULLY_CONCEALED_HAND'],
  ['PURE_TERMINAL_CHOWS', 64, 'FULL_FLUSH HALF_FLUSH ALL_CHOWS PURE_DOUBLE_CHOW TWO_TERMINAL_CHOWS ONE_VOIDED_SUIT NO_HONORS'],
  ['QUADRUPLE_CHOW', 48, 'PURE_TRIPLE_CHOW TILE_HOG PURE_DOUBLE_CHOW'],
  ['FOUR_PURE_SHIFTED_PUNGS', 48, 'PURE_SHIFTED_PUNGS ALL_PUNGS'],
  ['FOUR_SHIFTED_CHOWS', 32, 'PURE_SHIFTED_CHOWS SHORT_STRAIGHT TWO_TERMINAL_CHOWS'],
  ['THREE_KONGS', 32, 'TWO_CONCEALED_KONGS TWO_MELDED_KONGS CONCEALED_KONG MELDED_KONG'],
  ['ALL_TERMINALS_AND_HONORS', 32, 'SEVEN_PAIRS ALL_PUNGS OUTSIDE_HAND PUNG_OF_TERMINALS_OR_HONORS'],
  ['SEVEN_PAIRS', 24, 'ALL_GREEN ALL_TERMINALS ALL_HONORS ALL_TERMINALS_AND_HONORS ALL_EVEN UPPER_TILES MIDDLE_TILES LOWER_TILES UPPER_FOUR LOWER_FOUR OUTSIDE_HAND CONCEALED_HAND FULLY_CONCEALED_HAND SINGLE_WAIT'],
  ['GREATER_HONORS_AND_KNITTED', 24, 'LESSER_HONORS_AND_KNITTED ALL_TYPES CONCEALED_HAND FULLY_CONCEALED_HAND'],
  ['ALL_EVEN', 24, 'SEVEN_PAIRS ALL_PUNGS ALL_SIMPLES NO_HONORS'],
  ['FULL_FLUSH', 24, 'HALF_FLUSH ONE_VOIDED_SUIT NO_HONORS'],
  ['PURE_TRIPLE_CHOW', 24, 'PURE_DOUBLE_CHOW'],
  ['PURE_SHIFTED_PUNGS', 24, ''],
  ['UPPER_TILES', 24, 'SEVEN_PAIRS UPPER_FOUR NO_HONORS'],
  ['MIDDLE_TILES', 24, 'SEVEN_PAIRS ALL_SIMPLES NO_HONORS'],
  ['LOWER_TILES', 24, 'SEVEN_PAIRS LOWER_FOUR NO_HONORS'],
  ['PURE_STRAIGHT', 16, 'SHORT_STRAIGHT TWO_TERMINAL_CHOWS'],
  ['THREE_SUITED_TERMINAL_CHOWS', 16, 'ALL_CHOWS MIXED_DOUBLE_CHOW TWO_TERMINAL_CHOWS NO_HONORS'],
  ['PURE_SHIFTED_CHOWS', 16, ''],
  ['ALL_FIVES', 16, 'ALL_SIMPLES NO_HONORS'],
  ['TRIPLE_PUNG', 16, 'ALL_TERMINALS DOUBLE_PUNG'],
  ['THREE_CONCEALED_PUNGS', 16, 'TWO_CONCEALED_PUNGS'],
  ['LESSER_HONORS_AND_KNITTED', 12, 'ALL_TYPES CONCEALED_HAND FULLY_CONCEALED_HAND'],
  ['UPPER_FOUR', 12, 'SEVEN_PAIRS NO_HONORS'],
  ['KNITTED_STRAIGHT', 12, ''],
  ['LOWER_FOUR', 12, 'SEVEN_PAIRS NO_HONORS'],
  ['BIG_THREE_WINDS', 12, 'PUNG_OF_TERMINALS_OR_HONORS'],
  ['MIXED_STRAIGHT', 8, ''],
  ['REVERSIBLE_TILES', 8, 'ONE_VOIDED_SUIT'],
  ['MIXED_TRIPLE_CHOW', 8, 'MIXED_DOUBLE_CHOW'],
  ['MIXED_SHIFTED_PUNGS', 8, ''],
  ['CHICKEN_HAND', 8, ''],
  ['LAST_TILE_DRAW', 8, 'SELF_DRAWN'],
  ['LAST_TILE_CLAIM', 8, ''],
  ['OUT_WITH_REPLACEMENT', 8, 'SELF_DRAWN'],
  ['ROBBING_THE_KONG', 8, 'LAST_TILE'],
  ['ALL_PUNGS', 6, ''],
  ['HALF_FLUSH', 6, 'ALL_GREEN ONE_VOIDED_SUIT'],
  ['MIXED_SHIFTED_CHOWS', 6, ''],
  ['ALL_TYPES', 6, ''],
  ['MELDED_HAND', 6, 'SINGLE_WAIT'],
  ['TWO_CONCEALED_KONGS', 6, 'CONCEALED_KONG'],
  ['TWO_DRAGONS', 6, 'DRAGON_PUNG'],
  ['OUTSIDE_HAND', 4, 'SEVEN_PAIRS'],
  ['FULLY_CONCEALED_HAND', 4, 'CONCEALED_HAND SELF_DRAWN'],
  ['TWO_MELDED_KONGS', 4, 'MELDED_KONG'],
  ['LAST_TILE', 4, ''],
  ['DRAGON_PUNG', 2, ''],
  ['PREVALENT_WIND', 2, 'PUNG_OF_TERMINALS_OR_HONORS'],
  ['SEAT_WIND', 2, 'PUNG_OF_TERMINALS_OR_HONORS'],
  ['CONCEALED_HAND', 2, ''],
  ['ALL_CHOWS', 2, 'NO_HONORS'],
  ['TILE_HOG', 2, 'QUADRUPLE_CHOW'],
  ['DOUBLE_PUNG', 2, ''],
  ['TWO_CONCEALED_PUNGS', 2, ''],
  ['CONCEALED_KONG', 2, ''],
  ['ALL_SIMPLES', 2, 'NO_HONORS'],
  ['PURE_DOUBLE_CHOW', 1, ''],
  ['MIXED_DOUBLE_CHOW', 1, ''],
  ['SHORT_STRAIGHT', 1, ''],
  ['TWO_TERMINAL_CHOWS', 1, ''],
  ['PUNG_OF_TERMINALS_OR_HONORS', 1, ''],
  ['MELDED_KONG', 1, ''],
  ['ONE_VOIDED_SUIT', 1, ''],
  ['NO_HONORS', 1, ''],
  ['EDGE_WAIT', 1, 'CLOSED_WAIT SINGLE_WAIT'],
  ['CLOSED_WAIT', 1, 'EDGE_WAIT SINGLE_WAIT'],
  ['SINGLE_WAIT', 1, 'EDGE_WAIT CLOSED_WAIT'],
  ['SELF_DRAWN', 1, ''],
  ['FLOWER_TILES', 1, '']
];

export const FANS = Object.freeze(Object.fromEntries(fanRows.map(([id, points, excludes]) => [
  id, Object.freeze({
    id, points,
    excludes: Object.freeze(excludes.split(' ').filter(Boolean)),
    scoped: scopedFans.has(id) || relationalFans.has(id),
    relational: relationalFans.has(id)
  })
])));

const suit = tile => Math.floor(tile / 9);
const rank = tile => tile % 9 + 1;
const suited = tile => tile < 27;
const terminal = tile => suited(tile) && (rank(tile) === 1 || rank(tile) === 9);
const orphan = tile => tile >= 27 || terminal(tile);
const wind = tile => tile >= 27 && tile <= 30;
const green = new Set([10, 11, 12, 14, 16, 32]);
const reversible = new Set([10, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 25, 26, 33]);
const orphans = Array.from({ length: 34 }, (_, i) => i).filter(orphan);
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const numeric = (a, b) => a - b;
const tileId = value => Number.isInteger(value) && value >= 0 && value < 34;
const tileArray = value => Array.isArray(value) && Array.from(value).every(tileId);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const allEqual = values => values.every(value => value === values[0]);
const countsOf = tiles => {
  const counts = Array(34).fill(0);
  for (const tile of tiles) counts[tile]++;
  return counts;
};
const physicalTiles = state => [...state.concealed_tiles, ...state.melds.flatMap(meld => meld.tiles)];
const flagNames = [
  'last_tile_draw', 'last_tile_claim', 'out_with_replacement',
  'robbing_the_kong', 'fourth_copy_visible'
];

export class HandValidationError extends Error {
  constructor(issues) {
    super(issues.join('; '));
    this.name = 'HandValidationError';
    this.issues = [...issues];
  }
}

export function validateHand(input) {
  const issues = [];
  const fail = message => issues.push(message);
  const knownKeys = (value, keys, path) => {
    for (const key of Object.keys(value)) {
      if (!keys.includes(key)) fail(`${path}.${key}: unknown field`);
    }
  };
  if (!object(input)) throw new HandValidationError(['hand: expected an object']);
  knownKeys(input, [
    'concealed_tiles', 'melds', 'winning_tile', 'win_type', 'seat_wind',
    'prevalent_wind', 'flowers_count', 'flags'
  ], 'hand');
  if (!tileArray(input.concealed_tiles)) {
    fail('concealed_tiles: expected an array of integer tile IDs 0..33');
  }
  if (!Array.isArray(input.melds) || input.melds.length > 4) {
    fail('melds: expected an array of at most four declared sets');
  } else {
    Array.from(input.melds).forEach((meld, index) => {
      const path = `melds[${index}]`;
      if (!object(meld)) return fail(`${path}: expected an object`);
      knownKeys(meld, ['type', 'tiles', 'concealed', 'claimed_tile'], path);
      if (!['chow', 'pung', 'kong'].includes(meld.type)) fail(`${path}.type: invalid set type`);
      if (typeof meld.concealed !== 'boolean') fail(`${path}.concealed: expected boolean`);
      if (meld.concealed && meld.type !== 'kong') fail(`${path}: only a declared kong may be concealed`);
      if (!tileArray(meld.tiles)) {
        fail(`${path}.tiles: expected tile IDs 0..33`);
        return;
      }
      const tiles = [...meld.tiles].sort(numeric);
      if (tiles.length !== (meld.type === 'kong' ? 4 : 3)) fail(`${path}: incorrect tile count`);
      if (meld.type === 'chow' && !(tiles.length === 3 && tiles.every(suited)
          && suit(tiles[0]) === suit(tiles[2])
          && tiles[1] === tiles[0] + 1 && tiles[2] === tiles[0] + 2)) {
        fail(`${path}: chow must be three consecutive tiles in one suit`);
      }
      if (['pung', 'kong'].includes(meld.type) && !allEqual(tiles)) {
        fail(`${path}: pung/kong tiles must be identical`);
      }
      if (meld.claimed_tile !== undefined
          && (!tileId(meld.claimed_tile) || !tiles.includes(meld.claimed_tile) || meld.concealed)) {
        fail(`${path}.claimed_tile: must belong to an exposed meld`);
      }
    });
  }
  if (!tileId(input.winning_tile)) fail('winning_tile: expected a tile ID 0..33');
  if (!['self_draw', 'discard'].includes(input.win_type)) fail('win_type: expected self_draw or discard');
  for (const key of ['seat_wind', 'prevalent_wind']) {
    if (!Number.isInteger(input[key]) || !wind(input[key])) fail(`${key}: expected a wind ID 27..30`);
  }
  const flowers = input.flowers_count === undefined ? 0 : input.flowers_count;
  if (!Number.isInteger(flowers) || flowers < 0 || flowers > 8) fail('flowers_count: expected an integer 0..8');
  const flags = input.flags === undefined ? {} : input.flags;
  if (!object(flags)) fail('flags: expected an object');
  else {
    knownKeys(flags, flagNames, 'flags');
    for (const name of flagNames) {
      if (flags[name] !== undefined && typeof flags[name] !== 'boolean') fail(`flags.${name}: expected boolean`);
    }
  }
  if (issues.length) throw new HandValidationError(issues.sort(compare));
  const state = {
    concealed_tiles: [...input.concealed_tiles].sort(numeric),
    melds: input.melds.map(meld => ({
      type: meld.type, tiles: [...meld.tiles].sort(numeric), concealed: meld.concealed,
      ...(meld.claimed_tile === undefined ? {} : { claimed_tile: meld.claimed_tile })
    })).sort((a, b) => compare(JSON.stringify(a), JSON.stringify(b))),
    winning_tile: input.winning_tile,
    win_type: input.win_type,
    seat_wind: input.seat_wind,
    prevalent_wind: input.prevalent_wind,
    flowers_count: flowers,
    flags: Object.fromEntries(flagNames.map(name => [name, flags[name] ?? false]))
  };
  if (state.concealed_tiles.length + 3 * state.melds.length !== 14) {
    fail('hand: concealed_tiles.length + 3 * melds.length must equal 14');
  }
  for (const [tile, count] of countsOf(physicalTiles(state)).entries()) {
    if (count > 4) fail(`tile ${tile}: exceeds four physical copies`);
  }
  if (!state.concealed_tiles.includes(state.winning_tile)) fail('winning_tile: must occur in concealed_tiles');
  for (const name of ['last_tile_draw', 'out_with_replacement']) {
    if (state.flags[name] && state.win_type !== 'self_draw') fail(`flags.${name}: requires self_draw`);
  }
  for (const name of ['last_tile_claim', 'robbing_the_kong']) {
    if (state.flags[name] && state.win_type !== 'discard') fail(`flags.${name}: requires discard`);
  }
  if (state.flags.last_tile_claim && state.flags.robbing_the_kong) fail('flags: last claim and robbing are mutually exclusive');
  if (state.flags.robbing_the_kong
      && physicalTiles(state).filter(tile => tile === state.winning_tile).length !== 1) {
    fail('flags.robbing_the_kong: the other three copies must belong to the opponent\'s pung');
  }
  if (state.flags.out_with_replacement && !state.melds.some(meld => meld.type === 'kong')) {
    fail('flags.out_with_replacement: requires a declared kong');
  }
  if (state.flags.fourth_copy_visible
      && (state.concealed_tiles.filter(tile => tile === state.winning_tile).length > 1
        || state.melds.some(meld => meld.concealed && meld.tiles.includes(state.winning_tile)))) {
    fail('flags.fourth_copy_visible: another copy is concealed');
  }
  if (issues.length) throw new HandValidationError(issues.sort(compare));
  return state;
}

function combinations(values, count) {
  const result = [];
  function visit(start, picked) {
    if (picked.length === count) {
      result.push([...picked]);
      return;
    }
    for (let i = start; i <= values.length - (count - picked.length); i++) {
      picked.push(values[i]);
      visit(i + 1, picked);
      picked.pop();
    }
  }
  visit(0, []);
  return result;
}

const knittedPatterns = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]
].map(order => order.flatMap((offset, s) => [0, 3, 6].map(r => s * 9 + offset + r)));

function ordinaryPartitions(counts, setCount) {
  const results = [];
  function sets(remaining, picked, pair) {
    const first = remaining.findIndex(count => count > 0);
    if (first < 0) {
      if (picked.length === setCount) results.push({ sets: [...picked], pair });
      return;
    }
    if (picked.length >= setCount) return;
    if (remaining[first] >= 3) {
      remaining[first] -= 3;
      picked.push({ type: 'pung', tiles: [first, first, first], concealed: true, declared: false });
      sets(remaining, picked, pair);
      picked.pop();
      remaining[first] += 3;
    }
    if (suited(first) && rank(first) <= 7 && remaining[first + 1] && remaining[first + 2]) {
      for (const tile of [first, first + 1, first + 2]) remaining[tile]--;
      picked.push({ type: 'chow', tiles: [first, first + 1, first + 2], concealed: true, declared: false });
      sets(remaining, picked, pair);
      picked.pop();
      for (const tile of [first, first + 1, first + 2]) remaining[tile]++;
    }
  }
  for (let pair = 0; pair < 34; pair++) {
    if (counts[pair] < 2) continue;
    const remaining = [...counts];
    remaining[pair] -= 2;
    sets(remaining, [], pair);
  }
  return results;
}

function enumerateStructures(state) {
  const counts = countsOf(state.concealed_tiles);
  const declared = state.melds.map(meld => ({ ...meld, declared: true }));
  const structures = ordinaryPartitions(counts, 4 - declared.length).map(partition => ({
    form: 'standard', sets: [...declared, ...partition.sets], pair: partition.pair
  }));
  if (declared.length === 0) {
    if (counts.every(count => count % 2 === 0)) {
      structures.push({
        form: 'seven_pairs', sets: [],
        pairs: counts.flatMap((count, tile) => Array(count / 2).fill(tile))
      });
    }
    if (orphans.every(tile => counts[tile] >= 1)
        && counts.every((count, tile) => !count || orphan(tile))) {
      structures.push({ form: 'thirteen_orphans', sets: [], pair: counts.findIndex(count => count === 2) });
    }
    if (counts.every(count => count <= 1)) {
      for (const pattern of knittedPatterns) {
        if (!state.concealed_tiles.every(tile => tile >= 27 || pattern.includes(tile))) continue;
        const honors = state.concealed_tiles.filter(tile => tile >= 27);
        if (honors.length >= 5 && honors.length <= 7) {
          structures.push({
            form: 'honors_knitted', sets: [], honors,
            knitted: state.concealed_tiles.filter(suited), pattern: [...pattern]
          });
        }
      }
    }
  }
  if (declared.length <= 1) {
    for (const pattern of knittedPatterns) {
      if (!pattern.every(tile => counts[tile] >= 1)) continue;
      const remaining = [...counts];
      for (const tile of pattern) remaining[tile]--;
      for (const partition of ordinaryPartitions(remaining, 1 - declared.length)) {
        structures.push({
          form: 'knitted_straight', sets: [...declared, ...partition.sets],
          pair: partition.pair, knitted: [...pattern]
        });
      }
    }
  }
  return [...new Map(structures.map(value => [JSON.stringify(value), value])).entries()]
    .sort(([a], [b]) => compare(a, b)).map(([, value]) => value);
}

export function findDecompositions(input) {
  return enumerateStructures(validateHand(input));
}

function structuralWaits(state) {
  const standing = [...state.concealed_tiles];
  standing.splice(standing.indexOf(state.winning_tile), 1);
  const physicalCounts = countsOf([...standing, ...state.melds.flatMap(meld => meld.tiles)]);
  const waits = [];
  for (let tile = 0; tile < 34; tile++) {
    if (physicalCounts[tile] === 4) continue;
    if (enumerateStructures({ ...state, concealed_tiles: [...standing, tile].sort(numeric) }).length) {
      waits.push(tile);
    }
  }
  return waits;
}

export function winningTiles(input) {
  return structuralWaits(validateHand(input));
}

function assignWinningTile(structure, state) {
  const locations = [];
  structure.sets.forEach((set, index) => {
    if (!set.declared && set.tiles.includes(state.winning_tile)) locations.push({ kind: 'set', index });
  });
  if (structure.pair === state.winning_tile) locations.push({ kind: 'pair' });
  if (structure.pairs) {
    structure.pairs.forEach((tile, index) => {
      if (tile === state.winning_tile) locations.push({ kind: 'pairs', index });
    });
  }
  if (structure.knitted?.includes(state.winning_tile)) locations.push({ kind: 'knitted' });
  if (structure.honors?.includes(state.winning_tile)) locations.push({ kind: 'honors' });
  if (structure.form === 'thirteen_orphans' && structure.pair !== state.winning_tile) {
    locations.push({ kind: 'orphans' });
  }
  return locations.map(location => ({
    ...structure,
    sets: structure.sets.map((set, index) => ({
      ...set,
      tiles: [...set.tiles],
      completed_by_win: location.kind === 'set' && location.index === index,
      concealed: set.concealed && !(state.win_type === 'discard'
        && location.kind === 'set' && location.index === index)
    })),
    winning_component: location,
    pair_concealed: !(state.win_type === 'discard' && ['pair', 'pairs'].includes(location.kind))
  }));
}

function instanceKey(instance) {
  return `${instance.id}:${instance.sets.join('.')}:${instance.tile ?? ''}`;
}

function detectFans(state, structure, waits) {
  const found = new Map();
  const add = (id, sets = [], tile) => {
    const instance = { id, points: FANS[id].points, sets: [...sets].sort(numeric) };
    if (tile !== undefined) instance.tile = tile;
    found.set(instanceKey(instance), instance);
  };
  const tiles = physicalTiles(state);
  const counts = countsOf(tiles);
  const suits = new Set(tiles.filter(suited).map(suit));
  const hasHonors = tiles.some(tile => tile >= 27);
  const sets = structure.sets.map((set, index) => ({
    ...set, index, first: set.tiles[0], suit: suit(set.tiles[0]), rank: rank(set.tiles[0])
  }));
  const chows = sets.filter(set => set.type === 'chow');
  const pungs = sets.filter(set => set.type !== 'chow');
  const kongs = sets.filter(set => set.type === 'kong');
  const standard = structure.form === 'standard';
  const allTiles = predicate => tiles.every(predicate);
  const indices = group => group.map(set => set.index);
  const addGroups = (id, group, n) => {
    for (const picked of combinations(group, n)) add(id, indices(picked));
  };
  const range = (low, high) => allTiles(tile => suited(tile) && rank(tile) >= low && rank(tile) <= high);

  if (allTiles(tile => green.has(tile))) add('ALL_GREEN');
  if (allTiles(tile => reversible.has(tile))) add('REVERSIBLE_TILES');
  if (suits.size === 1) add(hasHonors ? 'HALF_FLUSH' : 'FULL_FLUSH');
  if (suits.size > 0 && suits.size < 3) add('ONE_VOIDED_SUIT');
  if (!hasHonors) add('NO_HONORS');
  if (suits.size === 3 && tiles.some(wind) && tiles.some(tile => tile >= 31)) add('ALL_TYPES');
  if (range(2, 8)) add('ALL_SIMPLES');
  if (range(7, 9)) add('UPPER_TILES');
  if (range(4, 6)) add('MIDDLE_TILES');
  if (range(1, 3)) add('LOWER_TILES');
  if (range(6, 9)) add('UPPER_FOUR');
  if (range(1, 4)) add('LOWER_FOUR');

  if (structure.form === 'seven_pairs') {
    add('SEVEN_PAIRS');
    const pairs = structure.pairs;
    if (suits.size === 1 && !hasHonors && new Set(pairs).size === 7 && pairs[6] - pairs[0] === 6) {
      add('SEVEN_SHIFTED_PAIRS');
    }
  }
  if (structure.form === 'thirteen_orphans') add('THIRTEEN_ORPHANS');
  if (structure.form === 'honors_knitted') {
    add(structure.honors.length === 7 ? 'GREATER_HONORS_AND_KNITTED' : 'LESSER_HONORS_AND_KNITTED');
    if (structure.knitted.length === 9) add('KNITTED_STRAIGHT');
  }
  if (structure.form === 'knitted_straight') add('KNITTED_STRAIGHT');

  let nineGates = false;
  if (standard) {
    if (pungs.length === 4) {
      add('ALL_PUNGS');
      if (allTiles(terminal)) add('ALL_TERMINALS');
      if (allTiles(tile => tile >= 27)) add('ALL_HONORS');
      if (allTiles(orphan) && hasHonors && suits.size > 0) add('ALL_TERMINALS_AND_HONORS');
      if (allTiles(tile => suited(tile) && rank(tile) % 2 === 0)) add('ALL_EVEN');
    }
    if (chows.length === 4 && suited(structure.pair)) add('ALL_CHOWS');
    if (sets.every(set => set.tiles.some(orphan)) && orphan(structure.pair)) add('OUTSIDE_HAND');
    if (sets.every(set => set.tiles.some(tile => suited(tile) && rank(tile) === 5))
        && suited(structure.pair) && rank(structure.pair) === 5) add('ALL_FIVES');
    if (!state.melds.length && suits.size === 1 && !hasHonors) {
      const offset = [...suits][0] * 9;
      nineGates = [3, 1, 1, 1, 1, 1, 1, 1, 3].every((count, i) => counts[offset + i] >= count);
      if (nineGates) add('NINE_GATES');
    }
    if (chows.length === 4 && suited(structure.pair) && rank(structure.pair) === 5) {
      const starts = chows.map(set => set.rank).sort(numeric);
      if (starts.join(',') === '1,1,7,7') {
        if (suits.size === 1) add('PURE_TERMINAL_CHOWS', indices(chows));
        const chowSuits = [...new Set(chows.map(set => set.suit))];
        if (chowSuits.length === 2 && !chowSuits.includes(suit(structure.pair))
            && chowSuits.every(s => chows.filter(set => set.suit === s).map(set => set.rank).sort(numeric).join(',') === '1,7')) {
          add('THREE_SUITED_TERMINAL_CHOWS', indices(chows));
        }
      }
    }
  }

  const windPungs = pungs.filter(set => wind(set.first));
  const dragonPungs = pungs.filter(set => set.first >= 31);
  addGroups('BIG_FOUR_WINDS', windPungs, 4);
  addGroups('BIG_THREE_WINDS', windPungs, 3);
  addGroups('BIG_THREE_DRAGONS', dragonPungs, 3);
  addGroups('TWO_DRAGONS', dragonPungs, 2);
  if (standard && windPungs.length === 3 && wind(structure.pair)) add('LITTLE_FOUR_WINDS', indices(windPungs));
  if (standard && dragonPungs.length === 2 && structure.pair >= 31) add('LITTLE_THREE_DRAGONS', indices(dragonPungs));
  let suppressedNineGatesPung = false;
  for (const set of pungs) {
    if (set.first >= 31) add('DRAGON_PUNG', [set.index]);
    if (set.first === state.prevalent_wind) add('PREVALENT_WIND', [set.index]);
    if (set.first === state.seat_wind) add('SEAT_WIND', [set.index]);
    if (terminal(set.first) || (wind(set.first) && set.first !== state.seat_wind && set.first !== state.prevalent_wind)) {
      if (nineGates && terminal(set.first) && !suppressedNineGatesPung) suppressedNineGatesPung = true;
      else add('PUNG_OF_TERMINALS_OR_HONORS', [set.index]);
    }
  }
  const concealedPungs = pungs.filter(set => set.concealed);
  const concealedPungTier = {
    2: 'TWO_CONCEALED_PUNGS', 3: 'THREE_CONCEALED_PUNGS', 4: 'FOUR_CONCEALED_PUNGS'
  }[concealedPungs.length];
  if (concealedPungTier) add(concealedPungTier, indices(concealedPungs));
  // Count tiers describe the entire inventory, not arbitrarily chosen subsets.
  if (kongs.length >= 3) add(kongs.length === 4 ? 'FOUR_KONGS' : 'THREE_KONGS', indices(kongs));
  else if (kongs.length === 2 && kongs.every(set => set.concealed)) add('TWO_CONCEALED_KONGS', indices(kongs));
  else if (kongs.length === 2 && kongs.every(set => !set.concealed)) add('TWO_MELDED_KONGS', indices(kongs));
  else for (const set of kongs) add(set.concealed ? 'CONCEALED_KONG' : 'MELDED_KONG', [set.index]);
  for (let tile = 0; tile < 34; tile++) {
    if (counts[tile] === 4 && !kongs.some(set => set.first === tile)) add('TILE_HOG', [], tile);
  }

  for (const group of combinations(chows, 2)) {
    const [a, b] = group;
    const support = indices(group);
    if (a.suit === b.suit && a.rank === b.rank) add('PURE_DOUBLE_CHOW', support);
    if (a.suit !== b.suit && a.rank === b.rank) add('MIXED_DOUBLE_CHOW', support);
    if (a.suit === b.suit && Math.abs(a.rank - b.rank) === 3) add('SHORT_STRAIGHT', support);
    if (a.suit === b.suit && [a.rank, b.rank].sort(numeric).join(',') === '1,7') add('TWO_TERMINAL_CHOWS', support);
  }
  for (const group of combinations(chows, 3)) {
    const ranks = group.map(set => set.rank).sort(numeric);
    const suitCount = new Set(group.map(set => set.suit)).size;
    const sameRanks = allEqual(ranks);
    const step = ranks[1] - ranks[0];
    const progression = ranks[2] - ranks[1] === step;
    const support = indices(group);
    if (suitCount === 1) {
      if (sameRanks) add('PURE_TRIPLE_CHOW', support);
      if (ranks.join(',') === '1,4,7') add('PURE_STRAIGHT', support);
      if (progression && (step === 1 || step === 2)) add('PURE_SHIFTED_CHOWS', support);
    }
    if (suitCount === 3) {
      if (sameRanks) add('MIXED_TRIPLE_CHOW', support);
      if (ranks.join(',') === '1,4,7') add('MIXED_STRAIGHT', support);
      if (progression && step === 1) add('MIXED_SHIFTED_CHOWS', support);
    }
  }
  if (chows.length === 4 && new Set(chows.map(set => set.suit)).size === 1) {
    const ranks = chows.map(set => set.rank).sort(numeric);
    if (allEqual(ranks)) add('QUADRUPLE_CHOW', indices(chows));
    const step = ranks[1] - ranks[0];
    if ((step === 1 || step === 2) && ranks.every((r, i) => r === ranks[0] + step * i)) {
      add('FOUR_SHIFTED_CHOWS', indices(chows));
    }
  }
  const suitedPungs = pungs.filter(set => suited(set.first));
  for (const group of combinations(suitedPungs, 2)) {
    if (group[0].suit !== group[1].suit && group[0].rank === group[1].rank) add('DOUBLE_PUNG', indices(group));
  }
  for (const group of combinations(suitedPungs, 3)) {
    const ranks = group.map(set => set.rank).sort(numeric);
    const suitCount = new Set(group.map(set => set.suit)).size;
    if (suitCount === 3 && allEqual(ranks)) add('TRIPLE_PUNG', indices(group));
    if (ranks[1] === ranks[0] + 1 && ranks[2] === ranks[1] + 1) {
      if (suitCount === 1) add('PURE_SHIFTED_PUNGS', indices(group));
      if (suitCount === 3) add('MIXED_SHIFTED_PUNGS', indices(group));
    }
  }
  if (suitedPungs.length === 4 && new Set(suitedPungs.map(set => set.suit)).size === 1) {
    const ranks = suitedPungs.map(set => set.rank).sort(numeric);
    if (ranks.every((r, i) => r === ranks[0] + i)) add('FOUR_PURE_SHIFTED_PUNGS', indices(suitedPungs));
  }

  if (['standard', 'knitted_straight'].includes(structure.form)) {
    if (state.melds.every(meld => meld.concealed)) {
      add(state.win_type === 'self_draw' ? 'FULLY_CONCEALED_HAND' : 'CONCEALED_HAND');
    }
    if (state.melds.length === 4 && state.melds.every(meld => !meld.concealed) && state.win_type === 'discard') {
      add('MELDED_HAND');
    }
    if (waits.length === 1 && waits[0] === state.winning_tile) {
      const location = structure.winning_component;
      if (location.kind === 'pair') add('SINGLE_WAIT');
      if (location.kind === 'set') {
        const completed = sets[location.index];
        if (completed.type === 'chow') {
          if (state.winning_tile === completed.first + 1) add('CLOSED_WAIT');
          if ((completed.rank === 1 && rank(state.winning_tile) === 3)
              || (completed.rank === 7 && rank(state.winning_tile) === 7)) add('EDGE_WAIT');
        }
      }
    }
  }
  if (state.win_type === 'self_draw') add('SELF_DRAWN');
  for (const [flag, id] of [
    ['last_tile_draw', 'LAST_TILE_DRAW'], ['last_tile_claim', 'LAST_TILE_CLAIM'],
    ['out_with_replacement', 'OUT_WITH_REPLACEMENT'], ['robbing_the_kong', 'ROBBING_THE_KONG'],
    ['fourth_copy_visible', 'LAST_TILE']
  ]) {
    if (state.flags[flag]) add(id);
  }
  return [...found.values()].sort((a, b) => compare(instanceKey(a), instanceKey(b)));
}

export function instancesConflict(a, b) {
  if (a.id === 'CHICKEN_HAND' || b.id === 'CHICKEN_HAND') {
    return a.id !== 'FLOWER_TILES' && b.id !== 'FLOWER_TILES';
  }
  if (a.id === b.id) {
    if (a.id === 'TILE_HOG') return a.tile === b.tile;
    return !a.sets.length || !b.sets.length || a.sets.some(index => b.sets.includes(index));
  }
  const excludes = (parent, child) => FANS[parent.id].excludes.includes(child.id)
    && (!FANS[parent.id].scoped || !FANS[child.id].scoped
      || child.sets.every(index => parent.sets.includes(index)));
  return excludes(a, b) || excludes(b, a);
}

export function countOnceCompatible(instances) {
  const parents = new Map();
  const degree = new Map();
  const root = vertex => {
    if (!parents.has(vertex)) parents.set(vertex, vertex);
    let value = vertex;
    while (parents.get(value) !== value) value = parents.get(value);
    return value;
  };
  for (const instance of instances) {
    if (!FANS[instance.id].relational) continue;
    const roots = instance.sets.map(root);
    // Reconnecting two vertices in the same component closes an incidence cycle.
    if (new Set(roots).size !== roots.length) return false;
    for (const index of instance.sets) {
      degree.set(index, (degree.get(index) ?? 0) + 1);
      if (degree.get(index) > 2) return false;
    }
    for (const vertex of roots.slice(1)) parents.set(vertex, roots[0]);
  }
  return true;
}

export function selectFans(candidates) {
  const ordered = [...candidates].sort((a, b) => b.points - a.points || compare(instanceKey(a), instanceKey(b)));
  const conflicts = ordered.map(a => ordered.map(b => instancesConflict(a, b)));
  let best = { points: -1, fans: [], key: '' };
  function visit(available, chosen, points) {
    const upper = points + available.reduce((sum, index) => sum + ordered[index].points, 0);
    if (upper < best.points) return;
    if (!available.length) {
      const fans = chosen.map(index => ordered[index]).sort((a, b) => compare(instanceKey(a), instanceKey(b)));
      const key = fans.map(instanceKey).join('|');
      if (points > best.points || (points === best.points && compare(key, best.key) < 0)) {
        best = { points, fans, key };
      }
      return;
    }
    const [next, ...rest] = available;
    const selected = [...chosen, next];
    if (countOnceCompatible(selected.map(index => ordered[index]))) {
      visit(rest.filter(index => !conflicts[next][index]), selected, points + ordered[next].points);
    }
    visit(rest, chosen, points);
  }
  visit(ordered.map((_, index) => index), [], 0);
  return best;
}

export function scoreHand(input) {
  const state = validateHand(input);
  const structures = enumerateStructures(state);
  const waits = structuralWaits(state);
  const context = {
    win_type: state.win_type, winning_tile: state.winning_tile,
    seat_wind: state.seat_wind, prevalent_wind: state.prevalent_wind,
    exposed_melds: state.melds.filter(meld => !meld.concealed).length,
    flowers_count: state.flowers_count, flags: { ...state.flags }
  };
  const base = { rules_profile: RULE_PROFILE, context, waits };
  if (!structures.length) {
    return {
      ...base, status: 'not_winning', valid_win: false,
      fan_points: 0, flower_points: 0, total_points: null,
      fans: [], decomposition: null, interpretations_evaluated: 0
    };
  }
  let best = null;
  let interpretations = 0;
  for (const structure of structures) {
    for (const assigned of assignWinningTile(structure, state)) {
      interpretations++;
      const result = selectFans(detectFans(state, assigned, waits));
      const key = `${result.key}|${JSON.stringify(assigned)}`;
      if (!best || result.points > best.points || (result.points === best.points && compare(key, best.key) < 0)) {
        best = { ...result, key, decomposition: assigned };
      }
    }
  }
  if (best.points === 0) {
    best = { ...best, points: 8, fans: [{ id: 'CHICKEN_HAND', points: 8, sets: [] }] };
  }
  const fans = best.fans.map(fan => ({ ...fan, sets: [...fan.sets], count: 1 }));
  if (state.flowers_count) {
    fans.push({ id: 'FLOWER_TILES', points: state.flowers_count, count: state.flowers_count, sets: [] });
  }
  return {
    ...base, status: best.points >= 8 ? 'winning' : 'below_minimum',
    valid_win: best.points >= 8, fan_points: best.points,
    flower_points: state.flowers_count, total_points: best.points + state.flowers_count,
    fans, decomposition: best.decomposition, interpretations_evaluated: interpretations
  };
}
