import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { abortController } from "#/core/helpers/axios.helper";
import { useIdempotencyKey } from "#/core/hooks/useIdempotencyKey.hook";
import {
	getBankAccountService,
	getBanksService,
	getWalletService,
	getWalletTransactionsService,
	initiateWalletTopupService,
	saveBankAccountService,
	withdrawWalletService,
} from "#/core/services/wallet.service";
import type {
	BankAccount,
	GetWalletTransactionsParams,
	PaymentTransaction,
	SaveBankAccountPayload,
	WalletTopupPayload,
	WithdrawalRequest,
} from "#/core/types/chat.types";

export const useGetWalletQuery = (enabled = true) =>
	useQuery({
		queryKey: ["wallet"],
		queryFn: ({ signal }) => getWalletService({ signal }),
		enabled,
		staleTime: 1000 * 30,
	});

export const useGetWalletTransactionsQuery = (
	params?: GetWalletTransactionsParams,
) =>
	useQuery({
		queryKey: ["wallet-transactions", params],
		queryFn: ({ signal }) => getWalletTransactionsService({ params, signal }),
		staleTime: 1000 * 30,
	});

export const useInitiateWalletTopupQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (transaction: PaymentTransaction) => void;
} = {}) => {
	const queryClient = useQueryClient();
	const idempotency = useIdempotencyKey();
	return useMutation({
		mutationFn: async (payload: WalletTopupPayload) => {
			const transaction = await initiateWalletTopupService({
				payload,
				idempotencyKey: idempotency.keyFor(payload),
				signal: abortController.signal,
			});
			// Callers redirect to paymentUrl — never let them navigate to "undefined".
			if (!transaction.paymentUrl) throw new Error("Payment link unavailable");
			return transaction;
		},
		onSuccess: (transaction) => {
			idempotency.reset();
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
			queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
			onSuccessCallback?.(transaction);
		},
		onError: (error) => {
			// Keep the key only when the outcome is unknown (timeout / cancel /
			// network — no response) or the first attempt is still running (409):
			// a retry then replays it instead of creating a second transaction.
			// Any other answer is definitive, so the next attempt starts fresh.
			const unanswered = isAxiosError(error) && !error.response;
			const inFlight = isAxiosError(error) && error.response?.status === 409;
			if (!unanswered && !inFlight) idempotency.reset();
		},
	});
};

export const useWithdrawWalletQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (response: WithdrawalRequest) => void;
} = {}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (amount: number) =>
			withdrawWalletService({ amount, signal: abortController.signal }),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
			queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
			onSuccessCallback?.(response);
		},
	});
};

/** Near-static reference data — long staleTime. */
export const useGetBanksQuery = (
	preferredProvider?: "paystack" | "flutterwave",
) =>
	useQuery({
		queryKey: ["wallet-banks", preferredProvider],
		queryFn: ({ signal }) => getBanksService({ preferredProvider, signal }),
		staleTime: 1000 * 60 * 60,
	});

export const useGetBankAccountQuery = () =>
	useQuery({
		queryKey: ["bank-account"],
		queryFn: ({ signal }) => getBankAccountService({ signal }),
		staleTime: 1000 * 30,
	});

export const useSaveBankAccountQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (account: BankAccount) => void;
} = {}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: SaveBankAccountPayload) =>
			saveBankAccountService({ payload, signal: abortController.signal }),
		onSuccess: (account) => {
			queryClient.invalidateQueries({ queryKey: ["bank-account"] });
			onSuccessCallback?.(account);
		},
	});
};
