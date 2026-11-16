---
feature_code: pc-builder
service: compzy
locked_version: 2
last_updated: 2026-11-16
---

# pc-builder — Implementation Plan Overview

> Summary only — see `architecture.md`'s `## Implementation Plan` section
> for full detail.

## Overview

Ten ordered parts — order of work only, no timeline or estimate. PART-1 to
PART-5 built `compzy-be` (executed by `/go-dev` against `feat/pc-builder` in the
compzy-be repo) and PART-6 to PART-8 built `compzy-fe` (executed by `/fe-dev`);
all eight are live. The v2 language revision adds PART-9 (backend) and PART-10
(frontend), which run in that order against the same `feat/pc-builder` branches.

## Goals

Ship compzy end to end on the manager's stack decision — a Go API without
`nexcommon` and a separate React frontend without `nexcomponent` — with the
catalogue public, the build kept in the browser and carried through sign-in,
checkout refused when a required category is empty or a price changed, the
order snapshotted, and the approved look from `UIMap.md` and the mock. The v2
revision adds the English/Indonesian switcher on every page, the device-level
choice and the account's stored language, without changing any of the above.
Every one of the 99 cases in `testcase.md` must be reachable from these parts.

## Implementation Plan

| Part | What gets built | Key deliverable |
|---|---|---|
| PART-1 | Foundation and data layer | Go module, config, `pgx` pool, embedded advisory-locked migration runner, the four v1 migration batches (categories + customers, parts + seed, sessions + orders, order_items), the idempotent seed of 7 categories and 21 parts, request-id/log/recovery/body-limit middleware, `GET /healthz`, `GET /metrics` with request and business counters, Dockerfile, compose, `.env.example`, README. |
| PART-2 | Catalogue API | `GET /api/v1/catalogue` with its store query and response shapes, and handler tests covering the seven categories, the 21 parts, fixed ordering and the public read. |
| PART-3 | Accounts and sessions | Register, sign in, sign out, current customer; field validation, bcrypt over a SHA-256 pre-hash, session minting and lookup, the cookie, the Origin check and the auth rate limit; tests for REQ-032 to REQ-036 and TC-043/044/046/050. |
| PART-4 | Orders API | `POST /api/v1/orders` (payload validation, availability, required categories, server-side total recomputation, snapshot insert in one transaction) and `GET /api/v1/orders/{id}` with owner scope; tests for TC-057/058/060/062/063. |
| PART-5 | Contract artifacts and hardening | OpenAPI 3.1 document and Postman collection for every `/api/v1` endpoint and error code with examples pinned to the seed data, the SQL-security and production-readiness gates clean, and a compose smoke run. |
| PART-6 | Frontend skeleton and builder | Vite app with router, API client, `AuthContext`, `BuildContext` with `localStorage`, the Builder screen (seven categories, choose/replace/remove, live rupiah total, completeness message, checkout availability), loading/error/retry states, unit tests for total and completion. |
| PART-7 | Frontend accounts and sign-in return | Sign-in and create-account screens with field validation and server error display, header sign-in state, sign-out, and the sign-in round trip that keeps the build. |
| PART-8 | Frontend review, submission and confirmation | Order review grouped by category, confirm/submit, the confirmation screen including reload, the `401`/`PART_UNAVAILABLE`/`TOTAL_CHANGED`/`BUILD_INCOMPLETE` handling, error and not-found pages, and Playwright coverage of TC-001 to TC-068 on desktop and mobile. |
| PART-9 **(v2)** | Backend language support | Migration `0005_customers_preferred_language.sql` (column, default, named `CHECK`, `updated_at`), the `en`/`id` validator and read coercion, `preferred_language` in the register request and in the user object of register/login/`GET /auth/me`, `PUT /api/v1/auth/me/language`, `PUT` in the preflight's allowed methods, the two `field.preferred_language.*` dictionary keys, the OpenAPI/Postman updates, and tests for the API side of TC-081 and TC-084 to TC-090. |
| PART-10 **(v2)** | Frontend language | `LanguageContext` with the account → `localStorage["compzy.lang.v1"]` → `id` order, `src/locales/id.json` plus the two-locale `src/locales/index.js` with its key-parity test, `LanguageSwitcher` in the shared header, the register body's `preferred_language`, sign-in adoption, the signed-in `PUT` with its failure handling, and Playwright coverage of TC-069 to TC-099 on desktop and mobile. |

