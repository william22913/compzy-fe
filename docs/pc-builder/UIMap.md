---
feature_code: pc-builder
service: compzy
version: 2
status: complete
spec_version: 1
figma_files: []
design_reference:
  kind: image
  url: https://cdn.dribbble.com/userupload/43403242/file/original-708542cd685749a65c7cc57e6bcc4888.jpg?resize=1504x4649&vertical=center
  supplied: 2026-11-16
completeness:
  scope_confirmed: covered
  requirement_mapping: covered
  page_inventory: covered
  navigation: covered
  content_and_fields: covered
  states: covered
  interactions: covered
  motion: covered
  responsive: covered
  design_tokens: covered
  components: covered
  assets: covered
open_questions: []
derived_confirmed: null
pr_history:
  - number: 77
    url: https://github.com/william22913/sandbox-docs/pull/77
    title: "[UI] compzy/pc-builder: clickable design mock, UI map and design brief"
    state: open
pr_url: https://github.com/william22913/sandbox-docs/pull/77
last_updated: 2026-11-16
---

# UI Map — pc-builder

compzy sells custom PCs assembled part by part. The interface is a warm paper catalogue with
Didone display type, one vermilion accent, square corners, hairline rules and a single photograph
carrying each region — the visual language of the manager's Dribbble reference, applied to a
builder instead of a clothing shop. There is no Figma file: the design **is** the clickable mock in
`ui/mock/`, and this map is its source of truth. Requirements live in `spec.md` v1; this file never
restates them, it says where each one appears and what it looks like.

The mock: `ui/mock/index.html#<screen id>` — one screen per page state — plus `ui/mock/app.css`,
`ui/mock/mock.js`, `ui/mock/screens.json` (the screen list `/ui-preview` reads) and
`ui/mock/assets/`.

## Figma sources

No Figma file exists for this feature. The manager supplied one Dribbble shot as the design
reference; it is the visual truth and the mock is the artifact the review reads.

| File | URL | Version / last modified | Used for |
|---|---|---|---|
| Styleco boutique template (Dribbble shot, JPG, 1504 × 4649) | https://cdn.dribbble.com/userupload/43403242/file/original-708542cd685749a65c7cc57e6bcc4888.jpg?resize=1504x4649&vertical=center | unversioned; supplied 2026-11-16 | Visual language only: paper canvas, Didone headline with a vermilion disc behind one word, edge-to-edge product photograph, tilted two-strip ribbon seam, hairline facts strip, photo product cards, turning seal, dark footer |

The reference is a clothing boutique. Its content is not compzy's: the copy, the seven categories,
the 21 parts, the prices and every control are the product's own. What is carried over is the
visual language listed in the table and itemised in **Reference scenes**.

Tags used throughout: `derived` = visible in the reference or mechanically required by the spec;
`assumed` = a design decision of this pass that is not in the reference and that the manager has not
yet seen in `/ui-preview`. When the manager approves the design, the `assumed` rows become
`designer` and `derived_confirmed` gets that date.

## Reference scenes

Nine regions of the reference, and what each one became in the mock.

| # | Reference scene | What it gives | Where it lands in the mock |
|---|---|---|---|
| S1 | Header: vermilion disc mark, wordmark in lowercase, two small-caps nav links left, search / account / cart icons right | Hairline-underlined top bar, generous side gutters, small-caps links with a marked current page | `HDR` on every screen. The icons are dropped (no search, no cart in this feature) and replaced by the one account action the spec needs: Sign in / Sign out, plus Order review when signed in |
| S2 | Hero: three-line Didone headline ("VINTAGE CLOTH COLLECTION") set across a full-bleed photo, a vermilion disc behind the word `VINTAGE`, a clothes rail of garments | The fold: photograph one side, enormous serif headline the other, one disc behind a single word | `HERO`. Headline "Build your own **PC**" with the disc behind `PC`; the photo is a motherboard in a case, mid-build, edge to edge in its panel, with a small caption |
| S3 | Ribbon seam: a black marquee strip and a blush strip, both tilted a few degrees, crossing the fold, phrases separated by four-point stars | A seam between hero and content; two strips that stay parallel | `RIBBONS`. One rotated wrapper holds both strips (they can never cross each other), infinite drift, `aria-hidden` because the phrases repeat content that is on the page |
| S4 | Editorial split: photo left, headline + short paragraph + dark button right, a circular seal with type on a path turning near the button | A two-column body with an asymmetric weight and one quiet ornament | `SPLIT` on Sign in and Create account (mirrored); `SEAL` in the order review's aside and on its variants |
| S5 | "New Arrivals": four photo cards, each with a small pill button over the image and a name + price footer strip, one card flashing SALE | Product cards with the price on the card, not in a list | `PART` card: plate number, part name, rupiah price and one `Choose` / `Remove` control; the photograph lives on the category's 136 px plate instead, chosen state framed with an inset rule |
| S6 | "Just For You" heading with an oval number badge (`03`) above it | Oval numbering as a section marker | `PLATE` (oval `01`–`07` on each category plate) and the review's oval total badge |
| S7 | "Casual Collection": light block with eyebrow, heading, two overlapping photos and a full-width bordered button; a dark half with a large group photo | A bordered full-width secondary button; a light/dark page pair | `.btn--ghost` (bordered, full width) and the order confirmation page, which is drawn on night |
| S8 | Four-cell facts strip in a hairline grid | A facts strip that states the product's rules as numbers | `FACTS`: "Seven part categories", "Six required, one optional", "Rp 0 where the total starts", "Rp 12.020.000 a complete mid-range build" |
| S9 | Dark footer: quick links column beside a small photo, "let's start a project" headline and an address, credits line, bottom bar with links and BACK TO TOP | The night closing block | `FTR`: wordmark, one-line note, quick links, a Didone headline "Pick the parts. Watch the total. Order it.", a photo, and a bottom bar |

## Requirement mapping

Every active `REQ-*` in `spec.md` v1 appears here. There is no Figma file, so **screen** holds the
mock screen id (`ui/mock/index.html#<id>`). `derived` / `assumed` as defined above.

