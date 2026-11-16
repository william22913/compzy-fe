# pc-builder — Frontend test and delivery results

| | |
| --- | --- |
| Service / feature | `compzy` / `pc-builder` |
| Repository | `compzy-fe` (this repository) |
| Branch tested | `feat/pc-builder-dev-builder-checkout-ui` → PR into `feat/pc-builder` |
| Tested code commit | `2b33fb6` |
| FE PR | `PENDING` |
| Date | 2026-11-16 |

## Environment used for every check

| Piece | What ran |
| --- | --- |
| Backend | `compzy-be` at its merged `feat/pc-builder` state, built from source (`go run ./cmd/api`) on `127.0.0.1:8080` |
| Database | PostgreSQL 16 on `127.0.0.1:54320`, the four migration batches applied, `seed` run: **7 categories / 21 parts** (Processor (CPU), Motherboard, RAM, Storage (SSD), Graphics Card, Power Supply, PC Case; Graphics Card optional) |
| Frontend | `npm run build` then `vite preview` on `127.0.0.1:4173`, proxying `/api` to the API on the same browser origin |
| API contract | base path `/api/v1`; `{request_id,data}` on success, `{request_id,error:{code,message,fields,details}}` on failure; integer rupiah; cookie `compzy_session` (HttpOnly, SameSite=Lax, Path=/) |
| API origin setting | `APP_ORIGIN=http://127.0.0.1:4173` — the backend refuses a write whose `Origin` it does not know (`403 ORIGIN_REJECTED`) |
| Browser | Chromium via Playwright 1.47.2; desktop `1440×900`, phone `Pixel 7` (`390×844`, touch) |
| Accounts | All e2e accounts are created through `POST /api/v1/auth/register` with unique addresses; no seeded account was needed |

## Checks

| # | Check | Command / tool | Result |
| --- | --- | --- | --- |
| 1 | Lint | `npx eslint .` | **PASS** — 0 errors, 0 warnings |
| 2 | Build | `npm run build` | **PASS** — `dist/index.html` 0.83 kB (gzip 0.51), `index-*.css` 26.38 kB (gzip 5.65), `index-*.js` 208.42 kB (gzip 64.96); no warnings |
| 3 | Unit tests | `npm test` (Vitest 2.1.1 + React Testing Library, jsdom) | **PASS** — 5 files, **32 tests**, 0 failed |
| 4 | E2E — desktop | `npx playwright test --project=desktop` (run per spec file, see below) | **PASS** — 24 passed, 1 skipped (viewport-gated), 0 failed |
| 5 | E2E — phone | `npx playwright test --project=mobile` (run per spec file, see below) | **PASS** — 24 passed, 1 skipped (viewport-gated), 0 failed |
| 6 | Design fidelity | App screenshots against the approved mock, section by section, at 1440 and 390 | **PASS** — see the fidelity table and the recorded deviations |
| 7 | Polish checklist | Scripted audit plus visual pass | **PASS** — see the polish table |
| 8 | Docker image + full stack | `verify_stack` on `deploy/preview.compose.yml` + `docker-compose.verify.yml` | **PASS** — db, api and web healthy; every Newman request and assertion passed |
| 9 | API contract through the shipped nginx | same run, Newman collection `compzy-be` `postman/collection.json` | **PASS** — 18 requests, 0 failed; 80 assertions, 0 failed |
| 10 | Security review | `security-audit` check-only pass over `3b554d1..HEAD` plus the Docker/nginx/compose files | **PASS** — no critical, high or medium finding; see the security table |
| 11 | Code review | `pr-review-toolkit` reviewer over `3b554d1..HEAD` against `UIMap.md`, `architecture.md` and `CLAUDE.md` | **PASS after fixes** — 8 findings, all resolved; see the review table |
| 12 | Live preview | `preview_stack`, then the link driven in a browser | **PASS** — real catalogue and a real order placed through the link |

### E2E result per spec file

Four spec files, each run on both projects. "Skipped" is the layout test that
belongs to the other viewport (the desktop panel column vs the phone build bar).

