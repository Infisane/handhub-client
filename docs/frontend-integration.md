# Frontend Integration Guide — Chat-First Booking Flow

This guide documents the **real, shipped** contracts for the conversation → invoice → booking → payment → review flow. Every payload below is taken from the running API.

- **REST base:** `http://<host>:<port>/api` (dev default `http://localhost:8088/api`)
- **WebSocket:** `ws://<host>:<port>/ws`
- **Transport model:** you **send over REST**, you **receive live over WebSocket**. The DB is the source of truth; the socket is a live accelerant. If a socket event is missed (offline, reconnect), re-fetch from REST — nothing is lost.

---

## 1. Auth

### Login / Register

```
POST /api/auth/login
{ "credential": "seed.plumber@handhub.test", "password": "@Password123", "userType": "provider" }

POST /api/auth/register
{ "fullName": "...", "email": "...", "phone": "...", "password": "...", "userType": "customer" }
```

Both return a JWT:

```json
{ "token": "eyJhbGci...", "user": { "id": "...", "userType": "customer" } }
```

Store the token and attach it to:

- **Every REST call:** `Authorization: Bearer <token>`
- **The WebSocket auth frame** (see §3).

> `userType` is `customer` | `provider` | `admin`. Note that a **provider can also hire another provider** — do not assume the "customer side" of a conversation is a `customer` account. Membership is by user id, not role (see §4).

---

## 2. REST Reference

All routes below require `Authorization: Bearer <token>` unless noted. Common errors and the UI state they map to:

| Status | Meaning                                          | Suggested UI                        |
| ------ | ------------------------------------------------ | ----------------------------------- |
| `401`  | Missing/expired token                            | Redirect to login                   |
| `403`  | Not a participant / not your invoice / self-hire | Toast "Not allowed", hide action    |
| `404`  | Thread/ticket/invoice/booking not found          | "Not found" empty state             |
| `400`  | Validation / illegal state (see message)         | Inline field or action error        |
| `409`  | Conflict (already booked/paid/exists)            | Refresh entity; the action is stale |

**Error envelope** — every error shares this shape (from the global exception filter):

```json
{ "status": "error", "statusCode": 403, "message": "You cannot start a conversation with yourself" }
```

For `400` validation failures, `message` is an **array of strings**:

```json
{ "status": "error", "statusCode": 400, "message": ["lineItems must contain at least 1 elements"] }
```

Always handle `message` as `string | string[]`.

### 2.1 Threads (inbox)

**`GET /api/threads`** — list my conversation threads.

```json
[
    {
        "id": "6b967aff-...",
        "provider": {
            "id": "c4673807-...",
            "userId": "64d5...",
            "title": "Expert Plumber",
            "businessName": null
        },
        "initiatorId": "86a97eb7-...",
        "activeTicket": { "id": "c1a6...", "ref": "TKT-XY12AB", "status": "open" },
        "lastMessage": {
            "content": "Leaking pipe, need a fix",
            "type": "text",
            "createdAt": "2026-07-05T00:22:01.000Z"
        },
        "updatedAt": "2026-07-05T00:22:02.000Z"
    }
]
```

Ordered by `updatedAt DESC`. Use `activeTicket.status` for the badge and `lastMessage` for the preview.

**`GET /api/threads/:id`** — full thread with all tickets (history is browsable here).

```json
{
  "id": "6b96...",
  "initiatorId": "86a9...",
  "provider": { "id": "c467...", "userId": "64d5...", "title": "Expert Plumber", "businessName": null },
  "tickets": [
    {
      "id": "c1a6...", "ref": "TKT-XY12AB", "status": "closed",
      "bookingId": "36ce...", "booking": { ...booking }, "intakeSummary": { "serviceType": "Plumbing", ... },
      "invoices": [ { ...invoice } ],
      "messages": [ { ...message }, ... ]
    }
  ]
}
```

Tickets are ordered oldest-first; each carries its own `messages`, `invoices`, and `booking`.

**`POST /api/threads/:providerId/messages`** — send a message to a provider (the "Hire" → chat action). `:providerId` is the **provider-profile id** (from `GET /api/providers`). Creates the thread + first ticket on first use.

```
Body: { "content": "I have a leaking kitchen pipe, can you help today?" }
```

Returns the persisted message (this is your delivery receipt):

```json
{
    "id": "84c5...",
    "senderId": "293c...",
    "receiverId": "64d5...",
    "bookingId": null,
    "ticketId": "7739...",
    "type": "text",
    "metadata": null,
    "content": "I have a leaking kitchen pipe, can you help today?",
    "isRead": false,
    "createdAt": "2026-07-05T00:21:36.629Z",
    "threadId": "6b96..."
}
```

Errors: `404` provider not found · `400` provider not accepting requests · `403` cannot message yourself.

### 2.2 Tickets

**`GET /api/tickets/:id`** — single ticket with `messages`, `invoices`, `booking`, `intakeSummary`.

**`POST /api/tickets/:id/messages`** — reply within an existing thread (either participant). Same body/response as the thread message endpoint. If the ticket is closed/cancelled, a fresh ticket is opened automatically and returned in `ticketId`.

**`PATCH /api/tickets/:id/cancel`** — either participant cancels an active ticket → `status: "cancelled"`. `400` if the ticket is already terminal.

