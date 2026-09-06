# Password Settings — Frontend Implementation Guide

For the settings-page password module: since a Google-only account has no password its owner
knows, the "Password" section needs to show one of two different UIs depending on the account.
The `hasPassword` field (added alongside Google Sign-In) is what decides which one.

Every payload below is captured from a live dev server against real, disposable test accounts
(created and deleted for this purpose — nothing here is guessed).

---

## 1. Check which UI to show

```
GET /api/auth/security/status
Authorization: Bearer <jwt>
```

```json
{
    "userId": "b921395a-11fe-42e1-826f-3fe0e5f88c7c",
    "userType": "customer",
    "isVerified": true,
    "emailVerifiedAt": "2026-08-30T06:57:32.128Z",
    "lastLoginAt": "2026-08-30T06:57:36.922Z",
    "passwordChangedAt": null,
    "hasPassword": true
}
```

`hasPassword` is also present on the `user` object returned by `/login`, `/register`, and
`/google` — if you already have a fresh one of those in memory, you don't need a separate call
just to read this field. Use `/security/status` when the settings page loads independently of a
fresh login response.

- **`hasPassword: true`** → render the normal **Change Password** form (§2).
- **`hasPassword: false`** → render **Set a Password** instead (§3) — don't show a "current
  password" field at all, there isn't one to enter.

---

## 2. `hasPassword: true` — Change Password

```
PATCH /api/auth/password
Authorization: Bearer <jwt>
Content-Type: application/json
```

```json
{ "currentPassword": "TempSecret1!", "newPassword": "NewSecret1!" }
```

`newPassword` must be at least 8 characters (`class-validator`'s `MinLength(8)`).

**Success — `200 OK`:**

```json
{ "message": "Password changed successfully" }
```

**Wrong current password — `400 Bad Request`:**

```json
{ "status": "error", "statusCode": 400, "message": "Current password is incorrect" }
```

After a successful change, `GET /api/auth/security/status` reflects it immediately:

```json
{
    "userId": "b921395a-11fe-42e1-826f-3fe0e5f88c7c",
    "userType": "customer",
    "isVerified": true,
    "emailVerifiedAt": "2026-08-30T06:57:32.128Z",
    "lastLoginAt": "2026-08-30T06:57:36.922Z",
    "passwordChangedAt": "2026-08-30T06:57:59.138Z",
    "hasPassword": true
}
```

`passwordChangedAt` is now set; `hasPassword` was already `true` here and stays `true` — this
endpoint is unreachable for a `hasPassword: false` account anyway, since they have no current
password to enter correctly.

---

## 3. `hasPassword: false` — Set a Password

There's no dedicated "set password" endpoint — it's the same forgot-password OTP flow already
used for password recovery, reused here because the mechanics are identical (prove email
ownership via OTP, then set a new password with no current-password check). Copy-wise, call it
"Set a password" in the UI rather than "Forgot password," since the user never had one — but it's
the same three calls:

```
POST /api/auth/password-reset/request
Content-Type: application/json
```

```json
{ "email": "user@example.com" }
```

**`200 OK`** — always this message, regardless of whether the account exists (prevents email
enumeration):

```json
{ "message": "If the account exists, a password reset OTP has been sent" }
```

This sends a 6-digit OTP to their email (expires in ~10 minutes, resend throttled to once every
~60 seconds — both configurable server-side).

```
POST /api/auth/password-reset/verify
Content-Type: application/json
```

```json
{ "email": "user@example.com", "otp": "790940" }
```

**`200 OK`** — checks the OTP without consuming it (useful for a "verifying..." step before
showing the new-password field, but you can skip straight to `/complete` if your UI collects the
OTP and new password on the same screen):

```json
{ "message": "Password reset OTP is valid" }
```

```
POST /api/auth/password-reset/complete
Content-Type: application/json
```

```json
{ "email": "user@example.com", "otp": "790940", "newPassword": "NewRealSecret1!" }
```

**`200 OK`**:

```json
{ "message": "Password reset completed" }
```

All three take `otp` as a 6-character string (`Length(6, 6)`) and `newPassword` with the same
8-character minimum as Change Password. A wrong or expired OTP on `/verify` or `/complete` returns
`400 Bad Request` with `"Invalid or expired OTP"`; five wrong attempts on the same OTP returns
`"OTP attempt limit exceeded"` and a fresh `/request` call is needed to get a new one.

**After `/complete` succeeds, `hasPassword` flips to `true`** — confirmed live by querying the
account directly after running this flow against a disposable Google-only test account:
`hasPassword` went from `false` (right after Google signup) to `true` (right after
`/password-reset/complete`), with `passwordChangedAt` set for the first time. From this point on,
the account behaves exactly like any password account — re-fetch
`/security/status` (or just optimistically flip local state to `hasPassword: true`) and swap the
UI over to the normal Change Password form for any future password update.

---

## 4. Summary

| `hasPassword` | Show                                       | Endpoint(s)                                         |
| ------------- | ------------------------------------------ | --------------------------------------------------- |
| `true`        | Change Password (current + new)            | `PATCH /api/auth/password`                          |
| `false`       | Set a Password (no current-password field) | `/password-reset/request` → `/verify` → `/complete` |

Both paths converge on the same end state — a real password the user knows, `hasPassword: true` —
so the settings page only ever needs to branch once, at render time, on this one field.

The sign-in page's "Forgot password?" link uses the same right-hand column as the `false` row
above (`/password-reset/request` → `/verify` → `/complete`), just triggered while logged out and
with no `hasPassword` check involved — see §3.
