import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	CreateInvoicePayload,
	Invoice,
	Message,
	SendMessagePayload,
	Ticket,
} from "#/core/types/chat.types";

export const getTicketByIdService = ({
	id,
	signal,
}: {
	id: string;
	signal?: AbortSignal;
}) => getRequestData<Ticket>(request.get(`/api/tickets/${id}`, { signal }));

/** Reply within an existing thread. If the ticket is closed/cancelled a fresh
 *  ticket is opened automatically and returned in the response's `ticketId`. */
export const sendTicketMessageService = ({
	id,
	payload,
	signal,
}: {
	id: string;
	payload: SendMessagePayload;
	signal?: AbortSignal;
}) =>
	getRequestData<Message>(
		request.post(`/api/tickets/${id}/messages`, payload, { signal }),
	);

export const cancelTicketService = ({
	id,
	signal,
}: {
	id: string;
	signal?: AbortSignal;
}) =>
	getRequestData<Ticket>(
		request.patch(`/api/tickets/${id}/cancel`, undefined, { signal }),
	);

/** Provider only — generate an invoice on the ticket. */
export const createInvoiceService = ({
	id,
	payload,
	signal,
}: {
	id: string;
	payload: CreateInvoicePayload;
	signal?: AbortSignal;
}) =>
	getRequestData<Invoice>(
		request.post(`/api/tickets/${id}/invoice`, payload, { signal }),
	);
