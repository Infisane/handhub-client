import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CreditCard, Lock, Settings, User } from "lucide-react";
import { useState } from "react";
import { NotificationsTab } from "#/components/dashboard/settings/notifications-tab.tsx";
import { PaymentsTab } from "#/components/dashboard/settings/payments-tab.tsx";
import { ProfileTab } from "#/components/dashboard/settings/profile-tab.tsx";
import { SecurityTab } from "#/components/dashboard/settings/security-tab.tsx";
import { useAppDispatch } from "#/core/hooks/useStore.hook";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/settings")({
	component: SettingsPage,
});

type SettingsTab =
	| "profile"
	| "security"
	| "notifications"
	| "payments_settings";

const TABS: {
	id: SettingsTab;
	label: string;
	icon: typeof User;
	desc: string;
}[] = [
	{
		id: "profile",
		label: "Account Profile",
		icon: User,
		desc: "Edit personal details, bio, and avatar",
	},
	{
		id: "security",
		label: "Security",
		icon: Lock,
		desc: "Change your account password",
	},
	{
		id: "notifications",
		label: "Notifications",
		icon: Bell,
		desc: "Configure email, push, and SMS alerts",
	},
	// {
	// 	id: "payments_settings",
	// 	label: "Billing & Escrow",
	// 	icon: CreditCard,
	// 	desc: "Default pay card and auto-funding",
	// },
];

const motionProps = {
	initial: { opacity: 0, y: 8 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -8 },
	className: "space-y-5",
} as const;

function SettingsPage() {
	const dispatch = useAppDispatch();
	const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

	return (
		<main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--dashboard-bg)]">
			{/* Header */}
			<div className="shrink-0 bg-[var(--dashboard-bg)] px-5 sm:px-8 pt-5 sm:pt-7 pb-4 border-b border-[var(--dashboard-border)]">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() =>
							dispatch(set_dashboard_flags({ isMobileSidebarOpen: true }))
						}
						className="md:hidden w-9 h-9 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text)] hover:bg-[var(--dashboard-orange-light)] transition-all shrink-0 shadow-xs"
						aria-label="Open navigation"
					>
						<Settings size={16} className="text-[var(--dashboard-orange)]" />
					</button>
					<div>
						<h2 className="font-syne font-extrabold text-[22px] sm:text-[26px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1.5">
							System Settings
						</h2>
						<p className="text-[12px] text-[var(--dashboard-muted)] font-medium">
							Manage your profile, security, and notification preferences
						</p>
					</div>
				</div>
			</div>

			<div className="flex-1 flex overflow-hidden">
				{/* Sidebar nav */}
				<div className="hidden lg:flex flex-col w-72 bg-[var(--dashboard-card)] border-r border-[var(--dashboard-border)] p-4 space-y-1.5 shrink-0">
					<span className="text-[9px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider px-3 mb-2 block">
						Configuration Sections
					</span>
					{TABS.map((tab) => {
						const isSelected = activeTab === tab.id;
						const IconComponent = tab.icon;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all border outline-none cursor-pointer",
									isSelected
										? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange-mid)] text-[var(--dashboard-orange)]"
										: "bg-transparent border-transparent text-[var(--dashboard-muted)] hover:bg-[var(--dashboard-bg)]/80 hover:text-[var(--dashboard-text)]",
								)}
							>
								<IconComponent
									size={16}
									className={cn(
										"mt-0.5 shrink-0",
										isSelected
											? "text-[var(--dashboard-orange)]"
											: "text-[var(--dashboard-muted)]",
									)}
								/>
								<div className="min-w-0">
									<p
										className={cn(
											"text-[13px] font-bold leading-none mb-1",
											isSelected
												? "text-[var(--dashboard-text)] font-extrabold"
												: "",
										)}
									>
										{tab.label}
									</p>
									<span className="text-[10px] text-[var(--dashboard-muted)] leading-tight block">
										{tab.desc}
									</span>
								</div>
							</button>
						);
					})}
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-5 sm:p-8 scrollbar-none pb-24 sm:pb-8">
					<div className="lg:hidden flex gap-1.5 overflow-x-auto scrollbar-none pb-2 border-b border-[var(--dashboard-border)]/40 mb-6 shrink-0">
						{TABS.map((tab) => {
							const isSelected = activeTab === tab.id;
							const IconComponent = tab.icon;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									className={cn(
										"px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5",
										isSelected
											? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange-mid)] text-[var(--dashboard-orange)]"
											: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)]",
									)}
								>
									<IconComponent size={13} />
									<span>{tab.label}</span>
								</button>
							);
						})}
					</div>

					<div className="max-w-2xl">
						<AnimatePresence mode="wait">
							{activeTab === "profile" && (
								<motion.div key="profile" {...motionProps}>
									<ProfileTab />
								</motion.div>
							)}
							{activeTab === "security" && (
								<motion.div key="security" {...motionProps}>
									<SecurityTab />
								</motion.div>
							)}
							{activeTab === "notifications" && (
								<motion.div key="notifications" {...motionProps}>
									<NotificationsTab />
								</motion.div>
							)}
							{activeTab === "payments_settings" && (
								<motion.div key="payments_settings" {...motionProps}>
									<PaymentsTab />
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</main>
	);
}
