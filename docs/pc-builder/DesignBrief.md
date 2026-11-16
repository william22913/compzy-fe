---
feature_code: pc-builder
service: compzy
spec_version: 2
source: UIMap.md
last_updated: 2026-11-16
---

# Design Brief — pc-builder (compzy)

The short, readable digest of `UIMap.md`. The map is the source of truth; this file never holds a
value the map does not. The design itself is the clickable mock:
`ui/mock/index.html#<screen id>`.

## Overview

compzy sells custom PCs assembled part by part. A visitor opens the builder and sees seven
categories — processor, motherboard, RAM, storage, graphics card, power supply, case — with three
seeded parts in each and a price on every card. They choose one part per category, watch the total
in the panel beside the list, and check out. The graphics card is the only optional category;
everything else must be filled before checkout, and the checkout control always says so instead of
greying out. Finishing the order asks for a sign-in or an account, never for a payment or a
delivery address, and ends on a confirmation with the order reference.

Every page is in English or Indonesian, chosen by a switcher in the header, and the app opens in
Indonesian for a first-time visitor. Switching changes every string on the page at once and never
changes the build, the total or anything typed into a form. Prices, product names and the order
reference read the same in both languages.

There is no Figma file. The manager supplied one Dribbble shot (a boutique clothing template) as the
look to match; the visual language is carried over and the boutique's content is not. The mock is
the design, and `/ui-preview` is where the manager reviews it.

Pages:

| Page | Route | Screens |
|---|---|---|
| Builder | `/` | `#builder-empty`, `#builder-partial`, `#builder-complete`, `#builder-signed-in`, `#builder-signed-out`, `#builder-checkout-refused`, `#builder-part-gone`, `#builder-loading`, `#builder-error` |
| Sign in | `/sign-in` | `#signin-default`, `#signin-validation`, `#signin-invalid`, `#signin-loading`, `#signin-session-expired` |
| Create account | `/sign-up` | `#signup-default`, `#signup-validation`, `#signup-password`, `#signup-duplicate` |
| Order review | `/order-review` | `#review-default`, `#review-submitting`, `#review-part-gone`, `#review-session-expired` |
| Order confirmation | `/order-confirmation` | `#confirm-default` |
| Not found | `*` | `#notfound-default` |

## What it looks like

Warm paper (`#f3f2ee`) everywhere, ink text, one vermilion accent (`#fa5e35`), square corners,
1 px hairlines, no shadows. Headlines are a Didone serif (Bodoni Moda) set tight and large —
"Build your own **PC**" at up to 92 px, with a vermilion disc sitting behind the word `PC` exactly
as the reference puts a disc behind the first word of its headline. Everything else is Archivo:
small-caps labels with wide tracking, ordinary sentence case body, tabular figures for money.

The builder's opening screen is one photograph of a motherboard seated in a case, mid-build, edge to edge in its panel, with
the headline and the live total beside it. Under that, a seam of two tilted marquee strips — one
black, one blush — drifts slowly and separates the hero from the catalogue. A hairline facts strip
states the rules as numbers: seven categories, six required and one optional, Rp 0 where the total
starts, Rp 12.020.000 for a complete mid-range build.

Each category is a plate photograph with an oval number (01–07), a Didone title, a `Required` or
`Optional` tag and the part count. Its parts are cards: the part's name, its rupiah price, and one
`Choose` control that becomes `Remove`. The chosen card is framed with a 1 px inset rule and nothing
else changes. The build panel sticks beside the list with one row per category, the total, a sentence
naming what is still missing, and a single filled `Checkout`; its head, total and button stay put
while the seven rows scroll. Below 1000 px the panel becomes a sheet behind a fixed bar that shows
the total.

Sign in and Create account are a two-column split, mirrored: Sign in puts the form on the left and
the photograph right, Create account the other way round. Above the form, a notice says the build is
saved, with its total. The order review is a list of seven rows and a final total, with a wide
photograph, a small turning seal and the rules in the aside, and exactly two actions — a filled
`Place order` and a bordered `Change a part`. The confirmation is the one night page: near-black
ground, paper text, "Order placed", the reference `CZ-1042` as a number to keep, the date and the
part count, the same seven rows, and a single `Start a new build`.

The footer closes every page in the reference's own manner: a wordmark, quick links, a photograph
and a Didone line — "Pick the parts. Watch the total. Order it." — then a bottom bar of links.

On the right of every header sits the language switcher. Above 1180 px it is two small-caps text
buttons, `English` and `Bahasa Indonesia`, divided by a hairline, with a small vermilion square and an
ink underline on the one in use. At and below 1180 px it becomes a native picker in the same place,
showing the current language name over a 1 px vermilion rule with a small chevron and holding both
full names in its list — the accent marks it as the language control rather than another nav link. It follows the account action and never moves: signed out it comes after `Sign in`, signed in after
`Rina` / `Sign out`. The spec asks for a switcher with exactly two choices and not for this form; the
form is drawn here for the manager to approve in `/ui-preview` (UI map, Open design gaps #8). The not-found page is a quiet paper page — eyebrow `Page not found · 404`, a
Didone "This page is not here", one sentence and one filled `Back to the builder` — on the same page
grid as every other page, with the same header, switcher and footer.

## Motion

Two loops and one short feedback: the ribbon strips drift on a 64-second loop, the seal turns on a
40-second one, and hover, focus and press take 180 ms on one easing curve
(`cubic-bezier(.22,.61,.36,1)`). The loading screen's skeleton shimmers and nothing else does. No
screen rises or fades in: a screen is drawn complete, so a change of state never plays as a change of
page. Nothing animates out, the mobile sheet switches on rather than sliding, and one reduced-motion
query removes all of it.

## Rules the design carries

- Prices and totals are rupiah with dot thousands and no tax or shipping line, ever.
- The total is never wrong on screen: on the builder it sits in the hero, the panel and, below
  1000 px, the build bar, and they always read the same number.
- Checkout is never disabled; when a required category is empty it explains what is missing.
- One part per category; choosing another replaces it; removing drops the total by that price.
- One primary action per screen.
- English and Indonesian both complete, one shown at a time: category names, headings, buttons,
  labels, validation, notices, empty, loading and error states and the order summary. Indonesian uses
  the formal `Anda`. The two option names stay `English` and `Bahasa Indonesia` in both languages.
- Product and model names, prices, the total and the order reference are never translated.
- No component library: the spec forbids nexcomponent and nexcommon for this service, so the
  components are the mock's own classes, ported as they are.
