# Admin Dashboard — Design Document

Grounded in what the backend actually supports today: every endpoint below is tagged
**✅ Exists** (already live in `handhub-api`, path and shape confirmed from source) or
**🆕 New** (needs backend work — a short note explains what). All admin routes require
`Authorization: Bearer <jwt>` + `@Roles('admin')` (`JwtAuthGuard` + `RolesGuard`), matching every
existing admin endpoint.

## Why these sections

Beyond covering what a marketplace admin needs day-to-day (approvals, disputes, oversight), two
sections exist specifically because of gaps found this session: **Search & Geo Insights** (a
provider was invisible in search purely because it sat unapproved — nothing today surfaces
"pending providers near active demand"), and **AI Operations** (the AI layer now emits full
token/cost/latency telemetry per call, but nothing visualizes it).

---

## Information architecture

```
Dashboard (home)
├── Providers
│   ├── Pending Approvals
│   └── All Providers
├── Users
├── Bookings
├── Payments & Wallets
│   └── Fraud & Risk
├── Disputes
├── Reviews (moderation)
├── Search & Geo Insights
├── AI Operations
├── Notifications & Delivery
├── Categories & Services
├── Audit Log
└── System Health
```

---

## 1. Dashboard Home

Top-line KPIs on load — one round trip.

| Endpoint | Status |
|---|---|
| `GET /api/admin/stats` | ✅ Exists |

```json
{
  "users": { "total": 128, "customers": 100, "providers": 25, "admins": 3 },
  "bookings": 340,
  "revenue": 214500.00
}
```
`revenue` is platform fee earned on `released` payments only (not gross GMV) —
`SUM(payment.amount WHERE status='released') * PLATFORM_FEE_RATE`.

