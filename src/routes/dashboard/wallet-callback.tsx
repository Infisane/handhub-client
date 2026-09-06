import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clock, Wallet as WalletIcon } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { CallbackShell } from "#/components/dashboard/callback-shell";
import { formatNaira } from "#/core/helpers/money.helper";
import { useAppDispatch } from "#/core/hooks/useStore.hook";
import { useVerifyOnlinePaymentQuery } from "#/core/queries/payment.q";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";
import type { PaymentTransaction } from "#/core/types/chat.types";

export const Route = createFileRoute("/dashboard/wallet-callback")({
	component: WalletCallbackPage,
});

// The gateway redirects here after checkout. The reference from
// /topup/initiate isn't known until after callbackUrl was already sent in
// the request, so it can't be embedded there the way bookingId can for
// booking payments — it's stashed in sessionStorage right before the
// redirect instead, surviving the full-page round trip.
const REFERENCE_KEY = "handhub_wallet_topup";
const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 5;

function readReference(): string | null {
	if (typeof window === "undefined") return null;
	const raw = window.sessionStorage.getItem(REFERENCE_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as { reference?: string };
		return parsed.reference ?? null;
	} catch {
		return null;
	}
}

function WalletCallbackPage() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [{ returnThreadId }] = useQueryStates({
		returnThreadId: parseAsString.withDefault(""),
	});

	const [reference] = useState(readReference);
	const [transaction, setTransaction] = useState<PaymentTransaction | null>(
		null,
	);
	const [attempts, setAttempts] = useState(0);

	const succeeded = transaction?.status === "successful";
	const timedOut = attempts >= MAX_ATTEMPTS;

	const verify = useVerifyOnlinePaymentQuery({
		onSuccessCallback: (result) => setTransaction(result),
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: retry loop, not a render-driven fetch
	useEffect(() => {
		if (!reference || succeeded || timedOut) return;
		const timer = setTimeout(
			() => {
				verify.mutate(reference);
				setAttempts((n) => n + 1);
			},
			attempts === 0 ? 0 : POLL_INTERVAL_MS,
		);
		return () => clearTimeout(timer);
	}, [reference, attempts, succeeded, timedOut]);

	useEffect(() => {
		if (succeeded || timedOut) window.sessionStorage.removeItem(REFERENCE_KEY);
	}, [succeeded, timedOut]);

	const goBack = () => {
		if (returnThreadId) {
			dispatch(
				set_dashboard_flags({
					hasActiveChat: true,
					activeThreadId: returnThreadId,
					activeProviderId: null,
				}),
			);
			navigate({ to: "/dashboard" });
			return;
		}
		navigate({ to: "/dashboard/payments" });
	};
	const backLabel = returnThreadId ? "Back to conversation" : "Go to wallet";

	if (!reference) {
		return (
			<CallbackShell
				icon={
					<WalletIcon size={22} className="text-[var(--dashboard-orange)]" />
				}
				title="Check your wallet"
				body="We couldn't confirm this top-up automatically — check your wallet balance to see if it went through."
				onBack={goBack}
				backLabel={backLabel}
			/>
		);
	}

	if (succeeded) {
		return (
			<CallbackShell
				icon={<CheckCircle2 size={22} className="text-emerald-500" />}
				title="Top-up confirmed"
				body={`${formatNaira(transaction?.amount)} added to your wallet.`}
				onBack={goBack}
				backLabel={backLabel}
			/>
		);
	}

	if (timedOut) {
		return (
			<CallbackShell
				icon={<Clock size={22} className="text-[var(--dashboard-orange)]" />}
				title="Still processing"
				body="Your top-up is being confirmed — this can take a minute. Check your wallet balance shortly."
				onBack={goBack}
				backLabel={backLabel}
			/>
		);
	}

	return (
		<CallbackShell
			icon={
				<div className="w-5 h-5 border-2 border-[var(--dashboard-orange)] border-t-transparent rounded-full animate-spin" />
			}
			title="Confirming your top-up…"
			body="Hang tight while we confirm your payment with the gateway."
		/>
	);
}
