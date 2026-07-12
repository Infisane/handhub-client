import { CreditCard, Wallet as WalletIcon, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatNaira, parseMoney } from "#/core/helpers/money.helper";
import {
	isCardPaymentInit,
	useCreatePaymentQuery,
	useMockCompletePaymentQuery,
} from "#/core/queries/payment.q";
import {
	useDepositWalletQuery,
	useGetWalletQuery,
} from "#/core/queries/wallet.q";
import type { CardPaymentInit, PaymentMethod } from "#/core/types/chat.types";
import { cn } from "#/lib/utils.ts";

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
	const [method, setMethod] = useState<PaymentMethod>("wallet");
	const [depositAmount, setDepositAmount] = useState("");
	const [cardInit, setCardInit] = useState<CardPaymentInit | null>(null);

	const total = parseMoney(totalAmount);
	const { data: wallet } = useGetWalletQuery();
	const balance = parseMoney(wallet?.balance);
	const insufficient = method === "wallet" && balance < total;

	const deposit = useDepositWalletQuery({
		onSuccessCallback: () => {
			toast.success("Wallet funded");
			setDepositAmount("");
		},
	});

	const mockComplete = useMockCompletePaymentQuery({
		onSuccessCallback: () => {
			toast.success("Payment settled");
			onClose();
		},
	});

	const pay = useCreatePaymentQuery({
		threadId,
		ticketId,
		onSuccessCallback: (result) => {
			if (isCardPaymentInit(result)) {
				if (import.meta.env.DEV) {
					setCardInit(result); // let the dev simulate settlement
				} else {
					window.location.href = result.authorizationUrl;
				}
				return;
			}
			toast.success("Payment successful");
			onClose();
		},
	});

	const handlePay = () =>
		pay.mutate({ bookingId, paymentMethod: method, invoiceId });

	const handleSimulateCard = () => {
		if (!cardInit) return;
		// dev authorizationUrl carries ?reference=TXN-…
		const ref = new URL(cardInit.authorizationUrl).searchParams.get(
			"reference",
		);
		if (ref) mockComplete.mutate(ref);
	};

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
					{/* Method picker */}
					<div className="grid grid-cols-2 gap-2">
						{(["wallet", "card"] as const).map((m) => (
							<button
								key={m}
								type="button"
								onClick={() => {
									setMethod(m);
									setCardInit(null);
								}}
								className={cn(
									"flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[12px] font-bold transition-all",
									method === m
										? "bg-[var(--dashboard-orange)] text-white border-[var(--dashboard-orange)]"
										: "bg-transparent text-[var(--dashboard-text)] border-[var(--dashboard-border)] hover:border-[var(--dashboard-orange)]",
								)}
							>
								{m === "wallet" ? (
									<WalletIcon size={14} />
								) : (
									<CreditCard size={14} />
								)}
								{m === "wallet" ? "Wallet" : "Card"}
							</button>
						))}
					</div>

					{method === "wallet" && (
						<div className="text-[12px] text-[var(--dashboard-muted)] flex items-center justify-between">
							<span>Wallet balance</span>
							<span className="font-bold text-[var(--dashboard-text)]">
								{formatNaira(balance)}
							</span>
						</div>
					)}

					{insufficient ? (
						<div className="space-y-2 rounded-xl border border-amber-200/50 bg-amber-50 p-3">
							<p className="text-[11.5px] font-bold text-amber-700">
								Insufficient balance. Fund your wallet or switch to card.
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
									disabled={deposit.isPending || !depositAmount}
									onClick={() =>
										deposit.mutate(Number.parseFloat(depositAmount))
									}
									className="px-4 py-2 rounded-lg bg-[var(--dashboard-orange)] text-white font-bold text-[12px] disabled:opacity-50 shrink-0"
								>
									{deposit.isPending ? "…" : "Fund"}
								</button>
							</div>
						</div>
					) : cardInit ? (
						<button
							type="button"
							onClick={handleSimulateCard}
							disabled={mockComplete.isPending}
							className="w-full py-2.5 rounded-xl bg-[var(--dashboard-text)] text-white font-extrabold text-[12.5px] disabled:opacity-50"
						>
							{mockComplete.isPending
								? "Settling…"
								: "Simulate successful charge (dev)"}
						</button>
					) : (
						<button
							type="button"
							onClick={handlePay}
							disabled={pay.isPending}
							className="w-full py-2.5 rounded-xl bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white font-extrabold text-[12.5px] shadow-md shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50"
						>
							{pay.isPending
								? "Processing…"
								: method === "wallet"
									? `Pay ${formatNaira(total)}`
									: "Continue to card"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