| REQ | Requirement (short) | Page | Screen | Source | Notes |
|---|---|---|---|---|---|
| REQ-001 | Visitor opens the app and sees the builder | Builder | `#builder-empty` | derived | The route `/` is the builder, not a landing page: hero, facts, all seven categories |
| REQ-002 | Seven fixed categories | Builder | `#builder-empty` | derived | CPU, Motherboard, RAM, Storage (SSD), Graphics Card, Power Supply, PC Case, in that order, each a `CAT` section with a plate numbered 01–07 |
| REQ-003 | At most one part per category; choosing replaces | Builder | `#builder-partial` | derived | Every card carries one control; choosing a second part in a category clears the first |
| REQ-004 | A chosen part can be removed | Builder | `#builder-partial`, `#builder-signed-in` | derived | The card control reads `Remove`, and the panel row carries its own `Remove` button |
| REQ-005 | Running total at all times, from Rp 0 | Builder | `#builder-empty`, `#builder-partial` | derived | The same figure in up to three places at once: hero "Total so far", the `PANEL` total and, below 1000 px, the build bar |
| REQ-006 | Total is the sum of chosen prices, no tax, no shipping | Builder | `#builder-partial` | derived | Panel fine print: "No tax and no shipping. Prices in Indonesian rupiah." |
| REQ-007 | Rupiah formatting with `.` thousand separators | All pages | `#builder-partial` | derived | `RP` figures in tabular Didone: "Rp 2.150.000" |
| REQ-008 | Required categories must be filled before checkout | Builder | `#builder-checkout-refused` | derived | Error notice names the empty categories and restates that the graphics card is optional; checkout stays a live control that explains itself (REQ-019) |
| REQ-009 | Create an account with name, email, password | Create account | `#signup-default` | derived | `SPLIT` page, mirrored from Sign in: photograph left, form right on desktop, and the form first on a narrow screen |
| REQ-010 | Sign in with email and password | Sign in | `#signin-default` | derived | Same split layout; two fields, one primary |
| REQ-011 | Session persists on the device | Builder | `#builder-signed-in` | assumed | Persistence has no surface of its own; it shows as the header greeting `Rina` and the `Sign out` action instead of `Sign in` |
| REQ-012 | Build survives signing in or creating an account | Sign in, Create account | `#signin-default`, `#signup-default` | derived | Info notice above the form: "Your build is saved." — "7 parts, Rp 12.020.000. It comes back with you after you sign in." (…after you create your account, on the sign-up screen) |
| REQ-013 | Signed-in customer with a complete build presses Checkout → review | Order review | `#review-default` | derived | The review lists all seven rows, the final total and two actions |
| REQ-014 | Confirming places the order and shows a confirmation | Order confirmation | `#confirm-default` | derived | Night page: "Order placed", reference `CZ-1042`, date, part count, and the line that no payment was taken |
| REQ-015 | A guest who checks out is taken to sign in, then on to the review | Builder, Sign in | `#builder-complete`, `#signin-default` | derived | As a guest the panel's Checkout points at Sign in; the build is intact on arrival |
| REQ-016 | Every part shows its name and its price; 21 seeded parts | Builder | `#builder-empty` | derived | Three parts in each of the seven categories, name + rupiah price on every card |
| REQ-017 | Entire interface in English | All pages | `#builder-empty`, `#signin-default`, `#signup-default`, `#review-default`, `#confirm-default` | derived | No Indonesian UI string anywhere; `id`/`Rp` appear only as currency and reference values |
| REQ-018 | Nothing chosen → Rp 0, not complete | Builder | `#builder-empty` | derived | Total Rp 0 in three places, count "0 of 7 chosen", need line listing all six required categories |
| REQ-019 | Checkout stays visible and says what is missing | Builder | `#builder-checkout-refused` | derived | The control is never disabled; pressing it shows the reason in an error notice and the need line already states it before the press |
| REQ-020 | Removing the last part of a required category returns to the empty state | Builder | `#builder-empty` | derived | Runtime behaviour of `mock.js`: the total recomputes and the screen in this state is `#builder-empty` |
| REQ-021 | Empty sign-in / sign-up fields are refused with a message per field | Sign in, Create account | `#signin-validation`, `#signup-validation` | derived | Three field errors on sign-up, two on sign-in, each under its own input with `aria-invalid` and a link from the summary |
| REQ-022 | Wrong email or password → one generic message | Sign in | `#signin-invalid` | derived | One error notice for the pair: "The email address or password is not correct." No field is named |
| REQ-023 | Creating an account with an existing email is refused | Create account | `#signup-duplicate` | derived | Error under the email field: "This email address already has an account. Sign in instead, or use another address." — the words "Sign in instead" are a link to Sign in |
| REQ-024 | Password that breaks the rule is refused | Create account | `#signup-password` | derived | Email field error: "Use 8 to 128 characters, with at least one letter and one number." |
| REQ-025 | Part list cannot be loaded → message and a retry | Builder | `#builder-loading`, `#builder-error` | derived | Skeleton plates and rows while loading; error notice with `Try again` on the failed screen, hero and facts still drawn |
| REQ-026 | A chosen part no longer exists at submit → says so, asks for another | Order review | `#review-part-gone` | derived | The row is marked `No longer available`, the total drops to Rp 11.400.000 and the only action becomes "Choose another RAM" |
| REQ-027 | Session invalid at confirm → sign in again, same build | Order review, Sign in | `#review-session-expired`, `#signin-session-expired` | derived | Review shows "Your session has ended." with `Sign in again`; the sign-in page repeats the notice so the reason survives the redirect |
| REQ-028 | Signing out leaves the build visible, checkout asks for sign-in | Builder | `#builder-signed-out` | derived | Info notice "You are signed out." above the categories; the build and total are unchanged |
| REQ-029 | The total confirmed equals the total reviewed | Order review, Order confirmation | `#review-default`, `#confirm-default` | derived | Both read Rp 12.020.000, and the review's aside says "This is the total that will be recorded with the order." |
| REQ-030 | Any combination produces a correct total | Builder | `#builder-complete` | assumed | Shown by one worked example — the mid-range build at Rp 12.020.000 — because the rule has no screen of its own |
| REQ-031 | Change a part after opening the review | Order review | `#review-default` | derived | Secondary action "Change a part" returns to the builder with the build intact |
| REQ-032 | Email address required to sign in or create an account | Sign in, Create account | `#signin-default`, `#signup-default` | derived | `type="email"`, `required`, labelled "Email address" |
| REQ-033 | An email address identifies one account | Create account | `#signup-duplicate` | derived | The duplicate-email state is the visible half; the uniqueness rule itself is server-side |
| REQ-034 | Full name required, 2 to 100 characters | Create account | `#signup-validation`, `#signup-default` | derived | Empty-name error "Enter your full name."; the field is labelled "Full name" and the rules are carried by validation, not by a counter |
| REQ-035 | Password 8 to 128 characters with a letter and a number | Create account | `#signup-default`, `#signup-password` | derived | Hint under the field on the default screen: "At least 8 characters, with at least one letter and one number." |
| REQ-036 | Sign-in takes email + password; repeated failures do not lock | Sign in | `#signin-invalid` | derived | The generic error keeps the form usable and offers no lockout copy; there is no attempt counter in the design |
| REQ-037 | Build holds at most one part per category, removable | Builder | `#builder-partial` | derived | The chosen card is framed with an inset rule and its control reads `Remove`; a sibling card in the same category is always "Choose" |
| REQ-038 | Checkout requires exactly one part in every required category | Builder | `#builder-checkout-refused` | derived | Same surface as REQ-008; the graphics card is tagged `Optional`, the other six `Required` |
| REQ-040 | Order total is the sum of chosen prices at confirmation, equal to the review total | Order review | `#review-default` | derived | Seven rows, each price, and the sum as `Final total` in the order card |
| REQ-041 | The order records the parts as they were at confirmation | Order confirmation | `#confirm-default` | assumed | The confirmation reports the order reference, the date and the part count; the recorded rows themselves are server data, not a screen |