**`POST /api/tickets/:id/invoice`** — _provider only._ Generate an invoice.

```
Body: {
  "description": "Pipe repair",
  "lineItems": [
    { "description": "Labour", "quantity": 1, "unitPrice": 8000 },
    { "description": "Materials", "quantity": 2, "unitPrice": 1500 }
  ]
}
```

Returns the invoice (`status: "pending"`, `totalAmount` computed server-side). Errors: `403` only the provider can invoice · `400` ticket not invoiceable **or** an invoice is already pending ("Recall it before issuing another.").

### 2.3 Invoices

`totalAmount` is returned as a **decimal string** (e.g. `"11000.00"`) — parse before arithmetic.

**`GET /api/invoices/:id`** — invoice details (participants only).

**`PATCH /api/invoices/:id/accept`** — _customer side._ Accepts → creates the booking atomically.

```json
{
  "invoice": { "id": "af65...", "invoiceRef": "INV-QHHATY", "status": "accepted", "totalAmount": "11000.00", ... },
  "booking": { "id": "36ce...", "bookingRef": "HH-DA5WJF", "status": "accepted", "price": "11000.00", "agreedPrice": 11000, ... }
}
```

Errors: `403` not your invoice · `409` invoice not pending **or** ticket already booked.

**`PATCH /api/invoices/:id/reject`** — _customer side._ → invoice `rejected`, ticket back to `open`. `409` if not pending.

**`PATCH /api/invoices/:id/void`** — _provider only._ Recall a mistaken pending invoice → invoice `voided`, ticket `open`, provider can reissue. `409` if not pending. (Accept/void race is settled transactionally — the loser gets `409`.)

### 2.4 Payment

**`POST /api/payments`** — _customer._ Allowed **only after the booking is `completed`** (pay-on-delivery).

```
Body: { "bookingId": "36ce...", "paymentMethod": "wallet", "invoiceId": "af65..." }
```

- `paymentMethod` is `wallet` (default) | `card`. **The customer chooses** — pre-select wallet.
- `invoiceId` is optional but recommended; it is marked `paid` on success and validated against the booking's ticket.

**Wallet** → captures and auto-releases to the provider in one step; returns the payment (`status: "released"`).
**Card** → returns `{ "paymentId": "...", "authorizationUrl": "..." }`; redirect the user to `authorizationUrl`. Settlement completes asynchronously (see §6).

Errors: `400` "Payment can only be made after the service is completed" · `400` "Insufficient wallet balance" (offer card retry) · `409` payment already exists · `400` invoice mismatch / not accepted.

Related: `GET /api/payments/booking/:bookingId` returns the payment for a booking.

### 2.5 Booking status (delivery)

Driven by the existing bookings API:

```
PATCH /api/bookings/:id/status   Body: { "status": "in_progress" }   (provider)
PATCH /api/bookings/:id/status   Body: { "status": "completed" }     (provider)
```

Invoice-created bookings start at `accepted`; allowed path is `accepted → in_progress → completed`.

### 2.6 Review (closes the ticket)

**`POST /api/reviews`** — _customer._ Requires the booking `completed` **and** its invoice `paid`.

```
Body: { "bookingId": "36ce...", "rating": 5, "comment": "Excellent, fixed quickly!" }
```

On success the ticket auto-transitions to `closed`. Errors: `400` "You can only review after the invoice has been paid" · `409` already reviewed.

### 2.7 Provider AI-intake toggle

**`PATCH /api/providers/me`** _(provider)_ — `{ "aiIntakeEnabled": false }` disables the AI concierge for that provider's chats (default `true`).

---

## 3. WebSocket Protocol

Connect to `ws://<host>:<port>/ws`, then authenticate before you can receive anything:

```js
const ws = new WebSocket('ws://localhost:8088/ws');
ws.onopen = () => ws.send(JSON.stringify({ event: 'auth', data: { token } }));
```

Server → client frames are always `{ type, payload }` (except the auth ack):

| Frame                                                                             | When                               | Payload              |
| --------------------------------------------------------------------------------- | ---------------------------------- | -------------------- |
| `{ "type": "auth_ok", "userId": "..." }`                                          | auth succeeded                     | —                    |
| `{ "type": "auth_error", "message": "Invalid token" }`                            | auth failed                        | re-auth              |
| `{ "type": "message", "payload": <Message + threadId + ticketId> }`               | any new text / system / ai message | render in the ticket |
| `{ "type": "invoice", "payload": <Invoice> }`                                     | provider issued an invoice         | show invoice card    |
| `{ "type": "booking_confirmed", "payload": { bookingRef, bookingId, ticketId } }` | customer accepted an invoice       | update provider's UI |
| `{ "type": "notification", "payload": <Notification> }`                           | new-lead + other notifications     | inbox badge          |

Notes:

- Every chat `message` payload includes `threadId` and `ticketId` so you can route it to the right thread/ticket without a lookup.
- **Delivery is best-effort.** On connect/reconnect, hydrate the open thread from `GET /api/threads/:id` and treat WS as incremental patches. De-dupe by message `id`.
- Heartbeat: the server pings every 30s; the browser answers automatically. Implement reconnect with backoff and re-send the auth frame on each reconnect.
- Multi-instance safe: delivery works even when the two participants are connected to different backend instances (Redis fan-out), so no client-side changes are needed for scaling.

