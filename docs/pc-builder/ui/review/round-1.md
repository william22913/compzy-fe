# Design mock review — round 1

Feature: `compzy / pc-builder`. Artifact: `ui/mock/` (23 screens). Reference: the manager's one
Dribbble shot, used for visual language only. Two rounds in all: one full scan (three reviewer lanes
started together — look on the builder screens, look on the auth/review/confirmation screens, docs)
and one re-check after the fix pass.

## What round 1 found, and what changed

### Builder lane

| Finding | Fix, and how it was checked |
|---|---|
| Two filled buttons competed in the hero and the panel, and the hero control pointed at `#cat-cpu`, which no longer existed once 23 screens began sharing one document | The hero control is now a bordered `Start choosing` / `Keep choosing` **button** that scrolls to the first category in script. `mock-sweep` reports no dead link; the control is 48 px tall with a 2 px ink ring |
| On a short viewport the sticky panel ran past the fold and took `Checkout` with it | The panel is capped at `calc(100dvh - 128px)` with a pinned head, total, need line and `Checkout`; only the seven rows scroll. Probed at 1440 × 900: panel 772 px, rows 459 px in a 645 px box, Checkout at 1810 |
| Between 721 and 1000 px the build had no usable home | The build bar and its sheet start at 1000 px; the sheet sits above the bar (`bottom: 68px`, z 50 over 45) and reports `aria-expanded`. Opened and closed at 1000 / 720 / 390 |
| A chosen card said its state twice (inset frame plus an "In your build" label) | Label removed; the frame and the `Remove` control carry it. `mock.js` no longer touches a per-card data-state |
| The order rows were `div`s inside a `div`; the gone row was set in uppercase micro type and was hard to read | The rows are a `ul` of `li`; the gone row keeps the struck part name and price in normal case with a `No longer available` tag |
| The confirmation's reference read as a clipped heading | It is now a `Order` label above `CZ-1042` at `--fs-num`, in its own block. Element zooms at 3× show complete figures; nothing clips |
| The seal's ring text overflowed its path (357 px on a 251 px path) | Ring text shortened to "Compzy · Built part by part ·", measured 218 px on a 251 px path, and made `aria-hidden` |
| The submitting button was unreadable (~1.7:1) and was a fake disabled span | A real `disabled` button with a muted fill: paper on `#63605a` ≈ 5.6:1 |
| The loading hero showed `Rp 0`, which read as a real total | Loading and error show `-`; the error adds `Try again` |
| Tap targets below 24 px on phones | `.nav a`, `.textlink`, `.prow__remove` and the footer links take 32–44 px minimum height at ≤ 720 px |

### Auth / review lane

| Finding | Fix, and how it was checked |
|---|---|
| Create account stayed two columns at ≤ 1000 px: `.split:has(.flip)` outranked the media query | The flipped split is reset inside the 1000 px block. Page `scrollWidth` equals the viewport at 390 / 720 / 1000 for every auth screen |
| The duplicate-email state lost its "Sign in instead" link and the error's flex row broke the sentence | The link is back inside the sentence, the message is wrapped in one flex item, and at ≤ 720 px the in-sentence link stays inline instead of taking a 44 px tap box |
| The review's footnote, the aside's role and the confirmation's meta list did not match the built screens | Text and rows re-derived from `index.html`: the aside carries "This is the total that will be recorded with the order.", the seal is `aria-hidden`, the meta shows Placed and Parts, and the confirmation repeats the seven rows and the final total |

### Docs lane

| Finding | Fix |
|---|---|
| The map and brief described `.rise` entrance motion (MO-001 / MO-008) that the mock no longer has | Both files now state the real motion set: two loops (ribbons 64 s, seal 40 s), 180 ms feedback, skeleton shimmer, and nothing entering or fading |
| Tokens `--night-raised`, `--fs-d3` and `--dur-slow` were documented and no longer existed; three raw `50%` radii were not tokens | The unused tokens are deleted; the three circles became `--r-full: 50%`; the token tables list what `:root` holds |
| Type claims were off: `--fs-d1` was credited with the category titles, `--fs-total` with the hero total, and the confirmation's reference with a 720 px drop | Measured on the built mock: hero 92.16 px at 1440 and 46.8 px at 390, page H1 77.76 px, category title 46.08 px (it is `--fs-d2`), hero total 38.88 px (`--fs-s2`), `--fs-total` only on the review's final total, reference 36 px at every width |
| Evidence cited paths outside the feature and a stale finding count | The focus-ring evidence is `ui/review/focus-probe.txt`, generated from the built mock; the sweep's own output is `ui/review/sweep.json`; every path in the docs points into this feature |
| The brief mirrored the split wrongly (both forms "form left, photo right") | Sign in is form left / photo right; Create account is the mirror. Confirmed in the markup (`flip-body` + `flip` on the sign-up screen only) |

