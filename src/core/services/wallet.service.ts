import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	Bank,
	BankAccount,
	GetWalletTransactionsParams,
	PaymentTransaction,
	SaveBankAccountPayload,
	Wallet,
	WalletTopupPayload,
	WalletTransactionsResponse,
	WithdrawalRequest,
} from "#/core/types/chat.types";

export const getWalletService = ({ signal }: { signal?: AbortSignal } = {}) =>
	getRequestData<Wallet>(request.get("/api/wallet", { signal }));

/** Customer — gateway-backed top-up. POST /api/wallet/deposit is admin-only
 *  now (goodwill credits/refund corrections from a back-office tool, not
 *  this repo); this is the real customer-facing funding path. */
export const initiateWalletTopupService = ({
	payload,
	signal,
}: {
	payload: WalletTopupPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<PaymentTransaction>(
		request.post("/api/wallet/topup/initiate", payload, { signal }),
	);

/** Debits the wallet immediately and creates a pending withdrawal request —
 *  the real payout only fires once an admin approves it. Requires a
 *  verified bank account on file first (see getBankAccountService). */
export const withdrawWalletService = ({
	amount,
	signal,
}: {
	amount: number;
	signal?: AbortSignal;
}) =>
	getRequestData<WithdrawalRequest>(
		request.post("/api/wallet/withdraw", { amount }, { signal }),
	);

export const getBanksService = ({
	preferredProvider,
	signal,
}: {
	preferredProvider?: "paystack" | "flutterwave";
	signal?: AbortSignal;
} = {}) =>
	getRequestData<Bank[]>(
		request.get("/api/wallet/banks", {
			params: preferredProvider ? { preferredProvider } : undefined,
			signal,
		}),
	);

/** Returns null when nothing's saved yet — the API responds with an empty
 *  body (not JSON `null`) in that case, so this can't just be
 *  getRequestData<BankAccount | null> like every other service here. */
export const getBankAccountService = async ({
	signal,
}: {
	signal?: AbortSignal;
} = {}): Promise<BankAccount | null> => {
	const { data } = await request.get("/api/wallet/bank-account", { signal });
	if (!data || typeof data !== "object" || !("bankCode" in data)) return null;
	return data as BankAccount;
};

/** Resolves the account name via the gateway and saves it in one call — an
 *  upsert, so the same call also changes a previously-saved account. */
export const saveBankAccountService = ({
	payload,
	signal,
}: {
	payload: SaveBankAccountPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<BankAccount>(
		request.post("/api/wallet/bank-account", payload, { signal }),
	);

export const getWalletTransactionsService = ({
	params,
	signal,
}: {
	params?: GetWalletTransactionsParams;
	signal?: AbortSignal;
}) =>
	getRequestData<WalletTransactionsResponse>(
		request.get("/api/wallet/transactions", { params, signal }),
	);
