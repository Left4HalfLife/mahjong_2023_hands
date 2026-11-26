# Chinese Official Mahjong (MCR — MIL 2023) Ruleset Specification
### Source: [https://mahjong.wikidot.com/rules:chinese-official-scoring](https://mahjong.wikidot.com/rules:chinese-official-scoring)

**Executable project profile: `workspace-2023-v1`.** The original workspace
specification is preserved below, with explicit corrections and a normative
implementation contract in section 5. This is a local interpretation, not a
claim of MIL certification. Where shorthand below is ambiguous, section 5
takes precedence. See [RULES_AUDIT.md](RULES_AUDIT.md) for the decisions and their
implementation.

## 1. Tile Domain & Algebraic Model

### 1.1 Tile Universe ($T$)
Non-flower tiles are indexed on $T = \{0, 1, \dots, 33\}$:

* **Suited Tiles ($S$):** $t \in \{0, \dots, 26\}$
  * Suit ID: $s = \lfloor t / 9 \rfloor \in \{0, 1, 2\}$, where $0 = \text{Characters (Man)}$, $1 = \text{Bamboo (Sou)}$, $2 = \text{Dots (Pin)}$.
  * Rank: $r = (t \bmod 9) + 1 \in \{1, \dots, 9\}$.
* **Honor Tiles ($H$):** $t \in \{27, \dots, 33\}$
  * Winds ($W$): $27 = \text{East}$, $28 = \text{South}$, $29 = \text{West}$, $30 = \text{North}$.
  * Dragons ($G$): $31 = \text{Red}$, $32 = \text{Green}$, $33 = \text{White}$.

### 1.2 Derived Tile Subsets
* **Terminals ($Term$):** $\{t \in S \mid r(t) \in \{1, 9\}\} = \{0, 8, 9, 17, 18, 26\}$.
* **Simples ($Simp$):** $\{t \in S \mid 2 \le r(t) \le 8\}$.
* **Orphans ($Orph$):** $Term \cup H$.
* **Green Tiles ($Green$):** $\{10, 11, 12, 14, 16, 32\}$ (`2s, 3s, 4s, 6s, 8s, Green Dragon`).
* **Reversible Tiles ($Rev$):** $\{10, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 25, 26, 33\}$ (`2s, 4s, 5s, 6s, 8s, 9s, 1p, 2p, 3p, 4p, 5p, 8p, 9p, White Dragon`).

---

## 2. Hand Representation & Structural Rules

### 2.1 Hand State
A complete winning hand state consists of:
* `concealed_tiles`: array of tile IDs in $T$ currently in the concealed hand (including the winning tile).
* `melds`: array of $M$ declared melds ($0 \le M \le 4$), each with:
  * `type`: `"chow" | "pung" | "kong"`
  * `tiles`: array of tile IDs in $T$ (length 3 for chow/pung, length 4 for kong)
  * `concealed`: boolean (`true` for concealed kong, `false` for claimed/melded sets)
  * `claimed_tile`: optional tile ID in $T$ if claimed from discard/kong
* `winning_tile`: tile ID in $T$ completing the winning hand.
* `win_type`: `"self_draw" | "discard"`.
* `seat_wind`: tile ID in $W$ (`27..30`).
* `prevalent_wind`: tile ID in $W$ (`27..30`).
* `flowers_count`: integer from 0 through 8 (flowers and seasons together).
* `flags`:
  * `last_tile_draw`: boolean
  * `last_tile_claim`: boolean
  * `out_with_replacement`: boolean
  * `robbing_the_kong`: boolean
  * `fourth_copy_visible`: boolean (all 3 other copies of `winning_tile` are visible to all players)

### 2.2 Structural Constraints
1. **Tile Count Invariant:** $\text{len}(\text{concealed\_tiles}) + 3M = 14$ (each kong occupies 3 slots in the 4-set-plus-pair structure while retaining all 4 copies in `tiles`).
2. **Copy Cap:** For every $t \in T$, total occurrences across `concealed_tiles` and all `melds[*].tiles` is at most $4$.
3. **Winning Tile Membership:** `winning_tile` is present in `concealed_tiles`, including when won by discard. Declared melds are already complete and never contain the completing occurrence.
4. **Concealed-Only Irregular Hands:** `SEVEN_PAIRS`, `THIRTEEN_ORPHANS`, `GREATER_HONORS_AND_KNITTED`, `LESSER_HONORS_AND_KNITTED`, and `NINE_GATES` require $M = 0$, including no concealed kongs.

