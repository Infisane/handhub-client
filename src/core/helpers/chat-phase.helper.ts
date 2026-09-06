/* ──────────────────────────────────────────────────────────────
 * Single source of truth for the doc §5.2 action matrix.
 * Given the active ticket (+ its invoices/booking) and the viewer's
 * side, derive the current phase and which actions are available.
 * The ticket stays `booked` through delivery — the live delivery state
 * is carried by booking.status (accepted → in_progress → completed).
 * ────────────────────────────────────────────────────────────── */
import type { Invoice, Payment, Ticket } from "#/core/types/chat.types";

export type ChatSide = "initiator" | "provider" | "none";

export type ChatPhase =
	| "empty" // no ticket yet (fresh conversation)
	| "negotiating"
	| "invoice_offered"
	| "awaiting_delivery"
	| "in_progress"
	| "awaiting_payment"
	| "awaiting_review"
	| "closed"
	| "cancelled";

export interface ChatActions {
	canSendMessage: boolean;
	canGenerateInvoice: boolean; // provider
	canRecallInvoice: boolean; // provider
	canAcceptInvoice: boolean; // customer
	canRejectInvoice: boolean; // customer
	canRequestAdditionalMaterials: boolean; // provider
	canStartJob: boolean; // provider
	canMarkCompleted: boolean; // customer
	canPay: boolean; // customer
	canReview: boolean; // customer
	canCancelTicket: boolean; // either
}

export interface DerivedChat {
	phase: ChatPhase;
	actions: ChatActions;
	/** The invoice currently driving the card, if any. */
	activeInvoice: Invoice | null;
}

const NO_ACTIONS: ChatActions = {
	canSendMessage: false,
	canGenerateInvoice: false,
	canRecallInvoice: false,
	canAcceptInvoice: false,
	canRejectInvoice: false,
	canRequestAdditionalMaterials: false,
	canStartJob: false,
	canMarkCompleted: false,
	canPay: false,
	canReview: false,
	canCancelTicket: false,
};

function derivePhase(ticket: Ticket | null): ChatPhase {
	if (!ticket) return "empty";

	switch (ticket.status) {
		case "cancelled":
			return "cancelled";
		case "closed":
			return "closed";
		case "open":
			return "negotiating";
		case "invoiced":
			return "invoice_offered";
		default: {
			// booked / in_progress / completed. A mid-job supplemental
			// (additional-materials) invoice keeps ticket.status "booked"
			// instead of reverting to "invoiced" — key off the newest
			// invoice's own status before falling back to booking.status.
			if (ticket.invoices.some((i) => i.status === "pending")) {
				return "invoice_offered";
			}
			const bookingStatus = ticket.booking?.status;
			if (bookingStatus === "in_progress") return "in_progress";
			if (bookingStatus === "completed") {
				const paid = ticket.invoices.some((i) => i.status === "paid");
				return paid ? "awaiting_review" : "awaiting_payment";
			}
			return "awaiting_delivery"; // accepted
		}
	}
}

/** Pick the invoice relevant to the current phase for the interactive card. */
function pickActiveInvoice(ticket: Ticket | null): Invoice | null {
	if (!ticket || ticket.invoices.length === 0) return null;
	// Sort by createdAt (don't assume array order) so a fresh supplemental
	// invoice always outranks an earlier, already-settled one — otherwise an
	// old "paid" invoice can shadow a newer "accepted" one and Pay never shows.
	const newestFirst = [...ticket.invoices].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
	return (
		newestFirst.find((i) => i.status === "pending") ??
		newestFirst.find((i) => i.status === "accepted") ??
		newestFirst.find((i) => i.status === "paid") ??
		newestFirst[0]
	);
}

export function deriveChat(
	ticket: Ticket | null,
	side: ChatSide,
	bookingPayments: Payment[] = [],
): DerivedChat {
	const phase = derivePhase(ticket);
	const activeInvoice = pickActiveInvoice(ticket);

	if (side === "none") {
		return { phase, actions: NO_ACTIONS, activeInvoice };
	}

	const isProvider = side === "provider";
	const isCustomer = side === "initiator";
	const cancellable =
		phase === "negotiating" ||
		phase === "invoice_offered" ||
		phase === "awaiting_delivery" ||
		phase === "in_progress";

	// An invoice with labor items stays "accepted" (not "paid") all the way
	// through job completion — status alone can't tell you whether the
	// materials portion has already been paid. Check the booking's actual
	// payment rows instead.
	const alreadyPaid =
		!!activeInvoice &&
		bookingPayments.some((p) => p.invoiceId === activeInvoice.id);

	const actions: ChatActions = {
		canSendMessage: true,
		canGenerateInvoice: isProvider && phase === "negotiating",
		canRecallInvoice: isProvider && phase === "invoice_offered",
		canAcceptInvoice: isCustomer && phase === "invoice_offered",
		canRejectInvoice: isCustomer && phase === "invoice_offered",
		canRequestAdditionalMaterials:
			isProvider && (phase === "awaiting_delivery" || phase === "in_progress"),
		canStartJob: isProvider && phase === "awaiting_delivery",
		canMarkCompleted: isCustomer && phase === "in_progress",
		canPay: isCustomer && activeInvoice?.status === "accepted" && !alreadyPaid,
		canReview: isCustomer && phase === "awaiting_review",
		canCancelTicket: cancellable,
	};

	return { phase, actions, activeInvoice };
}
