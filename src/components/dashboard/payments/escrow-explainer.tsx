import { ShieldCheck } from "lucide-react";
import { useAppSelector } from "#/core/hooks/useStore.hook";

const COPY = {
	customer: {
		heading: "How Handhub Escrow Protects Your Payment",
		subtitle:
			"Escrow transactions safeguard your payments against low quality work or abandonment",
		steps: [
			{
				title: "Authorize & Lock Funds",
				body: "When you accept an invoice, handhub locks the exact project cost. Funds are taken from your balance but **not yet sent** to the artisan.",
			},
			{
				title: "Artisan executes work",
				body: "The artisan executes the job knowing their payment is completely verified and locked in handhub. Security for both parties is guaranteed.",
			},
			{
				title: "Confirm & Release",
				body: "Once satisfied with the job, confirm completion in the chat to instantly release funds directly to the artisan. Handhub handles all security keys.",
			},
		],
	},
	provider: {
		heading: "How Handhub Escrow Guarantees Your Payout",
		subtitle:
			"Escrow guarantees you get paid for verified work — funds are locked in before you start",
		steps: [
			{
				title: "Customer Locks Funds",
				body: "When the customer accepts your invoice, handhub locks the exact project cost from their balance. Funds are reserved but **not yet sent** to you.",
			},
			{
				title: "You execute the work",
				body: "Complete the job knowing your payment is already verified and locked in handhub. Security for both parties is guaranteed.",
			},
			{
				title: "Customer Confirms & You're Paid",
				body: "Once the customer confirms the job is done, funds are released directly to your wallet. Handhub handles all security keys.",
			},
		],
	},
};

export function EscrowExplainer() {
	const isProvider =
		useAppSelector((s) => s.authStore.user?.userType) === "provider";
	const copy = isProvider ? COPY.provider : COPY.customer;

	return (
		<div className="space-y-4">
			<div>
				<h3 className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)] flex items-center gap-1.5">
					<ShieldCheck size={16} className="text-blue-500" />
					{copy.heading}
				</h3>
				<p className="text-[11.5px] text-[var(--dashboard-muted)] mt-0.5">
					{copy.subtitle}
				</p>
			</div>

			<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 space-y-4 shadow-xs relative">
				{/* Step timeline lines */}
				<div className="absolute top-[42px] bottom-[42px] left-[27px] w-[2px] bg-[var(--dashboard-border)] pointer-events-none" />

				{copy.steps.map((step, i) => (
					<div className="flex gap-4 relative" key={step.title}>
						<div
							className={
								i === copy.steps.length - 1
									? "w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-2 border-green-400 flex items-center justify-center font-extrabold text-[10px] shrink-0 z-10 shadow-sm animate-pulse"
									: "w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-400 flex items-center justify-center font-extrabold text-[10px] shrink-0 z-10 shadow-sm"
							}
						>
							{i + 1}
						</div>
						<div className="min-w-0 flex-1">
							<h4 className="text-[12.5px] font-extrabold text-[var(--dashboard-text)] leading-none mb-1">
								{step.title}
							</h4>
							<p className="text-[11px] text-[var(--dashboard-muted)] leading-relaxed">
								{step.body}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
