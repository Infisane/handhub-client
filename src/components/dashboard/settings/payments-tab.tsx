import { motion } from "framer-motion";
import { Sliders, Sparkles } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { SettingsToggle } from "./settings-toggle.tsx";

interface PaymentsTabProps {
	autoFund: boolean;
	setAutoFund: Dispatch<SetStateAction<boolean>>;
	threshold: string;
	setThreshold: Dispatch<SetStateAction<string>>;
	defaultCard: string;
	setDefaultCard: Dispatch<SetStateAction<string>>;
}

export function PaymentsTab({
	autoFund,
	setAutoFund,
	threshold,
	setThreshold,
	defaultCard,
	setDefaultCard,
}: PaymentsTabProps) {
	return (
		<>
			<div>
				<h3 className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)] leading-none mb-1 flex items-center gap-2">
					Billing &amp; Wallet Parameters
				</h3>
				<p className="text-[11px] text-[var(--dashboard-muted)]">
					Define default funding methods and escrow trigger limits
				</p>
			</div>

			{/* Default method select */}
			<div className="space-y-1.5">
				<label className="text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
					Default Funding Source Card
				</label>
				<select
					value={defaultCard}
					onChange={(e) => setDefaultCard(e.target.value)}
					className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] font-semibold outline-none focus:border-[var(--dashboard-orange)]"
				>
					<option value="card-1">Visa Ending in 4821 (Default)</option>
					<option value="card-2">Mastercard Ending in 9012</option>
				</select>
			</div>

			{/* Auto funding configuration */}
			<div className="border border-[var(--dashboard-border)] rounded-2xl p-4.5 space-y-4 bg-[var(--dashboard-card)] shadow-xs">
				<div className="flex items-center justify-between gap-3">
					<div className="flex gap-3 items-center min-w-0">
						<div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[var(--dashboard-orange)] shrink-0">
							<Sparkles size={16} />
						</div>
						<div className="min-w-0">
							<h4 className="text-[13px] font-extrabold text-[var(--dashboard-text)] leading-none mb-1">
								Automatic Wallet Funding
							</h4>
							<p className="text-[10.5px] text-[var(--dashboard-muted)] leading-normal">
								Trigger auto-charge when balance drops below threshold during
								bookings
							</p>
						</div>
					</div>

					<SettingsToggle
						size="md"
						checked={autoFund}
						onChange={() => setAutoFund(!autoFund)}
						aria-label="Toggle automatic wallet funding"
					/>
				</div>

				{autoFund && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						className="space-y-2 border-t border-[var(--dashboard-border)]/40 pt-4"
					>
						<label className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
							Minimum Top-up Trigger Threshold (₦)
						</label>
						<div className="flex gap-3 items-center">
							<Sliders
								size={15}
								className="text-[var(--dashboard-muted)] shrink-0"
							/>
							<input
								type="range"
								min="10000"
								max="100000"
								step="5000"
								value={threshold}
								onChange={(e) => setThreshold(e.target.value)}
								className="flex-1 accent-[var(--dashboard-orange)]"
							/>
							<span className="font-syne font-black text-[13px] text-[var(--dashboard-text)] bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] px-2.5 py-1 rounded-lg shrink-0">
								₦{Number.parseInt(threshold, 10).toLocaleString()}
							</span>
						</div>
					</motion.div>
				)}
			</div>
		</>
	);
}
