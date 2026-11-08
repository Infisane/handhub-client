import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppButton } from "#/components/ui/app-button";
import { AppInput } from "#/components/ui/app-input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import { OTP_RESEND_COOLDOWN_SECONDS } from "#/core/helpers/constants.helper";
import { useValidator } from "#/core/helpers/useValidator.helper";
import { useCooldown } from "#/core/hooks/useCooldown.hook";
import {
	useResendEmailVerificationQuery,
	useVerifyEmailQuery,
} from "#/core/queries/auth.q";
import { VerifyOtpSchema } from "#/core/schemas/auth.schema";

interface VerifyEmailDialogProps {
	open: boolean;
	email: string;
	onClose: () => void;
	onVerified: () => void;
}

export function VerifyEmailDialog({
	open,
	email,
	onClose,
	onVerified,
}: VerifyEmailDialogProps) {
	const [otp, setOtp] = useState("");
	const { validate, revalidate, errors } = useValidator({
		schema: VerifyOtpSchema,
		store: { otp },
	});

	const verifyMutation = useVerifyEmailQuery({
		onSuccessCallback: () => {
			setOtp("");
			onVerified();
			onClose();
		},
	});
	const { remaining, start: startCooldown } = useCooldown(
		OTP_RESEND_COOLDOWN_SECONDS,
	);
	const resendMutation = useResendEmailVerificationQuery({
		onSuccessCallback: () => {
			toast.success("Code sent");
			startCooldown();
		},
	});

	// The dialog only opens right after signup/login issued a code, so the
	// API's resend window is already running — start ours with it.
	useEffect(() => {
		if (open) startCooldown();
	}, [open, startCooldown]);

	const handleVerify = (e: React.FormEvent) => {
		e.preventDefault();
		validate(() => verifyMutation.mutate({ email, otp }));
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-w-sm p-5 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] shadow-2xl rounded-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-3 text-[16px] font-extrabold text-[var(--dashboard-text)] font-syne">
						<div className="w-9 h-9 rounded-xl bg-[var(--dashboard-orange-light)] border border-[var(--dashboard-orange-mid)] flex items-center justify-center shrink-0">
							<Mail size={15} className="text-[var(--dashboard-orange)]" />
						</div>
						Verify your email
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleVerify} className="mt-2 space-y-4">
					<p className="text-[12.5px] leading-relaxed text-[var(--dashboard-muted)]">
						Enter the 6-digit code sent to <strong>{email}</strong>.
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
								revalidate("otp", digits);
							}}
							placeholder="000000"
							aria-label="6-digit verification code"
							error={errors.otp}
							className="text-center tracking-[6px] text-[18px]"
						/>
					</div>
					<AppButton
						type="submit"
						isLoading={verifyMutation.isPending}
						loadingText="Verifying…"
					>
						Verify
					</AppButton>
					<p className="text-center text-[12px] text-[var(--dashboard-muted)]">
						Didn't get a code?{" "}
						<button
							type="button"
							disabled={resendMutation.isPending || remaining > 0}
							onClick={() => resendMutation.mutate({ email })}
							className="font-bold text-[var(--dashboard-orange)] hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
						>
							{resendMutation.isPending
								? "Sending…"
								: remaining > 0
									? `Resend code in ${remaining}s`
									: "Resend code"}
						</button>
					</p>
				</form>
			</DialogContent>
		</Dialog>
	);
}
