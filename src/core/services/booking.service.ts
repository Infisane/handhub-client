import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	Booking,
	UpdateBookingStatusPayload,
} from "#/core/types/chat.types";

/** Provider — drive delivery: accepted → in_progress → completed. */
export const updateBookingStatusService = ({
	id,
	payload,
	signal,
}: {
	id: string;
	payload: UpdateBookingStatusPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<Booking>(
		request.patch(`/api/bookings/${id}/status`, payload, { signal }),
	);
