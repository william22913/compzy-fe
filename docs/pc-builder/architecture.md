---
feature_code: pc-builder
service: compzy
version: 1
status: complete
spec_version: 1
code_repo: https://github.com/william22913/compzy-be
release_branch: main
integration_branch: feat/pc-builder
stack: go
frontend_repo: https://github.com/william22913/compzy-fe
frontend_base_branch: main
dev_feedback: []
code_prep_feedback: []
sources:
  - path: knowledge/design-reference.md
    source_version: unversioned
    note: The manager's visual reference (Dribbble shot); owned by /ui-preparation, listed here so the design record matches spec.md.
pr_url: https://github.com/william22913/sandbox-docs/pull/76
last_updated: 2026-11-16
---

# pc-builder — Architecture (compzy)

Backend design for the PC Builder feature, derived from the merged `spec.md`
v1 (41 requirements) and `testcase.md` v1 (TC-001..TC-068). It records how the
feature is built, not what it must do: the requirement text stays in `spec.md`.
The data design lives in [`database.md`](database.md).

## Overview

`compzy-be` is one small Go HTTP service backed by one PostgreSQL database.
It serves the part catalogue, customer accounts and sessions, and order
submission. `compzy-fe` is a separate React application that renders every
screen and calls the API. The two are deployed behind one nginx origin: the
browser only ever talks to compzy.

The build itself (which part the customer picked in each category) lives in the
browser. A visitor has no identity, and the spec forbids saved or named builds,
so the server never stores a build. It stores the parts catalogue, accounts,
sessions and submitted orders — nothing else. The running total is computed by
the frontend from the catalogue prices and **recomputed by the backend at
submission**, so the recorded order can never disagree with the prices the
store holds (REQ-029, REQ-040).

## Stack decision

