/** Orange accent inline span */
export function O({ children }: { children: React.ReactNode }) {
	return <span style={{ color: "var(--hh-or)" }}>{children}</span>;
}

/** Section eyebrow with leading orange bar */
export function Eyebrow({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex items-center gap-1.5 mb-3">
			<span
				className="inline-block w-5 h-0.5 rounded-sm"
				style={{ background: "var(--hh-or)" }}
				aria-hidden
			/>
			<span
				className="text-[11px] uppercase tracking-[1.5px] font-medium"
				style={{ color: "var(--hh-or)" }}
			>
				{children}
			</span>
		</div>
	);
}
