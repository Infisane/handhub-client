/* ──────────────────────────────────────────────────────────────
 * Chat-First Booking Flow — types
 * Mirrors the shipped API contract in docs/frontend-integration.md.
 * All money fields (amount, price, totalAmount, balance) come back as
 * DECIMAL STRINGS — parse with money.helper before arithmetic.
 * ────────────────────────────────────────────────────────────── */

/* ── Enums (doc §10) ─────────────────────────────────────────── */
export type MessageType = "text" | "image" | "system" | "ai";

export type SystemCardKind =
	| "invoice_issued" // metadata: { invoiceId }
	| "invoice_rejected" // metadata: { invoiceId }
	| "invoice_voided" // metadata: { invoiceId }
	| "booking_confirmed" // metadata: { bookingRef }
	| "intake_summary" // metadata: { intakeSummary }
	| "ticket_cancelled"; // metadata: {}

export type TicketStatus =
	| "open"
	| "invoiced"
	| "booked"
	| "in_progress"
	| "completed"
	| "cancelled"
	| "closed";

export type InvoiceStatus =
	| "pending"
	| "accepted"
	| "rejected"
	| "voided"
	| "paid";

export type BookingStatus =
	| "pending"
	| "accepted"
	| "rescheduled"
	| "negotiating"
	| "declined"
	| "cancelled"
	| "in_progress"
	| "completed";

export type PaymentMethod = "wallet" | "card";
export type PaymentStatus = "held" | "released" | "refunded" | "failed";
export type TxType = "credit" | "debit";
export type UrgencyLevel = "low" | "normal" | "high" | "emergency";
export type NotificationType = "lead" | "booking";

/* ── Message + system metadata ───────────────────────────────── */
export interface IntakeSummary {
	serviceType?: string;
	description?: string;
	location?: string;
	preferredTime?: string;
	urgency?: string;
}

export interface SystemMetadata {
	kind: SystemCardKind;
	invoiceId?: string;
	bookingRef?: string;
	intakeSummary?: IntakeSummary;
}

export interface Message {
	id: string;
	senderId: string | null; // null for system / ai
	receiverId: string | null; // null for system / ai
	bookingId: string | null;
	ticketId: string;
	threadId?: string; // present on message-endpoint responses + WS frames
	type: MessageType;
	metadata: SystemMetadata | null;
	content: string;
	isRead: boolean;
	createdAt: string;
}

/* ── Provider stub embedded in thread payloads ───────────────── */
export interface ThreadProvider {
	id: string; // provider-profile id
	userId: string; // provider's user id
	title: string | null;
	businessName: string | null;
}

/* ── Invoice ─────────────────────────────────────────────────── */
export interface InvoiceLineItem {
	quantity: number;
	unitPrice: number;
	description: string;
}

export interface Invoice {
	id: string;
	invoiceRef: string;
	ticketId: string;
	providerId: string; // user id (NOT provider-profile id)
	customerId: string; // user id
	lineItems: InvoiceLineItem[];
	totalAmount: string; // decimal string
	status: InvoiceStatus;
	description: string;
	createdAt: string;
}

/* ── Booking ─────────────────────────────────────────────────── */
export interface Booking {
	id: string;
	bookingRef: string;
	customerId: string; // user id
	providerId: string; // provider-profile id (NOT user id)
	categoryId: string | null;
	serviceTitle: string;
	status: BookingStatus;
	scheduledTime: string | null;
	preferredDate: string | null;
	preferredTime: string | null;
	price: string; // decimal string
	estimatedBudget: string;
	agreedPrice: number;
	notes: string | null;
	jobDescription: string; // JSON string of line items — JSON.parse when needed
	address: string | null;
	location: string | null;
	urgency: UrgencyLevel;
	createdAt: string;
}

/* ── Ticket ──────────────────────────────────────────────────── */
export interface Ticket {
	id: string;
	ref: string;
	status: TicketStatus;
	threadId: string;
	bookingId: string | null;
	booking: Booking | null;
	intakeSummary: IntakeSummary | null;
	invoices: Invoice[];
	messages: Message[];
}

/* ── Threads ─────────────────────────────────────────────────── */
export interface ThreadActiveTicket {
	id: string;
	ref: string;
	status: TicketStatus;
}

export interface ThreadLastMessage {
	content: string;
	type: MessageType;
	createdAt: string;
}

export interface ThreadSummary {
	id: string;
	provider: ThreadProvider;
	initiatorId: string;
	activeTicket: ThreadActiveTicket | null;
	lastMessage: ThreadLastMessage | null;
	updatedAt: string;
}

export interface ThreadDetail {
	id: string;
	initiatorId: string;
	provider: ThreadProvider;
	tickets: Ticket[];
}

/* ── Payment + Wallet ────────────────────────────────────────── */
export interface Payment {
	id: string;
	bookingId: string;
	customerId: string;
	providerId: string;
	amount: string; // decimal string
	paymentMethod: PaymentMethod;
	status: PaymentStatus;
	transactionReference: string;
	createdAt: string;
}

export interface CardPaymentInit {
	paymentId: string;
	authorizationUrl: string;
}

export interface WalletTransaction {
	id: string;
	walletId: string;
	type: TxType;
	amount: string;
	description: string;
	reference: string;
	balanceAfter: string;
	createdAt: string;
}

export interface Wallet {
	id: string;
	userId: string;
	balance: string; // decimal string
	transactions: WalletTransaction[];
}

/* ── Review ──────────────────────────────────────────────────── */
export interface Review {
	id: string;
	bookingId: string;
	customerId: string;
	providerId: string;
	rating: number;
	comment: string;
	createdAt: string;
}

/* ── Notification (also the WS `notification` payload) ───────── */
export interface AppNotification {
	id: string;
	userId: string;
	title: string;
	body: string;
	type: NotificationType;
	bookingId: string | null;
	isRead: boolean;
	createdAt: string;
}

/* ── Request payloads ────────────────────────────────────────── */
export interface SendMessagePayload {
	content: string;
}

export interface CreateInvoicePayload {
	description: string;
	lineItems: InvoiceLineItem[];
}

export interface CreatePaymentPayload {
	bookingId: string;
	paymentMethod: PaymentMethod;
	invoiceId?: string;
}

export interface UpdateBookingStatusPayload {
	status: Extract<BookingStatus, "in_progress" | "completed">;
}

export interface CreateReviewPayload {
	bookingId: string;
	rating: number;
	comment: string;
}

export interface AcceptInvoiceResponse {
	invoice: Invoice;
	booking: Booking;
}