### 2.3 Winning Decompositions
* **Standard Form:** 4 sets (`chow`, `pung`, or `kong`) + 1 pair (2 identical tiles in $T$).
  * When `win_type == "discard"`, the set or pair containing `winning_tile` is treated as exposed (`concealed = false`) for concealed-pung/kong counts, while `melds` count remains unchanged for `CONCEALED_HAND`. If `winning_tile` can be placed into more than one valid set/pair in a decomposition, evaluate each candidate placement and keep the highest-scoring assignment.
* **Irregular Forms (require $M = 0$):**
  * **Seven Pairs:** 7 pairs of tiles from $T$ (4 copies of one tile may form two pairs, subject to `TILE_HOG` rules).
  * **Thirteen Orphans:** All 13 distinct tiles in $Orph$ plus any 1 additional tile from $Orph$.
  * **Knitted Tiles:** Distinct tiles (at most 1 per tile ID) selected from a suit-to-knitted-group assignment (`{1,4,7}`, `{2,5,8}`, `{3,6,9}` across the 3 suits) and honors $H$.

---

## 3. Scoring Principles & Conflict Resolution

### 3.1 Minimum Score & Flowers
* **8-Point Minimum:** A hand must score at least **8 points** excluding `FLOWER_TILES` to be a valid winning hand.
* **Flower Tiles:** Worth **1 point each** (`flowers_count`), added after the 8-point minimum check and never counted toward reaching the 8-point minimum.

### 3.2 Five Counting Principles
1. **Non-Repeat Principle:** If a fan is implied or subsumed by another scored fan, do not score it separately.
2. **Non-Separation Principle:** Once tiles are decomposed into sets/pairs for a winning structure, do not re-split or re-group those tiles into different sets to score another fan.
3. **Non-Identical Principle:** Two instances of the same set-based fan cannot reuse the exact same set(s) or overlap on the same set indices.
4. **Freedom to Choose:** When multiple decompositions or non-conflicting fan subsets are valid, choose the valid combination that maximizes total points.
5. **Count-Once Principle:** Sets combined to form a multi-set fan cannot be arbitrarily chained into unlimited further multi-set combinations; any remaining combination involving an already-used set is restricted to a single additional combination without re-chaining across already-paired sets.

### 3.3 Wait Detection Rule
* Let $H_{13}$ be the 13-tile standing hand after removing one copy of `winning_tile` from `concealed_tiles` (keeping `melds` fixed).
* Compute the winning tile set $W_{13} = \{x \in T \mid H_{13} \cup \{x\} \text{ forms at least one valid 14-tile winning decomposition}\}$.
* A single-tile wait fan (`EDGE_WAIT`, `CLOSED_WAIT`, `SINGLE_WAIT`) is eligible **only if** $|W_{13}| = 1$ (and $W_{13} = \{\text{winning\_tile}\}$):
  * `EDGE_WAIT` (1): `winning_tile` completes a `123` chow on `3` or a `789` chow on `7` as the sole completion.
  * `CLOSED_WAIT` (1): `winning_tile` completes the middle tile `r+1` of `r, r+1, r+2` as the sole completion.
  * `SINGLE_WAIT` (1): `winning_tile` completes the pair as the sole completion.

---

<!-- scoring-reference:start -->

## 4. MIL 2023 Fan Table & Exclusions

This is the `workspace-2023-v1` project profile, not independently certified MIL
scoring. Each row lists the fan, its points, its condition, and its explicit
exclusions. Section 5 governs symmetric/scoped exclusions, inventory tiers, and
Count-Once; compatible points are not simply the sum of all matching rows.
Flowers never count toward the 8-point minimum.

**Notation:** `M` = declared sets; `S` = suited tiles; `H` = honors (winds/dragons);
`Term` = suited 1s/9s; `Simp` = suited 2–8; `Orph` = terminals and honors.
Suit/group codes `C`, `B`, `D`, `W`, `G` mean characters, bamboo, dots, winds,
and dragons. `Green` = 2s, 3s, 4s, 6s, 8s, Green Dragon;
`Rev` = 2s, 4s, 5s, 6s, 8s, 9s, 1p, 2p, 3p, 4p, 5p, 8p, 9p, White Dragon.

