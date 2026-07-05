import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	cancelTicketService,
	createInvoiceService,
	getTicketByIdService,
	sendTicketMessageService,
} from "#/core/services/ticket.service";
import type {
	CreateInvoicePayload,
	Invoice,
	Message,
	SendMessagePayload,
	Ticket,
} from "#/core/types/chat.types";

export const useGetTicketByIdQuery = (id: string | null) =>
	useQuery({
		queryKey: ["ticket", id],
		queryFn: ({ signal }) => getTicketByIdService({ id: id!, signal }),
		enabled: !!id,
		staleTime: 1000 * 4,
	});

/** Reply within an existing thread. `threadId` is used to refresh the open
 *  conversation + inbox after the send. */
export const useSendTicketMessageQuery = ({
	ticketId,
	threadId,
	onSuccessCallback,
}: {
	ticketId: string;
	threadId: string;
	onSuccessCallback?: (message: Message) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: SendMessagePayload) =>
			sendTicketMessageService({
				id: ticketId,
				payload,
				signal: abortController.signal,
			}),
		onSuccess: (message) => {
			queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			onSuccessCallback?.(message);
		},
	});
};

export const useCancelTicketQuery = ({
	threadId,
	onSuccessCallback,
}: {
	threadId: string;
	onSuccessCallback?: (ticket: Ticket) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ticketId: string) =>
			cancelTicketService({ id: ticketId, signal: abortController.signal }),
		onSuccess: (ticket) => {
			queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			onSuccessCallback?.(ticket);
		},
	});
};

/** Provider only — issue an invoice on a ticket. */
export const useCreateInvoiceQuery = ({
	ticketId,
	threadId,
	onSuccessCallback,
}: {
	ticketId: string;
	threadId: string;
	onSuccessCallback?: (invoice: Invoice) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateInvoicePayload) =>
			createInvoiceService({
				id: ticketId,
				payload,
				signal: abortController.signal,
			}),
		onSuccess: (invoice) => {
			queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
			queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			onSuccessCallback?.(invoice);
		},
	});
};
