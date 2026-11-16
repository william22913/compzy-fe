---
feature_code: pc-builder
service: compzy
ticket_url: null
has_ui: true
app_scale: small
version: 2
status: complete
completeness:
  problem: covered
  target_user: covered
  success_criteria: covered
  non_goals: covered
  primary_flow: covered
  edge_cases: covered
  dependencies: covered
  priority: covered
  data_validation_rules: covered
  external_integrations: covered
open_questions: []
sources:
  - path: knowledge/design-reference.md
    source_version: unversioned
    note: Dribbble shot the manager supplied as the visual reference for the app; owned and read by /ui-preparation, recorded here only so later steps do not lose it.
pr_history:
  - number: 74
    url: https://github.com/william22913/sandbox-docs/pull/74
    title: "[DOC] compzy/pc-builder: initial spec for the PC part picker and checkout"
    state: merged
    version: 1
pr_url: https://github.com/william22913/sandbox-docs/pull/78
last_updated: 2026-11-16
---

# pc-builder — PC Builder (compzy)

The manager's own description of what they want, in their words: "a simple web
app where customers buy PCs by picking and combining individual components.
Keep it super simple and focused strictly on choosing parts, seeing the
combined price, and checking out — no compatibility checkers or fancy extras."
(source: manager, scoping session, 2026-11-16)

## Problem

A small computer store sells custom-built PCs, but there is no way for a
customer to put one together online. Today a customer has to come into the
store or ask staff: they cannot see which parts are on offer, cannot see what a
combination would cost, and cannot place an order outside opening hours.
Because parts are sold individually at prices the customer has to add up
themselves, nobody can tell what a whole PC will cost until someone works it
out by hand. The store also has no online record of what a customer asked for.
(source: manager, scoping session, 2026-11-16)

## Target User

Customers of one small computer store, on a desktop or mobile browser:

- **Visitors with no account** — people who want to see what the store offers
  and try putting a PC together before deciding whether to buy. They meet this
  feature on their first page load and are not asked to sign in to look around
  or to build.
- **Signed-in customers** — people who have created an account and want to
  place an order. They meet the sign-in step when they are ready to check out.

There is **no admin, staff or back-office role** in v1: parts and prices are
pre-loaded sample data, so the manager can use and test the picker immediately.
(source: manager, scoping session, 2026-11-16)

Scale, as confirmed by the manager: about 200 customers today, growing to about
2,000 within a year; up to about 10 people using the site at the same moment; a
few thousand saved builds and orders a year; one store with no branches
(single tenant); an hour of downtime costs a handful of lost sales, which is
not serious. The app is built to this size, not to enterprise scale.

## Roles and Language

- **Visitor (not signed in)**: may browse every part category, choose, swap,
  remove and skip parts, see the running total, and switch the interface
  language. May **not** check out. May create an account or sign in at any
  point.
- **Signed-in customer**: everything a visitor may do, plus checkout — review
  the build, see the final total and submit the order — and their language kept
  with their account. Sees and acts on only their own account; there is no data
  belonging to other customers that this feature exposes.
- Accounts are created by the customer on the site; there is no invitation or
  approval step.
- The interface is offered in **two languages, English and Indonesian**, with a
  language switcher on every page that changes the whole page at once. A
  first-time visitor sees Indonesian; any later visit on that device opens in
  the language last chosen there; a signed-in customer sees the language stored
  with their account. The rules are REQ-042 to REQ-060 below. Prices stay in
  Indonesian rupiah and product names stay as product names in both languages.
  (source: manager, revision brief, 2026-11-16)

## Primary Flow

- **REQ-001**: A visitor opens the app and immediately sees the builder: the
  seven part categories, each listing the parts available in that category with
  their names and prices. No sign-in prompt blocks the way.
- **REQ-002**: The seven categories are fixed and are exactly: Processor (CPU),
  Motherboard, RAM, Storage (SSD), Graphics Card, Power Supply, PC Case. No
  other category exists in v1.
