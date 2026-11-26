const base = {
  melds: [], win_type: 'discard', seat_wind: 27, prevalent_wind: 27,
  flowers_count: 0, flags: {}
};
export const EXAMPLES = [
  {
    name: 'Concealed straight, self-drawn - 25 points',
    hand: {
      ...base, concealed_tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8, 18, 19, 20, 22, 22],
      winning_tile: 22, win_type: 'self_draw'
    }
  },
  {
    name: 'Seven Pairs with a Tile Hog - 32 points',
    hand: {
      ...base, concealed_tiles: [0, 0, 0, 0, 4, 4, 10, 10, 19, 19, 27, 27, 31, 31],
      winning_tile: 31
    }
  },
  {
    name: 'Thirteen Orphans, discard - 88 points',
    hand: {
      ...base, concealed_tiles: [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33, 27],
      winning_tile: 27
    }
  },
  {
    name: 'Four pungs, discard completes a pung',
    hand: {
      ...base, concealed_tiles: [1, 1, 1, 12, 12, 12, 23, 23, 23, 31, 31, 31, 27, 27],
      winning_tile: 31
    }
  },
  {
    name: 'Knitted Straight with a concealed kong',
    hand: {
      ...base, concealed_tiles: [0, 3, 6, 10, 13, 16, 20, 23, 26, 31, 31],
      melds: [{ type: 'kong', tiles: [27, 27, 27, 27], concealed: true }],
      winning_tile: 31, win_type: 'self_draw', flags: { out_with_replacement: true }
    }
  },
  {
    name: 'Below minimum: 7 fan + 8 flowers (not a legal win)',
    hand: {
      ...base, concealed_tiles: [28, 28], winning_tile: 28, flowers_count: 8,
      melds: [
        { type: 'chow', tiles: [0, 1, 2], concealed: false },
        { type: 'chow', tiles: [13, 14, 15], concealed: false },
        { type: 'chow', tiles: [19, 20, 21], concealed: false },
        { type: 'pung', tiles: [26, 26, 26], concealed: false }
      ]
    }
  }
];
