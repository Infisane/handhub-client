import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	AlertCircle,
	ArrowDownLeft,
	ArrowUpRight,
	Banknote,
	ChevronRight,
	CreditCard,
	Lock,
	Plus,
	Search,
	ShieldCheck,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import { formatNaira, parseMoney } from "#/core/helpers/money.helper";
import { useAppDispatch } from "#/core/hooks/useStore.hook";
import {
	useDepositWalletQuery,
	useGetWalletQuery,
	useGetWalletTransactionsQuery,
	useWithdrawWalletQuery,
} from "#/core/queries/wallet.q";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";
import type { TxCategory, WalletTransaction } from "#/core/types/chat.types";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/payments")({
	component: PaymentsPage,
});

/* ── Category display config ──────────────────────────────────── */
const txConfig: Record<
	TxCategory,
	{ label: string; icon: typeof ArrowDownLeft; color: string; bg: string }
> = {
	deposit: {
		label: "Deposit",
		icon: ArrowDownLeft,
		color: "text-green-600 dark:text-green-400",
		bg: "bg-green-50 dark:bg-green-500/10",
	},
	withdrawal: {
		label: "Withdrawal",
		icon: ArrowUpRight,
		color: "text-neutral-700 dark:text-neutral-300",
		bg: "bg-neutral-100 dark:bg-neutral-800",
	},
	payment: {
		label: "Payment",
		icon: ArrowUpRight,
		color: "text-neutral-700 dark:text-neutral-300",
		bg: "bg-neutral-100 dark:bg-neutral-800",
	},
	release: {
		label: "Escrow Released",
		icon: Lock,
		color: "text-blue-600 dark:text-blue-400",
		bg: "bg-blue-50 dark:bg-blue-500/10",
	},
	refund: {
		label: "Refund",
		icon: ArrowDownLeft,
		color: "text-blue-600 dark:text-blue-400",
		bg: "bg-blue-50 dark:bg-blue-500/10",
	},
	clawback: {
		label: "Clawback",
		icon: AlertCircle,
		color: "text-red-600 dark:text-red-400",
		bg: "bg-red-50 dark:bg-red-500/10",
	},
};

const TABS = ["all", "deposit", "payment", "withdrawal", "refund"] as const;
type Tab = (typeof TABS)[number];

function formatDateTime(iso: string) {
	const d = new Date(iso);
	return {
		date: d.toLocaleDateString([], {
			month: "short",
			day: "numeric",
			year: "numeric",
		}),
		time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
	};
}

function initialsOf(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join("");
}