## Re-check (round 2, mechanical)

| Check | Result |
|---|---|
| `mock-sweep.mjs`, 23 screens × 4 widths (1440 / 1000 / 720 / 390) | No console error, failed request, blank screen, overflow, broken image, contrast failure, dead link or DRIFT. 6 distinct findings, all focus-ring readings on links below the fold |
| Focus rings, measured after scrolling into view (`focus-probe.txt`) | Footer links `rgb(243,242,238)` on `rgb(10,10,10)` = 17.67:1; form-foot, field-error and header links `rgb(20,20,20)` on `rgb(243,242,238)` = 16.45:1. The sweep's 1:1 readings are its probe landing above the element, not the ring |
| `mock-coverage.mjs` | 5/5 pages, 40/40 mapped REQs, 0 dead links |
| `fidelity-sheet.mjs` | `#builder-empty` ↔ `hero.png`: **PASS** — palette 0.207, textured area 76 % of the reference's, layout 0.21 |
| Overflow and tap targets at 390 / 720 / 1000 / 1180 / 1440 | No screen scrolls sideways at any width. The only elements past the frame edge are the drifting ribbon tracks, which are wider than the page by design and clipped. One control measures 14 px tall: the in-sentence `Sign in instead` link inside the duplicate-email error, kept inline on purpose (WCAG 2.5.8's inline exception) |

## Scorecard

| Category | Score | Basis |
|---|---|---|
| Reference fidelity | 92 | One anchor passes on colour, texture and layout; the disc behind a word, the tilted two-strip seam, the plate cards, the turning seal and the night footer are all present in the reference's arrangement |
| Typography and hierarchy | 90 | One Didone display face, one sans, six-step display scale, tabular figures; measured sizes agree with the token table at every width |
| State coverage | 95 | 23 screens cover every state the map names, including the part-gone recovery, loading and error |
| Responsive behaviour | 91 | Four breakpoints exercised; hero, splits, panel and sheet verified at 1440 / 1000 / 720 / 390 with no overflow |
| Accessibility | 89 | 16.45–17.67:1 focus rings on their real ground, AA text contrast, labelled fields, `aria-pressed` / `aria-expanded` / `role=status` where they belong; the in-sentence link is the one place a 44 px target is deliberately not applied |
| Motion | 88 | Two loops on long, slow periods and one 180 ms feedback curve; a single reduced-motion query removes all of it; no entrance motion to misfire on a state change |
| System consistency | 96 | Every colour, size, radius and shadow in a screen rule comes from the token block; no DRIFT reported |
| Docs accuracy | 91 | Every claim in the map and brief re-derived from the built mock in this pass; the numbers quoted above are measured |
| Source honesty | 93 | The reference is cited once, as visual language only; stock photography is licensed and credited; mock values (`CZ-1042`, the date, `Rina`) are marked as such |
| Preview readiness | 95 | One document, one hash per screen, `screens.json` ordered, switcher hidden, no network request, 1.6 MB |

All ten categories are above the 85 bar.

## Still below the bar, named

- **Product photography is stock.** The 21 parts use licensed stand-ins until the store supplies real
  shots; the layout is built for them (4:3 plate, `object-fit: cover`).
- **The focus-ring lines stay in `sweep.json`.** They are a probe artifact, documented and measured
  against the real paint; silencing them would mean changing the mock for the checker.
- **The 721–1000 px band has no sticky column.** It uses the bar and its sheet instead, which is a
  deliberate layout choice, not a gap in the states.

Verdict for the manager: the mock is ready to look at in `/ui-preview`. The look is the manager's
call; this scorecard records what the three lanes checked, and what was fixed.
