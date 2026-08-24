# Admin Dashboard — Frontend Design Document

Companion to `docs/admin-dashboard-design.md` (the backend-facing IA + endpoint inventory). That
doc says what data exists; this one says how it should look and behave.

## Scope note — read this before anything else

The admin dashboard will be built in its **own repository or branch**, deployed on its **own
subdomain**, deliberately not sharing code with the customer/provider app this doc lives in.
That means this document can't say "reuse `ProviderListCard` from
`components/dashboard/provider-list-card.tsx`" — there's no import path across that boundary.
Instead, everything below is written as a **portable spec**: real design-token values (hex
colors, font names, spacing) instead of `var(--dashboard-*)` references, and component behavior
described by props/interaction rather than literal TSX. Rebuild from this doc; don't try to
import from this repo.

---

## 1. Design tokens

Pulled directly from this app's live `src/styles.css`, not from memory or from `CLAUDE.md` (which
is stale on at least one point — the actual typeface is **Plus Jakarta Sans**, not "Jost").

### Color

| Token | Hex | Role |
|---|---|---|
| `primary` | `#1E3A8A` | Primary / CTA (this app calls it "Midnight Blue") |
| `primary-tint` | `#EFF6FF` | Light tint surfaces (badges, hover fills) |
| `primary-mid` | `#93C5FD` | Mid accent — borders, secondary emphasis |
| `primary-pressed` | `#172554` | Hover / pressed state |
| `gold` | `#F59E0B` | Ratings & premium badges — **only** use for these two things |
| `gold-tint` | `#FEF3C7` | Gold tint surface |
| `bg` | `#FAF9F6` | Canvas background (warm off-white, not pure white) |
| `bg-card` | `#FFFFFF` | Card surface |
| `bg-hover` | `#F3EFE9` | Hover / raised surface |
| `text` | `#1A1714` | Primary text (warm charcoal, not pure black) |
| `text-muted` | `#5C564E` | Secondary text |
| `text-faint` | `#8E867C` | Tertiary / caption text |
| `border` | `#EBE5DC` | Default border |
| `border-strong` | `#DFD8CD` | Emphasized border |
| `shell` | `#0B0F19` | Dark sidebar/nav background ("Obsidian Midnight Navy") |
| `shell-raised` | `#121824` | Raised surface on the dark sidebar (active nav item, etc.) |
| `on-shell` | `#F8FAFC` | Text on the dark sidebar |
| `on-shell-muted` | `#94A3B8` | Secondary text on the dark sidebar |

**New for admin — a parallel accent trio**, not a replacement for the palette above:

| Token | Hex | Role |
|---|---|---|
| `admin-accent` | `#475569` (slate-600) | Replaces `primary` for admin-specific chrome: active nav state, primary buttons on admin-only screens, the "Admin" badge |
| `admin-accent-tint` | `#F1F5F9` (slate-100) | Light tint for admin-accent badges/hovers |
| `admin-accent-mid` | `#94A3B8` (slate-400) | Border/secondary emphasis in admin-accent contexts |

Everything else (backgrounds, text, borders, the dark sidebar) stays identical to the table
above — same visual family, so it doesn't read as a foreign app, just a distinct *mode* within
it. Destructive actions (reject, suspend, reverse) use a standard red (`#DC2626` / tint
`#FEF2F2`), consistent with how this app already treats delete/cancel actions — don't invent a
new danger color.

### Typography

Single typeface, two weights ranges, one Google Fonts import:

```
Plus Jakarta Sans — weights 300, 400, 500, 600, 700, 800 (+ italic 400, 500)
```
Body copy: 400–500 weight. Headings/display numbers (stat tiles, page titles): 700–800 weight.
There is no second display typeface in the source app's actual stylesheet despite `Syne` being
imported — both the "`--font-syne`" and "`--font-dm`" aliases resolve to the same Plus Jakarta
Sans stack. Don't add Syne; it's dead weight the source app itself doesn't use.

### Spacing & radius

Observed, not formalized as a strict scale in the source app, but consistent enough to state as
one: cards use `16px`–`20px` internal padding, `12px` (`rounded-xl`) for controls and small
cards, `16px` (`rounded-2xl`) for larger content cards and modals. Borders are `1px`, always the
`border`/`border-strong` tokens above, never a plain gray.

---

## 2. Visual identity: "same family, distinct mode"

The core design decision for this dashboard: **it should look like it belongs to the same
product, but never be mistakable for the customer/provider dashboard.** Admins here perform
actions that are consequential and often irreversible — approving a provider, suspending a user,
releasing escrowed funds, resolving a dispute. A stray click shouldn't be one context-switch away
from looking like routine browsing.

Two concrete, cheap mechanisms carry that weight:

