# Admin Dashboard — Frontend Implementation Guide

Companion to `admin-dashboard-design.md` and the "Backend Requirements" doc that followed it.
Everything marked 🆕 New there is now built and live. This doc covers what changed, exact
request/response shapes, and the handful of behaviors worth knowing before wiring the UI up —
all captured from a live dev server against real data, not guessed.

**Auth unchanged:** every endpoint below requires `Authorization: Bearer <jwt>` for an
`admin`-type user (`JwtAuthGuard` + `RolesGuard` + `@Roles('admin')`), same as before.

---

## 1. Dashboard Home — now with 7-day trends

```
GET /api/admin/stats
```

```json
{
  "users": { "total": 20, "customers": 11, "providers": 8, "admins": 1 },
  "bookings": 0,
  "revenue": 0,
  "trends7d": { "users": 0, "bookings": 0, "revenue": 0 }
}
```

`trends7d.*` is the percentage change vs. the prior 7-day window, one decimal place. Two special
values to handle explicitly in the UI:
- **`0`** — both windows were genuinely zero (no change, not "no data").
- **`null`** — the prior window was zero but the current one isn't (division by zero — there's
  no meaningful percentage to show). Render this as "new" or hide the trend arrow, don't display
  `null` or `NaN`.

### New: timeseries for charting

```
GET /api/admin/stats/timeseries?metric=bookings|revenue|users&interval=day|week&from=&to=
```

`metric` is required; `interval` defaults to `day`; `from`/`to` default to the last 30 days.

```json
[
  { "bucket": "2026-08-03T00:00:00.000Z", "value": "1" },
  { "bucket": "2026-08-08T00:00:00.000Z", "value": "1" },
  { "bucket": "2026-08-22T00:00:00.000Z", "value": "1" }
]
```

`value` is a **string** (Postgres `COUNT`/`SUM` come back as text) — `Number(value)` before
charting. Buckets with zero activity are **omitted entirely**, not returned as `0` — if you're
feeding a chart library that needs a continuous axis, fill the gaps client-side between `from`
and `to` at the requested `interval`.

### New: payments/bookings breakdowns

```
GET /api/admin/payments/stats?from=&to=
GET /api/admin/bookings/stats?from=&to=
```

Both returned `[]` in this environment (no payments/bookings exist right now) — confirmed the
query runs cleanly, just nothing to show yet. Shape once data exists:

```json
// payments/stats
[{ "status": "released", "method": "wallet", "count": "4", "total": "62000.00" }]

// bookings/stats
[{ "status": "completed", "category": "Plumbing", "count": "3" }]
```

`category` is `null` for bookings with no category set — group those under an "Uncategorized"
bucket in the UI rather than dropping them.

---

## 2. Providers — two different shapes, know which endpoint you're calling

This is the one thing worth being careful about. There are now **three** provider-returning
endpoints and they don't all return the same shape:

| Endpoint | Shape |
|---|---|
| `GET /api/admin/providers/pending` | **Raw entity** — every column on `Provider`, plus a sanitized `user` object and `hasLocation` |
| `GET /api/admin/providers` (new) | **Formatted** — same shape as the public `GET /api/providers`, plus `user` (contact-only) and `hasLocation` |
| `GET /api/admin/providers/:id` (new) | Same formatted shape as the list, single object |

### `GET /api/admin/providers/pending` — unchanged shape, two new fields

```json
{
  "id": "d8fdc447-900f-4658-bb77-2f4318247b53",
  "userId": "5a05d0eb-a9eb-4b3c-beb1-f97534902b1c",
  "user": {
    "id": "5a05d0eb-a9eb-4b3c-beb1-f97534902b1c",
    "fullName": "Joshua Martins",
    "email": "joshuamartins2409@gmail.com",
    "phone": "09060911041",
    "userType": "provider",
    "isVerified": true,
    "isActive": true,
    "...": "full User entity, minus passwordHash — was leaking before, fixed silently"
  },
  "approvalStatus": "pending",
  "latitude": "6.456312",
  "longitude": "3.423069",
  "stateId": "020ddcd1-1522-43b4-a856-51af1def43f3",
  "...": "every other Provider column, unchanged",
  "hasLocation": true
}
```

**`hasLocation: boolean`** — `!!latitude && !!longitude`. This is the direct fix for the
incident that started this project: a provider with `hasLocation: false` will be invisible in
every coordinate-radius search the moment it's approved. **Show this per-row in the pending
queue**, not just on the detail view — that's the whole point.

**No `passwordHash`** — was present in this response before this pass (a real, live bug, not
theoretical), silently fixed. Nothing for the frontend to change here, just confirming it's gone.

### `GET /api/admin/providers?approvalStatus=&hasLocation=&...` — new, admin "All Providers" screen

