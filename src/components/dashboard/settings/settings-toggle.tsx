import { motion } from "framer-motion";
import { cn } from "#/lib/utils.ts";

interface SettingsToggleProps {
	checked: boolean;
	onChange: () => void;
	/** "md" — wallet/2FA cards · "sm" — notification rows */
	size?: "md" | "sm";
	"aria-label"?: string;
}

const DIMENSIONS = {
	md: { track: "w-10 h-5.5", knob: "w-4.5 h-4.5", x: "18px" },
	sm: { track: "w-9 h-5", knob: "w-4 h-4", x: "14px" },
} as const;

export function SettingsToggle({
	checked,
	onChange,
	size = "sm",
	...props
}: SettingsToggleProps) {
	const dim = DIMENSIONS[size];
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={onChange}
			className={cn(
				"rounded-full p-0.5 transition-colors cursor-pointer shrink-0 relative flex items-center",
				dim.track,
				checked ? "bg-green-500" : "bg-[var(--dashboard-border)]/60",
			)}
			{...props}
		>
			<motion.div
				layout
				transition={{ type: "spring", stiffness: 450, damping: 25 }}
				className={cn("rounded-full bg-white shadow-xs", dim.knob)}
				style={{ x: checked ? dim.x : "0px" }}
			/>
		</button>
	);
}