### Worked example: 25 points

> 🀇🀈🀉 🀊🀋🀌 🀍🀎🀏 🀙🀚🀛 🀝🀝

Short codes: `123m 456m 789m 123p 55p`.
**Self-drawn winning tile: 🀝 (5p).** All four chows and the pair are concealed;
there are no declared sets, flowers, or event flags. Seat and prevalent wind are
East. Removing the winning 5p leaves a sole structural wait on 5p.

| Awarded fan | Points | Why it scores |
| --- | ---: | --- |
| Pure Straight | 16 | `123m`, `456m`, and `789m`. |
| Fully Concealed Hand | 4 | Self-drawn with no exposed declarations; includes Self Drawn. |
| All Chows | 2 | Four chows and a suited pair; includes No Honors. |
| Mixed Double Chow | 1 | `123m` and `123p`; the extra chow is compatible with the straight. |
| One Voided Suit | 1 | No bamboo tiles. |
| Single Wait | 1 | Only 5p completes the hand, completing the pair. |
| **Total** | **25** | **25 non-flower points: qualifies for the 8-point minimum.** |

The same tiles won by discard score **23** instead: Concealed Hand (2) replaces
Fully Concealed Hand (4), and the pair is discard-completed.

### 4.1 88 Points

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `BIG_FOUR_WINDS` | 88 | 4 pungs or kongs of winds (`27..30`). | `BIG_THREE_WINDS`, `ALL_PUNGS`, `PREVALENT_WIND`, `SEAT_WIND`, `PUNG_OF_TERMINALS_OR_HONORS` |
| `BIG_THREE_DRAGONS` | 88 | 3 pungs or kongs of dragons (`31..33`). | `LITTLE_THREE_DRAGONS`, `TWO_DRAGONS`, `DRAGON_PUNG` |
| `ALL_GREEN` | 88 | All tiles in the hand belong to `Green`. | `SEVEN_PAIRS`, `HALF_FLUSH`, `ONE_VOIDED_SUIT` |
| `NINE_GATES` | 88 | Concealed hand (`M = 0`) in a single suit with `1112345678999` plus any 1 tile of the same suit. | `FULL_FLUSH`, `HALF_FLUSH`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND`, `ONE_VOIDED_SUIT`, `NO_HONORS` |
| `FOUR_KONGS` | 88 | 4 kongs in the hand. | `THREE_KONGS`, `TWO_CONCEALED_KONGS`, `TWO_MELDED_KONGS`, `CONCEALED_KONG`, `MELDED_KONG`, `ALL_PUNGS`, `SINGLE_WAIT`, `FOUR_CONCEALED_PUNGS`, `THREE_CONCEALED_PUNGS`, `TWO_CONCEALED_PUNGS` |
| `SEVEN_SHIFTED_PAIRS` | 88 | Concealed hand (`M = 0`) of 7 pairs in a single suit with 7 consecutive ranks. | `SEVEN_PAIRS`, `FULL_FLUSH`, `HALF_FLUSH`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND`, `ONE_VOIDED_SUIT`, `NO_HONORS` |
| `THIRTEEN_ORPHANS` | 88 | Concealed hand (`M = 0`) containing all 13 tiles of `Orph` plus 1 duplicate from `Orph`. | `ALL_TERMINALS_AND_HONORS`, `ALL_TYPES`, `OUTSIDE_HAND`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND`, `SINGLE_WAIT` |

### 4.2 64 Points

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `ALL_TERMINALS` | 64 | 4 pungs/kongs and pair all composed of `Term`. | `ALL_TERMINALS_AND_HONORS`, `SEVEN_PAIRS`, `TRIPLE_PUNG`, `ALL_PUNGS`, `OUTSIDE_HAND`, `DOUBLE_PUNG`, `PUNG_OF_TERMINALS_OR_HONORS`, `NO_HONORS` |
| `LITTLE_FOUR_WINDS` | 64 | 3 pungs/kongs of winds plus a pair of the 4th wind. | `BIG_THREE_WINDS`, `PUNG_OF_TERMINALS_OR_HONORS` |
| `LITTLE_THREE_DRAGONS` | 64 | 2 pungs/kongs of dragons plus a pair of the 3rd dragon. | `TWO_DRAGONS`, `DRAGON_PUNG` |
| `ALL_HONORS` | 64 | 4 pungs/kongs and pair all composed of honor tiles (`H`). | `ALL_TERMINALS_AND_HONORS`, `SEVEN_PAIRS`, `ALL_PUNGS`, `HALF_FLUSH`, `OUTSIDE_HAND`, `ONE_VOIDED_SUIT`, `PUNG_OF_TERMINALS_OR_HONORS` |
| `FOUR_CONCEALED_PUNGS` | 64 | 4 concealed pungs or kongs. | `THREE_CONCEALED_PUNGS`, `TWO_CONCEALED_PUNGS`, `ALL_PUNGS`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND` |
| `PURE_TERMINAL_CHOWS` | 64 | Single suit with two `123` chows, two `789` chows, and a pair of `5`s. | `FULL_FLUSH`, `HALF_FLUSH`, `ALL_CHOWS`, `PURE_DOUBLE_CHOW`, `TWO_TERMINAL_CHOWS`, `ONE_VOIDED_SUIT`, `NO_HONORS` |

