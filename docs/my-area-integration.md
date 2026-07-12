# My Area — Frontend Integration Guide

This documents the **real, shipped** contracts for the provider-facing "My Area" module: availability toggle, primary dispatch radius, service zones CRUD, and zone insights. Every payload below is taken from the running API. All routes require an authenticated **provider** account (`Authorization: Bearer <token>`, `userType: "provider"`).

- **REST base:** `http://<host>:<port>/api` (dev default `http://localhost:8088/api`)
- **No job-board or response-time features are implemented.** "Local job orders" and "avg response time" are omitted entirely from every response below — not zeroed, not stubbed, genuinely absent — because no underlying data model exists for either yet (`Booking` has no geo columns and is never an anonymous demand pool; nothing tracks provider response latency). Don't render those stat cards until a separate initiative builds them.

---

## 1. Endpoints

### 1.1 Availability toggle

```json
// PATCH /api/providers/me
{ "isAvailable": false }
```

Returns the full provider profile (same shape as `GET /api/providers/me`), now including `isAvailable` and `aiIntakeEnabled` — both were previously accepted by this endpoint but silently missing from every response; that's fixed. When `false`, the provider is excluded from **both** discovery endpoints (`GET /api/providers` and `GET /api/search`) — same treatment as `approvalStatus !== 'approved'`.

> ⚠️ **Gotcha — `GET /api/search` caches for 30 seconds.** `GET /api/providers` reflects availability changes immediately, but `SearchController` has `@CacheTTL(30_000)` on the search route. A provider who toggles off may still appear in **identical, repeated** search queries for up to 30s. This is pre-existing caching behavior, not a bug in the toggle — don't poll search immediately after a toggle expecting instant disappearance; `GET /api/providers` (or just trusting the toggle's own response) is the reliable signal.

### 1.2 Primary dispatch radius

```json
// PATCH /api/providers/me
{ "serviceRadius": 12 }
```

Same endpoint as above — both fields can be sent together or separately. Setting `serviceRadius` also updates the provider's **primary zone** `coverageKm` to match (see §1.3) — the primary zone and the legacy radius field are kept in sync automatically, so the frontend only needs to call this one endpoint for the radius slider, not a separate zone update.

### 1.3 Service zones — CRUD

Every provider has exactly one `isPrimary: true` zone, auto-created the moment they have a location (either by the one-time migration backfill for already-onboarded providers, by completing onboarding step 2, or lazily on their first radius update if somehow neither of those has happened yet). The frontend never needs to create the primary zone itself — it always already exists.

**`GET /api/providers/me/zones`** — list, primary first:
```json
[
    {
        "id": "d23e4062-f331-4751-88a0-6a1792b5320a",
        "providerId": "c4673807-83be-4ffb-88ab-b74c1cc0380b",
        "name": "Abuja",
        "wardId": "ecf7d0bc-56ac-4648-a02a-e1ee9b41cd1c",
        "geoWard": { "id": "ecf7d0bc-...", "code": "15-006-002", "name": "Garki", "latitude": "9.051905", "longitude": "7.489527" },
        "latitude": "9.054000",
        "longitude": "7.478000",
        "coverageKm": 12,
        "isPrimary": true,
        "isActive": true,
        "createdAt": "2026-07-12T17:03:00.547Z",
        "updatedAt": "2026-07-12T17:56:56.736Z"
    }
]
```

**`POST /api/providers/me/zones`** — two modes, pick one:
```json
// Mode A — ward-based (preferred): server derives name/lat/lng
{ "wardId": "ecf7d0bc-56ac-4648-a02a-e1ee9b41cd1c", "coverageKm": 4 }
```
```json
// Mode B — explicit
{ "name": "Wuse 2", "latitude": 9.0667, "longitude": 7.4833, "coverageKm": 3 }
```
`coverageKm` is optional (defaults to 5), bounded 1–20 when given, matching the radius slider's own range. New zones are never primary.

