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
	| "ticket_cancelled" // metadata: {}
	| "payment_received"; // metadata: { bookingId, amount, paymentIds }

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
	bookingId?: string;
	amount?: string; // decimal string
	paymentIds?: string[];
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

/* ── Participants embedded in thread payloads ────────────────── */
export interface ThreadProvider {
	id: string; // provider-profile id
	userId: string; // provider's user id
	title: string | null;
	businessName: string | null;
	avatar: string | null;
}

export interface ThreadInitiator {
	id: string; // customer's user id
	fullName: string;
	avatar: string | null;
}

/* ── Invoice ─────────────────────────────────────────────────── */
export type LineItemKind = "labor" | "material";

export interface InvoiceLineItem {
	quantity: number;
	unitPrice: number;
	description: string;
	kind: LineItemKind;
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
export interface BookingCustomer {
	id: string;
	fullName: string;
	phone: string;
	avatar: string | null;
}

export interface BookingProvider {
	id: string;
	businessName: string | null;
	averageRating: string;
}

export interface Booking {
	id: string;
	bookingRef: string;
	customerId: string; // user id
	customer?: BookingCustomer; // present on GET /api/bookings list items
	providerId: string; // provider-profile id (NOT user id)
	provider?: BookingProvider; // present on GET /api/bookings list items
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
	startedAt?: string | null;
	completedAt?: string | null;
	createdAt: string;
}

export interface GetBookingsParams {
	status?: BookingStatus;
	reviewed?: boolean;
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
	initiator: ThreadInitiator;
	activeTicket: ThreadActiveTicket | null;
	lastMessage: ThreadLastMessage | null;
	updatedAt: string;
}

export interface ThreadDetail {
	id: string;
	initiatorId: string;
	initiator: ThreadInitiator;
	provider: ThreadProvider;
	tickets: Ticket[];
}

/* ── Payment + Wallet ────────────────────────────────────────── */
export type PaymentKind = "materials" | "workmanship";

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
	/** null for a direct booking with no linked invoice. */
	kind: PaymentKind | null;
	invoiceId: string | null;
}

/** POST /api/payments/online/initiate and GET /api/payments/online/:reference/verify
 *  both return this — never an array, invoice-linked or not. The
 *  materials/workmanship split only exists later, in GET /payments/booking/:id.
 *  Also the shape POST /api/wallet/topup/initiate returns (same endpoint
 *  family) — bookingId is null and customerId is present for a wallet
 *  top-up, the reverse of a booking payment. */
export interface PaymentTransaction {
	id: string;
	bookingId: string | null;
	customerId?: string;
	providerName: string;
	reference: string;
	amount: string; // decimal string — the invoice total, not booking.price
	currency: string;
	status: string;
	paymentUrl: string;
}

export interface WalletTopupPayload {
	amount: number;
	callbackUrl?: string;
	preferredProvider?: "paystack" | "flutterwave";
	currency?: string;
}

export type TxCategory =
	| "deposit"
	| "withdrawal"
	| "payment"
	| "release"
	| "refund"
	| "clawback";

export interface WalletTransaction {
	id: string;
	walletId: string;
	type: TxType;
	category: TxCategory;
	amount: string;
	description: string;
	reference: string;
	balanceAfter: string;
	createdAt: string;
	bookingId: string | null;
	ticketId: string | null; // only set if the booking has an associated chat ticket
	artisanName: string | null;
	avatar: string | null;
}

export interface GetWalletTransactionsParams {
	limit?: number;
	offset?: number;
	type?: TxType;
	category?: TxCategory;
}

export interface WalletTransactionsResponse {
	data: WalletTransaction[];
	meta: { total: number; limit: number; offset: number };
}

export interface HeldPayment {
	paymentId: string;
	bookingId: string;
	serviceTitle: string;
	amount: string;
}

export interface Wallet {
	id: string;
	userId: string;
	balance: string; // decimal string
	escrowBalance: string;
	heldPayments: HeldPayment[];
	monthlyTotals: { currentMonth: string; previousMonth: string };
}

export type WithdrawalStatus =
	| "pending"
	| "approved"
	| "processing"
	| "completed"
	| "rejected"
	| "failed";

/** POST /api/wallet/withdraw response — a withdrawal request, not a wallet.
 *  The wallet is debited immediately at request time; the payout itself only
 *  happens once an admin approves it and a real gateway transfer settles. */
export interface WithdrawalRequest {
	id: string;
	userId: string;
	walletId: string;
	amount: number; // raw number here, unlike Wallet.balance's decimal string
	bankCode: string;
	bankAccountNumber: string;
	bankAccountName: string;
	status: WithdrawalStatus;
	requestedAt: string;
	reviewedById: string | null;
	reviewedAt: string | null;
	rejectionReason: string | null;
	providerName: string | null;
	providerTransferReference: string | null;
	completedAt: string | null;
	failureReason: string | null;
}

export interface Bank {
	code: string;
	name: string;
}

/** GET/POST /api/wallet/bank-account — bankAccountNumber comes back masked
 *  (e.g. "******0031"). bankAccountName is always gateway-resolved, never
 *  taken from user input. */
export interface BankAccount {
	bankCode: string;
	bankAccountNumber: string;
	bankAccountName: string;
	bankVerifiedAt: string;
}

export interface SaveBankAccountPayload {
	bankCode: string;
	accountNumber: string;
	preferredProvider?: "paystack" | "flutterwave";
}

/* ── Threads: unread count ───────────────────────────────────── */
export interface UnreadCountResponse {
	count: number;
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

/** /online/initiate needs a callbackUrl the wallet path doesn't — Flutterwave
 *  rejects the request without one. */
export interface CreateOnlinePaymentPayload extends CreatePaymentPayload {
	callbackUrl: string;
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