| Spec file | Tests | Desktop | Phone | Covers |
| --- | --- | --- | --- | --- |
| `tests/e2e/builder.spec.js` | 7 | 7 passed | 7 passed | catalogue and prices, choose/remove and totals, checkout refusal and its category list, build across a reload, vanished saved part, catalogue 500 + retry, optional graphics card |
| `tests/e2e/auth.spec.js` | 8 | 8 passed | 8 passed | sign-in validation, wrong credentials, sign-up and landing signed in, duplicate email, password rule, ended session notice, sign out with its notice, a crafted `?return=` falling back to the builder |
| `tests/e2e/checkout.spec.js` | 5 | 5 passed | 5 passed | guest sent to sign-in with the return path and build kept, sign-in returns to the review, order placed and reference shown, confirmation reloads from the API and the build is cleared, empty review, a signed-out visitor asked to sign in, a signed-in member's unknown order |
| `tests/e2e/robustness.spec.js` | 5 | 4 passed, 1 skipped | 4 passed, 1 skipped | not-found page, a name with markup rendered as text, a refused order with its reference and the build kept, phone build bar and panel, desktop panel |
| **Total** | **25** | **24 passed, 1 skipped** | **24 passed, 1 skipped** | **48 passed, 2 skipped, 0 failed** |

The session guard caps full-suite runs, so the final state was verified by
running these four files in full on both projects rather than one whole-suite
invocation; the totals above are the sum of those runs at the shipped code.

### Design fidelity against the mock

Screenshots were taken of the app (real API data) and of the mock
(`docs/pc-builder/ui/mock/index.html`, switcher hidden) at the same viewport,
compared section by section: type scale, rules and hairlines, spacing,
accents, image treatment, panel and bar behaviour.

| Screen | Mock id | 1440 | 390 | Notes |
| --- | --- | --- | --- | --- |
| Builder, nothing chosen | `builder-empty` | match | match | Whole page 5020 px in both; same section rhythm, same 3-up part grid collapsing to one column |
| Builder, every required category filled | `builder-complete` | match | match | Panel rows and total match; tag "Required"/"Optional" as designed |
| Builder, checkout refused | `builder-checkout-refused` | match | — | Phone refuses in the same panel/bar; the message and the category list are rendered identically |
| Builder, just signed out | `builder-signed-out` | match | match | Same notice in the same place; page height 5264 px at 1440 and 7445 px at 390 in both |
| Builder, catalogue failed | `builder-error` | match | match | Notice sits where the design puts it, retry button included |
| Sign in | `signin-default` | match | match | Editorial split, seal, field rules |
| Order review | `review-default` | match | match | Rows, aside seal, total block |
| Order confirmation | `confirm-default` | match | match | Reference block, next-step footer; footer shows the signed-out link set as the mock does |

Deviations from the mock, all deliberate:

1. **Part order** follows the API's part ids, so a category can list its three
   parts in a different order than the mock's Part 01/02/03 artwork. Nothing is
   renamed or reordered in the UI; the wire order is kept.
2. **Order reference** is the API's 36-character UUID, where the mock showed a
   short `CZ 1042` style reference. The reference is copied from the real order.
3. **Header name** is the account's full name from the API, where the mock used
   a short display name.
4. **Vanished part notice** names the category from the live catalogue
   (`The part you chose for Storage (SSD) is no longer offered.`); the mock
   hard-codes one category. It is shown both when the catalogue drops a saved
   part and when the review sends a customer back to replace one.
5. **Confirmation without a session** is a state the mock has no screen for.
   The contract answers `401 UNAUTHENTICATED`, so the page says the session
   ended and offers a sign-in that returns to that order, rather than the
   not-found copy a signed-in member sees for an order that is not theirs.
6. **Confirmation footer** shows the signed-out link set, as the mock does,
   even though the customer is signed in — the page is a closed chapter.

### Polish checklist

| Item | Result |
| --- | --- |
| No horizontal overflow at 320, 1440 and 1920 px | PASS — `scrollWidth - clientWidth` = 0 at all three; the 36-character order id wraps inside the confirmation at 390 |
| Visible keyboard focus | PASS — 2 px solid focus ring from `:focus-visible`, with the night-surface variant |
| Reduced motion honoured | PASS — `prefers-reduced-motion: reduce` drives transition durations to ~0 |
| Text contrast on the paper background | PASS — body and totals 16.45:1, small labels 12.68:1 (WCAG AA needs 4.5:1 / 3:1) |
| Every visible string in English, from `src/locales/en.json` | PASS — no literal copy in components; prices `Rp 12.500.000` |
| Empty, loading, error, refused and gone states | PASS — all present and reachable, each covered by a unit or e2e test |
| Phone layout: build bar, open panel, close, checkout | PASS — covered by `builder.spec.js` and `robustness.spec.js` on the mobile project |
| Square corners, hairlines, no rounded cards, one accent | PASS — verified in the fidelity sweep |

