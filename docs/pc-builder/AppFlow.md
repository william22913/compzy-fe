---
feature_code: pc-builder
service: compzy
spec_version: 1
last_updated: 2026-11-16
---

# PC Builder — App Flow (compzy)

A short outline of what a customer does, in order. The full requirement detail
lives in [`spec.md`](spec.md); routes and components are added below by the
build step, never here.

<!-- BEGIN:DOCPREP -->

## Overview

Three things happen in this app: build a PC, sign in, order it. A visitor can
do the first without an account; the last two need one.

## Key User Journeys

### Journey 1 — Build a PC without an account

1. The customer opens the app and is looking at the parts, not at a sign-in
   form: seven categories, each part with its name and price, total Rp 0
   (REQ-001, REQ-002).
2. They choose a part in a category; the total goes up by that price straight
   away. Choosing another part in the same category swaps it and moves the
   total by the difference (REQ-003, REQ-005).
3. They skip the graphics card, because it is optional (REQ-008, REQ-038).
4. They remove a part they changed their mind about; the total drops again
   (REQ-004, REQ-020).
5. Every price and the total read in rupiah, like "Rp 12.500.000", with nothing
   added for tax or shipping (REQ-006, REQ-007).

### Journey 2 — Sign in mid-build and keep the build

1. With parts already chosen, the customer presses Checkout while not signed in
   (REQ-015).
2. They are asked to sign in or create an account (REQ-010, REQ-009).
3. After signing in they are back on the order review with the same parts and
   the same total — nothing they chose is lost (REQ-012, REQ-015).

### Journey 3 — Create an account and place the order

1. The customer creates an account with their full name, email address and a
   password of at least 8 characters containing a letter and a number
   (REQ-009, REQ-034, REQ-035).
2. They land on the order review: every chosen part grouped by category, each
   with its price, and the final total (REQ-013).
3. They confirm, and the order is submitted at exactly the total they were
   shown (REQ-014, REQ-029, REQ-040).
4. They see a confirmation listing what they ordered and the final total. The
   flow ends there — there is no order history and nothing else to do
   (REQ-014).

### Journey 4 — A returning customer orders again

1. The customer signs in with their email address and password (REQ-010).
2. They stay signed in on that device across reloads and browser restarts until
   they sign out (REQ-011).
3. They build and check out as in Journeys 1 and 3. Signing out leaves the app
   browsable but requires signing in again before checkout (REQ-028).

### Journey 5 — Checkout is refused because something is missing

1. The customer has left one or more required categories empty — for example no
   power supply — and checkout stays unavailable (REQ-008, REQ-019).
2. The message names the categories still empty, so they know what to do
   (REQ-018, REQ-019).
3. They choose the missing parts and checkout becomes available (REQ-008).

### Journey 6 — Something goes wrong

1. The part list cannot be loaded: a clear message and a way to try again, never
   a blank page or a spinner that never ends (REQ-025).
2. A wrong email or password: one generic message that does not reveal which
   was wrong, and the form stays usable (REQ-022).
3. Signing up with an email that already has an account: told plainly, with the
   offer to sign in instead (REQ-023).
4. A chosen part is gone when the order is submitted: the order is not placed,
   the customer is told, and the build comes back for review — the total is
   never changed behind their back (REQ-026).
5. The session expired at the moment of confirming: sign in again and return to
   the same review, with no double order (REQ-027).

## Main pages and actions

Named here only as the steps a customer goes through; their layout and look
belong to `/ui-preparation`.

- **The builder** — the seven categories, the choices in each, the running
  total, and the Checkout action (REQ-001 to REQ-008).
- **Sign in / create account** — the entry forms, reachable at any time and
  required only for checkout (REQ-009 to REQ-012, REQ-015).
- **Order review** — the chosen parts, the final total, and confirmation
  (REQ-013, REQ-014).
- **Confirmation** — what was ordered and the final total; the end of the flow
  (REQ-014, REQ-029).

