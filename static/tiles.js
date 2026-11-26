const numerals = ['yī', 'èr', 'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ'];
const suits = [
  { code: 'm', name: 'Characters', chinese: '万', pinyin: 'wàn', className: 'characters' },
  { code: 's', name: 'Bamboo', chinese: '条', pinyin: 'tiáo', className: 'bamboo' },
  { code: 'p', name: 'Dots', chinese: '筒', pinyin: 'tǒng', className: 'dots' }
];
const honors = [
  ['E', 'East wind', '东', 'dōng fēng'],
  ['S', 'South wind', '南', 'nán fēng'],
  ['W', 'West wind', '西', 'xī fēng'],
  ['N', 'North wind', '北', 'běi fēng'],
  ['R', 'Red dragon', '中', 'hóng zhōng'],
  ['G', 'Green dragon', '发', 'lǜ fā'],
  ['Wh', 'White dragon', '白', 'bái bǎn']
];
export const TILES = Object.freeze([
  ...suits.flatMap((suit, suitIndex) => numerals.map((numeral, index) => Object.freeze({
    id: suitIndex * 9 + index, code: `${index + 1}${suit.code}`,
    name: `${index + 1} ${suit.name}`, face: `${index + 1}${suit.chinese}`,
    pinyin: `${numeral} ${suit.pinyin}`, className: suit.className
  }))),
  ...honors.map(([code, name, face, pinyin], index) => Object.freeze({
    id: 27 + index, code, name, face, pinyin, className: 'honors'
  }))
]);

const normalize = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/u:|v/g, 'u').trim();
export function searchTiles(query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return TILES.filter(tile => {
    const text = normalize(`${tile.code} ${tile.name} ${tile.face} ${tile.pinyin}`);
    return terms.every(term => text.includes(term));
  });
}
export const tileLabel = id => `${TILES[id].code} (${TILES[id].name}, ${TILES[id].pinyin})`;
