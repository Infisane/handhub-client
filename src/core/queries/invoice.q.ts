import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	acceptInvoiceService,
	getInvoiceService,
	rejectInvoiceService,
	voidInvoiceService,
} from "#/core/services/invoice.service";
import type { AcceptInvoiceResponse, Invoice } from "#/core/types/chat.types";

export const useGetInvoiceQuery = (id: string | null) =>
	useQuery({
		queryKey: ["invoice", id],
		queryFn: ({ signal }) => getInvoiceService({ id: id!, signal }),
		enabled: !!id,
		staleTime: 1000 * 5,
	});

/** Invalidate the open thread, its ticket, the invoice, and the inbox after
 *  any invoice state change so both chat surfaces reflect it immediately. */
const invalidateAfterInvoice = (
	queryClient: ReturnType<typeof useQueryClient>,
	{
		threadId,
		ticketId,
		invoiceId,
	}: { threadId: string; ticketId: string; invoiceId: string },
) => {
	queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
	queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
	queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
	queryClient.invalidateQueries({ queryKey: ["threads"] });
};

/** Customer side — accept → creates the booking atomically. */
export const useAcceptInvoiceQuery = ({
	threadId,
	ticketId,
	invoiceId,
	onSuccessCallback,
}: {
	threadId: string;
	ticketId: string;
	invoiceId: string;
	onSuccessCallback?: (result: AcceptInvoiceResponse) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () =>
			acceptInvoiceService({ id: invoiceId, signal: abortController.signal }),
		onSuccess: (result) => {
			invalidateAfterInvoice(queryClient, { threadId, ticketId, invoiceId });
			onSuccessCallback?.(result);
		},
	});
};

/** Customer side — reject → invoice `rejected`, ticket back to `open`. */
export const useRejectInvoiceQuery = ({
	threadId,
	ticketId,
	invoiceId,
	onSuccessCallback,
}: {
	threadId: string;
	ticketId: string;
	invoiceId: string;
	onSuccessCallback?: (invoice: Invoice) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () =>
			rejectInvoiceService({ id: invoiceId, signal: abortController.signal }),
		onSuccess: (invoice) => {
			invalidateAfterInvoice(queryClient, { threadId, ticketId, invoiceId });
			onSuccessCallback?.(invoice);
		},
	});
};

/** Provider only — recall a mistaken pending invoice. */
export const useVoidInvoiceQuery = ({
	threadId,
	ticketId,
	invoiceId,
	onSuccessCallback,
}: {
	threadId: string;
	ticketId: string;
	invoiceId: string;
	onSuccessCallback?: (invoice: Invoice) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () =>
			voidInvoiceService({ id: invoiceId, signal: abortController.signal }),
		onSuccess: (invoice) => {
			invalidateAfterInvoice(queryClient, { threadId, ticketId, invoiceId });
			onSuccessCallback?.(invoice);
		},
	});
};
