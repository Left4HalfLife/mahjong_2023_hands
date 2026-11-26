# Rules audit and deterministic resolutions

The supplied README was the authority for this implementation. Its source link
could not be retrieved in the implementation environment; no independent MIL
2023 certification is claimed. [RULES.md](RULES.md) now contains the table and
the normative `workspace-2023-v1` contract. These are deliberate local decisions,
not a claim that an ambiguous source has only one possible interpretation.

| Issue in the supplied specification | Resolution and code location |
| --- | --- |
| Rules and project instructions occupied the same README. | Move the specification to `RULES.md`; README describes running and using the application. |
| “At most four copies” could be applied to effective 14 slots rather than physical tiles. | `validateHand` counts all four kong tiles physically, but each declared set consumes three structural slots. |
| Winning membership allowed an unspecified “completing meld”. | `winning_tile` must occur in standing `concealed_tiles`; `melds` contains only previously completed declarations. |
| The concealed-only rule permitted concealed kongs, whereas the irregular form rule required zero melds. | Require zero melds for all 14-tile irregular forms and Nine Gates. Ordinary Knitted Straight is the explicit exception with at most one set declaration. |
| Claimed chows/pungs could be marked concealed; malformed melds were not defined. | Reject concealed declared chows/pungs, mixed-suit/wrapping chows, nonidentical pungs/kongs, incorrect lengths, and invalid claimed tiles. |
| Unknown IDs, fractional counts, missing context, typoed flags, and coercion were unspecified. | Strict validation raises a structured error. Only documented optional fields default; no string-to-number or truthy coercion. |
| Flower count had no maximum and flowers lacked a fan-table entry. | Accept 0–8 flowers/seasons; add the entry and a separate score field. |
| Self-draw and discard could be combined with contradictory event flags. | Validate event source, reject last-discard plus robbing, require a kong for replacement. Last-wall kong replacement is allowed explicitly. |
| A flower replacement might be mistaken for a kong replacement. | `out_with_replacement` means kong replacement only; the UI labels it that way. |
| “Fourth copy visible” did not say when or include own hidden copies. | It refers to visibility before winning. Reject provably hidden other copies; unseen opponents' history remains caller-asserted. |
| Robbing an added kong could be asserted while holding another copy, implying at least five copies across players. | Require exactly one winning-tile copy in the player's entire hand; the other three must be in the opponent's pung. |
| An apparently concealed discard winner might lose Concealed Hand incorrectly. | `assignWinningTile` tracks effective concealment separately from declared openness. Only the completed pung loses concealed-pung credit. |
| The same winning tile could belong to different sets or the pair. | Enumerate all placements within every partition; maximize their independent scores. The output identifies the chosen component. |
| Multiple valid partitions could be accidentally mixed to manufacture fans. | `findDecompositions` enumerates partitions; `detectFans` only sees one partition/placement at a time. |
| Seven Pairs did not fully define quads or repeat Tile Hogs. | Four copies form two pairs and one Tile Hog; score independently per tile ID. |
| `TILE_HOG` and `QUADRUPLE_CHOW` mutually exclude each other, inviting order-dependent filtering. | Make incompatibility symmetric; maximize exactly. Quadruple Chow defeats its three hogs without greedy ordering. |
| Honors-and-knitted selection did not give a complete winning shape or common suit assignment. | Require 14 distinct tiles from one of six knitted permutations plus honors; 7 honors is Greater, 5/6 is Lesser. |
| Knitted Straight specified nine tiles without defining the remaining five. | Add a separate nine-knitted + one-set + pair decomposition, at most one declared set. No borrowed four-set fans. |
| Lesser Honors and Knitted with five honors necessarily contains all nine knitted tiles. | Award compatible Knitted Straight as well. The seven-honor form cannot contain all nine. |
| Knitted components have no ordinary chow/pair wait interpretation. | Only the residual ordinary chow/pair can earn a wait fan, subject to the global sole-wait test. |
| Wait enumeration might count impossible fifth copies or ignore alternate forms. | `winningTiles` includes all supported structures and checks physical availability including declared kongs/melds. |
| “Winning tiles” could mean live tiles, legal 8-point wins, or structural completions. | Use structural completions only. Do not filter by flowers, fan minimum, events, dead wall, or visible discards. |
| Edge/closed/pair shape alone could score despite another winning tile. | Require exactly one structural winning tile, then check the selected placement. Never stack the three wait fans. |
| Nine Gates' final pattern and nine-sided pre-win wait were conflated. | Retain the final-pattern definition, requiring a valid standard partition and zero melds. |
| Nine Gates necessarily includes a terminal pung, missing from its exclusions. | `detectFans` removes one mandatory terminal-pung instance, not every terminal pung. Section 5 documents this Non-Repeat correction. |
| Thirteen Orphans necessarily contains All Types, but its exclusion was missing. | Add `ALL_TYPES` to its exclusions; it cannot inflate an orphan hand by 6. |
| The general Non-Repeat principle is stronger than the explicit table: e.g. Quadruple Chow implies a missing suit without excluding it. | Treat the amended table as a closed list, not an open-ended implication prover. Preserve the listed low-fan combinations unless explicitly excluded. |
| Rank-band fans said “all suited tiles”, vacuously admitting honors-only hands or honors mixed with suited tiles. | Require every tile to be suited and in the range. Correct table wording. |
| One Voided Suit could vacuously apply with zero numbered suits. | Require one or two actual numbered suits; whole-hand flush exclusions remain effective. |
| Set-dependent All Honors/Terminals/Even/Fives/Outside could be awarded to a pair or knitted partition. | Apply the table's four-set-and-pair predicates only to standard partitions. |
| Asymmetric exclusion lists could depend on iteration order; transitive closure could erase valid fans. | `instancesConflict` checks either direction, without transitive inference. |
| A global implementation of wind/straight exclusions would remove unrelated terminal pungs or extra-chow combinations. | Set exclusions act on contained support only. Whole-hand exclusions remain global. |
| Generic honor pung could duplicate Dragon Pung or double-wind points. | Generate generic points for terminals and non-value winds only. Seat and prevalent wind may both score the same pung. |
| Seven Pairs excludes tile-content fans that can still match; several reciprocal entries are incomplete. | Retain the supplied incompatibilities and maximize points. Exclusion affects co-scoring, not structural validity; irregular concealment bonuses cannot reappear if Seven Pairs is dropped. |
| Four Kongs excludes concealed-pung fans, unlike an independent count interpretation. | Preserve this explicit local policy, including on four concealed kongs. |
| “Two/three” counts might mean exactly N, at least N, or repeatable boolean fans. | Kong and concealed-pung inventory families generate only their highest matching tier. This prevents four concealed kongs from bypassing the Four Kongs exclusions via Three Kongs + Four Concealed Pungs. Relational combinations still enumerate subsets. |
| One exposed plus one concealed kong had no combined fan. | Score Melded Kong + Concealed Kong (3); do not invent a fan absent from the table. |
| Melded Hand could incorrectly count the discard-completed standing pung as a declaration. | Require four already-declared exposed sets and a discard-completed pair. |
| Non-Identical might forbid all overlap or allow repeated same-ID fans on shared sets. | Same-ID instances need disjoint supports; different IDs may overlap subject to exclusions and Count-Once. |
| Count-Once prose did not define a unique graph constraint or which fans consume it. | `countOnceCompatible` implements the explicit relational incidence-forest rule with degree at most two. RULES section 5.4 lists participating fan IDs by family. |
| Pairwise conflict checks alone miss Count-Once cycles; greedy selection misses maximum totals. | `selectFans` performs exact branch-and-bound subset search with hypergraph checks, then `scoreHand` compares all interpretations. |
| Ties and input ordering could change the displayed interpretation. | Sort normalized input, fan-instance keys, partitions, and placements, then apply stable lexical tie-breaks. |
| Chicken Hand could be obtained by dropping a low fan, choosing a no-fan interpretation, or flowers could prevent it. | Award only after comparing all interpretations, when none has an eligible non-flower fan; flowers are independent. |
| A 7-point hand plus flowers might be declared a legal win. | Minimum uses `fan_points` only; `valid_win` and `status` distinguish structural wins from qualifying wins. |
| Nonwinning and malformed hands had no defined API behavior. | Separate validation errors, `not_winning`, `below_minimum`, and `winning`; nonwinning hands have no awarded total. |
| Points could be mistaken for settlement/payment calculations. | The engine returns hand fan points only; settlement and external table-history verification are out of scope. |
| The table alone cannot establish correctness for every tournament interpretation. | Include fan fixtures, targeted regressions, enumeration/optimizer checks, and deterministic permutation tests. Tournament certification still requires external adjudication of the documented profile choices. |

The browser displays win source, winning tile, declared/open versus effectively
concealed components, structural waits, and each selected fan's supporting
components. All scoring runs locally in dependency-free JavaScript; Flask only
serves files. There is no AI service, model, remote scoring request, or runtime
rules download.
