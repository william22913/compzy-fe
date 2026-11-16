---
feature_code: pc-builder
service: compzy
spec_version: 2
last_updated: 2026-11-16
---

# PC Builder — App Flow (compzy)

A short outline of what a customer does, in order. The full requirement detail
lives in [`spec.md`](spec.md); routes and components are added below by the
build step, never here.

<!-- BEGIN:DOCPREP -->

## Overview

Three things happen in this app: build a PC, sign in, order it. A visitor can
do the first without an account; the last two need one. On every page, in every
state, the customer can also switch the interface between Indonesian and
English, and the app remembers which one they chose.

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
3. The app is already in the language stored with their account, so nothing is
   asked about language (REQ-047, REQ-059).
4. They build and check out as in Journeys 1 and 3. Signing out leaves the app
   browsable but requires signing in again before checkout (REQ-028).

### Journey 5 — Checkout is refused because something is missing

1. The customer has left one or more required categories empty — for example no
   power supply — and checkout stays unavailable (REQ-008, REQ-019).
2. The message names the categories still empty, so they know what to do — and
   names them in the language they are using (REQ-018, REQ-019, REQ-049).
3. They choose the missing parts and checkout becomes available (REQ-008).

### Journey 6 — Switch the language on the page you are on

1. Wherever the customer is — builder, sign in, create account, order review,
   confirmation, not-found, or an error or empty state — the switcher sits on
   the page with "English" and "Bahasa Indonesia" (REQ-042).
2. They pick the other one and the whole page changes at once. The chosen
   parts, the total and anything typed into a form are untouched (REQ-043,
   REQ-056).
3. If they are signed out, the app remembers the choice on this device and
   opens in it next time (REQ-045).
4. If they are signed in, the choice is saved to their account there and then,
   so the same language comes back on any device (REQ-048, REQ-060).
5. Product and model names and the rupiah amounts read exactly the same in both
   languages; the words around them do not (REQ-049, REQ-050).

### Journey 7 — A first-time visitor, and a returning one whose saved language applies

1. A first-time visitor arrives with no language chosen and not signed in: the
   app is in Indonesian (REQ-044).
2. They switch to English, browse, build, and may create an account — the
   account is stored in English, the language the switcher was on at sign-up
   (REQ-046, REQ-059).
3. Later they sign in on another browser: the app opens in the account's
   language straight away (REQ-047).
4. If they sign out there, the language last used on that device stays
   (REQ-053); if a stored language is ever missing or invalid, Indonesian is
   shown and signing in still works (REQ-054).

### Journey 8 — Something goes wrong

1. The part list cannot be loaded: a clear message and a way to try again, never
   a blank page or a spinner that never ends — in the customer's language
   (REQ-025, REQ-049).
2. A language's copy cannot be loaded: the page shows Indonesian rather than a
   blank page or raw keys (REQ-055).
3. A wrong email or password: one generic message that does not reveal which
   was wrong, and the form stays usable (REQ-022).
4. Signing up with an email that already has an account: told plainly, with the
   offer to sign in instead (REQ-023).
5. A chosen part is gone when the order is submitted: the order is not placed,
   the customer is told, and the build comes back for review — the total is
   never changed behind their back (REQ-026).
6. The session expired at the moment of confirming: sign in again and return to
   the same review, with no double order (REQ-027).

## Main pages and actions

Named here only as the steps a customer goes through; their layout and look
belong to `/ui-preparation`.

- **The builder** — the seven categories, the choices in each, the running
  total, the Checkout action, and the language switcher (REQ-001 to REQ-008,
  REQ-042).
- **Sign in / create account** — the entry forms, reachable at any time and
  required only for checkout, each with the switcher (REQ-009 to REQ-012,
  REQ-015, REQ-042).
- **Order review** — the chosen parts, the final total, and confirmation
  (REQ-013, REQ-014).
- **Confirmation** — what was ordered and the final total; the end of the flow,
  shown in the language in use when it is opened (REQ-014, REQ-029, REQ-057).
- **Not found and every error, empty and loading state** — each carries the same
  switcher and the same two languages (REQ-042, REQ-049, REQ-055).

<!-- END:DOCPREP -->

<!-- BEGIN:CODEPREP -->

## Routes and components (technical)

PC Builder is two applications: a Go API (`compzy-be`) that serves JSON
only, and a React + Vite app (`compzy-fe`) that renders every screen and is
reverse-proxied to the API on the same origin by nginx. Both are live on their
`feat/pc-builder` branch; this revision adds the language surface marked
**(v2)** below and changes nothing else. Routes, components and the API calls
each screen makes are recorded here; layout, colour and typography belong to
`/ui-preparation`'s `UIMap.md` and `DesignBrief.md`.

### Frontend routes

