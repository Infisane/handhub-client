# Sign in with Google — Frontend Implementation Guide

One new endpoint covers both Google signup and Google login: `POST /api/auth/google`. It verifies
a Google ID token server-side and either logs the user in, auto-links to an existing email/password
account, or creates a new account — whichever applies. The response tells you which happened.

The error-response examples below are captured from a live dev server. The success-response
examples are constructed directly from the implementation (same token/user shape `/api/auth/login`
already returns, `isNewAccount` added) — minting a real Google ID token requires an actual
browser OAuth flow, which can't be done headlessly from here. Once you're wired up, the first real
call will confirm the exact shape; nothing about it should differ from what's below.

---

## 1. One-time setup

**Backend already has a client ID configured for local/dev:**
```
944420025348-bnov5dcknknev1bogghgercqh7vb99e9.apps.googleusercontent.com
```
This is a public identifier (safe to embed in frontend code — it's not a secret, unlike a client
secret, which the backend never needs for this flow). Production will need its own client ID
added to the backend's `GOOGLE_CLIENT_IDS` env var — ask backend to add it when you're ready to
deploy, or if a native app needs a second client ID alongside the web one (the backend already
accepts multiple, comma-separated).

**In Google Cloud Console**, under this OAuth client's settings, add every origin your frontend
runs on to **Authorized JavaScript origins** — e.g. `http://localhost:5173` for local dev, plus
your staging/production domains. This is separate from the backend's CORS config (`ALLOWED_ORIGINS`)
and is enforced by Google itself — the Sign-In button silently fails to load credentials from an
unlisted origin.

**Load Google's Identity Services script:**
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

---

## 2. Getting the ID token client-side

```js
google.accounts.id.initialize({
    client_id: '944420025348-bnov5dcknknev1bogghgercqh7vb99e9.apps.googleusercontent.com',
    callback: handleGoogleCredential,
});

google.accounts.id.renderButton(
    document.getElementById('google-signin-button'),
    { theme: 'outline', size: 'large' },
);
```

```js
async function handleGoogleCredential(response) {
    const idToken = response.credential; // this is the ID token — send it as-is, don't decode/modify it

    const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, phone, userType }),
    });
    const data = await res.json();

    if (!res.ok) {
        // see §4 — data.message is a string or string[]
        return;
    }

    // store data.token exactly like the existing /login and /register flows
    // data.isNewAccount tells you whether to show "Welcome" vs "Welcome back"
}
```

`phone` and `userType` here need to come from your own UI (a field + a customer/provider toggle),
collected **before** this call — see the important note in §3.

---

## 3. Request contract

```
POST /api/auth/google
Content-Type: application/json
```

```json
{
    "idToken": "<credential from Google>",
    "phone": "+2348012345678",
    "userType": "customer"
}
```

