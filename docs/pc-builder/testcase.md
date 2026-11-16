---
feature_code: pc-builder
service: compzy
version: 1
status: complete
spec_version: 1
open_questions: []
pr_url: https://github.com/william22913/sandbox-docs/pull/75
last_updated: 2026-11-16
---

# pc-builder — PC Builder (compzy) — test design

Black-box test design derived from the merged `spec.md` v1 (PR #74, merged
into `sandbox-docs` `main` on 2026-11-16) together with the merged `PRD.md`
and `AppFlow.md` (both `spec_version: 1`). `knowledge/design-reference.md` is
the manager's visual reference and is owned by `/ui-preparation`; it is not
used here for behaviour.

Every case below states observable behaviour and an expected result that
follows from the approved documents. No case has been executed, and no
implementation exists yet (`compzy-be` and `compzy-fe` are empty at the time
of writing) — this document defines the cases that `/go-dev` and `/fe-dev`
will execute.

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

**Environment controls.** Block or restore the request the builder makes to
load the part list; stop and restart reading the catalogue; withdraw one part
from the seeded catalogue between review and confirmation; expire a signed-in
session server-side; keep a persistent browser profile between runs for the
browser-restart case.

**App defaults.** The only roles in v1 are *visitor* (signed out) and
*signed-in customer*; there is no admin, staff or back-office role and no
permission hierarchy, so there is no `<parent>:all` grant to test. The one
protected action is checkout: a visitor is sent to sign in instead of being
refused with an error message, exactly as REQ-015 states (TC-050, TC-053,
TC-062 cover the server-side side of that boundary). No owner-scoped record is
exposed by this feature — a customer sees only their own confirmation and
account, and there is no order list (TC-063). The interface offers
exactly one language, English (TC-067, TC-068). `app_scale` is `small`, so the
suite adds no pagination, rate-limit or replica-failover cases; the 21-part
catalogue is expected to fit on one page (TC-003).

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
| REQ-017 | Entire interface in English | TC-067, TC-068 | — |
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
| SC-014 | Every label, button, message and error is English | TC-067, TC-068 |
| SC-015 | Empty fields, wrong password, duplicate email and too-short password each get a plain, distinct message and create no bad account | TC-025 to TC-029, TC-043 |
| SC-016 | Part-list failure shows a message with retry, not a blank page or spinner | TC-064, TC-065 |
| SC-017 | Review total, recorded total and confirmation total are identical | TC-057 |

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
  shared builds, no password reset, no second language, no native app** — the
  absence of each is recorded here as a scope decision; none has specified
  rejection behaviour to test, and the suite does not pad itself with
  speculative absence checks beyond the ones above.

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

#### TC-067 — Every screen, label, button, message and error is in English
- **Type:** positive
- **Spec:** REQ-017
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** no
- **Preconditions / test data:** Seeded environment; a visitor and a signed-in customer; the error states of TC-018, TC-028, TC-043, TC-064 and TC-061 reachable.
- **Action / input:** Visit the builder, sign-in, create-account, order review, confirmation and each error state, and read every piece of text.
- **Expected result:** All headings, category and part labels, buttons, placeholders, validation messages, error messages, the review and the confirmation are in English. There is no language switch, locale selector or translated variant anywhere, and prices remain in rupiah even though the copy is English.

#### TC-068 — Server-side refusals reach the customer as plain English sentences
- **Type:** positive
- **Spec:** REQ-017, REQ-022
- **Level:** UI
- **Priority:** P2
- **Automation candidate:** yes
- **Preconditions / test data:** Seeded environment; a signed-in customer and a duplicate email.
- **Action / input:** Trigger each refusal that is decided by the backend: duplicate email at sign-up, wrong password at sign-in, and an expired session at confirmation.
- **Expected result:** Each is shown to the customer as the same plain English sentence the backend returned, not as a code, an empty box, a browser alert or a raw technical message. The wording is distinct per cause where the spec requires it: duplicate email says an account exists and offers sign-in, while the wrong-password and expired-session cases never reveal whether the account exists.

## Open questions for /document-preparation

None. Every expected result above follows from the merged `spec.md` v1; the two
narrow points the spec leaves open (sign-in email case-sensitivity beyond the
uniqueness rule, and whether a signed-out visitor with an incomplete build is
also prompted to sign in) are recorded in the coverage table and are
deliberately not asserted, rather than guessed.