**`PATCH /api/providers/me/zones/:id`** — rename / resize / pause only (`wardId`/coordinates/`isPrimary` can't be changed this way — delete and recreate if a zone needs to move):
```json
{ "name": "Wuse Zone 2", "coverageKm": 6, "isActive": false }
```

**`DELETE /api/providers/me/zones/:id`** — the primary zone can't be deleted:
```json
// attempting to delete the primary zone
{ "status": "error", "statusCode": 400, "message": "The primary zone cannot be deleted" }
```
Deleting any other zone returns `{ "message": "Zone deleted" }`.

### 1.4 Add-zone area search

No search endpoint was built — reuse the existing cascading location lookups, which already carry everything needed:
```
GET /api/locations/states                 → [{ id, code, name }]
GET /api/locations/lgas?stateId=<id>       → [{ id, code, name, stateId }]
GET /api/locations/wards?lgaId=<id>        → [{ id, code, name, lgaId, latitude, longitude }]
```
Build the Add Zone modal as state → LGA → ward selects instead of a single free-text box; the chosen ward's `id` becomes `wardId` in the `POST` above.

### 1.5 Zone insights

**`GET /api/providers/me/zones/:id/insights`** — artisan count and category breakdown within that zone's radius:
```json
{
    "artisanCount": 6,
    "breakdown": [
        { "categoryId": "b50b476b-...", "name": "AC & HVAC", "count": 1 },
        { "categoryId": "09c8602d-...", "name": "Cleaning", "count": 1 },
        { "categoryId": "846d3a1e-...", "name": "Electrical", "count": 1 },
        { "categoryId": "f0703912-...", "name": "Painting", "count": 1 },
        { "categoryId": "76305aa8-...", "name": "Plumbing", "count": 1 }
    ]
}
```
Counts include every `approved` + `isAvailable` provider (including the caller) within `coverageKm` of the zone's center — not just competitors, a general market-density read.

**`GET /api/providers/me/area/summary`** — header totals across the caller's own active zones:
```json
{ "artisansNearby": 6, "activeZones": 2 }
```
`artisansNearby` is deduplicated across overlapping zones — a provider visible in two of the caller's zones only counts once.

**Privacy:** both endpoints return aggregate counts only — never another provider's raw record or coordinates. The caller's own zone coordinates are naturally visible to *them* (it's their own data), but nothing here exposes any other provider's exact location.

---

## 2. Errors

| Status | Meaning                                  | Suggested UI                                  |
| ------ | ----------------------------------------- | ---------------------------------------------- |
| `401`  | Missing/expired token, or not a provider  | Redirect to login / hide the module entirely   |
| `404`  | Zone not found or not owned by the caller | Refresh the zone list; the action is stale     |
| `400`  | Deleting the primary zone                 | Disable the delete button for the primary zone (don't rely on the error) |
| `400`  | Neither `wardId` nor `name`+coordinates given on create | Inline validation before submit |

Error envelope is the same as the rest of the API: `{ status: "error", statusCode, message }`, where `message` is a `string | string[]`.

---

## 3. Quick Reference

| Method   | Path                                    | Purpose                                                       |
| -------- | ---------------------------------------- | -------------------------------------------------------------- |
| `PATCH`  | `/api/providers/me`                      | Toggle `isAvailable`, update `serviceRadius` (syncs primary zone) |
| `GET`    | `/api/providers/me/zones`                | List zones, primary first                                       |
| `POST`   | `/api/providers/me/zones`                | Add a zone (ward-based or explicit)                              |
| `PATCH`  | `/api/providers/me/zones/:id`            | Rename / resize / pause a zone                                   |
| `DELETE` | `/api/providers/me/zones/:id`            | Delete a zone (not the primary one)                               |
| `GET`    | `/api/providers/me/zones/:id/insights`   | Artisan count + category breakdown for one zone                  |
| `GET`    | `/api/providers/me/area/summary`         | Header totals across active zones                                |
| `GET`    | `/api/locations/{states,lgas,wards}`     | Cascading area lookups for the Add Zone modal (wards carry lat/lng) |

Interactive schema (dev): **`/docs`** (Swagger).
