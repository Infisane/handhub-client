import { ShieldCheck } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import { formatNaira } from "#/core/helpers/money.helper";
import type { WalletTransaction } from "#/core/types/chat.types";
import { formatDateTime, initialsOf } from "./shared";

export function TransactionReceiptDialog({
	transaction,
	onClose,
}: {
	transaction: WalletTransaction | null;
	onClose: () => void;
}) {
	return (
		<Dialog
			open={transaction !== null}
			onOpenChange={(open) => !open && onClose()}
		>
			{transaction && (
				<DialogContent className="max-w-md">
					<DialogHeader className="p-6 pb-2 border-b border-[var(--dashboard-border)]">
						<DialogTitle className="font-syne font-extrabold text-[17px] text-[var(--dashboard-text)] leading-none">
							Transaction Receipt
						</DialogTitle>
					</DialogHeader>
					<div className="p-6 space-y-6">
						<div className="text-center space-y-2">
							<div className="w-11 h-11 rounded-full bg-[var(--dashboard-orange-light)] flex items-center justify-center mx-auto text-[var(--dashboard-orange)] shadow-xs">
								<ShieldCheck size={22} className="stroke-[2.5]" />
							</div>
							<div>
								<h4 className="text-[12.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">
									Statement Amount
								</h4>
								<div className="font-syne font-black text-[26px] sm:text-[30px] text-[var(--dashboard-text)] mt-0.5">
									{transaction.type === "credit" ? "+" : "-"}
									{formatNaira(transaction.amount)}
								</div>
							</div>
						</div>

						<div className="border border-[var(--dashboard-border)] rounded-2xl p-4.5 space-y-3.5 bg-[var(--dashboard-bg)]/40">
							<div className="flex justify-between items-start gap-2 text-[12px]">
								<span className="text-[var(--dashboard-muted)] font-bold">
									Transaction Name
								</span>
								<span className="text-[var(--dashboard-text)] font-extrabold text-right max-w-[200px]">
									{transaction.description}
								</span>
							</div>

							<div className="flex justify-between items-center text-[12px]">
								<span className="text-[var(--dashboard-muted)] font-bold">
									Statement Date
								</span>
								<span className="text-[var(--dashboard-text)] font-extrabold text-right">
									{formatDateTime(transaction.createdAt).date} at{" "}
									{formatDateTime(transaction.createdAt).time}
								</span>
							</div>

							<div className="flex justify-between items-center text-[12px]">
								<span className="text-[var(--dashboard-muted)] font-bold">
									Statement Reference
								</span>
								<span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold text-right uppercase">
									{transaction.reference}
								</span>
							</div>

							{transaction.ticketId && (
								<div className="flex justify-between items-center text-[12px]">
									<span className="text-[var(--dashboard-muted)] font-bold">
										Associated Ticket
									</span>
									<span className="font-extrabold text-[var(--dashboard-orange)] text-right">
										{transaction.ticketId}
									</span>
								</div>
							)}

							{transaction.artisanName && (
								<div className="flex justify-between items-center text-[12px] border-t border-[var(--dashboard-border)]/50 pt-3 mt-1">
									<span className="text-[var(--dashboard-muted)] font-bold">
										Artisan Partner
									</span>
									<div className="flex items-center gap-2">
										{transaction.avatar ? (
											<img
												src={transaction.avatar}
												alt={transaction.artisanName}
												className="w-5 h-5 rounded-full object-cover shrink-0"
											/>
										) : (
											<div className="w-5 h-5 rounded-full bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] flex items-center justify-center text-[8.5px] font-black shrink-0">
												{initialsOf(transaction.artisanName)}
											</div>
										)}
										<span className="text-[var(--dashboard-text)] font-extrabold text-right">
											{transaction.artisanName}
										</span>
									</div>
								</div>
							)}
						</div>

						<div className="flex flex-col gap-2.5">
							<div className="flex items-center gap-2 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-900/10 p-3 rounded-xl text-[11px] font-medium text-blue-700 dark:text-blue-400 leading-normal">
								<ShieldCheck size={16} className="shrink-0 text-blue-500" />
								<span>
									This transaction statement is protected by handhub escrow keys
									and fully settled.
								</span>
							</div>

							<button
								type="button"
								onClick={onClose}
								className="w-full py-2.5 bg-[var(--dashboard-text)] hover:bg-neutral-800 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors shadow-md"
							>
								Dismiss Receipt
							</button>
						</div>
					</div>
				</DialogContent>
			)}
		</Dialog>
	);
}
