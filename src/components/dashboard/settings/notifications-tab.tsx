import { useState } from "react";
import {
	useGetNotificationPreferencesQuery,
	useUpdateNotificationPreferencesQuery,
} from "#/core/queries/settings.q";
import type { NotificationPreferenceKey } from "#/core/types/settings.types";
import { SettingsSaveBar, useSavedFlash } from "./settings-save-bar.tsx";
import { SettingsToggle } from "./settings-toggle.tsx";

const ITEMS: { key: NotificationPreferenceKey; title: string; desc: string }[] =
	[
		{
			key: "bookingUpdates",
			title: "Booking Status Alerts",
			desc: "When a booking is accepted, in progress, completed, or cancelled.",
		},
		{
			key: "chatMessages",
			title: "New Chat Messages",
			desc: "When a provider or customer sends a message in a thread.",
		},
		{
			key: "quotesAndInvoices",
			title: "Quotes & Invoices",
			desc: "When an invoice is issued, accepted, rejected, or recalled.",
		},
		{
			key: "escrowAndPayments",
			title: "Escrow & Payments",
			desc: "When a payment is held, released, or refunded.",
		},
		{
			key: "promotions",
			title: "Discounts & Promotions",
			desc: "Occasional updates on seasonal deals and coupons.",
		},
	];

const EMPTY_PREFS: Record<NotificationPreferenceKey, boolean> = {
	bookingUpdates: true,
	chatMessages: true,
	quotesAndInvoices: true,
	escrowAndPayments: true,
	promotions: false,
};

export function NotificationsTab() {
	const { data: prefs } = useGetNotificationPreferencesQuery();
	const [state, setState] = useState(EMPTY_PREFS);
	const [seededId, setSeededId] = useState<string | null>(null);
	const [saved, flashSaved] = useSavedFlash();

	// Seed from the loaded preferences (adjust state during render — no effect).
	if (prefs && prefs.id !== seededId) {
		setSeededId(prefs.id);
		setState({
			bookingUpdates: prefs.bookingUpdates,
			chatMessages: prefs.chatMessages,
			quotesAndInvoices: prefs.quotesAndInvoices,
			escrowAndPayments: prefs.escrowAndPayments,
			promotions: prefs.promotions,
		});
	}

	const update = useUpdateNotificationPreferencesQuery({
		onSuccessCallback: () => flashSaved(),
	});

	const toggle = (key: NotificationPreferenceKey) =>
		setState((prev) => ({ ...prev, [key]: !prev[key] }));

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		update.mutate(state);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div>
				<h3 className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)] leading-none mb-1">
					Notification Center
				</h3>
				<p className="text-[11px] text-[var(--dashboard-muted)]">
					Choose which updates you want saved to your preferences.
				</p>
			</div>

			<div className="space-y-3.5 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 shadow-xs">
				{ITEMS.map((item, i) => (
					<div
						key={item.key}
						className={`flex items-center justify-between gap-3 text-[12.5px] ${
							i < ITEMS.length - 1
								? "border-b border-[var(--dashboard-border)]/40 pb-3"
								: ""
						}`}
					>
						<div>
							<h4 className="font-extrabold text-[var(--dashboard-text)] leading-none mb-0.5">
								{item.title}
							</h4>
							<p className="text-[10px] text-[var(--dashboard-muted)] font-semibold leading-relaxed">
								{item.desc}
							</p>
						</div>
						<SettingsToggle
							checked={state[item.key]}
							onChange={() => toggle(item.key)}
							aria-label={`Toggle ${item.title}`}
						/>
					</div>
				))}
			</div>

			<SettingsSaveBar isSaving={update.isPending} saved={saved} />
		</form>
	);
}
