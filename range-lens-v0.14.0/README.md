# Range Lens 0.14.0 — Adaptive chips & slower dealing

Chips scale with the available wallet. Initial deals alternate one card to the player and one to the dealer with short pauses. Hits, doubles, split-hand replacement cards, hole-card reveals, and dealer draws are paced individually. Controls stay disabled during the sequence. Final payouts appear after the dealer finishes. Previously dealt cards stay still; the dealer makes a subtle reaching motion. Reduced-motion preferences remove movement while preserving card sequencing.

The completed game state is committed before its presentation sequence, so switching views or reloading cannot replay payouts. Returning skips any interrupted visual sequence and restores the saved round.

# Range Lens 0.13.2 — Wallet-scaled betting chips

Chip denominations now adapt to available coins. The first chip stays at 2, while the others target roughly 10%, 20%, and 50% of the wallet, rounded down to convenient distinct denominations. Small wallets show consecutive low denominations; unaffordable chips are disabled. Large values use compact k/m labels with exact-value tooltips and accessible labels. Chips update after settlement and wallet changes without changing your typed stake or placing any bet.

# Range Lens 0.13.1 — Dealer portrait

The blackjack dealer now has a complete illustrated face and hair, bow tie, fitted waistcoat, brass details, shaped sleeves, cuffs, and defined hands. The portrait sits above the rail with extra spacing to keep the cards readable.

# Range Lens 0.13.0 — Classic blackjack table

Redesigned from the supplied video reference: perspective green felt, polished wood and padded rail, stylized dealer arms, card shoe, fanned ivory cards with burgundy backs, and colored stake chips. Adapted to the compact overlay with separate active split hands. Rules, shared wallet, and saved rounds remain the same. Stake chips select 2, 10, 20, or 50 coins, subject to balance and round state.

# Range Lens 0.12.0 — Pond cleanup & Blackjack

The fishing rod is now drawn clearly above the shoreline, with a visible cork grip, reel, curved shaft, and line from the tip. Fishing and Casino tabs sit beside Market inside the panel.

Blackjack uses your existing fictional fishing coins. No new real-money functionality or permissions. Six decks reshuffled per round, dealer stands on soft 17 and checks for blackjack before player actions. Naturals pay 3:2, regular wins 1:1, pushes return stakes. Even bets, minimum 2 coins. Double on any first two cards (including after splits), receiving one final card. Split same-rank pairs up to four hands. Split aces get one card and cannot be resplit; split 21 pays 1:1. No insurance or surrender. Extra stakes require sufficient coins. Active rounds and the wallet are saved together; leaving the game does not refund a live bet. Use one game instance at a time.

Install by updating the existing unpacked folder and reloading the extension to keep the same ID and saved progress. Standalone preview and extension saves are separate.

# Range Lens 0.11.1 — Stillwater

Open Stillwater from the fishing-break button in the overlay. The bundled game opens inside the Range Lens panel. Back to market returns to the reading; finished catches and purchases stay saved, while an unfinished cast ends. Hold the button or Space to cast; release to choose distance. Wait for Fish on, press to hook, then alternate reeling and easing line tension. Catches are saved automatically in the basket. Sell them for coins at the basket; spend coins at Tackle. Purchased bait is consumed on casting. Earthworms are unlimited. The Journal keeps your biggest specimen of each species.

One pond, six species, three bait types, three rods. Deeper water and special bait improve rare-fish odds; stronger rods improve control. The economy is entirely fictional. No additional permissions, downloads, market integration, or external assets are required.

Progress uses browser local storage on the extension's own origin. Use one game tab at a time. Keep the same unpacked extension folder and extension ID to preserve saves across updates; moving the installation can change the ID. Clearing extension/site data clears progress. The standalone demo saves separately from the installed extension. If storage is unavailable, the game displays that status.

Game pauses when its tab is hidden. Leaving a cast costs any bait already used. Reduced-motion preferences simplify the pond animation.

Previous market release notes:

# Range Lens 0.10.0 — a clearer first view

New presentation: one plain-language chart direction headline and one watch message; an actual 40-bar chart-timeframe sparkline; a smoother price-position marker; softer colors and clearer spacing; numbered target zones appear after entry. Secondary readings and all explanations remain under Details. Live status pulses only when every required feed is fresh; paused or missing-data states do not imply live guidance. Reduced-motion preferences disable transitions and animations.

Preserves 10m aggregation, chart-timeframe targets, distinct merged zones, market detection, and existing guardrails. Public market reference data is still Kraken spot.

Validation: all automated checks pass. Browser preview verified with synthetic data: entry and targets, 10m selection, pause/resume, unknown timeframe, and Details. Live exchange behavior was not exercised.

Install: extract the ZIP, load the range-lens-v0.10.0 folder as an unpacked extension, refresh the chart page, and open Range Lens. Open demo.html for the interactive synthetic preview.


