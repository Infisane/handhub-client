import { motion } from "framer-motion";
import { ChevronRight, CreditCard, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { formatNaira } from "#/core/helpers/money.helper";
import { useGetWalletTransactionsQuery } from "#/core/queries/wallet.q";
import type { WalletTransaction } from "#/core/types/chat.types";
import { cn } from "#/lib/utils.ts";
import { formatDateTime, TABS, type Tab, txConfig } from "./shared";
import { TransactionReceiptDialog } from "./transaction-receipt-dialog";

const containerVariants = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
	hidden: { opacity: 0, y: 12 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: "spring" as const, stiffness: 120, damping: 18 },
	},
};

export function TransactionHistory() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<Tab>("all");
	const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);

	const { data: txResponse, isLoading } = useGetWalletTransactionsQuery({
		category: activeTab === "all" ? undefined : activeTab,
		limit: 50,
	});
	const transactions = txResponse?.data ?? [];

	// Search-only filtering — the category tabs already filter server-side.
	const filteredTransactions = useMemo(() => {
		if (!searchQuery.trim()) return transactions;
		const q = searchQuery.toLowerCase();
		return transactions.filter(
			(tx) =>
				tx.description.toLowerCase().includes(q) ||
				tx.reference.toLowerCase().includes(q) ||
				tx.artisanName?.toLowerCase().includes(q),
		);
	}, [transactions, searchQuery]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<h3 className="font-syne font-extrabold text-[15px] sm:text-[17px] text-[var(--dashboard-text)] leading-none mb-1">
						Transaction History
					</h3>
					<p className="text-[11.5px] text-[var(--dashboard-muted)] font-medium">
						Verify wallet statements, direct settlements, and refunds
					</p>
				</div>

				{/* Transaction searching & filters */}
				<div className="flex items-center gap-2 max-w-sm w-full sm:w-60 relative self-end shrink-0">
					<Search
						size={13}
						className="absolute left-3 text-[var(--dashboard-muted)] pointer-events-none"
					/>
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search transaction, ref..."
						className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] transition-colors shadow-xs"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="absolute right-2 text-[var(--dashboard-muted)] hover:text-[var(--dashboard-orange)]"
						>
							<X size={12} className="stroke-[3.5]" />
						</button>
					)}
				</div>
			</div>

			{/* Category Tabs row */}
			<div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5 border-b border-[var(--dashboard-border)]/40">
				{TABS.map((tab) => (
					<button
						key={tab}
						type="button"
						onClick={() => setActiveTab(tab)}
						className={cn(
							"px-3.5 py-1.5 rounded-t-xl text-[12px] font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0",
							activeTab === tab
								? "border-[var(--dashboard-orange)] text-[var(--dashboard-orange)] bg-[var(--dashboard-orange-light)]/10"
								: "border-transparent text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)]",
						)}
					>
						<span className="capitalize">
							{tab === "all" ? "All Logs" : `${tab}s`}
						</span>
					</button>
				))}
			</div>

			{/* Transactions Table/List Panel */}
			<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl overflow-hidden shadow-xs">
				{isLoading ? (
					<div className="p-4 space-y-3">
						{["s1", "s2", "s3"].map((key) => (
							<div
								key={key}
								className="h-14 rounded-xl bg-[var(--dashboard-bg)] animate-pulse"
							/>
						))}
					</div>
				) : filteredTransactions.length === 0 ? (
					<div className="text-center py-12 text-[var(--dashboard-muted)] space-y-2">
						<CreditCard className="mx-auto size-7 opacity-35" />
						<p className="text-[12px] font-bold">
							No transaction records found
						</p>
					</div>
				) : (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="show"
						className="divide-y divide-[var(--dashboard-border)]/50"
					>
						{filteredTransactions.map((tx) => {
							const isCredit = tx.type === "credit";
							const config = txConfig[tx.category];
							const IconComponent = config.icon;
							const { date, time } = formatDateTime(tx.createdAt);

							return (
								<motion.button
									key={tx.id}
									variants={itemVariants}
									onClick={() => setSelectedTx(tx)}
									className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--dashboard-bg)]/60 transition-all cursor-pointer outline-none gap-3"
								>
									<div className="flex items-center gap-3 min-w-0">
										<div
											className={cn(
												"w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
												config.bg,
											)}
										>
											<IconComponent size={15} className={config.color} />
										</div>

										<div className="min-w-0">
											<h4 className="text-[13px] font-extrabold text-[var(--dashboard-text)] leading-tight truncate mb-1">
												{tx.description}
											</h4>
											<div className="flex items-center gap-2 text-[10.5px] text-[var(--dashboard-muted)] font-medium shrink-0 flex-wrap">
												<span>
													{date} at {time}
												</span>
												<span>·</span>
												<span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold">
													{tx.reference}
												</span>
											</div>
										</div>
									</div>

									<div className="text-right shrink-0 flex items-center gap-4">
										<div className="flex items-center gap-1 text-right">
											<span
												className={cn(
													"font-syne font-black text-[14.5px] sm:text-[15.5px] tracking-tight",
													isCredit
														? "text-green-600 dark:text-green-400"
														: "text-[var(--dashboard-text)]",
												)}
											>
												{isCredit ? "+" : "-"}
												{formatNaira(tx.amount)}
											</span>
											<ChevronRight
												size={14}
												className="text-[var(--dashboard-muted)]"
											/>
										</div>
									</div>
								</motion.button>
							);
						})}
					</motion.div>
				)}
			</div>

			<TransactionReceiptDialog
				transaction={selectedTx}
				onClose={() => setSelectedTx(null)}
			/>
		</div>
	);
}
