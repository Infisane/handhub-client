import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, CreditCard, Lock, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotificationsTab } from "#/components/dashboard/settings/notifications-tab.tsx";
import { PaymentsTab } from "#/components/dashboard/settings/payments-tab.tsx";
import { ProfileTab } from "#/components/dashboard/settings/profile-tab.tsx";
import { SecurityTab } from "#/components/dashboard/settings/security-tab.tsx";
import { getApiErrorMessage } from "#/core/helpers/error-handler.helper";
import { useFileUpload } from "#/core/hooks/useFileUpload.hook";
import { useAppDispatch } from "#/core/hooks/useStore.hook";
import {
	useChangePasswordQuery,
	useGetNotificationPreferencesQuery,
	useGetUserProfileQuery,
	useUpdateNotificationPreferencesQuery,
	useUpdateUserProfileQuery,
} from "#/core/queries/settings.q";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";
import {
	ChangePasswordSchema,
	ProfileSchema,
} from "#/core/schemas/settings.schema";
import type { NotificationPreferenceKey } from "#/core/types/settings.types";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/settings")({
	component: SettingsPage,
});

type SettingsTab =
	| "profile"
	| "security"
	| "notifications"
	| "payments_settings";

const EMPTY_PREFS = {
	bookingUpdates: true,
	chatMessages: true,
	quotesAndInvoices: true,
	escrowAndPayments: true,
	promotions: false,
};

function fieldErrors(
	issues: readonly { path: PropertyKey[]; message: string }[],
) {
	const out: Record<string, string> = {};
	for (const issue of issues) {
		const key = issue.path[0] != null ? String(issue.path[0]) : "";
		if (key && !out[key]) out[key] = issue.message;
	}
	return out;
}