### 4.3 48 Points

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `QUADRUPLE_CHOW` | 48 | 4 identical chows (same suit and ranks). | `PURE_TRIPLE_CHOW`, `TILE_HOG`, `PURE_DOUBLE_CHOW` |
| `FOUR_PURE_SHIFTED_PUNGS` | 48 | 4 pungs/kongs in one suit with consecutive ranks `r, r+1, r+2, r+3`. | `PURE_SHIFTED_PUNGS`, `ALL_PUNGS` |

### 4.4 32 Points

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `FOUR_SHIFTED_CHOWS` | 32 | 4 chows in one suit stepped by `+1` (`r, r+1, r+2, r+3`) or `+2` (`r, r+2, r+4, r+6`). | `PURE_SHIFTED_CHOWS`, `SHORT_STRAIGHT`, `TWO_TERMINAL_CHOWS` |
| `THREE_KONGS` | 32 | 3 kongs in the hand. | `TWO_CONCEALED_KONGS`, `TWO_MELDED_KONGS`, `CONCEALED_KONG`, `MELDED_KONG` |
| `ALL_TERMINALS_AND_HONORS` | 32 | 4 pungs/kongs and pair all composed of `Orph`, containing both terminals and honors. | `SEVEN_PAIRS`, `ALL_PUNGS`, `OUTSIDE_HAND`, `PUNG_OF_TERMINALS_OR_HONORS` |

### 4.5 24 Points

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `SEVEN_PAIRS` | 24 | Concealed hand (`M = 0`) of 7 pairs. | `ALL_GREEN`, `ALL_TERMINALS`, `ALL_HONORS`, `ALL_TERMINALS_AND_HONORS`, `ALL_EVEN`, `UPPER_TILES`, `MIDDLE_TILES`, `LOWER_TILES`, `UPPER_FOUR`, `LOWER_FOUR`, `OUTSIDE_HAND`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND`, `SINGLE_WAIT` |
| `GREATER_HONORS_AND_KNITTED` | 24 | Concealed hand (`M = 0`) of 7 distinct honors and 7 distinct knitted tiles across the 3 suits. | `LESSER_HONORS_AND_KNITTED`, `ALL_TYPES`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND` |
| `ALL_EVEN` | 24 | 4 pungs/kongs and pair all of even ranks (`2, 4, 6, 8`). | `SEVEN_PAIRS`, `ALL_PUNGS`, `ALL_SIMPLES`, `NO_HONORS` |
| `FULL_FLUSH` | 24 | All tiles in a single suit (`S`), with no honors. | `HALF_FLUSH`, `ONE_VOIDED_SUIT`, `NO_HONORS` |
| `PURE_TRIPLE_CHOW` | 24 | 3 identical chows (same suit and ranks). | `PURE_DOUBLE_CHOW` |
| `PURE_SHIFTED_PUNGS` | 24 | 3 pungs/kongs in one suit with ranks `r, r+1, r+2`. | None |
| `UPPER_TILES` | 24 | Every tile is suited with rank in `{7, 8, 9}`. | `SEVEN_PAIRS`, `UPPER_FOUR`, `NO_HONORS` |
| `MIDDLE_TILES` | 24 | Every tile is suited with rank in `{4, 5, 6}`. | `SEVEN_PAIRS`, `ALL_SIMPLES`, `NO_HONORS` |
| `LOWER_TILES` | 24 | Every tile is suited with rank in `{1, 2, 3}`. | `SEVEN_PAIRS`, `LOWER_FOUR`, `NO_HONORS` |

