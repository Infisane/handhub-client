# Email Verification — Frontend Integration Guide

This documents the **real, shipped** contracts for email OTP verification and the login gate built on top of it. Every payload below is taken from the running API. All routes are public — no `Authorization` header.

- **REST base:** `http://<host>:<port>/api` (dev default `http://localhost:8088/api`)
- **What's new:** `POST /api/auth/login` now **requires** `isVerified` to be `true` for `customer` and `provider` accounts (not `admin`) — an unverified account gets a `200` with no token instead of a session. The OTP endpoints themselves (`request`/`resend`/`verify`) already existed and are unchanged; only `login`'s behavior is new.

---

## 1. The flow

```
register ──► OTP emailed automatically ──► (user closes app / comes back later)
                                                        │
                                                        ▼
                                                  attempt login
                                                        │
                                        ┌───────────────┴───────────────┐
                                        │                                │
                                 isVerified: true                 isVerified: false
                                        │                                │
                                   token issued                 200, no token,
                                                                emailVerificationRequired: true
                                                                        │
                                                          request (or resend) a fresh OTP
                                                                        │
                                                                     verify
                                                                        │
                                                                 retry login → token issued
```

Registration already sends the first OTP and already logs the user in immediately regardless of verification (`register()` is unchanged) — the gate only bites the **next** time that account tries to log in without ever having completed verification. Build the "enter your code" screen to run right after signup (using the OTP `register()` already sent) *and* reachable again from a blocked login, since both land the user at the same step.

---

## 2. Endpoints

### 2.1 `POST /api/auth/register` — sends the first OTP automatically

No change to call this — verification is a side effect, not something the frontend triggers separately at signup:

```json
// POST /api/auth/register
{ "fullName": "...", "email": "...", "phone": "...", "password": "...", "userType": "customer" }
```
Response includes `emailVerificationRequired: true` for a fresh account (same shape as before — see main guide §9.1). Route straight to the "enter your code" screen after a successful register response with that flag set, rather than waiting for a blocked login.

### 2.2 `POST /api/auth/login` — now gated

**Success** (verified account, or `userType: "admin"`):
```json
// POST /api/auth/login
{ "credential": "...", "password": "...", "userType": "customer" }
```
```json
{
    "token": "eyJhbGci...",
    "user": {
        "id": "baaaadc7-21dc-4b37-94ba-16f182a4f6bd",
        "fullName": "Login Gate Test2",
        "email": "login-gate-test2@example.com",
        "phone": "+2348066600002",
        "userType": "customer",
        "isVerified": true,
        "isActive": true,
        "emailVerifiedAt": "2026-07-23T08:07:10.201Z",
        "lastLoginAt": "2026-07-23T08:09:33.335Z",
        "firstLoginAt": "2026-07-23T08:07:37.278Z",
        "avatar": null,
        "createdAt": "2026-07-23T08:03:07.193Z",
        "updatedAt": "2026-07-23T08:09:33.783Z"
    },
    "emailVerificationRequired": false
}
```
`firstLoginAt` is new — set once, the moment login first ever succeeds for that account, and never overwritten on later logins (confirmed live: logging the same account in twice left `firstLoginAt` untouched while `lastLoginAt` moved forward).

**Blocked** (unverified `customer` or `provider`):
```json
{ "emailVerificationRequired": true, "message": "Please verify your email before logging in" }
```

> ⚠️ **Gotcha — this is a `200`, not an error status.** The blocked response has the same HTTP status as success. **Check for the presence of `token`**, not the status code, to know which case you got. This was a deliberate choice (confirmed with the backend team) over using a 4xx, since the credentials themselves were correct — this isn't a login failure, it's a "not yet" state.

> ⚠️ **Gotcha — providers are gated too, and this matters for onboarding.** A freshly-registered, unverified provider cannot log in at all — which means they can't reach `POST /api/providers/onboarding/step-*` (requires a token) until they verify. Point a blocked provider at the same verify screen as a customer; don't build a separate provider path. Once verified they log in and onboard exactly as before. **Admin approval (`Provider.isVerified`, a completely different field, set later when staff approve their marketplace listing) has no bearing on this gate at all** — don't conflate the two. A provider can be fully logged in and mid-onboarding for a long time before an admin ever reviews them.

> ⚠️ **Gotcha — `userType: "admin"` is exempt.** Admin accounts skip this check entirely (they aren't self-registered through this flow). If you're building an admin login screen, don't add a "verify your email" branch for it — it will never fire.

### 2.3 `POST /api/auth/email-verification/request` — send an OTP

```json
{ "email": "otp-doc-capture@example.com" }
```
Success:
```json
{ "message": "Verification OTP sent" }
```
Already-verified account (safe to call speculatively — e.g. from a generic "resend code" button without first checking state):
```json
{ "message": "Email already verified" }
```
No account with that email:
```json
// 404
{ "status": "error", "statusCode": 404, "message": "Account not found" }
```
Called again within the resend window:
```json
// 429
{ "status": "error", "statusCode": 429, "message": "Please wait before requesting another OTP" }
```

### 2.4 `POST /api/auth/email-verification/resend`

Identical contract to `request` above (same underlying method) — use whichever reads better for your two call sites (initial send vs. a "didn't get it? resend" link).

### 2.5 `POST /api/auth/email-verification/verify`

```json
{ "email": "otp-doc-capture@example.com", "otp": "123456" }
```
Success:
```json
{ "message": "Email verified successfully" }
```
This is the point `isVerified` flips to `true` (and `emailVerifiedAt` is set) — after this, a retry of `POST /api/auth/login` will succeed. Wrong or expired code:
```json
// 400
{ "status": "error", "statusCode": 400, "message": "Invalid or expired OTP" }
```
Too many wrong attempts on the same code:
```json
// 400
{ "status": "error", "statusCode": 400, "message": "OTP attempt limit exceeded" }
```

---

## 3. OTP mechanics (for building the entry screen correctly)

| Property | Value |
| --- | --- |
| Code format | 6 digits, numeric |
| Expiry | 10 minutes from send |
| Resend cooldown | 60 seconds — `request`/`resend` return `429` if called again before this elapses |
| Max wrong attempts | 5 per code, then `verify` returns `400` regardless of what's typed until a fresh code is requested |
| Requesting a new code | Invalidates any still-pending code for that email — only the most recently issued one is ever valid |

Build the countdown/cooldown UI around the 60-second resend window and disable the resend button until it elapses (or just let the `429` drive it — either is fine, the server enforces it regardless of what the client shows).

---

## 4. Errors

| Status | Meaning | Suggested UI |
| --- | --- | --- |
| `200` (no `token`) | Login blocked pending verification | Route to the verify-email screen, not a generic error toast |
| `404` | `email-verification/request` for an email with no account | Generic "if this account exists..." messaging — don't confirm/deny account existence in the UI copy |
| `429` | Resend requested too soon | Show the cooldown, don't retry automatically |
| `400` | Wrong/expired OTP, or attempt limit hit | Inline error on the code input; on attempt-limit, prompt to request a new code |

Error envelope matches the rest of the API: `{ status: "error", statusCode, message }`.

---

## 5. Quick Reference

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Creates the account, sends the first OTP automatically |
| `POST` | `/api/auth/login` | Now requires `isVerified` for `customer`/`provider`; `admin` exempt |
| `POST` | `/api/auth/email-verification/request` | Send an OTP (no-ops if already verified) |
| `POST` | `/api/auth/email-verification/resend` | Same as `request` |
| `POST` | `/api/auth/email-verification/verify` | Consume the OTP, sets `isVerified = true` |

Interactive schema (dev): **`/docs`** (Swagger).
