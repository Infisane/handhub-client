import { getRequestData, request } from "#/core/helpers/axios.helper";
import type { AcceptInvoiceResponse, Invoice } from "#/core/types/chat.types";

export const getInvoiceService = ({
	id,
	signal,
}: {
	id: string;
	signal?: AbortSignal;
}) => getRequestData<Invoice>(request.get(`/api/invoices/${id}`, { signal }));

/** Customer side — accept → creates the booking atomically. */
export const acceptInvoiceService = ({
	id,
	signal,
}: {
	id: string;
	signal?: AbortSignal;
}) =>
	getRequestData<AcceptInvoiceResponse>(
		request.patch(`/api/invoices/${id}/accept`, undefined, { signal }),
	);

/** Customer side — reject → invoice `rejected`, ticket back to `open`. */
export const rejectInvoiceService = ({
	id,
	signal,
}: {
	id: string;
	signal?: AbortSignal;
}) =>
	getRequestData<Invoice>(
		request.patch(`/api/invoices/${id}/reject`, undefined, { signal }),
	);

/** Provider only — recall a mistaken pending invoice. */
export const voidInvoiceService = ({
	id,
	signal,
}: {
	id: string;
	signal?: AbortSignal;
}) =>
	getRequestData<Invoice>(
		request.patch(`/api/invoices/${id}/void`, undefined, { signal }),
	);
