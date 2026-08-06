# Public "Find Artisans" Page — Backend Endpoint Request

A request from the frontend for the endpoints needed by `src/routes/_public/find.tsx` — the
**guest-facing**, unauthenticated "browse artisans" search page (distinct from the logged-in
dashboard's `dashboard/artisans.tsx`, which already has live endpoints). Today this page is
**100% mock**, rendering a hardcoded `ARTISANS` array from `src/types/artisan.ts`.

The good news: almost everything this page needs was already built and verified for the
dashboard's artisan search this session. The one thing that isn't yet confirmed is the
**critical, page-defining question** below.

---

## ⚠️ Open question — must be answered before wiring this page

This route has **no auth guard** and no login. But `GET /api/providers`, `GET
/api/providers/:id`, `GET /api/categories`, and `GET /api/locations/*` were only proven to work
from the **authenticated dashboard** — the frontend's axios interceptor attaches
`Authorization: Bearer <token>` *if a session exists*, but a guest browsing this page has none.

**Are these routes reachable without a token?** Two ways this could go:
1. **They're already public** (no `@UseGuards` on these controllers) — in which case no backend
   change is needed at all, we just call them from a logged-out context and everything below
   works as-is.
2. **They require auth** — in which case we need either (a) these specific read-only endpoints
   opened to unauthenticated requests, or (b) a separate public-safe subset (e.g. omitting
   anything provider-PII-adjacent) under a different path.

Please confirm which case we're in — it determines whether anything below requires backend work
at all.

---

## Reuse — already built and verified (assuming §1 resolves to "public")

| UI feature | Endpoint | Notes |
|---|---|---|
| Search + filtered/paginated list | `GET /api/providers` | Already supports `q`, `categoryId`, `verified`, `minRating`, `sortBy`, `lat`/`lon`/`radius`, `stateId`, `lgaId`, `limit`/`offset` |
| Trade category filter + counts | `GET /api/categories` | Same source as the dashboard's category chips |
| City dropdown | `GET /api/locations/states` | Map city name → `stateId`, pass as `GetProvidersParams.stateId` |
| District filter (Ikeja, Lekki, Surulere, Yaba, VI) | `GET /api/locations/lgas?stateId=` | These are LGAs — maps directly to `GetProvidersParams.lgaId` |
| Artisan detail modal (bio, full review list) | `GET /api/providers/:id` | Returns `bio`, `reviews`, `ratingBreakdown` — richer than the current mock |

No new endpoints needed for the above — just wiring, once §1 is resolved.

---

## Gaps — no backend equivalent today

| Mock feature | Gap | Suggested handling |
|---|---|---|
| `avail: "now" \| "sched"` filter | No API param for this (same known gap as the dashboard's artisans page) | Keep client-side only, same as today's dashboard implementation |
| Min-rate slider | `GetProvidersParams` has `maxRate` but no `minRate` | Either add `minRate` server-side, or filter client-side on the fetched page (imprecise across pages — server-side `minRate` is preferred if easy to add) |
| "Nearest first" sort | Confirmed `sortBy` values are `rating`, `experience`, `rate_asc`, `rate_desc` — no distance-based sort | Only meaningful with `lat`/`lon` supplied; confirm if `sortBy=distance` (or similar) exists or can be added |
| "Most reviews" sort | Same — no confirmed `sortBy` value for review count | Confirm if a `sortBy=reviews` (or similar) value exists or can be added |
| `tags` (3 free-form per artisan, e.g. "Residential", "Emergency", "Panels") | No direct equivalent | Reuse `services[].name` from the provider response instead — not identical but close enough to repurpose as tags |

## No backend work needed (derivable client-side)

- `initials` / avatar color — same `initialsOf()`-style derivation already used elsewhere in the app (e.g. `UserAvatarBadge`)
- `dist` ("1.2km") — computed from guest geolocation + provider lat/lon, same pattern as the dashboard's `useUserLocation`

---

## Quick Reference

| Method | Path | Status |
|---|---|---|
| `GET` | `/api/providers` | Exists — needs public-access confirmation (§1) |
| `GET` | `/api/providers/:id` | Exists — needs public-access confirmation (§1) |
| `GET` | `/api/categories` | Exists — needs public-access confirmation (§1) |
| `GET` | `/api/locations/states` · `/lgas` | Exists — needs public-access confirmation (§1) |

## Open questions for the backend

1. **(Blocking)** Are `/api/providers`, `/api/providers/:id`, `/api/categories`,
   `/api/locations/*` reachable without `Authorization`? If not, what's the plan — open them, or
   a separate public subset?
2. Is there (or can there be) a `minRate` param on `GET /api/providers`?
3. Does `sortBy` support (or could it support) a distance-based and/or review-count-based value?
