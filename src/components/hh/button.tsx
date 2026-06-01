import { cn } from "#/lib/utils";

type Variant = "primary" | "ghost" | "white";
type Size = "sm" | "md" | "lg";

export interface HHButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	size?: Size;
	/** Use rounded-full instead of the size-matched radius */
	pill?: boolean;
}

const PADDING: Record<Size, string> = {
	sm: "px-4 py-2 text-[13px]",
	md: "px-[22px] py-[11px] text-[13.5px]",
	lg: "px-8 py-3.5 text-[15px]",
};

const RADIUS: Record<Size, string> = {
	sm: "rounded-[8px]",
	md: "rounded-[10px]",
	lg: "rounded-[12px]",
};

export function HHButton({
	variant = "primary",
	size = "md",
	pill = false,
	className,
	children,
	...props
}: HHButtonProps) {
	return (
		<button
			type="button"
			className={cn(
				"hh-btn inline-flex items-center justify-center gap-1.5 font-medium",
				PADDING[size],
				pill ? "rounded-full" : RADIUS[size],
				`hh-btn-${variant}`,
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}
