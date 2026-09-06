import {
	Ban,
	CheckCircle2,
	FileText,
	PlayCircle,
	Plus,
	Star,
	Zap,
} from "lucide-react";
import { useState } from "react";
import type { ChatActions } from "#/core/helpers/chat-phase.helper";
import {
	useConfirmBookingCompletionQuery,
	useStartBookingQuery,
} from "#/core/queries/booking.q";
import { useCancelTicketQuery } from "#/core/queries/ticket.q";
import type { Invoice, Ticket } from "#/core/types/chat.types";
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
	activeInvoice,
}: {
	threadId: string;
	ticket: Ticket | null;
	actions: ChatActions;
	activeInvoice: Invoice | null;
}) {
	const [modal, setModal] = useState<
		"invoice" | "materials" | "payment" | "review" | null
	>(null);
	const [confirmingCancel, setConfirmingCancel] = useState(false);

	const ticketId = ticket?.id ?? "";
	const booking = ticket?.booking ?? null;

	const startJob = useStartBookingQuery({
		bookingId: booking?.id ?? "",
		threadId,
		ticketId,
	});
	const confirmCompletion = useConfirmBookingCompletionQuery({
		bookingId: booking?.id ?? "",
		threadId,
		ticketId,
	});
	const cancel = useCancelTicketQuery({ threadId });

	const hasPrimary =
		actions.canGenerateInvoice ||
		actions.canRequestAdditionalMaterials ||
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

				{actions.canRequestAdditionalMaterials && (
					<button
						type="button"
						onClick={() => setModal("materials")}
						className={ghostBtn}
					>
						<Plus size={13} /> Request additional materials
					</button>
				)}

				{actions.canStartJob && (
					<button
						type="button"
						disabled={startJob.isPending}
						onClick={() => startJob.mutate()}
						className={primaryBtn}
					>
						<PlayCircle size={14} />
						{startJob.isPending ? "Starting…" : "Start job"}
					</button>
				)}

				{actions.canMarkCompleted && (
					<button
						type="button"
						disabled={confirmCompletion.isPending}
						onClick={() => confirmCompletion.mutate()}
						className={primaryBtn}
					>
						<CheckCircle2 size={14} />
						{confirmCompletion.isPending ? "Confirming…" : "Confirm job done"}
					</button>
				)}

				{actions.canPay && booking && activeInvoice && (
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

			{(modal === "invoice" || modal === "materials") && (
				<InvoiceComposer
					ticketId={ticketId}
					threadId={threadId}
					materialsOnly={modal === "materials"}
					onClose={() => setModal(null)}
				/>
			)}
			{modal === "payment" && booking && activeInvoice && (
				<PaymentSheet
					bookingId={booking.id}
					invoiceId={activeInvoice.id}
					threadId={threadId}
					ticketId={ticketId}
					totalAmount={activeInvoice.totalAmount}
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
