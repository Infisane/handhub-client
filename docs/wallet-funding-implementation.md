# Bank Withdrawals — Frontend Implementation Guide

`POST /api/wallet/withdraw` used to be pure bookkeeping — it decremented `balance` and wrote a
ledger row with **zero connection to a real bank account, in either direction**. No bank fields
existed anywhere, no gateway call was ever made, and there was no admin review. That's fixed: a
withdrawal now debits the wallet immediately, waits for admin approval, and fires a real
Paystack/Flutterwave transfer to a bank account the user has verified through the gateway.

**If your app currently calls `POST /api/wallet/withdraw` and treats the response as an updated
wallet, that's the one breaking change to update** — it now returns a withdrawal request object,
not a wallet, and money doesn't actually move until an admin approves it.

Every payload below is captured from a live dev server, including a real Flutterwave test-mode
bank-account resolve, a real transfer attempt, and both refund paths (synchronous gateway
rejection, and admin reject) — same reference-doc pattern as this session's other implementation
guides. Paystack's transfer flow (a two-step recipient-then-transfer call, unlike Flutterwave's
single call) is implemented and unit-tested but wasn't live-fired — Paystack transfers are
disabled in this environment.

---

## 1. One-time setup — save a bank account

Withdrawals require a verified bank account on file first. This is a **separate, one-time step**,
not part of the withdraw call itself.

### 1a. `GET /api/wallet/banks` — bank list for the picker

```
GET /api/wallet/banks?preferredProvider=flutterwave   // preferredProvider optional
```

Live-captured (truncated):

```json
[
    { "code": "560", "name": "Page MFBank" },
    { "code": "057", "name": "Zenith Bank" },
    { "code": "011", "name": "First Bank of Nigeria" },
    { "code": "044", "name": "Access Bank" }
]
```

### 1b. `POST /api/wallet/bank-account` — resolve, verify, and save

```json
{ "bankCode": "044", "accountNumber": "0690000031", "preferredProvider": "flutterwave" }
```

The account **name** is always resolved from the gateway, never taken from user input — this is
what the user confirms against before you let them submit ("Is this you? Forrest Green"). Live
response:

```json
{
    "bankCode": "044",
    "bankAccountNumber": "******0031",
    "bankAccountName": "Forrest Green",
    "bankVerifiedAt": "2026-09-01T09:18:12.158Z"
}
```

`400` if the gateway can't resolve the number/bank combination:

```json
{ "status": "error", "statusCode": 400, "message": "Could not resolve account name" }
```

**Same endpoint for changing the account later** — call it again with new details and it
overwrites what was saved. There's no separate edit route.

### 1c. `GET /api/wallet/bank-account` — check current state

Use this before showing the "add/change bank account" UI, so you know whether to show "Add a
bank account" or "Current: Access Bank \*\*\*\*0031". Live-captured **before** anything is saved —
the response body is empty (not an object, not `"null"` text — treat any non-JSON/empty body here
as "nothing saved yet"):

```
(empty body)
```

After saving (§1b), it returns the same masked shape shown there.

---

## 2. Requesting a withdrawal

### `POST /api/wallet/withdraw`

```json
{ "amount": 5000 }
```

**Live-captured response** — note this is a withdrawal request, not a wallet:

```json
{
    "id": "b30b822a-7b67-4419-969b-d732fa7c0ffd",
    "userId": "3a58c099-732f-4489-83f1-397541ba20ac",
    "walletId": "cbbdae78-9020-4e95-a0d4-07c8fa011ba6",
    "amount": 5000,
    "bankCode": "044",
    "bankAccountNumber": "0690000031",
    "bankAccountName": "Forrest Green",
    "status": "pending",
    "requestedAt": "2026-09-01T09:18:26.514Z",
    "reviewedById": null,
    "reviewedAt": null,
    "rejectionReason": null,
    "providerName": null,
    "providerTransferReference": null,
    "completedAt": null,
    "failureReason": null
}
```

