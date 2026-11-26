# mahjong_2023_hands

# Chinese Official Mahjong (MCR — MIL 2023) Ruleset Specification
### Source: [https://mahjong.wikidot.com/rules:chinese-official-scoring](https://mahjong.wikidot.com/rules:chinese-official-scoring)

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
* `flowers_count`: non-negative integer count of flower tiles.
* `flags`:
  * `last_tile_draw`: boolean
  * `last_tile_claim`: boolean
  * `out_with_replacement`: boolean
  * `robbing_the_kong`: boolean
  * `fourth_copy_visible`: boolean (all 3 other copies of `winning_tile` are visible to all players)

### 2.2 Structural Constraints
1. **Tile Count Invariant:** $\text{len}(\text{concealed\_tiles}) + 3M = 14$ (each kong occupies 3 slots in the 4-set-plus-pair structure while retaining all 4 copies in `tiles`).
2. **Copy Cap:** For every $t \in T$, total occurrences across `concealed_tiles` and all `melds[*].tiles` is at most $4$.
3. **Winning Tile Membership:** `winning_tile` is present in `concealed_tiles` (or on the completing meld when applicable).
4. **Concealed-Only Irregular Hands:** If any meld has `concealed == false` ($M_{\text{exposed}} > 0$), irregular 14-tile concealed structures (`SEVEN_PAIRS`, `THIRTEEN_ORPHANS`, `GREATER_HONORS_AND_KNITTED`, `LESSER_HONORS_AND_KNITTED`, `NINE_GATES`) are invalid.

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

## 4. MIL 2023 Fan Table & Exclusions

Each entry defines `Fan ID`, `Points`, `Condition`, and `Excludes` (fan IDs that cannot co-score with it).

### 4.1 88 Points
* `BIG_FOUR_WINDS` (88): 4 pungs or kongs of winds (`27..30`). Excludes: `BIG_THREE_WINDS`, `ALL_PUNGS`, `PREVALENT_WIND`, `SEAT_WIND`, `PUNG_OF_TERMINALS_OR_HONORS`.
* `BIG_THREE_DRAGONS` (88): 3 pungs or kongs of dragons (`31..33`). Excludes: `LITTLE_THREE_DRAGONS`, `TWO_DRAGONS`, `DRAGON_PUNG`.
* `ALL_GREEN` (88): All tiles in the hand belong to `Green`. Excludes: `SEVEN_PAIRS`, `HALF_FLUSH`, `ONE_VOIDED_SUIT`.
* `NINE_GATES` (88): Concealed hand ($M = 0$) in a single suit with `1112345678999` plus any 1 tile of the same suit. Excludes: `FULL_FLUSH`, `HALF_FLUSH`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND`, `ONE_VOIDED_SUIT`, `NO_HONORS`.
* `FOUR_KONGS` (88): 4 kongs in the hand. Excludes: `THREE_KONGS`, `TWO_CONCEALED_KONGS`, `TWO_MELDED_KONGS`, `CONCEALED_KONG`, `MELDED_KONG`, `ALL_PUNGS`, `SINGLE_WAIT`, `FOUR_CONCEALED_PUNGS`, `THREE_CONCEALED_PUNGS`, `TWO_CONCEALED_PUNGS`.
* `SEVEN_SHIFTED_PAIRS` (88): Concealed hand ($M = 0$) of 7 pairs in a single suit with 7 consecutive ranks. Excludes: `SEVEN_PAIRS`, `FULL_FLUSH`, `HALF_FLUSH`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND`, `ONE_VOIDED_SUIT`, `NO_HONORS`.
* `THIRTEEN_ORPHANS` (88): Concealed hand ($M = 0$) containing all 13 tiles of `Orph` plus 1 duplicate from `Orph`. Excludes: `ALL_TERMINALS_AND_HONORS`, `OUTSIDE_HAND`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND`, `SINGLE_WAIT`.

### 4.2 64 Points
* `ALL_TERMINALS` (64): 4 pungs/kongs and pair all composed of `Term`. Excludes: `ALL_TERMINALS_AND_HONORS`, `SEVEN_PAIRS`, `TRIPLE_PUNG`, `ALL_PUNGS`, `OUTSIDE_HAND`, `DOUBLE_PUNG`, `PUNG_OF_TERMINALS_OR_HONORS`, `NO_HONORS`.
* `LITTLE_FOUR_WINDS` (64): 3 pungs/kongs of winds plus a pair of the 4th wind. Excludes: `BIG_THREE_WINDS`, `PUNG_OF_TERMINALS_OR_HONORS`.
* `LITTLE_THREE_DRAGONS` (64): 2 pungs/kongs of dragons plus a pair of the 3rd dragon. Excludes: `TWO_DRAGONS`, `DRAGON_PUNG`.
* `ALL_HONORS` (64): 4 pungs/kongs and pair all composed of honor tiles (`H`). Excludes: `ALL_TERMINALS_AND_HONORS`, `SEVEN_PAIRS`, `ALL_PUNGS`, `HALF_FLUSH`, `OUTSIDE_HAND`, `ONE_VOIDED_SUIT`, `PUNG_OF_TERMINALS_OR_HONORS`.
* `FOUR_CONCEALED_PUNGS` (64): 4 concealed pungs or kongs. Excludes: `THREE_CONCEALED_PUNGS`, `TWO_CONCEALED_PUNGS`, `ALL_PUNGS`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND`.
* `PURE_TERMINAL_CHOWS` (64): Single suit with two `123` chows, two `789` chows, and a pair of `5`s. Excludes: `FULL_FLUSH`, `HALF_FLUSH`, `ALL_CHOWS`, `PURE_DOUBLE_CHOW`, `TWO_TERMINAL_CHOWS`, `ONE_VOIDED_SUIT`, `NO_HONORS`.