**`stack: go`.** `compzy-be` exists, is empty, and the requirement is a
request/response service that a browser calls (`spec.md` Dependencies: "a
backend service in `compzy-be`"). That is the `go` profile, not a data
pipeline. The decision was made from the spec and the empty repository — there
was no existing stack to preserve.

The manager's hard constraints are part of the design: **no nexcommon** in the
backend and **no nexcomponent** in the frontend. Everything below is therefore
ordinary, widely known Go and React tooling with no house framework.

## Technology Stack

| Area | Tool | Purpose / why |
|---|---|---|
| Language | Go 1.23 | The chosen stack; compiles to one static binary, standard library covers HTTP and JSON. |
| HTTP server | `net/http` with Go 1.22+ `ServeMux` method patterns | No router dependency. Routes read as `mux.HandleFunc("POST /api/v1/orders", …)` — the simplest thing that handles this API. |
| Database | PostgreSQL 16 | One relational store for catalogue, accounts, sessions and orders; integers and transactions cover the money and order-integrity rules. |
| DB access | `github.com/jackc/pgx/v5` (`pgxpool`), plain SQL | No ORM. Every query is a parameterized constant string, visible in the code, which keeps SQL injection closed and the learning curve low. |
| Migrations | Plain `.sql` files in `migrations/`, embedded with `embed`, applied in order at startup | No migration tool to install. A `schema_migrations` table records what ran; the runner is about 60 lines. |
| Password hashing | `golang.org/x/crypto/bcrypt`, cost 12, over a SHA-256 pre-hash | bcrypt alone silently ignores everything past 72 bytes, and the spec allows 128-character passwords (REQ-035); pre-hashing with SHA-256 removes that ceiling. |
| Metrics | `github.com/prometheus/client_golang` | Request and business counters on `/metrics`, per the observability decision below. |
| IDs | `gen_random_uuid()` (built into PostgreSQL 13+) | Public ids are UUIDs; no sequential row numbers leave the service. |
| Config | Environment variables, read once into a `config` struct | No config library. `.env.example` documents every variable; real values never enter git. |
| Tests | Go standard `testing` + `net/http/httptest`, real Postgres via `TEST_DATABASE_URL` | No test framework dependency; handler tests exercise the real SQL. |
| Container | Docker + Docker Compose (Postgres, API, nginx-served frontend) | One command starts the whole app for the operator. |
| Frontend stack | React 18.3, Vite 5, JavaScript/JSX, Ant Design 5, React Router 6, native `fetch` (no HTTP client dependency), React Hook Form | Separate application in `compzy-fe`; Ant Design is the component layer because nexcomponent is excluded. Follows the house Polaris-style structure and its adapter → service → hook → page API flow. |

Total Go dependencies: `pgx`, `x/crypto`, `prometheus/client_golang`. Nothing
else.

## Repository layout

`compzy-be` (created by the build steps, all new):

```
compzy-be/
  cmd/api/main.go              entry point: config, pool, migrations, router, graceful shutdown
  internal/config/             env parsing and defaults
  internal/httpapi/            router, middleware (request id, logging, metrics, origin check, body limit), handlers
  internal/catalogue/          categories + parts: store and service
  internal/accounts/           customers + sessions: store, password hashing, validation
  internal/orders/             order submission and owner-scoped read
  internal/i18n/               English dictionary loader
  internal/db/                 pgx pool + embedded migration runner (advisory-locked)
  migrations/0001_categories_customers.sql  categories (7 seeded) + customers
  migrations/0002_parts.sql                  parts table + the 21 seeded parts
  migrations/0003_sessions_orders.sql        sessions + orders
  migrations/0004_order_items.sql            order_items + its constraints/indexes
  i18n/en.json                 every API message, one key per error code and field rule
  docs/pc-builder/             copy of architecture.md and database.md written by /go-dev
  .env.example, Dockerfile, docker-compose.yml, README.md
```

`compzy-fe` (created by the build steps, all new):

```
compzy-fe/
  src/app/                      App root, providers, router
  src/core/api/client.js        one fetch wrapper (baseURL /api, credentials: same-origin, error mapping)
  src/core/api/adapters/        catalogue.js, auth.js, orders.js  (wire shape in, domain shape out)
  src/core/services/            catalogueService.js, authService.js, orderService.js
  src/features/builder/         BuilderPage + hooks, category list, part card, total bar
  src/features/auth/            SignInPage, CreateAccountPage, forms and hooks
  src/features/checkout/        OrderReviewPage, confirmation
  src/features/errors/          catalogue-error, not-found, loading states
  src/helpers/                  money.js (rupiah), buildStorage.js (localStorage)
  src/locales/en.json           every visible string
  src/routes/                   route table + protected-route wrapper
  src/store/                    AuthContext, BuildContext
  Dockerfile, nginx.conf, README.md
```

## Scale

`app_scale` is **`small`** (spec: about 200 customers today, ~2,000 within a
year, ~10 concurrent users, a few thousand builds and orders a year, one
store, an hour of downtime costs a handful of lost sales). The design is built
to exactly that profile and does not step up:

- **One backend instance.** No load balancer, no replicas, no sticky sessions.
  Session state lives in PostgreSQL, not in process memory, so a restart only
  signs nobody out.
- **One PostgreSQL 16 database.** No read replica, no partitioning. Backups are
  a nightly `pg_dump` run by the operator; restore is `psql < dump`.
- **No cache and no queue.** Every request is served in-process in
  milliseconds. There is no slow work to move off the request path.
- **Rate limiting is in-memory** inside the single instance — correct at one
  replica. If the service ever runs more than one replica, the limiter must
  move to a shared store; that is recorded in `## Non-functional decisions`.
- **Logs** are structured JSON lines to stdout. **Metrics** are exposed on an
  internal port (see `## Observability`).
- **The whole app is one `docker compose up`**: database, API, and the nginx
  container serving the frontend build and proxying `/api` to the API.

Deliberate step up or down from the profile: none. Deliberate omission:
no connection-pool autotuning beyond `DATABASE_MAX_CONNS` (default 10, well
above 10 concurrent users).

## Localization

- **Languages: English only** (`en`). `spec.md` v1 offers no second language;
  the design keeps the text out of the code so adding one later is translation
  work, not a rebuild.
- **Language selection:** there is no stored preference (no profile screen), so
  every request is served in `en`. `Accept-Language` is read but cannot select
  any other language; `en` is the fallback for every missing key.
- **Backend dictionaries:** one file per language, `i18n/en.json`, keyed by
  error code and field rule (for example `error.email_taken`,
  `field.password.rule`). Every error response carries a stable machine `code`
  and the translated `message`, both produced from that file. No user-visible
  string is hardcoded in a handler.
- **Frontend dictionaries:** one file per language, `src/locales/en.json`, holding
  every label, button, heading and message. The frontend shows the backend's
  `message` verbatim for a known error code (TC-068) and its own dictionary
  text for everything it renders itself.
- **Formatting:** dates travel as RFC 3339 UTC strings and are formatted in the
  browser locale; money travels as integer rupiah (`*_rupiah` fields) and is
  formatted in the browser by
  `new Intl.NumberFormat('id-ID', {maximumFractionDigits: 0})` with an
  `"Rp "` prefix — dot thousands separators, no decimals, exactly
  "Rp 12.500.000". The currency itself is always rupiah and never changes with
  the language.

## Permissions

One store, no admin, no staff role. The catalog is deliberately small, and a
signed-in-only split exists so an admin role can be added later without a
redesign.

**Permission catalog** (`<path>:<action>`):

| Permission | Meaning |
|---|---|
| `catalogue:view` | See the seven categories and their parts. |
| `account:create` | Create a customer account. |
| `account:signin` | Sign in with an existing account. |
| `account:signout` | End the caller's own session. |
| `account:view` | Read the caller's own account. |
| `order:create` | Submit an order (checkout). |
| `order:view` | Read an order; scope is always `own`. |

**Roles and grants:**

| Role | Grants |
|---|---|
| `visitor` (not signed in) | `catalogue:view`, `account:create`, `account:signin` |
| `member` (signed in) | `catalogue:view`, `account:create`, `account:signin`, `account:signout`, `account:view`, `order:create`, `order:view` |

There is no admin grant in v1. A role is a fixed list held in code
(`internal/accounts`); no role table exists because no one edits roles at
runtime.

**Scope rules.** `order:view` is `own`: the order's `customer_id` must equal
the session's customer, checked in the query itself
(`WHERE uuid_key = $1 AND customer_id = $2`). A non-matching or non-existent
order returns the same `404 NOT_FOUND`, so one customer cannot learn whether
another's order exists (TC-063). `account:view` is `own` by construction: the
endpoint only ever reads the session's own customer row. No endpoint accepts a
customer id from the client.

## Components

Greenfield: both repositories are empty (verified remotely at `main` — no
commits, no files). Everything is **new**; nothing is **touched** or
**untouched** from an earlier feature.

### Backend components (new)

| Component | Responsibility | Notes |
|---|---|---|
| `cmd/api` | Wiring and lifecycle | Reads config, opens the pool, applies migrations, starts the server, shuts down gracefully on `SIGTERM` (30 s drain). |
| `internal/config` | Environment contract | One struct, validated at startup: a missing or invalid required value stops the process with a clear message. |
| `internal/db` | Pool + migration runner | `pgxpool` with `DATABASE_MAX_CONNS`; embedded `migrations/*.sql` applied in filename order inside one transaction each, recorded in `schema_migrations`. |
| `internal/httpapi` | Router, middleware, handlers | One middleware chain for the whole API: request id → origin check (non-GET) → body limit → request log → metrics → recoverer. Handlers only decode, validate, call a service, and encode. |
| `internal/catalogue` | Read the parts catalogue | One public read: categories in fixed position order with their parts ordered by name. |
| `internal/accounts` | Customers and sessions | Registration, sign-in, sign-out, current-customer read; bcrypt hashing; session minting and lookup; per-field validation used by both register and login. |
| `internal/orders` | Order submission and owner read | One transaction: lock the chosen part rows, validate existence and required categories, recompute the total from database prices, compare with the reviewed total, insert the order and its item snapshots, return the order. |
| `internal/i18n` | English dictionary | Loads `i18n/en.json` at startup; `T(code)` returns the message for an error code or field rule. |
| Migrations + seed | Data | Four files in the schema gate's batch order (`0001` categories + customers, `0002` parts + seed, `0003` sessions + orders, `0004` order_items). Each runs once inside its own transaction; the seed uses `ON CONFLICT DO NOTHING` so a restart never duplicates or overwrites the 7 categories and 21 parts. |

### Backend boundaries

- **The API owns price and total truth.** The client sends part ids and the
  total it displayed; the server recomputes everything from the database. A
  client-sent total is compared, never trusted.
- **The API does not own the build.** No build table, no build endpoints. The
  browser keeps the selection; the API only validates a submitted set of part
  ids.
- **The API does not render anything.** It returns JSON only. `/healthz` and
  `/metrics` are the only non-JSON-API endpoints.

### Frontend components (new)

Separate application in `compzy-fe`; see `## Frontend`. It owns all screen
state, the build selection, localStorage persistence, rupiah display
formatting, and every user-facing English string it renders itself.

### Filtering and list data

The only list in v1 is the parts catalogue, returned whole by one public
endpoint; the builder has no search, filter or sort controls, so there is no
filter-options endpoint and no cross-permission filter data. If a filter is
added later, its options must come from an endpoint authorized against the
consuming page's permission (`catalogue:view`), not from an admin/part-
management endpoint.

## Data design

Full record: [`database.md`](database.md) — produced through the
`nexcraft:schema-designer` gate and the house database design standards. The
gate's working notes are not committed: the confirmed ERD, the normalization
findings and the migration batches are recorded in `database.md`, and the
combined picture in `compzy/ERD.md`, because those two files are the stage's
own deliverables and are what the build steps read.

Seven tables: `categories`, `parts`, `customers`, `sessions`, `orders`,
`order_items`, plus the infrastructure table `schema_migrations`. Money is
whole-rupiah `BIGINT` everywhere. `parts`, `customers` and `orders` use a
public UUID as their primary key (opaque, so no row number ever leaves the
service); `categories.code` and `sessions.token_hash` are natural-key primary
keys; `order_items` has an internal-only bigint identity key. Order items are a
deliberate snapshot (part name and unit price at confirmation), so an order can
never be re-priced or re-named by later catalogue changes. No `status` column
is used, because v1 has no business workflow beyond "submitted"; no soft delete
is used, because v1 has no delete capability for accounts or orders and parts
are hard-deleted with the snapshot preserving order history. `database.md`
records these and the full key/index list, including the deliberate deviations
from the house schema standards.

## API conventions

- **Base path:** every API route is under `/api/v1` — the complete path is what
  the frontend calls and what the OpenAPI document records. Operational
  endpoints (`/healthz`, `/metrics`) sit outside `/api/v1` and outside the API
  contract.
- **Content type:** `application/json; charset=utf-8` for every API response.
  Requests must send `Content-Type: application/json` (a mismatch is
  `BAD_JSON`).
- **Success envelope:** `{"request_id": "<id>", "data": { … }}`.
- **Error envelope:** `{"request_id": "<id>", "error": {"code": "<CODE>",
  "message": "<English sentence>", "fields": [{"field": "<name>", "message":
  "<sentence>"}], "details": { … }}}` — `fields` and `details` are present only
  where the error table says so.
- **Request id:** `X-Request-Id` on the response always; the same value is in
  the body and in the server's log line. An incoming `X-Request-Id` is reused
  only when it matches `^[A-Za-z0-9-]{8,64}$`; otherwise a fresh 16-hex-char id
  is generated.
- **Authentication:** an opaque session cookie, `compzy_session`. No bearer
  tokens, no client-stored secrets.
- **IDs:** every id in a request or response is a row's public UUID (`parts.id`,
  `customers.id`, `orders.id`), serialized as a string. The frontend treats
  every id as opaque; internal keys (`order_items.id`, `sessions.token_hash`)
  never appear in a response.
