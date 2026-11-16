---
feature_code: pc-builder
service: compzy
version: 2
status: complete
spec_version: 2
open_questions: []
pr_history:
  - number: 75
    url: https://github.com/william22913/sandbox-docs/pull/75
    title: "[TESTCASE] compzy/pc-builder: test design for the PC builder and checkout flow"
    state: merged
    version: 1
pr_url: https://github.com/william22913/sandbox-docs/pull/79
last_updated: 2026-11-16
---

# pc-builder — PC Builder (compzy) — test design

Black-box test design derived from the merged `spec.md` **v2** (PR #78, merged
into `sandbox-docs` `main` on 2026-11-16) together with the merged `PRD.md`
and `AppFlow.md` (both `spec_version: 2`). v1 was derived from spec v1
(PR #74); every v1 case (TC-001 to TC-068) is kept. This revision adds the
English/Indonesian language rules (REQ-042 to REQ-060) as TC-069 to TC-099 and
amends the two cases whose English-only expectation spec v2 replaced (TC-067,
TC-068). `knowledge/design-reference.md` is the manager's visual reference and
is owned by `/ui-preparation`; it is not used here for behaviour.

Every case below states observable behaviour and an expected result that
follows from the approved documents. No case has been executed by this
document; it defines the cases that `/go-dev` and `/fe-dev` write as automated
tests and that the reviewer executes by hand.

## Refresh log

Derived from `git diff` of spec.md between its v1 merge (`517f94c`, PR #74) and
its v2 merge (`517ea54`, PR #78), not from memory. REQ-001 to REQ-016 and
REQ-018 to REQ-041 are textually unchanged; REQ-017 was rewritten and
REQ-042 to REQ-060 are new.

- v1→v2: **REQ-017** rewritten — "the entire interface is in English" became
  "one of the two offered languages, following REQ-042 to REQ-060, no page
  mixing the two" (SC-014 reworded the same way). TC-067 and TC-068 amended:
  their English-only expectation and TC-067's "no language switch" clause are
  superseded; TC-092 added as the cross-page, two-language check.
- v1→v2: **REQ-042** added (switcher on every page and state) → TC-070, TC-071, TC-072, TC-073.
- v1→v2: **REQ-043** added (whole-page switch, nothing lost) → TC-074, TC-075, TC-076, TC-078.
- v1→v2: **REQ-044** added (first-time visitor sees Indonesian, no detection) → TC-069.
- v1→v2: **REQ-045** added (choice remembered on the device) → TC-079, TC-085.
- v1→v2: **REQ-046** added (new account takes switcher language at sign-up) → TC-081.
- v1→v2: **REQ-047** added (account language returned at sign-in, any device) → TC-082, TC-083, TC-085.
- v1→v2: **REQ-048** added (signed-in change saved at once, follows the account) → TC-084.
- v1→v2: **REQ-049** added (every string in both languages, one at a time, no raw key) → TC-091, TC-092, TC-096, TC-099.
- v1→v2: **REQ-050** added (names and rupiah amounts identical in both languages) → TC-094, TC-095, TC-098.
- v1→v2: **REQ-051** added (formal "Anda" register) → TC-093.
- v1→v2: **REQ-052** added (sign-in adopts the account language) → TC-082.
- v1→v2: **REQ-053** added (sign-out keeps the device's last language) → TC-080.
- v1→v2: **REQ-054** added (pre-revision accounts get Indonesian; bad stored value shows Indonesian, never blocks sign-in) → TC-086, TC-087.
- v1→v2: **REQ-055** added (unloadable copy falls back to Indonesian) → TC-097.
- v1→v2: **REQ-056** added (switching changes no build, total, session or form input; submits nothing) → TC-074, TC-075, TC-077, TC-078.
- v1→v2: **REQ-057** added (confirmation renders and re-renders in the current language; recorded data never re-translated) → TC-076, TC-098.
- v1→v2: **REQ-058** added (language is exactly `en` or `id`, never empty) → TC-086, TC-088.
- v1→v2: **REQ-059** added (every account carries a language from creation, returned at sign-in) → TC-081, TC-084, TC-087, TC-088.
- v1→v2: **REQ-060** added (only the owner can change an account's language) → TC-089, TC-090.

No case is retired: every v1 case still tests behaviour spec v2 keeps ("What
this revision does not change" in spec.md), so TC-001 to TC-068 keep their IDs
and wording except the two amendments noted above.

## Scope and test data

One store, one environment, the fixed sample catalogue from `spec.md` and
accounts created on the site through its own sign-up form (the spec requires
no pre-seeded accounts).

**Part shorthand.** The spec's 21 seeded parts are referred to by these short
labels; the full names and prices are exactly as in `spec.md`'s *Sample Parts
Catalogue*.

| Label | Part | Price |
|---|---|---|
| CPU-i3 | Intel Core i3-12100F | Rp 1.350.000 |
| CPU-i5 | Intel Core i5-12400F | Rp 2.150.000 |
| CPU-R5 | AMD Ryzen 5 5600 | Rp 1.850.000 |
| MB-H610 | ASRock H610M-HDV | Rp 1.050.000 |
| MB-B660 | MSI B660M-A PRO | Rp 1.750.000 |
| MB-B550 | ASUS TUF B550M-PLUS | Rp 2.100.000 |
| RAM-8 | Kingston Fury 8GB DDR4-3200 | Rp 350.000 |
| RAM-16 | Kingston Fury 16GB DDR4-3200 | Rp 620.000 |
| RAM-32 | Corsair Vengeance 32GB DDR4-3600 | Rp 1.250.000 |
| SSD-500 | Kingston NV2 500GB NVMe | Rp 480.000 |
| SSD-1TB | Samsung 980 1TB NVMe | Rp 950.000 |
| SSD-2TB | WD Black SN770 2TB NVMe | Rp 1.850.000 |
| GPU-3050 | ASUS Dual RTX 3050 8GB | Rp 3.100.000 |
| GPU-6600 | Sapphire Pulse RX 6600 8GB | Rp 3.450.000 |
| GPU-4060 | Gigabyte RTX 4060 8GB | Rp 4.250.000 |
| PSU-550 | Corsair CV550 550W | Rp 650.000 |
| PSU-650 | Cooler Master MWE 650 Bronze | Rp 850.000 |
| PSU-750 | Seasonic Focus GX-750 750W | Rp 1.450.000 |
| CASE-Nerva | Cube Gaming Nerva M-ATX | Rp 350.000 |
| CASE-Hive | Aerocool Hive-G | Rp 550.000 |
| CASE-H5 | NZXT H5 Flow | Rp 1.450.000 |

**Named builds used by the cases.**

| Build | Contents | Total |
|---|---|---|
| BUILD-SIX | CPU-i3, MB-H610, RAM-8, SSD-500, PSU-550, CASE-Nerva (all six required, no graphics card) | Rp 4.230.000 |
| BUILD-SEVEN | BUILD-SIX + GPU-3050 | Rp 7.330.000 |
| BUILD-MID | CPU-i5, MB-B660, RAM-16, SSD-1TB, GPU-4060, PSU-650, CASE-H5 (the spec's own mid-range example) | Rp 12.020.000 |
| BUILD-12500 | CPU-i5, MB-B550, RAM-8, SSD-2TB, PSU-750, CASE-Nerva, GPU-4060 | Rp 12.500.000 |
| BUILD-MAX | CPU-i5, MB-B550, RAM-32, SSD-2TB, GPU-4060, PSU-750, CASE-H5 | Rp 14.500.000 |

**Accounts** (created once through the app's sign-up form before the cases
that need them; names are fixture labels).

| Fixture | Full name | Email | Password | Purpose |
|---|---|---|---|---|
| `buyer1` | Budi Santoso | buyer1@example.com | Build1234 | Baseline signed-in customer |
| `buyer2` | Siti Rahma | buyer2@example.com | Shop5678x | Second account (adds `x` to keep letter+digit rule) |
| `minname` | Al | minname@example.com | Build1234 | Name minimum (2 characters) |
| `maxname` | 100 characters of `A` | maxname@example.com | Build1234 | Name maximum |
| `minpw` | Pat Tester | minpw@example.com | Abcdefg1 | Password minimum (8 characters, letter + digit) |
| `maxpw` | Pat Tester | maxpw@example.com | `A1` + `x` × 126 | Password maximum (128 characters) |
| `spacey` | Sam Tester | spacey@example.com | `Build1234 ` (trailing space) | Password taken exactly as typed |
| `longmail` | Long Mail | 254-character valid address (64-character local part + `@` + a 189-character domain of valid labels) | Build1234 | Email maximum |

**Language fixtures.** The language cases need accounts and devices whose
language state is known.

| Fixture | Purpose |
|---|---|
| `buyer1`, `buyer2` | Accounts created before this revision; per REQ-054 each is stored as Indonesian (`id`) when the revision is deployed |
| `lang-en` | Account created through the sign-up form while the switcher was on English; stored as `en` (REQ-046) |
| `lang-id` | Account created through the sign-up form while the switcher was on Indonesian; stored as `id` |
| device-A | Fresh browser profile: no stored language, no session — a first-time device |
| device-B | A second browser profile or a second browser with no shared storage — "another device" |
| device-EN | A profile on which English was chosen and then signed out; no session |

**Environment controls.** Block or restore the request the builder makes to
load the part list; stop and restart reading the catalogue; withdraw one part
from the seeded catalogue between review and confirmation; expire a signed-in
session server-side; keep a persistent browser profile between runs for the
browser-restart cases. For the language cases: set the browser's own preferred
language (`Accept-Language`) before a first visit (TC-069); read and, where a
case says so, change an account's stored preferred language in the test
store (TC-086, TC-087, TC-088); block the browser's request for the English
copy while the chosen language is English (TC-097).

**App defaults.** The only roles are *visitor* (signed out) and
*signed-in customer*; there is no admin, staff or back-office role and no
permission hierarchy, so there is no `<parent>:all` grant to test. The one
protected action is checkout: a visitor is sent to sign in instead of being
refused with an error message, exactly as REQ-015 states (TC-050, TC-053,
TC-062 cover the server-side side of that boundary). No owner-scoped record is
exposed by this feature — a customer sees only their own confirmation and
account, and there is no order list (TC-063). The interface offers **two
languages, English and Indonesian**, with a switcher on every page (TC-067,
TC-068, TC-070 to TC-073); the language rules are REQ-042 to REQ-060 and their
cases are TC-069 to TC-099. The one own-scoped value this revision adds is the
account's preferred language: only its signed-in owner can change it (TC-089),
and a language-change request without a valid session is refused and changes no
account (TC-090). `app_scale` is `small`, so the suite adds no pagination,
rate-limit or replica-failover cases; the 21-part catalogue is expected to fit
on one page (TC-003).

## Requirement coverage

| REQ | Requirement (short) | Cases | Notes |
|---|---|---|---|
| REQ-001 | Visitor sees the builder immediately, no sign-in prompt | TC-001, TC-005 | — |
| REQ-002 | Exactly seven fixed categories | TC-001, TC-002 | — |
| REQ-003 | At most one part per category; a second choice replaces the first | TC-006, TC-007 | — |
| REQ-004 | A chosen part can be removed and the total adjusts | TC-008 | — |
| REQ-005 | Running total from Rp 0, updates with no recalculate action | TC-001, TC-006, TC-007, TC-009 | — |
| REQ-006 | Total is the plain sum; no tax, no shipping | TC-009, TC-013, TC-015 | — |
| REQ-007 | Rupiah formatting: "Rp " prefix, dot thousands, no decimals | TC-010, TC-011, TC-012 | — |
| REQ-008 | Six required categories; Graphics Card optional | TC-015, TC-018, TC-020 | — |
| REQ-009 | Create account with name, email, password; signed in at once; one account per email | TC-024, TC-028, TC-054 | — |
| REQ-010 | Sign in with email and password; sign out ends the session | TC-042, TC-047, TC-050, TC-062 | — |
| REQ-011 | Stays signed in across reloads and browser restarts | TC-049 | — |
| REQ-012 | The build survives signing in or creating an account | TC-051, TC-052, TC-054 | — |
| REQ-013 | Checkout opens a review: parts by category with prices, final total | TC-055 | — |
| REQ-014 | Confirming submits the order; confirmation ends the flow; no order history | TC-056, TC-063 | — |
| REQ-015 | Signed-out checkout sends the visitor to sign in, then back to the review with the same build | TC-053, TC-054, TC-062 | — |
| REQ-016 | Every part shows name and price; 21 pre-loaded sample parts | TC-001, TC-003, TC-012 | — |
| REQ-017 | Entire interface in one of the two offered languages; no page mixes them | TC-067, TC-068, TC-092 | Rewritten in spec v2 (was "English only") |
| REQ-018 | Empty build: total Rp 0, not complete, checkout refused with the empty categories named | TC-016, TC-017 | — |
| REQ-019 | Incomplete build: checkout unavailable and the reason always visible | TC-017, TC-018, TC-019, TC-022 | — |
| REQ-020 | Removing the last part of a required category returns to the incomplete state | TC-016 | — |
| REQ-021 | Empty required field on sign-in/sign-up refused before sending, field named, typed data kept | TC-025, TC-026, TC-027, TC-045 | — |
| REQ-022 | Wrong email or password: one generic error, form usable, email kept | TC-043, TC-044, TC-068 | — |
| REQ-023 | Duplicate email refused plainly, offers sign-in, never creates a second account | TC-028, TC-029 | — |
| REQ-024 | Password that breaks the rule refused with the rule in plain words | TC-030, TC-034 | — |
| REQ-025 | Part list failure: clear message with retry; no blank page, endless spinner or stale total | TC-064, TC-065, TC-066 | — |
| REQ-026 | Part gone at submit: order not placed, customer told, build returned without it, total never quietly changed | TC-060 | — |
| REQ-027 | Expired session at confirm: sign in, return to the same review, no double order | TC-061 | — |
| REQ-028 | Signing out leaves the build visible; checkout requires signing in again | TC-047, TC-048, TC-050 | — |
| REQ-029 | Review total, recorded order total and confirmation total are identical | TC-057 | — |
| REQ-030 | Total stays correct for any combination, including the most expensive part everywhere | TC-014 | — |
| REQ-031 | Changing a part after opening the review is reflected before anything is ordered | TC-059 | — |
| REQ-032 | Email required, trimmed, syntactically valid, at most 254 characters | TC-039, TC-040, TC-041 | — |
| REQ-033 | Email identifies one account, compared case-insensitively | TC-028, TC-029 | — |
| REQ-034 | Full name required, 2–100 characters after trimming, displayed as typed | TC-037, TC-038 | The "displayed as typed" half has no display surface in v1 (there is no profile page and the confirmation lists parts, not the customer's name), so only the acceptance boundaries are asserted |
| REQ-035 | Password 8–128 characters, at least one letter and one digit, taken exactly as typed | TC-030, TC-031, TC-032, TC-033, TC-034, TC-035, TC-036 | — |
| REQ-036 | Sign-in takes email and password; no lockout in v1 | TC-046 | Sign-in email case-sensitivity beyond the uniqueness rule (REQ-033) is not specified, so no case asserts it |
| REQ-037 | At most one part per category; a part belongs only to its own category | TC-006, TC-007 | — |
| REQ-038 | Checkout requires exactly one part in each required category; graphics card optional | TC-015, TC-020, TC-021, TC-023 | — |
| REQ-039 | Seed part names 1–100 characters and unique per category; prices whole rupiah above zero | TC-004 | A seed-data rule, verified against the seeded catalogue because no person enters parts on the site in v1 |
| REQ-040 | Order total is the sum at confirmation, with no adjustments, equal to the reviewed total | TC-057 | — |
| REQ-041 | The recorded order keeps the part names and prices the customer was shown | TC-058 | — |
| REQ-042 | Switcher with exactly "English" and "Bahasa Indonesia" on every page and state | TC-070, TC-071, TC-072, TC-073 | — |
| REQ-043 | Choosing a language changes every visible string at once, losing nothing | TC-074, TC-075, TC-076, TC-078 | — |
| REQ-044 | First-time visitor sees Indonesian; no browser or country detection | TC-069 | — |
| REQ-045 | A visitor's choice is remembered on the device | TC-079, TC-085 | — |
| REQ-046 | A new account takes the switcher's language at sign-up | TC-081 | — |
| REQ-047 | A signed-in customer sees the account's language, on any device | TC-082, TC-083, TC-085 | — |
| REQ-048 | A signed-in customer can change the language; saved at once and follows them | TC-084 | — |
| REQ-049 | Every string in both languages, one shown at a time, never a raw key | TC-091, TC-092, TC-096, TC-099 | — |
| REQ-050 | Product, brand and model names and rupiah amounts identical in both languages | TC-094, TC-095, TC-098 | — |
| REQ-051 | Indonesian copy uses the formal register "Anda" throughout | TC-093 | — |
| REQ-052 | Signing in applies the account's language over the device's | TC-082 | — |
| REQ-053 | Signing out leaves the last language used on the device | TC-080 | — |
| REQ-054 | Pre-revision accounts get Indonesian; a missing/invalid stored value shows Indonesian without blocking sign-in | TC-086, TC-087 | — |
| REQ-055 | Unloadable copy falls back to Indonesian, never blank or raw keys | TC-097 | — |
| REQ-056 | Switching never changes the build, total, session or form input, and never submits an order | TC-074, TC-075, TC-077, TC-078 | — |
| REQ-057 | The confirmation shows and re-renders in the current language; recorded data never re-translated | TC-076, TC-098 | — |
| REQ-058 | Preferred language is exactly "en" or "id", never empty | TC-086, TC-088 | — |
| REQ-059 | Every account carries a language from creation, returned at sign-in | TC-081, TC-084, TC-087, TC-088 | — |
| REQ-060 | Only the account's owner can change its language | TC-089, TC-090 | — |

## Success criteria cross-check

Each success criterion in `spec.md` maps to at least one case. This table is a
reading aid, not a second coverage matrix.

| SC | Acceptance criterion (short) | Cases |
|---|---|---|
| SC-001 | First visit shows the seven categories with parts, prices and Rp 0 | TC-001, TC-002, TC-003 |
| SC-002 | One part per category makes the total their sum; swapping moves it by the difference | TC-006, TC-007, TC-009 |
| SC-003 | Removing a part clears the category, subtracts its price, leaves the rest | TC-008 |
| SC-004 | Prices read "Rp 12.500.000" style; a Rp 12.500.000 build reads exactly that | TC-010, TC-011, TC-012 |
| SC-005 | No tax or shipping line; total equals the sum | TC-013 |
| SC-006 | Incomplete build refused with the empty categories named; complete build can check out | TC-017, TC-018, TC-019, TC-020 |
| SC-007 | Create an account and be signed in; sign out and back in again | TC-024, TC-042, TC-047 |
| SC-008 | Signed in survives reload and browser restart; checkout without signing in again | TC-049 |
| SC-009 | Build and total survive signing in or creating an account | TC-051, TC-052 |
| SC-010 | Checkout opens the review with parts by category, prices and final total | TC-055 |
| SC-011 | Confirmation shows the ordered parts and total; nothing further required | TC-056 |
| SC-012 | Signed-out checkout leads to sign-in and back to the same review | TC-053, TC-054 |
| SC-013 | All 21 seeded parts appear; at least three choices per category | TC-003 |
| SC-014 | Every label, button, message and error is in the currently selected language | TC-067, TC-068, TC-092 |
| SC-015 | Empty fields, wrong password, duplicate email and too-short password each get a plain, distinct message and create no bad account | TC-025 to TC-029, TC-043 |
| SC-016 | Part-list failure shows a message with retry, not a blank page or spinner | TC-064, TC-065 |
| SC-017 | Review total, recorded total and confirmation total are identical | TC-057 |
| SC-018 | Switcher with exactly "English" and "Bahasa Indonesia" on the builder, sign in, create account, review, confirmation, not-found and their states | TC-070, TC-071, TC-072, TC-073 |
| SC-019 | First visit is Indonesian; choosing English changes the page at once, losing nothing | TC-069, TC-074 |
| SC-020 | A visitor's English choice survives reload and browser restart | TC-079 |
| SC-021 | Sign-up stores the switcher's language; another device shows it; a signed-in change sticks | TC-081, TC-082, TC-083, TC-084 |
| SC-022 | Both languages complete; part/brand names and prices identical; Indonesian uses "Anda" | TC-092, TC-093, TC-094, TC-095 |
| SC-023 | Sign-in applies the account language; sign-out keeps it; a missing/invalid stored value shows Indonesian and still signs in | TC-080, TC-082, TC-086 |
| SC-024 | Switching never changes the build, total, session or order; a copy failure shows Indonesian; the confirmation re-renders with identical recorded data | TC-074, TC-075, TC-077, TC-097, TC-098 |

## Non-goals review

The spec's Non-Goals are deferred capability, not behaviour with a defined
rejection. No case speculates about a feature nobody asked for. The boundaries
that can actually be observed in v1 are asserted inside requirement cases
rather than as cases of their own:

- **No compatibility checking** — the one boundary worth exercising, because
  an over-eager implementation could add warnings or blocks. TC-023 builds a
  deliberately mismatched combination and expects it to be accepted.
- **No quantities** — a category holds at most one part (TC-006, TC-007), and
  the review has no quantity control (TC-055).
- **No payment, delivery address, shipping or contact details** — TC-055 and
  TC-056 assert the review and confirmation contain only parts, prices and the
  total.
- **No order history, tracking or profile page** — TC-063 asserts the flow
  ends at the confirmation and no screen lists past orders.
- **No admin screen, no stock levels, no discounts, no wishlists, no saved or
  shared builds, no password reset, no native app, and in the language
  revision no third language, no automatic detection, no translated product
  names and no translation admin screen** — the absence of each is recorded
  here as a scope decision; none has specified rejection behaviour to test,
  and the suite does not pad itself with speculative absence checks beyond the
  ones above. The two-language boundary itself is not speculative: it is
  exercised by TC-070 (exactly two choices), TC-069 (no browser detection) and
  TC-094 (product names stay untranslated).

## Test cases

### Catalogue and browsing

#### TC-001 — A visitor opens the builder and sees the seven categories, the parts and Rp 0
- **Type:** positive
- **Spec:** REQ-001, REQ-002, REQ-005, REQ-016
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh browser profile with no session; the seeded 21-part catalogue.
- **Action / input:** Open the app's address.
- **Expected result:** The builder is shown straight away: seven category headings — Processor (CPU), Motherboard, RAM, Storage (SSD), Graphics Card, Power Supply, PC Case — each listing its parts with a name and a price. The total reads "Rp 0". No sign-in form, dialog or overlay blocks the page, and no sign-in is required to see or use the picker.

#### TC-002 — The seven categories are exactly the specified ones and no others exist
- **Type:** positive
- **Spec:** REQ-002
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Seeded catalogue; any visitor.
- **Action / input:** Load the builder and read every category heading from top to bottom.
- **Expected result:** Exactly seven categories are present, with the names and order given in TC-001. There is no eighth category, no "other", "accessories" or "cables" section, and no category can be added, renamed or reordered by the customer.

#### TC-003 — All 21 sample parts appear, three per category, with the spec's names and prices
- **Type:** positive
- **Spec:** REQ-016
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Seeded catalogue.
- **Action / input:** Load the builder and compare every part shown against the parts table in Scope above.
- **Expected result:** All 21 parts are present, exactly three per category, each with its exact seed name and its price label. No part is missing, duplicated or shown in the wrong category. All 21 fit in one page of the picker; there is no pagination control.

#### TC-004 — The seeded catalogue obeys the part data rules
- **Type:** positive
- **Spec:** REQ-039
- **Level:** API
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Seeded catalogue data as loaded by the builder.
- **Action / input:** Inspect the 21 part records returned to the builder (name, category, price).
- **Expected result:** Every part has a non-empty name of 1 to 100 characters; every name is unique within its category; every price is a whole number of rupiah greater than zero with no decimals and no currency other than rupiah. Each part records exactly one of the seven categories.

#### TC-005 — The part list can be read without a session
- **Type:** positive
- **Spec:** REQ-001
- **Level:** API
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** No session cookie or token; seeded catalogue.
- **Action / input:** From the builder's network activity, repeat the request that loads the parts, with no credentials.
- **Expected result:** The request succeeds and returns all 21 parts with names, categories and prices. It is not refused for lack of a session and does not prompt for sign-in.

### Building, the total and rupiah pricing

#### TC-006 — Choosing a part adds it to its category and raises the total immediately
- **Type:** positive
- **Spec:** REQ-003, REQ-005, REQ-037
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh builder, total Rp 0; no part chosen.
- **Action / input:** Choose CPU-i3 (Rp 1.350.000) from the Processor (CPU) category.
- **Expected result:** CPU-i3 is marked as chosen in Processor (CPU) and in no other category. The total changes from "Rp 0" to "Rp 1.350.000" at once, with no separate "recalculate" or "apply" action. Choosing a part only ever fills the category it belongs to.

#### TC-007 — Choosing a second part in the same category replaces the first and moves the total by the difference
- **Type:** positive
- **Spec:** REQ-003, REQ-005, REQ-037
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** BUILD-SIX on screen, total Rp 4.230.000; CPU-i3 chosen in Processor (CPU).
- **Action / input:** In Processor (CPU), choose CPU-i5 (Rp 2.150.000).
- **Expected result:** Processor (CPU) now holds CPU-i5 only — CPU-i3 is no longer chosen and the category shows exactly one selection. The total becomes "Rp 5.030.000" (Rp 4.230.000 − Rp 1.350.000 + Rp 2.150.000) immediately. The other five categories keep their chosen parts.

#### TC-008 — Removing a chosen part empties its category and subtracts its price
- **Type:** positive
- **Spec:** REQ-004
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** BUILD-SEVEN on screen, total Rp 7.330.000.
- **Action / input:** Remove GPU-3050 from Graphics Card.
- **Expected result:** Graphics Card becomes empty (nothing chosen), the other six categories keep their parts, and the total drops to "Rp 4.230.000". The removal is immediate, with no recalculation action.

#### TC-009 — A complete build's total is the plain sum of the chosen prices
- **Type:** positive
- **Spec:** REQ-005, REQ-006
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh builder.
- **Action / input:** Choose CPU-R5, MB-B660, RAM-32, SSD-2TB, GPU-6600, PSU-650, CASE-Hive one at a time, reading the total after each choice.
- **Expected result:** After each choice the total equals the sum of everything chosen so far (for example after the first four: Rp 1.850.000 + Rp 1.750.000 + Rp 1.250.000 + Rp 1.850.000 = "Rp 6.700.000"), and the final total is "Rp 11.550.000". Nothing else is added at any point.

#### TC-010 — The spec's mid-range build reads "Rp 12.020.000"
- **Type:** positive
- **Spec:** REQ-007
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh builder.
- **Action / input:** Choose the parts of BUILD-MID (CPU-i5, MB-B660, RAM-16, SSD-1TB, GPU-4060, PSU-650, CASE-H5).
- **Expected result:** The total reads exactly "Rp 12.020.000" — an "Rp " prefix, dots as thousands separators and no decimals. Every part price in the build is shown in the same form (for example "Rp 4.250.000").

#### TC-011 — A build totalling twelve and a half million reads exactly "Rp 12.500.000"
- **Type:** positive
- **Spec:** REQ-007
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh builder.
- **Action / input:** Choose the parts of BUILD-12500 (CPU-i5, MB-B550, RAM-8, SSD-2TB, PSU-750, CASE-Nerva, GPU-4060).
- **Expected result:** The total reads exactly "Rp 12.500.000". It contains no decimal fraction, no comma separator, no currency code, and no space between "Rp" and the first digit other than the single required space.

#### TC-012 — Every part price uses the rupiah form
- **Type:** positive
- **Spec:** REQ-007, REQ-016
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Seeded catalogue.
- **Action / input:** Read all 21 price labels in the picker.
- **Expected result:** Each one matches the price in the Scope table and uses the rupiah form: "Rp " followed by digits with dots as thousands separators and no decimals, for example "Rp 350.000", "Rp 1.350.000", "Rp 4.250.000". No label shows a currency code, a comma separator, a decimal point or a missing "Rp " prefix.

#### TC-013 — The total carries no tax or shipping line
- **Type:** positive
- **Spec:** REQ-006
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** BUILD-SEVEN on screen.
- **Action / input:** Inspect the total area and the whole builder page.
- **Expected result:** There is no tax, VAT, service, shipping or delivery line anywhere, and no line other than the sum of the chosen parts contributes to the total. The total equals the sum of the shown part prices exactly.

#### TC-014 — The most expensive part in every category still totals correctly
- **Type:** boundary
- **Spec:** REQ-030
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh builder.
- **Action / input:** Choose the highest-priced part in all seven categories (BUILD-MAX: CPU-i5, MB-B550, RAM-32, SSD-2TB, GPU-4060, PSU-750, CASE-H5).
- **Expected result:** The total reads exactly "Rp 14.500.000" and equals the sum of the seven shown prices. There is no overflow, truncation, rounding or dropped thousands separator.

#### TC-015 — A build without a graphics card is complete and totals the six required parts
- **Type:** positive
- **Spec:** REQ-006, REQ-008, REQ-038
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh builder; *buyer1* signed in.
- **Action / input:** Choose the six required parts of BUILD-SIX and leave Graphics Card empty.
- **Expected result:** Graphics Card remains empty and is not treated as missing. The total reads "Rp 4.230.000", the build is presented as ready, and Checkout is available (per TC-020).

#### TC-016 — Removing the last part of a required category returns the build to the incomplete state
- **Type:** positive
- **Spec:** REQ-018, REQ-020
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** BUILD-SIX on screen; *buyer1* signed in; Checkout available.
- **Action / input:** Remove PSU-550 from Power Supply.
- **Expected result:** Power Supply becomes empty, the total drops from "Rp 4.230.000" to "Rp 3.580.000", and the build is no longer complete: Checkout is unavailable and a message naming Power Supply as still empty is visible.

### Completion rule and checkout availability

#### TC-017 — An empty build cannot check out and the message names all six required categories
- **Type:** negative
- **Spec:** REQ-018, REQ-019
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh builder, nothing chosen; *buyer1* signed in.
- **Action / input:** Attempt to check out (press Checkout, or use whatever control is offered for it).
- **Expected result:** No review screen opens. A plain message is visible naming the empty required categories — Processor (CPU), Motherboard, RAM, Storage (SSD), Power Supply and PC Case — and does not name Graphics Card. The total stays "Rp 0" and the build is not presented as complete.

#### TC-018 — One required category empty: the message names only that category
- **Type:** negative
- **Spec:** REQ-008, REQ-019
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** BUILD-SIX on screen with Power Supply removed, total Rp 3.580.000; *buyer1* signed in.
- **Action / input:** Attempt to check out.
- **Expected result:** Checkout is refused, no review opens, and the message names Power Supply and only Power Supply as the missing category. The reason is visible without the customer having to guess why the action does nothing.

#### TC-019 — Several required categories empty: each empty one is named
- **Type:** boundary
- **Spec:** REQ-019
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** RAM and PC Case chosen, the other four required categories empty; *buyer1* signed in.
- **Action / input:** Attempt to check out.
- **Expected result:** Checkout is refused and the message names Processor (CPU), Motherboard, Storage (SSD) and Power Supply — each empty required category — and does not name RAM, PC Case or Graphics Card.

#### TC-020 — With the six required parts filled, checkout is available
- **Type:** positive
- **Spec:** REQ-008, REQ-038
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** BUILD-SIX on screen, Graphics Card empty; *buyer1* signed in.
- **Action / input:** Observe the checkout control, then press it.
- **Expected result:** Checkout is available (not disabled, and no missing-category message is shown), and pressing it opens the order review for BUILD-SIX at "Rp 4.230.000".

#### TC-021 — With all seven categories chosen, checkout is available
- **Type:** positive
- **Spec:** REQ-008, REQ-038
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** BUILD-SEVEN on screen; *buyer1* signed in.
- **Action / input:** Press Checkout.
- **Expected result:** The order review opens for all seven parts at "Rp 7.330.000"; the graphics card is included because it was chosen, not because it is required.

#### TC-022 — A signed-out visitor with an incomplete build is told which categories are missing
- **Type:** negative
- **Spec:** REQ-019
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh browser with no session; RAM chosen only.
- **Action / input:** Attempt to check out.
- **Expected result:** Checkout is refused, no review opens and no order is created, and a plain message names the empty required categories. The customer is never left with a control that does nothing and no explanation. (The spec fixes this reason; it does not fix whether a sign-in prompt also appears at this point, so the case asserts only the visible reason and the refusal.)

#### TC-023 — A physically mismatched build is accepted with no compatibility warning
- **Type:** positive
- **Spec:** REQ-038
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; fresh builder.
- **Action / input:** Choose CPU-R5 (socket AM4) with MB-B660 (Intel B660), RAM-8, SSD-500, PSU-550 and CASE-Nerva, then press Checkout.
- **Expected result:** Every part is accepted and the build is treated as complete: the only selection rules are one part per category and the six required categories. No socket, memory-type, power, clearance or other compatibility warning, hint or block appears anywhere, and the order review opens at "Rp 5.430.000".

### Creating an account

#### TC-024 — A visitor creates an account and is signed in immediately
- **Type:** positive
- **Spec:** REQ-009
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh browser with no session; email not previously used.
- **Action / input:** Open create account; enter full name "Budi Santoso", email "buyer1@example.com", password "Build1234"; submit.
- **Expected result:** The account is created and the customer is signed in at once — no separate sign-in step, no waiting for approval. The checkout action is now available for a complete build, and the account can be signed in again later with the same email and password (TC-042).

#### TC-025 — An empty full name is refused, names the field and keeps what was typed
- **Type:** negative
- **Spec:** REQ-021
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form open; no session.
- **Action / input:** Leave the full name empty, fill email "new1@example.com" and password "Build1234", submit.
- **Expected result:** The form is refused before anything is sent; a message says the full name is required and names that field. The email and password that were typed remain in the form, and no account is created.

#### TC-026 — An empty email address is refused, names the field and keeps what was typed
- **Type:** negative
- **Spec:** REQ-021
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form open; no session.
- **Action / input:** Fill a full name and password "Build1234", leave the email empty, submit.
- **Expected result:** The form is refused before anything is sent; a message says the email address is required and names that field; the name and password remain in the form; no account is created.

#### TC-027 — An empty password is refused, names the field and keeps what was typed
- **Type:** negative
- **Spec:** REQ-021
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form open; no session.
- **Action / input:** Fill a full name and email "new2@example.com", leave the password empty, submit.
- **Expected result:** The form is refused before anything is sent; a message says the password is required and names that field; the name and email remain in the form; no account is created.

#### TC-028 — Creating an account with an email that already has one is refused and offers sign-in
- **Type:** negative
- **Spec:** REQ-023, REQ-033
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* exists (buyer1@example.com).
- **Action / input:** Open create account; enter full name "Another Person", email "buyer1@example.com", password "Other5678"; submit.
- **Expected result:** The attempt is refused with a plain message saying an account already exists for that email address and offering to sign in instead. No second account is created; the original password is never shown or echoed; the offered sign-in path signs in the original account with its own password.

#### TC-029 — An email that differs only in letter case is refused as a duplicate
- **Type:** boundary
- **Spec:** REQ-023, REQ-033
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* exists (buyer1@example.com).
- **Action / input:** Open create account; enter "Budi Santoso", email "BUYER1@Example.COM", password "Build1234"; submit.
- **Expected result:** The attempt is refused as a duplicate with the same plain message as TC-028. No account with the upper-case address is created, and buyer1 is still the single account for that address.

#### TC-030 — A password shorter than 8 characters is refused and the rule is stated
- **Type:** boundary
- **Spec:** REQ-024, REQ-035
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form open; new email "shortpw@example.com".
- **Action / input:** Enter full name "Short Pw", that email, password "Abcdef1" (7 characters, letter and digit) and submit.
- **Expected result:** The account is not created. A plain message states the password rule (8 to 128 characters with at least one letter and one number) in words the customer can act on, and does not just say "invalid". The rest of the form stays filled.

#### TC-031 — A password of exactly 8 characters is accepted
- **Type:** boundary
- **Spec:** REQ-035
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form open; new email "minpw@example.com".
- **Action / input:** Enter full name "Pat Tester", that email, password "Abcdefg1" (8 characters) and submit.
- **Expected result:** The account is created and the customer is signed in; signing out and signing in with the same 8-character password works (TC-042).

#### TC-032 — A password of exactly 128 characters is accepted
- **Type:** boundary
- **Spec:** REQ-035
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form open; new email "maxpw@example.com".
- **Action / input:** Enter full name "Pat Tester", that email, password `A1` + `x` × 126 (128 characters) and submit.
- **Expected result:** The account is created and the customer is signed in; signing out and signing in with the same 128-character password works.

#### TC-033 — A password longer than 128 characters is refused
- **Type:** boundary
- **Spec:** REQ-035
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form open; new email "longpw@example.com".
- **Action / input:** Enter full name "Pat Tester", that email, password `A1` + `x` × 127 (129 characters) and submit.
- **Expected result:** The account is not created; a plain message states the 8–128 character rule and names the password field.

#### TC-034 — A password with no number is refused
- **Type:** negative
- **Spec:** REQ-024, REQ-035
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form open; new email "nonumber@example.com".
- **Action / input:** Enter a full name, that email, password "Abcdefgh" (8 letters, no digit) and submit.
- **Expected result:** The account is not created; a plain message stating the password rule is shown, and the form stays usable with what was typed kept.

#### TC-035 — A password with no letter is refused
- **Type:** negative
- **Spec:** REQ-035
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form open; new email "noletter@example.com".
- **Action / input:** Enter a full name, that email, password "12345678" (8 digits, no letter) and submit.
- **Expected result:** The account is not created; a plain message stating the password rule is shown, and the form stays usable with what was typed kept.

#### TC-036 — The password is taken exactly as typed: case and spaces matter
- **Type:** boundary
- **Spec:** REQ-035
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form open; new email "spacey@example.com".
- **Action / input:** Create the account with password `Build1234 ` (a trailing space). Sign out. Then, one at a time, try to sign in with `Build1234` (no trailing space), `build1234 ` (different case) and finally `Build1234 ` (exactly as typed).
- **Expected result:** The first two attempts are refused with the generic sign-in error and no account is entered. The third attempt succeeds. The password was neither trimmed nor case-folded.

#### TC-037 — Full names of 2 and 100 characters are accepted
- **Type:** boundary
- **Spec:** REQ-034
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form; new emails "minname@example.com" and "maxname@example.com".
- **Action / input:** Create one account with full name "Al" (2 characters) and another with a full name of 100 characters (`A` × 100); give each a valid unique email and password "Build1234".
- **Expected result:** Both accounts are created and both customers are signed in. Neither name is truncated or refused at the boundary.

#### TC-038 — Full names of 1 and 101 characters are refused
- **Type:** boundary
- **Spec:** REQ-034
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form; new emails "shortname@example.com" and "longname@example.com".
- **Action / input:** Try to create one account with full name "A" (1 character) and another with `A` × 101; valid unique email and password "Build1234" in both.
- **Expected result:** Neither account is created. Each attempt shows a plain message stating the name rule (2 to 100 characters), the field is named, and the rest of the typed data is kept.

#### TC-039 — A 254-character email is accepted and surrounding spaces are ignored
- **Type:** boundary
- **Spec:** REQ-032
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form; the 254-character valid address described in Scope (64-character local part + `@` + 189-character domain of valid labels).
- **Action / input:** Create the account using that address with leading and trailing spaces around it (for example two spaces each side), a valid name and password "Build1234"; then sign out and sign in with the address with no surrounding spaces.
- **Expected result:** The account is created at the 254-character limit; the surrounding spaces are ignored, so the address stored identifies the same account; signing in with the same address (with or without surrounding spaces) succeeds.

#### TC-040 — An email of 255 characters is refused
- **Type:** boundary
- **Spec:** REQ-032
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form; a 255-character address shaped like the 254-character one with one extra character.
- **Action / input:** Submit the form with that address, a valid name and password "Build1234".
- **Expected result:** The account is not created; a plain message states the email rule (the maximum length) and names the email field. No truncated version of the address is accepted in its place.

#### TC-041 — Malformed email addresses are refused
- **Type:** negative
- **Spec:** REQ-032
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Create-account form; valid name and password "Build1234".
- **Action / input:** Submit once with each of: "newperson.example.com" (no `@`), "newperson@" (no domain), "new person@example.com" (a space inside) and "@example.com" (no local part).
- **Expected result:** Each attempt is refused with a plain message saying the email address is not valid and naming the field. No account is created for any of them, and the rest of the form stays filled between attempts.

### Signing in, signing out and sessions

#### TC-042 — Correct email and password sign the customer in
- **Type:** positive
- **Spec:** REQ-010
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* exists; fresh browser with no session.
- **Action / input:** Open sign in; enter buyer1@example.com and Build1234; submit.
- **Expected result:** The customer is signed in. A complete build can now be checked out, and the customer sees no other customer's data.

#### TC-043 — A wrong password shows one generic error and keeps the form usable
- **Type:** negative
- **Spec:** REQ-022
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* exists; sign-in form open.
- **Action / input:** Enter buyer1@example.com with password "Wrong1234"; submit.
- **Expected result:** One generic error is shown that does not say whether the email or the password was wrong. The sign-in form stays open and usable, the email address remains in the field, and no session is created — checkout stays unavailable.

#### TC-044 — An unknown email shows the identical generic error
- **Type:** negative
- **Spec:** REQ-022
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** No account for "nobody@example.com"; sign-in form open.
- **Action / input:** Enter nobody@example.com with password "Build1234"; submit.
- **Expected result:** The error message is word-for-word the same generic message as TC-043: it does not reveal that the account does not exist. The form stays usable and the email is kept.

#### TC-045 — An empty sign-in field is refused and the field is named
- **Type:** negative
- **Spec:** REQ-021
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Sign-in form open; no session.
- **Action / input:** Submit once with the email empty and a password entered, then once with the email entered and the password empty.
- **Expected result:** Each attempt is refused before anything is sent; a message names the empty field (email, then password). Nothing already typed is lost, and no sign-in attempt is made with the empty value.

#### TC-046 — Repeated wrong attempts do not lock the account
- **Type:** negative
- **Spec:** REQ-036
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* exists; sign-in form open.
- **Action / input:** Submit buyer1@example.com with a wrong password five times in a row, then submit the correct password Build1234.
- **Expected result:** The first five attempts each show the generic error; the sixth, correct attempt signs the customer in immediately. No lockout, delay or block is introduced, and no message claims the account is locked.

#### TC-047 — Signing out ends the session on that device and blocks checkout
- **Type:** positive
- **Spec:** REQ-010, REQ-028
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-SIX on screen.
- **Action / input:** Sign out. Attempt to check out.
- **Expected result:** The customer is signed out. Checkout is no longer available; attempting it sends the customer to sign in (REQ-015 behaviour, TC-053), and no order is created while signed out.

#### TC-048 — Signing out leaves the build on screen and browsable
- **Type:** positive
- **Spec:** REQ-028
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-SIX on screen at Rp 4.230.000.
- **Action / input:** Sign out and continue using the picker — swap CPU-i3 for CPU-R5 and read the total.
- **Expected result:** After signing out the same build is still visible with its parts and total, and the picker still works: the swap changes the total to "Rp 4.730.000". Only checkout requires signing in again.

#### TC-049 — A signed-in customer stays signed in across reloads and browser restarts
- **Type:** positive
- **Spec:** REQ-011
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; persistent browser profile; BUILD-SIX on screen.
- **Action / input:** Reload the page, then close the browser completely and open the app again in the same profile; press Checkout.
- **Expected result:** The customer is still signed in after the reload and after the restart — no sign-in form appears, and Checkout opens the order review without signing in again. The session lasts until the customer signs out.

#### TC-050 — A session credential taken before sign-out no longer authorizes checkout
- **Type:** negative
- **Spec:** REQ-010, REQ-028
- **Level:** API
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in on one browser with BUILD-SIX; the session cookie or token captured before signing out.
- **Action / input:** Sign out. Then repeat the order-submission request the review screen sends, using the captured pre-sign-out credential.
- **Expected result:** The request is refused as unauthenticated, no order is created, and the customer would be sent to sign in. Signing out ended the session rather than only hiding the checkout control.

### The build survives signing in or creating an account

#### TC-051 — Signing in mid-build keeps every part and the total
- **Type:** positive
- **Spec:** REQ-012
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh browser with no session; BUILD-SEVEN built as a visitor at Rp 7.330.000; *buyer1* exists.
- **Action / input:** Sign in as buyer1 from the builder (not via checkout).
- **Expected result:** After signing in, the same build is on screen: all seven chosen parts and the total "Rp 7.330.000" are exactly as before. Nothing is lost or reset, and the customer continues from the same build.

#### TC-052 — Creating an account mid-build keeps every part and the total
- **Type:** positive
- **Spec:** REQ-012
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh browser with no session; BUILD-SIX built as a visitor at Rp 4.230.000; a new unused email.
- **Action / input:** Create a new account from the builder with that email, a valid name and password "Build1234".
- **Expected result:** After the account is created and the customer is signed in, the same six parts and the total "Rp 4.230.000" are still there, and Checkout is available.

#### TC-053 — Signed-out checkout leads to sign-in and back to the same review
- **Type:** positive
- **Spec:** REQ-015
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh browser with no session; BUILD-SIX built at Rp 4.230.000; *buyer1* exists.
- **Action / input:** Press Checkout; on the sign-in form enter buyer1@example.com and Build1234; submit.
- **Expected result:** Before signing in, checkout sends the customer to sign in (not to an error and not to an empty picker). After signing in they land on the order review with the same six parts, each with its price, and the same total "Rp 4.230.000" — never on an empty picker and never with parts lost.

#### TC-054 — Creating an account at the checkout step returns to the same review
- **Type:** positive
- **Spec:** REQ-009, REQ-012, REQ-015
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Fresh browser with no session; BUILD-SIX built at Rp 4.230.000; a new unused email.
- **Action / input:** Press Checkout; choose create account; enter a valid name, the new email and password "Build1234"; submit.
- **Expected result:** The account is created, the customer is signed in, and they land on the order review for the same six parts at "Rp 4.230.000". No part is lost and no second sign-in step is required before confirming.

### Order review, submission and confirmation

#### TC-055 — Checkout opens a review of every part by category with its price and the final total
- **Type:** positive
- **Spec:** REQ-013
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-MID on screen at Rp 12.020.000.
- **Action / input:** Press Checkout.
- **Expected result:** The order review opens listing every chosen part, grouped by its category, each with its name and its price, and the final total "Rp 12.020.000". There is no payment field, no card or bank detail field, no delivery address, contact or collection field, and no quantity selector. A way to go back and change parts, and a way to confirm, are both present.

#### TC-056 — Confirming the review submits the order and shows the confirmation
- **Type:** positive
- **Spec:** REQ-014
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-MID on the order review at Rp 12.020.000.
- **Action / input:** Confirm the order.
- **Expected result:** The order is submitted and a confirmation is shown containing the ordered parts (the same seven, by category, with their prices) and the final total "Rp 12.020.000". The flow ends there: there is no payment step, no delivery step, no order-history link and no further required action.

#### TC-057 — The review total, the recorded order total and the confirmation total are identical
- **Type:** positive
- **Spec:** REQ-029, REQ-040
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-SEVEN on the order review at Rp 7.330.000.
- **Action / input:** Note the total on the review, confirm, then read the total on the confirmation and the total recorded with the created order in the test environment's store.
- **Expected result:** All three read "Rp 7.330.000" and are numerically identical. The confirmed total is the sum of the chosen parts' prices with nothing added or subtracted, and the confirmation never shows a total different from the one reviewed.

#### TC-058 — The recorded order keeps the part names and the prices shown at confirmation
- **Type:** positive
- **Spec:** REQ-041
- **Level:** API
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-MID on the order review.
- **Action / input:** Confirm the order; read the order record created in the test environment's store.
- **Expected result:** The recorded order lists the same part names, in the same categories, at the same prices the customer saw on the review and confirmation (for example "Gigabyte RTX 4060 8GB" at "Rp 4.250.000"). It does not re-price, re-name or drop any part, and the record's total matches the reviewed total.

#### TC-059 — Changing a part after opening the review updates the review before anything is ordered
- **Type:** positive
- **Spec:** REQ-031
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-SEVEN on the order review at Rp 7.330.000.
- **Action / input:** Go back from the review to the builder, swap GPU-3050 for GPU-4060, then return to the review and confirm.
- **Expected result:** The review now shows GPU-4060 in Graphics Card and the total "Rp 8.480.000" (Rp 7.330.000 − Rp 3.100.000 + Rp 4.250.000). Nothing is ordered from the outdated build; the customer sees the updated reviewed total before confirming, and confirming records the updated parts at that total.

#### TC-060 — A part withdrawn before confirmation stops the order and returns the build without it
- **Type:** negative
- **Spec:** REQ-026
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-SEVEN on the order review at Rp 7.330.000. Between opening the review and confirming, remove GPU-3050 from the seeded catalogue in the test environment.
- **Action / input:** Confirm the order.
- **Expected result:** No order is placed — no order record is created for this attempt. The customer is told plainly that the graphics card is no longer available. The build comes back for review with that part no longer offered and removed from the build, and the total now reads "Rp 4.230.000" visibly, with the change explained. The total is never changed quietly and the order is never submitted at the old total.

#### TC-061 — An expired session at confirmation returns to sign-in and then the same review, with one order
- **Type:** negative
- **Spec:** REQ-027
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-SIX on the order review at Rp 4.230.000. Expire the session server-side after the review opens, before confirming.
- **Action / input:** Confirm; sign in again as buyer1 on the form shown; then confirm once on the review the app returns to.
- **Expected result:** The first confirm does not create an order and the customer is taken to sign in. After signing in they are returned to the same review with the same six parts and "Rp 4.230.000", and confirming once records exactly one order. The sign-in return does not submit the order a second time, and the recorded order is at that same total.

#### TC-062 — Submitting an order without a valid session creates no order
- **Type:** negative
- **Spec:** REQ-010, REQ-015
- **Level:** API
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** A complete BUILD-SIX build; no session (fresh browser, no cookies or tokens).
- **Action / input:** Repeat the order-submission request the review screen sends, with no session credential.
- **Expected result:** The submission is refused as unauthenticated — the customer would be sent to sign in — and no order record is created in the store. Checkout is a signed-in action, enforced where the order is actually submitted, not only by hiding the button.

#### TC-063 — Another account sees nothing of a customer's order
- **Type:** negative
- **Spec:** REQ-014
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* has just submitted BUILD-SIX and seen its confirmation; *buyer2* exists.
- **Action / input:** Sign out as buyer1; sign in as buyer2; visit every screen the app offers.
- **Expected result:** No screen lists past orders (there is no order history in v1), and nothing of buyer1's order, confirmation, total, name or email is disclosed to buyer2. Buyer2 can only act on their own account. (A build still visible in that browser is local build state, which REQ-012 and REQ-028 already govern; the case is about account and order data not crossing between customers.)

### Failure and recovery

#### TC-064 — A failed part list shows a clear message and a way to retry
- **Type:** negative
- **Spec:** REQ-025
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** The request that loads the part list is blocked, or the store is stopped so it returns an error.
- **Action / input:** Open the app.
- **Expected result:** A clear message says the parts could not be loaded, and a retry control is offered. The page is never blank, no loader spins indefinitely once the request has failed, and no total is shown as if it were current.

#### TC-065 — Retrying after the catalogue is back loads the picker normally
- **Type:** positive
- **Spec:** REQ-025
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Part-list request blocked, app opened and the error state of TC-064 shown.
- **Action / input:** Restore the catalogue request, then use the retry control.
- **Expected result:** The picker loads normally with all seven categories, the 21 parts and a total of "Rp 0". The error message disappears and no reload of the whole page is required.

#### TC-066 — A failed reload never presents the old total as current
- **Type:** boundary
- **Spec:** REQ-025
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** BUILD-SEVEN built at Rp 7.330.000 in a browser; the part-list request is then blocked.
- **Action / input:** Reload the page.
- **Expected result:** The page shows the clear "parts could not be loaded" message with a retry action. The previous "Rp 7.330.000" is not displayed as if it were a live, current total, and there is no blank page and no endless spinner.

### Interface language

#### TC-067 — Every screen, label, button, message and error is in the selected language
- **Type:** positive
- **Spec:** REQ-017
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** no
- **Preconditions / test data:** Seeded environment; a visitor and a signed-in customer; the error states of TC-018, TC-028, TC-043, TC-064 and TC-061 reachable.
- **Action / input:** With English selected, visit the builder, sign-in, create-account, order review, confirmation and each error state and read every piece of text; then select Indonesian and repeat.
- **Expected result:** With English selected, all headings, category and part labels, buttons, placeholders, validation messages, error messages, the review and the confirmation are in English; with Indonesian selected, every one of those strings is in Indonesian. No page mixes the two, and prices remain in rupiah in both. Prices, part and model names and the two switcher labels ("English", "Bahasa Indonesia") are identical across languages by REQ-050 and REQ-042.
- **Amended v2:** REQ-017 now requires one of two languages rather than English only; the old "there is no language switch, locale selector or translated variant anywhere" clause is superseded and removed. The page-by-page two-language sweep is TC-092, and the switch itself is TC-069 to TC-079.

#### TC-068 — Server-side refusals reach the customer as plain sentences in the selected language
- **Type:** positive
- **Spec:** REQ-017, REQ-022
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Seeded environment; a signed-in customer, a duplicate email and both languages reachable.
- **Action / input:** Trigger each refusal that is decided by the backend — duplicate email at sign-up, wrong password at sign-in, and an expired session at confirmation — once with English selected and once with Indonesian selected.
- **Expected result:** Each is shown to the customer as a plain sentence in the selected language, not as a code, an empty box, a browser alert or a raw technical message. In Indonesian the sentence is Indonesian (formal register, TC-093); in English it is English. The wording is distinct per cause where the spec requires it: duplicate email says an account exists and offers sign-in, while the wrong-password and expired-session cases never reveal whether the account exists.
- **Amended v2:** the expectation is now "the selected language" rather than English only; the wording and distinctness rules are unchanged (REQ-022).

### Language switcher and the default language

#### TC-069 — A first-time visitor on a fresh device sees Indonesian, and the browser's language does not change that
- **Type:** positive
- **Spec:** REQ-044, REQ-042
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** device-A (fresh profile, no stored language, no session); the browser's own preferred language set to English (`Accept-Language: en-US`).
- **Action / input:** Open the app.
- **Expected result:** The builder is shown in Indonesian: headings, the seven category names, the text around the part names, the total label and the Checkout action are Indonesian (the processor category heading is the Indonesian word for processor, not "Processor (CPU)"). Product, model and brand names and the rupiah prices are unchanged (REQ-050). The switcher offers both choices. Reloading, and opening another fresh profile whose browser language is Indonesian, both show Indonesian — the app does not use the browser's language or the country to pick one.

#### TC-070 — The switcher with exactly two choices is on every page, for a visitor and a signed-in customer
- **Type:** positive
- **Spec:** REQ-042
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Seeded catalogue; device-A; *buyer1*.
- **Action / input:** As a visitor, open the builder, sign in, create account and an unmatched address (not-found). Then sign in as *buyer1* and open the builder, the order review (complete build) and a confirmation (after submitting an order). Read the switcher on every page.
- **Expected result:** Every one of those pages shows a language switcher with exactly two choices, labelled "English" and "Bahasa Indonesia" — the same two labels in both languages. It is present for a visitor on the builder, sign in, create account and not-found, and for a signed-in customer on the builder, review and confirmation. It is not hidden, disabled or replaced by a link to another page, and choosing a language from any of them works (TC-074, TC-076). There is no third choice and no "auto" or "browser default" option.

#### TC-071 — The switcher is present and usable in the builder's and the auth forms' empty, incomplete, loading and error states
- **Type:** positive
- **Spec:** REQ-042
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** device-A; the catalogue controls from Scope; *buyer1*; the create-account validation error of TC-025 and the generic sign-in error of TC-043 reachable.
- **Action / input:** Open (a) a fresh builder with nothing chosen, (b) a builder with RAM chosen only, (c) the builder with the part-list request blocked (loading, then the error state), (d) the fresh builder as *buyer1* signed in, (e) the create-account form after submitting it with an empty full name, and (f) the sign-in form after a wrong password. Read the switcher and switch once in each state.
- **Expected result:** Every one of those states shows the two-choice switcher, and choosing a language changes that state's strings at once — the empty-build text, the missing-category message, the loading text, the "parts could not be loaded" message with its retry action, the "full name is required" message and the generic sign-in error are all in the chosen language. No state hides the switcher, shows it empty, or renders its labels as raw keys.

#### TC-072 — The switcher is present and usable on the order review and the confirmation, including their loading and error states
- **Type:** positive
- **Spec:** REQ-042
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in with BUILD-SIX; a submitted order; the review's and confirmation's loading and error states reachable by blocking or slowing the order requests; an unmatched order address for the not-found state.
- **Action / input:** Open the order review, the confirmation, an unmatched order address, and each page's loading and error state; read the switcher on each and switch once.
- **Expected result:** Every one of these states shows the same two-choice switcher, and switching changes the page's strings at once (TC-076, TC-098). The loading and error states are not exempt. The not-found page keeps the switcher and its way back to the builder, and the customer is never left on a page where the language cannot be changed.

#### TC-073 — The switcher is visible and usable at a phone viewport
- **Type:** positive
- **Spec:** REQ-042
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** device-A; a 390×844 phone viewport with device emulation.
- **Action / input:** Open the builder and the sign-in page at that viewport, read and use the switcher, and scroll to the bottom and back.
- **Expected result:** The switcher is visible without horizontal scrolling, both choices can be tapped without overlapping another control or being cut off, and choosing a language changes the page at once. It is the same two-choice control as on the desktop viewport — neither choice is clipped, hidden behind other content or unlabelled.

### Switching and what must not change

#### TC-074 — Switching changes the whole builder page at once, with the parts and the total untouched
- **Type:** positive
- **Spec:** REQ-043, REQ-056
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** device-A; BUILD-MID chosen, total "Rp 12.020.000"; page in Indonesian.
- **Action / input:** Select English from the switcher.
- **Expected result:** Every visible string on the builder becomes English at once, without the customer reloading the page or navigating elsewhere: headings, the seven category names, the part-row text, the total label, the Checkout action and any placeholder. The seven chosen parts, their marked selections and the total "Rp 12.020.000" are exactly as before — the page is not reset and the build is not rebuilt. Switching back to Indonesian reverses all of it.

#### TC-075 — A half-typed create-account form survives a language switch unchanged
- **Type:** positive
- **Spec:** REQ-043, REQ-056
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** device-A; create-account page in Indonesian.
- **Action / input:** Type full name "Budi Santoso", email "form.keep@example.com" and password "Build1234", leaving the email field with the typed text still in it; switch to English; then submit.
- **Expected result:** The page's labels, placeholders and button become English, while the three typed values — including the email and the password — are exactly as typed. The switch neither clears nor changes the form and submits nothing. Submitting after the switch uses exactly those values, so the account is created for form.keep@example.com.

#### TC-076 — Switching on the order review updates every label and keeps the parts and the total
- **Type:** positive
- **Spec:** REQ-043, REQ-057
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-SEVEN on the order review at "Rp 7.330.000"; page in Indonesian.
- **Action / input:** Switch to English, then back to Indonesian.
- **Expected result:** The review's headings, category labels, part-row text, summary labels, final-total label and the confirm and back controls change to English at once; the seven chosen parts, their names and prices and the final total "Rp 7.330.000" stay exactly the same (REQ-050). Switching back restores the Indonesian labels with the same parts and total. Nothing is submitted and the page does not navigate away.

#### TC-077 — Switching never changes the signed-in state and never submits, duplicates or alters an order
- **Type:** positive
- **Spec:** REQ-056
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-SIX on the order review at "Rp 4.230.000"; *buyer1*'s order count in the test store noted before the step.
- **Action / input:** Switch the language five times on the review, reading the order count in the store between switches, then confirm once and read the confirmation and the count again.
- **Expected result:** Throughout the switching *buyer1* stays signed in (the header still offers sign-out and the session is not lost), the build and total are unchanged, and the order count does not move — a language change never submits, duplicates or alters an order. After the single confirm exactly one order exists, with the same parts and the same total "Rp 4.230.000".

#### TC-078 — Switching back and forth repeatedly leaves exactly the same page in each language
- **Type:** boundary
- **Spec:** REQ-043, REQ-056
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** device-A; BUILD-SEVEN at "Rp 7.330.000"; builder in Indonesian.
- **Action / input:** Switch to English and back to Indonesian ten times, comparing the page in each language on the first and on the last round.
- **Expected result:** The last English page is identical to the first English page — same strings, same chosen parts, same total — and the last Indonesian page is identical to the first Indonesian page. No string is left behind in the other language after a switch, no part or total drifts, and no error or reload occurs during the ten switches.

### Remembering the language on the device

#### TC-079 — A visitor's language choice is remembered across reload and browser restart
- **Type:** positive
- **Spec:** REQ-045
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** device-A (persistent profile), builder in Indonesian, no session.
- **Action / input:** Switch to English; reload the page; close the browser completely and reopen the app in the same profile; open a new tab in the same profile.
- **Expected result:** After the reload, after the restart and in the new tab the app opens in English without asking and without the customer choosing again. The remembered language applies to every page the visitor opens in that profile (the builder, sign in and create account), not only to the page where it was chosen.

#### TC-080 — Signing out leaves the last language used on the device
- **Type:** positive
- **Spec:** REQ-053
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** device-EN (English chosen, signed out); *buyer1*, stored as Indonesian (REQ-054).
- **Action / input:** Sign in as *buyer1* (the page becomes Indonesian, TC-082); sign out; reload; browse the builder as a visitor.
- **Expected result:** After signing out the app stays in Indonesian — the language last used on that device — and does not revert to the pre-sign-in English choice. The reload also opens Indonesian, and the visitor can keep browsing and switch the language freely.

### The account's language

#### TC-081 — A new account takes the language selected at sign-up
- **Type:** positive
- **Spec:** REQ-046, REQ-059
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** device-A; two unused email addresses.
- **Action / input:** (a) With the app in English, create an account (*lang-en*) and sign out. (b) With the app in Indonesian, create an account (*lang-id*) and sign out. Then, on device-B (fresh, Indonesian default), sign in as *lang-en*; then sign in as *lang-id*.
- **Expected result:** *lang-en* is stored as English: signing in as *lang-en* on device-B opens the app in English, over the device's Indonesian default (TC-082). *lang-id* is stored as Indonesian and shows Indonesian. Neither account is left without a language, and sign-up asks no language question beyond the switcher already on the page — the selected language at that moment is the account's language.

#### TC-082 — Signing in switches the app to the account's stored language
- **Type:** positive
- **Spec:** REQ-052, REQ-047
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *lang-en* (stored English) and *buyer1* (stored Indonesian); device-A (Indonesian default) and device-EN (English chosen).
- **Action / input:** (a) On device-A in Indonesian, sign in as *lang-en*. (b) On device-EN in English, sign in as *buyer1*.
- **Expected result:** In (a) the app switches to English as soon as the sign-in succeeds — the whole page, not only the header — and stays English. In (b) it switches to Indonesian even though the device was set to English. The customer is not asked to choose a language at sign-in, and any build already on screen is not lost by the switch (TC-051 still holds).

#### TC-083 — The same account shows its language on another browser or device
- **Type:** positive
- **Spec:** REQ-047
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *lang-en* (stored English) and *buyer1* (stored Indonesian); device-B fresh, no stored language and no session.
- **Action / input:** Sign in as *lang-en* on device-B; sign out; sign in as *buyer1* on device-B.
- **Expected result:** *lang-en* opens the app in English on device-B, which has never had a language chosen on it; *buyer1* opens it in Indonesian. The language comes from the account, not from the device, so the same account shows the same language on any browser or device.

#### TC-084 — A signed-in customer's language change is saved to the account at once and follows them
- **Type:** positive
- **Spec:** REQ-048, REQ-059
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in on device-A (Indonesian); device-B fresh.
- **Action / input:** On device-A, switch to English while signed in. Then reload device-A; sign out and sign in again on device-A; sign in as *buyer1* on device-B.
- **Expected result:** The page is English as soon as the switch is made, with no separate save action. The reload is English, signing out and back in is English, and device-B opens in English — the change was saved to the account, not only to the device. The stored value is `en` (REQ-059).

#### TC-085 — A language switch made while signed out does not change an account's language
- **Type:** negative
- **Spec:** REQ-045, REQ-047
- **Level:** end-to-end
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* (stored Indonesian) signed in on device-A; page Indonesian.
- **Action / input:** Sign out; switch to English as a visitor; sign in again as *buyer1* on the same device.
- **Expected result:** While signed out the device is English and the app remembers that on the device (REQ-045). Signing in as *buyer1* switches the page back to Indonesian, and *buyer1*'s stored language is still Indonesian — the signed-out choice was written to the device only, never to the account. A switch made while signed in would have been saved to the account (REQ-048, TC-084).

### Stored-language rules and ownership

#### TC-086 — A missing or invalid stored language shows Indonesian and never blocks sign-in
- **Type:** boundary
- **Spec:** REQ-054, REQ-058
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** An account with a valid password whose stored language is, in turn: missing/NULL, the empty string, `fr`, and `EN` (upper case — not one of the two values). The test store is changed between rounds; device-EN is used so the fallback cannot be mistaken for the device default.
- **Action / input:** For each of the four rounds, sign in on device-EN and use the account: open the builder with BUILD-SIX and press Checkout.
- **Expected result:** Each time the customer signs in normally — no error, no refusal, no language question — and the app shows Indonesian, because the stored language is missing or is not one of the two allowed values. The account works: the session is valid and Checkout opens the order review. No page is blank, and no raw stored value (`fr`, `EN`, an empty string) is shown as a language anywhere.

#### TC-087 — Every pre-revision account has Indonesian when the revision is deployed
- **Type:** boundary
- **Spec:** REQ-054, REQ-059
- **Level:** API
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** A test environment with accounts that existed before the revision (*buyer1* and *buyer2* among them) and the revision deployed with its backfill.
- **Action / input:** Read every account's stored preferred language.
- **Expected result:** Every account created before the revision has the single value `id` — none is missing, NULL, empty or any other value, and none is left without a language. Signing in to one of them on a fresh device shows Indonesian (TC-086, TC-082). Accounts created after the revision hold `en` or `id` according to the switcher at sign-up (TC-081).

#### TC-088 — The stored language is exactly "en" or "id" and is never empty; anything else is refused
- **Type:** boundary
- **Spec:** REQ-058, REQ-059
- **Level:** API
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; the request the switcher sends to save the language, captured from the browser session.
- **Action / input:** Send that request with each of `en`, `id`, then each of `fr`, `EN`, `english`, the empty string and a missing field, reading the stored value after each.
- **Expected result:** `en` and `id` are accepted and stored exactly. Each of `fr`, `EN`, `english`, the empty value and the missing field is refused and does not change the stored value, which stays at its previous valid language. No account is ever stored without a language, and no value other than `en` or `id` is accepted.

#### TC-089 — Only the account's owner can change its language
- **Type:** negative
- **Spec:** REQ-060
- **Level:** API
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* and *buyer2* signed in on separate sessions, both stored Indonesian; the language-save request captured from *buyer1*'s session.
- **Action / input:** From *buyer1*'s session, alter the saved request so that it targets *buyer2*'s account (or carries *buyer2*'s account identifier if the request carries one), and send it. Then read every screen *buyer1* can reach.
- **Expected result:** The altered request is refused and *buyer2*'s stored language is unchanged; *buyer1*'s own language is unchanged too. If the request carries no account identifier, the server still changes only the session's own account and cannot be made to target another customer. No screen *buyer1* can reach lets them choose or change another customer's language, and there is no admin or back-office screen for languages. (The exact refusal code is whatever architecture.md records for the language endpoint; the case asserts the refusal and the unchanged data, which REQ-060 fixes.)

#### TC-090 — A language-change request without a valid session is refused and changes no account
- **Type:** negative
- **Spec:** REQ-060, REQ-048
- **Level:** API
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in, stored Indonesian; the captured language-save request; the session then ended by signing out, and a second credential expired server-side.
- **Action / input:** Replay the captured request with no session credential, then with the ended credential, then with the expired credential; read every account's stored language after each.
- **Expected result:** Each attempt is refused as unauthenticated — no account's language changes and no new session is created. Changing a language is a signed-in owner action, not something a request without a live session can do.

### Copy, register and unchanged data

#### TC-091 — No raw translation key or blank text appears in either language, on any page or state
- **Type:** negative
- **Spec:** REQ-049
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Seeded environment; both languages; every page and state reachable: builder empty, incomplete and complete, its loading and error states, sign in, create account, order review, confirmation, not-found, and the validation and error messages of TC-018, TC-028, TC-043, TC-061 and TC-064.
- **Action / input:** In each language, open every page and state and scan every piece of visible text.
- **Expected result:** No text is a raw translation key or identifier (for example `category.processor`, `field.password.rule`, `error.email_taken`), no label is empty, no text is missing and no control is unlabelled. This holds in both languages, in the loading, empty and error states as well as the ready ones, and on every page listed.

#### TC-092 — Both language sets are complete and no page mixes the two languages
- **Type:** positive
- **Spec:** REQ-049, REQ-017
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** no
- **Preconditions / test data:** Seeded environment; device-A; *buyer1*.
- **Action / input:** Read every page and state in Indonesian and then in English: the builder (empty, incomplete and complete), sign in, create account, order review, confirmation, not-found, the validation and error messages, the loading states and the order summary labels.
- **Expected result:** Every customer-visible string has both an English and an Indonesian version, and the version shown matches the selected language — headings and page titles, category names, buttons and links, form labels and placeholders, validation messages, error messages, empty states, loading states, and the order review, confirmation and order summary labels. No page mixes the two languages. The only intended exceptions are the two switcher labels ("English", "Bahasa Indonesia"), product, model and brand names, and the rupiah amounts, which stay the same in both (REQ-042, REQ-050).

#### TC-093 — The Indonesian copy uses the formal "Anda" register throughout
- **Type:** positive
- **Spec:** REQ-051
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** no
- **Preconditions / test data:** Both languages available; a signed-in customer; the error and empty states reachable.
- **Action / input:** Read all Indonesian copy across the builder, sign in, create account, order review, confirmation, not-found and every message.
- **Expected result:** Where the copy addresses the customer it uses "Anda" — in headings, buttons, messages, validation text, empty states and the order summary. The informal forms ("kamu", "kau", "lo") do not appear, and the register is the same everywhere rather than formal on one page and informal on another. The English copy is unaffected.

#### TC-094 — Part, model and brand names read identically in both languages
- **Type:** positive
- **Spec:** REQ-050
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Seeded catalogue; both languages; a confirmed order.
- **Action / input:** Read all 21 part names in the builder in Indonesian and in English, then the part names on the order review and on the confirmation in both languages.
- **Expected result:** Every part, model and brand name is byte-for-byte identical in both languages ("Intel Core i5-12400F", "ASUS TUF B550M-PLUS", "Kingston Fury 16GB DDR4-3200", "Samsung 980 1TB NVMe"), in the same categories and the same order. No name is translated, transliterated, reordered or dropped, and the same holds for the names recorded on the order and shown on the confirmation (REQ-057).

#### TC-095 — Prices and totals read identically in both languages
- **Type:** positive
- **Spec:** REQ-050, REQ-007
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** BUILD-MID chosen at "Rp 12.020.000"; both languages.
- **Action / input:** Read every part price and the total in Indonesian and in English.
- **Expected result:** Each price and the total are identical in both languages and use the rupiah form: "Rp " prefix, dots as thousands separators, no decimals — the total is "Rp 12.020.000" in both. No language changes the currency, the separators, the decimal places or the amount.

#### TC-096 — Validation, error and empty-state messages appear in the selected language
- **Type:** positive
- **Spec:** REQ-049
- **Level:** UI
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** Both languages; a duplicate email, a wrong password, an empty required field, an incomplete build, a failed part list and an unavailable part at confirmation all reachable.
- **Action / input:** Trigger each of those states once in English and once in Indonesian.
- **Expected result:** Each message is shown in the language selected at that moment — the missing-field message, the duplicate-email message, the generic wrong-password message, the missing-categories message, the "parts could not be loaded" message and the part-no-longer-available message. In Indonesian they are Indonesian (formal register); in English they are English. None falls back to English while the page is Indonesian, or the other way round.

### Language failure and confirmation

#### TC-097 — A page that cannot load the selected language's copy shows the Indonesian page instead
- **Type:** negative
- **Spec:** REQ-055
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** device-EN (English chosen); the browser's request for the English copy blocked; the rest of the app working.
- **Action / input:** Open the builder and the sign-in page with the English copy unavailable.
- **Expected result:** Each page renders in Indonesian — labels, messages and the switcher all present and readable — rather than blank, showing raw keys or field names, or half-filled. No error replaces the page and the customer can keep using it. When the block is lifted and the page is reloaded, English is shown again.

#### TC-098 — The confirmation is shown and re-rendered in the current language with the recorded parts and amounts unchanged
- **Type:** positive
- **Spec:** REQ-057, REQ-050
- **Level:** end-to-end
- **Priority:** P1
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; BUILD-MID submitted while the app was in Indonesian; the confirmation open at "Rp 12.020.000"; the order record readable in the test store.
- **Action / input:** Read the confirmation in Indonesian; switch to English; read it again; reload; read it again.
- **Expected result:** The confirmation opens in Indonesian, the language in use when it was opened. Switching to English re-renders its labels and text in English at once, while the ordered part and model names and the rupiah amounts stay exactly the same. The reload shows English (the current choice) with the same parts and total. The order record and the confirmation never disagree, and nothing about the order is re-translated or re-priced by the language change.

#### TC-099 — The missing-category checkout message appears in the selected language and names the categories in it
- **Type:** negative
- **Spec:** REQ-018, REQ-019, REQ-049
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** *buyer1* signed in; RAM chosen, the other five required categories empty; both languages.
- **Action / input:** Attempt to check out in English, then in Indonesian.
- **Expected result:** Each time checkout is refused and the message names the empty required categories — Processor (CPU), Motherboard, Storage (SSD), Power Supply and PC Case — in the language in use (their Indonesian names when the page is Indonesian), and does not name Graphics Card. The message is not left in the other language, and the reason is visible in both.

## Open questions for /document-preparation

None. Every expected result above follows from the merged `spec.md` v2; the two
narrow points the spec leaves open (sign-in email case-sensitivity beyond the
uniqueness rule, and whether a signed-out visitor with an incomplete build is
also prompted to sign in) are recorded in the coverage table and are
deliberately not asserted, rather than guessed.

The language cases assert the *properties* spec v2 fixes — which language,
that both copies exist, that no page mixes them, that nothing raw or blank is
shown, that the Indonesian uses "Anda", and that names and rupiah amounts are
identical — not exact Indonesian wording. Spec v2 does not dictate the
translations themselves, so a case that asserted a specific sentence would
be inventing a rule; the wording is judged by the manager against REQ-049 to
REQ-051. Two further points are implementation detail the spec leaves to
`architecture.md`, and their cases assert the outcome rather than a code: the
exact refusal code for another customer's language request (TC-089), and
whether the language save carries an account identifier at all (TC-089, TC-090).
