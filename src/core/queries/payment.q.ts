import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	createOnlinePaymentService,
	createPaymentService,
	getPaymentByBookingService,
	verifyOnlinePaymentService,
} from "#/core/services/payment.service";
import type {
	CreateOnlinePaymentPayload,
	CreatePaymentPayload,
	Payment,
	PaymentTransaction,
} from "#/core/types/chat.types";

export const useGetPaymentByBookingQuery = (
	bookingId: string | null,
	/** Set while awaiting a webhook/verify to settle (payment-callback page). */
	refetchInterval?: number,
) =>
	useQuery({
		queryKey: ["payment", "booking", bookingId],
		queryFn: ({ signal }) =>
			getPaymentByBookingService({ bookingId: bookingId!, signal }),
		enabled: !!bookingId,
		staleTime: 1000 * 5,
		refetchInterval,
	});

export const useCreatePaymentQuery = ({
	threadId,
	ticketId,
	onSuccessCallback,
}: {
	threadId: string;
	ticketId: string;
	onSuccessCallback?: (result: Payment[] | Payment) => void;
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

export const useCreateOnlinePaymentQuery = ({
	threadId,
	ticketId,
	onSuccessCallback,
}: {
	threadId: string;
	ticketId: string;
	onSuccessCallback?: (result: PaymentTransaction) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateOnlinePaymentPayload) =>
			createOnlinePaymentService({ payload, signal: abortController.signal }),
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
			queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
			onSuccessCallback?.(result);
		},
	});
};

/** Available primitive — not directly invoked by the payment-callback page,
 *  which polls getPaymentByBookingService instead to avoid depending on
 *  unconfirmed gateway redirect param names. */
export const useVerifyOnlinePaymentQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (result: PaymentTransaction) => void;
} = {}) =>
	useMutation({
		mutationFn: (reference: string) =>
			verifyOnlinePaymentService({ reference, signal: abortController.signal }),
		onSuccess: (result) => onSuccessCallback?.(result),
	});
