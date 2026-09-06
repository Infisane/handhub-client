import * as React from "react";
import { cn } from "#/lib/utils.ts";

export interface AppButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	isLoading?: boolean;
	loadingText?: React.ReactNode;
}

/**
 * Shared full-width primary submit button for auth dialogs: a spinner shown
 * beside the label while `isLoading` (same spinner markup as
 * SettingsSaveBar), auto-disabled while loading.
 */
export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
	(
		{ className, isLoading, loadingText, disabled, children, ...props },
		ref,
	) => {
		return (
			<button
				ref={ref}
				disabled={disabled || isLoading}
				className={cn(
					"w-full py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs bg-[var(--dashboard-orange)] text-white hover:opacity-90 disabled:opacity-60",
					className,
				)}
				{...props}
			>
				{isLoading && (
					<svg
						className="animate-spin h-3.5 w-3.5 text-current"
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
				)}
				{isLoading ? (loadingText ?? children) : children}
			</button>
		);
	},
);
AppButton.displayName = "AppButton";