Updated in 0.10.0:
- Compact 320px panel; explanations, target sources, setups, trends, history, and feed information are under one closed Details disclosure.
- Targets and range analysis follow the selected chart timeframe, including 10m. The 10m feed aggregates complete, consecutive UTC-aligned pairs of closed 5m candles; incomplete groups are excluded.
- Nearby target structures merge into zones spanning at most 0.5 chart-timeframe ATR. All contributing sources remain available under Details. Up to three distinct zones are ordered nearest first; the percentage uses the near edge.
- Automated tests pass, including aggregation, merged zones, and 10m UI state. Browser layout and live exchange integration have not been verified in this update.

Install: extract this ZIP, remove the older Range Lens extension, then use Load unpacked and select range-lens-v0.10.0. Refresh the chart page and click the extension icon. The build number is shown under Details and in the header tooltip.

Changes:
- No permanent long/short invitation attached to historical floor/ceiling labels.
- Independent chart momentum veto: local EMA trend, three-bar movement of at least 1 ATR, or live reference movement from the last close of at least 0.7 ATR blocks the opposing range setup. Conflicting momentum blocks both sides.
- Each 5m/15m/1h/4h trend component can veto a countertrend setup, even when the combined label is Mixed. These are conservative heuristic filters, not calibrated prediction probabilities.
- Beyond the boundary, entries are suspended and the panel describes possible breakout/breakdown rather than encouraging a reversal trade.
- Detects readable market headings, with URL/title fallback, every second. Switches the reference using Kraken's available spot market catalog. Exact quote is preferred; USD fallback is explicitly labeled for USDT/USDC charts. Unsupported or ambiguous markets clear analysis rather than retain the previous coin. KEC is not assumed to mean another token.
- Market changes clear entered trade prices and ignore delayed responses for the previous coin. Small-price tokens retain more decimal places.

Limitations: best-effort readable browser charts, not universal screen recognition. Canvas-only symbols, inaccessible frames, and unfamiliar layouts may not be detected. This has not been verified against the user's live KCEX DOM. Click the extension on each new tab. No screen capture, account access, orders, or notifications. Permissions remain activeTab, scripting, and Kraken public API access.

UI/chart detection ticks every second; candles/reference price fetch approximately every 15 seconds, with retries and API latency. This is not a one-second trading feed. Spot reference candles can differ from futures candles. Closed-bar filters lag; they cannot guarantee catching a pump or avoiding a loss. Structural take-profit candidates describe levels, not an endorsement of an existing trade.

Validation: automated engine, feed, timeframe, dynamic market catalog, momentum, and UI state/race tests. UI tests use DOM doubles; no live browser layout or market-performance validation.

## Earlier method notes

# Range Lens 0.7.0 — Structure & Fair Value Gaps

## Install / update
Extract this ZIP. Open chrome://extensions or edge://extensions, remove the old Range Lens, enable Developer mode, click Load unpacked, and select `range-lens-v0.7.0`. Refresh KCEX and reopen the extension. Its header must say `Structure & gaps • v0.7.0`.

No new permissions. The icon opens a movable overlay on the current ordinary web page. Drag the header; − minimizes; × closes; pause freezes guidance. The chart timeframe is detected from visible selected controls (best-effort DOM detection). The market follows the visible chart; changing it clears the entered trade price. Unknown/ambiguous timeframe suppresses chart analysis.

## What changed
The old 10th/90th percentile range calculation and midpoint/quarter take-profit shortcuts have been removed.

1. Confirmed swing highs/lows form price clusters.
2. The engine scans historical consolidation windows chronologically and pins qualifying range boundaries.
3. Two closed candles beyond a boundary mark a range break. The first later boundary retest is recorded as held or failed based on that candle's close.
4. Three-candle fair value gaps are detected and tracked through subsequent closed candles as untouched, partial, filled and/or invalidated.
5. My trade targets are the nearest qualifying historical range boundaries, repeated swing levels or unfilled/non-invalidated FVG edges ahead of entry AND current price. Every target explains its source. Fewer than three targets, including none, is allowed. No range fractions are invented.

The expandable Market structure panel shows swing direction, the last four detected ranges, the nearest four open FVGs and lifecycle counts. The mini chart still draws range bands, not exact annotations on the KCEX chart. This is deterministic price-structure analysis, not a vision or language model.

## Range rules (heuristic)
Scan up to 720 CLOSED candles. Pivots need two candles on either side; each becomes available only after the second later candle closes. Nearby same-price pivots within two bars are deduplicated. At each closed bar, if there is no active range, try trailing 24, 48, then 72 bars (not crossing the previous range break). Group highs and lows separately using a maximum cluster spread of 0.7 ATR. Both selected clusters need at least two confirmed pivots.

