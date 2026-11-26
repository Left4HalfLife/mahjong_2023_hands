import { scoreHand, validateHand, HandValidationError } from './scorer.js';
import { TILES, searchTiles, tileLabel } from './tiles.js';
import { EXAMPLES } from './examples.js';

const $ = id => document.getElementById(id);
const flagNames = ['last_tile_draw', 'last_tile_claim', 'out_with_replacement', 'robbing_the_kong', 'fourth_copy_visible'];
let standing = [];
let melds = [];
let draft = [];

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function message(text, error = true) {
  const node = $('input-message');
  node.textContent = text;
  node.className = error ? 'error' : 'notice';
  node.hidden = !text;
}

function invalidate() {
  $('result-content').replaceChildren(element('p', 'Hand changed. Calculate points to see the updated result.', 'hint'));
  message('');
}

function tileNode(id, onClick, action = 'Add') {
  const tile = TILES[id];
  const node = element(onClick ? 'button' : 'span', undefined, `tile ${tile.className}`);
  node.append(element('span', tile.face, 'face'), element('span', tile.code, 'code'));
  node.title = tileLabel(id);
  if (onClick) {
    node.type = 'button';
    node.setAttribute('aria-label', `${action} ${tileLabel(id)}`);
    node.addEventListener('click', onClick);
  } else node.setAttribute('aria-label', tileLabel(id));
  return node;
}

function currentHand() {
  return {
    concealed_tiles: [...standing],
    melds: structuredClone(melds),
    winning_tile: $('winning-tile').value === '' ? null : Number($('winning-tile').value),
    win_type: $('win-type').value,
    seat_wind: Number($('seat-wind').value),
    prevalent_wind: Number($('prevalent-wind').value),
    flowers_count: $('flowers-count').value === '' ? null : Number($('flowers-count').value),
    flags: Object.fromEntries(flagNames.map(name => [name, $(name).checked]))
  };
}

function renderPalette() {
  const physical = [...standing, ...melds.flatMap(meld => meld.tiles), ...draft];
  const matches = searchTiles($('tile-search').value);
  const target = $('entry-target').value;
  $('tile-palette').replaceChildren(...matches.map(tile => {
    const remaining = 4 - physical.filter(id => id === tile.id).length;
    const node = tileNode(tile.id, () => {
      invalidate();
      if (target === 'standing') standing.push(tile.id);
      else draft.push(tile.id);
      renderHand(target === 'standing' ? tile.id : undefined);
    });
    node.disabled = remaining <= 0 || (target === 'standing'
      ? standing.length + 3 * melds.length >= 14
      : draft.length >= (target === 'kong' ? 4 : 3) || melds.length >= 4);
    node.append(element('span', `${remaining} left`, 'remaining'));
    return node;
  }));
  $('search-empty').hidden = matches.length > 0;
}