- **REQ-003**: In each category the visitor chooses at most one part. Choosing
  a second part in the same category replaces the first — a build never holds
  two parts from the same category.
- **REQ-004**: A chosen part can be removed again, leaving that category empty,
  and the total adjusts accordingly.
- **REQ-005**: The app shows a running total at all times, starting at Rp 0
  before anything is chosen. It updates as soon as a part is chosen, swapped or
  removed, with no separate "recalculate" action.
- **REQ-006**: The total is the sum of the prices of the parts currently chosen.
  No tax and no shipping charge are added.
- **REQ-007**: Every price and the total are shown in Indonesian rupiah: an
  "Rp " prefix, a dot as the thousands separator, and no decimals — for
  example "Rp 12.500.000".
- **REQ-008**: Before checkout, every **required** category must hold a chosen
  part; the one **optional** category may be left empty. The required
  categories are Processor, Motherboard, RAM, Storage, Power Supply and PC
  Case. **Graphics Card is optional**, because many processors already include
  graphics, so a customer may skip it and still have a complete PC. (source:
  manager, 2026-11-16)
- **REQ-009**: A visitor can create an account from the site with their full
  name, an email address and a password, and is signed in as soon as the
  account is created. An email address identifies one account only: no two
  accounts may share one. (source: manager, 2026-11-16)
- **REQ-010**: A customer signs in with their email address and password, and
  can sign out again. Signing out ends that session on that device and no
  longer allows checkout.
- **REQ-011**: A signed-in customer stays signed in on that device across page
  reloads and browser restarts until they sign out.
- **REQ-012**: A visitor may build freely without an account. When they sign in
  or create an account, the build they already made — every chosen part and the
  total — is still there afterwards: they lose nothing, land back on the same
  build, and continue straight to checkout. (source: manager, 2026-11-16)
- **REQ-013**: A signed-in customer with a complete build can press
  "Checkout". This opens a review of the order: every chosen part grouped by
  category, each with its price, and the final total.
- **REQ-014**: Confirming on the review submits the order. The customer then
  sees a confirmation showing the parts they ordered and the final total. That
  ends the flow — there is no order-history screen and no follow-up step.
- **REQ-015**: A visitor who is not signed in and tries to check out is taken
  to sign in (or create an account), and after doing so comes back to the
  order review with the same build, ready to confirm — never to an empty picker
  and never having lost their parts.
- **REQ-016**: Every part is shown with its name and its price. The app ships
  with pre-loaded sample parts covering the seven categories — a few options in
  each, listed under "Sample Parts Catalogue" below — so the picker can be
  built and tested immediately without anyone entering data first.
- **REQ-017**: The entire interface — labels, buttons, messages and errors — is
  shown in one of the two offered languages, English or Indonesian, following
  the customer's selection as described in REQ-042 to REQ-060. No page mixes
  the two languages.

## Language

The manager's revision request, in their own words: "the app needs to switch
language, English and Indonesian, on every page." These rules replace the v1
"English only" scope; everything else about the app is unchanged and is listed
under "What this revision does not change" below. (source: manager, revision
brief, 2026-11-16)

- **REQ-042**: Every page of the app offers a language switcher, with exactly
  two choices — English and Indonesian. It is present on the builder, sign in,
  create account, order review, order confirmation and the not-found page, and
  in every loading, empty and error state of those pages. The two choices are
  labelled in their own language, "English" and "Bahasa Indonesia", in both
  languages. A visitor and a signed-in customer both see it.
  (source: manager, revision brief, 2026-11-16)
- **REQ-043**: Choosing a language changes every visible string on the page the
  customer is on, at once, without a reload they have to trigger and without
  losing anything: the chosen parts, the total, and anything typed into a form
  stay exactly as they were. (source: manager, revision brief, 2026-11-16)
