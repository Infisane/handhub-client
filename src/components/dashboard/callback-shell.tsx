/** Shared status card for a redirect-back landing page (payment-callback,
 * wallet-callback) — icon + title + body + an optional "back" action. */
export function CallbackShell({
	icon,
	title,
	body,
	onBack,
	backLabel = "Back to conversation",
}: {
	icon: React.ReactNode;
	title: string;
	body: string;
	onBack?: () => void;
	backLabel?: string;
}) {
	return (
		<div className="flex-1 flex items-center justify-center p-6">
			<div className="w-full max-w-sm rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-6 text-center space-y-3 shadow-xs">
				<div className="mx-auto w-11 h-11 rounded-xl bg-[var(--dashboard-bg)] flex items-center justify-center">
					{icon}
				</div>
				<h1 className="font-syne font-extrabold text-[16px] text-[var(--dashboard-text)]">
					{title}
				</h1>
				<p className="text-[12.5px] text-[var(--dashboard-muted)] leading-relaxed">
					{body}
				</p>
				{onBack && (
					<button
						type="button"
						onClick={onBack}
						className="w-full mt-2 py-2.5 rounded-xl bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white font-extrabold text-[12.5px] transition-colors"
					>
						{backLabel}
					</button>
				)}
			</div>
		</div>
	);
}