**The wallet is debited immediately** — live-captured, before any admin touched the request:

```
GET /api/wallet → balance: "50000.00"   (before)
POST /api/wallet/withdraw { amount: 5000 }
GET /api/wallet → balance: "45000.00"   (right after — no admin action yet)
```

Errors:

```json
{ "status": "error", "statusCode": 400, "message": "Insufficient wallet balance" }
{ "status": "error", "statusCode": 400, "message": "Add and verify a bank account before withdrawing" }
```

Show the withdrawal as **pending review**, not completed — don't tell the user the money has been
sent yet. `status` tells you exactly where it is; poll `GET /api/wallet/transactions` or the
withdrawal's `status` if you have an endpoint for it in your admin/support surface.

---

## 3. What happens next (admin-gated, informational for most FE work)

Unless you're building the admin dashboard, you don't call these — but you do need to render the
`status` values they produce, since a user's withdrawal will move through them:

```
pending → approved → processing → completed
        ↘ rejected               ↘ failed
```

An admin approves or rejects via `POST /api/admin/wallet/withdrawals/:id/approve` /
`.../reject` (optional `{ "reason": "..." }` body). Approve fires the real transfer:

- **Transfer accepted by the gateway** → `status: "processing"`, `providerName` and
  `providerTransferReference` set. It settles to `completed` or `failed` when the gateway's
  transfer webhook arrives — nothing for the frontend to do but wait/poll.
- **Transfer rejected synchronously by the gateway** → settles straight to `failed`, no
  `processing` step. **Live-captured** (a real Flutterwave test-mode rejection — the sending
  account wasn't fully configured for live transfers on this key):

```json
{
    "id": "b30b822a-7b67-4419-969b-d732fa7c0ffd",
    "status": "failed",
    "providerName": "flutterwave",
    "failureReason": "Please enable IP Whitelisting to access this service",
    "reviewedById": "99f3167c-c0fc-48c8-a90d-8f9d770cad11",
    "reviewedAt": "2026-09-01T09:21:15.452Z"
}
```

**Any path to `failed`, and a `rejected`, refunds the wallet automatically** — live-confirmed, the
balance went straight back to `50000.00` in the same request that produced the response above, no
separate cleanup step. The ledger shows both sides:

```json
{
    "data": [
        {
            "type": "credit",
            "category": "refund",
            "amount": "5000.00",
            "reference": "WD-REFUND-b30b822a-7b67-4419-969b-d732fa7c0ffd",
            "balanceAfter": "50000.00"
        },
        {
            "type": "debit",
            "category": "withdrawal",
            "amount": "5000.00",
            "reference": "WIT-b30b822a-7b67-4419-969b-d732fa7c0ffd",
            "balanceAfter": "45000.00"
        }
    ]
}
```

**Reject is a separate code path from the synchronous-failure refund above, also live-verified**:
requesting a second withdrawal (1200) and rejecting it before any admin approval produced
`"status": "rejected", "rejectionReason": "Testing reject path"` and put the balance straight back
to `50000.00` — same refund guarantee, whether the money never left because it was rejected, or
because the gateway itself refused it.

---

## 4. Summary of what to update

| What                                      | Change                                                                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Withdraw button/flow                      | Requires a saved bank account first (§1) — send users there if `GET /api/wallet/bank-account` is empty                                                  |
| `POST /api/wallet/withdraw` response      | Now a withdrawal request object with `status`, not a wallet — show "pending review", not "done"                                                         |
| Wallet balance display                    | Updates **immediately** on request, before any admin action — don't wait for `completed` to refresh it                                                  |
| Failure/rejection handling                | No special-casing needed — both paths auto-refund; just reflect the ledger and `status` you're given                                                    |
| Transaction-history UI reference prefixes | Add `WIT-<withdrawalId>` and `WD-REFUND-<withdrawalId>` alongside the existing ones (`WIT-` changed from a timestamp suffix to the withdrawal's own id) |
