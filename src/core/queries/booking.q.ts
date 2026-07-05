import { useMutation, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import { updateBookingStatusService } from "#/core/services/booking.service";
import type {
	Booking,
	UpdateBookingStatusPayload,
} from "#/core/types/chat.types";

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
			onSuccessCallback?.(booking);
		},
	});
};
