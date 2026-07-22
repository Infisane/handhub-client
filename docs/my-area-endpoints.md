# My Area — Backend Endpoint Request

A request from the frontend for the endpoints needed to make the **My Area** module
(`src/routes/dashboard/my-area.tsx`) real. The module is **provider-facing** — a provider
manages where they dispatch (service zones), how far they cover (radius), whether they're
accepting work (availability), and views local demand analytics. It is currently **100%
mock** (`MOCK_ZONES`, `SUGGESTED_ZONES`, local `useState`, a `setTimeout` "save").

Paths/shapes below are **proposals** aligned to existing conventions (`/api/providers/me`,
`/api/locations/*`) — final naming is the backend's call. Everything here is scoped to the
**authenticated provider** (`Authorization: Bearer <token>`).

---

## What the UI does (so the shapes make sense)

- **Availability toggle** — "Accepting Alerts" ⇄ "Offline" (hides the provider from local search).
- **Primary dispatch radius** — a 1–20 km slider; "how far your services show in job boards".
- **Service zones/sectors** — a list of named areas the provider serves. Each: name, LGA + state,
  coordinates, coverage km, `isPrimary`, `isActive` (per-zone pause). Add / delete / toggle.
- **Per-zone insights** — active artisans, open jobs, avg response time, and an artisan breakdown
  by trade/category (Electricians, Plumbers, …).
- **Header summary** — totals across active zones (artisans nearby, active zones, local job orders).
- **Add-zone search** — type a neighborhood, pick a suggestion (needs real areas + coordinates).

> Privacy note the UI already promises: the provider's **exact** hub coordinate is anonymized;
> clients see zone-level boundaries only. Please keep exact lat/lng provider-private.

---

## Reuse — already in the contract

| Endpoint | Use in My Area |
|---|---|
| `GET /api/locations/states` · `/api/locations/lgas?stateId` · `/api/locations/wards?lgaId` | Back the **Add Zone** search with real areas. **Wards already return `latitude`/`longitude`**, so a zone can be a ward reference instead of free-text. |
| `PUT /api/user/profile` (`UpdateProviderPayload` has `serviceRadius`, `latitude`, `longitude`, `stateCode/lgaCode/wardCode`, `availability`) | The **primary dispatch radius** is `providerProfile.serviceRadius` today. |
| `GET /api/auth/me` → `providerProfile` (`serviceRadius`, `isActive`, …) | Hydrate the radius + availability on load. |

---

## Requested endpoints

### A. Provider availability (Accepting Alerts / Offline)

| Method | Path | Body → Response |
|---|---|---|
| `PATCH` | `/api/providers/me` | `{ "isAvailable": true }` → updated provider profile |

Mirrors the existing `PATCH /api/providers/me` toggle used for `aiIntakeEnabled` (chat doc §2.7).
If availability already maps to `providerProfile.isActive`, reuse that field — just confirm the
name. Whatever the flag, it must be what hides the provider from local job search when off.

### B. Primary dispatch radius

Reuse the profile update, or expose a lightweight PATCH:

| Method | Path | Body |
|---|---|---|
| `PATCH` | `/api/providers/me` | `{ "serviceRadius": 5 }` (km) |

(Today only `PUT /api/user/profile` sets it, but that needs the full onboarding payload — a
partial `PATCH` for `serviceRadius`/`isAvailable` would let the header "Save" persist cleanly.)

### C. Service zones — CRUD (new)

The core new resource. A provider owns many zones; one is `isPrimary` (their hub, not deletable).

**`GET /api/providers/me/zones`** — list.
```json
[
  {
    "id": "z_...",
    "name": "Lekki Phase 1",
    "wardId": "ward_...",          // optional if zone is ward-based
    "lga": { "id": "...", "name": "Eti-Osa" },
    "state": { "id": "...", "name": "Lagos" },
    "latitude": "6.4281",
    "longitude": "3.4219",
    "coverageKm": 3,
    "isPrimary": true,
    "isActive": true,
    "createdAt": "..."
  }
]
```

**`POST /api/providers/me/zones`** — add. Either a ward reference (preferred — server derives
name/lga/state/coords) or an explicit name + coordinates:
```json
{ "wardId": "ward_..." , "coverageKm": 3 }
// or
{ "name": "Ikoyi", "latitude": 6.4549, "longitude": 3.4246, "coverageKm": 3 }
```

**`PATCH /api/providers/me/zones/:id`** — rename / resize / pause: `{ "isActive": false }`, `{ "coverageKm": 4 }`.

**`DELETE /api/providers/me/zones/:id`** — remove (reject `409`/`400` if `isPrimary`).

> If multi-zone is more than you want to model now, the minimum viable version is a **single**
> primary zone = the provider's existing `serviceRadius` + location, and we drop the add/list UI
> to just the radius control. Please advise which scope you'll support.

### D. Zone insights + area summary (demand analytics — likely phase 2)

These power the numbers on the cards/detail panel. They're **market aggregates**, not provider
settings, so they may need new aggregation and can land after A–C.

**`GET /api/providers/me/zones/:id/insights`**
```json
{
  "artisanCount": 84,
  "activeJobs": 12,
  "avgResponseMinutes": 14,
  "breakdown": [
    { "categoryId": "...", "name": "Electricians", "count": 24 },
    { "categoryId": "...", "name": "Plumbers", "count": 18 }
  ]
}
```

**`GET /api/providers/me/area/summary`** — header totals across the provider's active zones:
```json
{ "artisansNearby": 140, "activeZones": 2, "localJobOrders": 20 }
```

Open question: is "artisans nearby / job orders" meant to be **market demand** (all providers +
open jobs in the area) or the **provider's own** jobs? That changes the aggregation. Please confirm.

### E. Add-zone area search

The UI has a free-text neighborhood search (mock `SUGGESTED_ZONES`). Cleanest is to reuse
`GET /api/locations/wards?lgaId=…` (wards carry `latitude`/`longitude`), with the modal doing
state → LGA → ward selection. If you'd rather support free-text, a
`GET /api/locations/search?q=<text>` → `[{ id, name, lga, state, latitude, longitude }]` would
let us keep the single search box. Either works — tell us which to build against.

---

## Suggested build order

1. **A + B** (availability + radius via `PATCH /api/providers/me`) — unblocks the header "Save".
2. **C** (zones CRUD) — the core new resource; back "Add Zone" with wards (§E).
3. **D** (insights/summary) — analytics; safe to defer.

## Open questions for the backend

1. Availability: new `isAvailable` field, or reuse `providerProfile.isActive`?
2. Zones: full multi-zone model, or single primary zone (= `serviceRadius` + location) for v1?
3. Add-zone: ward-based selection (reuse `/locations/wards`) vs a free-text `/locations/search`?
4. Insights: market-wide demand vs the provider's own numbers?
5. Any per-zone radius, or one global `serviceRadius` + fixed zone coverage?
