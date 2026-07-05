import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	createPaymentService,
	getPaymentByBookingService,
	mockCompletePaymentService,
} from "#/core/services/payment.service";
import type {
	CardPaymentInit,
	CreatePaymentPayload,
	Payment,
} from "#/core/types/chat.types";

/** Wallet responses have a `status`; card init responses have an
 *  `authorizationUrl`. Narrow on that. */
export const isCardPaymentInit = (
	result: Payment | CardPaymentInit,
): result is CardPaymentInit =>
	(result as CardPaymentInit).authorizationUrl !== undefined;

export const useGetPaymentByBookingQuery = (bookingId: string | null) =>
	useQuery({
		queryKey: ["payment", "booking", bookingId],
		queryFn: ({ signal }) =>
			getPaymentByBookingService({ bookingId: bookingId!, signal }),
		enabled: !!bookingId,
		staleTime: 1000 * 5,
	});

export const useCreatePaymentQuery = ({
	threadId,
	ticketId,
	onSuccessCallback,
}: {
	threadId: string;
	ticketId: string;
	onSuccessCallback?: (result: Payment | CardPaymentInit) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreatePaymentPayload) =>
			createPaymentService({ payload, signal: abortController.signal }),
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
			queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
			onSuccessCallback?.(result);
		},
	});
};

/** Dev/mock only — simulate a card charge settling. */
export const useMockCompletePaymentQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (payment: Payment) => void;
} = {}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (reference: string) =>
			mockCompletePaymentService({ reference, signal: abortController.signal }),
		onSuccess: (payment) => {
			queryClient.invalidateQueries({
				queryKey: ["payment", "booking", payment.bookingId],
			});
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
			onSuccessCallback?.(payment);
		},
	});
};
