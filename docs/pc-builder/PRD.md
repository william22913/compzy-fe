---
feature_code: pc-builder
service: compzy
spec_version: 1
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

## Product Goal

Let a customer assemble a complete PC and know its price without staff
involvement, then place the order online — and let the store keep a record of
what was ordered. The single success measure is that the whole journey works
end to end: open the app, pick parts, see the total, sign in, review and
submit.

## Features

| Feature | Description | Expected behaviour |
|---|---|---|
| Browse parts | The seven categories and the parts on offer, visible immediately | A visitor sees Processor (CPU), Motherboard, RAM, Storage (SSD), Graphics Card, Power Supply and PC Case, each part with its name and price, and no sign-in prompt (REQ-001, REQ-002, REQ-016) |
| Build and swap | One part per category, replaceable and removable | Choosing a second part in a category replaces the first; a chosen part can be removed; a build never holds two parts from one category (REQ-003, REQ-004, REQ-037) |
| Live total | A running price for the current build | The total starts at Rp 0 and updates immediately on every choice, swap or removal, as the plain sum of the chosen prices with no tax or shipping (REQ-005, REQ-006) |
| Rupiah pricing | Prices in the store's currency and style | Every price and the total read like "Rp 12.500.000" — "Rp " prefix, dot thousands separators, no decimals (REQ-007) |
| Completion rule | What makes a build ready to order | Processor, Motherboard, RAM, Storage, Power Supply and PC Case are required; Graphics Card is optional; checkout is available once the six required categories are filled (REQ-008, REQ-038) |
| Account | Create an account, sign in, sign out | Sign-up takes full name, email address and password; one account per email; sign-in is by email and password; a signed-in customer stays signed in until signing out (REQ-009, REQ-010, REQ-011, REQ-032 to REQ-036) |
| Build kept through sign-in | Nobody loses their work at the sign-in step | A visitor's chosen parts and total are still there after signing in or creating an account, and the flow continues to checkout (REQ-012, REQ-015) |
| Checkout | Review the order, then submit it | The review lists every chosen part by category with its price and the final total; confirming submits the order (REQ-013, REQ-014, REQ-040) |
| Confirmation | The end of the flow | The customer sees the ordered parts and the final total, and nothing further is required; there is no order history (REQ-014, REQ-029) |
| Sample catalogue | Parts available from day one | 21 pre-loaded sample parts, three per category, with prices, so the app can be used and tested immediately (REQ-016) |
| English interface | The language of the whole site | Page titles, buttons, messages, errors and the order confirmation are in English (REQ-017) |

## What this product is not

No compatibility checking, no stock levels, no discounts, no online payment, no
delivery details, no order history or tracking, no admin screen, no saved or
shared builds, no password reset, and no second language. The reasoning for
each is recorded in [`spec.md`](spec.md) under "Non-Goals".
