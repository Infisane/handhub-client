import { Eye, EyeOff } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { cn } from "#/lib/utils.ts";

interface SecurityTabProps {
	currentPassword: string;
	setCurrentPassword: Dispatch<SetStateAction<string>>;
	newPassword: string;
	setNewPassword: Dispatch<SetStateAction<string>>;
	confirmPassword: string;
	setConfirmPassword: Dispatch<SetStateAction<string>>;
	showCurrent: boolean;
	setShowCurrent: Dispatch<SetStateAction<boolean>>;
	showNew: boolean;
	setShowNew: Dispatch<SetStateAction<boolean>>;
	showConfirm: boolean;
	setShowConfirm: Dispatch<SetStateAction<boolean>>;
	errors: Record<string, string>;
}

const labelCls =
	"text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block";
const passwordInputCls =
	"w-full pl-3.5 pr-9 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] font-mono text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]";
const errorCls = "text-[10.5px] text-red-500 font-semibold";

// Stable keys for the 4 strength segments (avoids array-index keys).
const STRENGTH_SEGMENTS = ["seg-1", "seg-2", "seg-3", "seg-4"];

export function SecurityTab({
	currentPassword,
	setCurrentPassword,
	newPassword,
	setNewPassword,
	confirmPassword,
	setConfirmPassword,
	showCurrent,
	setShowCurrent,
	showNew,
	setShowNew,
	showConfirm,
	setShowConfirm,
	errors,
}: SecurityTabProps) {
	// Password strength: +1 each for length, uppercase, digit, symbol.
	const strength = (() => {
		if (!newPassword) return 0;
		let score = 0;
		if (newPassword.length >= 8) score++;
		if (/[A-Z]/.test(newPassword)) score++;
		if (/[0-9]/.test(newPassword)) score++;
		if (/[^A-Za-z0-9]/.test(newPassword)) score++;
		return score;
	})();

	return (
		<>
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
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
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
					{errors.currentPassword && (
						<p className={errorCls}>{errors.currentPassword}</p>
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
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
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

						{newPassword && (
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
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
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
		</>
	);
}