All of `GET /api/providers`'s existing filters work here too (`q`, `categoryId`, `stateId`,
`lgaId`, `minRate`/`maxRate`, `minRating`, `sortBy`, geo, pagination) — plus:

- `approvalStatus` — `pending` | `approved` | `rejected`. Omit to see all statuses.
- `hasLocation` — `true` to see only providers with coordinates set, `false` to see only the ones
  missing them (the exact query you'd run to audit for the next version of this incident).

```json
{
  "data": [
    {
      "id": "49722a1c-50d6-460c-83ca-8fd7b98c61b4",
      "title": "Test Electrician",
      "businessName": null,
      "hourlyRate": "0.00",
      "approvalStatus": "pending",
      "state": null,
      "lga": null,
      "ward": null,
      "services": [],
      "user": {
        "id": "1efbbf71-a82b-4074-85be-776c99085736",
        "fullName": "Login Gate Provider",
        "email": "login-gate-provider@example.com",
        "phone": "+2348066600003"
      },
      "hasLocation": false
    }
  ],
  "meta": { "total": 1, "limit": 20, "offset": 0 }
}
```

Note `user` here is **narrow** (`id`, `fullName`, `email`, `phone` only) — this is the same
shape the public provider endpoints deliberately withhold (customers shouldn't see a provider's
raw contact info), now exposed specifically for the admin view. Don't expect `isVerified`,
`lastLoginAt`, etc. here — go to `/pending` or `/api/admin/users` if you need those.

### `GET /api/admin/providers/:id` — new, admin detail view

Same formatted shape as the list above, single object, plus the full `state`/`lga`/`ward`
objects and `services[]` — this is what backs the provider detail panel, including contact info
the public `GET /api/providers/:id` still correctly withholds.

```json
{
  "id": "f87f549a-8f6d-4055-87bf-0782d493ac2f",
  "businessName": "Angel  cleaners",
  "approvalStatus": "pending",
  "state": { "id": "020ddcd1-...", "code": "25", "name": "Lagos" },
  "lga": { "id": "69ad225a-...", "code": "25-008", "name": "Eti-Osa" },
  "ward": { "id": "8d07d08b-...", "code": "25-008-007", "name": "Lekki/Ikate and Environs" },
  "services": [{ "id": "0a6a8207-...", "name": "Pipe Repair & Replacement", "categoryId": "..." }],
  "user": { "id": "b03f8f66-...", "fullName": "Steve Angel", "email": "shuamartins01@gmail.com", "phone": "09060911042" },
  "hasLocation": true
}
```

### `PATCH /api/admin/providers/:id` — new, suspend/edit

```json
// request body — all fields optional
{ "approvalStatus": "rejected", "isAvailable": false, "isVerified": false, "reason": "duplicate listing" }
```

Returns the same detail shape as `GET /api/admin/providers/:id`. `reason` isn't stored on the
provider — it's recorded on the audit log entry only, for traceability. Every field you send is
audited with a real before/after diff:

```json
{
  "action": "admin_update_provider",
  "targetEntity": "providers",
  "targetId": "f87f549a-...",
  "beforeData": { "isVerified": true, "isAvailable": true, "approvalStatus": "pending" },
  "afterData": { "isVerified": false, "isAvailable": true, "approvalStatus": "pending" },
  "metadata": { "reason": "smoke test cleanup - restoring original state" }
}
```

This DTO is deliberately **narrower** than the provider's own `PATCH /api/providers/me` — it
only accepts `approvalStatus`, `isAvailable`, `isVerified`, `reason`. It can't edit title, bio,
pricing, etc. — that's intentional, not a gap; admins suspend/verify, they don't ghost-write a
provider's profile.

---

## 3. Users — pagination, filters, deactivate/reactivate

```
GET /api/admin/users?userType=&isActive=&q=&limit=&offset=
```

```json
{
  "data": [
    {
      "id": "b03f8f66-adea-488d-b46d-8983c0b306db",
      "fullName": "Steve Angel",
      "email": "shuamartins01@gmail.com",
      "userType": "provider",
      "isVerified": true,
      "isActive": true,
      "...": "full User shape, minus passwordHash — same fix as §2"
    }
  ],
  "meta": { "total": 20, "limit": 2, "offset": 0 }
}
```

`q` matches full name or email, case-insensitive, substring. All three filters combine with AND.

### New: suspend/restore

```
PATCH /api/admin/users/:id/deactivate
PATCH /api/admin/users/:id/reactivate
```

No body. Both return the updated (sanitized) user object. `isActive: false` already blocks login
server-side (`AuthService` checks this) — these endpoints are the first admin-facing way to set
it; previously the only path was a direct DB edit.

---

## 4. Bookings — pagination and filters

```
GET /api/admin/bookings?status=&customerId=&providerId=&from=&to=&limit=&offset=
```

```json
{ "data": [], "meta": { "total": 0, "limit": 2, "offset": 0 } }
```

(Empty in this environment — no bookings currently exist. Shape is unchanged from before:
`{...booking, customer, provider}`, with `customer` now passwordHash-free.) `status` is one of
the booking status enum values; `from`/`to` filter on `createdAt`, `to` is exclusive.

---

## 5. Audit log — now genuinely browsable

```
GET /api/admin/ops/audit/recent?action=&actorUserId=&targetEntity=&status=&from=&to=&limit=&offset=
```

```json
{
  "data": [
    {
      "id": "8a29b210-...",
      "actorUserId": "99f3167c-...",
      "actorRole": "admin",
      "targetEntity": "providers",
      "targetId": "f87f549a-...",
      "action": "admin_update_provider",
      "beforeData": { "isVerified": true, "approvalStatus": "pending", "isAvailable": true },
      "afterData": { "isVerified": false, "approvalStatus": "pending", "isAvailable": true },
      "metadata": { "reason": "..." },
      "status": "success",
      "createdAt": "2026-08-23T01:02:53.309Z"
    }
  ],
  "meta": { "total": 2, "limit": 1, "offset": 0 }
}
```

Previously this endpoint always returned the last 50 rows with no way to page further or narrow
down. Now: filter by any combination of `action` (exact match — e.g. `admin_update_provider`,
`payment_fraud_reversal`, `deactivate_user`), `actorUserId`, `targetEntity` (e.g. `providers`,
`users`, `payments`), `status` (`success`|`failure`), and a date range. `endpoint`/`httpMethod`/
`ipAddress`/`userAgent`/`requestId` are `null` on audit rows written from inside a service method
directly (like the example above) rather than via the global `AuditInterceptor` on an HTTP
request — that's expected, not missing data.

---

## 6. Payment activity — now filterable

```
GET /api/admin/ops/payments/recent?status=&providerName=&from=&to=&limit=&offset=
```

This reads `PaymentTransaction` — **online/gateway activity** (Paystack/Flutterwave), not the
escrow `Payment` records. `status` values: `pending`, `initiated`, `processing`, `successful`,
`failed`, `cancelled`, `expired`, `reversed`, `disputed`, `provider_unavailable` — **not** the
same enum as booking-payment status (`held`/`released`/`refunded`/`failed`), don't share a
dropdown between this and anything showing escrow state. `providerName` here means the **payment
gateway** (`paystack`/`flutterwave`), matching the field name on the entity — not an artisan's
business name.

```json
{ "data": [], "meta": { "total": 0, "limit": 2, "offset": 0 } }
```

(Empty — no online-gateway payments exist in this environment; both gateways are disabled
platform-wide per the design doc's own callout.)

---

## 7. New: Fraud & Risk — the entire section, from zero

```
GET /api/admin/fraud/reversals?from=&to=&riskLevel=low|medium|high
```

```json
{ "data": [], "meta": { "total": 0, "limit": 50, "offset": 0 } }
```

Empty here too — no payment has ever been auto-reversed for fraud in this environment, which is
a legitimate "nothing to show" state, not a broken query (confirmed the query executes cleanly).
Each row, when one exists, is a full audit-log entry with `action: "payment_fraud_reversal"` and
`metadata: { riskLevel, riskScore, reasons: string[], amount, paymentMethod }` — render `reasons`
as a bullet list, it's the model's own explanation for the flag.

---

## 8. New: single dispute fetch

```
GET /api/admin/disputes/:id
```

404s cleanly for an unknown ID (verified). Same shape as one row from the existing
`GET /api/admin/disputes` list — `raisedBy`/`against` restricted to
`{id, fullName, email, phone}`, plus `booking`. Use this for a bookmarkable/shareable dispute
detail URL instead of depending on the list already being in cache.

---

## 9. Services catalog — reactivate path unblocked

```
GET /api/services?isActive=false
```

```json
[]
```

Public endpoint, unchanged default (`isActive` omitted → active only, same as before). Pass
`isActive=false` to see deactivated services — this is what makes "reactivate a service" possible
at all; previously a service set inactive via `PUT /api/services/:id` could never be found again
through any list. No new endpoint, no auth change — just the one query param.

---

## Still deferred (unchanged from the design doc)

- **AI Operations usage/cost endpoints** — blocked on a persistence-architecture decision
  (telemetry currently lives only in logs).
- **Search & Geo Insights beyond what §2 already covers** — zero-result query stats need search
  logging to exist first.
- **Reviews moderation** — needs a sentiment-column migration on `Review`.
- **`ops/health-summary/history`** — needs a snapshot table + scheduled job, not just a query.

None of these are partially built — don't build UI shells expecting them soon.