### Requirements without UI

| REQ | Why it has no screen |
|---|---|
| REQ-039 | Rules on the seeded catalogue (a part's name is required, unique within its category, and the catalogue is the store's). There is no admin surface in this feature — the spec's Non-Goals exclude one — so the rules are enforced by the seed data and checked in `testcase.md`, never typed by a person in the UI |

### Frames without a requirement

Reference elements deliberately **not** carried, because no `REQ-*` asks for them.

| Reference element | Decision |
|---|---|
| Search, account and cart icons in the header | No search, no cart and no basket exists in this feature; only the account action is drawn |
| "COLLECTION / ABOUT" nav, "VINTAGE CLOTH COLLECTION", "PRE SPRING COLLECTION", "New Arrivals", "Just For You", "Casual Collection", "let's start a project" | Boutique copy; every string in the mock is compzy's own |
| "ADD TO CARD" pill over the photo, `SALE` flash, sale prices with struck-through originals | The builder has one price per part and no promotions; the card control is `Choose` / `Remove` |
| Instagram and Facebook links, newsletter, "ELEGANT@2022 RIGHTS RESERVED", BACK TO TOP | No social, marketing or newsletter scope; the footer bottom bar carries compzy's own links |
| Four shipping promises ("Free Delivery / Free Returns / …") | The facts strip keeps the layout but states the builder's own rules instead |
| Garment photography | Replaced by hardware photography; the photographs are licensed stand-ins (see **Assets**) |

## Pages

Five pages, one route each. Every page state is one screen in `ui/mock/index.html`, and
`ui/mock/screens.json` lists them in order for `/ui-preview`.

### Builder `/`

**Purpose.** The product: choose one part in each of seven categories, watch the total, and start
checkout. A visitor can do all of it before creating an account.

**Roles.** Visitor (not signed in) and customer (signed in). Nothing on this page is restricted.

**Entry.** `/` itself; the brand mark; the footer's "Build a PC"; "Change a part" from the order
review; "Sign in again" from the review's ended-session state.

**Exit.** `Checkout` → Sign in (visitor, build complete), → Order review (customer, build complete),
→ this page with the refusal notice (required category empty). `Sign in` in the header →
Sign in. `Sign out` → this page, signed out.

**Content and fields.**

| Region | Content | Notes |
|---|---|---|
| Header | Brand disc + `compzy`, `Build`, `Order review` (signed in only), `Sign in` or `Sign out`, first name when signed in | Shared chrome, injected by `mock.js` |
| Hero | Eyebrow "Custom PCs, built part by part"; H1 "Build your own PC" (disc behind `PC`); one-line description; "Total so far" + live amount; a bordered `Start choosing` | The amount is the same figure as the panel total. The control reads `Keep choosing` once a part is chosen, `-` and no control while the catalogue is loading, and `-` with `Try again` when it failed. The photograph is a motherboard seated in a case mid-build, captioned "A build in progress, one part at a time" |
| Ribbons | Two tilted strips: "Seven categories · One part each · The total updates as you choose · No account needed to start" and "21 parts in the catalogue · Prices in rupiah · No tax, no shipping" | Decorative, `aria-hidden` |
| Facts strip | Seven / Six / Rp 0 / Rp 12.020.000, each with its caption: "part categories", "required, one optional", "where the total starts", "a complete mid-range build" | States the rules of the page before the catalogue |
| Category section (×7) | Plate photo + oval number `01`–`07`; Didone title; `Required` tag (six) or `Optional` tag (one); part count; one-line note | No anchor ids: 23 screens share one document, so a per-category id would repeat. The hero's control scrolls to the first category in script instead |
| Part card (×21) | Plate number "Part 01/02/03", part name, rupiah price, one control that reads `Choose` or `Remove` | No photograph on the card: the category's 136 px plate carries the image, and the card stays type, price and one control. The chosen card is framed with a 1 px inset rule and carries no extra label, so its state is not said twice. Prices are the seeded catalogue in `spec.md` |
| Build panel | Head "Your build" + "N of 7 chosen"; seven category rows (part name + price, or "Not chosen yet" + `-`); `Total`; need line; `Checkout`; fine print | Sticky on desktop, capped at `calc(100dvh - 128px)`, with the head, total, need line and `Checkout` pinned and only the seven rows scrolling |
| Mobile build bar | `Total` + amount + a `Your build` toggle | Below 1000 px only. It carries no `Checkout`: checkout lives in the sheet it opens |
| Footer | Wordmark, note, quick links, headline, photo, bottom bar | Shared chrome; the link set follows the session (visitor: Sign in + Create an account; customer: Review your order) |

**Actions.**

| Action | Trigger | Result |
|---|---|---|
| Choose a part | `Choose` on a card | That card becomes the category's chosen part (any other is cleared), the total rises by its price, the panel row and count update, the control becomes `Remove` |
| Remove a part | `Remove` on a card, or `Remove` on a panel row | The category empties, the total drops by that price, the card control returns to `Choose` |
| Checkout | `Checkout` in the panel | Required category empty → refusal notice on this page; visitor → Sign in; customer → Order review |
| Start choosing | The hero control (a button, not a link) | Scrolls to the first category; the label is `Keep choosing` when a part is already chosen |
| Try again | The hero control and the notice action on the failed screen | Reloads the catalogue (the mock returns to `#builder-empty`) |
| Sign out | Header `Sign out` | The same build, signed out, with the "You are signed out." notice |
| Open the build sheet (mobile) | `Your build` in the build bar | Shows the panel over the page and reports it with `aria-expanded="true"`; the toggle then reads `Close` |

**States.**

