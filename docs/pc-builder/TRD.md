---
feature_code: pc-builder
service: compzy
locked_version: 2
last_updated: 2026-11-16
---

# pc-builder — Technical Requirements Document

> Overview summary only — see `architecture.md` for the full design and
> its rationale.

## Overview

PC Builder is the whole of compzy v1, so this feature builds both applications
from nothing: a Go API (`compzy-be`) that serves JSON only, and a React + Vite
frontend (`compzy-fe`) that renders the Builder, Sign in, Create account, Order
review and Confirmation screens, reverse-proxied to the API on one origin by
nginx.

The v2 revision adds one thing to the live v1 app: the interface switches
between English and Indonesian on every page, a first-time visitor sees
Indonesian, a visitor's choice is remembered on the device, and a signed-in
customer's language is stored with their account. It adds one column, one
migration batch and one authenticated endpoint; it keeps the API single-language
on the wire and puts every localized string in the frontend.

Eight routes under `/api/v1` carry the product: the parts catalogue, register,
sign in, sign out, the signed-in customer, that customer's language, order
submission and one order read. The catalogue is public; the account routes,
the language change, order submission and the order read require a valid
session, and an order read is scoped to its owner in the SQL itself. There is no
sign-up confirmation mail, no admin, no saved or named build, no order history,
no search, filter or pagination, and no third party of any kind.

Data is six domain tables — `categories`, `parts`, `customers`, `sessions`,
`orders`, `order_items` — plus the migration runner's bookkeeping, created by
five migration batches (`0005` adds `customers.preferred_language` and
`updated_at` to the four v1 batches). The catalogue is seeded: 7 fixed
categories and 21 parts with real rupiah prices. There is no `builds` table: a
build belongs to a browser, kept in `localStorage`, and the API only validates a
submitted set of part ids.

Two constraints shape the build and are not open questions: the manager's stack
decision (Go without `nexcommon`, a separate frontend without `nexcomponent`)
and the approved look, which comes from `UIMap.md` and the mock rather than from
any house UI layer.

## Technical Goals

- Serve the whole catalogue to an anonymous visitor: one `GET
  /api/v1/catalogue` returning the seven categories in fixed order, each with
  its parts and prices, with no authentication and no pagination.
- Keep the build in the browser so a visitor can build before having an
  account, survive sign-in, account creation and a reload, and lose nothing when
  sign-in is required at checkout (`localStorage` under `compzy.build.v1`,
  restored only after the catalogue loads).
- Own price and total truth on the server: the client sends part ids and the
  total it displayed, the server recomputes from database prices in one
  transaction and refuses with `PART_UNAVAILABLE`, `BUILD_INCOMPLETE` or
  `TOTAL_CHANGED` rather than trusting, or silently changing, the total.
- Snapshot what was ordered: `order_items` stores the part name, category name
  and unit price at confirmation, so a later catalogue change can never re-price
  or re-name a placed order.
- Gate checkout on a valid session, never on a client-side check: both order
  routes answer `401` before doing any work, and the frontend's guard is a
  convenience, not the control.
- Keep sign-in honest without account enumeration or lockout: one generic
  refusal for an unknown email and a wrong password alike, with the same bcrypt
  work in both paths, and no per-account lockout.
- Hash passwords with bcrypt (cost 12) over a SHA-256 pre-hash, because the spec
  allows 128-character passwords and bcrypt alone ignores everything past 72
  bytes.
- Send emails lowercase with a plain `UNIQUE` constraint plus a lowercase CHECK,
  so case-insensitive uniqueness holds by construction.
- Emit one JSON envelope on every response including routing misses, with a
  request id in the body, in `X-Request-Id` and on the server log line, and
  never surface a raw server string in the UI.
- Wire Prometheus once on an internal listener with route-pattern labels and
  three business counters; publish only the frontend port, and keep `/metrics`
  off the public origin.
- Store exactly one interface language per account — `en` or `id`, never empty —
  set from the switcher at sign-up and changeable only by that signed-in
  customer through `PUT /api/v1/auth/me/language`; every account that predates
  the column is Indonesian by the migration's default, and a stored value that
  is somehow not one of the two is coerced to Indonesian on read so it never
  blocks a sign-in.
- Render every customer-visible string in the frontend from one of two bundled
  dictionaries, in the language the customer chose (account value, then the
  device's `compzy.lang.v1`, then Indonesian), translating API refusals by
  their stable `code`; the API keeps its English messages and gains no second
  dictionary, no `Accept-Language` handling and no per-request translation.
  Product, brand and model names and rupiah amounts read identically in both
  languages, and money is formatted once, in the browser, as "Rp 12.500.000".

## Technology Stack

| Area | Tool | Purpose |
|---|---|---|
| Backend language/runtime | Go 1.23 | Standard library `net/http` with ServeMux method/path patterns and one small JSON method dispatcher — eight routes do not justify a router dependency. |
| Shared libraries | none | `nexcommon` is deliberately excluded by the manager's decision; the service is self-contained. |
| Frontend | React 18 + Vite (JavaScript) + Ant Design 5 | Five screens and a header; `react-router` 6, no state library (four small contexts), no `nexcomponent`, no i18n library — two static dictionaries and a locale context are enough. |
| Persistence | PostgreSQL 16 + `pgx` v5 | Parameterized queries only; no ORM. |
| Migrations | Embedded SQL + a small Go runner | `embed.FS`, `schema_migrations`, one transaction per file, advisory lock at startup — no migration framework. |
| Passwords | `golang.org/x/crypto/bcrypt`, cost 12, over a SHA-256 pre-hash | Removes bcrypt's 72-byte ceiling so the full 128 allowed characters matter. |
| Sessions | Opaque 32-byte token, stored only as its SHA-256 | `HttpOnly`/`SameSite=Lax`/persistent cookie; sliding 30-day expiry; the raw token never reaches storage. |
| Money | Whole-rupiah `BIGINT`, integer JSON | No decimals, no formatted strings on the wire; `Intl.NumberFormat('id-ID')` renders in the browser. |
| Metrics | `prometheus/client_golang` | Default registry, one request middleware, `/metrics` on an internal listener. |
| Packaging | Dockerfile + compose (db, api, fe) and nginx | One origin for the browser, so no CORS; security headers and the `/api/` proxy live in `nginx.conf`. |
| Tests | Go `testing` + `-race`; Vitest + RTL; Playwright | Unit and store tests on the API, page behaviour on the frontend, and the end-to-end journeys on desktop and mobile viewports. |
