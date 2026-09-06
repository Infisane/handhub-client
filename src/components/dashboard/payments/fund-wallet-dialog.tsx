import { Plus } from "lucide-react";
import { useState } from "react";
import { AppButton } from "#/components/ui/app-button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import { formatAmountInput } from "#/core/helpers/money.helper";
import { useInitiateWalletTopupQuery } from "#/core/queries/wallet.q";

export function FundWalletDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const [amount, setAmount] = useState("");

	const handleClose = () => {
		setAmount("");
		onClose();
	};

	const topupMutation = useInitiateWalletTopupQuery({
		onSuccessCallback: (transaction) => {
			sessionStorage.setItem(
				"handhub_wallet_topup",
				JSON.stringify({ reference: transaction.reference }),
			);
			window.location.href = transaction.paymentUrl;
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const parsed = Number.parseFloat(amount);
		if (Number.isNaN(parsed) || parsed <= 0) return;
		topupMutation.mutate({
			amount: parsed,
			callbackUrl: `${window.location.origin}/dashboard/wallet-callback`,
		});
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="max-w-md">
				<DialogHeader className="p-6 pb-2 border-b border-[var(--dashboard-border)]">
					<DialogTitle className="font-syne font-extrabold text-[18px] text-[var(--dashboard-text)] leading-none flex items-center gap-2">
						<Plus size={18} className="text-[var(--dashboard-orange)]" />
						Fund Digital Wallet
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="p-6 space-y-5">
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
								type="text"
								inputMode="numeric"
								required
								value={formatAmountInput(amount)}
								onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
								placeholder="50,000"
								className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] font-syne font-black text-[16px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
							/>
						</div>
						<p className="text-[10px] text-[var(--dashboard-muted)] font-medium">
							You'll be redirected to complete payment securely, then brought
							back here.
						</p>
					</div>

					<div className="flex gap-2.5 pt-3">
						<button
							type="button"
							onClick={handleClose}
							className="flex-1 py-2.5 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
						>
							Cancel
						</button>
						<AppButton
							type="submit"
							className="flex-1"
							disabled={!amount || Number.parseFloat(amount) <= 0}
							isLoading={topupMutation.isPending}
							loadingText="Processing…"
						>
							Continue to Payment
						</AppButton>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