- **Money:** integer rupiah in `*_rupiah` fields; never a decimal, never a
  formatted string. Formatting happens once, in the browser.
- **Routing:** `net/http` `ServeMux` path patterns (`/api/v1/orders/{order_uuid}`)
  plus one ~12-line helper that dispatches on the request method and answers an
  unmatched method with the JSON `405` body, and a catch-all `/` that answers an
  unknown path with the JSON `404` body — so every response, including routing
  misses, follows the envelope below.

## Configuration

Everything is an environment variable, read once at startup and validated
there (a missing required value stops the process with a clear message). The
names below are the complete contract; `.env.example` ships every one with a
development value, and no real secret is ever committed.

| Variable | Default | Used for |
|---|---|---|
| `APP_ENV` | `development` | `production` turns on `Secure` cookies by default and stricter log output. |
| `PORT` | `8080` | The public API listener. |
| `DATABASE_URL` | — (required) | PostgreSQL connection string, for example `postgres://compzy:compzy@localhost:5432/compzy?sslmode=disable`. |
| `DATABASE_MAX_CONNS` | `10` | Pool maximum; comfortably above ~10 concurrent users. |
| `APP_ORIGIN` | — (required) | The browser origin allowed by the Origin check: `http://localhost:5173` with the Vite dev server, `http://localhost:8081` in compose. |
| `COOKIE_SECURE` | `true` when `APP_ENV=production`, else `false` | `Secure` attribute on the session cookie. |
| `SESSION_TTL_HOURS` | `720` (30 days) | Session lifetime, renewed on use. |
| `AUTH_RATE_LIMIT_PER_MIN` | `60` | Per-IP requests per minute on register and login. `0` disables. Test/compose: `1000`. |
| `ORDER_RATE_LIMIT_PER_MIN` | `30` | Per-customer requests per minute on order submission. `0` disables. Test/compose: `1000`. |
| `METRICS_ADDR` | empty (served on `PORT`) | Internal Prometheus listener in production and compose: `:9090`. |
| `TRUST_PROXY` | `false` | When `true` (set in compose), the client IP for rate limiting comes from nginx's `X-Real-IP`; otherwise the direct peer address is used. |
| `LOG_LEVEL` | `info` | Structured log verbosity. |

## Backend — Endpoints

All `/api/v1` endpoints below are consumed by the frontend pages named in
`## Frontend`; no other service and no third party calls this API (`spec.md`
External Integrations: none).

