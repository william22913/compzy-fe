# Design mock review — round 2, re-check

Feature: `compzy / pc-builder`. Artifact: `ui/mock/` (24 screens). This is the one re-check after
round 1's fix pass: two lanes started together — look on the fresh pixels, and docs / copy / i18n —
then the fixes they implied were applied and measured. There is no third round.

## What the re-check used

- 72 screenshots captured after the fix pass: every screen at 1440 and 390 in Indonesian, every screen
  at 1440 in English.
- A single-word-last-line scan at 390 over every text node on every screen, reporting which words sit
  on the last rendered line (not an estimate from string length).
- `langcheck.js`: ID→EN→ID round trip on all 24 screens, the translated attributes, the document
  title, `html[lang]`, and a chosen part, the total and a half-typed email surviving the switch —
  **0 problems**.
- The dictionary extracted entry by entry: **142 entries** (135 `ID`, 1 `HTML_ID`, 6 `PAGE_ID`),
  0 dead keys, 0 gaps, 0 no-ops.
- `mock-coverage.mjs` on the final mock: **6/6 pages, 55/55 mapped REQs, 0 dead links**.
- A post-fix sweep pass over all 24 screens × 6 widths in two batches (17 then 7, `--only`), reduced
  motion: only the recorded focus-ring probe artifact, no overflow, console error, contrast failure,
  broken image, dead link or DRIFT, and the 1181 / 1180 flip and the night confirmation included.
- `ui/review/header-fit.txt`: 108 measurements — three screens (builder signed out, builder signed in,
  night confirmation) × 18 widths from 360 to 1440 × two languages — no horizontal overflow, the
  switcher inside the header and its cluster's items clear of each other every time; the same file
  measures the switcher's focus ring at 16.45:1 on paper and 17.67:1 on night.

## Look lane — round 1's fixes, checked in the pixels

| Round 1 item | Result |
|---|---|
| `Motherboard` → `PAPAN INDUK` in the category heads, the panel rows and the review / confirmation rows | Holds on all 12 screens that carry it; no visible English left in Indonesian, and English still reads `Motherboard` |
| Footer's rule-of-the-store paragraph, three full lines, no one-word last line | Holds on all 24 screens at 1440 and 390 in both languages |
| Panel fine print on one line at 1440 | Holds on every builder screen |
| Checkout-refused notice, no one-word last line at 390 | Holds; reads `setiap kategori wajib berisi satu komponen` and `Kartu grafis opsional.` |
| Facts strip's fourth cell, two lines at 390 | Holds — `rakitan menengah / lengkap`, matching the English `a complete mid-range / build` |
| Footer-bar tagline on one line at 390 | Holds in both languages |
| `OPSIONAL` under the graphics card, all seven order-row labels on one line | Holds at 1440 and 390; the label is drawn by CSS off `html[lang]` |
| Not-found page on the page grid, two-line headline in both languages, filled action, no photograph | Holds — 48 px gutter at 1440 / 20 px at 390, same as sign in and review; `HALAMAN INI / TIDAK ADA`, `THIS PAGE / IS NOT HERE`; `KEMBALI KE RAKIT PC` |
| Narrow picker over the accent rule, header still fits | Holds — a 1 px vermilion rule, the picker at the header's right edge, `MASUK` on one line, the wide form untouched |
| English unchanged apart from the inserted switcher | Holds — same gutters, wraps, photographs and rules as the approved v1 |
| One switcher, once, on all 24 screens at both widths | Holds — same right cluster signed in and signed out |

## Docs and copy lane — what it confirmed

Every structural claim in `UIMap.md` and `DesignBrief.md` matched the built mock: the two-control
flip at exactly 1180 / 1181 px, the label / nano / tiny sizes at 769 / 768 / 430, the active square and
underline (and its on-night ink), `aria-pressed`, the translated `aria-label`, `html[lang]` and the
document titles on all 24 screens, the 44 rem not-found column and its two-line headline, the 136 px
order-row column and the CSS-drawn `opsional`, the token list with no DRIFT, and the sweep evidence
stored in `sweep.json` matching the paragraph that quotes it. The i18n mechanics passed end to end;
the only strings identical in both languages are the ones that must be (product model names, `Rp`
amounts, `CZ-1042`, `Total`, `RAM`, `compzy`, the two language names).

## Corrections to round 1's scorecard

Round 1 measured four things slightly wrong; `round-1.md` is corrected where it was a miscount, and
the rest is recorded here rather than rewritten.

- The dictionary holds **142** entries (135 `ID`), not 141 (134). Corrected in `round-1.md`.
- "All seven category labels measure 16 px tall": six do; the optional row's cell is 32 px at 1440
  because it carries the `opsional` line under the name. Corrected in `round-1.md`.
- The 136 px column had been documented only for the category plate, not for the order rows where the
  fix was needed. Now both are documented.
