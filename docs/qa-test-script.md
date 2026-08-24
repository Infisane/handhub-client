# Handhub Client — Manual QA Test Script

A step-by-step script for manually verifying the app end-to-end. Written against the live dev
API — every flow below exercises a real backend call, not mock data. Check off each step; a
failure should be filed with the exact step number, what you expected, and what happened.

## Prerequisites

- Dev server running (`pnpm dev`) against a live backend (`VITE_API_URL` set in `.env.local`).
- Two **fresh** test accounts you can register during the script itself: one `customer`, one
  `provider`. Don't reuse already-verified accounts for §2 (you need to see the unverified state).
- A completed, paid booking between your two test accounts before starting §8/§9 (reviews) and
  §7 (payments transaction history) — either create one live via §6, or use existing seed data if
  your dev backend has any.
- Test on at least: one desktop browser width (≥1024px) and one narrow width (<768px, or real
  device) — several sections below are mobile-specific.
- Have your browser's dev tools Network tab open for the auth/API-visibility checks in §1 and §2.

---

## 1. Public pages (logged out)

- [ ] **1.1** Load `/` — marketing homepage renders, no console errors.
- [ ] **1.2** Load `/find` — real artisan results load (not placeholder/mock names). Check the
  Network tab: no `Authorization` header is sent on the `/api/providers` request, and it still
  returns `200`.
- [ ] **1.3** `/find`: type a search term → results filter after a short debounce (not on every
  keystroke).
- [ ] **1.4** `/find`: pick a state in the hero dropdown → district filter in the sidebar
  populates with real LGAs for that state, previously-selected district clears.
- [ ] **1.5** `/find`: select a trade category, a minimum rating, a rate range, and toggle
  "Available now" — confirm results narrow correctly for each; toggling **any** filter jumps
  pagination back to page 1.
