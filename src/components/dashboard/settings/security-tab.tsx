import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "#/core/helpers/error-handler.helper";
import { useValidator } from "#/core/helpers/useValidator.helper";
import { useChangePasswordQuery } from "#/core/queries/settings.q";
import { ChangePasswordSchema } from "#/core/schemas/settings.schema";
import { cn } from "#/lib/utils.ts";
import { SettingsSaveBar, useSavedFlash } from "./settings-save-bar.tsx";

const labelCls =
	"text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block";
const passwordInputCls =
	"w-full pl-3.5 pr-9 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] font-mono text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]";
const errorCls = "text-[10.5px] text-red-500 font-semibold";

// Stable keys for the 4 strength segments (avoids array-index keys).
const STRENGTH_SEGMENTS = ["seg-1", "seg-2", "seg-3", "seg-4"];

const EMPTY_FORM = {
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
};

export function SecurityTab() {
	const [form, setForm] = useState(EMPTY_FORM);
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [saved, flashSaved] = useSavedFlash();

	const { validate, revalidate, errors } = useValidator({
		schema: ChangePasswordSchema,
		store: form,
	});

	const changePassword = useChangePasswordQuery({
		onSuccessCallback: () => {
			toast.success("Password changed successfully");
			setForm(EMPTY_FORM);
			setServerError(null);
			flashSaved();
		},
	});

	const setField = (field: keyof typeof form, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		revalidate(field, value);
		if (field === "currentPassword") setServerError(null);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		validate(() =>
			changePassword.mutate(
				{
					currentPassword: form.currentPassword,
					newPassword: form.newPassword,
				},
				{
					onError: (err) => setServerError(getApiErrorMessage(err) ?? null),
				},
			),
		);
	};

	// Password strength: +1 each for length, uppercase, digit, symbol.
	const strength = (() => {
		if (!form.newPassword) return 0;
		let score = 0;
		if (form.newPassword.length >= 8) score++;
		if (/[A-Z]/.test(form.newPassword)) score++;
		if (/[0-9]/.test(form.newPassword)) score++;
		if (/[^A-Za-z0-9]/.test(form.newPassword)) score++;
		return score;
	})();

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div>
				<h3 className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)] leading-none mb-1">
					Security Credentials
				</h3>
				<p className="text-[11px] text-[var(--dashboard-muted)]">
					Change your account password
				</p>
			</div>

			<div className="space-y-4">
				<div className="space-y-1.5">
					<label htmlFor="sec-current" className={labelCls}>
						Current Password
					</label>
					<div className="relative">
						<input
							id="sec-current"
							type={showCurrent ? "text" : "password"}
							value={form.currentPassword}
							onChange={(e) => setField("currentPassword", e.target.value)}
							placeholder="••••••••"
							className={passwordInputCls}
						/>
						<button
							type="button"
							onClick={() => setShowCurrent(!showCurrent)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)]"
							aria-label={showCurrent ? "Hide password" : "Show password"}
						>
							{showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
						</button>
					</div>
					{(errors.currentPassword || serverError) && (
						<p className={errorCls}>{errors.currentPassword ?? serverError}</p>
					)}
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="space-y-1.5">
						<label htmlFor="sec-new" className={labelCls}>
							New Password
						</label>
						<div className="relative">
							<input
								id="sec-new"
								type={showNew ? "text" : "password"}
								value={form.newPassword}
								onChange={(e) => setField("newPassword", e.target.value)}
								placeholder="••••••••"
								className={passwordInputCls}
							/>
							<button
								type="button"
								onClick={() => setShowNew(!showNew)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)]"
								aria-label={showNew ? "Hide password" : "Show password"}
							>
								{showNew ? <EyeOff size={14} /> : <Eye size={14} />}
							</button>
						</div>

						{form.newPassword && (
							<div className="space-y-1 mt-1">
								<div className="flex gap-1 h-1.5">
									{STRENGTH_SEGMENTS.map((seg, i) => (
										<div
											key={seg}
											className={cn(
												"flex-1 h-full rounded-full transition-all",
												i < strength
													? strength <= 2
														? "bg-red-500"
														: strength === 3
															? "bg-amber-500"
															: "bg-green-500"
													: "bg-[var(--dashboard-border)]/50",
											)}
										/>
									))}
								</div>
								<span className="text-[9px] text-[var(--dashboard-muted)] font-bold block text-right">
									{strength <= 2 ? "Weak" : strength === 3 ? "Good" : "Strong!"}
								</span>
							</div>
						)}
						{errors.newPassword && (
							<p className={errorCls}>{errors.newPassword}</p>
						)}
					</div>

					<div className="space-y-1.5">
						<label htmlFor="sec-confirm" className={labelCls}>
							Confirm New Password
						</label>
						<div className="relative">
							<input
								id="sec-confirm"
								type={showConfirm ? "text" : "password"}
								value={form.confirmPassword}
								onChange={(e) => setField("confirmPassword", e.target.value)}
								placeholder="••••••••"
								className={passwordInputCls}
							/>
							<button
								type="button"
								onClick={() => setShowConfirm(!showConfirm)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)]"
								aria-label={showConfirm ? "Hide password" : "Show password"}
							>
								{showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
							</button>
						</div>
						{errors.confirmPassword && (
							<p className={errorCls}>{errors.confirmPassword}</p>
						)}
					</div>
				</div>
			</div>

			<SettingsSaveBar
				isSaving={changePassword.isPending}
				saved={saved}
				label="Change Password"
			/>
		</form>
	);
}
