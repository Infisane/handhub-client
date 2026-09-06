# Invoice Payment-Timing Redesign — Frontend Implementation Guide

Four changes shipped together as one redesign: invoices now separate labor from materials,
materials get paid immediately when an invoice is accepted (workmanship stays held until the
job is confirmed done), providers can request extra materials mid-job, and two new endpoints
replace the old "either side can mark the job done" status route.

Every payload below is captured from a live dev server, run through the real chat → invoice →
accept → pay → start → confirm-completion flow end to end — both the wallet path and, separately,
a real Flutterwave test-mode checkout (Paystack is still disabled in every environment,
`PAYSTACK_ENABLED=false`) — against disposable provider/customer accounts cleaned up afterward.

---

## 1. Invoice line items now require `kind`

```
POST /api/tickets/:id/invoice
```

```json
{
    "lineItems": [
        { "description": "New pipe", "quantity": 1, "unitPrice": 3000, "kind": "material" },
        { "description": "Labor", "quantity": 1, "unitPrice": 7000, "kind": "labor" }
    ],
    "description": "Pipe repair"
}
```

`kind` is `"labor"` or `"material"` and is **required** on every line item now — this is the one
breaking DTO change. It drives everything else below: which portion gets paid upfront, and what
a mid-job "add materials" request is allowed to contain.

Response (unchanged shape, `kind` just flows through):

```json
{
    "id": "9bed4ceb-d816-4d7e-9d62-080a10226b3e",
    "invoiceRef": "INV-5DON58",
    "ticketId": "a710b314-2986-4b74-894e-664d9c0c4aed",
    "lineItems": [
        { "kind": "material", "quantity": 1, "unitPrice": 3000, "description": "New pipe" },
        { "kind": "labor", "quantity": 1, "unitPrice": 7000, "description": "Labor" }
    ],
    "totalAmount": "10000.00",
    "status": "pending"
}
```

---

## 2. Accepting an invoice → pay immediately (materials now, not after the job)

`PATCH /api/invoices/:id/accept` is unchanged — same call, same response. What changes is what
you do **right after** a successful accept: you can now call the existing payment endpoints
immediately, while the booking is still `accepted` (previously they only worked once a booking
reached `completed`).

There are two different payment paths here, and **they don't behave the same way** — this is
important, don't assume online/card mirrors wallet.

### 2a. Wallet — `POST /api/payments` — synchronous, split visible immediately

```json
{
    "bookingId": "5d4aa9ca-cc26-4c82-b93c-c6f79c72932d",
    "invoiceId": "9bed4ceb-d816-4d7e-9d62-080a10226b3e",
    "paymentMethod": "wallet"
}
```

**Response shape changed** when `invoiceId` is supplied: instead of one payment object, you get
an **array** of one or two rows — one per non-zero portion of the invoice, settled in the same
request:

```json
[
    {
        "id": "d62427b3-f981-43d2-bd3e-f3baed4d1345",
        "bookingId": "5d4aa9ca-cc26-4c82-b93c-c6f79c72932d",
        "amount": "3000.00",
        "kind": "materials",
        "status": "released",
        "invoiceId": "9bed4ceb-d816-4d7e-9d62-080a10226b3e",
        "transactionReference": "TXN-1788159831528-MAT"
    },
    {
        "id": "7649862f-4236-4bfa-a2fd-e5c153d47175",
        "bookingId": "5d4aa9ca-cc26-4c82-b93c-c6f79c72932d",
        "amount": "7000.00",
        "kind": "workmanship",
        "status": "held",
        "invoiceId": "9bed4ceb-d816-4d7e-9d62-080a10226b3e",
        "transactionReference": "TXN-1788159831528-WRK"
    }
]
```

- **`materials`** — `status: "released"` immediately; this is the money that actually moved.
- **`workmanship`** — `status: "held"`; stays that way until the customer confirms completion
  (§4). No further action needed from the frontend — it releases automatically.
