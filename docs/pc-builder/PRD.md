---
feature_code: pc-builder
service: compzy
spec_version: 2
last_updated: 2026-11-16
---

# PC Builder — Product Requirements Overview (compzy)

A short helicopter view. The full requirement detail, all `REQ-*` rules and
every edge case live in [`spec.md`](spec.md) — this file only summarizes them.

## Overview

Compzy is a small computer store. This feature is a web app where a customer
puts a PC together from the store's parts, sees what it costs as they go, and
orders it. The manager asked for exactly four things: sign in and out, pick and
combine parts, see the total update live, and check out simply — "no
compatibility checkers or fancy extras".

Seven fixed part categories, one part each, an optional graphics card, prices
in Indonesian rupiah, and no tax or shipping line. Visitors build without an
account; checking out needs one.

The revision summarized here adds what the manager asked for next: **the whole
app switches between English and Indonesian, on every page.**

## Product Goal

Let a customer assemble a complete PC and know its price without staff
involvement, then place the order online — in the language they read most
comfortably — and let the store keep a record of what was ordered. The single
success measure is that the whole journey works end to end: open the app, pick
parts, see the total, sign in, review and submit, with the page readable in
either language at every step.

## Features

| Feature | Description | Expected behaviour |
|---|---|---|
| Browse parts | The seven categories and the parts on offer, visible immediately | A visitor sees Processor (CPU), Motherboard, RAM, Storage (SSD), Graphics Card, Power Supply and PC Case, each part with its name and price, and no sign-in prompt (REQ-001, REQ-002, REQ-016) |
| Build and swap | One part per category, replaceable and removable | Choosing a second part in a category replaces the first; a chosen part can be removed; a build never holds two parts from one category (REQ-003, REQ-004, REQ-037) |
| Live total | A running price for the current build | The total starts at Rp 0 and updates immediately on every choice, swap or removal, as the plain sum of the chosen prices with no tax or shipping (REQ-005, REQ-006) |
| Rupiah pricing | Prices in the store's currency and style | Every price and the total read like "Rp 12.500.000" — "Rp " prefix, dot thousands separators, no decimals — and read the same in both languages (REQ-007, REQ-050) |
| Completion rule | What makes a build ready to order | Processor, Motherboard, RAM, Storage, Power Supply and PC Case are required; Graphics Card is optional; checkout is available once the six required categories are filled (REQ-008, REQ-038) |
| Account | Create an account, sign in, sign out | Sign-up takes full name, email address and password; one account per email; sign-in is by email and password; a signed-in customer stays signed in until signing out (REQ-009, REQ-010, REQ-011, REQ-032 to REQ-036) |
| Build kept through sign-in | Nobody loses their work at the sign-in step | A visitor's chosen parts and total are still there after signing in or creating an account, and the flow continues to checkout (REQ-012, REQ-015) |
| Checkout | Review the order, then submit it | The review lists every chosen part by category with its price and the final total; confirming submits the order (REQ-013, REQ-014, REQ-040) |
| Confirmation | The end of the flow | The customer sees the ordered parts and the final total, and nothing further is required; there is no order history (REQ-014, REQ-029) |
| Sample catalogue | Parts available from day one | 21 pre-loaded sample parts, three per category, with prices, so the app can be used and tested immediately (REQ-016) |
| Language switch | English and Indonesian, changed on the page you are on | A switcher offering "English" and "Bahasa Indonesia" sits on every page and in every loading, empty and error state; choosing one changes the whole page at once and loses nothing — not the build, not the total, not a half-typed form (REQ-042, REQ-043, REQ-056) |
| Language remembered | The choice survives the visit | A first-time visitor sees Indonesian; the app does not guess from the browser or country; a visitor's choice is remembered on that device and the next visit opens in it (REQ-044, REQ-045) |
| Language on the account | One customer, one language, on every device | A new account is stored with the switcher's language at sign-up; signing in shows the account's language on any device; a signed-in customer changes it from the switcher and it is saved at once; only its owner can change it (REQ-046, REQ-047, REQ-048, REQ-058 to REQ-060) |
| Two-language copy | Nothing left in one language only | Every customer-visible string — category names, headings, buttons, labels, validation and error messages, empty and loading states, the order review and summary labels — exists in both languages, one language shown at a time, never a raw key; product and brand names stay as they are in both, and Indonesian uses the formal "Anda" register (REQ-049, REQ-050, REQ-051) |
| Language edges | What happens at the seams | Signing in applies the account's language over the device's; signing out keeps the last language on the device; a missing or invalid stored language shows Indonesian without blocking sign-in; a missing copy falls back to Indonesian instead of a blank page; switching never submits or changes an order (REQ-052 to REQ-057) |

## What this product is not

No compatibility checking, no stock levels, no discounts, no online payment, no
delivery details, no order history or tracking, no admin screen (for parts or
for translations), no saved or shared builds, no password reset. The language is
English or Indonesian only — no third language, no automatic detection from the
browser, and no translated product names. The reasoning for each is recorded in
[`spec.md`](spec.md) under "Non-Goals" and "What this revision does not change".