| State | Screen | What changes |
|---|---|---|
| Empty | `#builder-empty` | Rp 0, "0 of 7 chosen", seven "Not chosen yet" rows, need line lists all six required categories, Checkout leads to the refusal |
| Partly chosen | `#builder-partial` | Three parts chosen (CPU, Motherboard, Storage), total Rp 4.520.000, four rows still empty, need line names those four |
| Complete, visitor | `#builder-complete` | All seven chosen, Rp 12.020.000, need line reads "Every required category is filled. The graphics card is optional.", Checkout leads to Sign in |
| Complete, customer | `#builder-signed-in` | Same build, header shows `Rina` and `Sign out`; Checkout leads to the order review |
| Signed out with a build | `#builder-signed-out` | Info notice "You are signed out."; build and total unchanged; Checkout leads to Sign in |
| Checkout refused | `#builder-checkout-refused` | Error notice names the empty categories (RAM, Storage, Power Supply, PC Case) and restates that the graphics card is optional; two parts chosen, Rp 4.520.000 |
| A chosen part is gone | `#builder-part-gone` | Error notice: "The Kingston Fury 16GB DDR4-3200 is no longer offered." — "Your build is still here without it. Choose another RAM and the total updates." The RAM category is empty, the total is Rp 11.400.000 and the panel's need line asks for RAM |
| Loading | `#builder-loading` | Skeleton plates, titles and cards; the panel is drawn with skeleton rows and `Total -`, without `Checkout`; hero total `-`, no hero control |
| Load failed | `#builder-error` | Error notice "We could not load the parts catalogue." with `Try again`; the hero total is `-` with `Try again` and the facts are still drawn |

**Responsive.** Below 1000 px the hero stacks (photo panel 16/9 above the body), the panel becomes a
fixed sheet toggled from the build bar, and the page keeps 68 px of bottom padding so the bar never
covers the last card. The sheet sits above the bar and is capped at `calc(100dvh - 92px)`. The bar
keeps the total and the toggle only. Below 720 px the ribbons shorten to 112 px, category heads stack
their plate above the title, part cards go one per row and the display sizes drop. The header keeps
brand + the account action; the `Order review` link moves into the footer when space runs out.

**Screens.** `#builder-empty`, `#builder-partial`, `#builder-complete`, `#builder-signed-in`,
`#builder-signed-out`, `#builder-checkout-refused`, `#builder-part-gone`, `#builder-loading`,
`#builder-error`.

### Sign in `/sign-in`

**Purpose.** Turn a visitor with a build into a customer, keeping the build, so checkout can go on.

**Roles.** Visitor. A customer arriving here is simply re-authenticating.

**Entry.** Header `Sign in`; `Checkout` on a complete build while signed out; `Create an account` /
`Sign in instead` cross-links; `Sign in again` from an ended session on the review.

**Exit.** Successful sign-in → Order review (build intact). `Create an account` → Create account.
Brand / `Build` → Builder.

**Content and fields.**

| Field / region | Type | Rules | Copy |
|---|---|---|---|
| Build notice | Info notice, static | Always shown on this page | "Your build is saved." — "7 parts, Rp 12.020.000. It comes back with you after you sign in." |
| Email address | `email`, required, autocomplete `email` | REQ-032 | Placeholder-free; label above |
| Password | `password`, required, autocomplete `current-password` | REQ-036 | No reveal toggle; the generic error covers both fields |
| Primary | Submit | One per screen | `Sign in`; `Signing in` while submitting |
| Foot | Link line | — | "New here? Create an account" |
| Aside | Photograph + caption | Decorative | Someone at a laptop in daylight; caption "Your parts stay put while you sign in" |

**Actions.**

| Action | Trigger | Result |
|---|---|---|
| Sign in | Submit with both fields filled | Sends to the review with the build kept |
| Show field errors | Submit with a field empty | Per-field messages, no network call |
| Show the generic failure | Wrong pair | One notice, no field named, form still usable |
| Create an account | Foot link | Create account page, build kept |

**States.**

| State | Screen | What changes |
|---|---|---|
| Default | `#signin-default` | Build notice, two fields, primary |
| Empty fields | `#signin-validation` | "Enter your email address." / "Enter your password." under each field |
| Wrong pair | `#signin-invalid` | Error notice "The email address or password is not correct." above the fields; fields keep their values |
| Submitting | `#signin-loading` | Button reads `Signing in`, disabled; fields read-only |
| Session ended | `#signin-session-expired` | Info notice "Your session has ended." explains why the visitor is here |

**Responsive.** The split collapses to one column below 1000 px: the form first, the photograph
below it. Field rows keep 44 px minimum touch height. No layout differs between the five states.

**Screens.** `#signin-default`, `#signin-validation`, `#signin-invalid`, `#signin-loading`,
`#signin-session-expired`.

### Create account `/sign-up`

**Purpose.** Create the account an order needs, without losing the build.

**Roles.** Visitor.

**Entry.** Sign in's "New here? Create an account"; footer `Create an account`.

**Exit.** Successful creation → Order review. `Sign in` foot link → Sign in. Brand → Builder.

**Content and fields.**

| Field / region | Type | Rules | Copy |
|---|---|---|---|
| Build notice | Info notice, static | Always shown | "Your build is saved." — "7 parts, Rp 12.020.000. It comes back with you after you create your account." |
| Full name | `text`, required, autocomplete `name` | REQ-034: 2–100 characters | "Full name" |
| Email address | `email`, required, autocomplete `email` | REQ-032, REQ-033 | "Email address" |
| Password | `password`, required, autocomplete `new-password` | REQ-035: 8–128, a letter and a number | Hint: "At least 8 characters, with at least one letter and one number." |
| Primary | Submit | One per screen | `Create account` |
| Foot | Link line | — | "Already have an account? Sign in" |
| Aside | Photograph + caption | Decorative | Someone at a laptop in daylight; caption "One account, your orders" |

**Actions.**

| Action | Trigger | Result |
|---|---|---|
| Create the account | Submit, all valid | Order review with the build |
| Refuse empty fields | Submit with a field empty | One message per field, summary repeated above the form |
| Refuse a weak password | Submit with a password that breaks REQ-035 | Email-field error replaced by the password rule on the password field |
| Refuse a duplicate email | Submit with an address that already has an account | Email-field error + "Sign in instead" |
| Sign in instead | Duplicate-email link, or the foot link | Sign in page |

**States.**

| State | Screen | What changes |
|---|---|---|
| Default | `#signup-default` | Three fields with the password hint |
| Empty fields | `#signup-validation` | "Enter your full name." / "Enter your email address." / "Enter a password." |
| Password refused | `#signup-password` | Password field error states the full rule |
| Duplicate email | `#signup-duplicate` | Email field in error: "This email address already has an account. Sign in instead, or use another address." — "Sign in instead" is the link |

**Responsive.** The same split as Sign in, mirrored: photograph left and form right on desktop, the
form first and the photograph below it on a narrow screen. Three fields still fit one screen at
390 px.

**Screens.** `#signup-default`, `#signup-validation`, `#signup-password`, `#signup-duplicate`.

### Order review `/order-review`

**Purpose.** Show exactly what will be ordered and at what total, and take the confirm.

**Roles.** Customer (signed in). A visitor who reaches it is sent to Sign in.

**Entry.** `Checkout` on a complete build as a customer; `Sign in again` in the ended-session state.

**Exit.** `Place order` → Order confirmation. `Change a part` → Builder (build intact). Brand → Builder.

**Content and fields.**