### 4.6 16 Points

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `PURE_STRAIGHT` | 16 | Chows `123`, `456`, and `789` in a single suit. | `SHORT_STRAIGHT`, `TWO_TERMINAL_CHOWS` |
| `THREE_SUITED_TERMINAL_CHOWS` | 16 | Two suits each have `123` and `789` chows, and the third suit provides a pair of `5`s. | `ALL_CHOWS`, `MIXED_DOUBLE_CHOW`, `TWO_TERMINAL_CHOWS`, `NO_HONORS` |
| `PURE_SHIFTED_CHOWS` | 16 | 3 chows in one suit stepped by `+1` (`r, r+1, r+2`) or `+2` (`r, r+2, r+4`). | None |
| `ALL_FIVES` | 16 | Every set and the pair contains at least one tile of rank `5`. | `ALL_SIMPLES`, `NO_HONORS` |
| `TRIPLE_PUNG` | 16 | 3 pungs/kongs of the same rank across all 3 suits. | `ALL_TERMINALS`, `DOUBLE_PUNG` |
| `THREE_CONCEALED_PUNGS` | 16 | 3 concealed pungs or kongs. | `TWO_CONCEALED_PUNGS` |

### 4.7 12 Points

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `LESSER_HONORS_AND_KNITTED` | 12 | Concealed hand (`M = 0`) of distinct knitted tiles and honors (5 or 6 honors). | `ALL_TYPES`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND` |
| `UPPER_FOUR` | 12 | Every tile is suited with rank in `{6, 7, 8, 9}`. | `SEVEN_PAIRS`, `NO_HONORS` |
| `KNITTED_STRAIGHT` | 12 | Tiles forming `147` in one suit, `258` in a second suit, and `369` in the third suit. | None |
| `LOWER_FOUR` | 12 | Every tile is suited with rank in `{1, 2, 3, 4}`. | `SEVEN_PAIRS`, `NO_HONORS` |
| `BIG_THREE_WINDS` | 12 | 3 pungs or kongs of winds. | `PUNG_OF_TERMINALS_OR_HONORS` |

### 4.8 8 Points

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `MIXED_STRAIGHT` | 8 | Chows `123`, `456`, and `789` distributed across the 3 suits. | None |
| `REVERSIBLE_TILES` | 8 | All tiles in the hand belong to `Rev`. | `ONE_VOIDED_SUIT` |
| `MIXED_TRIPLE_CHOW` | 8 | 3 chows of the same rank across all 3 suits. | `MIXED_DOUBLE_CHOW` |
| `MIXED_SHIFTED_PUNGS` | 8 | 3 pungs/kongs across the 3 suits with ranks `r, r+1, r+2`. | None |
| `CHICKEN_HAND` | 8 | Hand has 0 non-flower fan points before applying `CHICKEN_HAND`. | All other non-flower fans |
| `LAST_TILE_DRAW` | 8 | Win on the last draw (`win_type == "self_draw"` and `flags.last_tile_draw`). | `SELF_DRAWN` |
| `LAST_TILE_CLAIM` | 8 | Win on the last discard (`win_type == "discard"` and `flags.last_tile_claim`). | None |
| `OUT_WITH_REPLACEMENT` | 8 | Win on a kong replacement draw (`win_type == "self_draw"` and `flags.out_with_replacement`). | `SELF_DRAWN` |
| `ROBBING_THE_KONG` | 8 | Win by claiming a tile added to extend a pung into a kong (`win_type == "discard"` and `flags.robbing_the_kong`). | `LAST_TILE` |

### 4.9 6 Points

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `ALL_PUNGS` | 6 | 4 pungs/kongs and a pair. | None |
| `HALF_FLUSH` | 6 | Tiles from exactly one suit (`S`) plus at least one honor tile (`H`). | `ALL_GREEN`, `ONE_VOIDED_SUIT` |
| `MIXED_SHIFTED_CHOWS` | 6 | 3 chows across the 3 suits with ranks `r, r+1, r+2`. | None |
| `ALL_TYPES` | 6 | Hand contains at least one tile from each of the 5 groups (`C`, `B`, `D`, `W`, `G`). | None |
| `MELDED_HAND` | 6 | All 4 sets were declared and exposed before winning, and `win_type == "discard"`. | `SINGLE_WAIT` |
| `TWO_CONCEALED_KONGS` | 6 | 2 concealed kongs. | `CONCEALED_KONG` |
| `TWO_DRAGONS` | 6 | 2 pungs/kongs of dragons. | `DRAGON_PUNG` |

### 4.10 4 Points

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `OUTSIDE_HAND` | 4 | Every set and the pair contains at least one tile from `Orph`. | `SEVEN_PAIRS` |
| `FULLY_CONCEALED_HAND` | 4 | No exposed melds and `win_type == "self_draw"`. | `CONCEALED_HAND`, `SELF_DRAWN` |
| `TWO_MELDED_KONGS` | 4 | 2 exposed/melded kongs. | `MELDED_KONG` |
| `LAST_TILE` | 4 | `flags.fourth_copy_visible == true`. | None |

### 4.11 2 Points

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `DRAGON_PUNG` | 2 | 1 pung or kong of a dragon (`31..33`). | None |
| `PREVALENT_WIND` | 2 | 1 pung or kong of `prevalent_wind`. | `PUNG_OF_TERMINALS_OR_HONORS` |
| `SEAT_WIND` | 2 | 1 pung or kong of `seat_wind`. | `PUNG_OF_TERMINALS_OR_HONORS` |
| `CONCEALED_HAND` | 2 | No exposed melds and `win_type == "discard"`. | None |
| `ALL_CHOWS` | 2 | 4 chows and a pair of suited tiles (`S`). | `NO_HONORS` |
| `TILE_HOG` | 2 | 4 copies of a single tile ID appear in the hand without forming a kong. | `QUADRUPLE_CHOW` |
| `DOUBLE_PUNG` | 2 | 2 pungs/kongs of the same rank in 2 different suits. | None |
| `TWO_CONCEALED_PUNGS` | 2 | 2 concealed pungs or kongs. | None |
| `CONCEALED_KONG` | 2 | 1 concealed kong. | None |
| `ALL_SIMPLES` | 2 | Every tile in the hand belongs to `Simp`. | `NO_HONORS` |

### 4.12 1 Point

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `PURE_DOUBLE_CHOW` | 1 | 2 identical chows in the same suit. | None |
| `MIXED_DOUBLE_CHOW` | 1 | 2 chows of the same rank in 2 different suits. | None |
| `SHORT_STRAIGHT` | 1 | 2 chows in the same suit forming 6 consecutive ranks (`r..r+5`). | None |
| `TWO_TERMINAL_CHOWS` | 1 | `123` and `789` chows in the same suit. | None |
| `PUNG_OF_TERMINALS_OR_HONORS` | 1 | 1 pung or kong of a terminal (`Term`) or honor (`H`) not already scored as `PREVALENT_WIND`, `SEAT_WIND`, or `DRAGON_PUNG`. | None |
| `MELDED_KONG` | 1 | 1 exposed/melded kong. | None |
| `ONE_VOIDED_SUIT` | 1 | Tiles contain 1 or 2 numbered suits (at least one suit is absent). | None |
| `NO_HONORS` | 1 | No tiles in `H` appear in the hand. | None |
| `EDGE_WAIT` | 1 | Sole tenpai completion on edge of terminal chow (`3` for `123`, `7` for `789`). | `CLOSED_WAIT`, `SINGLE_WAIT` |
| `CLOSED_WAIT` | 1 | Sole tenpai completion on middle tile of chow. | `EDGE_WAIT`, `SINGLE_WAIT` |
| `SINGLE_WAIT` | 1 | Sole tenpai completion on pair. | `EDGE_WAIT`, `CLOSED_WAIT` |
| `SELF_DRAWN` | 1 | `win_type == "self_draw"`. | None |

### 4.13 Flowers

| Fan ID | Points | Condition | Excludes |
| --- | ---: | --- | --- |
| `FLOWER_TILES` | 1 each | One point per flower or season, maximum 8; excluded from the 8-point minimum. | None |

<!-- scoring-reference:end -->

## 5. Normative executable clarifications

### 5.1 Input and events

`scoreHand(state)` in `static/scorer.js` accepts the state in section 2. Required
fields are `concealed_tiles`, `melds`, `winning_tile`, `win_type`, `seat_wind`,
and `prevalent_wind`. `flowers_count` defaults to 0; omitted flags default to
false. Unknown keys and wrong types are errors, not ignored hints. Arrays are
copied and sorted; the caller's objects are never mutated.

Only a kong may be declared with `concealed: true`. Chow tiles must be consecutive
in one suit; pung/kong tiles must be identical. A supplied `claimed_tile` must
belong to an exposed meld. A discard-completed pung stays outside `melds`: only
its effective pung concealment changes. A concealed kong does not open a hand.

Last draw and replacement require self-draw; last claim and robbing require
discard. Last claim and robbing cannot describe the same event. Replacement
requires a declared kong and means a **kong**, not flower, replacement. Last draw
and kong replacement may coexist under this profile. `fourth_copy_visible`
asserts all three other copies were publicly visible before the win; it cannot
be true when another copy is in this player's concealed tiles/concealed kong.
External event history and opponents' tiles cannot be verified from this input.
The caller is responsible for those assertions.
Robbing an added kong additionally requires exactly one copy of the winning
tile in this entire hand: the other three necessarily belong to the opponent's
exposed pung. It cannot complete this player's pair or pung.

### 5.2 Structures, placements, and waits

Enumerate every standard partition and every winning-occurrence placement within
each partition. Do not combine fans from different partitions or placements.
For discard, only the chosen completed set/pair is marked effectively exposed;
previously declared/open status remains separate. Self-draw leaves all standing
sets concealed. Both statuses and the completed component are returned.

Seven pairs accepts four copies as two pairs. Thirteen orphans has exactly 13
distinct orphans and one duplicate. Honors-and-knitted hands contain 14 distinct
tiles, use **one common permutation** of `147 / 258 / 369` across the suits, and
have 5, 6, or 7 honors. Seven honors is Greater; 5 or 6 is Lesser. Nine knitted
tiles plus five honors also scores `KNITTED_STRAIGHT`.

An ordinary `KNITTED_STRAIGHT` is its own decomposition: the nine distinct
knitted tiles plus **one set and one pair**, not four ordinary sets. At most
one meld may be declared and it must be that remaining set. A winning tile may
complete the knitted component, remaining set, or pair. Only the remaining chow
or pair can earn a wait fan. Four-set predicates (`ALL_CHOWS`, `ALL_PUNGS`,
`OUTSIDE_HAND`, `ALL_FIVES`, etc.) do not apply to this structure.

Waits enumerate all 34 additions after removing one winning occurrence, obeying
the four-copy cap including declared melds. Standard, pairs, orphans, and both
knitted forms all participate, **without** applying the 8-point minimum, flowers,
event flags, visible discards, or current-wall availability. This is a structural
wait, not a count of live tiles. Only a sole structural completion can earn a
wait fan; the chosen component must also have the appropriate shape. Irregular
pairs/orphans/honors-and-knitted never earn ordinary wait fans.

Nine Gates follows the supplied **final-tile-multiset** definition; it does not
require the pre-win tiles to have all nine waits. It must also have a standard
partition. Its mandatory terminal pung is not scored separately: suppress one
terminal-pung instance, preserving a second if present. This fills a missing
Non-Repeat rule in the original table.

### 5.3 Fan instances and exclusions

Fans are instances with an ID, value, and supporting component indices (and tile
ID for `TILE_HOG`). Repeatable one-set and two-set fans are not boolean flags.
Concealed-pung and kong inventory tiers use the **highest matching count only**:
four kongs do not generate Three Kongs on an arbitrary subset, and three
concealed pungs do not also generate a two-pung count. With fewer than three
kongs, two of the same concealment type use their two-kong tier; a mixed pair
uses the individual fans. Lower inventory tiers cannot reappear when an
incompatible higher fan is omitted. Relational chow/pung fans, unlike inventory
tiers, enumerate their actual supporting subsets.

An exclusion listed in **either direction** creates a symmetric incompatibility.
It is not transitive. Whole-hand exclusions are global. Set-based exclusions
apply when the excluded instance's support is contained in the excluding
instance's support; they do not erase unrelated sets. Thus a value wind does not
erase an unrelated terminal pung, and a straight does not erase an extra chow's
independent combination. `PREVALENT_WIND` and `SEAT_WIND` both score on the same
pung when the winds coincide. Dragon pungs never also score the generic
terminal/honor pung. Wind-group fans suppress only their supporting wind pungs.

The supplied seven-pairs incompatibilities (including `ALL_GREEN` and rank
bands) and Four Kongs' concealed-pung exclusions are **retained as project
policy**, not silently replaced with another MCR table. Exclusions prohibit
co-scoring, not recognition of a winning shape: on a seven-pair partition an
incompatible, more valuable tile-content fan may replace `SEVEN_PAIRS`.
Concealment bonuses remain unavailable on the irregular partitions even when
their structural fan is replaced. Structure-dependent four-set fans cannot be
borrowed from a different standard partition.

Thirteen Orphans necessarily contains All Types; the missing exclusion is added.
Beyond the explicit corrections above, Non-Repeat is a **closed list** of
exclusions, not an instruction to derive arbitrary logical implications. For
example, four same-suit chows force at least one missing suit, but the supplied
table still permits One Voided Suit with Quadruple Chow/Four Shifted Chows.
This resolves a conflict between the general principle and the detailed table
without silently inventing further exclusions.

`TILE_HOG` scores once per tile ID with four physical copies and no declared kong
of that ID, including two pairs in Seven Pairs. Quadruple Chow excludes its
three tile hogs. Kong tiles remain four physical copies for content predicates;
no undeclared four-identical group is inferred to be a kong. One concealed plus
one exposed kong scores the two individual kong fans (3), because the supplied
table defines no mixed-two-kong fan.

### 5.4 Exact Count-Once rule

The original prose does not uniquely define a mathematical algorithm. This
profile uses the following explicit bounded hyperforest rule for **relational**
chow/pung combinations:

* The participating fans are pure/mixed double and triple chows, quadruple chow,
  short/pure/mixed straights, two/pure/three-suited terminal chows, pure/mixed
  shifted chows/pungs (including four-set versions), and double/triple pung.
* Treat each participating instance as a hyperedge on its supporting set
  indices. Its incidence graph must be acyclic; a set may belong to at most
  two selected relational instances. Equivalently, combinations can be ordered
  to introduce new sets, sharing at most one already-used set, and each set
  may be reused only once.
* Identical fan IDs must have disjoint supporting sets, even when the incidence
  graph would otherwise be legal. There is no blanket ban on overlap between
  different IDs.
* Tile-content, wind/dragon, concealment, kong-count, and event fans do not consume
  this relational budget. Their explicit exclusions still apply.

Choose the exact maximum-point compatible subset, not a greedy highest-fan
filter. Exhaustively compare structures and placements. Ties use ascending
canonical fan-instance keys, then ascending canonical decomposition/placement
keys, making input tile ordering irrelevant. This formalization is an explicit
project choice and should be checked against tournament rulings before use
as a referee.

### 5.5 Outcomes

Invalid state raises `HandValidationError` with an `issues` array. A valid state
that is not a winning structure returns `status: "not_winning"`. A structural
win worth 1 through 7 non-flower points returns `status: "below_minimum"`;
flowers cannot legalize it. `CHICKEN_HAND` applies only when **every**
interpretation's eligible non-flower candidate list is empty, never by dropping
fans or choosing a zero-fan partition over another partition with fans.
A qualifying win returns `status: "winning"`.

`fan_points`, `flower_points`, and `total_points` are separate; a below-minimum
hand may display its arithmetic total but has `valid_win: false`. A non-winning
structure has `total_points: null` and no flower award. Scores are hand points,
not payments between players. The result also includes structural waits,
selected fan instances, the chosen decomposition, and effective concealment.
