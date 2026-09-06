import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
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
	return useMutation({
		mutationFn: (payload: WalletTopupPayload) =>
			initiateWalletTopupService({ payload, signal: abortController.signal }),
		onSuccess: (transaction) => {
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
			queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
			onSuccessCallback?.(transaction);
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
