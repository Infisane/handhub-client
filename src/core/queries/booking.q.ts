import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	confirmBookingCompletionService,
	getBookingsService,
	startBookingService,
} from "#/core/services/booking.service";
import type { Booking, GetBookingsParams } from "#/core/types/chat.types";

export const useGetBookingsQuery = (params?: GetBookingsParams) =>
	useQuery({
		queryKey: ["bookings", params],
		queryFn: ({ signal }) => getBookingsService({ params, signal }),
		staleTime: 1000 * 30,
	});

/** Provider — accepted → in_progress. Invalidate the open thread + ticket +
 *  inbox so the delivery buttons re-derive on both surfaces. */
export const useStartBookingQuery = ({
	bookingId,
	threadId,
	ticketId,
	onSuccessCallback,
}: {
	bookingId: string;
	threadId: string;
	ticketId: string;
	onSuccessCallback?: (booking: Booking) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () =>
			startBookingService({ id: bookingId, signal: abortController.signal }),
		onSuccess: (booking) => {
			queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
			queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			onSuccessCallback?.(booking);
		},
	});
};

/** Customer — in_progress → completed. Also releases any held workmanship
 *  payment, so invalidate the booking's payment rows and the wallet too. */
export const useConfirmBookingCompletionQuery = ({
	bookingId,
	threadId,
	ticketId,
	onSuccessCallback,
}: {
	bookingId: string;
	threadId: string;
	ticketId: string;
	onSuccessCallback?: (booking: Booking) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () =>
			confirmBookingCompletionService({
				id: bookingId,
				signal: abortController.signal,
			}),
		onSuccess: (booking) => {
			queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
			queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			queryClient.invalidateQueries({
				queryKey: ["payment", "booking", bookingId],
			});
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
			onSuccessCallback?.(booking);
		},
	});
};
