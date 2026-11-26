# Mahjong hand scorer

A deterministic, dependency-free JavaScript scorer with a searchable tile-entry
page, served by Flask. Implements the workspace's **`workspace-2023-v1`** profile:
read [the rules](RULES.md) and [the complete ambiguity audit](RULES_AUDIT.md).
This project is not independently certified MIL 2023 tournament software.

## Run

With Python 3.11+:

```sh
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python app.py
```

Open <http://localhost:8000>. Or use Docker Engine and the Compose v2 plugin:

```sh
docker compose up --build -d
docker compose down
```

Compose binds to `127.0.0.1:8000` by default; set `PORT` to change the host port.
The container uses Gunicorn and a non-root user. This is a local deployment,
not a hosted public service.

## Enter a hand

Select tiles from the on-screen list; search by English, Pinyin (with or without
tones), Chinese, or short codes (`1m`, `2s`, `3p`, `E`, `R`, etc.). Set the entry
target to standing tiles or to a declared chow/pung/kong. Standing tiles
**include the winning tile**, even on discard; identify it with the winning-tile
selector. Only declared kongs can be concealed.

Choose self-draw/discard, seat and prevalent winds, flowers, and applicable win
events. The result shows points, the 8-point qualification separately from
flowers, all structural winning tiles, and the chosen interpretation with
declared openness and effective concealment. Built-in examples and an editable
JSON input support repeatable experiments.

## Scoring reference and example

Open **Show scoring table** on the page to browse all 81 fans, their conditions,
points, and exclusions without leaving your hand. The interface renders the
[same Markdown tables in RULES.md](RULES.md#4-mil-2023-fan-table--exclusions), so
there is no separate website copy to maintain.

> 🀇🀈🀉 🀊🀋🀌 🀍🀎🀏 🀙🀚🀛 🀝🀝

`123m 456m 789m 123p 55p` — **self-drawn on 🀝 (5p)**, all sets and the pair
concealed, no declarations, no flowers, no event flags, East seat/prevalent wind.

| Awarded fan | Points |
| --- | ---: |
| Pure Straight | 16 |
| Fully Concealed Hand | 4 |
| All Chows | 2 |
| Mixed Double Chow | 1 |
| One Voided Suit | 1 |
| Single Wait | 1 |
| **Total** | **25** |

This exceeds the 8-point minimum before flowers. Winning the same hand by
discard gives **23** instead, because Concealed Hand (2) replaces Fully Concealed
Hand (4). The expanded reference explains the example and exclusion rules.

## JavaScript API

`static/scorer.js` is an ES module usable directly in a browser or Node.js 20+.
It does not use the DOM, network, clock, randomness, Python, or any AI dependency.

```js
import { scoreHand } from './static/scorer.js';

const result = scoreHand({
  concealed_tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8, 18, 19, 20, 22, 22],
  melds: [],
  winning_tile: 22,
  win_type: 'self_draw',
  seat_wind: 27,
  prevalent_wind: 27,
  flowers_count: 0,
  flags: {}
});
console.log(result.status, result.fan_points, result.fans);
```

Tile IDs are 0–8 characters, 9–17 bamboo, 18–26 dots; 27–30
east/south/west/north; 31–33 red/green/white dragon. The complete input and
output contracts and event assumptions are in [RULES.md](RULES.md#5-normative-executable-clarifications).
`validateHand` throws `HandValidationError` with individual `issues`.
`winningTiles` accepts a complete input state and returns structural waits after
removing its winning tile; it does not apply the minimum score.

## Checks

```sh
npm test
python -m unittest discover -s tests -p 'test_*.py'
```

Node's built-in runner requires no npm installation. The JavaScript suite covers
every fan, invalid inputs, exclusions, ambiguous placements, alternative forms,
waits, flowers, and exact combination optimization. Flask tests check the served
page, static module, health endpoint, and rendered reference tables. Documentation
checks compare all fan table values/exclusions and the Unicode example against
the JavaScript engine.
