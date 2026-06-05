/** Brand accent inline span (Signal Blue) — used in the wordmark */
export function O({ children }: { children: React.ReactNode }) {
	return <span style={{ color: "var(--hh-or)" }}>{children}</span>;
}

/** Section eyebrow with leading bar — warm gold, the secondary accent */
export function Eyebrow({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex items-center gap-1.5 mb-3">
			<span
				className="inline-block w-5 h-0.5 rounded-sm"
				style={{ background: "var(--hh-gold)" }}
				aria-hidden
			/>
			<span
				className="text-[11px] uppercase tracking-[1.5px] font-semibold"
				style={{ color: "var(--hh-gold)" }}
			>
				{children}
			</span>
		</div>
	);
}
