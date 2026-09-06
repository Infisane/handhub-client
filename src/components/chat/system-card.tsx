import {
	Ban,
	CalendarCheck,
	ChevronDown,
	FileText,
	Info,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import type { ChatSide } from "#/core/helpers/chat-phase.helper";
import type { Message } from "#/core/types/chat.types";
import { InvoiceCard } from "./invoice-card";

/** Passive centered notice for non-interactive system events. */
function Notice({
	icon,
	text,
	tone = "neutral",
}: {
	icon: React.ReactNode;
	text: string;
	tone?: "neutral" | "success" | "danger";
}) {
	const cls =
		tone === "success"
			? "bg-green-50 text-green-700 border-green-200/50"
			: tone === "danger"
				? "bg-red-50 text-red-600 border-red-200/50"
				: "bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)] border-[var(--dashboard-border)]";
	return (
		<div className="flex justify-center my-2">
			<span
				className={`text-[10.5px] font-extrabold px-3 py-1 rounded-full border flex items-center gap-1.5 ${cls}`}
			>
				{icon}
				{text}
			</span>
		</div>
	);
}

export function SystemCard({
	message,
	threadId,
	ticketId,
	side,
}: {
	message: Message;
	threadId: string;
	ticketId: string;
	side: ChatSide;
}) {
	const [expanded, setExpanded] = useState(false);
	const meta = message.metadata;

	switch (meta?.kind) {
		case "invoice_issued":
			return meta.invoiceId ? (
				<InvoiceCard
					invoiceId={meta.invoiceId}
					bookingId={message.bookingId}
					threadId={threadId}
					ticketId={ticketId}
					side={side}
				/>
			) : null;

		case "booking_confirmed":
			return (
				<Notice
					tone="success"
					icon={<CalendarCheck size={11} className="stroke-[3]" />}
					text={message.content}
				/>
			);

		case "invoice_rejected":
		case "invoice_voided":
			return <Notice icon={<FileText size={11} />} text={message.content} />;

		case "payment_received":
			return (
				<Notice
					tone="success"
					icon={<Wallet size={11} className="stroke-[2.5]" />}
					text={message.content}
				/>
			);

		case "ticket_cancelled":
			return (
				<Notice
					tone="danger"
					icon={<Ban size={11} className="stroke-[2.5]" />}
					text={message.content}
				/>
			);

		case "intake_summary": {
			// Provider-facing collapsible brief; customers just see a passive note.
			const summary = meta.intakeSummary;
			if (side !== "provider" || !summary) {
				return <Notice icon={<Info size={11} />} text={message.content} />;
			}
			return (
				<div className="my-2 mx-auto w-full max-w-sm rounded-xl bg-[var(--dashboard-orange-light)] border border-[var(--dashboard-orange-mid)]/30 overflow-hidden">
					<button
						type="button"
						onClick={() => setExpanded((v) => !v)}
						className="w-full flex items-center justify-between px-3.5 py-2.5 text-[11.5px] font-extrabold text-[var(--dashboard-orange)]"
					>
						<span className="flex items-center gap-1.5">
							<Info size={12} /> Intake summary
						</span>
						<ChevronDown
							size={14}
							className={
								expanded
									? "rotate-180 transition-transform"
									: "transition-transform"
							}
						/>
					</button>
					{expanded && (
						<dl className="px-3.5 pb-3 space-y-1 text-[11px]">
							{summary.serviceType && (
								<Row label="Service" value={summary.serviceType} />
							)}
							{summary.description && (
								<Row label="Details" value={summary.description} />
							)}
							{summary.location && (
								<Row label="Location" value={summary.location} />
							)}
							{summary.preferredTime && (
								<Row label="Preferred" value={summary.preferredTime} />
							)}
							{summary.urgency && (
								<Row label="Urgency" value={summary.urgency} />
							)}
						</dl>
					)}
				</div>
			);
		}

		default:
			return <Notice icon={<Info size={11} />} text={message.content} />;
	}
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex gap-2">
			<dt className="font-bold text-[var(--dashboard-muted)] shrink-0 w-16">
				{label}
			</dt>
			<dd className="text-[var(--dashboard-text)]">{value}</dd>
		</div>
	);
}
