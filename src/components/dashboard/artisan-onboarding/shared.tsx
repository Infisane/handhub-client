import { Check } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "#/lib/utils";

export const inputCls =
	"w-full rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-3.5 py-2.5 text-[13px] text-[var(--dashboard-text)] outline-none transition-colors duration-150 placeholder:text-[var(--dashboard-muted)] focus:border-[var(--dashboard-orange)] focus:ring-2 focus:ring-[var(--dashboard-orange)]/15";

export function Field({
	label,
	htmlFor,
	optional,
	error,
	children,
}: {
	label: string;
	htmlFor?: string;
	optional?: boolean;
	error?: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label
				htmlFor={htmlFor}
				className="text-[11.5px] font-bold text-[var(--dashboard-text)] flex items-center gap-1.5"
			>
				{label}
				{optional && (
					<span className="text-[10px] font-medium text-[var(--dashboard-muted)] normal-case">
						(optional)
					</span>
				)}
			</label>
			{children}
			{error && <p className="field-error">{error}</p>}
		</div>
	);
}

export function Chip({
	active,
	label,
	onClick,
}: {
	active: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-150 cursor-pointer flex items-center gap-1.5",
				active
					? "bg-[var(--dashboard-orange)] text-white border-[var(--dashboard-orange)] shadow-sm"
					: "bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)] border-[var(--dashboard-border)] hover:border-[var(--dashboard-orange-mid)] hover:text-[var(--dashboard-text)]",
			)}
		>
			{active && <Check size={12} className="stroke-[3]" />}
			{label}
		</button>
	);
}
