import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	CardPaymentInit,
	CreatePaymentPayload,
	Payment,
} from "#/core/types/chat.types";

/** Customer — pay after the booking is completed (pay-on-delivery).
 *  Wallet returns a settled Payment; card returns a redirect init. */
export const createPaymentService = ({
	payload,
	signal,
}: {
	payload: CreatePaymentPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<Payment | CardPaymentInit>(
		request.post("/api/payments", payload, { signal }),
	);

export const getPaymentByBookingService = ({
	bookingId,
	signal,
}: {
	bookingId: string;
	signal?: AbortSignal;
}) =>
	getRequestData<Payment>(
		request.get(`/api/payments/booking/${bookingId}`, { signal }),
	);

/** Dev/mock only — simulate a successful card charge (non-production). */
export const mockCompletePaymentService = ({
	reference,
	signal,
}: {
	reference: string;
	signal?: AbortSignal;
}) =>
	getRequestData<Payment>(
		request.post(
			`/api/payments/paystack/mock-complete/${reference}`,
			undefined,
			{
				signal,
			},
		),
	);
