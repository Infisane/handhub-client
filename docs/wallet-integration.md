# Wallet & Transaction History — Frontend Integration Guide

This documents the **real, shipped** contracts for the in-app wallet: balance, gateway-backed top-up, admin manual deposit, withdraw, and the paginated/filterable transaction ledger. Every payload below is taken from the running API.

- **REST base:** `http://<host>:<port>/api` (dev default `http://localhost:8088/api`)
- **Auth:** every route below requires `Authorization: Bearer <token>`. See `docs/frontend-integration.md` §1 for login/token handling — this doc doesn't repeat it.
- The wallet is the money rail behind the booking flow's `paymentMethod: "wallet"` option (`docs/frontend-integration.md` §6) — this doc covers the wallet as its own resource: checking balance, topping up, withdrawing, and browsing history.

---

## 1. Endpoints

### 1.1 `GET /api/wallet` — balance

```json
{
    "id": "35d87494-6c29-4b3b-830c-d3498e641d54",
    "userId": "9907ddb7-777c-4116-a9a6-6da897ac6a57",
    "balance": "18000.00"
}
```

Returns **balance only** — no transactions inlined (that's a separate, paginated resource; see §1.2). `balance` here is a **decimal string**.

### 1.2 `GET /api/wallet/transactions` — paginated, filterable history

Query params (all optional):

| Param      | Type   | Values                                                                        | Default       |
| ---------- | ------ | ----------------------------------------------------------------------------- | ------------- |
| `type`     | string | `credit` \| `debit`                                                           | — (no filter) |
| `category` | string | `deposit` \| `withdrawal` \| `payment` \| `release` \| `refund` \| `clawback` | — (no filter) |
| `limit`    | number | —                                                                             | `20`          |
| `offset`   | number | —                                                                             | `0`           |

Ordered **newest first** (`createdAt DESC`). Response shape matches every other paginated list in the API — `{ data, meta: { total, limit, offset } }`:

```json
// GET /api/wallet/transactions
{
    "data": [
        {
            "id": "6bcebafa-6ad9-4122-ba3a-b78d0961f172",
            "walletId": "35d87494-6c29-4b3b-830c-d3498e641d54",
            "type": "debit",
            "category": "payment",
            "amount": "2000.00",
            "description": "Payment for booking 697a4f85-5580-4c0a-984d-82bfc4099b44",
            "reference": "PAY-697a4f85-5580-4c0a-984d-82bfc4099b44",
            "balanceAfter": "18000.00",
            "createdAt": "2026-07-06T09:36:01.668Z"
        },
        {
            "id": "d4582baa-ea2e-4f4b-a0d4-917a853064b8",
            "walletId": "35d87494-6c29-4b3b-830c-d3498e641d54",
            "type": "credit",
            "category": "deposit",
            "amount": "20000.00",
            "description": "Deposit",
            "reference": "DEP-1783330561643",
            "balanceAfter": "20000.00",
            "createdAt": "2026-07-06T09:36:01.643Z"
        }
    ],
    "meta": { "total": 2, "limit": 20, "offset": 0 }
}
```

**Filter examples** (verified):

```
GET /api/wallet/transactions?type=credit          → only credits (deposits, releases, refunds)
GET /api/wallet/transactions?type=debit            → only debits (withdrawals, payments, clawbacks)
GET /api/wallet/transactions?category=refund        → only fraud-reversal refunds
GET /api/wallet/transactions?limit=1&offset=1        → page 2 of 1
```

`type` and `category` can be combined (both are `AND`-ed). An invalid value on either is a `400`:

```json
{
    "status": "error",
    "statusCode": 400,
    "message": [
        "category must be one of the following values: deposit, withdrawal, payment, release, refund, clawback"
    ]
}
```

### 1.3 `POST /api/wallet/deposit` — admin-only manual credit

**Not a customer-facing top-up.** Admin-only (`403` for anyone else), and credits a _target_
user's wallet, not the caller's own — for goodwill credits, refund corrections, support cases.
For letting a customer actually fund their own wallet, use §1.3a below instead.

```
Body: { "userId": "9907ddb7-777c-4116-a9a6-6da897ac6a57", "amount": 5000, "description": "Goodwill credit — support ticket #4821" }   // description optional
```

Returns the updated wallet (the _target_ user's, not the admin's). Creates a `credit` / `deposit`
transaction (`DEP-<timestamp>` reference) on the target wallet.

### 1.3a `POST /api/wallet/topup/initiate` — real, gateway-backed customer top-up

This is how a customer actually funds their wallet — routed through Paystack/Flutterwave, the
same as a booking payment. Customer-only.

```
Body: { "amount": 5000, "preferredProvider": "flutterwave", "callbackUrl": "https://app.handhub.ng/wallet/callback" }
```

`preferredProvider`, `callbackUrl`, `currency` are all optional, same as
`POST /api/payments/online/initiate` (main guide). An optional `Idempotency-Key` header prevents
a double top-up on a client retry.

Response is a `PaymentTransaction` — redirect the customer to `paymentUrl`:

```json
{
    "id": "62778227-...",
    "reference": "HHWT-1788206178958-6a49aad4",
    "status": "initiated",
    "paymentUrl": "https://checkout.flutterwave.com/...",
    "amount": "5000.00"
}
```

**Completion works exactly like a booking payment** — same `GET /api/payments/online/:reference/verify`
and the same provider webhook settle it (see the main payments guide for that mechanics; nothing
wallet-specific about verify/webhook). Once settled, `GET /api/wallet` reflects the new balance
and a `credit` / `deposit` transaction appears in the ledger with reference `TOPUP-<transactionId>`.

### 1.4 Withdrawals — real bank payouts

`POST /api/wallet/withdraw` used to be pure bookkeeping — it decremented `balance` with no
connection to a real bank account. It's now a real payout, gated behind admin review, with the
same escrow-hold shape as a booking payment: the wallet is debited **immediately at request
time** (not on approval), and refunded automatically if the payout is rejected or fails.

**Full flow:** save a bank account once → request a withdrawal (debits immediately, `pending`) →
an admin approves or rejects it → on approve, a real Paystack/Flutterwave transfer fires and the
withdrawal settles to `completed` (transfer succeeded) or `failed` (refunded) once the gateway
confirms.

#### 1.4a `GET /api/wallet/banks` — bank list for the picker

```
GET /api/wallet/banks?preferredProvider=flutterwave   // preferredProvider optional
```

```json
[
    { "code": "058", "name": "Guaranty Trust Bank" },
    { "code": "044", "name": "Access Bank" }
]
```

#### 1.4b `GET /api/wallet/bank-account` — the caller's saved account (masked)

Returns an **empty 200 response body** (not JSON `null`, not a `404`) if nothing's been saved
yet — live-confirmed. Treat any non-JSON/empty response here as "nothing saved" and show "Add
bank account"; once one's saved, this returns the masked object shown below, so you can offer
"Current: GTBank \*\*\*\*0031" with a change option.

```json
{
    "bankCode": "044",
    "bankAccountNumber": "******0031",
    "bankAccountName": "Forrest Green",
    "bankVerifiedAt": "2026-09-01T09:18:12.158Z"
}
```

#### 1.4c `POST /api/wallet/bank-account` — resolve, verify, and save (or change) a bank account

Same endpoint for a first-time save and a later change — it's an upsert, not add-once. The
account **name** always comes back from the gateway's own verification, never from what the
caller typed, so there's no way to attach an unverified name to a payout.

```
Body: { "bankCode": "044", "accountNumber": "0690000031", "preferredProvider": "flutterwave" }   // preferredProvider optional
```

Response (real, from the running API — same shape as §1.4b):

```json
{
    "bankCode": "044",
    "bankAccountNumber": "******0031",
    "bankAccountName": "Forrest Green",
    "bankVerifiedAt": "2026-09-01T09:18:12.158Z"
}
```

`400` if the gateway can't resolve the account (wrong number/bank combination):

```json
{ "status": "error", "statusCode": 400, "message": "Could not resolve account name" }
```

> ⚠️ **A withdrawal snapshots the bank account at request time.** Changing your saved account via
> this endpoint never retargets a withdrawal that's already been requested — that row keeps the
> bank details it had when it was created, so an in-flight payout can't be redirected by a
> mid-review account change.

#### 1.4d `POST /api/wallet/withdraw` — request a payout

```
Body: { "amount": 500 }
```

Debits the wallet **immediately** and creates a withdrawal request. Requires a verified bank
account first (§1.4c) — `400 BANK_ACCOUNT_NOT_VERIFIED` otherwise.

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

Creates a `debit` / `withdrawal` transaction (`WIT-<withdrawalId>` reference) — `GET /api/wallet`
reflects the reduced balance right away, before any admin has reviewed the request.

Errors:

```json
{ "status": "error", "statusCode": 400, "message": "Insufficient wallet balance" }
{ "status": "error", "statusCode": 400, "message": "Add and verify a bank account before withdrawing" }
```

#### 1.4e Status lifecycle

```
pending → approved → processing → completed
        ↘ rejected               ↘ failed
```

`pending` → an admin approves or rejects it. Approve fires the real transfer and moves to
`processing` (or straight to `failed` if the gateway rejects the transfer synchronously — see
below); `processing` settles to `completed` or `failed` once the gateway's transfer webhook
arrives. **Any path to `failed`, and a `rejected`, refunds the wallet automatically** — the
`WIT-<withdrawalId>` debit is reversed with a `credit` / `refund` transaction
(`WD-REFUND-<withdrawalId>` reference).

Live-verified (Flutterwave test mode): a synchronous gateway rejection (e.g. the sending account
not being fully configured for live transfers) settles the withdrawal to `failed` and refunds the
wallet in the same request — no separate cleanup step needed on the frontend.

#### 1.4f Admin review (admin-only)

| Method | Path                                        | Purpose                                        |
| ------ | ------------------------------------------- | ---------------------------------------------- |
| `GET`  | `/api/admin/wallet/withdrawals`             | List requests, filter by `?status=`, paginated |
| `POST` | `/api/admin/wallet/withdrawals/:id/approve` | Approve — fires the real transfer              |
| `POST` | `/api/admin/wallet/withdrawals/:id/reject`  | Reject — refunds the wallet                    |

Both approve/reject take an optional `{ "reason": "..." }` body (same `ProviderActionDto` shape
used by provider approval elsewhere in the admin API). Approving a withdrawal that's already
`approved` (a previous approve attempt found no healthy payment provider and never reached the
gateway) is a safe retry, not an error.

> ⚠️ **Gotcha — `balance` type varies by endpoint.** `GET /api/wallet` returns `balance` as a **decimal string** (`"18000.00"`), but the wallet-mutating endpoints can serialize numeric fields as a raw **number**. Type amounts as `string | number` and always `Number(...)` before display or math — don't assume one shape.

---

## 2. Transaction Categories

Every transaction has a **direction** (`type`) and a finer-grained **category**. Use `category` to pick an icon/label; `type` to color it (credit = green, debit = red).

| `type`   | `category`   | Generated when                                                                                 | Reference prefix                                              |
| -------- | ------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `credit` | `deposit`    | Real gateway top-up settles, **or** an admin manual credit                                     | `TOPUP-<transactionId>` (gateway) / `DEP-<timestamp>` (admin) |
| `debit`  | `withdrawal` | User requests a payout (debited immediately, before admin review)                              | `WIT-<withdrawalId>`                                          |
| `debit`  | `payment`    | User pays for a completed booking (wallet method)                                              | `PAY-<bookingId>`                                             |
| `credit` | `release`    | Provider receives escrow release (minus platform fee) after a customer's wallet payment        | `RELEASE-<paymentId>`                                         |
| `credit` | `refund`     | A payment was flagged high-risk by fraud and reversed, **or** a withdrawal was rejected/failed | `FRAUD-REFUND-<paymentId>` / `WD-REFUND-<withdrawalId>`       |
| `debit`  | `clawback`   | Same fraud reversal — funds already released to the provider are clawed back                   | `FRAUD-CLAWBACK-<paymentId>`                                  |

```ts
export type TxType = 'credit' | 'debit';
export type WalletTxCategory =
    'deposit' | 'withdrawal' | 'payment' | 'release' | 'refund' | 'clawback';
```

These mirror the backend's `TX_TYPE` / `WALLET_TX_CATEGORY` constants in `src/shared/common/enums/index.ts` — the single source of truth (see main guide §10 for the project-wide enum convention).

---

## 3. Errors

| Status | Meaning                                | Suggested UI                                                            |
| ------ | -------------------------------------- | ----------------------------------------------------------------------- |
| `401`  | Missing/expired token                  | Redirect to login                                                       |
| `400`  | Insufficient wallet balance (withdraw) | Inline error, suggest top-up                                            |
| `400`  | No verified bank account (withdraw)    | Send to the "add bank account" flow (§1.4c)                             |
| `400`  | Gateway couldn't resolve the account   | Inline error on the bank-account form (§1.4c) — check number/bank combo |
| `400`  | Invalid `type`/`category` filter value | Should only happen on a dev bug — validate client-side against the enum |
| `404`  | Wallet not found                       | Shouldn't happen — every user gets a wallet at registration             |
| `404`  | Withdrawal not found (admin review)    | Refresh the admin withdrawals list                                      |

Error envelope is the same as the rest of the API (see main guide §2): `{ status: "error", statusCode, message }`, where `message` is a `string | string[]`.

---

## 4. Quick Reference

| Method | Path                                        | Purpose                                                               |
| ------ | ------------------------------------------- | --------------------------------------------------------------------- |
| `GET`  | `/api/wallet`                               | Balance                                                               |
| `GET`  | `/api/wallet/transactions`                  | Paginated, filterable ledger (`type`, `category`, `limit`, `offset`)  |
| `POST` | `/api/wallet/topup/initiate`                | Customer-facing, gateway-backed top-up (real money)                   |
| `POST` | `/api/wallet/deposit`                       | Admin-only manual credit of a target user's wallet                    |
| `GET`  | `/api/wallet/banks`                         | Bank list for the withdrawal bank-account picker                      |
| `GET`  | `/api/wallet/bank-account`                  | The caller's saved bank account (masked), or `null`                   |
| `POST` | `/api/wallet/bank-account`                  | Resolve + save (or change) the bank account used for withdrawals      |
| `POST` | `/api/wallet/withdraw`                      | Request a real bank payout — debits immediately, pending admin review |
| `GET`  | `/api/admin/wallet/withdrawals`             | Admin: list withdrawal requests                                       |
| `POST` | `/api/admin/wallet/withdrawals/:id/approve` | Admin: approve — fires the real transfer                              |
| `POST` | `/api/admin/wallet/withdrawals/:id/reject`  | Admin: reject — refunds the wallet                                    |

Interactive schema (dev): **`/docs`** (Swagger).
