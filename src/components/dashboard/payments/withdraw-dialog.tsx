import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppButton } from "#/components/ui/app-button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import {
	formatAmountInput,
	formatNaira,
	parseMoney,
} from "#/core/helpers/money.helper";
import {
	useGetBankAccountQuery,
	useGetBanksQuery,
	useGetWalletQuery,
	useWithdrawWalletQuery,
} from "#/core/queries/wallet.q";
import { BankAccountForm } from "./bank-account-form";

export function WithdrawDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const [amount, setAmount] = useState("");
	const [forceAccountForm, setForceAccountForm] = useState(false);

	const { data: wallet } = useGetWalletQuery();
	const balance = parseMoney(wallet?.balance);

	const { data: bankAccount, isLoading: bankAccountLoading } =
		useGetBankAccountQuery();
	const { data: banks = [] } = useGetBanksQuery();
	const bankName = banks.find((b) => b.code === bankAccount?.bankCode)?.name;

	const showAccountForm =
		!bankAccountLoading && (!bankAccount || forceAccountForm);

	const handleClose = () => {
		setAmount("");
		setForceAccountForm(false);
		onClose();
	};

	const withdrawMutation = useWithdrawWalletQuery({
		onSuccessCallback: () => {
			toast.success("Withdrawal requested — pending admin review");
			handleClose();
		},
	});

	const parsed = Number.parseFloat(amount);
	const invalid = Number.isNaN(parsed) || parsed <= 0 || parsed > balance;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (invalid) return;
		withdrawMutation.mutate(parsed);
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="max-w-md">
				<DialogHeader className="p-6 pb-2 border-b border-[var(--dashboard-border)]">
					<DialogTitle className="font-syne font-extrabold text-[18px] text-[var(--dashboard-text)] leading-none flex items-center gap-2">
						<ArrowUpRight size={18} className="text-red-500" />
						{showAccountForm ? "Add Bank Account" : "Withdraw Wallet Funds"}
					</DialogTitle>
				</DialogHeader>

				{bankAccountLoading ? (
					<div className="p-10 flex justify-center">
						<div className="w-5 h-5 border-2 border-[var(--dashboard-orange)] border-t-transparent rounded-full animate-spin" />
					</div>
				) : showAccountForm ? (
					<BankAccountForm onSaved={() => setForceAccountForm(false)} />
				) : (
					<form onSubmit={handleSubmit} className="p-6 space-y-4">
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
									type="text"
									inputMode="numeric"
									required
									value={formatAmountInput(amount)}
									onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
									placeholder="20,000"
									className="w-full pl-8.5 pr-3 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] font-syne font-black text-[14px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
								/>
							</div>
						</div>

						<div className="flex items-center justify-between text-[10px] font-semibold leading-none">
							<span className="text-[var(--dashboard-muted)]">
								Withdrawing to:{" "}
								<span className="text-[var(--dashboard-text)] font-extrabold">
									{bankName ?? "Bank"} {bankAccount?.bankAccountNumber}
								</span>
							</span>
							<button
								type="button"
								onClick={() => setForceAccountForm(true)}
								className="text-[var(--dashboard-orange)] font-extrabold hover:opacity-80 cursor-pointer"
							>
								Change
							</button>
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
								onClick={handleClose}
								className="flex-1 py-2.5 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								Cancel
							</button>
							<AppButton
								type="submit"
								className="flex-1"
								disabled={!amount || invalid}
								isLoading={withdrawMutation.isPending}
								loadingText="Processing…"
							>
								Request Payout
							</AppButton>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
