import {
	Ban,
	CheckCircle2,
	FileText,
	PlayCircle,
	Star,
	Zap,
} from "lucide-react";
import { useState } from "react";
import type { ChatActions } from "#/core/helpers/chat-phase.helper";
import { useUpdateBookingStatusQuery } from "#/core/queries/booking.q";
import { useCancelTicketQuery } from "#/core/queries/ticket.q";
import type { Ticket } from "#/core/types/chat.types";
import { InvoiceComposer } from "./invoice-composer";
import { PaymentSheet } from "./payment-sheet";
import { ReviewForm } from "./review-form";

const primaryBtn =
	"flex-1 h-10 rounded-xl bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white text-[12px] font-extrabold flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-blue-500/10 transition-all disabled:opacity-50";
const ghostBtn =
	"h-10 px-3.5 rounded-xl border border-[var(--dashboard-border)] text-[12px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50";
// Cancel is destructive + irreversible — read as danger, and confirm first.
const cancelBtn =
	"h-10 px-3.5 rounded-xl border border-red-200 dark:border-red-500/30 text-[12px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50";
const dangerBtn =
	"h-10 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50";

export function TicketFooterActions({
	threadId,
	ticket,
	actions,
}: {
	threadId: string;
	ticket: Ticket | null;
	actions: ChatActions;
}) {
	const [modal, setModal] = useState<"invoice" | "payment" | "review" | null>(
		null,
	);
	const [confirmingCancel, setConfirmingCancel] = useState(false);

	const ticketId = ticket?.id ?? "";
	const booking = ticket?.booking ?? null;
	const payableInvoice =
		ticket?.invoices.find((i) => i.status === "accepted") ?? null;

	const bookingStatus = useUpdateBookingStatusQuery({
		bookingId: booking?.id ?? "",
		threadId,
		ticketId,
	});
	const cancel = useCancelTicketQuery({ threadId });

	const hasPrimary =
		actions.canGenerateInvoice ||
		actions.canStartJob ||
		actions.canMarkCompleted ||
		actions.canPay ||
		actions.canReview;

	if (!hasPrimary && !actions.canCancelTicket) return null;

	// Confirmation replaces the action row so the destructive choice is explicit.
	if (confirmingCancel) {
		return (
			<div className="px-4 pt-3 pb-1 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
				<div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50/60 dark:bg-red-500/10 p-3 space-y-2.5">
					<p className="text-[12px] font-semibold text-[var(--dashboard-text)] flex items-center gap-1.5">
						<Ban size={13} className="text-red-600 shrink-0" />
						Cancel this ticket? This closes the conversation and can’t be
						undone.
					</p>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setConfirmingCancel(false)}
							className={`${ghostBtn} flex-1`}
						>
							Keep ticket
						</button>
						<button
							type="button"
							disabled={cancel.isPending}
							onClick={() =>
								cancel.mutate(ticketId, {
									onSettled: () => setConfirmingCancel(false),
								})
							}
							className={`${dangerBtn} flex-1`}
						>
							<Ban size={13} />
							{cancel.isPending ? "Cancelling…" : "Yes, cancel ticket"}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="px-4 pt-3 pb-1 flex flex-wrap items-center gap-2 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
				{actions.canGenerateInvoice && (
					<button
						type="button"
						onClick={() => setModal("invoice")}
						className={primaryBtn}
					>
						<FileText size={13} /> Generate invoice
					</button>
				)}

				{actions.canStartJob && (
					<button
						type="button"
						disabled={bookingStatus.isPending}
						onClick={() => bookingStatus.mutate({ status: "in_progress" })}
						className={primaryBtn}
					>
						<PlayCircle size={14} /> Start job
					</button>
				)}

				{actions.canMarkCompleted && (
					<button
						type="button"
						disabled={bookingStatus.isPending}
						onClick={() => bookingStatus.mutate({ status: "completed" })}
						className={primaryBtn}
					>
						<CheckCircle2 size={14} /> Mark completed
					</button>
				)}

				{actions.canPay && booking && payableInvoice && (
					<button
						type="button"
						onClick={() => setModal("payment")}
						className={primaryBtn}
					>
						<Zap size={12} className="stroke-[2.5]" /> Pay
					</button>
				)}

				{actions.canReview && booking && (
					<button
						type="button"
						onClick={() => setModal("review")}
						className={primaryBtn}
					>
						<Star size={13} /> Leave review
					</button>
				)}

				{actions.canCancelTicket && (
					<button
						type="button"
						onClick={() => setConfirmingCancel(true)}
						className={hasPrimary ? cancelBtn : `${cancelBtn} flex-1`}
					>
						<Ban size={13} /> Cancel ticket
					</button>
				)}
			</div>

			{modal === "invoice" && (
				<InvoiceComposer
					ticketId={ticketId}
					threadId={threadId}
					onClose={() => setModal(null)}
				/>
			)}
			{modal === "payment" && booking && payableInvoice && (
				<PaymentSheet
					bookingId={booking.id}
					invoiceId={payableInvoice.id}
					threadId={threadId}
					ticketId={ticketId}
					totalAmount={payableInvoice.totalAmount}
					onClose={() => setModal(null)}
				/>
			)}
			{modal === "review" && booking && (
				<ReviewForm
					bookingId={booking.id}
					threadId={threadId}
					ticketId={ticketId}
					onClose={() => setModal(null)}
				/>
			)}
		</>
	);
}
