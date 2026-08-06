import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	getBookingsService,
	updateBookingStatusService,
} from "#/core/services/booking.service";
import type {
	Booking,
	GetBookingsParams,
	UpdateBookingStatusPayload,
} from "#/core/types/chat.types";

export const useGetBookingsQuery = (params?: GetBookingsParams) =>
	useQuery({
		queryKey: ["bookings", params],
		queryFn: ({ signal }) => getBookingsService({ params, signal }),
		staleTime: 1000 * 30,
	});

/** Provider — accepted → in_progress → completed. Invalidate the open thread +
 *  ticket + inbox so the delivery buttons re-derive on both surfaces. */
export const useUpdateBookingStatusQuery = ({
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
		mutationFn: (payload: UpdateBookingStatusPayload) =>
			updateBookingStatusService({
				id: bookingId,
				payload,
				signal: abortController.signal,
			}),
		onSuccess: (booking) => {
			queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
			queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			onSuccessCallback?.(booking);
		},
	});
};