- **REQ-044**: A first-time visitor — no language chosen on this device yet, not
  signed in — sees the app in **Indonesian**. The app does not guess the
  language from the browser or the country. (source: default taken for this
  revision, 2026-11-16; the manager's review of this spec is its confirmation)
- **REQ-045**: A visitor's language choice is remembered on that device: the
  next visit to the app on the same device opens in the language last chosen
  there, without asking again. (source: default taken for this revision,
  2026-11-16; the manager's review of this spec is its confirmation)
- **REQ-046**: A new account is created with the language selected in the
  switcher at the moment of sign-up: if the customer creates the account while
  the app is in Indonesian, the account's language is Indonesian, and likewise
  for English. (source: default taken for this revision, 2026-11-16; the
  manager's review of this spec is its confirmation)
- **REQ-047**: A signed-in customer sees the app in the language stored with
  their account, returned when they sign in, so the same account opens in the
  same language on a different device or browser. (source: manager, revision
  brief, 2026-11-16)
- **REQ-048**: A signed-in customer can change their language from the switcher
  on any page. The change is saved to their account there and then, applies on
  the spot, and is the language they see on their next visit and on any device.
  (source: manager, revision brief, 2026-11-16)
- **REQ-049**: Every customer-visible string exists in both English and
  Indonesian, and one language is shown at a time. This covers category names,
  headings and page titles, buttons and links, form labels and placeholders,
  validation messages, error messages, empty states, loading states, the order
  review and order confirmation labels, and the order summary labels. No page
  shows a string in the language the customer is not using, and no raw
  translation key is ever shown. (source: manager, revision brief, 2026-11-16)
- **REQ-050**: Product names stay as product names in both languages: part and
  model names (for example "Intel Core i5-12400F", "ASUS TUF B550M-PLUS") and
  brand names read exactly the same in English and Indonesian. Prices and the
  total do too — "Rp 12.500.000" in both languages, with the same rupiah
  separators and no decimals. (source: manager, revision brief, 2026-11-16)
- **REQ-051**: Indonesian copy uses the formal register, addressing the
  customer as "Anda", as is standard for Indonesian retail. The same register is
  used everywhere: headings, buttons, messages, validation text, empty states
  and the order summary. (source: default taken for this revision, 2026-11-16;
  the manager's review of this spec is its confirmation)

## What this revision does not change

The manager's revision touches language only. These v1 decisions stay exactly
as they are, and no requirement above relaxes them: (source: manager, revision
brief, 2026-11-16)

- **Seven fixed categories, six of them compulsory.** Processor (CPU),
  Motherboard, RAM, Storage (SSD), Graphics Card, Power Supply and PC Case stay
  the only categories; the first six are required for checkout and **Graphics
  Card stays optional** (REQ-002, REQ-008, REQ-038).
- **Live rupiah totals.** The running total keeps updating on every choice,
  swap and removal, as the plain sum of the chosen parts, in rupiah with no
  tax and no shipping (REQ-005, REQ-006, REQ-007).
- **No order history.** The confirmation screen remains the end of the flow;
  there is no list of past orders and no tracking (REQ-014).
- **No admin.** There is still no staff or back-office screen — not for parts
  and prices, and not for translations either (REQ-016).
- **No compatibility checking** of any kind between parts. No warnings, no
  blocks, no advice (Non-Goals).
- **No payment, no delivery details, no quantities, no saved or shared builds,
  no password reset** — all unchanged from v1 (Non-Goals).
- **Account rules unchanged**: one account per email address, the same name,
  email and password rules, and the same sign-in and sign-out behaviour
  (REQ-009 to REQ-011, REQ-032 to REQ-036).
- **The approved design stays as it is.** Only what the language needs is added
  — a switcher in each page's own style, plus the Indonesian copy. Every other
  screen, colour, layout and picture is unchanged; the screens themselves are
  `/ui-preparation`'s record, not this spec's.

## Non-Goals

- **No compatibility checking of any kind.** The app never warns, blocks or
  advises about processor socket, memory type, power draw, case clearance or
  any other fit between parts. This was explicitly excluded by the manager.
- No extras beyond the four stated features: no stock levels, no discounts or
  vouchers, no reviews or ratings, no wishlists, no comparing two builds
  side by side, no recommendations.
- No order history or order tracking for customers; the confirmation screen is
  the end of the flow.
- No admin, staff or back-office screen for adding, editing or pricing parts;
  the sample catalogue is fixed seed data in v1.
- No payment processing and no payment details are collected. "Checkout" here
  means reviewing the build and submitting the order, not paying online.
- No delivery address, contact details, collection time or shipping options
  are collected; no shipping charge is added.
- No quantities: a build holds at most one of each part, and no line-item
  quantity selector exists.
- No saved or named builds, no sharing a build by link, no customer profile
  page beyond signing in and out.
- No password reset, email verification or account recovery in v1.
- No stock or availability handling; every seeded part is always offered.
- No languages other than English and Indonesian. No third language, no
  right-to-left language, no per-page or per-string language override.
- No translation admin screen: nobody adds, edits or reviews translations in
  the app. The English and Indonesian copies are both built in.
- No automatic language detection from the browser, the country or the IP
  address; the language is the one the customer chose, or Indonesian for a
  first-time visitor.
- No translated product names, brand names or model numbers: those stay as
  written in both languages.
- No native mobile app — a browser is the only client.

## Edge Cases

- **REQ-018**: With nothing chosen the total shows Rp 0 and the app does not
  present the build as complete; an attempt to check out is refused with a
  plain message naming which required categories are still empty.
- **REQ-019**: With one or more required categories empty, checkout stays
  unavailable and the reason is always visible — the customer is never left
  guessing why the button does nothing.
- **REQ-020**: Removing the last chosen part of a required category returns the
  build to the state in REQ-018: the total drops by that part's price and
  checkout becomes unavailable again.
- **REQ-021**: A sign-in or account-creation form submitted with an empty
  required field is refused before anything is sent, with a message saying
  which field is required, and nothing the customer already typed is lost.
- **REQ-022**: A wrong email address or a wrong password shows one generic
  error that does not reveal which of the two was wrong or whether the account
  exists. The form stays usable and the email address is kept.
- **REQ-023**: Creating an account with an email address that already has an
  account is refused with a plain message that says so and offers to sign in
  instead. It never creates a second account and never reveals the password.
- **REQ-024**: A password that does not meet the rule is refused with a message
  that states the rule in plain words, before the account is created.
- **REQ-025**: If the part list cannot be loaded (the store is unreachable or
  returns an error), the app shows a clear message with a way to try again. It
  never shows a blank page, an endless loading spinner, or a stale total
  presented as current.
- **REQ-026**: If a chosen part can no longer be found when the order is
  submitted, the order is not placed; the customer is told plainly, and the
  build is returned to them to review with that part no longer offered. The
  final total is never quietly changed on the customer's behalf.
- **REQ-027**: If the signed-in session is no longer valid at the moment the
  customer confirms (for example it expired), they are taken to sign in and
  then returned to the order review with the same build, as in REQ-015. No
  order is submitted twice by this return.
- **REQ-028**: Signing out while a build is on screen leaves the build visible
  and browsable, but checkout again requires signing in (REQ-015).
- **REQ-029**: The total the customer confirms on the review screen is exactly
  the total recorded with the submitted order and shown on the confirmation;
  the app never submits an order at a different total than the one shown.
- **REQ-030**: A build with a very large number of possibilities is not a
  concern in v1 — the catalogue holds three parts per category — but the total
  must remain correct in rupiah for any combination, including the most
  expensive part in every category.
- **REQ-031**: If the customer opens the review and then goes back to change a
  part, the review and the total reflect the change when they return to it;
  nothing is ordered from an outdated build without the customer seeing the
  reviewed total first.
- **REQ-052**: When a visitor who chose a language on the device signs in, the
  language stored with their account takes over and the page switches to it.
  The account's language is the one that applies from then on, on that device
  and on any other. (source: manager, revision brief, 2026-11-16)
- **REQ-053**: Signing out leaves the language last used on that device in
  place: the customer stays in that language while browsing as a visitor, and
  is not sent back to the first-time default.
- **REQ-054**: An account created before this revision has no language yet. Every
  such account is given Indonesian when the revision is deployed, and none is
  left without one. If a stored language is ever missing or is not one of the
  two allowed values, the app shows Indonesian and still signs the customer in
  normally — the customer is never blocked from their account because of a
  language value. (source: default taken for this revision, 2026-11-16; the
  manager's review of this spec is its confirmation)
- **REQ-055**: If a page cannot load the copy for the chosen language, it shows
  the Indonesian copy — never a blank page, never raw keys or field names, and
  never a half-filled page.
- **REQ-056**: Switching the language never changes the build in any way: the
  chosen parts, the total, the customer's signed-in state and anything typed
  into a form stay as they were, and no order is submitted or changed by a
  language change.
- **REQ-057**: The confirmation page is shown in the language selected when it
  is opened and re-rendered in the current language when the customer changes
  it. What the order actually recorded — part and model names and the rupiah
  amounts — is the same in both languages and never re-translated.

## Dependencies

- **No other service and no third party.** The parts catalogue, customer
  accounts, sessions and submitted orders all belong to compzy itself. There is
  no cross-service call to wait on. (source: manager, scoping session,
  2026-11-16)
- **The sample parts catalogue must exist before the picker is usable.** v1
  ships with the fixed set of 21 sample parts and prices listed below, so the
  manager can build and test the whole flow immediately.
- **Customer accounts are created by customers on the site.** No pre-created
  accounts are needed for v1.
- **Stack and repository constraints set by the manager** (hard): a backend
  service in `compzy-be` and a separate web frontend in `compzy-fe`, both
  already existing and empty; a simple, beginner-friendly structure that can be
  explained in plain business terms and run with step-by-step instructions;
  **no nexcommon and no nexcomponent** in either repository.
- **The manager's design reference** is the Dribbble shot linked in
  `knowledge/design-reference.md`; `/ui-preparation` owns its reading and the
  screen mapping. The link is recorded here so later steps do not lose it.
- **Both language copies ship with the app.** The English and Indonesian
  strings are part of the application itself; no translation service, no
  third-party translator and no external content API is called at run time.
  (source: manager, revision brief, 2026-11-16)
- **The account language is stored with the customer's account**, so it needs
  the accounts part of compzy (REQ-009) and is available wherever the account
  is read, including at sign-in. Its shape belongs to `architecture.md`; this
  spec only states the business rule (REQ-058 to REQ-060). (source: manager,
  revision brief, 2026-11-16)

## Priority

The first pass covered the whole of Primary Flow and Edge Cases of the app
itself: browsing and building without an account (REQ-001 to REQ-007, REQ-012,
REQ-016), the required-category rule (REQ-008), account creation, sign-in and
sign-out (REQ-009 to REQ-011), the review-and-submit checkout (REQ-013 to
REQ-015), and the error and recovery behaviour (REQ-018 to REQ-031).

The revision in this pass adds **English and Indonesian with a switcher on
every page**, in full: the switcher and its behaviour on every page and state
(REQ-042, REQ-043), Indonesian as the first-time default, the choice remembered
on the device, the language stored with the account at sign-up and returned at
sign-in, and changing it while signed in (REQ-044 to REQ-048), the copy rules
for both languages including the formal register (REQ-049 to REQ-051), the
language edge cases (REQ-052 to REQ-057) and the stored-language rules
(REQ-058 to REQ-060). Nothing in this revision is deferred: the manager asked
for the switch on every page, and every page gets it.

Explicitly deferred to a later pass, if the manager ever asks for it:
- Compatibility checking between parts.
- Stock levels, discounts and vouchers.
- Order history, order tracking and cancellation.
- Payment online.
- An admin screen for managing parts and prices, or for managing translations.
- Saved, named or shared builds.
- Languages beyond English and Indonesian, and a native mobile app.

This is the entire v1 app; there is no second feature code in this pass.

## Success Criteria

Each criterion is directly testable as a pass/fail case by
`/testcase-generation`.

- **SC-001** (REQ-001, REQ-002): A first-time visitor with no account opens the
  app and sees the seven part categories — Processor (CPU), Motherboard, RAM,
  Storage (SSD), Graphics Card, Power Supply, PC Case — each with its parts and
  prices, and a total of Rp 0, without any sign-in prompt.
- **SC-002** (REQ-003, REQ-005, REQ-006): Choosing one part in each category
  makes the displayed total equal the sum of those prices; swapping a part in
  one category changes the total by exactly the price difference, immediately.
- **SC-003** (REQ-004): Removing a chosen part clears that category, subtracts
  its price from the total, and leaves the other choices untouched.
- **SC-004** (REQ-007): Every price and the total appear in the form
  "Rp 12.500.000" — "Rp " prefix, dot thousands separators, no decimals — and a
  build totalling twelve million five hundred thousand rupiah reads exactly
  "Rp 12.500.000".
- **SC-005** (REQ-006): A build's total contains no tax line and no shipping
  line, and equals the sum of its parts with nothing added.
- **SC-006** (REQ-008, REQ-018, REQ-019): With any required category empty,
  checkout is refused and the message names the empty categories; once every
  required category is filled, checkout becomes available.
- **SC-007** (REQ-009, REQ-010): A visitor creates an account with a name, email
  address and password and is signed in; after signing out, the same email
  address and password sign them in again.
- **SC-008** (REQ-011): A signed-in customer who reloads the page and restarts
  the browser is still signed in and can check out without signing in again.
- **SC-009** (REQ-012): A visitor builds a PC, signs in (or creates an account),
  and every part and the total are still exactly as they were.
- **SC-010** (REQ-013): Pressing "Checkout" as a signed-in customer with a
  complete build opens a review listing every chosen part by category with its
  price and the final total.
- **SC-011** (REQ-014): Confirming the review shows a confirmation containing
  the ordered parts and the final total, and no further action is required.
- **SC-012** (REQ-015): A visitor who is not signed in and tries to check out is
  sent to sign in and, after signing in, lands back on the order review with the
  same build and total.
- **SC-013** (REQ-016): All 21 seeded parts appear in their categories with
  names and prices, and every one of the seven categories offers at least three
  choices.
- **SC-014** (REQ-017): Every label, button, message and error appears in the
  currently selected language — English or Indonesian — and never in a third
  language, with no page mixing the two.
- **SC-015** (REQ-021, REQ-022, REQ-023, REQ-024): Empty fields, a wrong
  password, an already-registered email address and a too-short password are
  each refused with a plain, distinct message, and none of them creates a
  duplicate or unintended account. The message is in the language the customer
  is using.
- **SC-016** (REQ-025): When the part list cannot be loaded, the app shows an
  error message with a retry action instead of a blank page or a spinner.
- **SC-017** (REQ-029): The total on the review screen, the total stored with
  the submitted order and the total on the confirmation are identical.
- **SC-018** (REQ-042): A switcher offering exactly "English" and "Bahasa
  Indonesia" is visible and usable on the builder, sign in, create account,
  order review, order confirmation and not-found page — and in the loading,
  empty and error state of each — to both a visitor and a signed-in customer.
- **SC-019** (REQ-043, REQ-044): A first-time visitor on a fresh device sees the
  app in Indonesian. Choosing English changes every visible string on that page
  immediately, while the chosen parts, the total and anything typed in a form
  stay exactly as they were.
- **SC-020** (REQ-045): A visitor who chooses English, then reloads and restarts
  the browser, finds the app still in English without choosing again.
- **SC-021** (REQ-046, REQ-047, REQ-048): Creating an account while the app is
  in English stores English with that account; signing in on another browser or
  device shows the app in English; changing the language while signed in applies
  at once and is what that account shows after signing out and back in.
- **SC-022** (REQ-049, REQ-050, REQ-051): Every customer-visible string on every
  page has both an English and an Indonesian version; part and brand names read
  identically in both; prices read "Rp 12.500.000" in both; the Indonesian copy
  addresses the customer as "Anda" throughout.
- **SC-023** (REQ-052, REQ-053, REQ-054): Signing in while the device is set to
  English on an account stored as Indonesian switches the app to Indonesian;
  signing out leaves Indonesian on that device; an account whose stored language
  is missing or invalid is shown in Indonesian and still signs in normally.
- **SC-024** (REQ-055, REQ-056, REQ-057): Switching the language never changes
  the chosen parts, the total or the signed-in state and never submits an order;
  if a language's copy cannot be loaded the page shows Indonesian rather than a
  blank page or raw keys; the confirmation re-renders in the chosen language
  while its recorded parts and amounts stay identical.

Business metric: none, because the manager set no separate business goal (such
as a conversion target) for v1 beyond these acceptance criteria.

## Data Validation Rules

Business rules only — how they are enforced is `/code-preparation`'s and
`/go-dev`'s concern. All the account and build rules below were confirmed by
the manager on 2026-11-16.

- **REQ-032**: An email address is required to create an account or to sign in.
  Surrounding spaces are ignored. It must be a syntactically valid email
  address, and at most 254 characters long. (source: manager, 2026-11-16)
- **REQ-033**: An email address identifies one account: no two accounts may
  share one, compared case-insensitively. Creating a second account with the
  same address is refused (REQ-023). (source: manager, 2026-11-16)
- **REQ-034**: A full name is required to create an account, is 2 to 100
  characters long after trimming, and is displayed to the customer as typed.
  (source: manager, 2026-11-16)
- **REQ-035**: A password is required to create an account and is 8 to 128
  characters long, with at least one letter and at least one number. Case,
  spaces and every other character are taken exactly as typed — nothing is
  trimmed or case-folded. (source: manager, 2026-11-16)
- **REQ-036**: Signing in takes the email address and the password. Repeated
  failed attempts do not lock the account in v1; the customer may try again
  immediately. (source: manager, 2026-11-16)
- **REQ-037**: A build contains at most one part per category, and a part can
  only be chosen in its own category. A category holds either exactly one part
  or none. (source: manager, 2026-11-16)
- **REQ-038**: To check out, every required category holds exactly one chosen
  part and the optional category may hold one or none. Processor, Motherboard,
  RAM, Storage, Power Supply and PC Case are required; Graphics Card is
  optional. (source: manager, 2026-11-16)
- **REQ-039**: A part's name is required, is unique within its category, and is
  1 to 100 characters long. A part's price is a whole number of rupiah greater
  than zero; prices carry no decimals and no currency other than rupiah exists
  in v1. These rules apply to the seeded catalogue; no person enters them on
  the site in v1.
- **REQ-040**: The order total is the sum of the chosen parts' prices at the
  moment of confirmation, with no tax, discount or shipping adjustment, and it
  must equal the total shown on the review screen (REQ-029).
- **REQ-041**: The submitted order records the parts as they were at
  confirmation — part name and the price each was shown at — so the
  confirmation and the store's record of the order never disagree with what the
  customer saw.
- **REQ-058**: An account's preferred language is a two-value field: **English
  (`en`)** or **Indonesian (`id`)**. Exactly those two values are accepted;
  nothing else is a valid language, and the value is never empty for an account.
  (source: manager, revision brief, 2026-11-16)
- **REQ-059**: Every account carries a preferred language from the moment it is
  created: a new account takes the language selected in the switcher at sign-up
  (REQ-046), and an account can never be stored without one. Accounts that
  existed before this revision are given Indonesian when it is deployed
  (REQ-054). The language is returned with the account whenever the customer
  signs in, so the app can show it without asking again. (source: manager,
  revision brief, 2026-11-16)
- **REQ-060**: An account's preferred language can be changed only by that
  signed-in customer, for their own account, from the language switcher
  (REQ-048). No one can change another customer's language and there is no
  admin screen for it; a request to change someone else's language is refused.
  (source: manager, revision brief, 2026-11-16)

## External Integrations

None, because there is no other service and no third-party API in this feature.
The parts catalogue, customer accounts, sessions and submitted orders are all
served by compzy's own backend, and the browser talks only to compzy. The
English and Indonesian copies are bundled with the application, so no
translation service or external content API is called either (Dependencies).
There is no contract to obtain, and nothing here is inferred from a service
name.

## Sample Parts Catalogue

Pre-loaded sample data, as the manager asked, so the picker can be built and
tested immediately. Three options per category, rupiah prices with no
decimals. The prices are realistic sample values, not a live price list; they
can be changed later without affecting any rule in this spec.

| Category | Part | Price |
|---|---|---|
| Processor (CPU) | Intel Core i3-12100F | Rp 1.350.000 |
| Processor (CPU) | Intel Core i5-12400F | Rp 2.150.000 |
| Processor (CPU) | AMD Ryzen 5 5600 | Rp 1.850.000 |
| Motherboard | ASRock H610M-HDV | Rp 1.050.000 |
| Motherboard | MSI B660M-A PRO | Rp 1.750.000 |
| Motherboard | ASUS TUF B550M-PLUS | Rp 2.100.000 |
| RAM | Kingston Fury 8GB DDR4-3200 | Rp 350.000 |
| RAM | Kingston Fury 16GB DDR4-3200 | Rp 620.000 |
| RAM | Corsair Vengeance 32GB DDR4-3600 | Rp 1.250.000 |
| Storage (SSD) | Kingston NV2 500GB NVMe | Rp 480.000 |
| Storage (SSD) | Samsung 980 1TB NVMe | Rp 950.000 |
| Storage (SSD) | WD Black SN770 2TB NVMe | Rp 1.850.000 |
| Graphics Card | ASUS Dual RTX 3050 8GB | Rp 3.100.000 |
| Graphics Card | Sapphire Pulse RX 6600 8GB | Rp 3.450.000 |
| Graphics Card | Gigabyte RTX 4060 8GB | Rp 4.250.000 |
| Power Supply | Corsair CV550 550W | Rp 650.000 |
| Power Supply | Cooler Master MWE 650 Bronze | Rp 850.000 |
| Power Supply | Seasonic Focus GX-750 750W | Rp 1.450.000 |
| PC Case | Cube Gaming Nerva M-ATX | Rp 350.000 |
| PC Case | Aerocool Hive-G | Rp 550.000 |
| PC Case | NZXT H5 Flow | Rp 1.450.000 |

A complete build using the mid-range option in every category (Intel Core
i5-12400F, MSI B660M-A PRO, Kingston Fury 16GB, Samsung 980 1TB, Gigabyte
RTX 4060, Cooler Master MWE 650, NZXT H5 Flow) totals Rp 12.020.000, which the
app must display as "Rp 12.020.000".

## Knowledge sources

- `knowledge/design-reference.md` — the Dribbble shot the manager supplied as
  the visual reference the app must match. Read and mapped by
  `/ui-preparation`, which owns `UIMap.md` and `DesignBrief.md`; recorded here
  so later steps do not lose the link.

## Feedback responses

None yet.