### 4.3 48 Points
* `QUADRUPLE_CHOW` (48): 4 identical chows (same suit and ranks). Excludes: `PURE_TRIPLE_CHOW`, `TILE_HOG`, `PURE_DOUBLE_CHOW`.
* `FOUR_PURE_SHIFTED_PUNGS` (48): 4 pungs/kongs in one suit with consecutive ranks $r, r+1, r+2, r+3$. Excludes: `PURE_SHIFTED_PUNGS`, `ALL_PUNGS`.

### 4.4 32 Points
* `FOUR_SHIFTED_CHOWS` (32): 4 chows in one suit stepped by $+1$ ($r, r+1, r+2, r+3$) or $+2$ ($r, r+2, r+4, r+6$). Excludes: `PURE_SHIFTED_CHOWS`, `SHORT_STRAIGHT`, `TWO_TERMINAL_CHOWS`.
* `THREE_KONGS` (32): 3 kongs in the hand. Excludes: `TWO_CONCEALED_KONGS`, `TWO_MELDED_KONGS`, `CONCEALED_KONG`, `MELDED_KONG`.
* `ALL_TERMINALS_AND_HONORS` (32): 4 pungs/kongs and pair all composed of `Orph`, containing both terminals and honors. Excludes: `SEVEN_PAIRS`, `ALL_PUNGS`, `OUTSIDE_HAND`, `PUNG_OF_TERMINALS_OR_HONORS`.

### 4.5 24 Points
* `SEVEN_PAIRS` (24): Concealed hand ($M = 0$) of 7 pairs. Excludes: `ALL_GREEN`, `ALL_TERMINALS`, `ALL_HONORS`, `ALL_TERMINALS_AND_HONORS`, `ALL_EVEN`, `UPPER_TILES`, `MIDDLE_TILES`, `LOWER_TILES`, `UPPER_FOUR`, `LOWER_FOUR`, `OUTSIDE_HAND`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND`, `SINGLE_WAIT`.
* `GREATER_HONORS_AND_KNITTED` (24): Concealed hand ($M = 0$) of 7 distinct honors and 7 distinct knitted tiles across the 3 suits. Excludes: `LESSER_HONORS_AND_KNITTED`, `ALL_TYPES`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND`.
* `ALL_EVEN` (24): 4 pungs/kongs and pair all of even ranks (`2, 4, 6, 8`). Excludes: `SEVEN_PAIRS`, `ALL_PUNGS`, `ALL_SIMPLES`, `NO_HONORS`.
* `FULL_FLUSH` (24): All tiles in a single suit ($S$), with no honors. Excludes: `HALF_FLUSH`, `ONE_VOIDED_SUIT`, `NO_HONORS`.
* `PURE_TRIPLE_CHOW` (24): 3 identical chows (same suit and ranks). Excludes: `PURE_DOUBLE_CHOW`.
* `PURE_SHIFTED_PUNGS` (24): 3 pungs/kongs in one suit with ranks $r, r+1, r+2$. Excludes: none.
* `UPPER_TILES` (24): All suited tiles have rank in `{7, 8, 9}`. Excludes: `SEVEN_PAIRS`, `UPPER_FOUR`, `NO_HONORS`.
* `MIDDLE_TILES` (24): All suited tiles have rank in `{4, 5, 6}`. Excludes: `SEVEN_PAIRS`, `ALL_SIMPLES`, `NO_HONORS`.
* `LOWER_TILES` (24): All suited tiles have rank in `{1, 2, 3}`. Excludes: `SEVEN_PAIRS`, `LOWER_FOUR`, `NO_HONORS`.