<!-- END:DOCPREP -->

<!-- BEGIN:CODEPREP -->

## Routes and components (technical)

PC Builder v1 is two applications: a Go API (`compzy-be`) that serves JSON
only, and a React + Vite app (`compzy-fe`) that renders every screen and is
reverse-proxied to the API on the same origin by nginx. Routes, components and
the API calls each screen makes are recorded below; layout, colour and
typography belong to `/ui-preparation`'s `UIMap.md` and `DesignBrief.md`.

### Frontend routes

| Route | Screen | Purpose | Auth |
|---|---|---|---|
| `/` | Builder | Seven categories with their parts, choose/replace/remove, running rupiah total, completeness message, Checkout action, header state | public |
| `/sign-in?return=/checkout` | Sign in | Authenticate an existing account and carry the build to the review | public (visitor) |
| `/create-account` | Create account | Register with full name, email and password | public (visitor) |
| `/checkout` | Order review | Chosen parts grouped by category with prices, final total, confirm action | member |
| `/orders/:orderId` | Confirmation | What was ordered and its total, read back from the API | member (own order) |
| `*` | Not found | A way back to the builder | any |

`return` is accepted only when it equals `/checkout`; any other value falls
back to `/` (no open redirect). After a successful sign-in the app goes to the
return value when present, otherwise to `/`.

### Frontend components

| Component | Built from | Used on |
|---|---|---|
| `AppShell` (header, brand, signed-in state, sign-out, main region) | `UIMap.md` + `DesignBrief.md` | all screens |
| `CategorySection` (category heading, required marker, parts list) | UIMap | Builder |
| `PartRow` (name, price, chosen state, choose/replace/remove action) | UIMap | Builder |
| `BuildSummary` (running total, empty-category message, Checkout action) | UIMap | Builder, Order review |
| `RupiahAmount` (one formatter, `Intl.NumberFormat('id-ID')`) | this design | every screen showing money |
| `AuthForm`, `FieldError`, `FormAlert` | UIMap | Sign in, Create account |
| `ReviewList`, `ConfirmAction` | UIMap | Order review |
| `OrderReceipt` | UIMap | Confirmation |
| `LoadingState`, `ErrorState` (message + retry), `NotFoundState` | UIMap | Builder, Order review, Confirmation |
| `AuthContext` (reads `/auth/me` once, then after sign-in/out) | this design | all screens |
| `BuildContext` (category → part id map, persisted to `localStorage` under `compzy.build.v1`) | this design | Builder, Order review |
| `apiClient` (fetch, `credentials: 'same-origin'`, envelope and error mapping) | this design | all screens |

`nexcomponent` is not used anywhere; the component layer is Ant Design plus the
screens' own components.

### Backend API consumed by the screens

| Screen | Call | When |
|---|---|---|
| Builder | `GET /api/v1/catalogue` | page load; restores the browser's build only after it succeeds |
| Builder, all screens | `GET /api/v1/auth/me` | app boot and after sign-in/out; a `401` means "visitor", never an error |
| Sign in | `POST /api/v1/auth/login` | submit; sets the session cookie, then returns to `/checkout` |
| Create account | `POST /api/v1/auth/register` | submit; sets the session cookie, then goes to `/checkout` |
| Header (signed in) | `POST /api/v1/auth/logout` | "Sign out"; the build stays in the browser |
| Order review | `POST /api/v1/orders` | Confirm; sends the chosen part ids and the reviewed total |
| Confirmation | `GET /api/v1/orders/{order_id}` | page load and reload; a `404` renders the not-found state |

Every screen has the loading, error and ready states; the Builder also has the
empty-category message and the Order review the `PART_UNAVAILABLE`,
`TOTAL_CHANGED`, `BUILD_INCOMPLETE` and `UNAUTHENTICATED` refusals, each of
which returns the customer to the same review with the build intact.

<!-- END:CODEPREP -->
