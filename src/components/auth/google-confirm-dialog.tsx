import { Hammer, Loader2, Phone, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AppButton } from "#/components/ui/app-button";
import { AppInput } from "#/components/ui/app-input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import { USER_TYPES, type UserType } from "#/core/helpers/constants.helper";
import { useValidator } from "#/core/helpers/useValidator.helper";
import { useGoogleAuthQuery } from "#/core/queries/auth.q";
import { GoogleConfirmSchema } from "#/core/schemas/auth.schema";
import type { GoogleAuthResponse } from "#/core/types/auth.types";
import { cn } from "#/lib/utils.ts";

interface GoogleConfirmDialogProps {
	open: boolean;
	idToken: string;
	onClose: () => void;
	onSuccess: (response: GoogleAuthResponse) => void;
}

const CACHE_KEY = "handhub_google_confirm";

const readCache = (): { phone: string; userType: UserType } | null => {
	if (typeof window === "undefined") return null;
	const raw = window.localStorage.getItem(CACHE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as { phone: string; userType: UserType };
	} catch {
		return null;
	}
};

const writeCache = (phone: string, userType: UserType) => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(CACHE_KEY, JSON.stringify({ phone, userType }));
};

/** Collects phone + account type after a Google credential comes back —
 * required on every Google sign-in call, even for a returning user, since
 * the backend can't know in advance whether the identity is new or existing
 * (see docs/google-signin-integration.md §3). A returning user on this
 * device skips this UI entirely: if a valid phone/userType is cached from a
 * prior confirm, it's submitted automatically. The visible form only shows
 * for a first-time device, or if that auto-submit ever comes back with an
 * error (e.g. the cached phone got reassigned elsewhere and now 409s) — at
 * that point it falls back to a normal, editable, prefilled form. */
export function GoogleConfirmDialog({
	open,
	idToken,
	onClose,
	onSuccess,
}: GoogleConfirmDialogProps) {
	const cached = readCache();
	const cachedParsed = cached ? GoogleConfirmSchema.safeParse(cached) : null;
	const cachedValid = cachedParsed?.success ? cachedParsed.data : null;

	const [phone, setPhone] = useState(cached?.phone ?? "");
	const [userType, setUserType] = useState<UserType>(
		cached?.userType ?? USER_TYPES.customer,
	);

	const { validate, revalidate, errors } = useValidator({
		schema: GoogleConfirmSchema,
		store: { phone, userType },
	});

	const googleAuthMutation = useGoogleAuthQuery({
		onSuccessCallback: (response) => {
			writeCache(phone.replace(/\s+/g, ""), userType);
			onSuccess(response);
		},
	});

	const shouldAutoSubmit = open && !!cachedValid && !googleAuthMutation.isError;

	// biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when what we'd submit actually changes — cachedValid/mutate are re-derived every render, not stable inputs to react to
	useEffect(() => {
		if (!shouldAutoSubmit || !idToken || !cachedValid) return;
		googleAuthMutation.mutate({ idToken, ...cachedValid });
	}, [shouldAutoSubmit, idToken]);

	if (shouldAutoSubmit) {
		return (
			<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
				<DialogContent className="max-w-sm p-6 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] shadow-2xl rounded-2xl">
					<DialogHeader>
						<DialogTitle className="sr-only">Signing you in</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
						<Loader2
							size={22}
							className="animate-spin text-[var(--dashboard-orange)]"
						/>
						<p className="text-[13px] font-bold text-[var(--dashboard-text)]">
							Signing you in…
						</p>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		validate(() =>
			googleAuthMutation.mutate({
				idToken,
				phone: phone.replace(/\s+/g, ""),
				userType,
			}),
		);
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-w-sm p-5 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] shadow-2xl rounded-2xl">
				<DialogHeader>
					<DialogTitle className="text-[16px] font-extrabold text-[var(--dashboard-text)] font-syne">
						Confirm your details
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="mt-2 space-y-4">
					<p className="text-[12.5px] leading-relaxed text-[var(--dashboard-muted)]">
						We need a couple more details to finish setting up your account.
					</p>

					<div className="field">
						<AppInput
							type="tel"
							icon={<Phone size={16} aria-hidden="true" />}
							value={phone}
							onChange={(e) => {
								setPhone(e.target.value);
								revalidate("phone", e.target.value);
							}}
							placeholder="+234 800 000 0000"
							aria-label="Phone number"
							error={errors.phone}
						/>
					</div>

					<div className="space-y-1.5">
						<p className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">
							I want to
						</p>
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={() => {
									setUserType(USER_TYPES.customer);
									revalidate("userType", USER_TYPES.customer);
								}}
								className={cn(
									"flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[12px] font-bold transition-all cursor-pointer",
									userType === USER_TYPES.customer
										? "border-[var(--dashboard-orange)] bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)]"
										: "border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)]",
								)}
							>
								<Search size={14} />
								Find help
							</button>
							<button
								type="button"
								onClick={() => {
									setUserType(USER_TYPES.provider);
									revalidate("userType", USER_TYPES.provider);
								}}
								className={cn(
									"flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[12px] font-bold transition-all cursor-pointer",
									userType === USER_TYPES.provider
										? "border-[var(--dashboard-orange)] bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)]"
										: "border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)]",
								)}
							>
								<Hammer size={14} />
								Offer services
							</button>
						</div>
						{errors.userType && (
							<p className="field-error">{errors.userType}</p>
						)}
					</div>

					<AppButton
						type="submit"
						isLoading={googleAuthMutation.isPending}
						loadingText="Continuing…"
					>
						Continue
					</AppButton>
				</form>
			</DialogContent>
		</Dialog>
	);
}
