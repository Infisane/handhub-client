import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { formatNaira } from "#/core/helpers/money.helper";
import { useCreateInvoiceQuery } from "#/core/queries/ticket.q";
import { InvoiceSchema } from "#/core/schemas/invoice.schema";
import type { InvoiceLineItem } from "#/core/types/chat.types";
import { cn } from "#/lib/utils.ts";

interface DraftItem {
	description: string;
	quantity: string;
	unitPrice: string;
}

const EMPTY_ITEM: DraftItem = { description: "", quantity: "1", unitPrice: "" };
const inputCls =
	"w-full px-3 py-2 rounded-lg bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] focus:ring-1 focus:ring-[var(--dashboard-orange)]/15 transition-all";

export function InvoiceComposer({
	ticketId,
	threadId,
	onClose,
}: {
	ticketId: string;
	threadId: string;
	onClose: () => void;
}) {
	const [description, setDescription] = useState("");
	const [items, setItems] = useState<DraftItem[]>([{ ...EMPTY_ITEM }]);
	const [error, setError] = useState<string | null>(null);

	const { mutate, isPending } = useCreateInvoiceQuery({
		ticketId,
		threadId,
		onSuccessCallback: () => onClose(),
	});

	const total = items.reduce((sum, it) => {
		const q = Number.parseFloat(it.quantity) || 0;
		const p = Number.parseFloat(it.unitPrice) || 0;
		return sum + q * p;
	}, 0);

	const updateItem = (index: number, patch: Partial<DraftItem>) =>
		setItems((prev) =>
			prev.map((it, i) => (i === index ? { ...it, ...patch } : it)),
		);

	const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
	const removeItem = (index: number) =>
		setItems((prev) => prev.filter((_, i) => i !== index));

	const handleSubmit = () => {
		const lineItems: InvoiceLineItem[] = items.map((it) => ({
			description: it.description.trim(),
			quantity: Number.parseFloat(it.quantity),
			unitPrice: Number.parseFloat(it.unitPrice),
		}));
		const parsed = InvoiceSchema.safeParse({ description, lineItems });
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Check the invoice details");
			return;
		}
		setError(null);
		mutate(parsed.data);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
			<div className="w-full sm:max-w-md bg-[var(--dashboard-card)] rounded-t-2xl sm:rounded-2xl border border-[var(--dashboard-border)] shadow-2xl max-h-[90vh] flex flex-col">
				<div className="flex items-center justify-between p-4 border-b border-[var(--dashboard-border)]">
					<h3 className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)]">
						New Invoice
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1.5 rounded-full hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)]"
						aria-label="Close"
					>
						<X size={16} />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
					<label className="block space-y-1.5">
						<span className="text-[11.5px] font-bold text-[var(--dashboard-muted)]">
							Description
						</span>
						<input
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="e.g. Pipe repair"
							className={inputCls}
						/>
					</label>

					<div className="space-y-2.5">
						<span className="text-[11.5px] font-bold text-[var(--dashboard-muted)]">
							Line items
						</span>
						{items.map((item, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: draft rows have no stable id
								key={index}
								className="rounded-xl border border-[var(--dashboard-border)] p-2.5 space-y-2 bg-[var(--dashboard-bg)]/40"
							>
								<div className="flex gap-2">
									<input
										value={item.description}
										onChange={(e) =>
											updateItem(index, { description: e.target.value })
										}
										placeholder="Item"
										className={inputCls}
									/>
									{items.length > 1 && (
										<button
											type="button"
											onClick={() => removeItem(index)}
											className="p-2 rounded-lg text-[var(--dashboard-muted)] hover:text-red-500 hover:bg-red-50 shrink-0"
											aria-label="Remove item"
										>
											<Trash2 size={14} />
										</button>
									)}
								</div>
								<div className="flex gap-2">
									<div className="flex-1">
										<span className="text-[10px] text-[var(--dashboard-muted)] font-bold">
											Qty
										</span>
										<input
											type="number"
											min={1}
											value={item.quantity}
											onChange={(e) =>
												updateItem(index, { quantity: e.target.value })
											}
											className={inputCls}
										/>
									</div>
									<div className="flex-[2]">
										<span className="text-[10px] text-[var(--dashboard-muted)] font-bold">
											Unit price (₦)
										</span>
										<input
											type="number"
											min={0}
											value={item.unitPrice}
											onChange={(e) =>
												updateItem(index, { unitPrice: e.target.value })
											}
											placeholder="0"
											className={inputCls}
										/>
									</div>
								</div>
							</div>
						))}

						<button
							type="button"
							onClick={addItem}
							className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[var(--dashboard-border)] text-[11.5px] font-bold text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange)] hover:text-[var(--dashboard-orange)] transition-colors"
						>
							<Plus size={13} /> Add item
						</button>
					</div>

					{error && (
						<p className="text-[11.5px] text-red-500 font-medium">{error}</p>
					)}
				</div>

				<div className="p-4 border-t border-[var(--dashboard-border)] flex items-center justify-between gap-3">
					<div>
						<div className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">
							Total
						</div>
						<div className="font-syne font-extrabold text-[16px] text-[var(--dashboard-text)]">
							{formatNaira(total)}
						</div>
					</div>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={isPending}
						className={cn(
							"px-5 py-2.5 rounded-xl bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white font-extrabold text-[12.5px] shadow-md shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50",
						)}
					>
						{isPending ? "Sending…" : "Send Invoice"}
					</button>
				</div>
			</div>
		</div>
	);
}