function renderHand(preferredWin) {
  const previous = preferredWin ?? ($('winning-tile').value === '' ? undefined : Number($('winning-tile').value));
  const unique = [...new Set(standing)].sort((a, b) => a - b);
  $('winning-tile').replaceChildren(...unique.map(id => new Option(tileLabel(id), String(id))));
  if (!unique.length) $('winning-tile').append(new Option('Add standing tiles first', ''));
  if (unique.includes(previous)) $('winning-tile').value = String(previous);
  $('standing-tiles').replaceChildren(...standing.map((id, index) => tileNode(id, () => {
    standing.splice(index, 1);
    invalidate();
    renderHand();
  }, 'Remove')));
  if (!standing.length) $('standing-tiles').append(element('p', 'No standing tiles selected.', 'hint'));
  $('declared-melds').replaceChildren(...melds.map((meld, index) => {
    const row = element('div', undefined, 'meld');
    const heading = element('div', undefined, 'meld-heading');
    const remove = element('button', 'Remove');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove declared ${meld.type} ${index + 1}`);
    remove.addEventListener('click', () => {
      melds.splice(index, 1);
      invalidate();
      renderHand();
    });
    heading.append(element('strong', `${index + 1}. ${meld.type} - ${meld.concealed ? 'concealed' : 'exposed'}`), remove);
    const tiles = element('div', undefined, 'tile-row');
    tiles.append(...meld.tiles.map(id => tileNode(id)));
    row.append(heading, tiles);
    return row;
  }));
  if (!melds.length) $('declared-melds').append(element('p', 'No declarations. All standing sets start concealed.', 'hint'));
  $('draft-tiles').replaceChildren(...draft.map((id, index) => tileNode(id, () => {
    draft.splice(index, 1);
    renderHand();
  }, 'Remove draft')));
  const slots = standing.length + 3 * melds.length;
  const physical = standing.length + melds.reduce((sum, meld) => sum + meld.tiles.length, 0);
  $('tile-count').textContent = `${slots}/14 slots, ${physical} physical tiles`;
  $('meld-draft').hidden = $('entry-target').value === 'standing';
  $('concealed-kong-label').hidden = $('entry-target').value !== 'kong';
  renderPalette();
}

function sourceControls() {
  let cleared = false;
  for (const node of document.querySelectorAll('[data-source]')) {
    node.disabled = node.dataset.source !== $('win-type').value;
    if (node.disabled && node.checked) {
      node.checked = false;
      cleared = true;
    }
  }
  return cleared;
}

function loadHand(input) {
  const hand = validateHand(input);
  standing = [...hand.concealed_tiles];
  melds = structuredClone(hand.melds);
  draft = [];
  $('entry-target').value = 'standing';
  $('tile-search').value = '';
  $('win-type').value = hand.win_type;
  $('seat-wind').value = String(hand.seat_wind);
  $('prevalent-wind').value = String(hand.prevalent_wind);
  $('flowers-count').value = String(hand.flowers_count);
  for (const flag of flagNames) $(flag).checked = hand.flags[flag];
  sourceControls();
  invalidate();
  renderHand(hand.winning_tile);
  $('hand-json').value = JSON.stringify(hand, null, 2);
}

function displayResult(result) {
  const output = $('result-content');
  output.replaceChildren();
  const context = result.context;
  output.append(element('p', `${context.win_type === 'self_draw' ? 'Self-drawn' : 'Won by discard / robbed kong'}: ${tileLabel(context.winning_tile)}`));
  output.append(element('p', `${context.exposed_melds} exposed declaration(s). Seat: ${TILES[context.seat_wind].name}; prevalent: ${TILES[context.prevalent_wind].name}.`, 'hint'));
  if (result.status === 'not_winning') {
    output.append(element('p', 'Not a winning structure. Check the selected tiles and declared sets.', 'error'));
    return;
  }
  const score = element('p', String(result.total_points), 'score');
  score.append(element('small', ' total points'));
  output.append(score, element('p', `${result.fan_points} fan points + ${result.flower_points} flower points`, 'hint'));
  output.append(element('p', result.valid_win
    ? 'Qualifies: at least 8 points before flowers.'
    : 'Below minimum: flowers do not make this a legal win.', result.valid_win ? 'success' : 'notice'));
  output.append(element('p', `Structural winning tiles: ${result.waits.map(id => TILES[id].code).join(', ')}.`, 'hint'));
  const table = element('table', undefined, 'fan-table');
  const head = element('thead');
  const header = element('tr');
  header.append(element('th', 'Awarded fan'), element('th', 'Points'));
  head.append(header);
  table.append(head);
  const body = element('tbody');
  for (const fan of result.fans) {
    const row = element('tr');
    const label = element('td', fan.id.toLowerCase().replaceAll('_', ' '));
    let support = fan.sets.length ? `Sets ${fan.sets.map(index => index + 1).join(', ')}` : 'Whole hand / event';
    if (fan.tile !== undefined) support = tileLabel(fan.tile);
    if (fan.id === 'FLOWER_TILES') support = `${fan.count} flowers / seasons (excluded from minimum)`;
    label.append(element('small', support));
    row.append(label, element('td', String(fan.points)));
    body.append(row);
  }
  table.append(body);
  output.append(table);
  const decomposition = result.decomposition;
  const details = element('details');
  details.open = true;
  details.append(element('summary', `Chosen interpretation: ${decomposition.form.replaceAll('_', ' ')}`));
  decomposition.sets.forEach((set, index) => {
    const row = element('div', undefined, 'component');
    const origin = set.declared ? (set.concealed ? 'declared concealed' : 'declared exposed') : 'standing set';
    const status = set.concealed ? 'concealed' : (set.completed_by_win ? 'discard-completed, effectively exposed' : 'exposed');
    row.append(element('p', `Set ${index + 1}: ${set.type} - ${origin}; ${status}${set.completed_by_win ? ' (winning tile here)' : ''}`, 'hint'));
    const tiles = element('div', undefined, 'tile-row');
    tiles.append(...set.tiles.map(id => tileNode(id)));
    row.append(tiles);
    details.append(row);
  });
  if (decomposition.pair !== undefined) {
    details.append(element('p', `Pair: ${TILES[decomposition.pair].code} - ${decomposition.pair_concealed ? 'concealed' : 'discard-completed'}.`, 'hint'));
  }
  if (decomposition.pairs) {
    details.append(element('p', `Pairs: ${decomposition.pairs.map(id => TILES[id].code).join(', ')}. No declared sets; ${context.win_type === 'self_draw' ? 'all self-drawn/concealed' : `the winning ${TILES[context.winning_tile].code} pair was discard-completed`}.`, 'hint'));
  }
  if (decomposition.knitted) {
    details.append(element('p', `Concealed knitted tiles: ${decomposition.knitted.map(id => TILES[id].code).join(', ')}.`, 'hint'));
  }
  if (decomposition.honors) {
    details.append(element('p', `Standing honors: ${decomposition.honors.map(id => TILES[id].code).join(', ')}.`, 'hint'));
  }
  if (decomposition.form === 'thirteen_orphans') {
    details.append(element('p', 'All 13 terminals/honors plus the indicated duplicate; no declared sets.', 'hint'));
  }
  const location = decomposition.winning_component;
  const componentName = location.kind === 'set' ? `set ${location.index + 1}`
    : location.kind === 'pairs' ? `pair ${location.index + 1}` : location.kind;
  details.append(element('p', `Winning occurrence assigned to ${componentName}; ${context.win_type === 'self_draw' ? 'self-drawn and concealed' : 'discard-completed'}.`, 'hint'));
  details.append(element('p', `${result.interpretations_evaluated} partition/placement interpretation(s) evaluated. Only this interpretation contributes points.`, 'hint'));
  output.append(details);
  const raw = element('details');
  raw.append(element('summary', 'Full scoring result JSON'), element('pre', JSON.stringify(result, null, 2)));
  output.append(raw);
}

function calculate() {
  invalidate();
  if (draft.length) {
    message('Finish or clear the declared-set draft before calculating.');
    return;
  }
  try {
    displayResult(scoreHand(currentHand()));
  } catch (error) {
    if (!(error instanceof HandValidationError)) {
      message('Unexpected scoring error. See the browser console for details.');
      throw error;
    }
    message(error.issues.join('\n'));
  }
}

$('tile-search').addEventListener('input', renderPalette);
$('entry-target').addEventListener('change', () => {
  const discarded = draft.length > 0;
  draft = [];
  renderHand();
  if (discarded) message('The unfinished declaration draft was cleared when changing its type.', false);
});
$('clear-draft').addEventListener('click', () => { draft = []; renderHand(); message(''); });
$('add-meld').addEventListener('click', () => {
  const type = $('entry-target').value;
  const tiles = [...draft].sort((a, b) => a - b);
  const expected = type === 'kong' ? 4 : 3;
  if (tiles.length !== expected) return message(`Select ${expected} tiles for this ${type}.`);
  const legal = type === 'chow'
    ? tiles[2] < 27 && Math.floor(tiles[0] / 9) === Math.floor(tiles[2] / 9)
      && tiles[1] === tiles[0] + 1 && tiles[2] === tiles[0] + 2
    : tiles.every(tile => tile === tiles[0]);
  if (!legal) return message('A chow must be consecutive in one suit; a pung or kong must use identical tiles.');
  if (standing.length + 3 * (melds.length + 1) > 14 || melds.length === 4) {
    return message('This declaration would exceed 14 structural slots. Remove standing tiles first.');
  }
  melds.push({ type, tiles, concealed: type === 'kong' && $('concealed-kong').checked });
  draft = [];
  invalidate();
  renderHand();
});
for (const id of ['winning-tile', 'seat-wind', 'prevalent-wind', 'flowers-count', ...flagNames]) {
  $(id).addEventListener('change', invalidate);
}
$('flowers-count').addEventListener('input', invalidate);
$('win-type').addEventListener('change', () => {
  invalidate();
  if (sourceControls()) message('Incompatible event flags were cleared for the new win source.', false);
});
$('score-hand').addEventListener('click', calculate);
$('clear-hand').addEventListener('click', () => {
  standing = [];
  melds = [];
  draft = [];
  $('entry-target').value = 'standing';
  $('tile-search').value = '';
  $('flowers-count').value = '0';
  for (const flag of flagNames) $(flag).checked = false;
  invalidate();
  renderHand();
  $('hand-json').value = '';
});
$('export-json').addEventListener('click', () => {
  $('hand-json').value = JSON.stringify(currentHand(), null, 2);
  if (draft.length) message('JSON contains the current hand only; the unfinished declaration draft is not included.', false);
});
$('import-json').addEventListener('click', () => {
  try {
    loadHand(JSON.parse($('hand-json').value));
  } catch (error) {
    if (!(error instanceof SyntaxError) && !(error instanceof HandValidationError)) throw error;
    message(`Could not load JSON: ${error.message}`);
  }
});
$('example').replaceChildren(...EXAMPLES.map((example, index) => new Option(example.name, String(index))));
$('load-example').addEventListener('click', () => {
  loadHand(EXAMPLES[Number($('example').value)].hand);
  calculate();
});
for (const id of ['seat-wind', 'prevalent-wind']) {
  $(id).replaceChildren(...TILES.slice(27, 31).map(tile => new Option(`${tile.name} (${tile.pinyin})`, String(tile.id))));
}
loadHand(EXAMPLES[0].hand);
calculate();