| Method | Path | Consumer | Permission | Scope | Purpose |
|---|---|---|---|---|---|
| GET | `/api/v1/catalogue` | fe — Builder | `catalogue:view` (public) | — | The seven categories, in fixed order, each with its parts and prices. |
| POST | `/api/v1/auth/register` | fe — Create account | `account:create` (public) | — | Create a customer account and sign them in. |
| POST | `/api/v1/auth/login` | fe — Sign in | `account:signin` (public) | — | Sign in and mint a session. |
| POST | `/api/v1/auth/logout` | fe — Header (signed-in) | `account:signout` | — | Delete the caller's session; idempotent, always `204`. |
| GET | `/api/v1/auth/me` | fe — any screen (header state) | `account:view` | own | The signed-in customer, so a reload can restore sign-in state. |
| POST | `/api/v1/orders` | fe — Order review | `order:create` | — | Validate the build and record the order. |
| GET | `/api/v1/orders/{order_uuid}` | fe — Confirmation | `order:view` | own | One order the caller placed, used by the confirmation screen after a reload. |

Operational endpoints, outside the API contract: `GET /healthz` (liveness plus
a database ping) and `GET /metrics` (Prometheus), both described under
`## Observability`.

## API contract

Request and response bodies are shown as the exact JSON shapes the frontend
and `/go-dev` build against. Every example's `request_id` is illustrative.

### GET /api/v1/catalogue

No request body. `200 OK`:

```json
{
  "request_id": "6f1c2a9d4b8e0f31",
  "data": {
    "categories": [
      {
        "code": "cpu",
        "name": "Processor (CPU)",
        "required": true,
        "parts": [
          {"id": "0b9f2c4e-6d1a-4f8e-9a3c-2d5e7f1b8c40", "name": "Intel Core i3-12100F", "price_rupiah": 1350000}
        ]
      }
    ]
  }
}
```

`categories` is always the seven rows in `position` order; `parts` is ordered
by name. `code` values are exactly `cpu`, `motherboard`, `ram`, `storage`,
`gpu`, `psu`, `case`. Errors: `500 INTERNAL` when the database is unreachable.

### POST /api/v1/auth/register

```json
{"full_name": "Budi Santoso", "email": "buyer1@example.com", "password": "Build1234"}
```

`201 Created`, `Set-Cookie: compzy_session=…`:

```json
{"request_id": "…", "data": {"user": {"id": "<customer uuid>", "full_name": "Budi Santoso", "email": "buyer1@example.com"}}}
```

Validation, all server-side as well as in the form (REQ-032 to REQ-035):
`full_name` trimmed, 2–100 characters; `email` trimmed, syntactically valid,
at most 254 characters, stored lower-cased; `password` not trimmed, 8–128
characters, at least one letter and one digit. Errors: `422 VALIDATION_FAILED`
with one `fields[]` entry per bad field, `409 EMAIL_TAKEN`, `429 RATE_LIMITED`.

### POST /api/v1/auth/login

```json
{"email": "buyer1@example.com", "password": "Build1234"}
```

`200 OK` with the same `{data:{user}}` shape and a fresh cookie. Errors:
`422 VALIDATION_FAILED` for an empty field, `401 INVALID_CREDENTIALS` — one
generic message for an unknown email and a wrong password alike, computed with
the same work in both cases so timing does not reveal which it was (TC-043,
TC-044) — and `429 RATE_LIMITED`.

### POST /api/v1/auth/logout

No body. `204 No Content` and the cookie is cleared. Always succeeds for a
caller with a valid session; a caller without one also gets `204`, so a stale
browser tab cannot get stuck. Deleting the session row is what makes a
captured cookie stop working (TC-050).

### GET /api/v1/auth/me

`200 OK`:

```json
{"request_id": "…", "data": {"user": {"id": "<customer uuid>", "full_name": "Budi Santoso", "email": "buyer1@example.com"}}}
```

`401 UNAUTHENTICATED` when there is no valid, unexpired session — the frontend
then shows the visitor header without a route change.

### POST /api/v1/orders

Requires a valid session. The frontend sends the currently selected parts and
the total it displayed on the review screen:

```json
{"part_ids": ["<uuid>", "…"], "reviewed_total_rupiah": 4230000}
```

`201 Created`:

```json
{
  "request_id": "…",
  "data": {
    "order": {
      "id": "<order uuid>",
      "total_rupiah": 4230000,
      "created_at": "2026-11-16T06:30:00Z",
      "items": [
        {"category_code": "cpu", "category_name": "Processor (CPU)", "part_name": "Intel Core i3-12100F", "unit_price_rupiah": 1350000}
      ]
    }
  }
}
```

Server-side rules, in this order, inside one transaction:

1. Session required — otherwise `401 UNAUTHENTICATED`, nothing written
   (TC-050, TC-062).
2. Payload shape: 1–7 `part_ids`, no duplicates, each a valid UUID;
   `reviewed_total_rupiah` a positive integer. Otherwise
   `422 VALIDATION_FAILED`.
3. At most one part per category. Otherwise `422 VALIDATION_FAILED` with the
   message for `BUILD_INVALID_CATEGORY`.
4. Every part id must exist. Otherwise `409 PART_UNAVAILABLE` with
   `details.unavailable_part_ids`; nothing is written and no total is returned
   as if current (TC-060).
5. Every required category (`categories.is_required`) must be filled. Otherwise
   `422 BUILD_INCOMPLETE` with `details.missing_categories`
   (`[{"code": "psu", "name": "Power Supply"}]`), naming only required
   categories (TC-017, TC-018, TC-019).
6. The total is recomputed from the database prices of the chosen parts. If it
   differs from `reviewed_total_rupiah`, return `409 TOTAL_CHANGED` with
   `details.total_rupiah` and `details.items` (the authoritative priced build);
   nothing is written (TC-060, TC-057).
7. Insert `orders` and `order_items` with the snapshot columns, then return the
   order. The returned `total_rupiah` is the recomputed value, which is by
   definition the reviewed one.

### GET /api/v1/orders/{order_uuid}

Requires a valid session; the order must belong to the caller. `200 OK` with
the same `{data:{order}}` shape as above. A well-formed id for someone else's
order and an id that does not exist both return `404 NOT_FOUND` — identical,
so order existence is not disclosed (TC-063). `401 UNAUTHENTICATED` without a
session.

## Error contract

Every code below is stable and maps to `i18n/en.json`. The frontend displays
`error.message` verbatim for these codes; for a code not in this table it
shows its generic message plus the `request_id`. Every response carries
`request_id` in the body and `X-Request-Id`, and the server logs the same value
on the request line, so any refusal in a log can be found from the screen.

