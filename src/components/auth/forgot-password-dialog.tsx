import { Mail } from "lucide-react";
import { useState } from "react";
import { AppButton } from "#/components/ui/app-button";
import { AppInput } from "#/components/ui/app-input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import { getApiErrorMessage } from "#/core/helpers/error-handler.helper";
import { useValidator } from "#/core/helpers/useValidator.helper";
import {
	useCompletePasswordResetQuery,
	useRequestPasswordResetQuery,
} from "#/core/queries/auth.q";
import {
	ForgotPasswordEmailSchema,
	SetPasswordSchema,
} from "#/core/schemas/auth.schema";

interface ForgotPasswordDialogProps {
	open: boolean;
	onClose: () => void;
	onResetComplete: (email: string) => void;
}

/** Logged-out password reset — same OTP endpoints as Settings' "Set a
 * Password" flow (see docs/account-password-settings-implementation.md §3),
 * just with its own email-entry step first since there's no session to read
 * the email from. `/verify` is skipped for the same reason it is there: this
 * UI collects the OTP and new password on one screen and submits directly to
 * `/complete`. */
export function ForgotPasswordDialog({
	open,
	onClose,
	onResetComplete,
}: ForgotPasswordDialogProps) {
	const [email, setEmail] = useState("");
	const [codeSent, setCodeSent] = useState(false);
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [serverError, setServerError] = useState<string | null>(null);

	const emailValidator = useValidator({
		schema: ForgotPasswordEmailSchema,
		store: { email },
	});
	const codeValidator = useValidator({
		schema: SetPasswordSchema,
		store: { otp, newPassword, confirmPassword },
	});

	const requestReset = useRequestPasswordResetQuery({
		onSuccessCallback: () => setCodeSent(true),
	});
	const completeReset = useCompletePasswordResetQuery({
		onSuccessCallback: () => {
			onClose();
			onResetComplete(email);
		},
	});

	const resetLocalState = () => {
		setEmail("");
		setCodeSent(false);
		setOtp("");
		setNewPassword("");
		setConfirmPassword("");
		setServerError(null);
	};

	const handleClose = () => {
		resetLocalState();
		onClose();
	};

	const handleRequestSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		emailValidator.validate(() => requestReset.mutate({ email }));
	};

	const handleCompleteSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		codeValidator.validate(() =>
			completeReset.mutate(
				{ email, otp, newPassword },
				{ onError: (err) => setServerError(getApiErrorMessage(err) ?? null) },
			),
		);
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="max-w-sm p-5 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] shadow-2xl rounded-2xl">
				<DialogHeader>
					<DialogTitle className="text-[16px] font-extrabold text-[var(--dashboard-text)] font-syne">
						Reset your password
					</DialogTitle>
				</DialogHeader>

				{!codeSent ? (
					<form onSubmit={handleRequestSubmit} className="mt-2 space-y-4">
						<p className="text-[12.5px] leading-relaxed text-[var(--dashboard-muted)]">
							Enter your account email and we'll send you a verification code.
						</p>
						<div className="field">
							<AppInput
								type="email"
								icon={<Mail size={16} aria-hidden="true" />}
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									emailValidator.revalidate("email", e.target.value);
								}}
								placeholder="you@example.com"
								aria-label="Email address"
								error={emailValidator.errors.email}
							/>
						</div>
						<AppButton
							type="submit"
							isLoading={requestReset.isPending}
							loadingText="Sending…"
						>
							Send code
						</AppButton>
					</form>
				) : (
					<form onSubmit={handleCompleteSubmit} className="mt-2 space-y-4">
						<p className="text-[12.5px] leading-relaxed text-[var(--dashboard-muted)]">
							Enter the 6-digit code sent to <strong>{email}</strong>, and your
							new password.
						</p>
						<div className="field">
							<AppInput
								type="text"
								inputMode="numeric"
								pattern="[0-9]*"
								maxLength={6}
								autoFocus
								value={otp}
								onChange={(e) => {
									const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
									setOtp(digits);
									codeValidator.revalidate("otp", digits);
									setServerError(null);
								}}
								placeholder="000000"
								aria-label="6-digit verification code"
								error={codeValidator.errors.otp ?? serverError ?? undefined}
								className="text-center tracking-[6px] text-[18px]"
							/>
						</div>
						<div className="field">
							<AppInput
								type="password"
								placeholder="New password"
								value={newPassword}
								onChange={(e) => {
									setNewPassword(e.target.value);
									codeValidator.revalidate("newPassword", e.target.value);
								}}
								aria-label="New password"
								error={codeValidator.errors.newPassword}
							/>
						</div>
						<div className="field">
							<AppInput
								type="password"
								placeholder="Confirm new password"
								value={confirmPassword}
								onChange={(e) => {
									setConfirmPassword(e.target.value);
									codeValidator.revalidate("confirmPassword", e.target.value);
								}}
								aria-label="Confirm new password"
								error={codeValidator.errors.confirmPassword}
							/>
						</div>
						<AppButton
							type="submit"
							isLoading={completeReset.isPending}
							loadingText="Resetting…"
						>
							Reset Password
						</AppButton>
						<p className="text-center text-[12px] text-[var(--dashboard-muted)]">
							Didn't get a code?{" "}
							<button
								type="button"
								disabled={requestReset.isPending}
								onClick={() => requestReset.mutate({ email })}
								className="font-bold text-[var(--dashboard-orange)] hover:opacity-80 disabled:opacity-60 cursor-pointer"
							>
								{requestReset.isPending ? "Sending…" : "Resend code"}
							</button>
						</p>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
