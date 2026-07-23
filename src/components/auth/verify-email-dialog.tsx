import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppInput } from "#/components/ui/app-input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import { useValidator } from "#/core/helpers/useValidator.helper";
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
	const resendMutation = useResendEmailVerificationQuery({
		onSuccessCallback: () => toast.success("Code sent"),
	});

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
					<button
						type="submit"
						disabled={verifyMutation.isPending}
						className="w-full py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs bg-[var(--dashboard-orange)] text-white hover:opacity-90 disabled:opacity-60"
					>
						{verifyMutation.isPending ? "Verifying…" : "Verify"}
					</button>
					<p className="text-center text-[12px] text-[var(--dashboard-muted)]">
						Didn't get a code?{" "}
						<button
							type="button"
							disabled={resendMutation.isPending}
							onClick={() => resendMutation.mutate({ email })}
							className="font-bold text-[var(--dashboard-orange)] hover:opacity-80 disabled:opacity-60 cursor-pointer"
						>
							{resendMutation.isPending ? "Sending…" : "Resend code"}
						</button>
					</p>
				</form>
			</DialogContent>
		</Dialog>
	);
}