| HTTP | Code | When | Extra body | Customer-facing message and screen action |
|---|---|---|---|---|
| 400 | `BAD_JSON` | Body is not JSON, or the content type is wrong | — | "The request could not be read." Show it on the form; nothing is lost in the fields. |
| 403 | `ORIGIN_REJECTED` | A non-GET request carries an `Origin` that is not the configured app origin | — | "The request was blocked for security reasons. Reload the page and try again." |
| 404 | `NOT_FOUND` | Unknown path, or an order the caller does not own | — | "We could not find that order." Show the not-found page. |
| 405 | `METHOD_NOT_ALLOWED` | Wrong method for a known path | — | "This request is not supported." |
| 409 | `EMAIL_TAKEN` | Registration with an email that already has an account (case-insensitive) | — | "An account already exists for that email address. Sign in instead." Show it on the create-account form with a Sign in link (TC-028, TC-029). |
| 409 | `PART_UNAVAILABLE` | A submitted part no longer exists in the catalogue | `details.unavailable_part_ids` | "Some parts in your build are no longer available. Review your build and try again." Remove those parts from the build, return to the builder, show the new total (TC-060). |
| 409 | `TOTAL_CHANGED` | The recomputed total differs from the reviewed one | `details.total_rupiah`, `details.items` | "The prices in your build changed. Review the updated total before placing your order." Return to the review with the new total; never submit at the old one. |
| 422 | `VALIDATION_FAILED` | A field or body value breaks a rule | `fields[]` | Field messages from the dictionary; the form stays filled (TC-025 to TC-041). |
| 422 | `BUILD_INCOMPLETE` | A required category has no part | `details.missing_categories` | "Choose a part in every required category before checking out." Name the categories; disable checkout until complete (TC-017, TC-018, TC-019). |
| 401 | `INVALID_CREDENTIALS` | Wrong email or wrong password at sign-in | — | "The email address or password is not correct." One message for both causes; keep the email, clear the password (TC-043, TC-044). |
| 401 | `UNAUTHENTICATED` | No session, or the session expired or was ended | — | "Please sign in to continue." Send to sign-in and come back to the review with the build intact (TC-061). |
| 429 | `RATE_LIMITED` | The per-IP auth limit or per-customer order limit is exceeded | — | "Too many attempts. Please wait a moment and try again." Keep the form filled. |
| 500 | `INTERNAL` | An unexpected server or database failure | — | "Something went wrong. Please try again." Show the `request_id` so the store can find it in the logs. |

Field messages (dictionary keys, all English): `field.full_name.required`,
`field.full_name.length`, `field.email.required`, `field.email.invalid`,
`field.email.length`, `field.password.required`, `field.password.rule`.

## Security design

Each row is a decision this feature must implement, with the proof that
verifies it. `TC-*` cases are in `testcase.md`; named tests are Go tests in
`compzy-be/internal/…` that `/go-dev` writes.

| Threat | Control | Where | Proof |
|---|---|---|---|
| Anyone submits or reads an order | Session required on `POST /orders` and `GET /orders/{id}`; the order read filters by `customer_id` in the SQL itself and returns `404` for someone else's order | BE — `internal/orders`, `internal/httpapi` | TC-050, TC-062, TC-063 |
| Password theft from the database or logs | bcrypt (cost 12) over SHA-256 of the password; hash never leaves the store, never appears in a response or log line; passwords never logged | BE — `internal/accounts` | Test `TestPasswordHashRoundTrip` and `TestNoSecretsInLogLine`; review check on every handler that logs |
| Session theft or fixation | 256-bit opaque token from `crypto/rand`; only its SHA-256 is stored; a new token on every sign-in and registration; logout deletes the row; 30-day sliding expiry; cookie `HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000` (persistent, so a browser restart keeps the session, REQ-011) and `Secure` when `COOKIE_SECURE=true` | BE — `internal/accounts`, `internal/httpapi` | Test `TestSessionCookieFlags`; TC-049, TC-050, TC-061 |
| CSRF on the cookie-authenticated writes | `SameSite=Lax` **plus** an `Origin` allowlist check on every non-GET request: when `Origin` is present it must equal `APP_ORIGIN`; a request with no `Origin` and no `Sec-Fetch-Site` is a non-browser client and is allowed; anything else is `403 ORIGIN_REJECTED` | BE — origin-check middleware | Test `TestOriginCheck` (allowed, foreign, absent); no state-changing GET exists |
| Account enumeration and brute force at sign-in | Identical `401` for unknown email and wrong password, with the same bcrypt work done in both paths; per-IP limit `AUTH_RATE_LIMIT_PER_MIN` (production 60, test/compose 1000, `0` disables) — no account lockout, so REQ-036 still holds | BE — `internal/accounts`, rate-limit middleware | TC-043, TC-044, TC-046, TC-068 |
| Abuse of order submission | Per-customer limit `ORDER_RATE_LIMIT_PER_MIN` (production 30, test/compose 1000); the limiter key is the session's customer, and the per-IP auth limiter keys on the client address (`X-Real-IP` only when `TRUST_PROXY=true`, so a forged header is ignored by default) | BE — rate-limit middleware | Test `TestOrderRateLimit`; TC-057 unaffected |
| SQL injection | Every query is a constant parameterized string through pgx; no string concatenation of user input; dynamic `ORDER BY` never exists | BE — all stores | `/go-dev` runs `nexcraft:sql-security-validator` on the diff, must return PASS |
| Oversized or slow request bodies | `http.MaxBytesReader` at 16 KB on every POST; read header timeout 5 s, read 10 s, write 15 s, idle 60 s | BE — server + middleware | Test `TestBodyLimit`; TC-051 unaffected |
| XSS in the frontend | React escapes all rendered text; `dangerouslySetInnerHTML` is banned; server messages are rendered as text | FE | Playwright assertion that a part name containing `<script>` renders as text |
| Cross-site framing, script injection into the static app | nginx sends `Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'`, plus `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY` | FE — `nginx.conf` | `curl -I` on the frontend origin shows both headers; Playwright run with the policy active |
| Metrics leaking to the public internet | `/metrics` listens on a separate internal port (`METRICS_ADDR`, default `:9090`); nginx has no route to it; the API port publishes only `/api/v1`, `/healthz` | BE/FE — listeners and `nginx.conf` | Compose check: `curl` on the public origin for `/metrics` returns 404; direct internal port returns 200 |
| Open redirect through the sign-in return | The backend never redirects. The frontend uses a fixed route map and a return value limited to `/checkout`; any other value falls back to `/` | FE — auth flow | Playwright test `return=//evil.example` lands on `/` |
| Client tampering with the order total | The total is recomputed server-side from database prices in the same transaction; the client's value is only compared | BE — `internal/orders` | TC-057, TC-058, TC-060 |
| Secret leakage through configuration | Configuration is environment variables only; `.env` is git-ignored; `.env.example` lists names with sample values; no secret has a default in code except development-only values | BE/FE — config + repo hygiene | Review check: `git ls-files` contains no `.env`; grep of the diff finds no token literal |

