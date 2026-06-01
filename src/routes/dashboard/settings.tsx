import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
	Settings,
	User,
	Lock,
	Bell,
	CreditCard,
	Check,
	Upload,
	Eye,
	EyeOff,
	ShieldAlert,
	Sparkles,
	Sliders,
} from "lucide-react";
import { useState, useContext } from "react";
import { DashboardContext } from "./route";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/settings")({ 
	component: SettingsPage,
});

/* ── Types & Interfaces ────────────────────────────────────── */
type SettingsTab = "profile" | "security" | "notifications" | "payments_settings";

/* ── Main Component ────────────────────────────────────────── */
function SettingsPage() {
	const { setIsMobileSidebarOpen } = useContext(DashboardContext);

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

	// Password strength calculation
	const passwordStrength = () => {
		if (!newPassword) return 0;
		let score = 0;
		if (newPassword.length >= 8) score++;
		if (/[A-Z]/.test(newPassword)) score++;
		if (/[0-9]/.test(newPassword)) score++;
		if (/[^A-Za-z0-9]/.test(newPassword)) score++;
		return score;
	};

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
							onClick={() => setIsMobileSidebarOpen(true)}
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
									<div>
										<h3 className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)] leading-none mb-1 flex items-center gap-2">
											Personal Profile Details
										</h3>
										<p className="text-[11px] text-[var(--dashboard-muted)]">
											Update your personal coordinates and profile bio
										</p>
									</div>

									{/* Premium Avatar Modification Section */}
									<div className="flex items-center gap-4 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-4.5 shadow-xs shrink-0">
										<div className="w-14 h-14 rounded-full bg-[var(--dashboard-orange)] flex items-center justify-center text-lg font-black text-white shrink-0 border border-white/10 ring-4 ring-[var(--dashboard-orange-light)]/20 shadow-md">
											AK
										</div>
										<div className="space-y-1.5 min-w-0">
											<div className="flex gap-2">
												<button
													type="button"
													className="py-1.5 px-3 bg-[var(--dashboard-orange-light)] hover:bg-[var(--dashboard-orange)] hover:text-white border border-[var(--dashboard-orange-mid)] text-[var(--dashboard-orange)] rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 cursor-pointer transition-all"
												>
													<Upload size={12} /> Replace Avatar
												</button>
												<button
													type="button"
													className="py-1.5 px-3 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)] rounded-lg text-[10.5px] font-bold cursor-pointer"
												>
													Delete
												</button>
											</div>
											<span className="text-[10px] text-[var(--dashboard-muted)] font-medium leading-none block">
												JPG or PNG, max size 2MB. Fits cleanly inside circular badges.
											</span>
										</div>
									</div>

									{/* Main Profile Grid inputs */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="space-y-1.5">
											<label className="text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
												Full Username Name
											</label>
											<input
												type="text"
												required
												value={name}
												onChange={(e) => setName(e.target.value)}
												placeholder="Adeola Kamara"
												className="w-full px-3.5 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] font-semibold text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
											/>
										</div>

										<div className="space-y-1.5">
											<label className="text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
												Verified Email Address
											</label>
											<input
												type="email"
												required
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												placeholder="adeola@handhub.co"
												className="w-full px-3.5 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] font-semibold text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
											/>
										</div>

										<div className="space-y-1.5">
											<label className="text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
												Mobile Telephone Number
											</label>
											<input
												type="text"
												required
												value={phone}
												onChange={(e) => setPhone(e.target.value)}
												placeholder="+234 812 345 6789"
												className="w-full px-3.5 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] font-semibold text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
											/>
										</div>

										<div className="space-y-1.5">
											<label className="text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
												Primary Address Coordinate
											</label>
											<input
												type="text"
												required
												value={address}
												onChange={(e) => setAddress(e.target.value)}
												placeholder="Lekki, Lagos"
												className="w-full px-3.5 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] font-semibold text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
											/>
										</div>
									</div>

									<div className="space-y-1.5">
										<label className="text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
											Biography / Description (Community notes)
										</label>
										<textarea
											rows={3}
											value={bio}
											onChange={(e) => setBio(e.target.value)}
											placeholder="Short description..."
											className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] resize-none"
										/>
									</div>
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
									<div>
										<h3 className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)] leading-none mb-1 flex items-center gap-2">
											Security Credentials
										</h3>
										<p className="text-[11px] text-[var(--dashboard-muted)]">
											Update password logs and secure authentication tools
										</p>
									</div>

									{/* Password modification segment */}
									<div className="space-y-4">
										<div className="space-y-1.5">
											<label className="text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
												Current Password
											</label>
											<div className="relative">
												<input
													type={showCurrent ? "text" : "password"}
													value={currentPassword}
													onChange={(e) => setCurrentPassword(e.target.value)}
													placeholder="••••••••"
													className="w-full pl-3.5 pr-9 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] font-mono text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
												/>
												<button
													type="button"
													onClick={() => setShowCurrent(!showCurrent)}
													className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)]"
												>
													{showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
												</button>
											</div>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="space-y-1.5">
												<label className="text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
													New Password
												</label>
												<div className="relative">
													<input
														type={showNew ? "text" : "password"}
														value={newPassword}
														onChange={(e) => setNewPassword(e.target.value)}
														placeholder="••••••••"
														className="w-full pl-3.5 pr-9 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] font-mono text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
													/>
													<button
														type="button"
														onClick={() => setShowNew(!showNew)}
														className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)]"
													>
														{showNew ? <EyeOff size={14} /> : <Eye size={14} />}
													</button>
												</div>

												{/* Strength indicator line */}
												{newPassword && (
													<div className="space-y-1 mt-1">
														<div className="flex gap-1 h-1.5">
															{Array.from({ length: 4 }).map((_, i) => (
																<div
																	key={i}
																	className={cn(
																		"flex-1 h-full rounded-full transition-all",
																		i < passwordStrength()
																			? passwordStrength() <= 2
																				? "bg-red-500 animate-pulse"
																				: passwordStrength() === 3
																				? "bg-amber-500"
																				: "bg-green-500"
																			: "bg-[var(--dashboard-border)]/50"
																	)}
																/>
															))}
														</div>
														<span className="text-[9px] text-[var(--dashboard-muted)] font-bold block text-right">
															{passwordStrength() <= 2 ? "Weak" : passwordStrength() === 3 ? "Good" : "Strong!"}
														</span>
													</div>
												)}
											</div>

											<div className="space-y-1.5">
												<label className="text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
													Confirm New Password
												</label>
												<div className="relative">
													<input
														type={showConfirm ? "text" : "password"}
														value={confirmPassword}
														onChange={(e) => setConfirmPassword(e.target.value)}
														placeholder="••••••••"
														className="w-full pl-3.5 pr-9 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] font-mono text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
													/>
													<button
														type="button"
														onClick={() => setShowConfirm(!showConfirm)}
														className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)]"
													>
														{showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
													</button>
												</div>
											</div>
										</div>
									</div>

									{/* 2-Factor Authentication slider card */}
									<div className="border border-[var(--dashboard-border)] rounded-2xl p-4.5 space-y-3 bg-[var(--dashboard-card)] shadow-xs relative overflow-hidden flex items-center justify-between">
										<div className="flex gap-3 items-center min-w-0">
											<div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
												<ShieldAlert size={16} />
											</div>
											<div className="min-w-0">
												<h4 className="text-[13px] font-extrabold text-[var(--dashboard-text)] leading-none mb-1">
													Two-Factor Authentication (2FA)
												</h4>
												<p className="text-[10.5px] text-[var(--dashboard-muted)] leading-normal">
													Request a unique passcode via SMS or email for each payment authorization
												</p>
											</div>
										</div>

										{/* Interactive slider switch trigger */}
										<button
											type="button"
											onClick={() => setTwoFactor(!twoFactor)}
											className={cn(
												"w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 relative flex items-center",
												twoFactor ? "bg-green-500" : "bg-[var(--dashboard-border)]/60"
											)}
										>
											<motion.div
												layout
												transition={{ type: "spring", stiffness: 450, damping: 25 }}
												className="w-4.5 h-4.5 rounded-full bg-white shadow-xs"
												style={{ x: twoFactor ? "18px" : "0px" }}
											/>
										</button>
									</div>
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
										
										{/* Item 1: Booking logs */}
										<div className="flex items-center justify-between gap-3 text-[12.5px] border-b border-[var(--dashboard-border)]/40 pb-3">
											<div>
												<h4 className="font-extrabold text-[var(--dashboard-text)] leading-none mb-0.5">Booking Status Alerts</h4>
												<p className="text-[10px] text-[var(--dashboard-muted)] font-semibold leading-relaxed">
													Email and push updates when booking is scheduled, in-progress, or finalized.
												</p>
											</div>
											<button
												type="button"
												onClick={() => setNotifBooking(!notifBooking)}
												className={cn(
													"w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 relative flex items-center",
													notifBooking ? "bg-green-500" : "bg-[var(--dashboard-border)]/60"
												)}
											>
												<motion.div
													layout
													transition={{ type: "spring", stiffness: 450, damping: 25 }}
													className="w-4 h-4 rounded-full bg-white shadow-xs"
													style={{ x: notifBooking ? "14px" : "0px" }}
												/>
											</button>
										</div>

										{/* Item 2: Chats */}
										<div className="flex items-center justify-between gap-3 text-[12.5px] border-b border-[var(--dashboard-border)]/40 pb-3">
											<div>
												<h4 className="font-extrabold text-[var(--dashboard-text)] leading-none mb-0.5">New Chat messages</h4>
												<p className="text-[10px] text-[var(--dashboard-muted)] font-semibold leading-relaxed">
													Instant push notification when an active artisan sends a message.
												</p>
											</div>
											<button
												type="button"
												onClick={() => setNotifChat(!notifChat)}
												className={cn(
													"w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 relative flex items-center",
													notifChat ? "bg-green-500" : "bg-[var(--dashboard-border)]/60"
												)}
											>
												<motion.div
													layout
													transition={{ type: "spring", stiffness: 450, damping: 25 }}
													className="w-4 h-4 rounded-full bg-white shadow-xs"
													style={{ x: notifChat ? "14px" : "0px" }}
												/>
											</button>
										</div>

										{/* Item 3: Proposals */}
										<div className="flex items-center justify-between gap-3 text-[12.5px] border-b border-[var(--dashboard-border)]/40 pb-3">
											<div>
												<h4 className="font-extrabold text-[var(--dashboard-text)] leading-none mb-0.5">Quote Proposals Received</h4>
												<p className="text-[10px] text-[var(--dashboard-muted)] font-semibold leading-relaxed">
													SMS notification when an expert uploads a fixed proposal rate sheet.
												</p>
											</div>
											<button
												type="button"
												onClick={() => setNotifQuote(!notifQuote)}
												className={cn(
													"w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 relative flex items-center",
													notifQuote ? "bg-green-500" : "bg-[var(--dashboard-border)]/60"
												)}
											>
												<motion.div
													layout
													transition={{ type: "spring", stiffness: 450, damping: 25 }}
													className="w-4 h-4 rounded-full bg-white shadow-xs"
													style={{ x: notifQuote ? "14px" : "0px" }}
												/>
											</button>
										</div>

										{/* Item 4: Escrow status */}
										<div className="flex items-center justify-between gap-3 text-[12.5px] border-b border-[var(--dashboard-border)]/40 pb-3">
											<div>
												<h4 className="font-extrabold text-[var(--dashboard-text)] leading-none mb-0.5">Escrow Transaction updates</h4>
												<p className="text-[10px] text-[var(--dashboard-muted)] font-semibold leading-relaxed">
													Alerts when payments are secured, cleared, or active refund balances are pending.
												</p>
											</div>
											<button
												type="button"
												onClick={() => setNotifEscrow(!notifEscrow)}
												className={cn(
													"w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 relative flex items-center",
													notifEscrow ? "bg-green-500" : "bg-[var(--dashboard-border)]/60"
												)}
											>
												<motion.div
													layout
													transition={{ type: "spring", stiffness: 450, damping: 25 }}
													className="w-4 h-4 rounded-full bg-white shadow-xs"
													style={{ x: notifEscrow ? "14px" : "0px" }}
												/>
											</button>
										</div>

										{/* Item 5: Promo */}
										<div className="flex items-center justify-between gap-3 text-[12.5px]">
											<div>
												<h4 className="font-extrabold text-[var(--dashboard-text)] leading-none mb-0.5">Discounts &amp; Promotional campaigns</h4>
												<p className="text-[10px] text-[var(--dashboard-muted)] font-semibold leading-relaxed">
													Occasional updates on seasonal home maintenance coupons and deals.
												</p>
											</div>
											<button
												type="button"
												onClick={() => setNotifPromo(!notifPromo)}
												className={cn(
													"w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 relative flex items-center",
													notifPromo ? "bg-green-500" : "bg-[var(--dashboard-border)]/60"
												)}
											>
												<motion.div
													layout
													transition={{ type: "spring", stiffness: 450, damping: 25 }}
													className="w-4 h-4 rounded-full bg-white shadow-xs"
													style={{ x: notifPromo ? "14px" : "0px" }}
												/>
											</button>
										</div>

									</div>
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
									<div>
										<h3 className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)] leading-none mb-1 flex items-center gap-2">
											Billing &amp; Wallet Parameters
										</h3>
										<p className="text-[11px] text-[var(--dashboard-muted)]">
											Define default funding methods and escrow trigger limits
										</p>
									</div>

									{/* Default method select */}
									<div className="space-y-1.5">
										<label className="text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
											Default Funding Source Card
										</label>
										<select
											value={defaultCard}
											onChange={(e) => setDefaultCard(e.target.value)}
											className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] font-semibold outline-none focus:border-[var(--dashboard-orange)]"
										>
											<option value="card-1">Visa Ending in 4821 (Default)</option>
											<option value="card-2">Mastercard Ending in 9012</option>
										</select>
									</div>

									{/* Auto funding configuration */}
									<div className="border border-[var(--dashboard-border)] rounded-2xl p-4.5 space-y-4 bg-[var(--dashboard-card)] shadow-xs">
										<div className="flex items-center justify-between gap-3">
											<div className="flex gap-3 items-center min-w-0">
												<div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[var(--dashboard-orange)] shrink-0">
													<Sparkles size={16} />
												</div>
												<div className="min-w-0">
													<h4 className="text-[13px] font-extrabold text-[var(--dashboard-text)] leading-none mb-1">
														Automatic Wallet Funding
													</h4>
													<p className="text-[10.5px] text-[var(--dashboard-muted)] leading-normal">
														Trigger auto-charge when balance drops below threshold during bookings
													</p>
												</div>
											</div>

											<button
												type="button"
												onClick={() => setAutoFund(!autoFund)}
												className={cn(
													"w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 relative flex items-center",
													autoFund ? "bg-green-500" : "bg-[var(--dashboard-border)]/60"
												)}
											>
												<motion.div
													layout
													transition={{ type: "spring", stiffness: 450, damping: 25 }}
													className="w-4.5 h-4.5 rounded-full bg-white shadow-xs"
													style={{ x: autoFund ? "18px" : "0px" }}
												/>
											</button>
										</div>

										{autoFund && (
											<motion.div
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												className="space-y-2 border-t border-[var(--dashboard-border)]/40 pt-4"
											>
												<label className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
													Minimum Top-up Trigger Threshold (₦)
												</label>
												<div className="flex gap-3 items-center">
													<Sliders size={15} className="text-[var(--dashboard-muted)] shrink-0" />
													<input
														type="range"
														min="10000"
														max="100000"
														step="5000"
														value={threshold}
														onChange={(e) => setThreshold(e.target.value)}
														className="flex-1 accent-[var(--dashboard-orange)]"
													/>
													<span className="font-syne font-black text-[13px] text-[var(--dashboard-text)] bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] px-2.5 py-1 rounded-lg shrink-0">
														₦{parseInt(threshold).toLocaleString()}
													</span>
												</div>
											</motion.div>
										)}
									</div>
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
									"py-2.5 px-5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 min-w-36 active:scale-95",
									saveSuccess
										? "bg-green-600 text-white shadow-green-500/10 hover:bg-green-700"
										: "bg-[var(--dashboard-orange)] hover:bg-orange-600 text-white"
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
