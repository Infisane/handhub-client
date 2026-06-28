import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { cn } from "#/lib/utils.ts";

export interface AppInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	icon?: React.ReactNode;
	error?: string;
}

/**
 * Shared auth text input: optional leading icon, built-in password
 * show/hide toggle, and an error message rendered below the field.
 * Styled with the `.inp` / `.inp-wrap` classes from styles.css.
 */
export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
	({ className, type, icon, error, ...props }, ref) => {
		const [show, setShow] = React.useState(false);
		const isPassword = type === "password";
		const resolvedType = isPassword ? (show ? "text" : "password") : type;

		return (
			<div>
				<div className="inp-wrap">
					{icon && <span className="inp-icon">{icon}</span>}
					<input
						ref={ref}
						type={resolvedType}
						className={cn(
							"inp",
							icon && "has-icon",
							error && "has-error",
							className,
						)}
						style={isPassword ? { paddingRight: "40px" } : undefined}
						{...props}
					/>
					{isPassword && (
						<button
							type="button"
							className="inp-trail"
							onClick={() => setShow((v) => !v)}
							aria-label={show ? "Hide password" : "Show password"}
						>
							{show ? (
								<EyeOff size={15} aria-hidden="true" />
							) : (
								<Eye size={15} aria-hidden="true" />
							)}
						</button>
					)}
				</div>
				{error && <p className="field-error">{error}</p>}
			</div>
		);
	},
);
AppInput.displayName = "AppInput";