Rate-limit values are configuration, so the local stack and the end-to-end
tests raise them instead of tripping them: production `AUTH_RATE_LIMIT_PER_MIN=60`
and `ORDER_RATE_LIMIT_PER_MIN=30`; the compose/test environment sets both to
`1000` (and may set `0` to disable).

## Observability

- **Current state.** `compzy-be` is empty: no existing metrics, no router, no
  `/metrics` route, no pinned library. There is nothing to reuse, so the
  instrumentation is written once, here.
- **Decision: wire standard request metrics once.** Use
  `prometheus/client_golang` with the default registry and an
  `promhttp.Handler()`, plus one middleware that labels every request with the
  **route pattern** (never the raw path) and the status the handler actually
  wrote:
  `http_requests_total{route,method,status}` and
  `http_request_duration_seconds{route,method}` (histogram). Because this
  service does not use nexcommon, the "hardcoded 200 status label" library
  problem does not apply; status is taken from the response writer wrapper.
- **Feature business counters.** Three, no dashboards invented:
  `compzy_orders_created_total`,
  `compzy_auth_login_total{result="ok|invalid"}`, and
  `compzy_auth_register_total{result="ok|duplicate|invalid"}`.
- **Implementation boundary.** One `internal/httpapi/metrics.go` middleware and
  one `internal/httpapi/observability.go` handler. `/metrics` is served on the
  shared listener in development for convenience, and in compose/production on
  `METRICS_ADDR` (`:9090`) only, with `:9090` not published through nginx.
  Labels are bounded: route patterns and known codes only — never a raw path,
  an email, a customer id or an order id.
- **Verification.** A `200` from `GET /api/v1/catalogue` must make
  `http_requests_total{route="/api/v1/catalogue",status="200"}` increase; a
  failed sign-in must make it increase with `status="401"` and
  `compzy_auth_login_total{result="invalid"}` increase. `/go-dev` checks both
  with `curl` before calling the work done.

## Frontend

`has_ui: true`. The frontend is a **separate application** in
`https://github.com/william22913/compzy-fe`, base branch `main` — not pages
rendered by the Go service. The Go service returns JSON only.

- **Stack:** React 18.3 + Vite 5 + JavaScript (JSX), React Router 6, Ant Design
  5 as the component layer (nexcomponent is excluded by the manager). Native
  `fetch` in one small `src/core/api/client.js`; no state library — two React
  contexts are enough. Node 20 for the build. Tests: Vitest + React Testing
  Library for units and page behaviour, Playwright for the end-to-end journeys
  on a desktop (1440×900) and a mobile (390×844) viewport.
- **Screens and routes:**
  | Route | Screen | API calls |
  |---|---|---|
  | `/` | Builder: seven category sections, each part with name and price, a chosen/not-chosen state, remove action, running total, Checkout action, header with sign-in state | `GET /api/v1/catalogue`, `GET /api/v1/auth/me` |
  | `/sign-in` | Sign-in form, with a link to create an account | `POST /api/v1/auth/login` |
  | `/create-account` | Registration form (full name, email, password) | `POST /api/v1/auth/register` |
  | `/checkout` | Order review: chosen parts grouped by category with prices and the final total; back-to-builder and confirm actions; requires a signed-in customer | `GET /api/v1/catalogue` (if not loaded), `GET /api/v1/auth/me`, `POST /api/v1/orders` |
  | `/orders/:orderId` | Confirmation: the ordered parts and total; holds no further action | `GET /api/v1/orders/{order_id}` |
  | `*` | Not found | — |
  The visual design of these screens belongs to `/ui-preparation`'s `UIMap.md`
  and `DesignBrief.md` (being produced in parallel); this document fixes
  routes, states and API use only and deliberately invents no layout, colour
  or typography.
- **State decisions.** `AuthContext` reads `GET /auth/me` once on load and
  after sign-in/sign-out; a `401` there simply means "visitor" and is never
  shown as an error. `BuildContext` holds a map `category_code → part id`
  and persists it to `localStorage` under `compzy.build.v1`; on load it is
  restored only after the catalogue has loaded successfully and any id no
  longer present is dropped. That is what makes the build survive sign-in,
  account creation and a reload (REQ-012), and why a failed catalogue load
  shows the error state instead of a stale total (REQ-025, TC-066).
- **Checkout flow.** With no session, the Checkout action routes to
  `/sign-in?return=/checkout`; after sign-in the app returns to `/checkout`
  with the same build. The order is submitted only when the customer presses
  Confirm on the review; a `401` during submission returns to sign-in and then
  the review, and the client never auto-retries the submission (REQ-027).
- **Permissions in the UI.** Visitors see the builder and the header's sign-in
  link; members additionally see their name, sign-out and an enabled Checkout.
  Hiding a control is convenience only — the server enforces the same rules.
- **Deployment.** nginx serves the static build and proxies `/api/` to the Go
  service on the compose network, so the browser has one origin and no CORS is
  needed. The Vite dev server proxies `/api` the same way. The nginx config
  carries the security headers listed in `## Security design` and no route to
  `/metrics`.

## Planned breaking changes

None. This is the first API for `compzy`; no existing consumer contract
changes.

## Implementation Plan