| Region | Content | Notes |
|---|---|---|
| Intro | Eyebrow "Order review", H1 "Check your build", one-line lede | No seal here; the turning seal sits in the aside |
| Order rows | A list of seven rows: category label, part name, price; then the `Final total` row | Prices are the ones the builder carried; the total is Rp 12.020.000, set larger than the rows |
| Aside | Photograph, the turning seal, `Total`, `No tax. No shipping. Prices in Indonesian rupiah.`, "This is the total that will be recorded with the order." | The seal is decorative and `aria-hidden`; the total here repeats the `Final total` and is the number that will be recorded. Below 1000 px the aside loses the seal and the repeated total and its photograph becomes a wide band |
| Actions | A filled `Place order` and a bordered `Change a part` under the final total | One primary per screen. Submitting withdraws the ghost; the part-gone state offers only `Choose another RAM`; the ended-session state only `Sign in again` |

**Actions.**

| Action | Trigger | Result |
|---|---|---|
| Place the order | `Place order` | Submitting state, then the confirmation |
| Change a part | `Change a part` | Builder with the build intact |
| Choose another RAM | The only action in the missing-part state | Builder, with the RAM category empty and the banner naming the lost part |
| Sign in again | Primary in the ended-session state | Sign in, with the reason kept |

**States.**

| State | Screen | What changes |
|---|---|---|
| Default | `#review-default` | Seven rows, Rp 12.020.000, two actions |
| Submitting | `#review-submitting` | Primary reads `Placing your order` and is disabled; `Change a part` is not offered while submitting |
| Part no longer available | `#review-part-gone` | Error notice names the part; its row keeps the struck name and price with a `No longer available` tag, total Rp 11.400.000, the only action is `Choose another RAM`, `Place order` withdrawn |
| Session ended | `#review-session-expired` | Info notice "Your session has ended." with the build-and-total-kept sentence; primary `Sign in again` |

**Responsive.** Below 1000 px the two columns become one: the rows, the final total and the two
actions first, then the aside with its wide photograph and the rules. Rows keep the category label
and the price on one line and wrap the part name, never the price.

**Screens.** `#review-default`, `#review-submitting`, `#review-part-gone`, `#review-session-expired`.

### Order confirmation `/order-confirmation`

**Purpose.** Say the order is placed, and with what reference.

**Roles.** Customer, immediately after confirming.

**Entry.** `Place order` on the review.

**Exit.** `Start a new build` → Builder (empty). Brand → Builder.

**Content and fields.**

| Region | Content |
|---|---|
| Intro | Eyebrow "Order confirmed"; Didone H1 "Order placed", set in caps; lede "Here are the parts you ordered and the total you agreed to. Keep this reference." |
| Reference | Label `Order` above `CZ-1042`, set in the display face at `--fs-num` so it reads as a number to keep, not a heading |
| Meta | `Placed` `16 Nov 2026`; `Parts` `7` |
| Order rows | The seven rows and the `Final total` the review showed, so the order can still be read after it was placed |
| Aside | Photograph, then the line "No payment was taken and no delivery details were asked for. The store has the order." |
| Primary | `Start a new build` |
| Footer | Night footer, same as everywhere |

**Actions.**

| Action | Trigger | Result |
|---|---|---|
| Start a new build | Primary | Builder, empty |
| Back to the builder | Brand, footer links | Builder |

**States.**

| State | Screen | What changes |
|---|---|---|
| Default | `#confirm-default` | The only state: the order is already placed, and there is nothing to retry or refuse. Drawn on night (`data-night`) to close the journey the way the reference closes its page |

**Responsive.** Two columns on a wide screen: the order on the left, the photograph and the note in
a 340 px aside. Below 1000 px it is one column, the aside following the order. The reference is
fixed at `--fs-num` (36 px) so it never overflows at 390 px, and the meta pair wraps.

**Screens.** `#confirm-default`.

## Navigation

| From | Control | To | Notes |
|---|---|---|---|
| Any page | Brand mark (`compzy`) | Builder | `aria-label` "compzy, back to the builder" |
| Any page, header | `Build` | Builder | `aria-current="page"` on builder screens |
| Any page, header (customer) | `Order review` | Order review | Only rendered for a signed-in customer |
| Any page, header (visitor) | `Sign in` | Sign in | The only account action a visitor sees |
| Any page, header (customer) | `Sign out` | Builder, signed out | Build kept (REQ-028) |
| Builder hero | `Start choosing` / `Keep choosing` | The first category, by a script scroll | A button, not a link: 23 screens share one document, so a per-category id would repeat |
| Builder hero, failed load | `Try again` | The catalogue, reloaded | `#builder-empty` in the mock |
| Builder panel / mobile bar | `Checkout` | Sign in · Order review · refusal | Decided by build completeness and session |
| Sign in foot | `Create an account` | Create account | Cross-link |
| Create account foot | `Sign in` | Sign in | Cross-link |
| Create account, duplicate email | `Sign in instead` | Sign in | Keeps the entered address in the mock's copy |
| Sign in, session ended | `Sign in` (submit) | Order review | Build and total kept |
| Order review | `Change a part` | Builder | Build intact (REQ-031) |
| Order review | `Place order` | Order confirmation | Submits first (REQ-014) |
| Order review, missing part | `Choose another RAM` | Builder, RAM empty | REQ-026 |
| Order review, session ended | `Sign in again` | Sign in | REQ-027 |
| Order confirmation | `Start a new build` | Builder, empty | The order is not editable |
| Footer | `Build a PC`, `Review your order` / `Sign in` + `Create an account` | Builder, Order review / Sign in, Create account | Mirrors the header for the visitor state |
| Footer bottom bar | `Build a PC`, `Sign in`, `Review order` | Same targets | The bar is a shortcut, not an extra destination |

There is no route a visitor cannot reach from the header or the page body. The mock's own screen
switcher (`.switcher`) is hidden in the preview and in every screenshot (`screens.json` `hide`).

## Motion and interaction catalog

Motion is a short list on purpose: the reference's own motions, and nothing else. All durations are
tokens; no raw value exists in a screen rule.

| ID | Name | What moves | Duration / easing | Trigger | Reduced motion |
|---|---|---|---|---|---|
| MO-001 | Ribbon drift | `.ribbon__track` translateX 0 → −50 %, two tracks per strip for a seamless loop; the second strip runs at −6 s offset | 64 s linear infinite | Always | Animation removed |
| MO-002 | Seal turn | `.seal svg` rotate 0 → 360° | 40 s linear infinite | Always | Animation removed |
| MO-003 | Control feedback | Background, colour, border and small transform changes on hover / focus / press | `--dur-fast` 180 ms, `--ease` | Hover, focus-visible, `:active` | Instant |
| MO-004 | Skeleton shimmer | `.skel` background sweep | 1.6 s `--ease` infinite | Only on the loading screen | Animation removed; static plate |
| MO-005 | Focus ring | 2 px outline, 2 px offset, on-night in the footer and dark pages | 0 ms (never animated) | Keyboard focus only (`:focus-visible`) | Unchanged |
| MO-006 | Choosing a part | The chosen card's inset frame and its control label swap; no size change, so the grid never reflows | Instant swap of state, 180 ms on the frame's colour | `Choose` / `Remove` | Unchanged |
| MO-007 | Mobile build sheet | The panel and the build bar switch on / off; no slide, no backdrop fade | 0 ms (display toggle) | `Your build` / `Close` | Unchanged |

