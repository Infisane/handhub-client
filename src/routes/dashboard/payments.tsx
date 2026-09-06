import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { BalanceCards } from "#/components/dashboard/payments/balance-cards";
import { EscrowExplainer } from "#/components/dashboard/payments/escrow-explainer";
import { TransactionHistory } from "#/components/dashboard/payments/transaction-history";
import { useAppDispatch } from "#/core/hooks/useStore.hook";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";

export const Route = createFileRoute("/dashboard/payments")({
	component: PaymentsPage,
});

function PaymentsPage() {
	const dispatch = useAppDispatch();

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

				<BalanceCards />
			</div>

			{/* ── Main Panel ────────────────────────────────────────────────────── */}
			<div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-7 scrollbar-none pb-24 sm:pb-8">
				<EscrowExplainer />
				<TransactionHistory />
			</div>
		</main>
	);
}