- PART-1: Backend skeleton and foundation — Go module, config, PostgreSQL pool, the advisory-locked embedded migration runner and its four batches (categories + customers, parts + seed, sessions + orders, order_items) with the idempotent seed of 7 categories and 21 parts, request-id/log/recovery/body-limit middleware, `GET /healthz`, `GET /metrics` with request and business counters, Dockerfile, `docker-compose.yml` (db + api + fe), `.env.example`, README run steps.
- PART-2: Catalogue API — `GET /api/v1/catalogue` with its store query, response shapes, and handler tests covering the 7 categories, 21 parts, ordering and the public (no-session) read.
- PART-3: Accounts and sessions — `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`; validation for name/email/password, bcrypt+pre-hash, session minting, cookies, Origin check and auth rate limiting; tests for every rule in REQ-032..REQ-036 plus TC-043/TC-044/TC-046/TC-050.
- PART-4: Orders API — `POST /api/v1/orders` (payload validation, availability, required categories, server-side total recomputation, snapshot insert in one transaction) and `GET /api/v1/orders/{id}` (owner scope); tests for TC-057, TC-058, TC-060, TC-062, TC-063.
- PART-5: Contract artifacts and hardening — OpenAPI 3.1 document and Postman collection covering every `/api/v1` endpoint and error code, generated examples pinned to the seed data, the `nexcraft:sql-security-validator` and `nexcraft:production-readiness-agent` gates run clean, and a compose smoke run (`/healthz`, a catalogue fetch, a `/metrics` counter check).
- PART-6: Frontend skeleton and builder — Vite app with router, API client, `AuthContext`, `BuildContext` with localStorage, the Builder screen (seven categories, part selection/replacement/removal, live rupiah total, completeness message, checkout availability), loading/error/retry states, and unit tests for the total and the completion rule.
- PART-7: Frontend accounts and sign-in return — Sign-in and create-account screens with client-side field validation and server error display, header sign-in state, sign-out, and the `/sign-in?return=/checkout` round trip that keeps the build.
- PART-8: Frontend review, submission and confirmation — order review grouped by category, confirm/submit, confirmation screen (including reload via `GET /orders/{id}`), the `401`, `PART_UNAVAILABLE`, `TOTAL_CHANGED` and `BUILD_INCOMPLETE` handling, error/not-found pages, and Playwright end-to-end coverage of TC-001 to TC-068 on desktop and mobile.

## Non-functional decisions

- **Idempotent re-runs.** Migrations are applied once and recorded; the seed
  is `ON CONFLICT DO NOTHING`. Restarting or re-running `docker compose up`
  never duplicates the catalogue or changes a price. There is no idempotency
  key on `POST /orders` in v1: the spec's no-double-order rule is about the
  sign-in return path (REQ-027), which the frontend honours by never
  auto-retrying a submission; a customer who deliberately presses Confirm
  twice places two orders, which is outside v1's scope.
- **Concurrency.** Order submission runs in one transaction: it reads the
  chosen parts `FOR SHARE`, validates, recomputes and inserts, so a concurrent
  catalogue change cannot produce a recorded total that disagrees with the
  prices used. `UNIQUE` constraints (email, `(order_id, category_code)`,
  `(category_id, name)`) back every uniqueness rule, never an application
  pre-check alone.
- **Deployment.** Two repositories, one compose file with three services
  (Postgres, API, frontend). The API is stateless; sessions are in the
  database. Configuration is environment-only. The service handles `SIGTERM`
  with a 30-second drain.
- **Production readiness.** Server timeouts, body limits, pooled connections
  with a bounded maximum, structured JSON logs, `/healthz` for the platform,
  and `/metrics` for review. Nightly `pg_dump` is the backup; it is the
  operator's job, documented in the README.
- **Rate limiting is single-instance.** The in-memory limiter is correct at one
  replica (`app_scale: small`). Moving to more than one replica requires a
  shared limiter (for example Redis); this is recorded rather than built.
- **Backups and recovery.** An operator-run `pg_dump` nightly and the restore
  command in the README. No point-in-time recovery at this scale.
- **No compatibility checking, stock, quantities, payment, shipping, order
  history or admin** – enforced by the shape of the API (no such endpoints, no
  such columns), matching the spec's non-goals.

## Spec traceability

One line per requirement in the merged `spec.md` v1 (REQ-001 to REQ-041),
each with the architectural answer and the cases that check it.

