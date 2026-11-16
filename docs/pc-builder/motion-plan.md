# Motion plan — language switcher revision (pc-builder)

Style: the approved design's own motion (`src/styles/app.css` tokens), not the
house nx-motion library. Source of truth: `docs/pc-builder/UIMap.md` §Motion and
interaction catalog (`MO-xxx`). The design settles this revision: a language
switch is **0 ms, no transition, no reload** (MO-008), and "no screen rises or
fades in" (DesignBrief §Motion).

## Shared chrome — language control (every route and state) — type: chrome control

Budget: L2 0/1 · L3 0/0 · distinct MX IDs 0/4.

The switcher lives in `Header`, so the same decision holds on every screen:
builder, order review, sign in/up, order confirmation and not found. None of
these screens gain, lose or replay an entrance; existing screen motion is
untouched.

| # | Surface (component / selector) | MX | Trigger | Decision | From design | Status |
|---|---|---|---|---|---|---|
| 1 | Two switcher buttons — `LanguageSwitcher.jsx:14`, `.lang__opt` (`app.css:1716`) | none | click | **No motion.** Strings, `document.title` and `html[lang]` change in place in one render. The active marker (accent square + ink underline) moves between options with no transition; hover only swaps `border-bottom-color` and `.lang__opt` declares no `transition`. | MO-008 (0 ms, no transition, no reload); MO-003 border/colour feedback | verified — no code change |
| 2 | Narrow picker — `LanguageSwitcher.jsx:35`, `.lang__pick select` (`app.css:1753`) | none | `change` | **No motion.** A native `<select>`; the value changes and the page text re-renders. The list itself is the OS control's own motion. The accent rule and chevron do not animate. | MO-008 (0 ms) | verified — no code change |
| 3 | Save-failed notice — `Chrome.jsx:72-76`, `.lang-warn` (`app.css:1781`) | none | `saveError` becomes true | **No motion.** The line renders into the header in one frame; it has no transition or keyframe. `role="status"` announces it to assistive tech, which is the feedback that matters here. It does not slide, fade or pulse. | No animation specified for this notice; design forbids animating state changes | verified — no code change |
| 4 | Focused state — global `:focus-visible` (`app.css:145-153`) | none | keyboard focus | **No motion.** 2 px outline, 2 px offset, on-night colour on dark surfaces. Drawn instantly, never animated. Also covers the two buttons and the picker. | MO-005 (0 ms, never animated) | verified — no code change |

Existing motion that this revision must not change, and does not: ribbon drift
(MO-001), seal turn (MO-002), skeleton shimmer (MO-004), control hover/colour
feedback (MO-003) and the chooser state swap (MO-006). None of it was touched.

Reduced motion already exists and is untouched: `app.css:1892-1907` — one
`prefers-reduced-motion: reduce` block drops every animation and transition to
`0.001 ms`, removes the ribbon and seal loops, and sets `scroll-behavior: auto`.
The language switch has nothing to reduce because it was never animated.

## Rejected ideas

- **MX-33 swap on the page content after a language change** — breaks MO-008's
  0 ms rule and the "no screen rises or fades in" rule; it would make the text
  swap read as a page/state transition. Also replays on a state change rather
  than content arrival (budget rule 7).
- **MX-04 slide-in (toast banner) for the save-failed notice** — a designed
  slide is still motion the design does not specify; the notice is a `status`
  line and must not behave like a page transition. Budget rule 2 also spends
  the one entrance moment on chrome instead of content.
- **MX-12 success-pop or MX-31 tab-indicator on the active language button** —
  the active marker is a state, not an action result; moving it with motion
  would animate the switch itself, contrary to MO-008.
- **MX-14 flash on the newly active option** — flash is for a row/value
  updated by data, and it would draw the eye to the control instead of the
  content that just changed language.
- **MX-02 / MX-07 entrance on the page after switching language** — entrance
  animations are for first view; the language revision explicitly keeps the
  current page mounted and its content in place (REQ-043, REQ-056).
- **MX-10 press on the custom buttons** — would add a press transform the
  approved design does not have; the buttons already answer the pointer with
  the accent-marker state change and the global focus ring.

## Open questions for fe-dev / designer

- None. The revision needs no motion; this plan places nothing. The nx-motion
  library is not installed in this repo and is deliberately not installed,
  because there is nothing to place and the app's approved motion lives in
  `app.css`.
