# "My Area" Module

## Overview

"My Area" is the **provider/artisan-only dispatch-zone management page** — not a profile or portfolio page. It lets an artisan define *where* they're willing to receive job/booking alerts: geographic zones (by ward), a primary coverage radius from their base, and an overall online/offline "accepting alerts" toggle.

Page copy: "Define your dispatch service zones, track local demands, and adjust coverage limits."

**Gating**: `beforeLoad` in the route redirects non-provider users to `/dashboard`; the sidebar link only renders when `userType === "provider"`. Customers have no equivalent view — they have no service area to manage.

## File inventory

| Layer | File |
|---|---|
| Route + all sub-components | `src/routes/dashboard/my-area.tsx` (single file: `MyAreaPage` + local `ServiceMap`, `GoogleMapWrapper`, `ZoneCard`, `AddZoneModal`, `ZoneDetailPanel`) |
| Shared UI | `src/components/ui/dialog.tsx` (used by `AddZoneModal`) |
| Services | `src/core/services/my-area.service.ts`, `src/core/services/location.service.ts` |
| Queries | `src/core/queries/my-area.q.ts`, `src/core/queries/location.q.ts` |
| Types | `src/core/types/my-area.types.ts`, `src/core/types/location.types.ts` |
| Nav/guard | `src/routes/dashboard/route.tsx` |
| Existing contract doc | `docs/my-area-integration.md` |

No Zod schema exists for this module (`src/core/schemas/`) — the page is all selects/sliders/toggles, no free-text form needing `useValidator`, so that's expected rather than a gap.

## How a provider configures it

- **Availability toggle + Save Changes** — flip "Accepting Alerts / Offline"; batches with the radius slider into one save request.
- **Stat tiles** — "Artisans Nearby" and "Active Dispatch Zones" (read-only).
- **Coverage map** — toggle between real Google Maps (JS API loaded dynamically via `<script>`) and a dependency-free hand-rolled SVG "Vector View."
- **Primary Dispatch Radius slider** — 1–20km, controls how far the provider shows up in job boards; quick-select buttons at 2/5/10/15/20km.
- **Dispatch Mode Offline banner** — shown when `isAvailable` is false, warning the profile is hidden from search.
- **Service Sectors list** — `ZoneCard`s (name, ward, coverage km, active/paused toggle, delete — disabled for the primary zone) plus "Add Sector" → `AddZoneModal` with cascading State → LGA → Ward selects and a coverage-radius slider. The backend derives the zone's name/lat/lng from the chosen ward; the client only sends `wardId` + `coverageKm`.
- **Zone Detail Panel** — selecting a zone lazily fetches an "Artisan Breakdown" chart plus zone dispatching status for that zone.

**Local/unsaved-until-submit state**: availability toggle + radius slider (seeded once from the provider profile, then edited locally until "Save Changes"). **Pure UI state, never persisted**: selected zone, modal open/close, map mode, saved-toast visibility, and a client-side-only zone color palette (the API doesn't return zone colors).

## Backend endpoints required

All confirmed live-wired — this module was migrated off mock data (`MOCK_ZONES`, `SUGGESTED_ZONES`) in commit `7cbcf4d` ("My Area: wire dispatch zones, availability, radius, and insights to the live API"). `docs/my-area-integration.md` documents the same contract. Base URL: `VITE_API_URL` (bare host, no `/api` suffix — each path below already carries it).

### My Area endpoints (`my-area.service.ts`)

| Method | Path | Payload | Response |
|---|---|---|---|
| GET | `/api/providers/me/zones` | — | `ServiceZone[]` |
| POST | `/api/providers/me/zones` | `{ wardId: string; coverageKm?: number }` | `ServiceZone` |
| PATCH | `/api/providers/me/zones/:id` | `{ name?: string; coverageKm?: number; isActive?: boolean }` | `ServiceZone` |
| DELETE | `/api/providers/me/zones/:id` | — | `{ message: string }` |
| GET | `/api/providers/me/zones/:id/insights` | — | `{ artisanCount: number; breakdown: { categoryId; name; count }[] }` |
| GET | `/api/providers/me/area/summary` | — | `{ artisansNearby: number; activeZones: number }` |
| PATCH | `/api/providers/me` | `{ isAvailable?: boolean; serviceRadius?: number }` | full `ProviderProfile` (also invalidates the `["auth","me"]` query cache so the dashboard header/nav re-sync) |

### Shared location endpoints (`location.service.ts`, used by the add-zone modal)

| Method | Path | Response |
|---|---|---|
| GET | `/api/locations/states` | `{ id; code; name }[]` |
| GET | `/api/locations/lgas?stateId=` | `{ id; code; name; stateId }[]` |
| GET | `/api/locations/wards?lgaId=` | `{ id; code; name; lgaId; latitude; longitude }[]` |

## Known gaps

Two stat fields present in the original mock were intentionally dropped: "Local Job Orders" (header) and "Open Jobs"/"Avg Response" (zone detail/cards). Per `docs/my-area-integration.md`, no backend data model exists yet for job-board demand or response-time tracking — this is a deliberate omission, not incomplete wiring. No other endpoints are missing for the module as currently scoped.