- REQ-001: `GET /api/v1/catalogue` is public (no session) and returns every category with its parts; the frontend's `/` route renders the builder immediately. → TC-001, TC-005
- REQ-002: The `categories` table is seeded with exactly the seven fixed rows and no endpoint creates, renames or reorders categories; the API returns them in `position` order. → TC-001, TC-002
- REQ-003: The build is a map keyed by category code in the frontend (a second choice replaces the first); the API rejects duplicate categories in a payload (`422 VALIDATION_FAILED`) and `order_items` has `UNIQUE (order_id, category_code)`. → TC-006, TC-007
- REQ-004: The frontend removes the selected part from its build map and recomputes the total from the catalogue prices; no server call. → TC-008
- REQ-005: The frontend sums the chosen catalogue prices on every selection change; there is no recalculate endpoint and the total starts at 0. → TC-001, TC-006, TC-007, TC-009
- REQ-006: `orders.total_rupiah` is the plain sum of `order_items.unit_price_rupiah`; no tax, shipping or discount column or adjustment exists anywhere. → TC-009, TC-013, TC-015
- REQ-007: Prices travel as integer `*_rupiah`; the frontend formats them with a single `Intl.NumberFormat('id-ID')` helper plus `"Rp "`, dots and no decimals. → TC-010, TC-011, TC-012
- REQ-008: `categories.is_required` is true for six rows and false for `gpu`; the completion rule is evaluated from that column in the API and from `required` in the frontend. → TC-015, TC-018, TC-020
- REQ-009: `POST /api/v1/auth/register` creates the customer and its session in one request; `customers.email` is `UNIQUE`, so one account per address. → TC-024, TC-028, TC-054
- REQ-010: `POST /api/v1/auth/login` mints a session and `POST /api/v1/auth/logout` deletes the session row, so a captured cookie stops working. → TC-042, TC-047, TC-050, TC-062
- REQ-011: The session is an opaque cookie (`HttpOnly`, `SameSite=Lax`, `Secure` in production) backed by a `sessions` row with a 30-day sliding expiry; `GET /auth/me` restores sign-in state after a reload or restart. → TC-049
- REQ-012: The build lives in the frontend (`localStorage` `compzy.build.v1`) and sign-in/registration is a client route change; neither touches the build, so every part and the total survive. → TC-051, TC-052, TC-054
- REQ-013: The `/checkout` route renders the review from the current build and the catalogue data (parts by category, prices, total); no server preview endpoint is needed. → TC-055
- REQ-014: `POST /api/v1/orders` records the order and returns it, and the frontend shows the confirmation from that response (and from `GET /orders/{id}` on reload); there is no order-list endpoint or screen. → TC-056, TC-063
- REQ-015: With no session the Checkout action routes to `/sign-in?return=/checkout`; the build is already in `localStorage`, so the returned review is the same, and no order call is made while signed out. → TC-053, TC-054, TC-062
- REQ-016: `migrations/0002_parts.sql` inserts the 21 spec parts (three per category) idempotently, and `GET /catalogue` returns them with names and prices. → TC-001, TC-003, TC-012
- REQ-017: All backend messages come from `i18n/en.json` and all frontend copy from `src/locales/en.json`; there is no other language and no locale switch. → TC-067, TC-068
- REQ-018: An incomplete build yields `422 BUILD_INCOMPLETE` with `details.missing_categories`; the frontend names them and keeps the total at its true value. → TC-016, TC-017
- REQ-019: The frontend keeps the missing-category reason visible and Checkout unavailable while any required category is empty; the API refuses the same build if submitted. → TC-017, TC-018, TC-019, TC-022
- REQ-020: Removing the last part of a required category removes the key from the build map, recomputes the total and re-evaluates completeness, which disables Checkout again. → TC-016
- REQ-021: The frontend validates required fields before sending, and the API independently returns `422 VALIDATION_FAILED` with one `fields[]` entry per bad field; the form keeps its values. → TC-025, TC-026, TC-027, TC-045
- REQ-022: Sign-in returns one generic `401 INVALID_CREDENTIALS` message for an unknown email and a wrong password, performing the same password-hash work in both cases. → TC-043, TC-044, TC-068
- REQ-023: Registration with an existing address returns `409 EMAIL_TAKEN` before any insert; the unique `customers.email` constraint backs it under concurrency, and the frontend offers sign-in. → TC-028, TC-029
- REQ-024: The password rule (8–128 characters, at least one letter and one digit) is a shared server validator and a frontend pre-check, with the rule stated in the message. → TC-030, TC-034
- REQ-025: A catalogue request failure returns `500 INTERNAL` and the frontend shows its "parts could not be loaded" state with a retry action, never a stale total. → TC-064, TC-065, TC-066
- REQ-026: `POST /orders` resolves every part id against the database inside the transaction; a missing part returns `409 PART_UNAVAILABLE` with the ids, writes nothing, and the frontend removes those parts and shows the new total. → TC-060
- REQ-027: An expired session at submission returns `401 UNAUTHENTICATED`, writes nothing, and the frontend returns to sign-in then the same review; the client never auto-retries the submission. → TC-061
- REQ-028: Sign-out deletes the session row while the build stays in the frontend; `order:create` and `/checkout` require a session again. → TC-047, TC-048, TC-050
- REQ-029: The submission transaction recomputes the total from current database prices and records that computed number; `reviewed_total_rupiah` is only compared, and a mismatch returns `409 TOTAL_CHANGED` without writing. → TC-057
- REQ-030: Money is `BIGINT` rupiah in the database and JSON integers in the API; sums stay exact for any combination of the 21 parts (the largest build is Rp 14.500.000, far inside every limit). → TC-014
- REQ-031: The `/checkout` route renders from the current build each time it is entered, and the submitted payload is that current build; nothing is ordered from a stale copy. → TC-059
- REQ-032: Email is trimmed, syntax-checked with `net/mail` plus an exact-address check (no display name), limited to 254 characters in the validator and by a database length check. → TC-039, TC-040, TC-041
- REQ-033: The API lower-cases the trimmed address before storage and lookup, and `customers.email` is `UNIQUE`, so case variants collide. → TC-028, TC-029
- REQ-034: `full_name` is trimmed, required, 2–100 characters, checked in the validator and by `CHECK (char_length(full_name) BETWEEN 2 AND 100)`, and stored as typed. → TC-037, TC-038
- REQ-035: The password is never trimmed, is counted in characters (8–128), requires at least one letter and one digit, and is stored as bcrypt over a SHA-256 pre-hash so the full 128 characters matter. → TC-030 to TC-036
- REQ-036: Sign-in is stateless apart from session rows: there is no lockout counter, no failed-attempt column and no delay tied to an account; the only limit is a generous per-IP request rate, which ends on its own. → TC-046
- REQ-037: The build map holds one id per category, the API rejects a payload with two parts in one category, and `UNIQUE (order_id, category_code)` enforces it in the database. → TC-006, TC-007
- REQ-038: The API evaluates completeness against `categories.is_required` (six required, `gpu` optional) and refuses with `BUILD_INCOMPLETE`; the frontend mirrors it from the catalogue response. → TC-015, TC-020, TC-021, TC-023
- REQ-039: The seeded parts satisfy the name and price rules, and the schema enforces them: `CHECK` on name length and `price_rupiah > 0`, `UNIQUE (category_id, name)`. → TC-004
- REQ-040: `orders.total_rupiah` is computed inside the submission transaction from the chosen parts' current prices, with no tax, discount or shipping term. → TC-057
- REQ-041: `order_items` stores `category_code`, `category_name`, `part_name` and `unit_price_rupiah` as snapshots, with `part_id` nullable on part deletion, so the recorded order never loses or re-prices what the customer saw. → TC-058

## Open design gaps

- **Screen visuals.** `UIMap.md` and `DesignBrief.md` are being produced by
  `/ui-preparation` in parallel. This document fixes routes, states and API
  use; `/fe-dev` reads the approved design for layout, colour and typography.
- **Empty repositories.** Both `compzy-be` and `compzy-fe` exist with no
  commits, so neither `main` branch has a ref yet. `/go-dev` and `/fe-dev`
  create their own branches from their base branch as part of their own
  preflight; nothing in this design depends on a file already being there.