### Code review

| # | Finding | Disposition |
| --- | --- | --- |
| 1 | A confirmation opened without a session showed the "order not found" copy | **Fixed** — `401 UNAUTHENTICATED` gets its own state ("Your session has ended.") with a sign-in link back to that order; only a signed-in member sees "We could not find that order." |
| 2 | "Change a part" stayed clickable while the order was submitting | **Fixed** — hidden while submitting, as the design's submitting state shows |
| 3 | A 36-character order id in the display size overflowed a phone | **Fixed** — `.confirm__ref .display` wraps anywhere |
| 4 | "Choose another" from the review lost the builder's vanished-part banner | **Fixed** — the review marks the category on the build, and the builder shows its existing notice |
| 5 | Sign-in did not map a server `VALIDATION_FAILED` to its fields | **Fixed** — mapped to the email and password fields, as sign-up already did |
| 6 | A wrong password left the password in the field | **Fixed** — cleared on `INVALID_CREDENTIALS`, the email kept |
| 7 | The seal's text was hard-coded in the component | **Fixed** — moved to `en.json` (`chrome.sealText`) |
| 8 | The signed-out builder notice from REQ-028 was not implemented | **Fixed** — the notice from the mock, with a sign-in link; heights match the mock exactly |
| note | The `?return=//evil.example` case `architecture.md` names was untested | **Added** — an e2e test signs in through it and lands on the builder |

### Security

Check-only review of the diff and of the deployment files. No critical, high or
medium finding. The five low and four informational findings were each either
fixed here or accepted with a reason:

| # | Finding | Disposition |
| --- | --- | --- |
| 1 | Preview stack uses a fixed database password (`compzy`) | Accepted — `deploy/preview.compose.yml` is a local preview stack, publishes no database port, and the credentials match the merged `architecture.md` |
| 2 | `DEPLOY.md` documents a demo account with a fixed password | Accepted and scoped — the smoke check is local only and the account is created by the reader's own `curl`, never seeded |
| 3 | Sign-out cleared the local session even when the API call failed (cookie is HttpOnly and stays valid) | **Fixed** — the local session is only dropped after the server call succeeds; a failed call reloads so the header shows the session that still exists |
| 4 | nginx image runs as root | Accepted — static files only, no write access needed by the app; recorded for a later hardening pass rather than changing the image this feature ships |
| 5 | Shipped compose published `8081` on every interface | **Fixed** — bound to `127.0.0.1:8081:80` |
| 6 | `.dockerignore` did not exclude `.env` files | **Fixed** — `.env` and `.env.*` excluded (`.env.example` still allowed) |
| 7 | Preview stack disables production protections (`COOKIE_SECURE=false`, raised rate limits, long sessions) | Accepted — preview profile only; `DEPLOY.md` says so |
| 8 | Dev-only Vite 5.4.8 predates later dev-server fixes | Accepted — dev dependency, not in the shipped image |
| 9 | CSP allows `style-src 'unsafe-inline'` for inline `style` props | Accepted — no injection sink; the app loads no third-party origin |

Also checked and clean: no `dangerouslySetInnerHTML`, `innerHTML`, `eval` or
dynamic URL from user data; the `?return=` target is an exact allowlist; the
session cookie is never read by the app; no secret in the bundle; nginx sets
CSP, nosniff, `X-Frame-Options: DENY` and `Referrer-Policy` at server level so
every location inherits them.

### Docker and preview

| What | Result |
| --- | --- |
| Image | `node:20-alpine` build stage → `nginx:1.27-alpine` runtime, config from `deploy/nginx.conf.template` with `API_UPSTREAM` substituted at start |
| Full stack | `docker compose -f deploy/preview.compose.yml -f docker-compose.verify.yml up -d --build` — db, api, web all healthy inside the runner's memory budget |
| Proxy | the browser only ever talks to the app's own origin; nginx forwards `/api/...` to `http://api:8080` |
| Preview link | opened in a browser: 7 category headings, 21 part cards, prices in rupiah; then sign-up, six parts chosen, total `Rp 6.030.000`, order review, order placed, confirmation page with the real UUID — the same flow on the phone viewport |

