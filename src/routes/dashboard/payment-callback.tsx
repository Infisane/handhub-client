import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { CallbackShell } from "#/components/dashboard/callback-shell";
import { summarizePaymentRows } from "#/core/helpers/money.helper";
import { useAppDispatch } from "#/core/hooks/useStore.hook";
import { useGetPaymentByBookingQuery } from "#/core/queries/payment.q";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";

export const Route = createFileRoute("/dashboard/payment-callback")({
	component: PaymentCallbackPage,
});

// The gateway redirects here after checkout. bookingId/threadId are embedded
// in the callbackUrl we gave it before redirecting — settling the charge
// itself happens out-of-band (webhook or verify), so this page just polls
// for the resulting rows rather than parsing any gateway-specific params.
const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 8;

function PaymentCallbackPage() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [{ bookingId, threadId }] = useQueryStates({
		bookingId: parseAsString.withDefault(""),
		threadId: parseAsString.withDefault(""),
	});

	const [attempts, setAttempts] = useState(0);
	const timedOut = attempts >= MAX_ATTEMPTS;

	const { data: rows = [] } = useGetPaymentByBookingQuery(
		bookingId || null,
		timedOut ? undefined : POLL_INTERVAL_MS,
	);
	const found = rows.length > 0;

	// biome-ignore lint/correctness/useExhaustiveDependencies: count attempts per fetch, not per render
	useEffect(() => {
		if (found || timedOut) return;
		const timer = setTimeout(() => setAttempts((n) => n + 1), POLL_INTERVAL_MS);
		return () => clearTimeout(timer);
	}, [found, attempts]);

	const backToThread = () => {
		if (threadId) {
			dispatch(
				set_dashboard_flags({
					hasActiveChat: true,
					activeThreadId: threadId,
					activeProviderId: null,
				}),
			);
		}
		navigate({ to: "/dashboard" });
	};

	if (!bookingId) {
		return (
			<CallbackShell
				icon={<XCircle size={22} className="text-red-500" />}
				title="Something went wrong"
				body="We couldn't tell which booking this payment was for."
				onBack={backToThread}
			/>
		);
	}

	if (rows.length > 0) {
		return (
			<CallbackShell
				icon={<CheckCircle2 size={22} className="text-emerald-500" />}
				title="Payment confirmed"
				body={summarizePaymentRows(rows)}
				onBack={backToThread}
			/>
		);
	}

	if (timedOut) {
		return (
			<CallbackShell
				icon={<Clock size={22} className="text-[var(--dashboard-orange)]" />}
				title="Still processing"
				body="Your payment is being confirmed — this can take a minute. Check the conversation shortly."
				onBack={backToThread}
			/>
		);
	}

	return (
		<CallbackShell
			icon={
				<div className="w-5 h-5 border-2 border-[var(--dashboard-orange)] border-t-transparent rounded-full animate-spin" />
			}
			title="Confirming your payment…"
			body="Hang tight while we confirm your payment with the gateway."
		/>
	);
}