function SettingsPage() {
	const dispatch = useAppDispatch();
	const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
	const [saveSuccess, setSaveSuccess] = useState(false);

	const flashSaved = () => {
		setSaveSuccess(true);
		setTimeout(() => setSaveSuccess(false), 2500);
	};

	/* ── Profile ─────────────────────────────────────────────── */
	const { data: profile } = useGetUserProfileQuery();
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [bio, setBio] = useState("");
	const [avatar, setAvatar] = useState<string | null>(null);
	const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
		{},
	);

	useEffect(() => {
		if (!profile) return;
		setFullName(profile.fullName ?? "");
		setPhone(profile.phone ?? "");
		setAddress(profile.address ?? "");
		setBio(profile.bio ?? "");
		setAvatar(profile.avatar ?? null);
	}, [profile]);

	const updateProfile = useUpdateUserProfileQuery({
		onSuccessCallback: (updated) => {
			setAvatar(updated.avatar ?? null);
			flashSaved();
		},
	});

	const { handleFileChange, isUploading, uploadError } = useFileUpload({
		folder: "profile-photo",
		onSuccess: (publicUrl) => updateProfile.mutate({ avatar: publicUrl }),
	});

	/* ── Security ────────────────────────────────────────────── */
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [securityErrors, setSecurityErrors] = useState<Record<string, string>>(
		{},
	);

	const changePassword = useChangePasswordQuery({
		onSuccessCallback: () => {
			toast.success("Password changed successfully");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setSecurityErrors({});
			flashSaved();
		},
	});

	/* ── Notifications ───────────────────────────────────────── */
	const { data: prefs } = useGetNotificationPreferencesQuery();
	const [prefState, setPrefState] = useState(EMPTY_PREFS);

	useEffect(() => {
		if (!prefs) return;
		setPrefState({
			bookingUpdates: prefs.bookingUpdates,
			chatMessages: prefs.chatMessages,
			quotesAndInvoices: prefs.quotesAndInvoices,
			escrowAndPayments: prefs.escrowAndPayments,
			promotions: prefs.promotions,
		});
	}, [prefs]);

	const updatePrefs = useUpdateNotificationPreferencesQuery({
		onSuccessCallback: () => flashSaved(),
	});

	const togglePref = (key: NotificationPreferenceKey) =>
		setPrefState((prev) => ({ ...prev, [key]: !prev[key] }));

	/* ── Save (per active tab) ───────────────────────────────── */
	const isSaving =
		activeTab === "profile"
			? updateProfile.isPending
			: activeTab === "security"
				? changePassword.isPending
				: updatePrefs.isPending;

	const handleSaveSettings = (e: React.FormEvent) => {
		e.preventDefault();

		if (activeTab === "profile") {
			const parsed = ProfileSchema.safeParse({ fullName, phone, address, bio });
			if (!parsed.success) {
				setProfileErrors(fieldErrors(parsed.error.issues));
				return;
			}
			setProfileErrors({});
			updateProfile.mutate(parsed.data);
			return;
		}

		if (activeTab === "security") {
			const parsed = ChangePasswordSchema.safeParse({
				currentPassword,
				newPassword,
				confirmPassword,
			});
			if (!parsed.success) {
				setSecurityErrors(fieldErrors(parsed.error.issues));
				return;
			}
			setSecurityErrors({});
			changePassword.mutate(
				{ currentPassword, newPassword },
				{
					onError: (err) => {
						const message = getApiErrorMessage(err);
						if (message) setSecurityErrors({ currentPassword: message });
					},
				},
			);
			return;
		}

		if (activeTab === "notifications") {
			updatePrefs.mutate(prefState);
		}
	};

	const tabs = [
		{
			id: "profile" as const,
			label: "Account Profile",
			icon: User,
			desc: "Edit personal details, bio, and avatar",
		},
		{
			id: "security" as const,
			label: "Security",
			icon: Lock,
			desc: "Change your account password",
		},
		{
			id: "notifications" as const,
			label: "Notifications",
			icon: Bell,
			desc: "Configure email, push, and SMS alerts",
		},
		{
			id: "payments_settings" as const,
			label: "Billing & Escrow",
			icon: CreditCard,
			desc: "Default pay card and auto-funding",
		},
	];

	const showSaveBar = activeTab !== "payments_settings";

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
				<div className="flex-1 overflow-y-auto p-5 sm:p-8 scrollbar-none pb-24 sm:pb-8 flex flex-col justify-between">
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
											: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)]",
									)}
								>
									<IconComponent size={13} />
									<span>{tab.label}</span>
								</button>
							);
						})}
					</div>

					<form
						onSubmit={handleSaveSettings}
						className="space-y-6 flex-1 max-w-2xl"
					>
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
										fullName={fullName}
										setFullName={setFullName}
										email={profile?.email ?? ""}
										phone={phone}
										setPhone={setPhone}
										address={address}
										setAddress={setAddress}
										bio={bio}
										setBio={setBio}
										avatar={avatar}
										onAvatarSelected={handleFileChange}
										isUploading={isUploading}
										uploadError={uploadError}
										onAvatarDelete={() => updateProfile.mutate({ avatar: "" })}
										errors={profileErrors}
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
										errors={securityErrors}
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
									<NotificationsTab prefs={prefState} onToggle={togglePref} />
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
									<PaymentsTab />
								</motion.div>
							)}
						</AnimatePresence>

						{showSaveBar && (
							<div className="pt-4 border-t border-[var(--dashboard-border)]/40 flex items-center justify-end gap-3 shrink-0">
								<button
									type="submit"
									disabled={isSaving}
									className={cn(
										"py-2.5 px-5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 min-w-36 active:scale-95 disabled:opacity-60",
										saveSuccess
											? "bg-green-600 text-white shadow-green-500/10 hover:bg-green-700"
											: "bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white",
									)}
								>
									{isSaving ? (
										<>
											<svg
												className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white inline"
												fill="none"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												/>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												/>
											</svg>
											Saving…
										</>
									) : saveSuccess ? (
										<>
											<Check size={14} className="stroke-[3]" /> Saved ✓
										</>
									) : activeTab === "security" ? (
										"Change Password"
									) : (
										"Save Changes"
									)}
								</button>
							</div>
						)}
					</form>
				</div>
			</div>
		</main>
	);
}