1. **Accent swap.** Everywhere the customer dashboard would use its primary blue
   (`primary`/`#1E3A8A`) for active nav state, primary buttons, and focus rings, the admin
   dashboard uses the slate accent (`admin-accent`/`#475569`) instead. Nothing else changes —
   same dark sidebar, same card/canvas colors, same typography. The effect: it's visually
   *cooler and more neutral* than the customer product's warmer blue, which is exactly the
   "operational tool" register this needs, without requiring a second design system.
2. **A persistent "Admin" badge.** Fixed in the sidebar header, directly under or beside the
   logo — never conditional, never dismissible, always visible regardless of which screen is
   open. Small, uppercase, `admin-accent` background with `on-shell` text. This is the thing an
   admin's eye should catch every single time before taking a destructive action.

Do not reach for a banner, watermark, or a completely different layout system to achieve this —
those either get ignored (banners get scrolled past) or cost real build time (a second layout
system) for the same signal these two cheap mechanisms already deliver.

---

## 3. Shell & navigation

**Layout**: a fixed dark sidebar (`shell` background) on the left, light canvas (`bg`) content
area on the right — same two-pane structure as the source app's dashboard, because it's a proven
pattern for exactly this kind of nav-heavy, many-sections tool. On narrow viewports the sidebar
collapses behind a hamburger trigger into an overlay drawer (see §7 — this is the one piece of
mobile behavior worth actually replicating, since "sidebar unusable on a phone" is a real bug
class, not just a nice-to-have).

