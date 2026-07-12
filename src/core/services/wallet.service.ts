import { getRequestData, request } from "#/core/helpers/axios.helper";
import type { Wallet } from "#/core/types/chat.types";

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
