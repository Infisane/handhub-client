import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	depositWalletService,
	getWalletService,
} from "#/core/services/wallet.service";
import type { Wallet } from "#/core/types/chat.types";

export const useGetWalletQuery = (enabled = true) =>
	useQuery({
		queryKey: ["wallet"],
		queryFn: ({ signal }) => getWalletService({ signal }),
		enabled,
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
			onSuccessCallback?.(wallet);
		},
	});
};
