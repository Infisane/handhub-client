import type {
	NotificationPreferenceKey,
	NotificationPreferences,
} from "#/core/types/settings.types";
import { SettingsToggle } from "./settings-toggle.tsx";

interface NotificationsTabProps {
	prefs: Pick<NotificationPreferences, NotificationPreferenceKey>;
	onToggle: (key: NotificationPreferenceKey) => void;
}

const ITEMS: {
	key: NotificationPreferenceKey;
	title: string;
	desc: string;
}[] = [
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

export function NotificationsTab({ prefs, onToggle }: NotificationsTabProps) {
	return (
		<>
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
							checked={prefs[item.key]}
							onChange={() => onToggle(item.key)}
							aria-label={`Toggle ${item.title}`}
						/>
					</div>
				))}
			</div>
		</>
	);
}
