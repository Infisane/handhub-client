# Public "Find Artisans" Page — Frontend Integration Guide

Backend work for `src/routes/_public/find.tsx` is done. This covers the blocking question,
what's already reusable, and the one new param — with real payloads captured from a live dev
server, no `Authorization` header sent on any of them.

## The blocking question — resolved

`GET /api/providers`, `GET /api/providers/:id`, `GET /api/categories`, and
`GET /api/locations/states` / `GET /api/locations/lgas` are **all public today**. Verified two
ways: read every guard on all four controllers (none of them reject a request with no token —
the providers-list route uses `OptionalAuth`, which attaches a user if a valid token happens to
be present and just proceeds either way otherwise; the rest have no guard at all), then confirmed
live with zero-`Authorization` curl calls against each — all `200`.

**Call all four directly from the logged-out route.** No interceptor branching, no separate
public-safe subset, no backend change needed here.

Two sort options the audit assumed didn't exist **already work**: `sortBy=distance` (needs
`lat`/`lon` supplied) and `sortBy=reviews`. Don't build around their absence.

---

## 1. Search + filtered/paginated list

```
GET /api/providers?q=plumber&categoryId=...&stateId=...&lgaId=...&minRate=2000&maxRate=10000&minRating=4&verified=true&sortBy=distance&lat=6.5244&lon=3.3792&radius=15&limit=20&offset=0
```

Every param is optional and combines with AND.

| Param | Type | Notes |
|---|---|---|
| `q` | string | Free-text across title, bio, city |
| `categoryId` | string | Trade category UUID |
| `serviceId` | string (UUID) | Narrows to providers offering this specific service |
| `stateId` | string (UUID) | From `GET /api/locations/states` |
| `lgaId` | string (UUID) | From `GET /api/locations/lgas?stateId=` — this is your "district" filter (Ikeja, Lekki, etc. are LGAs) |
| `lat` / `lon` / `radius` | number | Geo filter; `radius` in km |
| `verified` | boolean | Only verified providers |
| `minRating` | number (1–5) | Lower bound on `averageRating` |
| `minRate` / `maxRate` | number | **`minRate` is new this pass** — lower/upper bound on `hourlyRate` in NGN. Both optional, combine freely. |
| `sortBy` | `rating` \| `newest` \| `price_asc` \| `price_desc` \| `reviews` \| `distance` | `distance` only has an effect with `lat`/`lon` supplied, otherwise falls back to rating |
| `limit` / `offset` | number | Pagination, default limit 10 |

Response (real, `?limit=2`):

```json
{
  "data": [
    {
      "id": "237de3c0-865e-462e-9a45-8120a0ed7d3b",
      "title": "Professional Painter",
      "businessName": null,
      "bio": "Interior and exterior painting with premium finishes. 5 years transforming homes in Gwarimpa.",
      "accountType": "individual",
      "hourlyRate": "3500.00",
      "minCharge": "2000.00",
      "averageRating": "0.0",
      "reviewCount": 0,
      "yearsExperience": 5,
      "isVerified": false,
      "isPremium": false,
      "isAvailable": true,
      "aiIntakeEnabled": true,
      "approvalStatus": "approved",
      "portfolioImages": [],
      "availability": {
        "monday": { "from": "08:00", "to": "18:00" },
        "...": "one entry per day present in the provider's schedule"
      },
      "address": "23 3rd Avenue, Gwarimpa Estate, Abuja",
      "city": "Abuja",
      "latitude": "9.100500",
      "longitude": "7.430000",
      "serviceRadius": 20,
      "state": { "id": "58dd44f1-...", "code": "15", "name": "Federal Capital Territory" },
      "lga": { "id": "4375fd72-...", "code": "15-006", "name": "..." },
      "ward": null,
      "categoryId": "f0703912-75a1-47dc-81bb-d955ed020ae0",
      "services": [{ "id": "cfb9a75a-...", "name": "Interior Painting", "categoryId": "..." }],
      "createdAt": "2026-..."
    }
  ],
  "meta": { "total": 5, "limit": 2, "offset": 0 }
}
```

`minRate`/`maxRate` verified against live seeded data (providers at ₦2500–₦6000/hr):
`minRate=4000&maxRate=5500` returns exactly the providers priced ₦4500 and ₦5000, nothing outside
that band.

### Not backed by the API — keep client-side

- **`avail: "now" | "sched"`** — no API param. Same known gap as the dashboard's artisans page;
  handle client-side the same way that page already does.
- **`tags`** (3 free-form per artisan) — no direct equivalent. Reuse `services[].name` from the
  response above instead of inventing a parallel field.

---

## 2. Category filter + counts

```
GET /api/categories
```

```json
[
  { "id": "846d3a1e-...", "name": "Electrical", "icon": "bolt", "description": "Electrical installation, wiring, and repairs" },
  { "id": "76305aa8-...", "name": "Plumbing", "icon": "water", "description": "Pipe work, water systems, and sanitary fittings" }
]
```

No counts embedded — if the chips need a per-category result count, derive it from `meta.total`
on a `GET /api/providers?categoryId=...` call, or drop the count from the UI.

---

## 3. City / district filters

```
GET /api/locations/states
```

```json
[
  { "id": "f07c0864-...", "code": "01", "name": "Abia" },
  { "id": "987be44e-...", "code": "02", "name": "Adamawa" }
]
```

```
GET /api/locations/lgas?stateId=f07c0864-5e47-4bc4-ab73-5f04632ad8af
```

```json
[
  { "id": "b7747ca0-...", "code": "01-001", "name": "Aba North", "stateId": "f07c0864-..." },
  { "id": "d3c0c131-...", "code": "01-002", "name": "Aba South", "stateId": "f07c0864-..." }
]
```

Map your city dropdown to `stateId`, and the district filter (Ikeja, Lekki, Surulere, Yaba, VI)
to `lgaId` from this same list, scoped to whichever state the user picked.

---

## 4. Artisan detail modal

```
GET /api/providers/:id
```

Same shape as a list item, plus two extra fields for the detail view:

```json
{
  "...": "all list-item fields as above",
  "ratingBreakdown": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
  "reviews": []
}
```

`reviews` (when non-empty) is an array of `{ id, rating, comment, createdAt, customer: { id, fullName } }` —
richer than the current mock, no separate reviews call needed for the modal.

---

## Not backend work

- **"Find Artisans: 48" meaning** (nearby vs. something else) — the data source (`meta.total`)
  works identically either way; this is a copy/product decision, not a data question.