Nothing enters, rises or fades on a screen change: a screen is drawn complete. That is the one place
this design departs from the reference, whose scroll reveals were not carried over — the mock shows
every state as a still frame, and an entrance animation on top of that would animate state changes
rather than content arrival.

Reduced motion: one media query kills every animation and transition (0.001 ms) and stops the ribbon
and the seal. `mock-sweep.mjs` checks it on every screen at 1440 / 1000 / 720 / 390 px.

## Design tokens

Every value in `ui/mock/app.css` `:root`. Screen rules reference tokens only — `mock-sweep.mjs`
reports no DRIFT.

### Colour

| Token | Value | Used for |
|---|---|---|
| `--paper` | `#f3f2ee` | Page canvas, the light ground of every screen |
| `--paper-deep` | `#ecebe6` | Alternating block ground |
| `--panel` | `#ededed` | Photo plates and image placeholders |
| `--white` | `#ffffff` | Part card surface, build sheet |
| `--night` | `#0a0a0a` | Dark ribbon strip, footer, confirmation page |
| `--ink` | `#141414` | Text and hairlines on paper |
| `--ink-soft` | `#2b2b28` | Secondary text on paper |
| `--muted` | `#63605a` | Captions, fine print, "Not chosen yet" |
| `--on-night` | `#f3f2ee` | Text on night |
| `--on-night-muted` | `#c8c4bb` | Secondary text on night |
| `--accent` | `#fa5e35` | The one accent: the hero disc, the oval numbers, the chosen frame, the seal |
| `--accent-text` | `#b13a15` | Accent as text on paper (contrast-safe) |
| `--blush` | `#f3b9a1` | The lower ribbon strip |
| `--blush-soft` | `#f9ded4` | Soft accent ground |
| `--accent-wash` | `#fbe7e0` | Chosen / info fill |
| `--line` | `#141414` | 1 px structural rules |
| `--line-soft` | `rgba(20,20,20,.18)` | Interior hairlines and dividers |
| `--line-on-night` | `rgba(243,242,238,.22)` | Hairlines on night |
| `--chip` | `rgba(243,242,238,.92)` | The small pill over a photo plate |
| `--g-sheen` | `linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)` | Skeleton sweep |
| `--focus` | `var(--ink)` | Focus ring on paper |
| `--focus-night` | `var(--on-night)` | Focus ring on night (footer, confirmation) |

Contrast: ink on paper 16.5:1, muted on paper 5.6:1, on-night-muted on night 11.4:1,
accent-text on paper 5.4:1, ink on the accent disc 5.9:1. `--accent` is never used as text smaller
than display size; the disc always carries ink on it, never accent text on paper.

### Typography

| Token | Value | Used for |
|---|---|---|
| `--font-display` | `"Bodoni Moda", "Times New Roman", serif` | Every heading, the prices in the panel, the reference number |
| `--font-ui` | `"Archivo", "Helvetica Neue", Arial, sans-serif` | Body, labels, controls, tables |
| `--fs-hero` | `clamp(2.75rem, 6.4vw, 6.5rem)` | Builder H1 (92.2 px at 1440, 64 px at 1000, 46.8 px at 390) |
| `--fs-d1` | `clamp(2.5rem, 5.4vw, 5rem)` | Page H1s: Sign in, Create account, Order review and the confirmation (77.8 px at 1440) |
| `--fs-d2` | `clamp(2rem, 3.2vw, 3.25rem)` | Category titles, footer headline (46.1 px at 1440) |
| `--fs-total` | `clamp(2.75rem, 5vw, 4.5rem)` | The review's `Final total` amount (72 px at 1440) |
| `--fs-s2` | `clamp(1.75rem, 2.7vw, 2.5rem)` | Hero total, section sub-display (38.9 px at 1440) |
| `--fs-num` | `2.25rem` | Plate figures and the confirmation reference (36 px) |
| `--fs-l0` … `--fs-l5` | `.9375 / 1.0625 / 1.1875 / 1.25 / 1.375 / 1.5 rem` | Panel rows, form fields, buttons |
| `--fs-body` | `1rem` | Body |
| `--fs-sm` | `.875rem` | Table cells, hints |
| `--fs-micro` | `.75rem` | Fine print, captions |
| `--fs-nano` | `.625rem` | Tags, plate numbers' companions |
| `--fs-label` | `.6875rem` | Small-caps labels (`.label`) |
| `--fs-tiny` | `.5625rem` | The seal's ring text |
| `--lh-display` | `.94` | Display headings |
| `--lh-body` | `1.6` | Body copy |

Small-caps labels and eyebrows set `letter-spacing` between `.12em` and `.22em` per role (`.18em` on
the section labels and eyebrows, `.22em` on the ribbon phrases). Display type carries the tracking it
needs: `.005em` on `.display`, `.01em` on the wordmark, `.02em` on the confirmation reference and `0`
on the part control's `+` glyph. All ten values belong to the type scale rather than to tokens of
their own.

Fonts are self-hosted woff2 in `ui/mock/assets/fonts/` (Bodoni Moda variable + italic, Archivo), and
they are the latin subsets, so no rule needs a `unicode-range`. `font-display: swap` throughout. No
web-font request leaves the page.

### Spacing and shape

| Token | Value | Used for |
|---|---|---|
| `--s1` … `--s10` | `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 px` | Every gap and padding |
| `--gutter` | `clamp(20px, 3.3vw, 48px)` | Page side gutters |
| `--maxw` | `1400px` | Content width |
| `--aside` | `372px`, `330px` below 1180 px | The desktop build column and the review aside |
| `--r` | `0` | Square corners everywhere: cards, buttons, fields, notices, photos |
| `--r-full` | `50%` | The only round shapes: the brand disc, the oval badges and the seal's centre mark |
| `--hair` | `1px` | Every rule |
| shadow | none declared | No drop shadow anywhere; the chosen card's frame is `box-shadow: inset 0 0 0 1px var(--line)` |

Circles are used exactly where the reference uses them and nowhere else: the brand mark, the oval
number badges, the hero disc and the turning seal. Every other corner on the page is square (`--r: 0`).