Candidate width must be 2–14 ATR. At least 80% of closes must remain within the bands; first-to-last close displacement must not exceed 65% of width; the newest two closes must remain inside. Score compatible pairs by pivot counts plus containment. Boundary = cluster mean. Band half-width = min(10% of width, 0.4 ATR). ATR is the 14-bar mean true range at formation. Boundaries stay fixed through subsequent bars until two closes break them. A live reference-price move outside is labeled separately; no confirmed range means no invented floor or ceiling.

History is recomputed from the available rolling 720-bar sample, not persisted indefinitely. When formation bars roll out, historical range identification can change. 'Retest held' describes one closed bar, not a guaranteed future defense. Older broken ranges are context, not automatically active support/resistance.

## FVG rules (operational definition)
For three consecutive equal-spaced candles A/B/C:
- Bullish: C.low > A.high and B closes above its open.
- Bearish: C.high < A.low and B closes below its open.
- Require B's body >= 0.5 historical ATR and gap width >= 0.15 historical ATR to filter tiny gaps.
- Gap exists only after C closes. Subsequent bars alone determine its lifecycle; no formation-bar self-fill.
- Partial: a subsequent wick enters the original gap; remaining bounds shrink toward the distal edge.
- Filled: an overlapping subsequent candle's wick reaches the far edge.
- Invalidated: a later close crosses beyond the distal edge. This flag is independent of fill status, so lifecycle counts can overlap. Gap-through closes can invalidate without recording a traded fill.
- Filled or invalidated gaps are excluded from candidate targets.

These definitions are explicit heuristics. FVGs need not fill or produce profitable reactions. No 'institutional order' claims are inferred from candles.

## Existing features retained
- Short-term trend: closed 5m + 15m candles. Broader: closed 1h + 4h candles. Each uses EMA20/EMA50 ordering and ATR-scaled five-bar EMA20 momentum. Mixed means no agreed direction; partial/unavailable is explicit.
- 12h bias light: green bullish, red bearish, gray neutral/mixed/unavailable/paused. Constructed from complete consecutive UTC-aligned 4h groups; minimum 80 closed 12h bars. It describes 12h candle structure, not a next-12-hour forecast.
- Range guardrails: long watch only in bottom quarter; short watch only in top quarter; both wait in middle. Opposing trends, invalid data, unreliable ranges and inadequate reward/risk can block both. Touching an edge alone is not confirmation. These rules do not enforce or block exchange orders.
- My trade: enter price, choose Long/Short, get up to three structural target candidates. Percentages are unleveraged, before costs. Targets update with history and are not broker orders. Targets can exist even without an active consolidation if historical structures qualify, but this does not authorize a new entry.
- Queued/cached feeds; independent backoff/retry; 45-second stale suppression; true 4h aggregation fallback where possible; no keys/orders/screenshots sent anywhere.

## Price source — unresolved limitation
ALL numerical candle data still comes from KRAKEN USD SPOT, not KCEX USDT futures. Reading the selected chart timeframe does not read its candle prices. The KCEX adapter still needs a verified request URL and response schema. Do not treat these as exact KCEX order prices. Source/venue mismatch can change detected pivots, ranges and FVGs.

No persistent user data, trading account access, order execution or price alerts. Only public market requests go to Kraken. Entered trade price stays within the open overlay; it clears on market change or close.

## Validation
Node tests:
- node structure-tests.cjs
- node take-profit-tests.cjs
- node tests.cjs
- node trend-tests.cjs
- node guardrail-tests.cjs
- node setup-tests.cjs
- node feed-tests.cjs
- node fallback-tests.cjs
- node bias-tests.cjs
- node chart-sync-tests.cjs
- node ui-tests.cjs

Synthetic checks cover pinned causal ranges, breakout/retest lifecycle, FVG creation/partial/fill/invalidation, bearish gaps, rejection of missing-bar patterns, no invented range during a trend, structural target provenance, no fractional fallback, data failures and UI control flow. UI tests use DOM doubles, not real browser rendering. Browser visual and live-feed validation were unavailable here. Predictive accuracy/profitability is UNMEASURED; synthetic correctness is not a backtest.

Open demo.html for an offline synthetic-data preview.

## References
https://docs.kraken.com/api-reference/market-data/get-ohlc-data
https://trendspider.com/learning-center/fair-value-gap-trading-strategy/
https://developer.chrome.com/docs/extensions/develop/concepts/activeTab


Validation: automated game, wallet, split/double, market, feed, and UI checks pass. Browser-verified a pair split into two hands, doubled the first to 21, and confirmed Double remains available for the second hand. The supplied screenshot uses a seeded test round; the shipped game has no seeded balances or cards.

Usernames are stored in the shared local wallet. Play with friends connects to the bundled private-table service (see table-server/README.md). The service must be hosted before public internet invites work. Connection permission is requested only for the service address the player chooses. This package does not provision an online host.
