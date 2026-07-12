/* ──────────────────────────────────────────────────────────────
 * Single source of truth for the doc §5.2 action matrix.
 * Given the active ticket (+ its invoices/booking) and the viewer's
 * side, derive the current phase and which actions are available.
 * The ticket stays `booked` through delivery — the live delivery state
 * is carried by booking.status (accepted → in_progress → completed).
 * ────────────────────────────────────────────────────────────── */
import type { Invoice, Ticket } from "#/core/types/chat.types";

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
	canStartJob: boolean; // provider
	canMarkCompleted: boolean; // provider
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
			// booked / in_progress / completed — drive off booking.status
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
	return (
		ticket.invoices.find((i) => i.status === "pending") ??
		ticket.invoices.find((i) => i.status === "paid") ??
		ticket.invoices.find((i) => i.status === "accepted") ??
		ticket.invoices[ticket.invoices.length - 1]
	);
}

export function deriveChat(ticket: Ticket | null, side: ChatSide): DerivedChat {
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

	const actions: ChatActions = {
		canSendMessage: true,
		canGenerateInvoice: isProvider && phase === "negotiating",
		canRecallInvoice: isProvider && phase === "invoice_offered",
		canAcceptInvoice: isCustomer && phase === "invoice_offered",
		canRejectInvoice: isCustomer && phase === "invoice_offered",
		canStartJob: isProvider && phase === "awaiting_delivery",
		canMarkCompleted: isProvider && phase === "in_progress",
		canPay: isCustomer && phase === "awaiting_payment",
		canReview: isCustomer && phase === "awaiting_review",
		canCancelTicket: cancellable,
	};

	return { phase, actions, activeInvoice };
}
