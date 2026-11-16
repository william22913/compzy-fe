# Design mock review — round 1, language revision

Feature: `compzy / pc-builder`. Artifact: `ui/mock/` (24 screens — the 23 of v1 plus the not-found
page). Reference: the manager's one Dribbble shot, used for visual language only. Two rounds in all:
one full scan of four reviewer lanes started together — look on the builder screens, look on the
auth / review / confirmation / not-found screens, docs accuracy, Indonesian copy and i18n behaviour —
and one re-check after the fix pass.

The v1 look is approved and merged (PR #77). This pass changes two things only: a language switcher on
every page, and Indonesian copy for every string. Everything the scan found is judged against that:
a layout, colour, picture or component that moved is a defect, and so is Indonesian that reads like a
translation rather than copy.

## What the scan used

- 72 full-page screenshots: all 24 screens at 1440 and 390 in Indonesian, and all 24 at 1440 in
  English for comparison.
- `mock-coverage.mjs`: 6/6 pages, 55/55 REQs, 0 dead links.
- `mock-sweep.mjs`: 24 screens × 6 widths, reduced motion, 7 distinct findings — all the known
  focus-ring probe artifact (Open design gaps #2).
- The dictionary extracted entry by entry (142 entries: 135 `ID`, 1 `HTML_ID`, 6 `PAGE_ID`), plus a
  browser walk of all 24 screens checking the ID→EN→ID round trip, the translated attributes, the
  document title and `<html lang>`, and that a switch keeps a chosen part, the total and a half-typed
  email.

## Builder lane — 9 screens

| Finding | Fix, and how it was checked |
|---|---|
| The seventh category had no dictionary entry: `Motherboard` stayed English in the category head, the panel row and the review rows across 12 screens | `Motherboard` → `Papan Induk`. Re-read in the browser: all seven category heads, all seven panel rows and all seven review rows are Indonesian, in both the title and the attribute text |
| The footer's rule-of-the-store paragraph ran to four lines and left `pengiriman.` alone on the last | Copy shortened to `Tujuh kategori, satu komponen tiap kategori, kartu grafis opsional. Harga dalam rupiah, tanpa pajak dan biaya kirim.` — now three full lines |
| The panel's fine print wrapped with `Indonesia.` orphaned on a second line (English fits one) | `Tanpa pajak dan biaya pengiriman. Harga dalam rupiah.` — one line at 1440 |
| The checkout-refusal notice doubled the obligation (`kategori wajib harus terisi`) and ended on a one-word line at 390 | `setiap kategori wajib berisi satu komponen`; the optional sentence shortened to `Kartu grafis opsional.` |
| The facts strip's fourth cell ran to three lines at 390, ending on `lengkap` | `rakitan menengah lengkap` — two lines, matching its pair |
| The footer bar's tagline broke with only `KOMPONEN` on its second line | `PC kustom, dirakit komponen demi komponen`, here and in the footer note |
| Signing out said `masukkan kembali akun Anda` — not idiomatic | `Rakitan Anda masih tersimpan. Untuk melanjutkan pemesanan, silakan masuk kembali.` |
| The hero and footer read `satu komponen di masing-masing` — translationese | `masing-masing satu komponen` |

Confirmed and unchanged: the switcher is native on all nine — same 32 px baseline as the nav, 11 px
Archivo uppercase with `.14em` tracking, the vermilion square and the ink underline on the active
language, one hairline separator, no box. Photos, seal, ribbons, colours and rules are the v1 ones.

## Auth / review / confirmation / not-found lane — 15 screens

| Finding | Fix, and how it was checked |
|---|---|
| The order rows printed `OPTIONAL` under the graphics card in Indonesian: the label is drawn by CSS (`.orow--optional .orow__cat::after`), so the dictionary never saw it | An `html[lang='id']` rule supplies `opsional`. Measured on `#review-default` in both languages: `"optional"` / `"opsional"` |
| `PENYIMPANAN (SSD)` wrapped to two lines in the review's 120 px category column, the only two-line label, nudging the row rhythm | Column widened to 136 px; all seven category labels now sit on one line at 1440 and 390 (the optional row's cell is 32 px tall at 1440 because it carries the `opsional` line under the name) |
| The not-found page was a 62 ch column centred in the page, so it read as an accidental inset block, its Indonesian headline broke `HALAMAN / INI TIDAK / ADA` and the CTA said `perakit` where the nav says `Rakit` | The page now sits on the page grid in a 44 rem column (`margin-inline: 0`) and its headline breaks in two lines in both languages — `HALAMAN INI / TIDAK ADA`, `THIS PAGE / IS NOT HERE`, measured at 1440 and 390. The action is `Kembali ke Rakit PC`; the brand link's `aria-label` follows (`compzy, kembali ke Rakit PC`) |
| The narrow picker's hairline rule was the same as the nav's current-page rule, so `BAHASA INDONESIA ▾` read as another link | The picker's rule takes the accent (paper, and on-night on the confirmation), the same mark the wide form gives the active language. Measured in both languages |
| Sign-in said the build `kembali bersama Anda` — literal; the ended-session line was unclear; the confirmation said `Simpan referensi ini.` | `Rakitan Anda akan tersedia kembali setelah Anda masuk.` / `…setelah Anda membuat akun.`; `Masuk kembali untuk menyelesaikan pesanan ini. Rakitan Anda akan tersedia kembali dan tidak ada pesanan yang dibuat dua kali.`; `Simpan nomor pesanan ini.` |
| The review's lede (`termasuk kartu grafis`) implied the graphics card was required | `Satu komponen di setiap kategori wajib, ditambah kartu grafis.` |
| The confirmation's footnote used `diambil` and `detail` — literal | `Tidak ada pembayaran yang diproses dan tidak ada data pengiriman yang diminta. Pesanan sudah tercatat di toko.` |

Confirmed and unchanged: the English screens still read as the approved v1 apart from the inserted
switcher; the split layouts, the night confirmation and the footer are untouched by the revision.

## Docs lane

| Finding | Fix |
|---|---|
| The not-found action was described as bordered; the mock draws `.btn` (filled ink) | Both docs say filled `Back to the builder` |
| The narrow picker was described as `nano` at 1180 px down; it is the label size to 769 px, nano from 768, tiny at 430 down | Corrected, with the accent rule and the chevron |
| The active language's underline was called ink everywhere; on the night confirmation it is `--on-night` | Corrected |
| “The mock redraws text nodes, not the DOM” understated the switch: the mock also rewrites `alt` / `aria-label` / `placeholder` / `title`, re-renders the hero and refreshes the panel rows | Corrected |
| The control's form (two buttons above 1180, the platform picker below, the flip) was stated as fact; the spec asks only for a switcher with two choices | Now marked `assumed` in Open design gaps #8 and in **Language**, and the Indonesian wording likewise awaits `/ui-preview` |
| Three rows v1 tagged `assumed` (REQ-011, REQ-030, REQ-041) were re-tagged `derived` without saying so | The mapping intro now says it and the reason: each is the state the spec makes visible, not a choice of this pass |
| The sweep evidence in the docs did not match the stored run (23 screens × 4 widths, motion on) | Re-run on the final mock: 24 screens × 6 widths, reduced motion, stored in `ui/review/sweep.json`, and the paragraph quotes that run |
| Assumption 19 still said `Motherboard` stayed in English; the docs never mentioned `.nav a { white-space: nowrap }` or the review row's 136 px column | All three corrected |
| The polish review named `round-1.md` for v1's scorecard, which this revision now uses, and repeated its fidelity sentence | v1's is kept as `round-1-v1.md`, the fidelity sentence appears once, the evidence list names this revision's two scorecards |

## Copy lane

142 dictionary entries, 0 dead keys, 0 no-op keys. The one actionable gap (`Motherboard`) is fixed.
The 24-screen round trip is lossless in both directions, the document title and `<html lang>` follow
the switch, and a switch keeps a chosen part, the total and a half-typed email. The only strings that
stay identical in both languages are the ones that must: product model names, `Rp` amounts, `CZ-1042`,
`Total`, `RAM`, `compzy`.

## Decisions this pass made, which the manager sees in `/ui-preview`

- `Papan Induk` rather than the trade loanword `Motherboard`, to match `Kartu Grafis` and `Catu Daya`.
- `Komponen 01` for the part plates: the item is a `komponen` everywhere else on the page.
- The Indonesian hero keeps the v1 composition — the vermilion disc on `PC` — as `RAKIT ⓟC / ANDA /
  SENDIRI` (2 lines at 1024 and 390, 3 at 1440; never more than the English). Moving `PC` to the last
  line would have forced `Rakit sendiri PC`, which is not Indonesian.
- The not-found page stays one quiet column with one action and no photograph or seal: it has nothing
  to sell, and the dark footer closes it. Its grid alignment and its two-line headline are the fixes
  the lane asked for.
- The seal ring keeps `Compzy · Dirakit bertahap ·`: the phrase is shortened to fit a 251 px path, and
  the full tagline is already in the footer and the document title.
- The picker's group label stays `Bahasa` / `Language`; `Pilih bahasa` was suggested and rejected as
  longer than the group it names.