- The facts strip's fourth cell is two lines, but its last line is `lengkap` alone — the same shape
  as the English cell, which ends on `build` alone at the same width. Left as drawn, because it
  mirrors the approved composition; listed under the residue below.

## Fixes applied after the re-check

The re-check found one class round 1 had not cleared: a few one-word last lines at 390 px, in
Indonesian only. Seven strings were rewritten and re-measured in place.

| Before | After | At 390 |
|---|---|---|
| `Opsional. Pilih satu untuk bermain game atau mengolah video.` | `Opsional. Pilih satu untuk game atau mengolah video.` | 2 lines → 1 line, on all seven builder screens |
| `Kingston Fury 16GB DDR4-3200 tidak lagi ditawarkan.` | `Kingston Fury 16GB DDR4-3200 tidak tersedia lagi.` | last line `ditawarkan.` → `tersedia lagi.` |
| `Akun memungkinkan Anda membuat pesanan. Rakitan Anda tetap persis seperti yang Anda tinggalkan.` | `… Rakitan Anda tetap persis seperti semula.` | last line `tinggalkan.` → a full clause |
| `7 komponen, Rp 12.020.000. Rakitan Anda akan tersedia kembali setelah Anda membuat akun.` | `… Rakitan Anda tersedia kembali setelah akun Anda dibuat.` | last line `akun.` → a full clause |
| `Satu komponen di setiap kategori wajib, ditambah kartu grafis. Membuat pesanan tidak memerlukan pembayaran.` | `… ditambah kartu grafis. Tanpa pembayaran.` | last line `pembayaran.` → a full clause |
| `Pesanan Anda tidak dibuat. Pilih RAM lain dan total di bawah ini adalah total yang akan Anda konfirmasi.` | `… Pilih RAM lain, lalu konfirmasi total di bawah ini.` | last line `konfirmasi.` → a full clause |
| `PC kustom, dirakit komponen demi komponen` (hero eyebrow) | `PC kustom, komponen demi komponen` | 2 lines with `komponen` alone → 1 line, matching the English eyebrow |

After the rewrite the scan reports two one-word last lines left in Indonesian at 390, both listed
under the residue below. English was not touched: it still shows round-1-era breaks such as
`payment.` alone in the review lede, which is the approved v1 behaviour and not in scope.

## Docs corrected in this round

- `REQ-051` quoted a sentence the mock does not contain (`Pilih komponen yang Anda inginkan.`); it now
  quotes the lede that ships.
- The `REQ-042` row said the two-form header as if it were the requirement; the row now says the
  requirement is spec, the form is `assumed` (Open design gaps #8), matching the paragraph above it.
- `DesignBrief.md` now says in the same place that the form is drawn for the manager's approval, so
  the brief does not read as if the spec fixed it.
- The order rows' 136 px grid and the CSS-drawn `optional` / `opsional` are documented in the
  component table.
- The header-fit and focus-ring claim now cites `ui/review/header-fit.txt` and the 108 measurements
  behind it, and that file is in the evidence list.

## What is still below the bar

- The footer's display line ends `Pesan.` alone at 390. It is three sentences set as three beats
  (`Pilih komponennya. / Pantau totalnya. / Pesan.`), the same shape as the English `Pick the parts. /
  Watch the total. / Order it.` — a composition, not an orphan.
- Product model names wrap mid-name at 390 (`Cooler Master MWE 650 / Bronze`). REQ-050 forbids
  translating or shortening them, so the break is carried.
- The facts strip's fourth cell ends `lengkap` alone at 390, matching the English `build`.
- The nav says `Rakit` while the footer and the not-found action say `Rakit PC`, mirroring the English
  `Build` / `Back to the builder` pair.

## Scorecard

| Area | Score | Note |
|---|---|---|
| The approved v1 look, kept | 10 | No layout, colour, photograph, type size or component moved; the only English change is the inserted switcher |
| Switcher — presence and placement | 10 | Once on all 24 screens, both widths, signed in and out, never in a form or the footer |
| Switcher — its own style, 360–1440 px | 10 | 108 header measurements, no overflow, no wrapped control, the accent rule on the narrow form |
| Indonesian copy | 9 | Complete, formal `Anda`, one term per thing; the four residue lines above |
| Line breaks in both languages | 9 | Two one-word last lines left, both matching English behaviour or a product name |
| i18n behaviour | 10 | Lossless round trip on 24 screens, title and `lang` follow, picks / total / typed input survive |
| Docs accuracy | 9 | Every claim now matches the mock and the stored evidence; the fidelity sheet is still the v1 one by design |
| Evidence | 10 | Coverage, two sweep passes, header-fit, focus probe, dictionary walk and 72 screenshots, all stored or reproducible |

**Overall: 9/10 — ready for the manager's `/ui-preview`.** `derived_confirmed` stays empty until that
approval; the design PR carries `version: 3` and `status: complete` with this scorecard as the basis.