- An invoice with only labor items (no materials) produces a single `workmanship` row, still
  `held`. An invoice with only materials produces a single `materials` row, released immediately
  — nothing left to hold, so the invoice is fully `paid` right away.
- **Calling this with no `invoiceId` still returns a single object, unchanged** — this only
  affects the invoice-linked, split-payment path. A booking with no linked invoice (the
  direct-booking flow, no chat/invoice involved) behaves exactly as before, including still
  requiring the booking to be `completed` before you can pay.

This is the path that's actually live-verified end to end (see the intro) — accept → pay by
wallet → split rows exist immediately in the response.

### 2b. Online/card — `POST /api/payments/online/initiate` — asynchronous, split is NOT in this response

This is the "straight to the payment gateway" endpoint. Same request shape as 2a — you need a
`callbackUrl` too, Flutterwave rejects the request without one (`redirect_url` is mandatory on
their side). **Its response is a `PaymentTransaction`, not a payment row or an array — this never
changes, invoice-linked or not** (real, live-captured example — a genuine Flutterwave test-mode
checkout):

```json
{
    "id": "62778227-89a8-42b0-896f-3710b0311559",
    "bookingId": "2efd26e2-8627-40d3-be18-5e167774cb93",
    "providerName": "flutterwave",
    "reference": "HH-1788206178958-6a49aad4",
    "amount": "10000.00",
    "currency": "NGN",
    "status": "initiated",
    "paymentUrl": "https://checkout-v2.dev-flutterwave.com/v3/hosted/pay/0d8dc1d669a550606231"
}
```

`amount` here is already the **invoice total** (not `booking.price`), matching what 2a charges —
confirmed live, since a supplemental invoice's total can differ from the original booking price.

The actual `materials`/`workmanship` split doesn't exist yet at this point — those rows only get
created once the gateway confirms the charge, which happens **later and out-of-band**: either
the customer completes checkout and your app calls `GET /api/payments/online/:reference/verify`
(also just returns the transaction, same shape as above with `status` updated to `"successful"` —
still no split info in that response either), or the provider's webhook fires first and settles
it server-side before you ever call verify. Either way, the `Payment` rows get created and split
behind the scenes using the identical materials-released/workmanship-held logic as 2a — it's the
same code path, just triggered by a webhook/verify instead of the customer's original request.
**Confirmed live** with a real completed Flutterwave test-mode payment: `verify` returned
`status: "successful"`, and a follow-up `GET /api/payments/booking/:bookingId` showed the same
`materials: released` / `workmanship: held` split as the wallet path, then the same
start/confirm-completion round trip auto-released the held workmanship and flipped the invoice
to `paid`, identically to §4.

**So: to show the customer "₦3,000 paid now, ₦7,000 held until the job's done" after an online
payment, don't look at `initiate` or `verify`'s response for it — call
`GET /api/payments/booking/:bookingId` (§3) after redirecting back from the gateway** (or after
your app receives whatever signal you use to know checkout finished) to fetch the resulting
rows. Poll it a couple of times if you land back before the webhook has processed.

---

## 3. `GET /api/payments/booking/:bookingId` now always returns an array

Previously one object or `404`. Now always an array (empty-safe — check `.length`), oldest row
first:

```json
[
    { "id": "...", "kind": "materials", "status": "released", "amount": "3000.00" },
    { "id": "...", "kind": "workmanship", "status": "released", "amount": "7000.00" }
]
```

For a direct-pipeline booking (no invoice) you'll just get a one-item array with `kind: null`.

---

## 4. Two new endpoints replace the old "mark in-progress / mark completed" calls

**Provider marks work started:**

```
POST /api/bookings/:id/start
```

No body. Provider-only — 403 if called by anyone else. Booking must be `accepted` — 400
otherwise. Returns the updated booking, `startedAt` now set:

```json
{ "id": "...", "status": "in_progress", "startedAt": "2026-08-31T07:04:27.638Z", ... }
```

**Customer confirms the job is done:**

```
POST /api/bookings/:id/confirm-completion
```