- [ ] **1.6** `/find`: switch grid ↔ list view — layout changes, cards don't break.
- [ ] **1.7** `/find`: click a result card → provider profile modal opens with **real** bio,
  rating breakdown, and reviews (not the mock's fabricated content).
- [ ] **1.8** `/find`: click "Hire"/"Message" on a card or inside the modal → lands on `/signup`
  (guest can't actually contact a provider).
- [ ] **1.9** `/find`: refresh the page mid-scroll on a slow connection — skeleton loading cards
  appear shaped like real result cards, not a blank flash or a generic spinner.
- [ ] **1.10** Try to load `/dashboard` directly while logged out → redirected to `/signin`.

## 2. Sign up + email verification

- [ ] **2.1** Go to `/signup`, fill step 1 (role, name, phone, a real-ish but fresh email) → step 2
  (password) → submit.
- [ ] **2.2** Immediately after submit, a "Verify your email" dialog opens (not a full page
  navigation) showing the email you just entered.
- [ ] **2.3** Click "Resend code" → toast confirms a code was sent; check the account's inbox
  (or backend logs, if email isn't wired in dev) for a 6-digit code.
- [ ] **2.4** Enter a **wrong** code → inline error, doesn't close the dialog.
- [ ] **2.5** Enter the **correct** code → dialog closes, you land on `/dashboard` already signed
  in (no separate login step required).
- [ ] **2.6** Log out (see §3.4), then try signing in with that same account **before** verifying
  a *second*, still-unverified account (register a second throwaway account for this step) →
  confirm login is blocked with a clear message, not a generic error, and the verify dialog opens
  automatically with the email pre-filled.
- [ ] **2.7** Enter the correct code in that blocked-login dialog → confirm it logs you in
  automatically afterward (you should **not** have to retype your password).

## 3. Sign in / sign out / route guards

- [ ] **3.1** Sign in with a verified account → lands on `/dashboard`.
- [ ] **3.2** While signed in, navigate to `/signin` or `/signup` directly → redirected straight
  to `/dashboard` (can't see the auth forms while already logged in).
- [ ] **3.3** While signed in, navigate to `/` or `/find` → also redirected to `/dashboard`.
- [ ] **3.4** Log out from the sidebar user menu → session clears, lands on `/`.
- [ ] **3.5** Immediately after logging out, **type** `/dashboard` directly into the address bar
  (a full page load, not a link click) → still redirected to `/signin`, not left stuck on a blank
  or broken dashboard shell.
- [ ] **3.6** As a **customer** account, confirm "My Area" does **not** appear in the sidebar or
  mobile "More" drawer, and typing `/dashboard/my-area` directly redirects to `/dashboard`.
- [ ] **3.7** As a **provider** account, confirm "My Area" **does** appear and is reachable.

## 4. Dashboard Home

- [ ] **4.1** "Active Jobs" tile shows a real count — cross-check it matches the "Active" tile on
  the Bookings page (§6.1).
- [ ] **4.2** "Artisans Nearby" tile: on first load (before granting location), shows "—" and
  "Enable location…" copy, not a fake number. Grant location permission → real count and "Within
  5 km" appear.
- [ ] **4.3** "Total spent" tile shows a real naira amount with an up/down trend arrow — cross-
  check against the wallet balance on the Payments page.
- [ ] **4.4** No "Recent Activity" section is present (intentionally removed — no backend for it
  yet, so it should not reappear with fake entries).
- [ ] **4.5** If you have unread messages, the floating chat button (bottom-right) shows a red
  unread-count badge; if zero unread, no badge renders (not a "0").
- [ ] **4.6** Sidebar badges (Find Artisans, Bookings, Messages) show the same real numbers as
  their respective pages/tiles — not independent fake counts.

## 5. Find Artisans (dashboard, authenticated)

- [ ] **5.1** Search, category chips, "Filters" panel (availability / min rating / verified-only),
  and sort all work and combine correctly.
- [ ] **5.2** Click "Hire" on a card → the chat side panel opens (desktop) targeting that
  provider, with **no existing thread yet** — first message you send creates the thread.
- [ ] **5.3** On a **narrow viewport** (<1024px), repeat 5.2 → instead of a broken/invisible side
  panel, you're taken to `/dashboard/messages` with that conversation already open.

## 6. Bookings

- [ ] **6.1** Header tiles (Active / Done / Total Invested) show real numbers derived from your
  actual threads/tickets.
- [ ] **6.2** Tab filters (by status) correctly narrow the list; badge counts on each tab match.

## 7. Messages / chat-first booking flow

- [ ] **7.1** Open a conversation with unread messages → badge count (sidebar, mobile tab, and
  Dashboard Home floating button) drops after you **open and view** it, not just after receiving
  it — and it updates again once you navigate back out of the conversation.
- [ ] **7.2** As a customer messaging a provider for the first time: send a message → thread +
  first ticket are created; provider side sees it appear in their inbox.
- [ ] **7.3** Provider generates an invoice on the ticket → customer sees the invoice card, can
  accept or reject it.
- [ ] **7.4** Customer accepts + pays (wallet funds must cover it, or use the deposit flow from
  §7.6 first) → booking is created, ticket status moves to booked/in_progress per the provider's
  actions.
- [ ] **7.5** Provider marks the job "Start" then "Mark completed" → ticket status updates on both
  sides in near-real-time (via websocket, not just on refresh).
- [ ] **7.6** After completion, customer can leave a review from the ticket footer action *and*
  separately from the Reviews page's "Pending Feedback" section — confirm doing it from one place
  removes it from the other (they share the same underlying data).
- [ ] **7.7** On a **narrow viewport**, open a long conversation and scroll: the message
  composer (input + send button) and the last item in the thread list are fully visible, not
  hidden behind the bottom tab bar.
- [ ] **7.8** On a narrow viewport, confirm content (message bubbles, composer) doesn't clip or
  overflow off the right edge of the screen.

## 8. Payments

- [ ] **8.1** Wallet balance tile shows your real balance; "Fund Wallet" with a real amount → 
  balance updates and a real transaction (not a fake `TXN-####` id) appears at the top of the
  list.
- [ ] **8.2** "Withdraw" with an amount ≤ balance → succeeds; try one **greater** than your
  balance → blocked client-side before submitting.
- [ ] **8.3** Transaction list category tabs (Deposits / Payments / Withdrawals / Refunds) filter
  correctly; search box filters by description/reference/artisan name.
- [ ] **8.4** Click a transaction tied to a booking made through a chat ticket → detail modal
  shows the associated ticket + artisan name/avatar. Click one from a deposit/withdrawal (no
  booking) → those fields are simply absent, not blank/broken.
- [ ] **8.5** "Funds in Escrow" card: for most accounts this will read "No funds currently held in
  escrow" — that's expected (only card payments sit in escrow; wallet payments settle instantly).
  Don't file this as a bug unless you specifically paid via a card-based flow and it's still zero.
- [ ] **8.6** Confirm there is **no** "Saved Payment Cards" section anywhere on this page
  (deliberately removed — deferred pending real card tokenization).

## 9. Reviews

- [ ] **9.1** "Pending Feedback" section lists real completed-but-unreviewed bookings (no fake
  entries); submitting a review removes it from this list immediately.
- [ ] **9.2** Written Evaluations feed shows your real submitted reviews with the correct artisan
  name and job title (joined from booking data, since the review record itself doesn't store
  them).
- [ ] **9.3** Average rating, total count, and the star-distribution bars at the top update
  correctly after submitting a new review.
- [ ] **9.4** Confirm there is **no** way to edit or delete an already-submitted review (removed
  — no backend support exists for either).
- [ ] **9.5** Search and the star-rating filter tabs both work on the written-reviews feed.

## 10. My Area (provider accounts only)

- [ ] **10.1** A provider's **primary zone** already exists on first visit (auto-created) — you
  should never see an empty zone list for a fully onboarded provider.
- [ ] **10.2** Toggle "Accepting Alerts" and move the radius slider, then "Save Changes" → both
  persist after a refresh (single API call for both).
- [ ] **10.3** "Add Sector": cascading State → LGA → Ward selects populate correctly; submitting
  adds a real, non-primary zone.
- [ ] **10.4** Toggle a non-primary zone active/inactive, then delete it → both work; confirm the
  **primary zone has no delete button** at all.
- [ ] **10.5** Select a zone → detail panel shows a brief loading state, then real artisan count
  and a category breakdown (not fabricated percentages).
- [ ] **10.6** Switch between Google Maps and Vector View with zones in **different states** (not
  just Lagos) → Vector View correctly projects all of them on-canvas, not clustered at one edge
  or off-screen.
- [ ] **10.7** As a **customer** account, confirm none of the above is reachable (see §3.6).

## 11. Settings

- [ ] **11.1** Profile tab: edit and save fields → persists after refresh.
- [ ] **11.2** Security tab: change password with correct current password → succeeds; with wrong
  current password → clear inline error.
- [ ] **11.3** Notifications tab: toggle preferences → persists.
- [ ] **11.4** Avatar: if a photo URL is set, it renders; if not, initials render instead (no
  broken image icon).

## 12. Location permission

- [ ] **12.1** Deny location permission in the browser → an alert banner appears explaining
  location is blocked, with copy that correctly says a click alone can't re-prompt (browsers
  don't allow re-prompting once explicitly blocked) and points you to browser site settings.
- [ ] **12.2** Re-allow location in browser settings, click the banner's retry button → resolves
  without needing a full page reload.

## 13. Cross-cutting mobile checks (repeat on a narrow viewport / real device)

- [ ] **13.1** Every dashboard page's content clears the fixed bottom tab bar — nothing is
  clipped behind it, on any page, including after scrolling to the very bottom of a long list.
- [ ] **13.2** On an iPhone with a home-indicator (or simulate via dev tools), the bottom tab bar
  has visible padding beneath its icons, not flush to the physical screen edge.
- [ ] **13.3** Sidebar collapses into the hamburger/mobile drawer correctly; opening chat, a
  modal, or the mobile filters drawer doesn't allow background page scroll.

---

## Sign-off

Record: date, tester, environment (API URL / commit hash), and a summary of any failed steps with
their numbers. A clean run should have zero fabricated/mock data visible anywhere in the app —
if you see a hardcoded-looking number, name, or example bio, treat it as a bug and file it citing
this document's section number, since every list above should render entirely from live data.