### 4.6 16 Points
* `PURE_STRAIGHT` (16): Chows `123`, `456`, and `789` in a single suit. Excludes: `SHORT_STRAIGHT`, `TWO_TERMINAL_CHOWS`.
* `THREE_SUITED_TERMINAL_CHOWS` (16): Two suits each have `123` and `789` chows, and the third suit provides a pair of `5`s. Excludes: `ALL_CHOWS`, `MIXED_DOUBLE_CHOW`, `TWO_TERMINAL_CHOWS`, `NO_HONORS`.
* `PURE_SHIFTED_CHOWS` (16): 3 chows in one suit stepped by $+1$ ($r, r+1, r+2$) or $+2$ ($r, r+2, r+4$). Excludes: none.
* `ALL_FIVES` (16): Every set and the pair contains at least one tile of rank `5`. Excludes: `ALL_SIMPLES`, `NO_HONORS`.
* `TRIPLE_PUNG` (16): 3 pungs/kongs of the same rank across all 3 suits. Excludes: `ALL_TERMINALS`, `DOUBLE_PUNG`.
* `THREE_CONCEALED_PUNGS` (16): 3 concealed pungs or kongs. Excludes: `TWO_CONCEALED_PUNGS`.

### 4.7 12 Points
* `LESSER_HONORS_AND_KNITTED` (12): Concealed hand ($M = 0$) of distinct knitted tiles and honors (5 or 6 honors). Excludes: `ALL_TYPES`, `CONCEALED_HAND`, `FULLY_CONCEALED_HAND`.
* `UPPER_FOUR` (12): All suited tiles have rank in `{6, 7, 8, 9}`. Excludes: `SEVEN_PAIRS`, `NO_HONORS`.
* `KNITTED_STRAIGHT` (12): Tiles forming `147` in one suit, `258` in a second suit, and `369` in the third suit. Excludes: none.
* `LOWER_FOUR` (12): All suited tiles have rank in `{1, 2, 3, 4}`. Excludes: `SEVEN_PAIRS`, `NO_HONORS`.
* `BIG_THREE_WINDS` (12): 3 pungs or kongs of winds. Excludes: `PUNG_OF_TERMINALS_OR_HONORS`.

### 4.8 8 Points
* `MIXED_STRAIGHT` (8): Chows `123`, `456`, and `789` distributed across the 3 suits. Excludes: none.
* `REVERSIBLE_TILES` (8): All tiles in the hand belong to `Rev`. Excludes: `ONE_VOIDED_SUIT`.
* `MIXED_TRIPLE_CHOW` (8): 3 chows of the same rank across all 3 suits. Excludes: `MIXED_DOUBLE_CHOW`.
* `MIXED_SHIFTED_PUNGS` (8): 3 pungs/kongs across the 3 suits with ranks $r, r+1, r+2$. Excludes: none.
* `CHICKEN_HAND` (8): Hand has 0 non-flower fan points before applying `CHICKEN_HAND`. Excludes: all other non-flower fans.
* `LAST_TILE_DRAW` (8): Win on the last draw (`win_type == "self_draw"` and `flags.last_tile_draw`). Excludes: `SELF_DRAWN`.
* `LAST_TILE_CLAIM` (8): Win on the last discard (`win_type == "discard"` and `flags.last_tile_claim`). Excludes: none.
* `OUT_WITH_REPLACEMENT` (8): Win on a kong replacement draw (`win_type == "self_draw"` and `flags.out_with_replacement`). Excludes: `SELF_DRAWN`.
* `ROBBING_THE_KONG` (8): Win by claiming a tile added to extend a pung into a kong (`win_type == "discard"` and `flags.robbing_the_kong`). Excludes: `LAST_TILE`.

