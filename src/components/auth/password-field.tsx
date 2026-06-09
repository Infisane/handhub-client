import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
	show: boolean;
	onToggleShow: () => void;
	placeholder?: string;
	ariaLabel: string;
}

/**
 * Password input with a leading lock icon and a trailing show/hide toggle.
 * Renders just the `.inp-wrap` — wrap it in a `.field` with the label.
 */
export function PasswordField({
	id,
	value,
	onChange,
	show,
	onToggleShow,
	placeholder,
	ariaLabel,
}: PasswordFieldProps) {
	return (
		<div className="inp-wrap">
			<Lock className="inp-icon" size={16} aria-hidden="true" />
			<input
				id={id}
				className="inp has-icon"
				type={show ? "text" : "password"}
				required
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				aria-label={ariaLabel}
				style={{ paddingRight: "40px" }}
			/>
			<button
				type="button"
				className="inp-trail"
				onClick={onToggleShow}
				aria-label={show ? "Hide password" : "Show password"}
			>
				{show ? (
					<EyeOff size={15} aria-hidden="true" />
				) : (
					<Eye size={15} aria-hidden="true" />
				)}
			</button>
		</div>
	);
}
