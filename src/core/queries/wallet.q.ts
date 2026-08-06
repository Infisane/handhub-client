import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	depositWalletService,
	getWalletService,
	getWalletTransactionsService,
	withdrawWalletService,
} from "#/core/services/wallet.service";
import type {
	GetWalletTransactionsParams,
	Wallet,
	WalletWithdrawResponse,
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

export const useDepositWalletQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (wallet: Wallet) => void;
} = {}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (amount: number) =>
			depositWalletService({ amount, signal: abortController.signal }),
		onSuccess: (wallet) => {
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
			queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
			onSuccessCallback?.(wallet);
		},
	});
};

export const useWithdrawWalletQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (response: WalletWithdrawResponse) => void;
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
