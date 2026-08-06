# Dashboard Statistics — Frontend Integration Guide

Backend work for the "Dashboard Statistics — Backend Endpoint Request" audit is complete. This
covers every endpoint the dashboard needs: what changed, what to call, and real payloads captured
against a live dev server.

## Summary of what changed vs. the original audit

Three things the audit assumed were missing already existed — wire these up directly, no new
backend work needed:

| Audit assumption | Reality |
| --- | --- |
| No endpoint for "reviews I've written" | `GET /api/reviews/me` already exists |
| Booking state can only be derived from threads | `GET /api/bookings` already exists — use it directly instead of deriving state from thread data |
| Only wallet deposit is implemented | `POST /api/wallet/withdraw` already works |

What's new in this pass: booking list filters, an enriched wallet summary, transaction
enrichment, and a real unread-message-count endpoint.

**Saved payment cards are out of scope** (deferred — needs Paystack/Flutterwave tokenization,
a separate initiative).

---

## 1. Dashboard Home — "Active Jobs" tile

Stop deriving this from thread data. Call:

```
GET /api/bookings?status=in_progress
```

or accepted/pending, whatever the tile is meant to represent — count/filter client-side. See
[§4](#4-bookings-list--statusreviewed-filters) for the full filter contract.

---

## 2. Wallet summary (balance + escrow + monthly trend)

```
GET /api/wallet
```

One round trip for everything the wallet card / Payments page needs on load.

```json
{
  "id": "7c580b4a-7a8e-44e2-b3eb-9e6009267b5d",
  "userId": "0756c41c-aad9-4aa3-a24b-4653fe64479b",
  "balance": "15000.00",
  "escrowBalance": "5000.00",
  "heldPayments": [
    {
      "paymentId": "d9273a37-675c-4658-a440-84efa012f798",
      "bookingId": "877503a7-7425-4946-bba4-bfad1aa13595",
      "serviceTitle": "Kitchen sink plumbing",
      "amount": "5000.00"
    }
  ],
  "monthlyTotals": { "currentMonth": "5000.00", "previousMonth": "0" }
}
```

- `balance` — spendable wallet balance (unchanged from before).
- `escrowBalance` — sum of the customer's `held` payments. **`"0.00"` and an empty
  `heldPayments` array most of the time** — see the escrow note below.
- `monthlyTotals` — sum of debit transactions (wallet payments + withdrawals) for the current
  and previous calendar month. Use this for the spend-trend arrow. `previousMonth` renders as
  the bare string `"0"` (not `"0.00"`) when there's no prior activity — a `COALESCE` artifact,
  parse with `Number()` rather than string-comparing.

> **⚠️ Escrow is being deprecated.** Only `paymentMethod: "card"` payments ever sit in `held`
> status — `wallet` payments (the common path) settle instantly on creation (see §3), so
> `escrowBalance`/`heldPayments` will be `0.00`/`[]` for most customers, most of the time. Build
> this as an isolated, easily-removable card/section rather than threading it through other
> components — it's expected to go away. Don't invest in dedicated empty-state design for it.

---

## 3. Wallet transaction history (enriched)

```
GET /api/wallet/transactions?limit=20&offset=0&type=debit&category=payment
```

`type` (`credit`/`debit`) and `category` (`deposit`/`withdrawal`/`payment`/`release`/`refund`/
`clawback`) are both optional filters, unchanged from before. What's new: booking-related rows
now carry resolved display data instead of just a reference string.

```json
{
  "data": [
    {
      "id": "a4fa70f0-85e8-47e0-a64c-4fbb7eefb4d8",
      "walletId": "7c580b4a-7a8e-44e2-b3eb-9e6009267b5d",
      "type": "debit",
      "category": "payment",
      "amount": "5000.00",
      "description": "Payment for booking e63c8673-abf3-4903-a9b7-4456f37edf3a",
      "reference": "PAY-e63c8673-abf3-4903-a9b7-4456f37edf3a",
      "balanceAfter": "15000.00",
      "createdAt": "2026-08-05T22:03:18.722Z",
      "bookingId": "e63c8673-abf3-4903-a9b7-4456f37edf3a",
      "ticketId": null,
      "artisanName": "Smoke Test Repairs",
      "avatar": null
    },
    {
      "id": "931fdc49-1a42-4087-8809-d81db99b3498",
      "walletId": "7c580b4a-7a8e-44e2-b3eb-9e6009267b5d",
      "type": "credit",
      "category": "deposit",
      "amount": "20000.00",
      "description": "Wallet top-up",
      "reference": "DEP-1785967396428",
      "balanceAfter": "20000.00",
      "createdAt": "2026-08-05T22:03:16.799Z",
      "bookingId": null,
      "ticketId": null,
      "artisanName": null,
      "avatar": null
    }
  ],
  "meta": { "total": 2, "limit": 20, "offset": 0 }
}
```

New fields, always present, resolved server-side:

- `bookingId` — set for `PAY-`/`RELEASE-` rows, `null` otherwise (deposits, withdrawals, fraud
  refunds/clawbacks).
- `ticketId` — set **only if** the booking happens to have an associated conversation ticket
  (i.e. it originated from an accepted invoice in a chat thread). A booking created directly via
  `POST /api/bookings` has no ticket, so this is commonly `null` even when `bookingId` is set.
  Don't treat `null` here as an error — guard any "view conversation" link on its presence.
- `artisanName` / `avatar` — the provider's `businessName` (falls back to `title`, then the
  provider's `fullName`) and avatar. `null` when there's no associated booking.

Withdrawal example:

```json
{
  "id": "e2c9d35d-94ad-4727-80f0-078e29ea7a4c",
  "userId": "...",
  "balance": 8900
}
```
`POST /api/wallet/withdraw { "amount": 100 }` — already implemented, just needs wiring up on
the Payments page's withdraw action.

---

## 4. Bookings list — `status`/`reviewed` filters

```
GET /api/bookings?status=completed&reviewed=false
```

Both params are optional and combine with AND.

- `status` — one of the booking status enum values (`pending`, `accepted`, `rescheduled`,
  `negotiating`, `declined`, `cancelled`, `in_progress`, `completed`).
- `reviewed` — `true` returns only bookings that already have a review; `false` returns only
  bookings that don't. Omit it to get both. **This is the endpoint for the "pending reviews"
  list on the Reviews page** — call `GET /api/bookings?status=completed&reviewed=false`.

Response is an array of full booking objects (unchanged shape), e.g.:

```json
[
  {
    "id": "877503a7-7425-4946-bba4-bfad1aa13595",
    "bookingRef": "HH-T7VHH5",
    "customerId": "a7fdd3ea-...",
    "customer": { "id": "a7fdd3ea-...", "fullName": "Ada Okafor", "phone": "+234...", "avatar": null },
    "providerId": "98e70c78-...",
    "provider": { "id": "98e70c78-...", "businessName": "Smoke Test Repairs", "averageRating": "5.0", "...": "..." },
    "serviceTitle": "Kitchen sink plumbing",
    "status": "completed",
    "price": "5000.00",
    "completedAt": "2026-08-05T22:03:26.740Z",
    "createdAt": "2026-08-05T22:03:23.636Z"
  }
]
```

Note the embedded `customer` object is now a narrow, whitelisted projection (`id`, `fullName`,
`phone`, `avatar`) rather than the full user record — this was tightened server-side just before
this doc was written (it previously included the customer's bcrypt password hash; fine to ignore
if you weren't reading those extra fields, but don't rely on any `customer.*` field beyond the
four listed above going forward).

After submitting a review (`POST /api/reviews`), re-fetch with the same filter and the booking
will have dropped out of the `reviewed=false` list.

---

## 5. Reviews written by the customer

```
GET /api/reviews/me
```

Already implemented — no backend work needed. Returns the customer's own written reviews:

```json
[
  {
    "id": "803cede5-4edf-4776-9446-6f6d2bd47915",
    "bookingId": "877503a7-7425-4946-bba4-bfad1aa13595",
    "customerId": "a7fdd3ea-...",
    "providerId": "98e70c78-...",
    "rating": 5,
    "comment": "Great job, on time and professional.",
    "createdAt": "2026-08-05T22:03:36.191Z"
  }
]
```

---

## 6. Unread message count (badge UI)

```
GET /api/threads/unread-count
```

Backs all three badge locations (floating chat button, desktop sidebar, mobile tab bar) — one
total count, not per-conversation.

```json
{ "count": 2 }
```

**Behavior to build around:**
- The count only decrements when the user actually **fetches** the thread or ticket
  (`GET /api/threads/:id` or `GET /api/tickets/:id`) — opening the conversation screen, not just
  seeing a push notification. Call the unread-count endpoint again after navigating back from a
  conversation to refresh the badge.
- Poll this on an interval or refetch on focus/websocket-message-received; there's no
  push-driven unread delta yet, just the total.

---

## Auth

All endpoints above require `Authorization: Bearer <jwt>` except none — every one of them is
behind `JwtAuthGuard`. Standard 401 on missing/expired token, same as the rest of the API.

## Not backend work

- **"Find Artisans: 48" meaning** (nearby vs. something else) — the data source (`meta.total`
  from the search/list endpoint) works identically either way; this is a copy/product decision.