/* ── Main Component ────────────────────────────────────────── */
function PaymentsPage() {
	const dispatch = useAppDispatch();

	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<Tab>("all");

	const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
	const [fundingAmount, setFundingAmount] = useState("");

	const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
	const [withdrawAmount, setWithdrawAmount] = useState("");

	const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);

	const { data: wallet } = useGetWalletQuery();
	const balance = parseMoney(wallet?.balance);
	const escrowBalance = parseMoney(wallet?.escrowBalance);
	const heldPayments = wallet?.heldPayments ?? [];

	const { data: txResponse, isLoading: txLoading } =
		useGetWalletTransactionsQuery({
			category: activeTab === "all" ? undefined : activeTab,
			limit: 50,
		});
	const transactions = txResponse?.data ?? [];

	const depositMutation = useDepositWalletQuery({
		onSuccessCallback: () => {
			setIsFundingModalOpen(false);
			setFundingAmount("");
		},
	});
	const withdrawMutation = useWithdrawWalletQuery({
		onSuccessCallback: () => {
			setIsWithdrawModalOpen(false);
			setWithdrawAmount("");
		},
	});

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

	const handleFundWallet = (e: React.FormEvent) => {
		e.preventDefault();
		const amount = Number.parseFloat(fundingAmount);
		if (Number.isNaN(amount) || amount <= 0) return;
		depositMutation.mutate(amount);
	};

	const handleWithdrawWallet = (e: React.FormEvent) => {
		e.preventDefault();
		const amount = Number.parseFloat(withdrawAmount);
		if (Number.isNaN(amount) || amount <= 0 || amount > balance) return;
		withdrawMutation.mutate(amount);
	};

	// Layout animations
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

	return (
		<main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--dashboard-bg)]">
			{/* ── Top Bar Header & Page Title ───────────────────────────────────────── */}
			<div className="shrink-0 bg-[var(--dashboard-bg)] px-5 sm:px-8 pt-5 sm:pt-7 pb-4 space-y-4 border-b border-[var(--dashboard-border)]">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() =>
								dispatch(set_dashboard_flags({ isMobileSidebarOpen: true }))
							}
							className="md:hidden w-9 h-9 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text)] hover:bg-[var(--dashboard-orange-light)] transition-all shrink-0 shadow-xs"
							aria-label="Open navigation"
						>
							<Plus size={16} className="rotate-45" />
						</button>
						<div>
							<h2 className="font-syne font-extrabold text-[22px] sm:text-[26px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1.5 flex items-center gap-2">
								Payments &amp; Escrow
							</h2>
							<p className="text-[12px] text-[var(--dashboard-muted)] font-medium">
								Secure wallet infrastructure and active escrow fund tracking
							</p>
						</div>
					</div>
				</div>

				{/* ── Balance Cards ──────────────────────────────────────────────────── */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Card 1: Wallet Balance */}
					<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 relative overflow-hidden shadow-xs group flex flex-col justify-between">
						<div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300" />
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider flex items-center gap-1.5">
									<Banknote
										size={13}
										className="text-[var(--dashboard-orange)]"
									/>
									Available Balance
								</span>
							</div>
							<div>
								<div className="font-syne font-black text-[28px] sm:text-[32px] text-[var(--dashboard-text)] tracking-tight leading-none">
									{formatNaira(balance)}
								</div>
								<p className="text-[11px] text-[var(--dashboard-muted)] mt-1.5 font-medium">
									Withdrawable funds instantly available to hire artisans
								</p>
							</div>
						</div>
						<div className="flex gap-2 mt-5">
							<button
								type="button"
								onClick={() => setIsFundingModalOpen(true)}
								className="flex-1 py-2 px-3 bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 transition-all active:scale-95"
							>
								<Plus size={14} className="stroke-[3]" /> Fund Wallet
							</button>
							<button
								type="button"
								onClick={() => setIsWithdrawModalOpen(true)}
								className="flex-1 py-2 px-3 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
							>
								<ArrowUpRight size={14} /> Withdraw
							</button>
						</div>
					</div>

					{/* Card 2: Escrow Held */}
					<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 relative overflow-hidden shadow-xs group flex flex-col justify-between">
						<div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl transition-all duration-300" />
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider flex items-center gap-1.5">
									<Lock size={13} className="text-blue-500" />
									Funds in Escrow
								</span>
								<div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-blue-200/50 flex items-center gap-1 shrink-0">
									<ShieldCheck size={10} className="stroke-[2.5]" /> Secure
								</div>
							</div>
							<div>
								<div className="font-syne font-black text-[28px] sm:text-[32px] text-blue-600 dark:text-blue-400 tracking-tight leading-none">
									{formatNaira(escrowBalance)}
								</div>
								<p className="text-[11px] text-[var(--dashboard-muted)] mt-1.5 font-medium leading-relaxed">
									Held safely in neutral escrow during active tickets. Released
									only upon your approval.
								</p>
							</div>
						</div>
						<div className="mt-5 flex items-center gap-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-900/10 p-2.5 rounded-xl">
							<AlertCircle size={14} className="shrink-0" />
							<span>
								{heldPayments.length > 0
									? `Active: ${heldPayments[0].serviceTitle}${heldPayments.length > 1 ? ` +${heldPayments.length - 1} more` : ""}`
									: "No funds currently held in escrow"}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* ── Main Panel ────────────────────────────────────────────────────── */}
			<div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-7 scrollbar-none pb-24 sm:pb-8">
				{/* ── Escrow Explainer ──────────────────────────────────────────── */}
				<div className="space-y-4">
					<div>
						<h3 className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)] flex items-center gap-1.5">
							<ShieldCheck size={16} className="text-blue-500" />
							How Handhub Escrow Protects You
						</h3>
						<p className="text-[11.5px] text-[var(--dashboard-muted)] mt-0.5">
							Escrow transactions safeguard your payments against low quality
							work or abandonment
						</p>
					</div>

					<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 space-y-4 shadow-xs relative">
						{/* Step timeline lines */}
						<div className="absolute top-[42px] bottom-[42px] left-[27px] w-[2px] bg-[var(--dashboard-border)] pointer-events-none" />

						<div className="flex gap-4 relative">
							<div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-400 flex items-center justify-center font-extrabold text-[10px] shrink-0 z-10 shadow-sm">
								1
							</div>
							<div className="min-w-0 flex-1">
								<h4 className="text-[12.5px] font-extrabold text-[var(--dashboard-text)] leading-none mb-1">
									Authorize &amp; Lock Funds
								</h4>
								<p className="text-[11px] text-[var(--dashboard-muted)] leading-relaxed">
									When a quote proposal is approved, handhub locks the exact
									project cost. Funds are taken from your balance but **not yet
									sent** to the artisan.
								</p>
							</div>
						</div>

						<div className="flex gap-4 relative">
							<div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-400 flex items-center justify-center font-extrabold text-[10px] shrink-0 z-10 shadow-sm">
								2
							</div>
							<div className="min-w-0 flex-1">
								<h4 className="text-[12.5px] font-extrabold text-[var(--dashboard-text)] leading-none mb-1">
									Artisan executes work
								</h4>
								<p className="text-[11px] text-[var(--dashboard-muted)] leading-relaxed">
									Technician executes the repair knowing their service payment
									is completely verified and locked in handhub. Security for
									both parties is guaranteed.
								</p>
							</div>
						</div>

						<div className="flex gap-4 relative">
							<div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-2 border-green-400 flex items-center justify-center font-extrabold text-[10px] shrink-0 z-10 shadow-sm animate-pulse">
								3
							</div>
							<div className="min-w-0 flex-1">
								<h4 className="text-[12.5px] font-extrabold text-[var(--dashboard-text)] leading-none mb-1 flex items-center gap-1.5">
									Inspect &amp; Release
								</h4>
								<p className="text-[11px] text-[var(--dashboard-muted)] leading-relaxed">
									Once satisfied with the repair, tap **Approve &amp; Pay** on
									your dashboard to instantly release funds directly to the
									expert. Handhub handles all security keys.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* ── Transaction History Block ────────────────────────────────────────── */}
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
						{txLoading ? (
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
				</div>
			</div>

			{/* ── dialog modals segment ─────────────────────────────────────── */}

			{/* Modal A: Fund Wallet Modal */}
			<Dialog open={isFundingModalOpen} onOpenChange={setIsFundingModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader className="p-6 pb-2 border-b border-[var(--dashboard-border)]">
						<DialogTitle className="font-syne font-extrabold text-[18px] text-[var(--dashboard-text)] leading-none flex items-center gap-2">
							<Plus size={18} className="text-[var(--dashboard-orange)]" />
							Fund Digital Wallet
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleFundWallet} className="p-6 space-y-5">
						<div className="space-y-2">
							<label
								htmlFor="fund-amount"
								className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block"
							>
								Specify Deposit Amount (₦)
							</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 font-syne font-extrabold text-[15px] text-[var(--dashboard-muted)]">
									₦
								</span>
								<input
									id="fund-amount"
									type="number"
									required
									value={fundingAmount}
									onChange={(e) => setFundingAmount(e.target.value)}
									placeholder="50,000"
									className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] font-syne font-black text-[16px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
								/>
							</div>
							<p className="text-[10px] text-[var(--dashboard-muted)] font-medium">
								Deposits are secured by Paystack payment gateway. Transaction is
								fully encrypted.
							</p>
						</div>

						<div className="flex gap-2.5 pt-3">
							<button
								type="button"
								onClick={() => setIsFundingModalOpen(false)}
								className="flex-1 py-2.5 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={
									!fundingAmount ||
									Number.parseFloat(fundingAmount) <= 0 ||
									depositMutation.isPending
								}
								className="flex-1 py-2.5 bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								{depositMutation.isPending
									? "Processing…"
									: "Authorize Deposit"}
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Modal B: Withdraw Funds Modal */}
			<Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader className="p-6 pb-2 border-b border-[var(--dashboard-border)]">
						<DialogTitle className="font-syne font-extrabold text-[18px] text-[var(--dashboard-text)] leading-none flex items-center gap-2">
							<ArrowUpRight size={18} className="text-red-500" />
							Withdraw Wallet Funds
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleWithdrawWallet} className="p-6 space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="withdraw-amount"
								className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block"
							>
								Amount to Withdraw (₦)
							</label>
							<div className="relative">
								<span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-syne font-extrabold text-[13.5px] text-[var(--dashboard-muted)]">
									₦
								</span>
								<input
									id="withdraw-amount"
									type="number"
									required
									max={balance}
									value={withdrawAmount}
									onChange={(e) => setWithdrawAmount(e.target.value)}
									placeholder="20,000"
									className="w-full pl-8.5 pr-3 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] font-syne font-black text-[14px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
								/>
							</div>
						</div>

						<p className="text-[10px] text-[var(--dashboard-muted)] font-semibold text-right leading-none">
							Withdrawable:{" "}
							<span className="text-[var(--dashboard-text)] font-extrabold">
								{formatNaira(balance)}
							</span>
						</p>

						<div className="flex gap-2.5 pt-3">
							<button
								type="button"
								onClick={() => setIsWithdrawModalOpen(false)}
								className="flex-1 py-2.5 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={
									!withdrawAmount ||
									Number.parseFloat(withdrawAmount) <= 0 ||
									Number.parseFloat(withdrawAmount) > balance ||
									withdrawMutation.isPending
								}
								className="flex-1 py-2.5 bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								{withdrawMutation.isPending ? "Processing…" : "Request Payout"}
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Modal C: Detailed Receipt Transaction Modal */}
			<Dialog
				open={selectedTx !== null}
				onOpenChange={(open) => !open && setSelectedTx(null)}
			>
				{selectedTx && (
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
										{selectedTx.type === "credit" ? "+" : "-"}
										{formatNaira(selectedTx.amount)}
									</div>
								</div>
							</div>

							<div className="border border-[var(--dashboard-border)] rounded-2xl p-4.5 space-y-3.5 bg-[var(--dashboard-bg)]/40">
								<div className="flex justify-between items-start gap-2 text-[12px]">
									<span className="text-[var(--dashboard-muted)] font-bold">
										Transaction Name
									</span>
									<span className="text-[var(--dashboard-text)] font-extrabold text-right max-w-[200px]">
										{selectedTx.description}
									</span>
								</div>

								<div className="flex justify-between items-center text-[12px]">
									<span className="text-[var(--dashboard-muted)] font-bold">
										Statement Date
									</span>
									<span className="text-[var(--dashboard-text)] font-extrabold text-right">
										{formatDateTime(selectedTx.createdAt).date} at{" "}
										{formatDateTime(selectedTx.createdAt).time}
									</span>
								</div>

								<div className="flex justify-between items-center text-[12px]">
									<span className="text-[var(--dashboard-muted)] font-bold">
										Statement Reference
									</span>
									<span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold text-right uppercase">
										{selectedTx.reference}
									</span>
								</div>

								{selectedTx.ticketId && (
									<div className="flex justify-between items-center text-[12px]">
										<span className="text-[var(--dashboard-muted)] font-bold">
											Associated Ticket
										</span>
										<span className="font-extrabold text-[var(--dashboard-orange)] text-right">
											{selectedTx.ticketId}
										</span>
									</div>
								)}

								{selectedTx.artisanName && (
									<div className="flex justify-between items-center text-[12px] border-t border-[var(--dashboard-border)]/50 pt-3 mt-1">
										<span className="text-[var(--dashboard-muted)] font-bold">
											Artisan Partner
										</span>
										<div className="flex items-center gap-2">
											{selectedTx.avatar ? (
												<img
													src={selectedTx.avatar}
													alt={selectedTx.artisanName}
													className="w-5 h-5 rounded-full object-cover shrink-0"
												/>
											) : (
												<div className="w-5 h-5 rounded-full bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] flex items-center justify-center text-[8.5px] font-black shrink-0">
													{initialsOf(selectedTx.artisanName)}
												</div>
											)}
											<span className="text-[var(--dashboard-text)] font-extrabold text-right">
												{selectedTx.artisanName}
											</span>
										</div>
									</div>
								)}
							</div>

							<div className="flex flex-col gap-2.5">
								<div className="flex items-center gap-2 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-900/10 p-3 rounded-xl text-[11px] font-medium text-blue-700 dark:text-blue-400 leading-normal">
									<ShieldCheck size={16} className="shrink-0 text-blue-500" />
									<span>
										This transaction statement is protected by handhub escrow
										keys and fully settled.
									</span>
								</div>

								<button
									type="button"
									onClick={() => setSelectedTx(null)}
									className="w-full py-2.5 bg-[var(--dashboard-text)] hover:bg-neutral-800 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors shadow-md"
								>
									Dismiss Receipt
								</button>
							</div>
						</div>
					</DialogContent>
				)}
			</Dialog>
		</main>
	);
}
