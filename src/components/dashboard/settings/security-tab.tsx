import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { cn } from "#/lib/utils.ts";
import { SettingsToggle } from "./settings-toggle.tsx";

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
	twoFactor: boolean;
	setTwoFactor: Dispatch<SetStateAction<boolean>>;
}

const labelCls =
	"text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block";
const passwordInputCls =
	"w-full pl-3.5 pr-9 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] font-mono text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]";

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
	twoFactor,
	setTwoFactor,
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
				<h3 className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)] leading-none mb-1 flex items-center gap-2">
					Security Credentials
				</h3>
				<p className="text-[11px] text-[var(--dashboard-muted)]">
					Update password logs and secure authentication tools
				</p>
			</div>

			{/* Password modification segment */}
			<div className="space-y-4">
				<div className="space-y-1.5">
					<label className={labelCls}>Current Password</label>
					<div className="relative">
						<input
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
						>
							{showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="space-y-1.5">
						<label className={labelCls}>New Password</label>
						<div className="relative">
							<input
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
							>
								{showNew ? <EyeOff size={14} /> : <Eye size={14} />}
							</button>
						</div>

						{/* Strength indicator line */}
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
														? "bg-red-500 animate-pulse"
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
					</div>

					<div className="space-y-1.5">
						<label className={labelCls}>Confirm New Password</label>
						<div className="relative">
							<input
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
							>
								{showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* 2-Factor Authentication slider card */}
			<div className="border border-[var(--dashboard-border)] rounded-2xl p-4.5 space-y-3 bg-[var(--dashboard-card)] shadow-xs relative overflow-hidden flex items-center justify-between">
				<div className="flex gap-3 items-center min-w-0">
					<div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
						<ShieldAlert size={16} />
					</div>
					<div className="min-w-0">
						<h4 className="text-[13px] font-extrabold text-[var(--dashboard-text)] leading-none mb-1">
							Two-Factor Authentication (2FA)
						</h4>
						<p className="text-[10.5px] text-[var(--dashboard-muted)] leading-normal">
							Request a unique passcode via SMS or email for each payment
							authorization
						</p>
					</div>
				</div>

				<SettingsToggle
					size="md"
					checked={twoFactor}
					onChange={() => setTwoFactor(!twoFactor)}
					aria-label="Toggle two-factor authentication"
				/>
			</div>
		</>
	);
}
