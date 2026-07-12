import { Check, FileText, X, Zap } from "lucide-react";
import type { ChatSide } from "#/core/helpers/chat-phase.helper";
import { formatNaira } from "#/core/helpers/money.helper";
import {
	useAcceptInvoiceQuery,
	useGetInvoiceQuery,
	useRejectInvoiceQuery,
	useVoidInvoiceQuery,
} from "#/core/queries/invoice.q";
import type { InvoiceStatus } from "#/core/types/chat.types";
import { cn } from "#/lib/utils.ts";

const STATUS_PILL: Record<InvoiceStatus, { label: string; cls: string }> = {
	pending: {
		label: "Pending",
		cls: "bg-amber-50 text-amber-700 border-amber-200/50",
	},
	accepted: {
		label: "Accepted ✓",
		cls: "bg-green-50 text-green-700 border-green-200/50",
	},
	paid: {
		label: "Paid ✓",
		cls: "bg-green-50 text-green-700 border-green-200/50",
	},
	rejected: {
		label: "Declined",
		cls: "bg-neutral-100 text-neutral-500 border-neutral-200",
	},
	voided: {
		label: "Recalled",
		cls: "bg-neutral-100 text-neutral-500 border-neutral-200",
	},
};

export function InvoiceCard({
	invoiceId,
	threadId,
	ticketId,
	side,
}: {
	invoiceId: string;
	threadId: string;
	ticketId: string;
	side: ChatSide;
}) {
	const { data: invoice, isLoading } = useGetInvoiceQuery(invoiceId);

	const accept = useAcceptInvoiceQuery({ threadId, ticketId, invoiceId });
	const reject = useRejectInvoiceQuery({ threadId, ticketId, invoiceId });
	const voidInvoice = useVoidInvoiceQuery({ threadId, ticketId, invoiceId });

	const busy = accept.isPending || reject.isPending || voidInvoice.isPending;

	if (isLoading || !invoice) {
		return (
			<div className="my-2 mx-auto max-w-sm h-28 rounded-2xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] animate-pulse" />
		);
	}

	const isPending = invoice.status === "pending";
	const showCustomerActions = isPending && side === "initiator";
	const showProviderActions = isPending && side === "provider";
	const pill = STATUS_PILL[invoice.status];

	return (
		<div className="my-2 mx-auto w-full max-w-sm rounded-2xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] shadow-xs p-4 space-y-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[var(--dashboard-orange)] bg-[var(--dashboard-orange-light)] px-2.5 py-1 rounded-lg">
					<FileText size={11} /> {invoice.invoiceRef}
				</div>
				<span
					className={cn(
						"text-[10.5px] font-extrabold px-2.5 py-1 rounded-full border",
						pill.cls,
					)}
				>
					{pill.label}
				</span>
			</div>

			<div>
				<h4 className="font-syne font-extrabold text-[14px] text-[var(--dashboard-text)] leading-tight">
					{invoice.description}
				</h4>
				<ul className="mt-2 space-y-1">
					{invoice.lineItems.map((item, i) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: line items have no stable id
							key={`${item.description}-${i}`}
							className="flex items-center justify-between text-[11.5px] text-[var(--dashboard-muted)]"
						>
							<span className="truncate">
								{item.description}
								<span className="opacity-60"> × {item.quantity}</span>
							</span>
							<span className="font-semibold text-[var(--dashboard-text)] shrink-0">
								{formatNaira(item.unitPrice * item.quantity)}
							</span>
						</li>
					))}
				</ul>
			</div>

			<div className="flex items-center justify-between border-t border-[var(--dashboard-border)] pt-3">
				<div>
					<div className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">
						Total
					</div>
					<div className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)]">
						{formatNaira(invoice.totalAmount)}
					</div>
				</div>

				{showCustomerActions && (
					<div className="flex gap-2">
						<button
							type="button"
							disabled={busy}
							onClick={() => reject.mutate()}
							className="px-3 py-2 rounded-xl border border-[var(--dashboard-border)] text-[11.5px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] disabled:opacity-50 transition-colors flex items-center gap-1"
						>
							<X size={12} className="stroke-[3]" /> Decline
						</button>
						<button
							type="button"
							disabled={busy}
							onClick={() => accept.mutate()}
							className="px-4 py-2 rounded-xl bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white font-extrabold text-[11.5px] shadow-md shadow-blue-500/10 flex items-center gap-1 active:scale-95 disabled:opacity-50 transition-all"
						>
							<Check size={12} className="stroke-[3.5]" /> Accept
						</button>
					</div>
				)}

				{showProviderActions && (
					<button
						type="button"
						disabled={busy}
						onClick={() => voidInvoice.mutate()}
						className="px-3.5 py-2 rounded-xl border border-[var(--dashboard-border)] text-[11.5px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] disabled:opacity-50 transition-colors flex items-center gap-1"
					>
						<Zap size={11} className="stroke-[2.5]" /> Recall
					</button>
				)}
			</div>
		</div>
	);
}
