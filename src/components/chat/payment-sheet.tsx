import { Wallet as WalletIcon, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	formatNaira,
	parseMoney,
	summarizePaymentRows,
} from "#/core/helpers/money.helper";
import { useCreatePaymentQuery } from "#/core/queries/payment.q";
import {
	useGetWalletQuery,
	useInitiateWalletTopupQuery,
} from "#/core/queries/wallet.q";

const inputCls =
	"w-full px-3 py-2 rounded-lg bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] outline-none focus:border-[var(--dashboard-orange)] focus:ring-1 focus:ring-[var(--dashboard-orange)]/15";

export function PaymentSheet({
	bookingId,
	invoiceId,
	threadId,
	ticketId,
	totalAmount,
	onClose,
}: {
	bookingId: string;
	invoiceId: string;
	threadId: string;
	ticketId: string;
	totalAmount: string | number;
	onClose: () => void;
}) {
	const [depositAmount, setDepositAmount] = useState("");

	const total = parseMoney(totalAmount);
	const { data: wallet } = useGetWalletQuery();
	const balance = parseMoney(wallet?.balance);
	const insufficient = balance < total;

	const topup = useInitiateWalletTopupQuery({
		onSuccessCallback: (transaction) => {
			sessionStorage.setItem(
				"handhub_wallet_topup",
				JSON.stringify({ reference: transaction.reference }),
			);
			// Redirect out to the gateway; wallet-callback routes back to this
			// exact thread afterward via returnThreadId (embedded below).
			window.location.href = transaction.paymentUrl;
		},
	});

	const pay = useCreatePaymentQuery({
		threadId,
		ticketId,
		onSuccessCallback: (result) => {
			toast.success(summarizePaymentRows(result) || "Payment successful");
			onClose();
		},
	});

	const handleFundWallet = () => {
		const amount = Number.parseFloat(depositAmount);
		if (Number.isNaN(amount) || amount <= 0) return;
		topup.mutate({
			amount,
			callbackUrl: `${window.location.origin}/dashboard/wallet-callback?returnThreadId=${threadId}`,
		});
	};

	const handlePay = () => {
		pay.mutate({ bookingId, paymentMethod: "wallet", invoiceId });
	};

	const isPending = pay.isPending;

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
			<div className="w-full sm:max-w-sm bg-[var(--dashboard-card)] rounded-t-2xl sm:rounded-2xl border border-[var(--dashboard-border)] shadow-2xl">
				<div className="flex items-center justify-between p-4 border-b border-[var(--dashboard-border)]">
					<h3 className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)]">
						Pay {formatNaira(total)}
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

				<div className="p-4 space-y-4">
					<div className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--dashboard-text)]">
						<WalletIcon size={14} className="text-[var(--dashboard-orange)]" />
						Wallet
					</div>

					<div className="text-[12px] text-[var(--dashboard-muted)] flex items-center justify-between">
						<span>Wallet balance</span>
						<span className="font-bold text-[var(--dashboard-text)]">
							{formatNaira(balance)}
						</span>
					</div>

					{insufficient ? (
						<div className="space-y-2 rounded-xl border border-amber-200/50 bg-amber-50 p-3">
							<p className="text-[11.5px] font-bold text-amber-700">
								Insufficient balance. Fund your wallet to continue.
							</p>
							<div className="flex gap-2">
								<input
									type="number"
									min={0}
									value={depositAmount}
									onChange={(e) => setDepositAmount(e.target.value)}
									placeholder={`${Math.max(total - balance, 0)}`}
									className={inputCls}
								/>
								<button
									type="button"
									disabled={topup.isPending || !depositAmount}
									onClick={handleFundWallet}
									className="px-4 py-2 rounded-lg bg-[var(--dashboard-orange)] text-white font-bold text-[12px] disabled:opacity-50 shrink-0"
								>
									{topup.isPending ? "…" : "Fund"}
								</button>
							</div>
						</div>
					) : (
						<button
							type="button"
							onClick={handlePay}
							disabled={isPending}
							className="w-full py-2.5 rounded-xl bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white font-extrabold text-[12.5px] shadow-md shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50"
						>
							{isPending ? "Processing…" : `Pay ${formatNaira(total)}`}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