Breakpoints: `max-width: 1180px` (the build column narrows to 330 px and the review's aside to
340 px), `1000px` (hero and every split collapse to one column, the build panel becomes the fixed
sheet behind the bar), `720px` (single column, ribbons shorten to 112 px, display sizes drop,
thumb-sized targets), `430px` (the review's final total takes its own line).

### Motion tokens

| Token | Value | Used for |
|---|---|---|
| `--dur-fast` | `180ms` | Hover, focus, colour and border feedback |
| `--ease` | `cubic-bezier(.22, .61, .36, 1)` | Every transition and keyframe |

There are no other timing tokens: the ribbons' 64 s and the seal's 40 s loops and the skeleton's
1.6 s sweep are written on their own rules, where they are used once each. `--dur-slow`, `--dur` and
`--ease-in` were removed when no rule used them.

## Components

The spec's Non-Goals forbid nexcomponent and nexcommon for this service, so **no house component
library is used**. The mock defines the components itself, as CSS classes with one job each; the
front end should port these classes as components rather than pull a UI kit in.

| Component | Class / element | Where | Variants and states |
|---|---|---|---|
| Brand disc + wordmark | `.brand__disc` (inline SVG star) + `.brand__word` | Header, footer | Paper-on-ink in the header; ink-on-paper in the footer |
| Header | `.hdr`, `.hdr__in`, `.nav` | Every page | Visitor / customer (greeting + Sign out); `aria-current="page"` |
| Footer | `.ftr`, `.ftr__in`, `.ftr__col`, `.ftr__photo`, `.ftr__bar` | Every page | Visitor / customer link sets |
| Hero | `.hero`, `.hero__body`, `.hero__media`, `.hero__foot` | Builder | With live total; loading and error keep the same frame |
| Ribbon seam | `.ribbons`, `.ribbons__band`, `.ribbon`, `.ribbon--dark`, `.ribbon--blush`, `.ribbon__track` | Builder | Always decorative (`aria-hidden`), two strips in one rotated band |
| Facts strip | `.facts`, `.facts .v`, `.facts .k` | Builder | Four cells, hairline dividers |
| Category section | `.cat`, `.cat__head`, `.cat__plate`, `.oval`, `.cat__title`, `.cat__meta`, `.cat__note` | Builder | Required / Optional tag; numbered plate |
| Part card | `.part`, `.part__body`, `.part__lot`, `.part__name`, `.part__price`, `.part__choose`, `.part.is-chosen` | Builder | Default / chosen (inset frame, control reads `Remove`, `aria-pressed`) |
| Build panel | `.panel`, `.panel__head`, `.panel__rows`, `.prow`, `.prow__remove`, `.panel__total`, `.panel__need`, `.panel__fine` | Builder | Desktop aside with a pinned head, total, need line and `Checkout` over scrolling rows; the same panel as the sheet (`is-open`) below 1000 px |
| Mobile build bar | `.build-bar` | Builder | Below 1000 px; total + `Your build` toggle only |
| Split | `.split`, `.split__body`, `.split__media` (+ `flip` / `flip-body`) | Sign in, Create account | Photo right (Sign in) / photo left (Create account); form first when the columns collapse |
| Field | `.field`, `.field__label`, `.field input`, `.field .hint`, `.field .error`, `.field.is-invalid` | Sign in, Create account | Default / invalid / read-only |
| Notice | `.notice`, `.notice--info`, `.notice--error`, `.notice__icon` | Builder, Sign in, Create account, review | Info and error; `role="status"` / `role="alert"` |
| Seal | `.seal`, `.seal svg`, `.seal text` | Order review aside | One size, turning, decorative (`aria-hidden`) |
| Order rows | `.order-rows` (`ul`/`li`), `.orow`, `.orow--optional`, `.orow--gone`, `.order-total`, `.num` | Order review, confirmation | Row states: normal, optional, no longer available (struck name and price, `No longer available` tag) |
| Confirmation card | `.confirm`, `.confirm__ref`, `.confirm__meta`, `.confirm__figure`, `.confirm__actions` | Order confirmation | Night surface; the reference set at `--fs-num` |
| Button | `.btn`, `.btn--block`, `.btn--ghost`, `.btn--on-night`, `.btn--quiet` | Everywhere | Default, ghost (bordered), on-night, quiet text action; the disabled state is a real `disabled` attribute |
| Tag | `.tag`, `.tag--accent`, `.tag--ghost` | Builder, review | Required (accent) / Optional (ghost) |
| Skeleton | `.skel`, `.skel--plate`, `.skel--title`, `.skel--line`, `.skel--card` | Builder loading | Shimmer, static under reduced motion |
| Label / eyebrow | `.label`, `.eyebrow`, `.display` | Everywhere | Small-caps and Didone type roles |

## Assets

| Asset set | Contents | Source and licence |
|---|---|---|
| Photography | 12 WebP files in `ui/mock/assets/img/`: `review` (hero, a motherboard mid-build), `cpu-2`, `mb-1`, `ram-1`, `ssd-1`, `hero` (GPU), `psu-3`, `case-1` (category plates), `auth` (sign-in / sign-up), `gpu-1` (review), `confirm` (confirmation), `footer` | Free-licence stock (Flickr, Wikimedia Commons, StockSnap) with title, creator, licence and source per file in `ui/mock/assets/img/CREDITS.md`. They stand in for the 21 seeded parts; real catalogue photography replaces them before launch |
| Type | `bodoni-moda-latin.woff2` (46,260 B), `bodoni-moda-italic-latin.woff2` (53,756 B), `archivo-latin.woff2` (34,928 B) | Self-hosted, OFL-licensed; the reference's Didone/sans pairing |
| Icons | Inline SVG only: the four-point star (brand, ribbon separators, footer) and the alert circle | Drawn to the reference's star; no icon font, no icon dependency |
| Mock footprint | 1.6 MB total for `ui/mock/` | Small enough for `/ui-preview` |

## Open design gaps

| # | Gap | Status |
|---|---|---|
| 1 | The dark footer is the one reference scene with no fidelity anchor. A whole page compared with the reference's `footer.png` crop fails the layout score by construction — the masses sit in opposite places because the frames cover different things — so the pairing was removed rather than tuned around | **Decided:** one anchor, `#builder-empty` ↔ `hero.png`, which **passes** (palette 0.207, textured area 76 % of the reference's, layout 0.21, brightness 0.77 vs 0.83). The dark footer is checked by eye against the same `footer.png` crop: paper wordmark and quick links left, Didone headline and photograph right, hairline bottom bar — the reference's arrangement. Recorded in `screens.json` (`anchors` holds one pair) and `ui/review/fidelity.json` |
| 2 | `mock-sweep.mjs` reports 6 distinct focus-ring findings ("1:1 (needs 3)") in 22 of the 23 screens, every one on a footer link, a form-foot link or a field-error link | Checker artifact, measured not assumed: the sweep focuses a control and probes the paint just above its top edge, but it does not scroll the element into view first, so for anything below the fold the probe lands in the visible page above the element (paper) while the ring belongs to the footer (paper on night) or a block further down. `ui/review/focus-probe.txt`, produced from the built mock, scrolls each control into view, focuses it and reads the real stack: footer `Build a PC` — ring `rgb(243,242,238)` 2 px, offset 2 px, over `rgb(10,10,10)` = **17.67:1**; footer-bar link the same; form-foot `Create an account`, field-error `Sign in instead` and header `Build` — ring `rgb(20,20,20)` 2 px, offset 2 px, over `rgb(243,242,238)` = **16.45:1**. No change to the mock |
| 3 | Product photography is licensed stock, not the store's real parts | Replacement is a content task before launch; the layout is built for the real 21 images (4:3 plate, object-fit cover) |
| 4 | The confirmation asks for nothing: no email, no address, no payment | Deliberate — the spec's Non-Goals exclude payment and delivery details, and the page says so in one line |
| 5 | Sign-in loading shows a disabled `Signing in` button rather than a spinner | Motion budget: the reference has no spinner, and a spinner would be the only looping element on the page besides the seal |
| 6 | The build sheet on mobile swaps in without a transition | Motion budget: a slide would add a second duration to the system for one control |

