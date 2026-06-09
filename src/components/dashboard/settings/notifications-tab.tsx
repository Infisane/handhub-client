import type { Dispatch, SetStateAction } from "react";
import { SettingsToggle } from "./settings-toggle.tsx";

interface NotificationsTabProps {
	notifBooking: boolean;
	setNotifBooking: Dispatch<SetStateAction<boolean>>;
	notifChat: boolean;
	setNotifChat: Dispatch<SetStateAction<boolean>>;
	notifQuote: boolean;
	setNotifQuote: Dispatch<SetStateAction<boolean>>;
	notifEscrow: boolean;
	setNotifEscrow: Dispatch<SetStateAction<boolean>>;
	notifPromo: boolean;
	setNotifPromo: Dispatch<SetStateAction<boolean>>;
}

export function NotificationsTab({
	notifBooking,
	setNotifBooking,
	notifChat,
	setNotifChat,
	notifQuote,
	setNotifQuote,
	notifEscrow,
	setNotifEscrow,
	notifPromo,
	setNotifPromo,
}: NotificationsTabProps) {
	const items = [
		{
			id: "booking",
			title: "Booking Status Alerts",
			desc: "Email and push updates when booking is scheduled, in-progress, or finalized.",
			checked: notifBooking,
			onChange: () => setNotifBooking(!notifBooking),
		},
		{
			id: "chat",
			title: "New Chat messages",
			desc: "Instant push notification when an active artisan sends a message.",
			checked: notifChat,
			onChange: () => setNotifChat(!notifChat),
		},
		{
			id: "quote",
			title: "Quote Proposals Received",
			desc: "SMS notification when an expert uploads a fixed proposal rate sheet.",
			checked: notifQuote,
			onChange: () => setNotifQuote(!notifQuote),
		},
		{
			id: "escrow",
			title: "Escrow Transaction updates",
			desc: "Alerts when payments are secured, cleared, or active refund balances are pending.",
			checked: notifEscrow,
			onChange: () => setNotifEscrow(!notifEscrow),
		},
		{
			id: "promo",
			title: "Discounts & Promotional campaigns",
			desc: "Occasional updates on seasonal home maintenance coupons and deals.",
			checked: notifPromo,
			onChange: () => setNotifPromo(!notifPromo),
		},
	];

	return (
		<>
			<div>
				<h3 className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)] leading-none mb-1 flex items-center gap-2">
					Notification Center
				</h3>
				<p className="text-[11px] text-[var(--dashboard-muted)]">
					Define when and how you receive alerts from handhub system
				</p>
			</div>

			{/* List of custom switch buttons */}
			<div className="space-y-3.5 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 shadow-xs">
				{items.map((item, i) => (
					<div
						key={item.id}
						className={`flex items-center justify-between gap-3 text-[12.5px] ${
							i < items.length - 1
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
							checked={item.checked}
							onChange={item.onChange}
							aria-label={`Toggle ${item.title}`}
						/>
					</div>
				))}
			</div>
		</>
	);
}
