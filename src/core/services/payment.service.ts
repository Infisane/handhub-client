import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	CreateOnlinePaymentPayload,
	CreatePaymentPayload,
	Payment,
	PaymentTransaction,
} from "#/core/types/chat.types";

/** Customer — pay by wallet, now reachable as soon as an invoice is
 *  accepted (not just after job completion). When invoiceId is sent this
 *  settles synchronously and splits into materials(released)/workmanship(held)
 *  rows — an array. With no invoiceId (direct-booking flow) it's still a
 *  single Payment. */
export const createPaymentService = ({
	payload,
	signal,
}: {
	payload: CreatePaymentPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<Payment[] | Payment>(
		request.post("/api/payments", payload, { signal }),
	);

/** Customer — pay by card/online (Paystack/Flutterwave). Always returns a
 *  PaymentTransaction, never an array or a split — the materials/workmanship
 *  rows only appear later, via getPaymentByBookingService, once the gateway
 *  confirms the charge (webhook or /verify). */
export const createOnlinePaymentService = ({
	payload,
	signal,
}: {
	payload: CreateOnlinePaymentPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<PaymentTransaction>(
		request.post("/api/payments/online/initiate", payload, { signal }),
	);

export const verifyOnlinePaymentService = ({
	reference,
	signal,
}: {
	reference: string;
	signal?: AbortSignal;
}) =>
	getRequestData<PaymentTransaction>(
		request.get(`/api/payments/online/${reference}/verify`, { signal }),
	);

export const getPaymentByBookingService = ({
	bookingId,
	signal,
}: {
	bookingId: string;
	signal?: AbortSignal;
}) =>
	getRequestData<Payment[]>(
		request.get(`/api/payments/booking/${bookingId}`, { signal }),
	);
