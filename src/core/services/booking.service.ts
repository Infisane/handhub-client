import { getRequestData, request } from "#/core/helpers/axios.helper";
import type { Booking, GetBookingsParams } from "#/core/types/chat.types";

export const getBookingsService = ({
	params,
	signal,
}: {
	params?: GetBookingsParams;
	signal?: AbortSignal;
}) =>
	getRequestData<Booking[]>(request.get("/api/bookings", { params, signal }));

/** Provider-only. Booking must be `accepted`. */
export const startBookingService = ({
	id,
	signal,
}: {
	id: string;
	signal?: AbortSignal;
}) =>
	getRequestData<Booking>(
		request.post(`/api/bookings/${id}/start`, undefined, { signal }),
	);

/** Customer-only. Booking must be `in_progress`. Also releases any held
 *  workmanship payment and flips the invoice to `paid`. */
export const confirmBookingCompletionService = ({
	id,
	signal,
}: {
	id: string;
	signal?: AbortSignal;
}) =>
	getRequestData<Booking>(
		request.post(`/api/bookings/${id}/confirm-completion`, undefined, {
			signal,
		}),
	);