| Field | Required | Notes |
|---|---|---|
| `idToken` | yes | The raw credential string from Google's callback (`response.credential` above). |
| `phone` | yes, always | Must be a valid phone number (`class-validator`'s `IsMobilePhone`). |
| `userType` | yes, always | `"customer"` or `"provider"` only — same restriction as `/register`. |

**Important — `phone` and `userType` are required on every call, even for a returning user whose
account already exists.** The backend can't know in advance whether this Google identity maps to
a new or existing account, so one request shape covers both; for an existing account, whatever you
send in `phone`/`userType` is simply ignored (the account's real values are used). In practice this
means: always show a small "confirm your phone number and account type" step right after the
Google button, on every sign-in attempt — not just first-time signup. If that's poor UX for
returning users, one option is to cache the phone/userType your app collected on first sign-in
(e.g. in local storage) and pre-fill/skip the prompt on the same device next time — that's a
frontend-only decision, the backend doesn't need anything different either way.

---

## 4. Response contract

### Success — `200 OK`

Same `token`/`user` shape `/api/auth/login` and `/api/auth/register` already return (`user` has
`passwordHash` and the internal `googleId` stripped — nothing new to handle if you're already
storing those responses), plus one new field:

```json
{
    "token": "<jwt>",
    "user": {
        "id": "3f041f95-c054-4cd2-b5c4-61c9c3a5ee31",
        "fullName": "Ada Lovelace",
        "email": "ada@gmail.com",
        "phone": "+2348012345678",
        "userType": "customer",
        "isVerified": true,
        "isActive": true,
        "emailVerifiedAt": "2026-08-24T16:40:00.000Z",
        "lastLoginAt": null,
        "firstLoginAt": null,
        "passwordChangedAt": null,
        "avatar": null,
        "address": null,
        "bio": null,
        "createdAt": "2026-08-24T16:40:00.000Z",
        "updatedAt": "2026-08-24T16:40:00.000Z"
    },
    "isNewAccount": true
}
```

- **`isNewAccount: true`** — brand-new account, created from this call. `isVerified` is already
  `true` (Google verified the email, so there's no OTP step to run — this account never sees
  `emailVerificationRequired` at all). Note `lastLoginAt`/`firstLoginAt` are `null` here, same as a
  plain `/register` response — they get set starting from the *next* successful sign-in, whether
  that's another Google call or (if they ever set a password) a regular `/login`.
- **`isNewAccount: false`** — an existing account, either a returning Google user or a
  password-account that just got auto-linked (see below). `lastLoginAt` is updated on this call,
  `firstLoginAt` is set only if it was never set before.
- There is **no `emailVerificationRequired` field** on this response — unlike `/login`, this
  endpoint never returns an unverified-and-blocked state, because a successful Google verification
  already implies a verified email.

**Auto-linking, silently:** if the Google email matches an existing email/password account, that
account is what gets returned (`isNewAccount: false`) — its `googleId` gets set and, if it wasn't
already verified, `isVerified` flips to `true` in the same response. No separate confirmation step,
no extra UI needed; this is intentional (Google has already proven ownership of that email).

### Errors

**`400 Bad Request`** — validation failure on `phone`/`userType` (live-captured):
```json
{
    "status": "error",
    "statusCode": 400,
    "message": ["phone must be a phone number", "userType must be one of the following values: customer, provider"]
}
```
`message` is an array when multiple fields fail, a single string otherwise — handle both.

**`401 Unauthorized`** — invalid/expired/tampered Google token, or a token whose email Google
itself hasn't verified (live-captured for the invalid-token case; same message for both):
```json
{ "status": "error", "statusCode": 401, "message": "Invalid or expired Google token" }
```
This should essentially never happen for a real user clicking a real Google button — treat it as
"something's wrong with the integration" (wrong client ID, clock skew, stale cached script) rather
than a normal user-facing error state, and log it if it happens in production.

**`401 Unauthorized`** — the matched account exists but has been deactivated by an admin:
```json
{ "status": "error", "statusCode": 401, "message": "Account is deactivated" }
```

**`409 Conflict`** — only possible on the brand-new-account path: the `phone` you sent is already
registered to a *different* account (the Google email itself was free, but the phone number
wasn't):
```json
{ "status": "error", "statusCode": 409, "message": "Phone number already registered" }
```
Show this as "that phone number is already in use" and let them correct it and resubmit — the
Google token itself is still valid, no need to restart the Google sign-in step.

---

## 5. A few things worth knowing

- **No password exists for a Google-only account.** If such a user ever wants to also log in with
  a password (e.g. on a device without Google available), send them through the existing
  forgot-password flow — `POST /api/auth/password-reset/request` → `/verify` → `/complete` — it
  works for a Google-created account exactly as-is, no special-casing needed. The existing
  "change password" screen (`PATCH /api/auth/password`) won't work for them the first time, since
  it requires a current password they don't have.
- **Token storage/session handling is unchanged** — the JWT from this endpoint is signed and
  validated identically to `/login`/`/register`'s tokens (`{ userId, userType }` claims), so
  whatever auth-state logic already exists for those can be reused as-is for this response.
- **Multiple client IDs, one endpoint.** If a native app is added later with its own Google client
  ID, nothing on the request/response contract changes — the backend just needs that client ID
  appended to its `GOOGLE_CLIENT_IDS` config.