## Assumptions and decisions

Decided in this pass, recorded so the build does not re-litigate them.

1. **Routes** are `/`, `/sign-in`, `/sign-up`, `/order-review`, `/order-confirmation`. The spec fixes
   the pages, not their paths; these are the shortest names for them.
2. **The builder is the landing page.** REQ-001 says the visitor sees the builder on opening, so
   there is no marketing home page.
3. **Naming.** The product is `compzy` in the wordmark (lowercase) and "compzy" in running text.
   Category titles are the spec's own labels, including "Processor (CPU)" and "Storage (SSD)",
   because `spec.md` fixes them.
4. **Money.** Every amount is a rupiah integer rendered as `Rp` + dot-separated thousands, in
   tabular Didone in the display slots and tabular sans in table cells.
5. **Worked examples.** The empty state is Rp 0. The partly chosen state is CPU + Motherboard +
   Storage = Rp 4.520.000. The complete state is the spec's mid-range build =
   Rp 2.150.000 + 1.750.000 + 620.000 + 950.000 + 4.250.000 + 850.000 + 1.450.000 =
   **Rp 12.020.000**, and the review and confirmation carry the same figure (REQ-029).
6. **The confirmation's reference `CZ-1042` and date `16 Nov 2026` are mock values**, not a business
   rule: the real reference comes from `compzy-be`. The screen states the format only.
7. **The signed-in customer's name is `Rina`** in the header; it is the first name of the seeded
   account used for the mock, not a new field on the sign-up form (REQ-034 asks for full name).
8. **Order review as the only order surface.** There is no order history, no basket and no saved
   build page: REQ-013 fixes one review screen per order.
9. **No `nexcomponent` / `nexcommon`** — `spec.md` Non-Goals. Components above are the mock's own.
10. **The screen switcher is mock-only** and hidden from every screenshot and the preview
    (`screens.json` `hide`), so it never reads as part of the design.
11. **No photograph on a part card.** The reference's product cards are photographs; compzy would
    need 21 part shots the store has not supplied, and a stock image of the wrong part on a card that
    names the right one is worse than none. The category plate carries the photography instead.
12. **The build bar and its sheet start at 1000 px**, not only on phones: between 721 and 1000 px a
    sticky column leaves the cards too narrow to read, so the build moves into the bar and its sheet.
13. **`#builder-part-gone` is a builder state, not a page**: it is where the review sends a customer
    whose part vanished, and the builder is where the replacement is chosen.
14. **Nothing enters, rises or fades.** The mock draws every screen complete. An entrance animation
    would fire on a screen change — that is, on a state change — and this design has no motion to
    spend on decoration; the ribbon and the seal already carry the page's movement.

## Polish review

Reviewed against the polish list; "fixed in the mock" is this run's equivalent of "fixed in Figma",
because there is no Figma file. Sweep evidence: `mock-sweep.mjs` over 23 screens × 4 widths
(1440 / 1000 / 720 / 390, reduced motion on) reports no console error, failed request, blank screen,
overflow, broken image, contrast failure, dead link or DRIFT; its 6 distinct findings are all the
recorded focus-ring probe artifact (Open design gaps #2), and no other finding exists. Coverage:
`mock-coverage.mjs` reports **5/5 pages, 40/40 mapped REQs, 0 dead links** (REQ-039 is listed under
Requirements without UI). Fidelity: one anchor, `#builder-empty` ↔ `hero.png`, **PASS** (palette
0.207, texture 0.76, layout 0.21). Evidence files are in `ui/review/`: `coverage.json`,
`fidelity.json`, `sweep.json`, `focus-probe.txt`, `sheet-builder-empty.jpg`, plus the round-1
scorecard in `round-1.md`.

| Item | Screen | Finding | Decision |
|---|---|---|---|
| Filler badges or decorative pills | all | The tags carry `Required` / `Optional`; the oval numbers order the seven categories; the ribbon strips repeat rules that the facts strip states | none found |
| Labels repeating a heading or value | all | The panel's "N of 7 chosen" adds the count the amount does not; "Total so far" and "Total" label two different placement of one figure | none found |
| Italics on random words | all | Bodoni italic is loaded for the seal only, which is type on a path | none found |
| Off-system values | all | An 11 px size, a chip fill and a sheen gradient were folded into tokens (`--fs-label`, `--chip`, `--g-sheen`); the three `border-radius: 50%` circles became `--r-full`; the unused colour, type and motion tokens `--night-raised`, `--fs-d3`, `--dur-slow`, `--dur` and `--ease-in` were deleted. Every colour, size, radius and shadow in a screen rule now comes from the token block, and `mock-sweep` reports no DRIFT | fixed in the mock |
| Placeholder content | all | All copy is product copy; the 21 parts, their prices and the build values are the spec's own catalogue | none found |
| Main feature not dominant | Builder | The hero states the job in one headline, and the category list starts one scroll below, with the live total pinned beside it | none found |
| Vague headline | Builder | "Build your own PC" names the task; the confirmation's "Order placed" names the outcome | none found |
| Competing primary actions | Builder, Sign in, Create account, review | One primary per screen. On the builder the panel's Checkout is the only filled control; the hero's `Start choosing` is secondary in weight. On the review, `Change a part` is a ghost | fixed in the mock |
| No single accent colour | all | One vermilion accent (`--accent`), used for the hero disc, the oval numbers, the chosen card's frame and the seal; text uses `--accent-text` for contrast | none found |
| Embellishments with no purpose | all | The seal marks the confirm, the ribbons separate the hero from the catalogue, the plates identify a category at a glance | none found |