**Information architecture** (from `docs/admin-dashboard-design.md`'s IA tree), grouped the same
way a long admin nav benefits from grouping — a handful of labeled sections rather than one flat
list of 13+ items:

| Group | Items |
|---|---|
| **Overview** | Dashboard (home) |
| **Marketplace** | Providers (Pending Approvals · All Providers), Users, Bookings |
| **Money & Trust** | Payments & Wallets (· Fraud & Risk), Disputes, Reviews |
| **Insights** | Search & Geo Insights, AI Operations |
| **Operations** | Notifications & Delivery, Categories & Services, Audit Log, System Health |

Suggested icon per item (a common icon set — Lucide is a reasonable default given its ubiquity
and the source app's own usage, not because it's importable from here):

- Dashboard → `LayoutDashboard` · Pending Approvals → `ClipboardCheck` · All Providers →
  `ShieldCheck` · Users → `Users` · Bookings → `Calendar` · Payments & Wallets → `Wallet` ·
  Fraud & Risk → `AlertTriangle` · Disputes → `Gavel` · Reviews → `MessageSquareWarning` ·
  Search & Geo Insights → `MapPin` · AI Operations → `Cpu` · Notifications & Delivery → `Bell` ·
  Categories & Services → `Tags` · Audit Log → `ScrollText` · System Health → `Activity`

**Badges**: real counts only, sourced from the actual endpoint response length — never a
placeholder number. Pending Approvals is the one item that should almost always carry a badge in
practice (`GET /api/admin/providers/pending`'s result count); most other items only badge when
something needs attention (e.g. Fraud & Risk badges only when there's a reversal in the last
24h, not a permanent static count).

---

## 4. Per-section screen design

One governing rule for every section below: **a section blocked on a 🆕 (not-yet-built) backend
endpoint renders an honest "this needs `<endpoint>` before it can show real data" empty state —
never fabricated numbers or example rows.** This is the same discipline the customer dashboard
was rebuilt around this session (its own "Recent Activity" feed and "Saved Payment Cards"
section were deleted outright rather than left showing fake data once their backing endpoints
turned out not to exist). Build the screen shell now; wire it the moment the endpoint ships.

### 4.1 Dashboard Home
Stat-tile grid — 3–4 large-number cards in a row, each with a label, a big number, and (when
data supports it) a small trend indicator. Today's payload (`GET /api/admin/stats`, ✅) supports
three tiles directly: Users (with a customer/provider/admin breakdown as secondary text under
the headline number), Bookings, Revenue. The 🆕 trend-delta fields (7/30-day deltas) are
additive — design each tile so a trend arrow renders *if* the field is present and simply
doesn't render if it's absent, rather than the tile depending on it.

### 4.2 Providers → Pending Approvals
A **dense table**, not a card grid. This is a queue an admin works through repeatedly, in order —
density and scan-ability matter more than visual flourish here (contrast with the customer app's
provider *browsing* experience, which is card-based because customers browse a handful of
options, not process a queue). Columns: name/business, category, submitted date, a location
indicator, actions. The location indicator is the direct fix for the incident that motivated this
whole section: a small colored dot or icon per row — green/present if `hasLocation: true`, red/
warning if `false` — visible without opening the row. Row actions: Approve / Reject, both routed
through the confirm-dialog pattern (§5) since both are consequential.

### 4.3 Providers → All Providers
Same dense-table shape, browsable/searchable/filterable (reuses everything
`GET /api/providers` already returns — query text, category, state/LGA, rate range, rating,
verified). Row click opens a detail panel or full detail view containing:
- Full profile fields, portfolio, services.
- A **map** rendered from `latitude`/`longitude` — the single highest-leverage visual called out
  in the backend doc for catching "provider has no coordinates" or "provider's coordinates look
  wrong" before it reaches a customer. See §5 for the technique.
- An admin action row: suspend / force-unavailable / edit (once the 🆕 `PATCH
  /api/admin/providers/:id` ships) — until then, this row shows disabled buttons with a tooltip
  explaining why, not hidden buttons (an admin should be able to see what's *coming*, not wonder
  if the feature was cut).

### 4.4 Users
Dense, filterable table (name, email, type, active status, joined date). Today's
`GET /api/admin/users` has no pagination — **design the table's pagination/filter UI now anyway**,
against the endpoint that exists, so the only work once `?userType=&isActive=&q=&limit=&offset=`
ships is swapping a client-side filter for real query params, not redesigning the screen.
Deactivate/Reactivate actions render disabled with an explanatory tooltip until the 🆕 endpoint
exists, same treatment as §4.3's admin actions.

### 4.5 Bookings
Same dense-table pattern (customer, provider, status, amount, date), same "design the filter UI
against today's unfiltered endpoint, wire params later" approach as Users. Row click drills into
`GET /api/bookings/:id` (✅) for the full detail view.

### 4.6 Payments & Wallets
A filterable ledger table over `GET /api/admin/ops/payments/recent` today (a fixed-window feed —
present it as such, e.g. "last 100 payments," not implying it's a queryable history until the 🆕
`GET /api/admin/payments?status=&method=` ships). One thing matters more than the table: a
**persistent banner**, not a toast or a settings-page footnote, stating plainly that card
payments are disabled platform-wide (`PAYSTACK_ENABLED`/`FLUTTERWAVE_ENABLED: false` today) and
only wallet payments are live. An admin investigating "why didn't this customer's card payment
go through" should see this the instant they open the page, not discover it by testing a
checkout themselves.

**Fraud & Risk** (sub-section, same page or a tab): table over `GET /api/admin/fraud/reversals`
once built — columns for amount, risk level, reasons, timestamp. Risk level renders as a colored
status pill (amber for `medium`, red for `high`) — same visual language as booking/ticket status
badges elsewhere in this design (§6), not a bespoke risk-specific style.

### 4.7 Disputes
List + detail-panel split (list on the left or top, full detail on click/select) — the same
shape as several list-then-detail screens in this design (Bookings, Users, Fraud). The one thing
worth real design attention: `aiRecommendation` (already returned on every dispute record —
`recommendation`, `reasoning`, `confidence`, `keyFactors`) renders as a **distinct callout card**
inside the resolve panel — bordered, its own background tint, a small "AI-assisted" label — not
buried as a raw JSON blob or a plain paragraph indistinguishable from admin-entered notes. It's a
free second opinion the backend is already computing; the UI should make that obvious.

### 4.8 Reviews (moderation)
**Not buildable yet** — blocked on a backend sentiment-persistence migration per the source doc.
Design only a coming-soon placeholder for this nav item (icon, label, one line: "Review
moderation queue — pending a backend change to persist review sentiment"). Don't design the full
moderation UI against data that doesn't exist yet; that's designing into a vacuum.

### 4.9 Search & Geo Insights
A density map (same map technique as §4.3, §5 — one lat/lng-projection component used three
times across this whole dashboard) showing provider concentration per area, with an
approved-vs-pending color split so "pending providers near active demand" — the exact gap that
motivated this section — is visible without drilling into a table. A data table underneath for
the same information in scannable rows. The zero-result-queries sub-table is blocked on search
logging that doesn't exist yet (🆕) — same coming-soon treatment as §4.8 for that specific piece
only; the density map itself is buildable today.

### 4.10 AI Operations
Per the confirmed decision: **no chart library for v1.** Stat tiles (total calls, total tokens,
estimated cost, error rate) across the top, a dense per-model/per-feature breakdown table below.
This entire section is flagged as blocked pending a real backend decision (persist telemetry to
a table vs. scrape logs) — design the shell, mark it clearly "awaiting backend: telemetry
storage decision," and revisit once that's resolved rather than building against log-scraping as
a permanent architecture.

### 4.11 Notifications & Delivery, System Health
Both are close to pure visualization over already-✅ endpoints
(`ops/failures`, `ops/alerts`, `ops/health-summary`, `ops/provider-health`, `/health`). A
**status-grid pattern**: one card per subsystem (mail, payment providers, notification outbox,
AI model reachability, DB/memory/disk), each showing a colored status dot + label + one-line
detail. Same visual language as the booking-status pills elsewhere — a small, consistent
"status indicator" component reused everywhere something has a health/state value, not a new
pattern per screen. The one net-new item: a periodic "can we reach the configured AI model"
check surfaced here as its own card — the backend doc notes this would have caught a real
multi-week outage immediately instead of via a user complaint.

### 4.12 Categories & Services
Standard CRUD table + modal form (name, icon, description for categories; name/category/active
flag for services). Nothing unusual here — this is the most conventional screen in the whole
dashboard, reuse the confirm-dialog pattern (§5) only for delete, not for create/edit.

### 4.13 Audit Log
The **highest value-per-effort screen** per the backend doc, and the natural place to build the
shared data-table component first (§5) since every other list screen in this dashboard wants the
same shape. Heavily filterable: action type, actor, target entity, date range. Every meaningful
admin/system action already writes here — this table earns its keep from day one even before any
other 🆕 endpoint ships.

---

## 5. Shared component specs

Behavior contracts, not code — there's no shared package to publish across the repo boundary, so
each of these gets implemented once in the new repo and reused internally there.

**Data table.** Props/behavior: an array of column definitions (key, label, optional custom
cell renderer, sortable flag), a data array, loading/empty/error states as explicit inputs (not
inferred from data being `[]` — an empty *filtered* result and "endpoint doesn't exist yet" are
different states and should look different), row click-through to a detail view or panel,
built-in pagination (page number + total, not infinite scroll — admins want to jump to page 12,
not scroll for a minute). This is the one component worth investing real time in, since nine of
the thirteen sections above use it.

**Confirm-action dialog.** A modal wrapping any consequential action: title, body copy
explaining the consequence, a cancel button, and a confirm button styled neutral (`admin-accent`)
or danger (red) depending on the action. Every approve/reject/suspend/reactivate/refund/resolve
action in this dashboard routes through this same component with different copy — never a raw
`window.confirm()`, never an action that fires immediately on a single click with no
confirmation step.

**Lat/lng map embed.** No external map-tile dependency required for v1: project a set of
lat/lng points onto an SVG viewBox by normalizing against the bounding box of the points being
shown (min/max lat, min/max lng → 0–100 coordinate space), same technique as a simple
equirectangular projection. This avoids a Google Maps API key/billing dependency for what's
fundamentally a "where roughly is this" visualization, not turn-by-turn navigation. Used by
Provider detail (§4.3, one point), Search & Geo Insights (§4.9, many points, colored by
approval status).

**Status pill.** A single small component: colored dot + label, color driven by a
semantic status prop (`success` / `warning` / `danger` / `neutral`) rather than one-off classes
per screen. Used for booking status, fraud risk level, system health, dispute status — anywhere
a value has a small, finite set of states worth color-coding.

---

## 6. Responsive behavior

**Desktop-first.** This is an internal operational tool used at a desk, not a consumer product —
dense multi-column tables are the default target, and that's fine; don't design a card-collapse
alternate layout for every table as a first-class deliverable. Mobile only needs to **not be
broken**: the sidebar collapses to a drawer (§3), and tables get horizontal scroll inside their
own container rather than reflowing into cards.

Two specific mobile bugs this session had to fix on the *customer* dashboard, worth stating here
as general facts so the new repo doesn't rediscover them independently:
- Use `100dvh` for any full-height shell layout, not `100vh` — on mobile browsers with a
  collapsing address bar (notably iOS Safari), `100vh` is measured against the viewport as if
  the browser chrome were permanently hidden, so real content ends up taller than the actual
  visible area.
- Any fixed-position bottom element (a bottom nav bar, if this dashboard ever gets one) needs
  scrollable content beneath it to reserve bottom padding equal to that bar's height — a fixed
  element doesn't participate in document flow, so without explicit padding, page content renders
  underneath it and gets visually clipped.

---

## 7. Build order

Mirrors the backend doc's own suggested sequence:

1. **Audit Log** (§4.13) + **Provider detail map / `hasLocation` flag** (§4.2, §4.3) — cheapest,
   highest immediate value, and the pair that directly prevents a repeat of the incident that
   motivated this whole project.
2. **Users + Bookings tables** (§4.4, §4.5) — the unbounded-query scaling risk exists
   independent of whether this dashboard ships; building the UI now doesn't block on it.
3. **Fraud & Risk** (§4.6) + **AI Operations** (§4.10) — the underlying data already exists
   (audit records, telemetry logs); this phase is mostly exposing what's already being captured.
4. **Search & Geo Insights** (§4.9) — small, reuses the map technique already built in phase 1.
5. **Reviews moderation** (§4.8) — sequenced last; blocked on a backend migration, build only
   once that lands.
