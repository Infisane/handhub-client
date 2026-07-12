import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "#/lib/utils.ts";

/** Shared submit button for a settings tab's <form>. Each tab owns its own
 *  pending/success state and renders this at the bottom of its form. */
export function SettingsSaveBar({
	isSaving,
	saved,
	label = "Save Changes",
}: {
	isSaving: boolean;
	saved: boolean;
	label?: string;
}) {
	return (
		<div className="pt-4 border-t border-[var(--dashboard-border)]/40 flex items-center justify-end gap-3 shrink-0">
			<button
				type="submit"
				disabled={isSaving}
				className={cn(
					"py-2.5 px-5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 min-w-36 active:scale-95 disabled:opacity-60",
					saved
						? "bg-green-600 text-white shadow-green-500/10 hover:bg-green-700"
						: "bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white",
				)}
			>
				{isSaving ? (
					<>
						<svg
							className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white inline"
							fill="none"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Saving…
					</>
				) : saved ? (
					<>
						<Check size={14} className="stroke-[3]" /> Saved ✓
					</>
				) : (
					label
				)}
			</button>
		</div>
	);
}

/** Transient "Saved ✓" flash used by each tab after a successful mutation. */
export function useSavedFlash(): [boolean, () => void] {
	const [saved, setSaved] = useState(false);
	const flash = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2500);
	};
	return [saved, flash];
}