No body. Customer-only — 403 for anyone else. Booking must be `in_progress` — 400 otherwise.
Returns the updated booking, `completedAt` now set. **This is also what releases any held
workmanship payment and flips the invoice to `paid`** — no separate call needed, it happens
automatically the instant this succeeds.

**The old route is now locked out of both transitions — this is the breaking change to
update for.** `PATCH /api/bookings/:id/status` with `{"status": "in_progress"}` or
`{"status": "completed"}` now returns, for **either** the customer or the provider:

```json
{
    "status": "error",
    "statusCode": 400,
    "message": "Use the dedicated endpoint to transition to 'in_progress'"
}
```

Live-captured. Every other status transition on that route (`accepted`, `declined`,
`rescheduled`, `negotiating`, `cancelled`) is unchanged — only these two moved. If your UI
currently calls the generic status endpoint for "start job" / "mark complete" buttons, point
those buttons at the two new routes instead.

Why: previously _either_ party could silently self-trigger both of these with no counterparty
involvement at all (only ownership was checked, not role) — a customer could mark their own
booking `completed` unilaterally. That's now impossible; completion always requires the
customer's explicit confirmation, and only the provider can start the clock.

This applies to **every** booking, including ones created without a chat/invoice at all (the
direct `POST /api/bookings` flow) — both pipelines share the same two new endpoints.

---

## 5. Mid-job "request additional materials"

No new endpoint — reuse the exact same two calls from §1/§2, on the **same ticket** that already
has a booking on it:

```
POST /api/tickets/:id/invoice
```

```json
{
    "lineItems": [
        { "description": "Extra fitting", "quantity": 1, "unitPrice": 1500, "kind": "material" }
    ]
}
```

The backend detects this is a supplemental request because the ticket already has a booking, and
**only accepts `material`-kind line items** here — live-captured rejection:

```json
{
    "status": "error",
    "statusCode": 400,
    "message": "Additional-materials requests can only include material line items"
}
```

Also blocked once the booking is already finished:

```json
{
    "status": "error",
    "statusCode": 400,
    "message": "Cannot request additional materials on a finished booking"
}
```

Customer approves it the same way — `PATCH /api/invoices/:id/accept` — **the response's
`booking.id` will be the same booking that already existed**, not a new one:

```json
{
    "invoice": { "id": "5e7aa151-...", "status": "accepted", "totalAmount": "1500.00", ... },
    "booking": { "id": "80b04662-bf56-42e6-950c-6f1ecbe94444", ... }
}
```

From here, pay it exactly like §2 — `POST /api/payments` (or `/online/initiate`) with this new
`invoiceId` — it settles completely independently of the original invoice's payment rows (a
materials-only supplemental invoice releases in full immediately, same as the materials-only
case in §2).

**UI suggestion**: render this the same way you already render an invoice card in the chat
thread — it's the same `INVOICE_ISSUED`/`INVOICE` system-card event over the WebSocket, just with
fewer/only-material line items. No new message type or event to handle.

---

## 6. Summary of what to update

| What                                  | Change                                                                                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Invoice creation form                 | `kind` (`labor`/`material`) now required per line item                                                                                                                 |
| Accept-invoice flow                   | can chain straight into `POST /payments` or `/payments/online/initiate` immediately — no need to wait for job completion                                               |
| Wallet payment response handling      | when `invoiceId` was sent, expect an **array**, not one object (§2a)                                                                                                   |
| Online/card payment response handling | `initiate`/`verify` responses are unchanged (a `PaymentTransaction`, never an array) — fetch the split from `GET /payments/booking/:id` after checkout completes (§2b) |
| `GET /payments/booking/:id`           | now always an array                                                                                                                                                    |
| "Start job" / "Mark complete" buttons | point at `POST /bookings/:id/start` and `POST /bookings/:id/confirm-completion` instead of the generic status route                                                    |
| "Request more materials" (new)        | reuse the existing invoice-issue UI, material-only, on an already-booked ticket                                                                                        |
