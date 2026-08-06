import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	GetWalletTransactionsParams,
	Wallet,
	WalletTransactionsResponse,
	WalletWithdrawResponse,
} from "#/core/types/chat.types";

export const getWalletService = ({ signal }: { signal?: AbortSignal } = {}) =>
	getRequestData<Wallet>(request.get("/api/wallet", { signal }));

export const depositWalletService = ({
	amount,
	signal,
}: {
	amount: number;
	signal?: AbortSignal;
}) =>
	getRequestData<Wallet>(
		request.post("/api/wallet/deposit", { amount }, { signal }),
	);

export const withdrawWalletService = ({
	amount,
	signal,
}: {
	amount: number;
	signal?: AbortSignal;
}) =>
	getRequestData<WalletWithdrawResponse>(
		request.post("/api/wallet/withdraw", { amount }, { signal }),
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
