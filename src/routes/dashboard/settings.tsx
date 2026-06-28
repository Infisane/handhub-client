import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, User, Lock, Bell, CreditCard, Check } from "lucide-react";
import { useState } from "react";
import { useAppDispatch } from "#/core/hooks/useStore.hook";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";
import { cn } from "#/lib/utils.ts";
import { ProfileTab } from "#/components/dashboard/settings/profile-tab.tsx";
import { SecurityTab } from "#/components/dashboard/settings/security-tab.tsx";
import { NotificationsTab } from "#/components/dashboard/settings/notifications-tab.tsx";
import { PaymentsTab } from "#/components/dashboard/settings/payments-tab.tsx";

export const Route = createFileRoute("/dashboard/settings")({ 
	component: SettingsPage,
});

/* ── Types & Interfaces ────────────────────────────────────── */
type SettingsTab = "profile" | "security" | "notifications" | "payments_settings";

/* ── Main Component ────────────────────────────────────────── */
function SettingsPage() {
	const dispatch = useAppDispatch();

	// Navigation tab state
	const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

	// Active saving visual feedbacks
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Tab 1: Profile form states
	const [name, setName] = useState("Adeola Kamara");
	const [email, setEmail] = useState("adeola@handhub.co");
	const [phone, setPhone] = useState("+234 812 345 6789");
	const [address, setAddress] = useState("Lekki, Lagos");
	const [bio, setBio] = useState("Homeowner looking for reliable certified artisans in Lekki phase 1 area.");

	// Tab 2: Security form states
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [twoFactor, setTwoFactor] = useState(false);

	// Tab 3: Notifications states
	const [notifBooking, setNotifBooking] = useState(true);
	const [notifChat, setNotifChat] = useState(true);
	const [notifQuote, setNotifQuote] = useState(true);
	const [notifEscrow, setNotifEscrow] = useState(true);
	const [notifPromo, setNotifPromo] = useState(false);

	// Tab 4: Payments parameters states
	const [autoFund, setAutoFund] = useState(false);
	const [threshold, setThreshold] = useState("20000");
	const [defaultCard, setDefaultCard] = useState("card-1");

	// Save settings callback
	const handleSaveSettings = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);
		setSaveSuccess(false);

		// Simulate server roundtrip
		setTimeout(() => {
			setIsSaving(false);
			setSaveSuccess(true);

			// Reset success state after 2.5 seconds
			setTimeout(() => {
				setSaveSuccess(false);
			}, 2500);
		}, 1000);
	};

	// Tab configuration
	const tabs = [
		{ id: "profile" as const, label: "Account Profile", icon: User, desc: "Edit personal details, bio, and avatar information" },
		{ id: "security" as const, label: "Security & Logins", icon: Lock, desc: "Manage passwords, 2-factor authentication, and status" },
		{ id: "notifications" as const, label: "Notifications", icon: Bell, desc: "Configure email, push updates, and SMS notifications" },
		{ id: "payments_settings" as const, label: "Billing & Escrow", icon: CreditCard, desc: "Select default pay card, auto-funding parameters" },
	];

	return (
		<main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--dashboard-bg)]">
			
			{/* ── Top Bar Header & Page Title ───────────────────────────────────────── */}
			<div className="shrink-0 bg-[var(--dashboard-bg)] px-5 sm:px-8 pt-5 sm:pt-7 pb-4 border-b border-[var(--dashboard-border)]">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => dispatch(set_dashboard_flags({ isMobileSidebarOpen: true }))}
							className="md:hidden w-9 h-9 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text)] hover:bg-[var(--dashboard-orange-light)] transition-all shrink-0 shadow-xs"
							aria-label="Open navigation"
						>
							<Settings size={16} className="text-[var(--dashboard-orange)]" />
						</button>
						<div>
							<h2 className="font-syne font-extrabold text-[22px] sm:text-[26px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1.5 flex items-center gap-2">
								System Settings
							</h2>
							<p className="text-[12px] text-[var(--dashboard-muted)] font-medium">
								Customize system parameters, profile credentials, notifications, and security protocols
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* ── Split Layout Workspace ────────────────────────────────────────── */}
			<div className="flex-1 flex overflow-hidden">
				
				{/* ── Left Sidebar Settings Navigation Tabs ─────────────────────────────── */}
				<div className="hidden lg:flex flex-col w-72 bg-[var(--dashboard-card)] border-r border-[var(--dashboard-border)] p-4 space-y-1.5 shrink-0">
					<span className="text-[9px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider px-3 mb-2 block">
						Configuration Sections
					</span>
					{tabs.map((tab) => {
						const isSelected = activeTab === tab.id;
						const IconComponent = tab.icon;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => {
									setActiveTab(tab.id);
									setSaveSuccess(false);
								}}
								className={cn(
									"w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all border outline-none cursor-pointer",
									isSelected
										? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange-mid)] text-[var(--dashboard-orange)]"
										: "bg-transparent border-transparent text-[var(--dashboard-muted)] hover:bg-[var(--dashboard-bg)]/80 hover:text-[var(--dashboard-text)]"
								)}
							>
								<IconComponent size={16} className={cn("mt-0.5 shrink-0", isSelected ? "text-[var(--dashboard-orange)]" : "text-[var(--dashboard-muted)]")} />
								<div className="min-w-0">
									<p className={cn("text-[13px] font-bold leading-none mb-1", isSelected ? "text-[var(--dashboard-text)] font-extrabold" : "")}>
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

				{/* ── Right Content Form Area ─────────────────────────────────────────── */}
				<div className="flex-1 overflow-y-auto p-5 sm:p-8 scrollbar-none pb-24 sm:pb-8 flex flex-col justify-between">
					
					{/* Settings Tabs Bar mobile/tablet only */}
					<div className="lg:hidden flex gap-1.5 overflow-x-auto scrollbar-none pb-2 border-b border-[var(--dashboard-border)]/40 mb-6 shrink-0">
						{tabs.map((tab) => {
							const isSelected = activeTab === tab.id;
							const IconComponent = tab.icon;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => {
										setActiveTab(tab.id);
										setSaveSuccess(false);
									}}
									className={cn(
										"px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5",
										isSelected
											? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange-mid)] text-[var(--dashboard-orange)]"
											: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)]"
									)}
								>
									<IconComponent size={13} />
									<span>{tab.label}</span>
								</button>
							);
						})}
					</div>

					<form onSubmit={handleSaveSettings} className="space-y-6 flex-1 max-w-2xl">
						<AnimatePresence mode="wait">
							{activeTab === "profile" && (
								<motion.div
									key="profile"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									className="space-y-5"
								>
									<ProfileTab
										name={name}
										setName={setName}
										email={email}
										setEmail={setEmail}
										phone={phone}
										setPhone={setPhone}
										address={address}
										setAddress={setAddress}
										bio={bio}
										setBio={setBio}
									/>
								</motion.div>
							)}

							{activeTab === "security" && (
								<motion.div
									key="security"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									className="space-y-5"
								>
									<SecurityTab
										currentPassword={currentPassword}
										setCurrentPassword={setCurrentPassword}
										newPassword={newPassword}
										setNewPassword={setNewPassword}
										confirmPassword={confirmPassword}
										setConfirmPassword={setConfirmPassword}
										showCurrent={showCurrent}
										setShowCurrent={setShowCurrent}
										showNew={showNew}
										setShowNew={setShowNew}
										showConfirm={showConfirm}
										setShowConfirm={setShowConfirm}
										twoFactor={twoFactor}
										setTwoFactor={setTwoFactor}
									/>
								</motion.div>
							)}

							{activeTab === "notifications" && (
								<motion.div
									key="notifications"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									className="space-y-5"
								>
									<NotificationsTab
										notifBooking={notifBooking}
										setNotifBooking={setNotifBooking}
										notifChat={notifChat}
										setNotifChat={setNotifChat}
										notifQuote={notifQuote}
										setNotifQuote={setNotifQuote}
										notifEscrow={notifEscrow}
										setNotifEscrow={setNotifEscrow}
										notifPromo={notifPromo}
										setNotifPromo={setNotifPromo}
									/>
								</motion.div>
							)}

							{activeTab === "payments_settings" && (
								<motion.div
									key="payments_settings"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									className="space-y-5"
								>
									<PaymentsTab
										autoFund={autoFund}
										setAutoFund={setAutoFund}
										threshold={threshold}
										setThreshold={setThreshold}
										defaultCard={defaultCard}
										setDefaultCard={setDefaultCard}
									/>
								</motion.div>
							)}
						</AnimatePresence>

						{/* ── Fixed Footer actions visual button ───────────────────────────── */}
						<div className="pt-4 border-t border-[var(--dashboard-border)]/40 flex items-center justify-end gap-3 shrink-0">
							<button
								type="button"
								onClick={() => setSaveSuccess(false)}
								className="py-2.5 px-4 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card)] text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								Restore Defaults
							</button>

							<button
								type="submit"
								disabled={isSaving}
								className={cn(
									"py-2.5 px-5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 min-w-36 active:scale-95",
									saveSuccess
										? "bg-green-600 text-white shadow-green-500/10 hover:bg-green-700"
										: "bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white"
								)}
							>
								{isSaving ? (
									<>
										<svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white inline" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
										</svg>
										Saving Logs...
									</>
								) : saveSuccess ? (
									<>
										<Check size={14} className="stroke-[3]" /> Settings Saved ✓
									</>
								) : (
									"Save Parameters"
								)}
							</button>
						</div>

					</form>
				</div>

			</div>

		</main>
	);
}