### 3.1 Adoption sequencing — REST-first is fine

The WebSocket server is **already live** (not future work), but **correctness never depends on it** — every WS event has a REST equivalent, and the DB is the source of truth. So you can phase adoption without any backend or contract change:

- **Milestone 1 — REST-only (recommended first cut).** Send via `POST`; hydrate via `GET /api/threads` (inbox) and `GET /api/threads/:id` (open conversation). Optionally short-poll the open thread (e.g. every 3–5 s) for near-live updates. The entire flow — message → invoice → accept → pay → review — works fully. What you give up: instant push (a provider's "new lead" ping, live-message feel).
- **Milestone 2 — add WebSocket.** Connect `/ws`, authenticate, and apply incoming `message` / `invoice` / `booking_confirmed` / `notification` frames as patches (§7); drop the polling. No endpoint, payload, or backend change.

> Don't treat this as "REST now, WebSocket blocked on backend later" — the socket layer is done and documented here. It's purely a frontend adoption choice: ship REST-first for speed, layer WS in when you want the real-time UX.

### 3.2 Troubleshooting

**"WebSocket is closed before the connection is established."** This is a **client-side lifecycle** warning, not a server rejection — the socket was `close()`d (or discarded) while still in `CONNECTING`. The server handshake is fine (verified: it returns `101` then `auth_ok`). Almost always it's **React 18 StrictMode** in dev running effects twice (open → cleanup closes the connecting socket → re-open); it won't appear in production. Fix by creating the socket once (store in a ref, stable deps) and deferring close until it's open:

```js
useEffect(() => {
    const ws = new WebSocket('ws://localhost:8088/ws');
    wsRef.current = ws;
    ws.onopen = () => ws.send(JSON.stringify({ event: 'auth', data: { token } }));
    return () => {
        if (ws.readyState === WebSocket.CONNECTING) {
            ws.addEventListener('open', () => ws.close(1000, 'unmount'));
        } else {
            ws.close(1000, 'unmount');
        }
    };
}, [token]);
```

Confirm via DevTools → Network → **WS**: a socket sitting at `101 Switching Protocols` means it connected fine and the warning was the benign double-mount.

Also: never call `ws.send(...)` before `onopen` fires (queue outbound messages until then), and remember the auth frame uses the **`{ event, data }`** envelope — `{ "event": "auth", "data": { "token": "..." } }` — not `{ type, payload }` (that shape is server→client only).

---

## 4. The Flow as UI States

```
[Provider list] --Hire--> [Chat opens (no DB write)]
      │ customer sends first message → POST /threads/:providerId/messages
      ▼
[Ticket: open]  ← AI "HandHub Assistant" bubbles may appear (type:"ai") until the provider replies
      │ negotiate (text messages both ways)
      │ provider → POST /tickets/:id/invoice
      ▼
[Ticket: invoiced]  → customer sees invoice card
      │ accept → PATCH /invoices/:id/accept        reject → PATCH /invoices/:id/reject (back to open)
      ▼                                            recall  → PATCH /invoices/:id/void  (provider, back to open)
[Ticket: booked]  (booking created, status "accepted")
      │ provider delivers → PATCH /bookings/:id/status in_progress → completed
      ▼
[Ticket: booked, booking completed]  → "Pay" enabled
      │ customer → POST /payments (wallet | card)
      ▼
[Invoice paid, funds released]
      │ customer → POST /reviews
      ▼
[Ticket: closed]   ← any new message here opens a NEW ticket in the same thread
```

**Membership / permissions in the UI**

- Show _Send message_ to both participants; resolve membership by `userId === thread.initiatorId || userId === thread.provider.userId`.
- Show _Generate invoice_ / _Recall invoice_ only to the provider side.
- Show _Accept_ / _Reject_ / _Pay_ / _Review_ only to the initiator side.

---

## 5. Message Rendering & System Cards

Each message has a `type` and optional `metadata`. Render by `type`:

| `type`   | Source            | Render                                                                                      |
| -------- | ----------------- | ------------------------------------------------------------------------------------------- |
| `text`   | a participant     | normal chat bubble, left/right by `senderId`                                                |
| `ai`     | HandHub Assistant | distinct assistant bubble labelled "HandHub Assistant"; `senderId` is `null`                |
| `system` | server events     | centered inline **card**, not a chat bubble (see below); `senderId`/`receiverId` are `null` |
| `image`  | _(not in v1)_     | reserved — schema-ready, no UI needed yet                                                   |

### 5.1 System cards — discriminate by `metadata.kind`

Every `system` message carries a stable `metadata.kind` — **switch on that**, never on the `content` string (which is display copy and may change). The card kinds and what they reference:

| `metadata.kind`     | Emitted when                                                                                                                                                   | `metadata` extras                   | Example `content`                                         | Suggested card                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------- | ------------------------------------------------- |
| `invoice_issued`    | provider issues an invoice                                                                                                                                     | `{ invoiceId }`                     | `Invoice INV-LU1OL1 issued — ₦11,000`                     | **Interactive invoice card** (see §5.2)           |
| `invoice_rejected`  | customer rejects                                                                                                                                               | `{ invoiceId }`                     | `Invoice INV-… declined by the customer`                  | passive notice                                    |
| `invoice_voided`    | provider recalls                                                                                                                                               | `{ invoiceId }`                     | `Invoice INV-… was recalled by the provider`              | passive notice                                    |
| `booking_confirmed` | customer accepts an invoice                                                                                                                                    | `{ bookingRef }`                    | `Booking HH-ZVURSZ confirmed`                             | booking badge / link                              |
| `intake_summary`    | AI assistant finishes intake                                                                                                                                   | `{ intakeSummary }`                 | `Intake summary ready`                                    | collapsible brief card (provider-facing)          |
| `ticket_cancelled`  | either party cancels the ticket                                                                                                                                | `{}`                                | `Ticket cancelled`                                        | passive notice                                    |
| `payment_received`  | a payment settles (wallet or online/card) — fires the moment money moves, independent of whether escrow is released immediately or held pending job completion | `{ bookingId, amount, paymentIds }` | `Payment of ₦11,000 received for "Kitchen sink plumbing"` | passive notice, both customer and provider see it |

> The `invoice_issued` card is the interactive one. For it, fetch the invoice by `metadata.invoiceId` (or use the `invoice` WebSocket payload) and render its action buttons based on the **current invoice + booking + ticket state** — see §5.2.
>
> `payment_received` only appears for bookings that went through the chat/invoice flow (they have a ticket to post into). A booking created directly via `POST /api/bookings` with no ticket never gets this card — there's no thread for it to land in.

### 5.2 Actions per state (what buttons to show, and to whom)

The visible actions on the invoice card / ticket footer are a function of `invoice.status`, `booking.status`, and who is viewing. Use this matrix:

| Phase (derived)                                     | `ticket.status` | `invoice.status`          | `booking.status`               | Customer side sees                     | Provider side sees                                |
| --------------------------------------------------- | --------------- | ------------------------- | ------------------------------ | -------------------------------------- | ------------------------------------------------- |
| Negotiating                                         | `open`          | — / `rejected` / `voided` | —                              | send message                           | send message · **Generate invoice**               |
| Invoice offered (original or supplemental)          | `invoiced`\*\*  | `pending`                 | — / `accepted` / `in_progress` | **Accept** · **Reject** · send message | **Recall invoice** · send message                 |
| Awaiting delivery — invoice paid                    | `booked`        | `accepted`                | `accepted`                     | **Pay** · send message                 | **Start job** (→ `in_progress`) · send message    |
| In progress — no unpaid invoice                     | `booked`        | `accepted` (already paid) | `in_progress`                  | send message                           | **Mark completed** (→ `completed`) · send message |
| In progress — supplemental invoice accepted, unpaid | `booked`        | `accepted`                | `in_progress`                  | **Pay** · send message                 | **Mark completed** (→ `completed`) · send message |
| Delivered — direct-pipeline booking, no invoice     | n/a             | n/a                       | `completed`                    | **Pay** (wallet/card) · send message   | send message                                      |
| Paid — awaiting review                              | `booked`        | `paid`                    | `completed`                    | **Leave review** · send message        | send message                                      |
| Closed                                              | `closed`        | `paid`                    | `completed`                    | send message*                          | send message*                                     |
| Cancelled                                           | `cancelled`     | any                       | —                              | send message*                          | send message*                                     |

\* Sending a message on a `closed`/`cancelled` ticket transparently **opens a new ticket** in the same thread (the response's `ticketId` will be the new one).

\*\* A ticket already `booked` stays `booked` while a mid-job supplemental (additional-materials) invoice is offered — `ticket.status` doesn't revert to `invoiced` for these. Key off `invoice.status` on the newest invoice for that ticket, not `ticket.status`, to decide whether to show Accept/Reject/Pay.

**The rule that actually drives "Pay" — don't gate it on `booking.status === 'completed'`:** for any invoice-linked booking, Pay becomes available the instant that invoice's `status` reaches `accepted`, regardless of whether `booking.status` is `accepted`, `in_progress`, or `completed` (only a `completed` gate applies to a **direct-pipeline booking with no invoice at all** — true pay-on-delivery). This is what makes the mid-job "request additional materials" flow work: a supplemental invoice is accepted against the _existing_ booking, which is already `in_progress` by then — if your UI only shows Pay once `booking.status === 'completed'`, the customer will never see it for that supplemental invoice. See `docs/invoice-payment-timing-implementation.md` §2 and §5 for the full payment-timing contract and worked examples.

Notes:

- The **ticket status stays `booked` through delivery, including through any mid-job supplemental invoice** — the live delivery state is carried by `booking.status` (`accepted → in_progress → completed`), not the ticket. Drive the "Start job / Mark completed" buttons off `booking.status`; drive "Pay" off the newest invoice's `status` per the rule above.
- **Cancel ticket** (`PATCH /tickets/:id/cancel`) is available to either party while the ticket is not terminal (`open`, `invoiced`, `booked`, `in_progress`).
- Only one `pending` invoice can exist per ticket at a time; a second `Generate invoice` returns `400` until the current one is accepted/rejected/voided.

**Unread/read:** messages carry `isRead`. Fetching a thread/ticket marks incoming messages read server-side; reflect counts from the inbox `lastMessage` / your own unread tracking.

---

## 6. Payments — Wallet vs Card

**Wallet (live now).** `POST /payments { paymentMethod: "wallet" }` → returns payment `status: "released"` immediately. Refresh the wallet (`GET /api/wallet`) and mark the ticket paid. If it returns `400 Insufficient wallet balance`, prompt to fund (`POST /api/wallet/deposit { amount }`) or switch to card.

**Card (mocked until live Paystack credentials).** `POST /payments { paymentMethod: "card" }` → `{ paymentId, authorizationUrl }`. Redirect the user to `authorizationUrl`.

- **Live:** Paystack calls the backend webhook; the payment settles server-side. Poll `GET /api/payments/booking/:bookingId` (or wait for a WS/refresh) until `status: "released"`.
- **Dev/mock:** the mock `authorizationUrl` is a stub. To simulate a successful charge during development, call
  `POST /api/payments/paystack/mock-complete/:reference` (the `reference` is the payment's `transactionReference`; non-production only). This drives the exact same settlement path the live webhook will.

Switching to live Paystack is a backend env change (`PAYSTACK_MODE=live` + secret key) — **no frontend change** is required.

> For the full wallet API — balance, deposit, withdraw, and the paginated/filterable transaction ledger — see **`docs/wallet-integration.md`**.

---

## 7. Suggested State Model

```
threads: { [threadId]: ThreadSummary }          // from GET /api/threads
activeThread: { id, provider, tickets: Ticket[] } // from GET /api/threads/:id
socketStatus: 'connecting' | 'open' | 'closed'
```

Wiring:

1. On app load: `GET /api/threads` → inbox. Open the WS and authenticate.
2. On opening a conversation: `GET /api/threads/:id` → hydrate tickets + messages.
3. On WS `message`: append to `tickets[ticketId].messages` (de-dupe by `id`); bump the inbox row's `lastMessage`/`updatedAt`.
4. On WS `invoice`: attach/refresh the invoice on its ticket; render the invoice card.
5. On WS `booking_confirmed`: update the provider's ticket to `booked`.
6. On reconnect: re-fetch the open thread and reconcile (REST wins; WS is incremental).

---

## 8. Quick Reference — Endpoints

| Method  | Path                                | Role          | Purpose                |
| ------- | ----------------------------------- | ------------- | ---------------------- |
| `GET`   | `/api/threads`                      | any           | Inbox                  |
| `GET`   | `/api/threads/:id`                  | member        | Thread + all tickets   |
| `POST`  | `/api/threads/:providerId/messages` | any           | Open/continue thread   |
| `GET`   | `/api/tickets/:id`                  | member        | Ticket detail          |
| `POST`  | `/api/tickets/:id/messages`         | member        | Reply                  |
| `PATCH` | `/api/tickets/:id/cancel`           | member        | Cancel ticket          |
| `POST`  | `/api/tickets/:id/invoice`          | provider      | Issue invoice          |
| `GET`   | `/api/invoices/:id`                 | member        | Invoice detail         |
| `PATCH` | `/api/invoices/:id/accept`          | customer side | Accept → booking       |
| `PATCH` | `/api/invoices/:id/reject`          | customer side | Reject                 |
| `PATCH` | `/api/invoices/:id/void`            | provider      | Recall                 |
| `POST`  | `/api/payments`                     | customer      | Pay (wallet/card)      |
| `GET`   | `/api/payments/booking/:bookingId`  | member        | Payment status         |
| `PATCH` | `/api/bookings/:id/status`          | provider      | Delivery transitions   |
| `POST`  | `/api/reviews`                      | customer      | Review → closes ticket |
| `PATCH` | `/api/providers/me`                 | provider      | Toggle AI intake       |

Interactive schema (dev): **`/docs`** (Swagger).

---

## 9. Response Structure Samples (Appendix)

Every sample below is a **verbatim response from the running API**. Field types are exactly as returned — note in particular that all money fields (`amount`, `price`, `totalAmount`, `balance`, …) come back as **decimal strings**, and `agreedPrice` is a number on create but serialises as a string when re-read.

### 9.1 `POST /api/auth/login` · `POST /api/auth/register`

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "64d56558-5e0a-4cd4-8c74-6b897d2059e7",
        "fullName": "Fatimah Idris",
        "email": "seed.plumber@handhub.test",
        "phone": "08111111002",
        "userType": "provider",
        "isVerified": false,
        "isActive": true,
        "avatar": null,
        "createdAt": "2026-07-03T21:47:36.924Z",
        "updatedAt": "2026-07-03T21:47:36.924Z"
    }
}
```

The JWT payload decodes to `{ userId, userType, iat, exp }`.

**`POST /api/auth/login` — blocked, unverified customer or provider** (verbatim, from the running API): as of this change, `login` also requires the account be email-verified for both `customer` and `provider` (not `admin`) — if not, no token is issued:

```json
{ "emailVerificationRequired": true, "message": "Please verify your email before logging in" }
```

Note the response is still `200`, not an error status — check for the presence of `token` to distinguish success from "needs verification," not the status code. Recovery flow: `POST /api/auth/email-verification/request` (or `/resend`) → `POST /api/auth/email-verification/verify` → retry `POST /api/auth/login`. A provider blocked here still needs to verify before they can reach onboarding (`POST /api/providers/onboarding/step-*` requires a token) — admin approval (`Provider.isVerified`) is a separate, later step and has no bearing on this gate.

`user.firstLoginAt` (new field, alongside the existing `lastLoginAt`) is set once, the first time login actually succeeds, and never overwritten after.

### 9.2 `POST /api/threads/:providerId/messages` · `POST /api/tickets/:id/messages`

Returns the persisted **Message** (delivery receipt). Identical shape to the `type: "message"` WebSocket payload.

```json
{
    "id": "3d6cb3b7-f67e-4cd5-8e86-9ffa30b2fc21",
    "senderId": "12a8f7ca-40e0-41a6-943b-4fe40f25a871",
    "receiverId": "64d56558-5e0a-4cd4-8c74-6b897d2059e7",
    "bookingId": null,
    "ticketId": "277acfbb-f52f-4741-9ea5-69fbd55cf9af",
    "type": "text",
    "metadata": null,
    "content": "I have a leaking kitchen pipe, can you help today?",
    "isRead": false,
    "createdAt": "2026-07-05T00:35:59.120Z",
    "threadId": "1626999a-5b5f-45d6-be66-75c8be5d8e05"
}
```

> `senderId` and `receiverId` are `null` for `system` and `ai` messages. `metadata` is `null` for `text`/`ai`, and for `system` it always carries a `kind` discriminator plus extras — e.g. `{ "kind": "invoice_issued", "invoiceId": "..." }`, `{ "kind": "booking_confirmed", "bookingRef": "..." }`, `{ "kind": "intake_summary", "intakeSummary": {...} }`. See §5.1.

### 9.3 `POST /api/tickets/:id/invoice` · `GET /api/invoices/:id` — Invoice

```json
{
    "id": "baf84c0d-e7ca-47cd-9e1b-d593c92c2e79",
    "invoiceRef": "INV-LU1OL1",
    "ticketId": "277acfbb-f52f-4741-9ea5-69fbd55cf9af",
    "providerId": "64d56558-5e0a-4cd4-8c74-6b897d2059e7",
    "customerId": "12a8f7ca-40e0-41a6-943b-4fe40f25a871",
    "lineItems": [
        { "quantity": 1, "unitPrice": 8000, "description": "Labour" },
        { "quantity": 2, "unitPrice": 1500, "description": "Materials" }
    ],
    "totalAmount": "11000.00",
    "status": "pending",
    "description": "Pipe repair",
    "createdAt": "2026-07-05T00:36:00.300Z"
}
```

`status` ∈ `pending | accepted | rejected | voided | paid`. `providerId`/`customerId` here are **user ids** (not the provider-profile id).

### 9.4 `PATCH /api/invoices/:id/accept` — `{ invoice, booking }`

```json
{
    "invoice": { "...": "as §9.3 with \"status\": \"accepted\"" },
    "booking": {
        "id": "c699e2c6-8fcb-44e5-b993-cf219f06e88d",
        "bookingRef": "HH-ZVURSZ",
        "customerId": "12a8f7ca-40e0-41a6-943b-4fe40f25a871",
        "providerId": "c4673807-83be-4ffb-88ab-b74c1cc0380b",
        "categoryId": null,
        "serviceTitle": "Pipe repair",
        "status": "accepted",
        "scheduledTime": null,
        "preferredDate": null,
        "preferredTime": null,
        "alternateDate": null,
        "alternateTime": null,
        "price": "11000.00",
        "estimatedBudget": "0.00",
        "agreedPrice": 11000,
        "notes": null,
        "jobDescription": "[{\"quantity\":1,\"unitPrice\":8000,\"description\":\"Labour\"},{\"quantity\":2,\"unitPrice\":1500,\"description\":\"Materials\"}]",
        "address": null,
        "location": null,
        "urgency": "normal",
        "specialInstructions": null,
        "providerResponse": null,
        "declineReason": null,
        "rescheduleData": null,
        "negotiationMessages": [],
        "referencePhotos": [],
        "createdAt": "2026-07-05T00:36:00.372Z"
    }
}
```

> `booking.providerId` is the **provider-profile id**; `invoice.providerId` is the provider's **user id**. `jobDescription` is a JSON **string** of the invoice line items — `JSON.parse` if you need it. `reject`/`void` return the bare updated invoice object (§9.3 shape).

### 9.5 `POST /api/payments` — Payment (wallet) & Card init

Wallet (settles immediately, `status: "released"`):

```json
{
    "id": "0f5a11c8-0602-48e9-b2fb-b70a0bf118ee",
    "bookingId": "c699e2c6-8fcb-44e5-b993-cf219f06e88d",
    "customerId": "12a8f7ca-40e0-41a6-943b-4fe40f25a871",
    "providerId": "64d56558-5e0a-4cd4-8c74-6b897d2059e7",
    "amount": "11000.00",
    "paymentMethod": "wallet",
    "status": "released",
    "transactionReference": "TXN-1783211760530",
    "createdAt": "2026-07-05T00:36:00.526Z"
}
```

Card (returns a redirect target; settlement is async):

```json
{
    "paymentId": "c304e5bd-5087-4ca6-9e16-bc1459b8774a",
    "authorizationUrl": "http://localhost:3000/mock-paystack/pay?reference=TXN-1783211784702"
}
```

`GET /api/payments/booking/:bookingId` returns the wallet-shaped Payment object above. `payment.status` ∈ `held | released | refunded | failed`; `transactionReference` is the value to pass to the dev mock-complete endpoint.

### 9.6 `GET /api/wallet` — Wallet balance

```json
{
    "id": "35d87494-6c29-4b3b-830c-d3498e641d54",
    "userId": "9907ddb7-777c-4116-a9a6-6da897ac6a57",
    "balance": "18000.00"
}
```

> This endpoint returns **balance only** — it no longer inlines the transaction list (that's now a separate, paginated resource). See **`docs/wallet-integration.md`** for `GET /api/wallet/transactions` and the deposit/withdraw endpoints.

### 9.7 `POST /api/reviews` — Review

```json
{
    "id": "b46a3e45-493a-4d5b-9f49-e0190d0e874b",
    "bookingId": "c699e2c6-8fcb-44e5-b993-cf219f06e88d",
    "customerId": "12a8f7ca-40e0-41a6-943b-4fe40f25a871",
    "providerId": "c4673807-83be-4ffb-88ab-b74c1cc0380b",
    "rating": 5,
    "comment": "Excellent, fixed quickly!",
    "createdAt": "2026-07-05T00:36:00.999Z"
}
```

### 9.8 `GET /api/tickets/:id` — Ticket detail

```json
{
    "id": "277acfbb-f52f-4741-9ea5-69fbd55cf9af",
    "ref": "TKT-7OU34X",
    "status": "closed",
    "threadId": "1626999a-5b5f-45d6-be66-75c8be5d8e05",
    "bookingId": "c699e2c6-8fcb-44e5-b993-cf219f06e88d",
    "booking": { "...": "full Booking object (status now \"completed\")" },
    "intakeSummary": null,
    "invoices": [{ "...": "Invoice, status \"paid\"" }],
    "messages": [
        {
            "id": "3d6c...",
            "senderId": "12a8...",
            "receiverId": "64d5...",
            "bookingId": null,
            "ticketId": "277a...",
            "type": "text",
            "metadata": null,
            "content": "I have a leaking kitchen pipe, can you help today?",
            "isRead": false,
            "createdAt": "2026-07-05T00:35:59.120Z"
        },
        {
            "id": "6dd1...",
            "senderId": null,
            "receiverId": null,
            "bookingId": null,
            "ticketId": "277a...",
            "type": "system",
            "metadata": { "kind": "invoice_issued", "invoiceId": "baf8..." },
            "content": "Invoice INV-LU1OL1 issued — ₦11,000",
            "isRead": false,
            "createdAt": "2026-07-05T00:36:00.312Z"
        },
        {
            "id": "ecb2...",
            "senderId": null,
            "receiverId": null,
            "bookingId": null,
            "ticketId": "277a...",
            "type": "system",
            "metadata": { "kind": "booking_confirmed", "bookingRef": "HH-ZVURSZ" },
            "content": "Booking HH-ZVURSZ confirmed",
            "isRead": false,
            "createdAt": "2026-07-05T00:36:00.386Z"
        }
    ]
}
```

`intakeSummary` (when the AI assistant ran) is `{ serviceType?, description?, location?, preferredTime?, urgency? }`. Ticket `status` ∈ `open | invoiced | booked | in_progress | completed | cancelled | closed`. (`messages[].ticketId` is present; the top-level message endpoints additionally include `threadId`.)

### 9.9 `GET /api/threads/:id` — Thread detail

```json
{
    "id": "1626999a-5b5f-45d6-be66-75c8be5d8e05",
    "initiatorId": "12a8f7ca-40e0-41a6-943b-4fe40f25a871",
    "provider": {
        "id": "c4673807-...",
        "userId": "64d56558-...",
        "title": "Expert Plumber",
        "businessName": null
    },
    "tickets": [
        {
            "id": "277a...",
            "ref": "TKT-7OU34X",
            "status": "closed",
            "bookingId": "c699...",
            "booking": { "...": "Booking" },
            "intakeSummary": null,
            "invoices": [{ "...": "Invoice" }],
            "messages": [{ "...": "Message[]" }]
        }
    ]
}
```

Same nested ticket shape as §9.8, ordered oldest-first.

### 9.10 `GET /api/threads` — Inbox

```json
[
    {
        "id": "1626999a-5b5f-45d6-be66-75c8be5d8e05",
        "provider": {
            "id": "c4673807-...",
            "userId": "64d56558-...",
            "title": "Expert Plumber",
            "businessName": null
        },
        "initiatorId": "12a8f7ca-40e0-41a6-943b-4fe40f25a871",
        "activeTicket": { "id": "277a...", "ref": "TKT-7OU34X", "status": "closed" },
        "lastMessage": {
            "content": "Booking HH-ZVURSZ confirmed",
            "type": "system",
            "createdAt": "2026-07-05T00:36:00.386Z"
        },
        "updatedAt": "2026-07-05T00:36:00.388Z"
    }
]
```

`activeTicket` and `lastMessage` are `null` for a brand-new empty thread.

### 9.11 `GET /api/notifications` — Notifications (new-lead etc.)

```json
[
    {
        "id": "c214ecb9-0b7b-4d12-ab80-00589382ea52",
        "userId": "64d56558-5e0a-4cd4-8c74-6b897d2059e7",
        "title": "New conversation",
        "body": "You have a new service enquiry.",
        "type": "lead",
        "bookingId": null,
        "isRead": false,
        "createdAt": "2026-07-05T00:24:14.388Z"
    }
]
```

This is also the `type: "notification"` WebSocket payload. New-conversation events use `type: "lead"`.

### 9.12 Error samples (verbatim)

```json
// 401 — no/expired token
{ "status": "error", "statusCode": 401, "message": "Unauthorized" }

// 403 — self-hire
{ "status": "error", "statusCode": 403, "message": "You cannot start a conversation with yourself" }

// 403 — customer hit a provider-only route (RolesGuard)
{ "status": "error", "statusCode": 403, "message": "Required role: provider" }

// 409 — accepting an invoice that is no longer pending
{ "status": "error", "statusCode": 409, "message": "Invoice is already 'paid'" }

// 400 — DTO validation (message is an array)
{ "status": "error", "statusCode": 400, "message": ["lineItems must contain at least 1 elements"] }
```

### 9.13 WebSocket frames (server → client)

```json
{ "type": "auth_ok", "userId": "64d56558-..." }
{ "type": "message", "payload": { /* Message + threadId + ticketId, as §9.2 */ } }
{ "type": "invoice", "payload": { /* Invoice, as §9.3 */ } }
{ "type": "booking_confirmed", "payload": { "bookingRef": "HH-ZVURSZ", "bookingId": "c699...", "ticketId": "277a..." } }
{ "type": "notification", "payload": { /* Notification, as §9.11 */ } }
```

---

## 10. Enums & Constants (copy-paste)

Every enum used across the flow. These are the derived union types of the backend's single source of truth — `src/shared/common/enums/index.ts`. There, each type is backed by an `as const` object named in `UPPER_SNAKE_CASE` (e.g. `InvoiceStatus` ↔ `INVOICE_STATUS`, `TicketStatus` ↔ `TICKET_STATUS`), so `INVOICE_STATUS.PENDING === 'pending'`. Values are identical to what the API serialises; drop these types into your codebase to stay in lockstep.

```ts
// Account role (JWT `userType`, login/register `userType`)
export type UserType = 'customer' | 'provider' | 'admin';

// Chat message kinds
export type MessageType = 'text' | 'image' | 'system' | 'ai';

// System-card discriminator — read from message.metadata.kind (type === 'system')
export type SystemCardKind =
    | 'invoice_issued' // metadata: { invoiceId }
    | 'invoice_rejected' // metadata: { invoiceId }
    | 'invoice_voided' // metadata: { invoiceId }
    | 'booking_confirmed' // metadata: { bookingRef }
    | 'intake_summary' // metadata: { intakeSummary }
    | 'ticket_cancelled' // metadata: {}
    | 'payment_received'; // metadata: { bookingId, amount, paymentIds }

// Ticket lifecycle. NOTE: in the current flow a ticket moves
// open → invoiced → booked → closed (or → cancelled). The `in_progress`
// and `completed` values exist in the enum but the live delivery state is
// tracked by booking.status while the ticket stays `booked`.
export type TicketStatus =
    'open' | 'invoiced' | 'booked' | 'in_progress' | 'completed' | 'cancelled' | 'closed';

// Invoice lifecycle
export type InvoiceStatus = 'pending' | 'accepted' | 'rejected' | 'voided' | 'paid';

// Booking lifecycle (invoice-created bookings start at `accepted`)
export type BookingStatus =
    | 'pending'
    | 'accepted'
    | 'rescheduled'
    | 'negotiating'
    | 'declined'
    | 'cancelled'
    | 'in_progress'
    | 'completed';
// Allowed transitions you'll drive from the UI:
//   accepted → in_progress → completed   (provider, via PATCH /bookings/:id/status)

// Payment
export type PaymentMethod = 'wallet' | 'card';
export type PaymentStatus = 'held' | 'released' | 'refunded' | 'failed';

// Wallet ledger entry direction (backend: TX_TYPE / TxType)
export type TxType = 'credit' | 'debit';

// Booking urgency (backend: URGENCY_LEVEL / UrgencyLevel)
export type UrgencyLevel = 'low' | 'normal' | 'high' | 'emergency';

// Notifications (notification.type; also the WS `notification` payload)
export type NotificationType = 'lead' | 'booking';

// WebSocket frames
export type WsClientEvent = 'auth'; // client → server: { event, data:{ token } }
export type WsServerEvent =
    'auth_ok' | 'auth_error' | 'message' | 'invoice' | 'booking_confirmed' | 'notification';
```

**Cross-reference — which enum drives which UI:**

| UI concern                | Enum(s)                                           |
| ------------------------- | ------------------------------------------------- |
| Inbox row badge           | `TicketStatus` (`activeTicket.status`)            |
| Which action buttons show | `InvoiceStatus` + `BookingStatus` (see §5.2)      |
| How to render a chat item | `MessageType`, then `SystemCardKind` for `system` |
| Payment result / polling  | `PaymentStatus`                                   |
| Payment method picker     | `PaymentMethod` (default `wallet`)                |
| Inbox / bell badge        | `NotificationType`                                |
| Live socket handling      | `WsServerEvent`                                   |
