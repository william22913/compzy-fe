---
feature_code: pc-builder
service: compzy
locked_version: 1
last_updated: 2026-11-16
---

# pc-builder — Backend Schema Overview

> Summary only — see `database.md` for the full schema-designer record
> and `architecture.md`'s `## Data design` for the query rationale.

## Overview

Six domain tables and one infrastructure table, all created by this feature
because both repositories are greenfield: `categories`, `parts`, `customers`,
`sessions`, `orders`, `order_items` and the migration runner's
`schema_migrations`. `compzy/ERD.md` shows the combined picture.

The model is deliberately small. There is no `builds` table, no order-history
join table, no role or permission table and no third-party identity: a build
belongs to a browser, an order belongs to a customer, and there are only two
roles.

## Data Model

- `categories` — the seven fixed categories, keyed by its natural business key
  `code` (`cpu`, `motherboard`, `ram`, `storage`, `gpu`, `psu`, `case`).
  `position` is unique and fixes display order; `is_required` is `false` only
  for `gpu`, which is what the completeness rule reads.
- `parts` — the 21 seeded parts, read-only to the application. Public
  identifier is the row's `id` UUID; `category_code` is a real foreign key with
  `RESTRICT`; `price_rupiah` is `BIGINT` and CHECK-positive; a part name is
  unique within its category.
- `customers` — self-service accounts, one per email address. `email` is stored
  lowercase with a plain `UNIQUE` constraint plus `CHECK (email = lower(email))`,
  so case-insensitive uniqueness holds by construction rather than by a `citext`
  extension or a functional index. `password_hash` carries a `CHECK (length >
  0)`; the value is bcrypt (cost 12) over a SHA-256 of the password.
- `sessions` — one row per sign-in, keyed by the natural key `token_hash`
  (`bytea`, SHA-256 of the raw cookie token, CHECK `octet_length = 32`).
  `customer_id` is a real foreign key with `CASCADE`: deleting an account takes
  its sessions with it. `expires_at` starts at `created_at + SESSION_TTL_HOURS`
  and slides on use via `last_used_at`.
- `orders` — one submitted order, public UUID key, `customer_id` foreign key
  with `RESTRICT` (an account with orders is never deleted by accident),
  `total_rupiah` as a stored snapshot of what the customer confirmed.
- `order_items` — an immutable snapshot of what each order contained: the part
  name, the category code and name, and the unit price at confirmation, plus a
  `position` for display order. `order_id` is `CASCADE`; `part_id` is nullable
  with `SET NULL`, so a part deleted later never breaks an old order.
  Primary key is an internal-only identity column that never reaches a response.
- **Public UUID primary keys where the API exposes a row** (`parts`,
  `customers`, `orders`), so no row number ever leaves the service; natural-key
  primary keys where the natural key *is* the identity (`categories.code`,
  `sessions.token_hash`). `order_items` is internal-only and uses an identity
  key. These are the deliberate, stated deviations from the house
  surrogate-plus-`uuid_key` rule, recorded in `database.md`.
- **No soft delete and no status-as-deletion.** v1 deletes no customer and no
  order; a part is hard-deleted and the order snapshot preserves history; a
  session is removed for real on sign-out. There is no `is_deleted`/`status`
  column and no business status column, because v1 has no workflow beyond
  "submitted".
- Every foreign key and every filtered column is indexed, with explicit names:
  `parts_category_code_idx`, `parts_category_name_key`, `customers_email_key`,
  `sessions_customer_id_idx`, `sessions_expires_at_idx`, `orders_customer_id_idx`,
  `orders_created_at_idx`, `order_items_order_id_idx`, plus the primary keys.
  There is no search, filter or sort in v1, so nothing else is indexed.

## Access Control

Two roles, no admin: **visitor** (public) and **member** (a valid session). The
API enforces every rule itself; the frontend's hiding of controls is
convenience only.

| Table | Read | Write |
|---|---|---|
| `categories`, `parts` | public read through `GET /api/v1/catalogue` only | seed and migrations only; no runtime write route exists |
| `customers` | the caller's own row only (`GET /api/v1/auth/me`) | self-registration only |
| `sessions` | the caller's own session by `token_hash` | created at register/sign-in, deleted at sign-out |
| `orders`, `order_items` | the caller's own orders only — `WHERE id = $1 AND customer_id = $2` in the SQL, `404` otherwise, never `403` | insert only, from one validated submission transaction |
| `schema_migrations` | the runner | the runner |

No endpoint accepts a customer id from the client, no role or permission table
exists, and every denial returns the same `404`/`401` shape as a genuine miss,
so one customer cannot learn whether another's data exists.
