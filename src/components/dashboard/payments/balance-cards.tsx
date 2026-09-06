import {
	AlertCircle,
	ArrowUpRight,
	Banknote,
	Lock,
	Plus,
	ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { formatNaira, parseMoney } from "#/core/helpers/money.helper";
import { useAppSelector } from "#/core/hooks/useStore.hook";
import { useGetWalletQuery } from "#/core/queries/wallet.q";
import { FundWalletDialog } from "./fund-wallet-dialog";
import { WithdrawDialog } from "./withdraw-dialog";

export function BalanceCards() {
	const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
	const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

	const isProvider =
		useAppSelector((s) => s.authStore.user?.userType) === "provider";

	const { data: wallet } = useGetWalletQuery();
	const balance = parseMoney(wallet?.balance);
	const escrowBalance = parseMoney(wallet?.escrowBalance);
	const heldPayments = wallet?.heldPayments ?? [];

	return (
		<>
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
								{isProvider
									? "Withdrawable earnings from completed jobs"
									: "Withdrawable funds instantly available to hire artisans"}
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
								{isProvider
									? "Your pending earnings — held safely while the job is active, paid out to you once the customer confirms it's done."
									: "Held safely in neutral escrow while the job is active. Released once you confirm the job is done."}
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

			<FundWalletDialog
				open={isFundingModalOpen}
				onClose={() => setIsFundingModalOpen(false)}
			/>
			<WithdrawDialog
				open={isWithdrawModalOpen}
				onClose={() => setIsWithdrawModalOpen(false)}
			/>
		</>
	);
}
