# Settings — Frontend Integration Guide

This documents the **real, shipped** contracts for the Settings module: profile fields, avatar upload, authenticated password change, and notification preferences. Every payload below is taken from the running API. Billing/Escrow settings are covered by `docs/wallet-integration.md`, not this doc.

- **REST base:** `http://<host>:<port>/api` (dev default `http://localhost:8088/api`)
- **Auth:** every route below requires `Authorization: Bearer <token>`. See `docs/frontend-integration.md` §1 for login/token handling.
- **2FA is not implemented yet.** Don't build a 2FA toggle against this API — it's planned as a separate follow-up that changes the login contract itself (`POST /api/auth/login` would need to return a "challenge required" response instead of a token). Nothing below supports it.

---

## 1. Endpoints

### 1.1 Profile fields — `address`, `bio`, `avatar`

These extend the existing `PUT /api/user/profile` (same endpoint already used for `fullName`/`phone` and, for providers, the marketplace profile). No new endpoint — just three new optional body fields:

```json
// PUT /api/user/profile
{
    "address": "12 Allen Avenue, Ikeja, Lagos",
    "bio": "Homeowner looking for reliable providers.",
    "avatar": "https://pub-xxx.r2.dev/profile-photo/user-uuid/file-uuid.jpg"
}
```

```json
{
    "status": "success",
    "message": "Profile updated",
    "data": {
        "id": "3f041f95-c054-4cd2-b5c4-61c9c3a5ee31",
        "fullName": "Settings Smoke Test",
        "email": "settings-smoke-test@example.com",
        "phone": "+2348011122233",
        "userType": "customer",
        "isVerified": false,
        "avatar": "https://cdn.handhub.ng/avatars/test123.jpg",
        "address": "12 Allen Avenue, Ikeja, Lagos",
        "bio": "Homeowner looking for reliable providers.",
        "createdAt": "2026-07-12T10:01:19.159Z",
        "updatedAt": "2026-07-12T10:01:34.455Z"
    }
}
```

Only send the fields that changed — all three are optional and independently settable (`undefined` = leave alone).

> ⚠️ **Gotcha — `email` is not editable, on purpose.** It's the account's unique identifier. The DTO has no `email` field at all, and the global validation pipe rejects unknown properties, so including it in the body — even unchanged — is a `400`:
> ```json
> { "status": "error", "statusCode": 400, "message": ["property email should not exist"] }
> ```
> Don't render an editable email field in the Profile tab. If email correction is ever needed, it'll go through a separate, more controlled flow — not self-serve settings.

> ⚠️ **Gotcha — for provider accounts, `address`/`bio` also update the public marketplace listing.** Providers already have their own `address`/`bio` on their business profile (`providerProfile.address` / `providerProfile.bio` in the response, shown on their public marketplace listing). Submitting `address`/`bio` through this same endpoint updates **both** the account-level fields shown above **and** `providerProfile.address` / `providerProfile.bio` with the identical value — it's a single field on the wire, dual-written. If you're building a generic "personal info" Settings section that's meant to be private, be aware a provider's entry there is the same string shown publicly on their listing.

> ⚠️ **Gotcha — `GET` and `PUT` on this resource have different envelopes.** `GET /api/user/profile` returns the user fields **flat** (no wrapper — `{ id, fullName, email, ... }`). `PUT /api/user/profile` wraps the same fields in `{ status, message, data }` as shown above. Don't assume they match — read `.data` after a `PUT`, read the response directly after a `GET`.

There's no dedicated "remove avatar" action. Sending `avatar: ""` (empty string) passes validation and clears it to empty; sending `avatar: null` fails validation (`avatar must be a string`) since the field only accepts strings.

### 1.2 Avatar upload flow

There's no multipart upload endpoint. Avatar upload reuses the same presign-then-PUT-to-R2 pattern as provider portfolio images and ID documents — three steps:

**Step 1 — get a presigned URL:**
```json
// POST /api/uploads/presign
{ "folder": "profile-photo", "contentType": "image/jpeg" }
```
```json
{
    "uploadUrl": "https://hand-hub-r2.<account>.r2.cloudflarestorage.com/profile-photo/<userId>/<fileUuid>.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
    "key": "profile-photo/3f041f95-c054-4cd2-b5c4-61c9c3a5ee31/caa582a8-7d5c-40bf-be3d-4c30acd3c41d.jpg",
    "publicUrl": "https://pub-3b185a263f0042898d445444eddb924c.r2.dev/profile-photo/3f041f95-c054-4cd2-b5c4-61c9c3a5ee31/caa582a8-7d5c-40bf-be3d-4c30acd3c41d.jpg"
}
```
`folder` must be exactly `"profile-photo"` for avatars (the other valid values, `"portfolio"` and `"identity-doc"`, are for provider onboarding — using them for an avatar works technically but mislabels the storage path). `contentType` must be one of `image/jpeg` | `image/png` | `image/webp` | `application/pdf`. `uploadUrl` expires in **15 minutes**.

**Step 2 — upload the file directly to R2** (not through the API server):
```
PUT <uploadUrl>
Content-Type: image/jpeg
Body: <raw file bytes>
```
No `Authorization` header on this request — the signature in the URL is the auth.