### 4.9 6 Points
* `ALL_PUNGS` (6): 4 pungs/kongs and a pair. Excludes: none.
* `HALF_FLUSH` (6): Tiles from exactly one suit ($S$) plus at least one honor tile ($H$). Excludes: `ALL_GREEN`, `ONE_VOIDED_SUIT`.
* `MIXED_SHIFTED_CHOWS` (6): 3 chows across the 3 suits with ranks $r, r+1, r+2$. Excludes: none.
* `ALL_TYPES` (6): Hand contains at least one tile from each of the 5 groups (`C`, `B`, `D`, `W`, `G`). Excludes: none.
* `MELDED_HAND` (6): All 4 sets are exposed (`concealed == false`) and `win_type == "discard"`. Excludes: `SINGLE_WAIT`.
* `TWO_CONCEALED_KONGS` (6): 2 concealed kongs. Excludes: `CONCEALED_KONG`.
* `TWO_DRAGONS` (6): 2 pungs/kongs of dragons. Excludes: `DRAGON_PUNG`.

### 4.10 4 Points
* `OUTSIDE_HAND` (4): Every set and the pair contains at least one tile from `Orph`. Excludes: `SEVEN_PAIRS`.
* `FULLY_CONCEALED_HAND` (4): No exposed melds ($M_{\text{exposed}} = 0$) and `win_type == "self_draw"`. Excludes: `CONCEALED_HAND`, `SELF_DRAWN`.
* `TWO_MELDED_KONGS` (4): 2 exposed/melded kongs. Excludes: `MELDED_KONG`.
* `LAST_TILE` (4): `flags.fourth_copy_visible == true`. Excludes: none.

### 4.11 2 Points
* `DRAGON_PUNG` (2): 1 pung or kong of a dragon (`31..33`). Excludes: none.
* `PREVALENT_WIND` (2): 1 pung or kong of `prevalent_wind`. Excludes: `PUNG_OF_TERMINALS_OR_HONORS`.
* `SEAT_WIND` (2): 1 pung or kong of `seat_wind`. Excludes: `PUNG_OF_TERMINALS_OR_HONORS`.
* `CONCEALED_HAND` (2): No exposed melds ($M_{\text{exposed}} = 0$) and `win_type == "discard"`. Excludes: none.
* `ALL_CHOWS` (2): 4 chows and a pair of suited tiles ($S$). Excludes: `NO_HONORS`.
* `TILE_HOG` (2): 4 copies of a single tile ID appear in the hand without forming a kong. Excludes: `QUADRUPLE_CHOW`.
* `DOUBLE_PUNG` (2): 2 pungs/kongs of the same rank in 2 different suits. Excludes: none.
* `TWO_CONCEALED_PUNGS` (2): 2 concealed pungs or kongs. Excludes: none.
* `CONCEALED_KONG` (2): 1 concealed kong. Excludes: none.
* `ALL_SIMPLES` (2): Every tile in the hand belongs to `Simp`. Excludes: `NO_HONORS`.

### 4.12 1 Point
* `PURE_DOUBLE_CHOW` (1): 2 identical chows in the same suit. Excludes: none.
* `MIXED_DOUBLE_CHOW` (1): 2 chows of the same rank in 2 different suits. Excludes: none.
* `SHORT_STRAIGHT` (1): 2 chows in the same suit forming 6 consecutive ranks ($r..r+5$). Excludes: none.
* `TWO_TERMINAL_CHOWS` (1): `123` and `789` chows in the same suit. Excludes: none.
* `PUNG_OF_TERMINALS_OR_HONORS` (1): 1 pung or kong of a terminal (`Term`) or honor (`H`) not already scored as `PREVALENT_WIND`, `SEAT_WIND`, or `DRAGON_PUNG`. Excludes: none.
* `MELDED_KONG` (1): 1 exposed/melded kong. Excludes: none.
* `ONE_VOIDED_SUIT` (1): Tiles come from at most 2 suits (at least one suit is absent). Excludes: none.
* `NO_HONORS` (1): No tiles in $H$ appear in the hand. Excludes: none.
* `EDGE_WAIT` (1): Sole tenpai completion on edge of terminal chow (`3` for `123`, `7` for `789`). Excludes: `CLOSED_WAIT`, `SINGLE_WAIT`.
* `CLOSED_WAIT` (1): Sole tenpai completion on middle tile of chow. Excludes: `EDGE_WAIT`, `SINGLE_WAIT`.
* `SINGLE_WAIT` (1): Sole tenpai completion on pair. Excludes: `EDGE_WAIT`, `CLOSED_WAIT`.
* `SELF_DRAWN` (1): `win_type == "self_draw"`. Excludes: none.