**🆕 New — richer home tiles.** The current payload is minimal (3 numbers). Worth extending in
place (same endpoint, additive fields, no breaking change) with: bookings-by-status breakdown,
pending-approval count (so the badge doesn't need a second call), 7/30-day trend deltas for each
KPI. Small, additive change to `AdminService.getStats()`.

---

## 2. Providers

### 2.1 Pending Approvals — the primary admin queue

| Endpoint | Status |
|---|---|
| `GET /api/admin/providers/pending` | ✅ Exists |
| `POST /api/admin/providers/:id/approve` | ✅ Exists |
| `POST /api/admin/providers/:id/reject` | ✅ Exists |

Returns providers with `approvalStatus: 'pending'`, `user` relation loaded, oldest first. Approve
sends `NotificationsService.push()` to the provider (`'Application Approved'`) and audits the
action; reject does the same with a rejection reason.

**🆕 New — show geo context on this exact screen.** This is the direct lesson from today's
incident: a provider sat in this queue for over a week, invisible to a nearby customer, and
nothing here would have caught it. Each row should show `city` / `ward` / `lat,lon` present-or-
missing at a glance — a provider with `latitude: null` will silently fail every radius search the
moment it's approved. Cheapest version: add a `hasLocation: boolean` to the existing pending-list
response (`!!p.latitude && !!p.longitude`). No new endpoint.

### 2.2 All Providers — search/browse/manage

| Endpoint | Status |
|---|---|
| `GET /api/providers` (public, already supports `q`, `categoryId`, `stateId`, `lgaId`, `minRate`/`maxRate`, `minRating`, `verified`, `sortBy`, geo) | ✅ Exists — reuse as-is for the admin table, it already has everything a list view needs |
| `GET /api/providers/:id` | ✅ Exists — full detail incl. `reviews`, `ratingBreakdown` |
| `PATCH /api/admin/providers/:id` (suspend / force-unavailable / edit any field) | 🆕 New |
| `GET /api/admin/providers?approvalStatus=&hasLocation=` (admin variant including non-approved) | 🆕 New — the public endpoint only ever returns `approved` providers; admins need to see `pending`/`rejected` too in one browsable list, not just the pending-queue endpoint |

**Provider detail panel** should render `latitude`/`longitude` on an embedded map (Nigeria-scoped,
state/LGA/ward boundary overlay if available) — the single highest-leverage visual for catching
today's exact bug class before it reaches a customer.

---

## 3. Users

| Endpoint | Status |
|---|---|
| `GET /api/admin/users` | ✅ Exists — all users, newest first, **no pagination or filters today** |
| `GET /api/admin/users?userType=&isActive=&q=&limit=&offset=` | 🆕 New — add filters/pagination to the existing query (it currently loads every user unbounded, which won't scale) |
| `PATCH /api/admin/users/:id/deactivate` / `reactivate` | 🆕 New — no suspend mechanism exists today; `User.isActive` already gates login, just no admin write path to flip it |

---

## 4. Bookings

| Endpoint | Status |
|---|---|
| `GET /api/admin/bookings` | ✅ Exists — all bookings, `customer`+`provider` relations, **no filters today** |
| `GET /api/admin/bookings?status=&customerId=&providerId=&from=&to=` | 🆕 New — same unbounded-query concern as users; add the filters `BookingsService.listForUser` already proved out for the customer-facing endpoint |
| `GET /api/bookings/:id` | ✅ Exists — reuse for the detail drill-down |

---

## 5. Payments & Wallets

| Endpoint | Status |
|---|---|
| `GET /api/admin/ops/payments/recent` | ✅ Exists — recent payment activity feed |
| `POST /api/payments/:id/release` | ✅ Exists (admin-only, releases held escrow) |
| `GET /api/payments/booking/:bookingId` | ✅ Exists |
| `GET /api/admin/payments?status=held\|released\|refunded&method=` | 🆕 New — a filterable ledger view; `ops/payments/recent` is a fixed-window feed, not a queryable table |
| `GET /api/admin/ops/provider-health` | ✅ Exists — **this is payment-*provider* (Paystack/Flutterwave) health, not marketplace-provider health; name it clearly in the UI to avoid confusion with §2** |

**Surface prominently:** both `PAYSTACK_ENABLED` and `FLUTTERWAVE_ENABLED` are `false` in every
environment right now — online card payments are fully disabled platform-wide, only the wallet
path works. This should be a persistent banner on this page, not something an admin has to
discover by testing a checkout.

### 5.1 Fraud & Risk (sub-section)

🆕 **Entirely new — the data already exists, nothing visualizes it.** `FraudService` scores every
wallet/POD payment; on `riskLevel: 'high'` the `fraud-check.processor.ts` auto-reverses the
payment and now (as of this session) writes a full `AuditService` record —
`action: 'payment_fraud_reversal'`, `metadata: { riskLevel, riskScore, reasons, amount,
paymentMethod }`. Endpoint needed:

```
GET /api/admin/fraud/reversals?from=&to=&riskLevel=
```
Reads `audit_logs WHERE action = 'payment_fraud_reversal'` — no new table, just a query against
data that's already being written.

---

## 6. Disputes

| Endpoint | Status |
|---|---|
| `GET /api/admin/disputes?status=` | ✅ Exists |
| `PATCH /api/admin/disputes/:id/resolve` | ✅ Exists |

Every dispute record already carries `aiRecommendation` (`DisputeService.analyze()`'s structured
output: `recommendation`, `reasoning`, `confidence`, `keyFactors`) — **surface this prominently in
the resolve panel**, not buried in a raw JSON blob. It's a free second opinion already computed
and stored; today's admin UI (if it renders the raw dispute object) likely shows it as an
unstructured field at best.

---

## 7. Reviews (moderation)

| Endpoint | Status |
|---|---|
| `GET /api/reviews/provider/:providerId` | ✅ Exists (public) |
| `GET /api/admin/reviews/flagged` | 🆕 New — depends on the deferred sentiment-persistence work (see `docs/` AI plan history: `SentimentService` currently computes sentiment on every review and discards it). Once `Review` has a sentiment column, this becomes a simple `WHERE sentiment = 'negative'` query. **Not buildable today without that migration first.** |

---

## 8. Search & Geo Insights 🆕 (new section)

Directly motivated by this session's incident. None of this exists yet.

| Endpoint | Purpose |
|---|---|
| `GET /api/admin/geo/provider-density?stateId=` | Provider count per LGA/ward, cross-referenced with `approvalStatus` — answers "how many approved vs. pending providers exist in this area" at a glance |
| `GET /api/admin/geo/pending-in-area?lat=&lon=&radius=` | The exact query that would have caught today's bug: "are there unapproved providers sitting within reach of an area with real users?" — same `haversineExpr` already used by search, just without the `approvalStatus='approved'` filter |
| `GET /api/admin/search/zero-result-queries` | Requires logging searches with `total: 0` somewhere (not done today) — surfaces real vocabulary gaps in `search-vocab.ts` from actual user queries, rather than guessing |

The first two are cheap (reuse `haversineExpr` from `geo.util.ts`, same pattern as
`SearchService.search()`). The third needs a lightweight search-query log first.

---

## 9. AI Operations 🆕 (new section)

Every `ChatOpenAI` call now emits a structured log line via `LlmTelemetryHandler`
(`{ event: 'llm_call', model, status, durationMs, promptTokens, completionTokens, totalTokens }`)
— shipped this session, currently write-only (goes to pino logs, nothing reads it back).

| Endpoint | Purpose |
|---|---|
| `GET /api/admin/ai/usage?from=&to=&groupBy=model\|feature` | Aggregate token usage / cost estimate / call volume — requires either parsing structured logs or (cleaner) writing telemetry to a lightweight table instead of/alongside logs |
| `GET /api/admin/ai/errors?from=&to=` | Surfaces `status:"error"` clustering — this is exactly the signal that should decide whether the Groq rate-limit ceiling needs addressing (flagged, not yet acted on, in prior session work) |
| `PATCH /api/admin/ai/features/:feature/enabled` | Per-feature kill switch — today there's only one global `LlmService.enabled` (key present/absent); no way to disable, say, just the chatbot while keeping fraud scoring on |

**Decision needed before building §9's first endpoint:** telemetry currently lives only in logs.
Aggregating "cost last 30 days" from log lines is possible but awkward (log-scraping) versus
adding a small `ai_invocations` table the `LlmTelemetryHandler` also writes to. This was
explicitly deferred earlier ("add the table when there's an actual dashboard to drive off it") —
this is that dashboard, so it's worth revisiting that decision now rather than building on logs.

---

## 10. Notifications & Delivery

| Endpoint | Status |
|---|---|
| `GET /api/admin/ops/failures` | ✅ Exists — failed notifications (outbox), failed payment attempts, failed emails, one call |
| `GET /api/admin/ops/alerts` | ✅ Exists |
| `GET /api/admin/ops/health-summary` | ✅ Exists — mail/payment provider health, notification outbox summary, 24h audit volume, failure counts |

These three already cover this section well — mostly a UI/visualization task, not a backend gap.
One real gap found this session, worth fixing before wiring this up: `NotificationPreference`
opt-outs exist but `dispatchEvent()` never reads them (a user who opts out of chat notifications
still gets them) — low priority for the dashboard itself, but worth knowing before an admin trusts
a "notifications sent" count here.

---

## 11. Categories & Services

| Endpoint | Status |
|---|---|
| `GET /api/categories` | ✅ Exists (public) |
| `POST /api/categories` / `PUT /api/categories/:id` / `DELETE /api/categories/:id` | ✅ Exists, already `@Roles('admin')`-guarded |
| Services catalog CRUD | 🆕 New — `ServicesService` exists and is read from (`findByIds` used in provider onboarding), but there's no admin-facing create/edit/delete surface for the services catalog itself, only categories |

---

## 12. Audit Log

| Endpoint | Status |
|---|---|
| `GET /api/admin/ops/audit/recent` | ✅ Exists — recent entries, not filterable |
| `GET /api/admin/audit?action=&actorUserId=&targetEntity=&from=&to=&limit=&offset=` | 🆕 New — `AuditService.byAction()` and `.volumeSince()` already exist as building blocks; this is a thin controller wrapper plus one more flexible query method, not new infrastructure |

Every meaningful admin/system action already writes here (auth, payments, admin approvals, and —
new this session — fraud reversals). A real filterable log viewer is one of the cheapest, highest-
value additions on this whole list, since 90% of the query logic already exists.

---

## 13. System Health

| Endpoint | Status |
|---|---|
| `GET /api/admin/ops/health-summary` | ✅ Exists |
| `GET /api/admin/ops/provider-health` | ✅ Exists (payment providers) |
| `GET /health` | ✅ Exists (public liveness/readiness, DB+memory+disk) |

Mostly a visualization task on existing data. One thing worth wiring into this exact page:
`GROK_API_KEY` health — right now there's no health check confirming the configured AI model is
actually reachable (this session found the previously-configured model had been silently
decommissioned by the provider for weeks). A simple periodic "can we reach Groq with the
configured model" check, surfaced here, would have caught that immediately instead of via a user
complaint.

---

## Cross-cutting

**RBAC.** Every admin route is `JwtAuthGuard` + `RolesGuard` + `@Roles('admin')` — no partial-
admin roles exist today (no "support agent can view but not resolve disputes" tier). Worth a
product decision before this dashboard has more than one admin user type.

**Real-time.** `EventsGateway` (WebSocket, already used for chat/notifications) could push live
events to an open dashboard — new dispute filed, high-risk fraud reversal, provider approval
submitted — using the exact same `sendToUser` mechanism already in place. Not required for v1;
polling the existing `ops/*` endpoints is a reasonable starting point.

**Audit discipline.** Every new mutating endpoint above should call `AuditService.record()`,
matching the pattern every existing admin mutation already follows (`admin.service.ts`'s
approve/reject calls, this session's new fraud-reversal audit entry). Don't add an admin
mutation that isn't audited — it's the one thing this codebase already does consistently well.

---

## Suggested build order

1. **Audit Log filters (§12)** and **Provider detail map + `hasLocation` flag (§2)** — cheapest,
   highest immediate value, directly prevent a repeat of today's incident.
2. **Users/Bookings filters + pagination (§3, §4)** — the unbounded queries are a scaling risk
   independent of the dashboard.
3. **Fraud & Risk (§5.1)** and **AI Operations (§9)** — the data already exists (audit records,
   telemetry logs); this is mostly exposing what's already being captured.
4. **Search & Geo Insights (§8)** — the geo-density/pending-in-area endpoints are small, reusing
   `haversineExpr` directly.
5. **Reviews moderation (§7)** — blocked on the sentiment-persistence migration; sequence after
   that work, not before.
