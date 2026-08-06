# Dashboard Statistics — Backend Endpoint Request

A request from the frontend for every backend piece needed to remove the remaining dummy/mock
numbers from the dashboard. Based on a full audit of every dashboard page and shell surface —
each line item below traces to a specific file:line in `handhub-client`.

**Half of the dashboard's stats are already real** — don't re-verify these, they're done:

- **Bookings page** (`dashboard/bookings.tsx`) — all 3 header tiles ("Active", "Done", "Total
  Invested") and per-tab badge counts are computed client-side from real data
  (`useGetThreadsQuery` + per-thread `useGetThreadByIdQuery` detail fetches).
- **Find Artisans page** (`dashboard/artisans.tsx`) — result counts, category chip counts, all
  real, via `useGetProvidersQuery` / `useGetCategoriesQuery`.
- **Recommended Artisans widget** (`components/dashboard/recommended-artisans.tsx`) — real, via
  `useGetRecommendationsQuery`.
- **Provider list cards** (`components/dashboard/provider-list-card.tsx`) — purely presentational,
  every number comes from the real `AiSearchProvider` prop.
- **Messages page per-thread status badges** — real, driven by `thread.activeTicket.status`.

Everything below is what's still mock, grouped by where it shows up.

---

## 1. Dashboard Home (`routes/dashboard/index.tsx`)

| Stat | Location | Current | Needs |
|---|---|---|---|
| Active Jobs count + "N new today" | `index.tsx:47,54` | Literal `3` + literal string | **No new endpoint.** Reuse the exact derivation `bookings.tsx` already does: `useGetThreadsQuery()` filtered by `activeTicket.status` (see `bookings.tsx`'s `BOOKED_TICKET_STATUSES` filter). "New today" = same set filtered by `createdAt`. |
| Artisans Nearby count + radius | `index.tsx:71,74` | Literal `48` + literal `"5 km"` | **No new endpoint.** `useGetProvidersQuery({ lat, lon, radius })` → `meta.total` already returns a real count. Pair with the existing `useUserLocation` hook for lat/lon. |
| Total spent ("₦64k", "This month") | `index.tsx:91,93` | Literal | **Mostly reuse.** `useGetWalletQuery()` already exists and returns `transactions`. Open question: does it return enough history to sum "this month" client-side, or should the backend expose a monthly-total field directly? |
| Month-over-month trend arrow | `index.tsx:95` | Implied by a static `ArrowUpRight` icon | **New.** No existing data computes a period-over-period delta — needs either a backend aggregate or two wallet queries diffed client-side. |
| "Recent Activity" feed (3 items) | `index.tsx:112-161` | Fully static JSX — no data binding at all | **New endpoint needed.** An `AppNotification` type already exists client-side (`core/types/chat.types.ts`) but nothing fetches it — the type is ready, the endpoint and query hook are not. Suggest `GET /api/notifications` (or similar), paginated, recent-first. |
| Unread-messages badge (floating reopen button) | `index.tsx:176` | Literal `5` | **New field needed** — see §4 below, same gap as the two sidebar badges. |

## 2. Sidebar / Mobile Tab Bar badges (`routes/dashboard/route.tsx`)

| Stat | Location | Current | Needs |
|---|---|---|---|
| "Find Artisans" badge | `route.tsx:192` | Literal `48` | **No new endpoint** (same `meta.total` as above) — but **confirm product intent first**: is this meant to be "artisans near me" (matches Dashboard Home's tile) or something else, e.g. "new artisans this week"? |
| "Bookings" badge | `route.tsx:198` | Literal `3` | **No new endpoint** — same threads-derived active-booking count reuse as Dashboard Home. |
| "Messages" badge (desktop sidebar) | `route.tsx:204` | Literal `5` | **New field needed** — see §4. |
| "Messages" badge (mobile tab bar) | `route.tsx:524` | Literal `5` — a **second, independently hardcoded** copy of the same number | Same backend need as above. (Frontend note, not a backend ask: these two literals should share one source once wired — not a reason to delay the backend field.) |

## 3. Payments (`routes/dashboard/payments.tsx`)

The whole page is local `useState` simulation and never calls the wallet hooks that already
exist elsewhere in the app — the clearest match to the pattern `my-area.tsx` used to have before
it was wired to real data.

| Stat | Location | Current | Needs |
|---|---|---|---|
| Wallet balance | `payments.tsx:164` | `useState(124500)` | **No new endpoint.** `useGetWalletQuery()` already returns `Wallet.balance` — this page just never calls it. |
| Transaction list | `payments.tsx:84-142,167` | Static array of 5 fake transactions | **No new endpoint** for the data (`Wallet.transactions` is real) — but the mock UI expects fields the real `WalletTransaction` type doesn't have (`ticketId`, `artisanName`, avatar). Either the backend enriches the transaction response with these, or the frontend joins them from other already-fetched data. |
| Funds in escrow | `payments.tsx:165,418` | `useState(45000)` | **New field/endpoint needed.** `Wallet` has no escrow concept today. |
| "Active Project" label tied to escrow | `payments.tsx:427` | Hardcoded string, not tied to any state | **New** — needs the escrow amount linked to a specific ticket/booking. |
| Saved payment cards | `payments.tsx:63-82,166,441` | Static array of 2 fake cards | **Open product question, not just an endpoint ask.** No card-vault concept exists anywhere in this codebase — only wallet funding via `useDepositWalletQuery`. Confirm this is actually in scope before building a card-storage endpoint; it likely involves a payment processor's tokenization API (Paystack/Flutterwave-style), not a plain CRUD table. |
| Fake transaction IDs on fund/withdraw | `payments.tsx:223,253` | `Math.floor(1000 + Math.random()*9000)` | Resolves automatically once wired to the real deposit mutation. **Please confirm**: does a real withdraw mutation already exist, or does that still need building? (Only a deposit mutation was confirmed during this audit.) |

## 4. Reviews (`routes/dashboard/reviews.tsx`)

| Stat | Location | Current | Needs |
|---|---|---|---|
| Written reviews list | `reviews.tsx:58-85,105` | Static array of 2 fake reviews | **New GET endpoint needed.** `review.q.ts` currently only exports `useCreateReviewQuery` (a mutation) — there's no list endpoint at all. |
| Pending reviews (completed jobs awaiting feedback) | `reviews.tsx:87-98,106` | Static array of 1 fake item | **New endpoint needed.** There's no bookings-list endpoint anywhere in this codebase currently — `bookings.tsx` derives everything from threads, not a dedicated resource, so this may need one too (see the note in §5). |
| Average / total / star-breakdown stats | `reviews.tsx:126-142,297,321,333-352` | Computed client-side, but from the mock array above | **No new backend aggregation needed** — this is already pure `.reduce`/`.map` logic. Once a real list endpoint exists, just swap its data source in; nothing to ask the backend for here. |

Note: the `Review` type (`chat.types.ts`) has `id, bookingId, customerId, providerId, rating,
comment, createdAt` — no `artisanName`/`tags`/`recommended`/`jobTitle`, which the current mock
UI displays. Same enrichment-vs-join question as the payments transaction list above.

---

## 5. Open questions (collected)

1. **`ThreadSummary.unreadCount`** (or equivalent aggregate) — blocks 3 separate UI spots
   (Dashboard Home floating button, desktop sidebar badge, mobile tab bar badge). Today
   `Message.isRead` exists per-message but there's no thread-level aggregate to read cheaply.
2. **"Find Artisans: 48"** — confirm intended meaning (nearby count vs. something else) before
   wiring, even though the data source itself is already available.
3. **Wallet monthly total** — does `useGetWalletQuery()` return enough transaction history to
   sum "this month" client-side, or should the backend expose a dedicated monthly-total field?
4. **Saved payment cards** — confirm this is actually planned/in-scope; it's a bigger product +
   payment-processor question than a simple endpoint.
5. **Withdraw mutation** — confirm whether one exists already or still needs building.
6. **Bookings list/summary endpoint** — worth considering a dedicated `GET /api/bookings` (or
   `/summary`) rather than continuing to derive booking state from threads via a per-thread
   `useQueries` N+1 fetch. Not a correctness issue today (it works, confirmed real) — just
   flagging it since Dashboard Home's "Active Jobs" tile and the Reviews "pending" list would
   otherwise each duplicate that same N+1 pattern independently.
