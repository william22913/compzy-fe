# pc-builder — Frontend test and delivery results

| | |
| --- | --- |
| Service / feature | `compzy` / `pc-builder` |
| Revision | v2 — English/Indonesian language switcher, Indonesian copy, device memory, saved account language (REQ-042 to REQ-060, TC-067 to TC-099) |
| Repository | `compzy-fe` (this repository) |
| Branch tested | `feat/pc-builder-dev-language-switcher` → PR into `feat/pc-builder` |
| Tested code commit | `e3303cd` — the code commit under test (this file is committed on top of it) |
| FE PR | [#2](https://github.com/william22913/compzy-fe/pull/2) into `feat/pc-builder` |
| Docs | spec v2 · testcase v2 · architecture v2 · database v2 (`docs/pc-builder/VERSION.md`); design v3, 24 mock screens |
| API contract | `compzy-be` `api/openapi.yaml` at `feat/pc-builder` `da1925a` — 896 lines, SHA-256 `9cacc6d21a716648994fa391669da1fa6f8968b61c13ec5dcfe3be4cb3c94a62` |
| Date | 2026-11-16 |

## What this revision changes

The app opens in Indonesian, a two-choice switcher (two labelled buttons above
1180px, a native picker at and below 1180px, marked by a 1px vermilion rule)
sits in the header's right cluster on every route and state, the whole page
rewrites in place when it changes, and the choice is remembered on the device
(`localStorage["compzy.lang.v1"]`) and, when signed in, saved to the account
with `PUT /api/v1/auth/me/language`.

Unchanged, and verified so: layout, type, colour, every screen's structure,
checkout, totals, the order flow, and the package list. No nexcomponent,
nexcommon, Ant Design or i18n library was added; `package.json` is untouched.

## Environment used for every check

| Piece | What ran |
| --- | --- |
| Backend | `compzy-be` at its merged `feat/pc-builder` state (`da1925a`), built from source: `go run ./cmd/api` on `127.0.0.1:8080`, `APP_ORIGIN=http://localhost:8081` |
| Database | PostgreSQL 16, migrations `0001`–`0005` applied, `seed` run: 7 categories / 21 parts, Graphics Card optional |
| Frontend | `npm run build`, then `npx vite preview --port 8081` with `VITE_API_PROXY=http://localhost:8080`, so the browser talks to the API on its own origin exactly as the shipped nginx does |
| Browser | Chromium at `$NEXAI_CHROMIUM_PATH` driven by Playwright; desktop `1440×900`, phone `390×844` (touch) |
| Accounts | Created through `POST /api/v1/auth/register` with a unique address and an explicit `preferred_language`, so the English journeys keep an English account and the language journeys an Indonesian one |

## Checks

| # | Check | Command / tool | Result |
| --- | --- | --- | --- |
| 1 | Lint | `npx eslint .` | **PASS** — 0 errors, 0 warnings |
| 2 | Build | `npm run build` | **PASS** — `index-*.css` 29.15 kB (gzip 6.07), `index-*.js` 222.88 kB (gzip 69.32); no warnings |
| 3 | Unit tests | `npx vitest run` — 7 files | **PASS** — **51 tests**, 0 failed (language store, dictionaries, fallback, build storage, money, validation, adapters, builder page) |
| 4 | E2E, real backend | `APP_URL=http://localhost:8081 npx playwright test` — 6 spec files, desktop + phone | **PASS** — 107 passed, 3 skipped (viewport-gated), 0 failed (3.0 min) |
| 5 | Design fidelity | `mock-sweep.mjs` sweep of the v3 mock and of the app, `--compare`, both widths | **PASS** — see the fidelity table |
| 6 | Polish checklist | Scripted sweep checks plus the nine-item pass below | **PASS** — see the polish table |
| 7 | Error contract | `tests/e2e/error-contract.spec.js` — every code the frontend renders, stubbed at the API boundary, in both languages | **PASS** — 8 cases × 2 viewports = 16 tests |
| 8 | Docker image and nginx | `verify_stack` on `docker-compose.yml` | **PASS** — image built, web healthy, `GET / → 200`. The cross-repository preview stack is rejected by the runner's build-context policy (see the Docker table) |
| 9 | Security review | check-only review of the diff (see the security table) | **PASS** — one low finding, accepted with a reason; no high or critical |
| 10 | Code review | `pr-review-toolkit` reviewer over the full diff against the docs | **PASS after fixes** — 2 findings: 1 fixed, 1 rejected against the v3 design |
| 11 | Real backend run | every journey above ran through the Vite preview origin against the live Go API and PostgreSQL, not a mock | **PASS** |

### E2E result per spec file

Both projects run every file. "Skipped" is a test that belongs to the other
viewport (the desktop panel column vs the phone build bar) or is phone-only.

| Spec file | Tests | Desktop | Phone | Covers |
| --- | --- | --- | --- | --- |
| `builder.spec.js` | 7 | 7 passed | 7 passed | catalogue, prices, choose/remove and totals, refused checkout, build across a reload, vanished part, catalogue failure and retry, optional graphics card |
| `auth.spec.js` | 8 | 8 passed | 8 passed | sign-in validation and wrong credentials, sign-up and landing signed in, duplicate email, password rule, ended session, sign out, crafted `?return=` |
| `checkout.spec.js` | 5 | 5 passed | 5 passed | guest sent to sign-in with the build kept, order placed, confirmation reloaded from the API, empty review, signed-out confirmation, unknown order |
| `language.spec.js` | 22 | 21 passed, 1 skipped | 22 passed | TC-069 to TC-099 as mapped below |
| `error-contract.spec.js` | 8 | 8 passed | 8 passed | `UNAUTHENTICATED`, `PART_UNAVAILABLE`, `TOTAL_CHANGED`, `BUILD_INCOMPLETE`, `RATE_LIMITED`, `INTERNAL`, an unknown code, and a server `fields[].code` at sign-in — each rendered from the dictionary, in the language on screen, never the server's English |
| `robustness.spec.js` | 5 | 4 passed, 1 skipped | 4 passed, 1 skipped | not-found page, markup in a name rendered as text, refused order with its reference, phone build bar and panel, desktop panel |
| **Total** | **55** | **53 passed, 2 skipped** | **54 passed, 1 skipped** | **107 passed, 3 skipped, 0 failed** |

**Last full green:** `APP_URL=http://localhost:8081 CHROMIUM_PATH=$NEXAI_CHROMIUM_PATH npx playwright test` → 107 passed, 3 skipped, 0 failed, at code commit `e3303cd`.

**Real backend run:** the whole suite above ran with no route mocking except
the eight deliberate stubs inside `error-contract.spec.js` (which stub the error
response itself, not the rest of the app); every other journey signed in, chose
parts and placed orders against `go run ./cmd/api` and PostgreSQL 16.

## Test case coverage (TC-067 to TC-099)

| Case | Verified by |
| --- | --- |
| TC-067 — every screen, label, button, message and error in the selected language | all six spec files (each journey asserts the copy it expects), `locales.test.js` (key parity, no blank, no raw key) |
| TC-068 — server-side refusals reach the customer as plain sentences | `error-contract.spec.js`, `auth.spec.js` (duplicate email), `robustness.spec.js` (refused order) |
| TC-069 — first visit is Indonesian, browser language changes nothing | `language.spec.js` (context locale `en-US` and `id-ID`, reload) |
| TC-070 — a two-choice switcher on every page | `language.spec.js` (`/`, `/sign-in`, `/sign-up`, `/no-such-page`) |
| TC-071 — switcher usable in the builder's and auth forms' states | `language.spec.js` (empty, incomplete, loading via a gated route, error via 500) |
| TC-072 — switcher on the review and confirmation, including loading and error | `language.spec.js` (review, not-found, gated confirmation) |
| TC-073 — switcher visible and usable at a phone viewport | `language.spec.js` (phone project; no horizontal overflow) |
| TC-074 — switching changes the whole builder page, parts and total untouched | `language.spec.js` (six chosen parts, total compared before and after) |
| TC-075 — a half-typed create-account form survives a switch and submits | `language.spec.js` (counts one `POST /auth/register`) |
| TC-076 — switching on the review keeps the parts and the total | `language.spec.js` (review, then switch) |
| TC-077 — switching never changes the session, submits or duplicates an order | `language.spec.js` (counts `POST /api/v1/orders`: 0 before the click, 1 after) |
| TC-078 — ten switches leave the same page in each language | `language.spec.js` (compares the heading and part lists, case-insensitively) |
| TC-079 — a choice is remembered across reload, a new tab and other pages | `language.spec.js` (`localStorage` and a second page in the same context) |
| TC-080 — signing out keeps the last language used on the device | `language.spec.js` |
| TC-081 — a new account takes the language selected at sign-up | `language.spec.js` (sign-up in each language, then a fresh context) |
| TC-082 — signing in switches to the account's language | `language.spec.js` (TC-080 and TC-085 sign in as an Indonesian account from an English device and assert Indonesian) |
| TC-083 — the same account shows its language on another device | `language.spec.js` (fresh browser context, both languages) |
| TC-084 — a signed-in change is saved at once and follows the account | `language.spec.js` (switch, reload, then a fresh context), `LanguageContext.test.jsx` (PUT body is exactly `{preferred_language}`) |
| TC-085 — a switch while signed out does not change the account | `language.spec.js` (sign-out, switch, sign-in again shows the account's language) |
| TC-086 — a missing or invalid stored language shows Indonesian and never blocks sign-in | `language.spec.js` (`'fr'`, `''`, `'EN'`), `LanguageContext.test.jsx` |
| TC-087 to TC-090 — the stored value on pre-revision accounts, the `en`/`id` constraint, owner-only change, no session | API-observable; verified by the backend's own suite against its `0005` migration and `PUT /auth/me/language`; not duplicated here |
| TC-091 — no raw key and no blank text in either language | `language.spec.js` (five pages × both languages, regex for raw keys and blank controls), `locales.test.js` |
| TC-092 — both language sets are complete and never mixed | `locales.test.js` (identical key sets, lists same length), `language.spec.js` (no raw key on any page) |
| TC-093 — the Indonesian copy uses the formal "Anda" | `locales.test.js` (no `kamu`, `kau`, `engkau`, `lu`, `gue`, `aku` in any Indonesian string) |
| TC-094 — part, model and brand names read identically | `language.spec.js` (the same part names in both) |
| TC-095 — prices and totals read identically | `language.spec.js` (the same rupiah in both) |
| TC-096 — validation, error and empty-state messages in the selected language | `language.spec.js` (empty fields, wrong password, duplicate email), `error-contract.spec.js` |
| TC-097 — a page that cannot load the selected copy shows the Indonesian page | `locales.test.js` (per-key resolution: a key missing in English resolves to the Indonesian string, never the key) |
| TC-098 — the confirmation re-renders in the current language, parts and amounts unchanged | `language.spec.js` (switch on the confirmation, then reload) |
| TC-099 — the missing-category message names the categories in the language shown | `language.spec.js` (refused checkout names the categories, not the graphics card, in both languages), `error-contract.spec.js` (`BUILD_INCOMPLETE` with `missing_categories`) |

## Design fidelity against the v3 mock

The mock (`docs/pc-builder/ui/mock`, 24 screens) and the app (real API data)
were swept by the shipped `mock-sweep.mjs` at both widths, then compared with
`--compare`. Mock screenshots are on the left, the app on the right of each
`compare-*.jpg`.

| Screen | Mock id | 1440 | 390 | Notes |
| --- | --- | --- | --- | --- |
| Builder, nothing chosen | `builder-empty` | match | match | Same 5020 px page height at 1440 in both; same header, hero, ribbon, summary strip, 3-up grids, panel and footer |
| Builder, complete build, signed in | `builder-complete` | match | match | Panel rows, total and `KELUAR`/`TINJAU PESANAN` cluster identical; only the chosen parts differ (the sweep chose the first part in each category) |
| Sign in | `signin-default` | match | match | Editorial split, seal, field rules, footer; the mock forces its "build kept" notice, the app shows it only when a build exists |
| Create account | `signup-default` | match | match | Same split and rules |
| Order review | `review-default` | match | match | Rows by category, aside seal, total block and the two actions; the mock's row set includes a graphics card the sweep build did not choose |
| Order confirmation | `confirm-default` | match | match | Reference block, rows, next-step footer |
| Not found | `notfound-default` | match — 0.0% differing pixels | match — 0.0% differing pixels | The v3 one-column `.nf` page: eyebrow `Page not found · 404`, Didone H1, one lede, one filled action, no photograph |

Two capture facts, not app deviations:

1. The mock's own full-page capture at 1440 repeats its fixed hero (the mock
   keeps the hero image in a fixed layer while `mock-sweep` stitches the page),
   so the 1440 pixel-difference figure for builder screens is dominated by that
   artifact; the section-by-section comparison above is what was judged.
2. The mock hard-codes the states in `screens.json` (for example the "build
   kept" notice on a guest sign-in); the app shows them only when the state is
   real. The sweep compares the state that matches.

Language-specific fidelity, checked beyond the sweep:

| What | Result |
| --- | --- |
| Switcher at 1181px | Two labelled buttons (`ENGLISH` with the accent square and ink underline, `BAHASA INDONESIA`), in the header's right cluster — as designed for "above 1180" |
| Switcher at 1180px and below | Native `<select>` showing the active language with a chevron and a 1px vermilion rule — as designed for "at or below 1180" |
| English at 320, 390, 1180, 1181, 1440 | `scrollWidth - clientWidth = 0` on every page; titles and `html[lang]` in English |
| Indonesian at the same widths | Same, plus the earlier full-page screenshots |
| A wrapped header label at 390 in English | Found during this sweep and fixed: `.nav a, .nav button { white-space: nowrap }` — `SIGN IN` no longer splits over two lines beside the picker |

## Polish checklist

| Item | Result |
| --- | --- |
| No horizontal overflow at 320, 390, 1180, 1181, 1440 in both languages | PASS — 0 at every width, builder, sign in, create account and not found |
| Visible keyboard focus | PASS — 2px `:focus-visible` outline with offset, on-night variant on dark surfaces; the sweep's ring-contrast check finds the brand link's ring at 1.5:1 on paper, in the mock too (recorded deviation 1 below) |
| Reduced motion honoured | PASS — the existing `prefers-reduced-motion: reduce` block is untouched; the language switch has no motion to reduce (`docs/pc-builder/motion-plan.md`) |
| Text contrast on the paper background | PASS — the sweep computes WCAG AA on every text element at both widths in both languages and reports no finding; text over images (36 elements) was looked at by eye on the compare sheets |
| Every visible string from the dictionaries, no raw key, no blank | PASS — `language.spec.js` TC-091/TC-092 scan five pages in both languages; `locales.test.js` holds the dictionaries to identical key sets and no blank value |
| Empty, loading, error, refused, gone and expired states | PASS — all reachable and language-aware, each covered by a journey (`builder`, `language`, `error-contract`) |
| Phone layout: build bar, open panel, close, checkout | PASS — `robustness.spec.js` and `builder.spec.js` on the phone project |
| Square corners, hairlines, one accent, no restyle | PASS — verified in the sweep; the only visual additions are the switcher and the Indonesian strings |
| Motion | PASS — the motion-designer gate found nothing to add: switch, picker, notice and focus are all instant (MO-005, MO-008); existing app motion unchanged; `docs/pc-builder/motion-plan.md` records each surface |

## Error contract

Every code the frontend recognises is rendered from its own dictionary in the
language on screen; the server's English `message` is never displayed. The
stubbed-code table is asserted from both sides of a language switch.

| Code (HTTP) | Where the app shows it | Test |
| --- | --- | --- |
| `VALIDATION_FAILED` (422) — field codes | The field it names, under the input, from `fieldErrors[fields[].code]`; an unknown field code gets the localized generic field message | `error-contract.spec.js` (sign-in field code), `auth.spec.js`, `locales.test.js` (every field code present) |
| `INVALID_CREDENTIALS` (401) | Sign-in notice ("The email address or password is not correct."), password cleared, email kept | `auth.spec.js` |
| `EMAIL_TAKEN` (409) | Sign-up notice with a sign-in link | `auth.spec.js` |
| `UNAUTHENTICATED` (401) | Review: "Your session has ended." with a way back; confirmation: its own state with a sign-in link to that order | `error-contract.spec.js`, `checkout.spec.js`, `language.spec.js` |
| `PART_UNAVAILABLE` (409) | Review: "{name} is no longer offered.", the lost part removed, total re-read | `error-contract.spec.js`, `builder.spec.js` |
| `TOTAL_CHANGED` (409) | Review: "The prices in your build changed.", then the reloaded total | `error-contract.spec.js` |
| `BUILD_INCOMPLETE` (422) | Review: "Still empty: {list}." with the category names translated by code | `error-contract.spec.js`, `language.spec.js` (TC-099) |
| `RATE_LIMITED` (429) | Review: "Too many attempts. Wait a moment and try again." | `error-contract.spec.js` |
| `INTERNAL` (500) | Review: the generic message plus `Reference {request_id}` | `error-contract.spec.js`, `robustness.spec.js` |
| unknown code | The same generic message as `INTERNAL`, in the active language, never the code or the server message | `error-contract.spec.js` |
| `NOT_FOUND` (404) | Confirmation: the not-found state; an unknown route: the not-found page | `checkout.spec.js`, `robustness.spec.js` |
| `ORIGIN_REJECTED` (403) / `BAD_JSON` (400) / `METHOD_NOT_ALLOWED` (405) | Not reachable through the app's own proxy in normal use; if answered, they fall through to the localized generic message | covered by the unknown-code case (same path) |

## Security

Check-only review of the revision's diff (`src`, `tests`, `index.html`,
`eslint.config.js`), not a full-app audit. The house
`nexcraft:vulnerability-scanner` agent is not installed in this environment, so
the same check-only brief was run by a general-purpose security reviewer. No
critical, high or medium finding.

| # | Finding | Disposition |
| --- | --- | --- |
| 1 | Low — `categoryLabel` falls back to the API's English category name when a code is missing from the dictionary, which would mix languages on an Indonesian page | **Accepted with a reason.** All seven catalogue codes are in both dictionaries and `locales.test.js` fails if one is missing, so the fallback is unreachable for the real contract; if an unknown code ever arrived, blanking it would break the no-blank-text rule (TC-091) and hide which row is broken. Part names are still never translated. |
| 2 | Informational (unverified by the reviewer) — dictionary lookups keyed by server-supplied codes could reach `Object` prototype members | **Accepted.** The backend validates every category and field code against its own enum (`CHECK` plus i18n keys), so a code outside the seven/ nine known ones cannot reach these lookups; the unrecognised-code path already falls back to the generic message. |
| — | Checked and clean | No `dangerouslySetInnerHTML`, `innerHTML`, `eval` or dynamic URL from user data; `localStorage` is read as a value validated against exactly `en`/`id` and stored as that enum only; the session cookie stays HttpOnly and is never read by the app; the language PUT sends exactly `{preferred_language}`; no secret, no new dependency, `package.json` unchanged; error bodies are never rendered as HTML; checkout, totals and the order request body are unchanged. |

## Code review

| # | Finding | Disposition |
| --- | --- | --- |
| 1 | Two signed-in switches inside one round-trip could let an earlier `PUT` answer overwrite the newer choice (the response's language was re-applied after the optimistic set) | **Fixed** — the response no longer re-applies a language; only the latest request may report a failure. Covered by a new unit test (`never reports a save that failed after a newer choice was made`) that resolves the newer save first and fails the older one afterwards. |
| 2 | "The not-found page re-layout and English copy rewrite are outside the language revision" | **Rejected against the merged design.** Design v3 re-specifies this screen: `UIMap.md:490` (one column, 44 rem, no photograph) and `UIMap.md:699` (the `.nf` block) with `DesignBrief.md:84` (eyebrow `Page not found · 404`). Keeping the v1 split layout would fail the design gate for this revision. |

## Docker and preview

| What | Result |
| --- | --- |
| Compose files | Unchanged by this revision: `docker-compose.yml` (this repo) and `deploy/preview.compose.yml` (db + api + web) with `docker-compose.verify.yml` for the low-footprint run |
| Image and nginx | `verify_stack` on `docker-compose.yml` → **PASS** (48 s): the web image built and nginx answered its healthcheck with `GET / → 200` |
| Full three-service stack | `verify_stack` on `deploy/preview.compose.yml` + `docker-compose.verify.yml` → **FAIL (policy)**: the runner refuses `api.build.context: ../../be` because the backend checkout lies outside the project directory it snapshots. This is a runner policy limit on a two-repository stack, not a defect in the app; the compose files are unchanged from the delivered v1 and were not touched by this revision. |
| App proof without Docker | `npm run build` + `vite preview` on `:8081` with the `/api` proxy against `go run ./cmd/api` on `:8080`; the whole 110-test suite ran there, not against a mock |

## Deviations and decisions

1. **The brand link's focus ring** measures 1.5:1 against paper in the app and
   in the mock. It predates this revision, is identical in the approved design,
   and fixing it would restyle chrome outside the switcher, so it is recorded
   rather than changed here.
2. **The mock's full-page 1440 screenshot tiles its fixed hero**, so pixel-diff
   percentages on builder screens are dominated by that capture artifact; the
   fidelity judgement is the section-by-section comparison.
3. **Accounts in the English journeys are created with `preferred_language:
   "en"`**, because sign-in adopts the account's language (REQ-047); without it
   every English journey would legitimately flip to Indonesian at sign-in.
4. **The sign-in/sign-up validation of the language field** (`field.
   preferred_language.*`) is in the dictionaries and asserted by the locale
   test; the app never sends an invalid value, so it is shown only if the API
   answers with that code.
5. **TC-087 to TC-090** are API-observable (stored values, constraint, owner
   scope, missing session) and are verified by the backend's suite, which is
   the only place they can be observed; they are not duplicated here.

## Reproduce locally

```sh
# backend (compzy-be at feat/pc-builder)
DATABASE_URL='postgres://[REDACTED]@127.0.0.1:5432/compzy?sslmode=disable' \
APP_ORIGIN='http://localhost:8081' COOKIE_SECURE=false go run ./cmd/api

# frontend
npm ci
npm run build
VITE_API_PROXY='http://localhost:8080' npx vite preview --port 8081 --strictPort

# checks
npx eslint .
npx vitest run
APP_URL='http://localhost:8081' CHROMIUM_PATH="$NEXAI_CHROMIUM_PATH" npx playwright test
```

## v3 — deploy fix: the app must open under any sub-path (2026-11-24)

| | |
| --- | --- |
| Service / feature | `compzy` / `pc-builder` |
| Revision | v3 — deployment fix only: the same app, mounted under the preview gateway's sub-path |
| Repository | `compzy-fe` |
| Branch tested | `feat/pc-builder-dev-subpath-mount` → PR into `feat/pc-builder` |
| Tested code commit | `b882814` — the code commit under test (this section is committed on top of it) |
| FE PR | [#3](https://github.com/william22913/compzy-fe/pull/3) into `feat/pc-builder` |
| Date | 2026-11-24 |

### What this revision changes

The v2 app opened at the site root only. This revision makes the same app open
at the NexAI preview link `<frontend>/stack/<token>/app/`, under whatever
sub-path the gateway mounts it.

- **Symptom:** the merged v2 app started healthy in the preview compose stack
  but did not open at that address: it answered with the app's own 404 route,
  the header links were root-absolute (`/`, `/sign-in`), the API was called at
  the origin root (`http://localhost:3000/api/v1/catalogue`, blocked
  cross-origin), and the fonts were fetched from `/assets/fonts/...`.
- **Fix:** `src/core/base.js` derives the mount once — from the gateway's
  `<base href>` (accepted only when it is the same origin and a path the
  document is served under) or, without a base, from the document path with the
  app's own route stripped; the router's basename is that mount and keeps its
  trailing slash; images go through `appUrl()` (which refuses anything outside
  the mount); the woff2 fonts moved to `src/assets/fonts` and the CSS asks for
  them relatively; the API is called at `<mount>api/v1`; `vite.config.js` builds
  with `base: './'`; nginx proxies `/api` with `^~` and serves nested
  `/…/assets/` paths; `deploy/preview.compose.yml` takes `APP_ORIGIN` from the
  environment.
- **Unchanged:** routes, layout, type, colour, copy, behaviour at the site
  root, and the package list — `package.json` and the lock file are untouched;
  no nexcomponent, nexcommon or Ant Design.

### Checks

| # | Check | Command / tool | Result |
| --- | --- | --- | --- |
| 1 | Lint | `npx eslint .` | **PASS** — 0 errors, 0 warnings |
| 2 | Unit tests | `npx vitest run` | **PASS** — **65 tests** in 9 files, 0 failed (adds the mount derivation: root, `<base>` mount, document served without a trailing slash, a foreign-origin base ignored, a base the document is not served under ignored, the route-suffix stripping, and `appUrl` refusing an absolute, protocol-relative or climbing path; and the API URL at the root and under a mount, read and write) |
| 3 | Build | `npm run build` | **PASS** — `index-*.css` 29.14 kB (gzip 6.09), `index-*.js` 223.67 kB (gzip 69.61); `dist/index.html` loads `./assets/…`, the CSS asks for `url(./*.woff2)` |
| 4 | E2E at the site root, real backend | `APP_URL=http://127.0.0.1:45631 npx playwright test <spec files>` | **PASS** — 120 tests: 117 passed, 3 skipped (viewport-gated), 0 failed. Run in two commands because this session's runner limits full-suite reruns: (a) `builder.spec.js auth.spec.js checkout.spec.js error-contract.spec.js` → 56 passed (2.6 min); (b) `language.spec.js robustness.spec.js subpath.spec.js` → 60 passed, 3 skipped, **1 failed**: `language.spec.js:591` TC-081/TC-083 hit the 30 s default timeout with four workers (it creates two accounts through the UI and signs both in on a fresh device; it takes ~23 s alone). Fixed the test set-up, not product code: `test.slow()` on that test with a comment; re-run on both projects → 2 passed (22.7 s). The failing test is the only test that differs between run (b) and the final files. |
| 5 | Sub-path mount, stub API | `npx playwright test tests/e2e/subpath.spec.js` | **PASS** — 10 passed (5 tests × desktop/phone) |
| 6 | Sub-path mount, real API | `MOUNT_API=http://127.0.0.1:8080 npx playwright test tests/e2e/subpath.spec.js` | **PASS** — 10 passed (18.3 s) |
| 7 | Preview link (Docker/nginx, gateway) | `preview_stack` on `deploy/preview.compose.yml` + `docker-compose.verify.yml`, then `node scratch/preview-link-check.mjs <link>` | **PASS** — api/db/web healthy; link `http://localhost:3000/stack/bRYo_fQgSKkLfAXSQa5gy6RzAazS9eG-/app/`; see the preview-link table |
| 8 | Security review | check-only review of the diff | **PASS** — no high or critical left open; see the table |
| 9 | Code review | independent reviewer over the full diff | **PASS after fixes** — see the table |
| 10 | Error contract | `error-contract.spec.js` | **PASS** — 8 cases × 2 viewports = 16 tests, unchanged from v2 |

### Sub-path mount

| What | What the spec proves |
| --- | --- |
| Home page inside the mount | no off-mount request, no 4xx on a static asset, no console error, all three woff2 under the mount, `document.fonts.check('16px Archivo')` true, every `a[href]` under the mount |
| A second route | `/sign-up` loads under the mount, with the brand link at the mount |
| The brand link is the mount itself | a reload there still renders the app (this is the URL React Router generates for home; the basename keeps the trailing slash so it is never the slash-less form a relative build cannot serve) |
| A two-level deep link | `/order-confirmation/<id>` reloads the app's own route, assets 200, font loaded |
| A crafted asset path | `/assets/..%2f..%2fpackage.json` answers 404 |

### Preview link (Docker stack, gateway `<base href>`, sandboxed page)

| What | Result |
| --- | --- |
| Home page | 7 categories from `<link>/api/v1/catalogue`, title `compzy · Perakit PC` |
| Fonts | 3 woff2, all under the link; `Archivo` loaded |
| Requests | no request outside the link (0 escapes), no 4xx on a static asset, no console error |
| Links | 8, all under the link |
| Second route | `/sign-up` → `Buat akun · compzy Perakit PC`, create-account button visible |
| Deep link | `/order-confirmation/00000000-…` → `Konfirmasi pesanan · compzy Perakit PC`, the app's own "not found" copy, no asset failure |
| Sign-in through the UI | with an account created on the preview stack (`preview.check@example.com`) → lands on the mount root, sign-out control visible; the link was signed out again afterwards |
| Screenshots | `scratch/preview-home.png`, `scratch/preview-deep.png` (1440×900) |

The link stays up ~15 minutes idle, and the checks were run against it as a
browser would, not against a mock.

### Design fidelity

| Screen | Width | Reference | Result |
| --- | --- | --- | --- |
| Home | 1440 | approved v3 mock | unchanged |
| Home | 390 | approved v3 mock | unchanged |
| Deep-link confirmation | 1440 | approved v3 mock | unchanged |
| Deep-link confirmation | 390 | approved v3 mock | unchanged |

The only style edit is the three `@font-face` URLs, and the preview screenshot
matches the approved design.

### Polish checklist

Unchanged from the v2 table (nine items). This revision touches no layout, copy,
focus or contrast; the checks that could move — font loading, images, links,
console cleanliness — were re-verified in both widths at the root and under the
mount.

### Security

| Finding | Where | Resolution |
| --- | --- | --- |
| `<base href>` trusted with no origin or path check (high, reviewer) | mount derivation | **Fixed** — the base is used only when it is the same origin and the document is served under it, with tests; this also closes the CSP `base-uri` bypass. |
| CSP `base-uri 'none'` → `'self'` (defence-in-depth downgrade) | `deploy/nginx.conf.template` | **Kept** at `'self'` because the gateway injects `<base>` for the mounted build, and the module now validates the base itself; `script-src 'self'`, no inline script, no HTML-injection sink in the app (grep for `innerHTML`/`dangerouslySetInnerHTML`/`document.write`: none). |
| `appUrl()` open URL (low) | `src/core/base.js` | **Fixed** — rejects absolute, protocol-relative and climbing inputs, unit-tested. |
| nginx regex could capture `/api/…` (low) | nginx | **Fixed** — `location ^~ /api/`; traversal impossible (nginx normalises before matching) and asserted with the `..%2f` case above. |
| Test-only mount server forwards client headers (low) | test harness | **Accepted** — loopback only, never shipped (the Dockerfile copies only `dist`). |

### Code review

| # | Finding | Resolution |
| --- | --- | --- |
| 1 | `appUrl('../x.webp')` not rejected at a site root | test moved to the mount-scoped case where it must throw (and it does); guard unit-tested. |
| 2 | Home link is the slash-less mount, and a reload there loses the mount | **Fixed** by keeping the trailing slash in the basename (React Router 6.26 supports it); the new sub-path test clicks the brand and reloads; verified in the preview too. |
| 3 | nginx comment claimed gateway mounts while only `/api` was proxied | comment corrected; the gateway strips the prefix (proven by the preview): the deployed path is `<link>/api/v1/…` → nginx `/api/` → api. |
| 4 | e2e never built `dist`, so the sub-path spec could test a stale build | **Fixed** — Playwright `globalSetup` runs `vite build` once per run. |
| 5 | Production fallback read `document.baseURI`, which re-applies a base the guard had just rejected | **Fixed** — the fallback reads the document location. |
| 6 | `mountFromPath` hard-codes the route list (duplicates `App.jsx`) | kept, with the comment pointing at `src/app/App.jsx` and unit tests for each route; a new nested route needs a line there. |
| 7 | The test server re-implements the nginx asset rule | accepted for a test harness; the real rule is exercised by the preview stack above. |

### Deviations and decisions

1. **The basename keeps its trailing slash.** React Router generates the mount
   root without one; a relative build cannot serve that form, so the trailing
   slash is part of the basename.
2. **`base-uri 'self'` is kept** because the gateway injects `<base>` for the
   mounted build; the app validates the base itself rather than removing the
   directive.

### Real backend

Every e2e run above used the live Go API and PostgreSQL — the backend at its
merged `feat/pc-builder` state, migrations and seed — and the preview stack ran
its own api+db containers. Nothing was checked against a mock except the
stub-API sub-path run, which is labelled as such.

**Last full green:** `builder + auth + checkout + error-contract` → 56 passed and
`language + robustness + subpath` → 60 passed, 3 skipped with the one timeout
fixed and re-run green (2 passed); 120 tests in total, 117 passed, 3 skipped,
0 failed, at code commit `b882814`.

### Reproduce locally

```sh
# backend (compzy-be at feat/pc-builder)
DATABASE_URL='postgres://[REDACTED]@127.0.0.1:5432/compzy?sslmode=disable' \
APP_ORIGIN='http://localhost:8081' COOKIE_SECURE=false go run ./cmd/api

# frontend
npm ci
npm run build
VITE_API_PROXY='http://localhost:8080' npx vite preview --port 8081 --strictPort

# checks
npx eslint .
npx vitest run
APP_URL='http://localhost:8081' CHROMIUM_PATH="$NEXAI_CHROMIUM_PATH" npx playwright test
npx playwright test tests/e2e/subpath.spec.js
MOUNT_API='http://127.0.0.1:8080' npx playwright test tests/e2e/subpath.spec.js
```

The Playwright run builds `dist` itself (`globalSetup` runs `vite build` once per
run).