PART-2 depends on PART-1. PART-3 and PART-4 depend on PART-1; PART-4 depends on
PART-3's session check. PART-5 depends on PART-2 to PART-4. PART-6 depends on
PART-2; PART-7 on PART-3; PART-8 on PART-4 and PART-6. PART-6 to PART-8 run in a
separate repository and a separate `/fe-dev` run. In v2, PART-9 depends on
PART-1 (migration runner) and PART-3 (sessions); PART-10 depends on PART-6
(the app shell) and on PART-9 for the two endpoints it calls, and it ships after
PART-9 because it is the only side that needs the new route to exist.

Both repositories now hold the merged v1 implementation on their
`feat/pc-builder` branch, and migrations `0001` to `0004` are applied there, so
`/go-dev` and `/fe-dev` start from existing code — they add to it and do not
re-scaffold. `0005` is the only schema change this revision makes.

## Handoff values

Literal values for the build steps. Nothing below is inferred, defaulted or
re-derived at run time; the frontmatter of `architecture.md` carries the same
four repository values.

| Item | Value |
|---|---|
| Service | `compzy` |
| Feature code | `pc-builder` |
| Backend clone URL | `https://github.com/william22913/compzy-be` |
| Backend base branch | `main` — the repository's default branch, holding the merged v1 implementation |
| Backend feature branch | `feat/pc-builder` |
| Frontend clone URL | `https://github.com/william22913/compzy-fe` |
| Frontend base branch | `main` — the repository's default branch, holding the merged v1 implementation |
| Frontend feature branch | `feat/pc-builder` |
| New migration batch (v2) | `0005_customers_preferred_language.sql` — appended after `0001`–`0004`, applied by the existing advisory-locked runner |
| Language endpoint (v2) | `PUT /api/v1/auth/me/language`, body `{"preferred_language": "en"}`, returns `{data:{user}}` |
| Language value (v2) | JSON field `preferred_language`, exactly `"en"` or `"id"`, case-sensitive; column `customers.preferred_language`, `NOT NULL DEFAULT 'id'` |
| Language field codes (v2) | `field.preferred_language.required`, `field.preferred_language.invalid`, carried in `fields[].code` |
| API base path | `/api/v1`; `/healthz` and `/metrics` are operational only |
| Ports | API `8080` and metrics `9090` are internal to the compose network; the frontend publishes the only host port, `8081` → nginx `80`, and `APP_ORIGIN` in compose is `http://localhost:8081` |
| Docs the build reads | `compzy/feature/pc-builder/`: `spec.md`, `testcase.md`, `architecture.md`, `database.md`, `TRD.md`, `BackendSchema.md`, `ImplementationPlan.md`, `AppFlow.md`, `knowledge/` |

Compose files, by repository:

| Repository | File | What runs in it |
|---|---|---|
| `compzy-be` | `docker-compose.yml` | `db`, `api`, `fe`; the frontend service's build context is `../compzy-fe`, so both repositories are cloned side by side under the same parent directory |
| `compzy-be` | `docker-compose.verify.yml` | Override for the stack verifier: `db` + `api` only, one replica, explicit small memory limits and a tiny seed, so the backend can be verified when the sibling `compzy-fe` checkout is not available to the runner |
| `compzy-fe` | `docker-compose.yml` | The frontend alone, against `API_UPSTREAM=http://localhost:8080`, for frontend-only work |