**Step 3 — save the public URL onto the profile:**
```json
// PUT /api/user/profile
{ "avatar": "https://pub-3b185a263f0042898d445444eddb924c.r2.dev/profile-photo/.../....jpg" }
```
(See §1.1 for the response shape.)

### 1.3 Password change

```json
// PATCH /api/auth/password
{ "currentPassword": "OldSecret1!", "newPassword": "NewSecret1!" }
```
```json
{ "message": "Password changed successfully" }
```

This is for a logged-in user changing their own password and is **separate from the forgot-password OTP flow** (`POST /api/auth/password-reset/{request,verify,complete}`) — that one's for a user who's locked out and doesn't have a current password to prove. Use this endpoint for the Security tab's "Change password" form; use the OTP flow only for a "Forgot password" link on the login screen.

Errors:
```json
// wrong currentPassword
{ "status": "error", "statusCode": 400, "message": "Current password is incorrect" }

// newPassword under 8 characters
{ "status": "error", "statusCode": 400, "message": ["newPassword must be longer than or equal to 8 characters"] }
```

A successful change fires an email + in-app "Password changed" notification and updates `passwordChangedAt` (already surfaced by the pre-existing `GET /api/auth/security/status`, useful for a "last changed" label in the Security tab).

### 1.4 Notification preferences

```json
// GET /api/notifications/preferences
{
    "id": "e5a4cf3f-1022-4983-8c7d-15f555eaa1d5",
    "userId": "3f041f95-c054-4cd2-b5c4-61c9c3a5ee31",
    "bookingUpdates": true,
    "chatMessages": true,
    "quotesAndInvoices": true,
    "escrowAndPayments": true,
    "promotions": true,
    "createdAt": "2026-07-12T10:01:58.807Z",
    "updatedAt": "2026-07-12T10:01:58.807Z"
}
```

The row is **auto-created with all flags `true`** the first time a user hits this endpoint — no separate "initialize" step, and no 404 case to handle.

```json
// PATCH /api/notifications/preferences
{ "promotions": false }
```
```json
{
    "id": "e5a4cf3f-1022-4983-8c7d-15f555eaa1d5",
    "userId": "3f041f95-c054-4cd2-b5c4-61c9c3a5ee31",
    "bookingUpdates": true,
    "chatMessages": true,
    "quotesAndInvoices": true,
    "escrowAndPayments": true,
    "promotions": false,
    "createdAt": "2026-07-12T10:01:58.807Z",
    "updatedAt": "2026-07-12T10:01:58.824Z"
}
```

`PATCH` is a partial update — only send the flags that changed, the rest are left untouched (as shown above, only `promotions` changed).

| Field               | Covers                                                     |
| ------------------- | ------------------------------------------------------------ |
| `bookingUpdates`     | Booking status changes (accepted, in progress, completed, cancelled) |
| `chatMessages`       | New messages in a thread/ticket                              |
| `quotesAndInvoices`  | Invoice issued/accepted/rejected/voided                      |
| `escrowAndPayments`  | Payment held, released, refunded                              |
| `promotions`         | Marketing/promotional notifications                          |

> ⚠️ **Gotcha — these flags aren't enforced yet.** This endpoint stores the user's preference, but notification dispatch doesn't check it before sending — every notification still goes out over its configured channels regardless of these settings. Functionally this means the Settings UI works (toggle, save, reload shows the saved state), but toggling a flag off will **not** currently stop those notifications from arriving. Wiring enforcement into the dispatch pipeline is a separate, not-yet-scheduled change. Worth knowing before writing UI copy that promises "you won't receive these" — soften it to "saved" rather than implying it's already filtering.

---

## 2. Errors

| Status | Meaning                                       | Suggested UI                                    |
| ------ | ---------------------------------------------- | ------------------------------------------------ |
| `401`  | Missing/expired token                          | Redirect to login                                |
| `400`  | `email` included in a profile update           | Shouldn't happen — don't render an editable email field |
| `400`  | Wrong `currentPassword`                        | Inline error on the current-password field       |
| `400`  | `newPassword` too short / validation failure   | Inline field error                               |

Error envelope is the same as the rest of the API: `{ status: "error", statusCode, message }`, where `message` is a `string | string[]`.

---

## 3. Quick Reference

| Method  | Path                                | Purpose                                              |
| ------- | ------------------------------------ | ----------------------------------------------------- |
| `GET`   | `/api/user/profile`                  | Read profile (flat response, no wrapper)              |
| `PUT`   | `/api/user/profile`                  | Update `fullName`, `phone`, `address`, `bio`, `avatar` (+ provider fields) |
| `POST`  | `/api/uploads/presign`               | Get a presigned R2 upload URL (`folder: "profile-photo"` for avatars) |
| `PATCH` | `/api/auth/password`                 | Change password (requires current password)            |
| `GET`   | `/api/auth/security/status`          | `isVerified`, `emailVerifiedAt`, `lastLoginAt`, `passwordChangedAt` (pre-existing, useful for the Security tab) |
| `GET`   | `/api/notifications/preferences`     | Read preferences (auto-creates defaults)               |
| `PATCH` | `/api/notifications/preferences`     | Partially update preferences                            |

Interactive schema (dev): **`/docs`** (Swagger).