## Test case coverage

`testcase.md` v1 has 68 cases: 58 at level UI, 5 at API, 5 end-to-end. The UI
cases are covered as follows.

| Area (testcase level UI) | Verified by |
| --- | --- |
| Catalogue: seven categories, 21 parts, prices, no session needed | `builder.spec.js` (desktop + phone), `BuilderPage.test.jsx` |
| Choosing and removing a part, totals update | `builder.spec.js`, `BuilderPage.test.jsx` |
| Checkout refusal, the empty-category list, optional graphics card | `builder.spec.js`, `BuilderPage.test.jsx` |
| Build survives a reload; a vanished part is dropped and named | `builder.spec.js`, `BuilderPage.test.jsx` |
| Catalogue failure and retry | `builder.spec.js`, `BuilderPage.test.jsx` |
| Sign in, sign up, validation, duplicate email, password rule, ended session, sign out | `auth.spec.js`, `SignInPage.test.jsx`, `SignUpPage.test.jsx` |
| Guest checkout, return path, build kept, order review, order placed, confirmation, unknown order, empty review, confirmation without a session | `checkout.spec.js`, `ReviewPage.test.jsx` |
| Sign out keeps the build and says so; a crafted return path falls back | `auth.spec.js` |
| Not-found page, text that looks like markup, refused order with reference, phone bar and desktop panel | `robustness.spec.js` |
| Every screen state in the mock, visually | the fidelity sweep above |
| API-level cases (5) and end-to-end cases (5) | the backend's own suite and Newman; not duplicated here |

## Deviations and decisions

1. **No nexcomponent.** `architecture.md` names `nexcomponent-ui` as the
   preferred house layer, but the feature's non-goals exclude it and `UIMap.md`
   directs the design's own component classes to be ported. The app therefore
   imports the library nowhere and does not list it in `package.json`; the
   design is plain CSS in `src/styles/app.css`.
2. **Routes.** The mock's 23 hash screens become five routes plus a wildcard:
   `/` (builder, in all its states), `/sign-in`, `/sign-up`, `/order-review`,
   `/order-confirmation/:orderId`, `*` → not found. States that the mock shows
   as separate screens (partial, complete, refused, gone, loading, error,
   submitting, expired) are page states, not URLs, which matches the spec.
3. **Same-origin proxy keeps `Origin`.** The backend refuses any write whose
   `Origin` differs from `APP_ORIGIN` (`403 ORIGIN_REJECTED`) and a request with
   no `Origin` but a `Sec-Fetch-Site` header. The Vite dev/preview proxy
   therefore forwards the browser's `Origin` unchanged instead of stripping it,
   and the API's `APP_ORIGIN` must be the exact origin the browser uses. This
   was verified live: through the proxy, a wrong password answers
   `401 INVALID_CREDENTIALS` rather than `403`.
4. **Deployment files.** This feature is the first thing in the repository, so
   the image, the nginx config, `docker-compose.yml`, the preview stack and
   `DEPLOY.md` are part of this delivery. The compose override used for the
   verification run (`docker-compose.verify.yml`) carries only small memory
   limits and test-friendly rate limits; the shipped compose file stays plain.
5. **Two e2e skips** are intentional: the desktop panel test and the phone bar
   test each skip on the other viewport.

## Reproduce locally

```sh
# backend (its own repository, merged feat/pc-builder)
DATABASE_URL='postgres://compzy:compzy@127.0.0.1:5432/compzy?sslmode=disable' \
APP_ORIGIN='http://127.0.0.1:4173' COOKIE_SECURE=false go run ./cmd/api

# frontend
npm ci
npm run build
VITE_API_PROXY='http://127.0.0.1:8080' npx vite preview --port 4173 --strictPort

# checks
npx eslint . && npm test && npm run build
APP_URL='http://127.0.0.1:4173' CHROMIUM_PATH="$NEXAI_CHROMIUM_PATH" \
  npx playwright test
```

With Docker, `docker compose up -d --build` serves the app on
`http://localhost:8081` with `APP_ORIGIN=http://localhost:8081` on the API, and
`docker compose -f deploy/preview.compose.yml up -d --build` brings up the
whole stack. `DEPLOY.md` has both, plus the smoke check.