| Route | Screen | Purpose | Auth |
|---|---|---|---|
| `/` | Builder (`BuilderPage`) | Seven categories with their parts, choose/replace/remove, running rupiah total, completeness message, Checkout action, header state | public |
| `/sign-in` | Sign in (`SignInPage`) | Authenticate an existing account and carry the build to the review | public (visitor) |
| `/sign-up` | Create account (`SignUpPage`) | Register with full name, email and password; **(v2)** sends the active language | public (visitor) |
| `/order-review` | Order review (`ReviewPage`) | Chosen parts grouped by category with prices, final total, confirm action | member |
| `/order-confirmation/:orderId` | Confirmation (`ConfirmationPage`) | What was ordered and its total, read back from the API | member (own order) |
| `*` | Not found (`NotFoundPage`) | A way back to the builder | any |

The only accepted return target is the order review; any other value falls
back to `/` (no open redirect). After a successful sign-in the app goes to the
return target when present, otherwise to `/`. **(v2)** The language switcher
is rendered by the shared header, so it is present on every one of these
routes and in their loading, empty and error states without any page
importing it.

### Frontend components

| Component | Built from | Used on |
|---|---|---|
| `Header`, `Footer` (`src/components/Chrome.jsx`) | `UIMap.md` + `DesignBrief.md` | all screens |
| **(v2)** `LanguageSwitcher` — two choices, "English" / "Bahasa Indonesia" | `UIMap.md` | rendered inside `Header`, therefore all screens |
| **(v2)** `LanguageContext` (`src/store/LanguageContext.jsx`) — active locale, `localStorage["compzy.lang.v1"]`, account sync | this design | all screens |
| **(v2)** `src/locales/en.json`, `src/locales/id.json`, `src/locales/index.js` — the two dictionaries and the lookup | this design | every visible string |
| `CategorySection` (category heading, required marker, parts list) | UIMap | Builder |
| `PartCard` (name, price, chosen state, choose/replace/remove action) | UIMap | Builder |
| `BuildBar`, `BuildPanel` (running total, empty-category message, Checkout action) | UIMap | Builder, Order review |
| `Notice` (inline message and alert) | UIMap | Sign in, Create account, Order review |
| `money.js` (one rupiah formatter, `Intl.NumberFormat('id-ID')`) | this design | every screen showing money |
| `SignInPage`, `SignUpPage`, `AuthLayout` | UIMap | Sign in, Create account |
| `ReviewPage`, `ConfirmationPage`, `OrderRows` | UIMap | Order review, Confirmation |
| `BuilderSkeleton`, `NotFoundPage` | UIMap | Builder, all screens |
| `AuthContext` (reads `/auth/me` once, then after sign-in/out) | this design | all screens |
| `BuildContext` (category → part id map, persisted to `localStorage` under `compzy.build.v1`) | this design | Builder, Order review |
| `CatalogueContext` (one catalogue fetch shared by the builder and the review) | this design | Builder, Order review |
| `apiClient` (fetch, `credentials: 'same-origin'`, envelope and error mapping) | this design | all screens |

`nexcomponent` is not used anywhere; the component layer is Ant Design plus the
screens' own components. **(v2)** No i18n library is added: the two
dictionaries are static imports and `LanguageSwitcher` reads and writes the
existing `LanguageContext`.

### Backend API consumed by the screens

| Screen | Call | When |
|---|---|---|
| Builder | `GET /api/v1/catalogue` | page load; restores the browser's build only after it succeeds |
| Builder, all screens | `GET /api/v1/auth/me` | app boot and after sign-in/out; a `401` means "visitor", never an error; **(v2)** its `preferred_language` seeds `LanguageContext` |
| Sign in | `POST /api/v1/auth/login` | submit; sets the session cookie, returns the account's `preferred_language` **(v2)**, then returns to the review |
| Create account | `POST /api/v1/auth/register` | submit; sends `preferred_language` **(v2)**, sets the session cookie, then goes to the review |
| Header (signed in) | `POST /api/v1/auth/logout` | "Sign out"; the build and the device's language stay in the browser |
| **(v2)** Header, all screens (signed in) | `PUT /api/v1/auth/me/language` | a language switch made while signed in; body `{"preferred_language": "en"}` or `"id"`, no customer id |
| **(v2)** Header, all screens (signed out) | *no call* | a language switch writes `localStorage["compzy.lang.v1"]` only |
| Order review | `POST /api/v1/orders` | Confirm; sends the chosen part ids and the reviewed total |
| Confirmation | `GET /api/v1/orders/{order_id}` | page load and reload; a `404` renders the not-found state |

Every screen has the loading, error and ready states; the Builder also has the
empty-category message and the Order review the `PART_UNAVAILABLE`,
`TOTAL_CHANGED`, `BUILD_INCOMPLETE` and `UNAUTHENTICATED` refusals, each of
which returns the customer to the same review with the build intact.
**(v2)** Every message shown from those refusals is rendered from the active
dictionary by its `code`, not from the API's English `message`.

<!-- END:CODEPREP -->
