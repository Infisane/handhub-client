import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
	useLocation,
} from "@tanstack/react-router";
import {
	Calendar,
	ChevronUp,
	CreditCard,
	HelpCircle,
	LayoutDashboard,
	LogOut,
	MapPin,
	Menu,
	MessageSquare,
	Search,
	Settings,
	Star,
	User,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ChatConversation } from "#/components/chat/chat-conversation";
import { ArtisanOnboarding } from "#/components/dashboard/artisan-onboarding/artisan-onboarding";
import { LocationAlert } from "#/components/dashboard/location-alert";
import { LogoutDialog } from "#/components/dashboard/logout-dialog";
import { HHLogo } from "#/components/hh/logo";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import { UserAvatarBadge } from "#/components/ui/user-avatar-badge";
import {
	clearStoredSession,
	readStoredSession,
} from "#/core/helpers/auth-storage.helper";
import { USER_TYPES } from "#/core/helpers/constants.helper";
import { useChatSocket } from "#/core/hooks/useChatSocket.hook";
import { useEnrichedProviderProfile } from "#/core/hooks/useEnrichedProviderProfile.hook";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { useUserLocation } from "#/core/hooks/useUserLocation.hook";
import { useMeQuery } from "#/core/queries/auth.q";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";

/**
 * Canonical dashboard route paths — shared between the desktop sidebar,
 * the mobile bottom tab bar, and any other navigation surface.
 */
export const DASHBOARD_PATHS = {
	dashboard: "/dashboard",
	artisans: "/dashboard/artisans",
	bookings: "/dashboard/bookings",
	messages: "/dashboard/messages",
	payments: "/dashboard/payments",
	reviews: "/dashboard/reviews",
	myArea: "/dashboard/my-area",
	settings: "/dashboard/settings",
} as const;

export const Route = createFileRoute("/dashboard")({
	beforeLoad: () => {
		if (typeof window !== "undefined" && !readStoredSession()) {
			throw redirect({ to: "/signin" });
		}
	},
	component: DashboardLayout,
});

function DashboardLayout() {
	useMeQuery();
	const { getPosition: retryLocation } = useUserLocation();
	useChatSocket();
	const { pathname } = useLocation();
	const navigate = Route.useNavigate();
	const dispatch = useAppDispatch();
	const hasActiveChat = useAppSelector((s) => s.dashboardStore.hasActiveChat);
	const activeThreadId = useAppSelector((s) => s.dashboardStore.activeThreadId);
	const activeProviderId = useAppSelector(
		(s) => s.dashboardStore.activeProviderId,
	);
	const isMobileSidebarOpen = useAppSelector(
		(s) => s.dashboardStore.isMobileSidebarOpen,
	);
	const onboardingDismissed = useAppSelector(
		(s) => s.dashboardStore.onboardingDismissed,
	);
	const user = useAppSelector((s) => s.authStore.user);
	const providerProfile = useEnrichedProviderProfile();

	const initials =
		user?.fullName
			?.split(" ")
			.slice(0, 2)
			.map((w) => w[0])
			.join("")
			.toUpperCase() ?? "";

	const locationLine = (() => {
		const ward = providerProfile?.ward?.name;
		const lga = providerProfile?.lga?.name;
		const state = providerProfile?.state?.name;
		if (ward && state) return `${ward}, ${state}`;
		if (lga && state) return `${lga}, ${state}`;
		return state ?? null;
	})();

	const showOnboarding =
		user?.userType === USER_TYPES.provider &&
		user?.providerProfile === null &&
		!onboardingDismissed;
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);

	// beforeLoad can't check localStorage during SSR, so a typed URL / full page
	// load skips that guard entirely. This client-only check catches it once
	// hydrated.
	useEffect(() => {
		if (!readStoredSession()) {
			navigate({ to: "/signin" });
		}
	}, [navigate]);

	const shouldShowChatSurface =
		hasActiveChat &&
		(activeThreadId || activeProviderId) &&
		pathname !== DASHBOARD_PATHS.messages &&
		pathname !== DASHBOARD_PATHS.payments &&
		pathname !== DASHBOARD_PATHS.reviews &&
		pathname !== DASHBOARD_PATHS.settings &&
		pathname !== DASHBOARD_PATHS.myArea;

	// The chat side panel is desktop-only (`hidden lg:flex` below). Below that
	// breakpoint there's no room for it, so send the user to the Messages page
	// instead — it already has a correct responsive list/conversation layout.
	useEffect(() => {
		if (!shouldShowChatSurface || window.innerWidth >= 1024) return;
		// Only pass the one identifier that's actually set — navigate()'s search
		// serializer doesn't know nuqs's "null means omit this param" convention,
		// so `{ thread: null }` would land in the URL as the literal string "null".
		navigate({
			to: DASHBOARD_PATHS.messages,
			search: activeThreadId
				? { thread: activeThreadId }
				: { provider: activeProviderId },
		});
		dispatch(
			set_dashboard_flags({
				hasActiveChat: false,
				activeThreadId: null,
				activeProviderId: null,
			}),
		);
	}, [
		shouldShowChatSurface,
		activeThreadId,
		activeProviderId,
		navigate,
		dispatch,
	]);

	// Lock body scroll when mobile sidebar is open
	useEffect(() => {
		if (isMobileSidebarOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isMobileSidebarOpen]);

	const navItems = [
		{
			section: "Main",
			items: [
				{
					name: "Dashboard",
					icon: LayoutDashboard,
					path: DASHBOARD_PATHS.dashboard,
					badge: null,
				},
				{
					name: "Find Artisans",
					icon: Search,
					path: DASHBOARD_PATHS.artisans,
					badge: 48,
				},
				{
					name: "Bookings",
					icon: Calendar,
					path: DASHBOARD_PATHS.bookings,
					badge: 3,
				},
				{
					name: "Messages",
					icon: MessageSquare,
					path: DASHBOARD_PATHS.messages,
					badge: 5,
				},
			],
		},
		{
			section: "Manage",
			items: [
				{
					name: "Payments",
					icon: CreditCard,
					path: DASHBOARD_PATHS.payments,
					badge: null,
				},
				{
					name: "Reviews",
					icon: Star,
					path: DASHBOARD_PATHS.reviews,
					badge: null,
				},
				// My Area (dispatch zones) is a provider-only concept — customers
				// have no service area to manage.
				...(user?.userType === USER_TYPES.provider
					? [
							{
								name: "My Area",
								icon: MapPin,
								path: DASHBOARD_PATHS.myArea,
								badge: null,
							},
						]
					: []),
			],
		},
		{
			section: "Account",
			items: [
				{
					name: "Settings",
					icon: Settings,
					path: DASHBOARD_PATHS.settings,
					badge: null,
				},
			],
		},
	];

	// Sidebar nav content - shared between desktop and mobile
	const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
		<>
			{/* Sidebar Logo */}
			<div
				className="p-6 border-b border-white/10 hover:cursor-pointer transition-opacity duration-150 hover:opacity-90 flex items-center justify-between"
				onClick={() => {
					navigate({ to: "/" });
					onNavClick?.();
				}}
			>
				<div>
					<HHLogo theme="dark" height={28} />
					<p className="text-[9.5px] text-white/50 tracking-[0.8px] uppercase mt-1.5 font-bold">
						Marketplace OS
					</p>
				</div>
				{/* Close button only visible on mobile */}
				{onNavClick && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onNavClick();
						}}
						className="md:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-150 ml-auto"
						aria-label="Close sidebar"
					>
						<X size={16} />
					</button>
				)}
			</div>

			{/* Sidebar Nav */}
			<nav className="flex-1 overflow-y-auto px-3 py-6 flex flex-col gap-6 scrollbar-none">
				{navItems.map((sec) => (
					<div key={sec.section}>
						<div className="text-[9.5px] text-white/45 tracking-[1.5px] uppercase font-bold px-3.5 mb-2.5 select-none">
							{sec.section}
						</div>
						<div className="flex flex-col gap-1">
							{sec.items.map((item) => {
								const isActive = pathname === item.path;
								const Icon = item.icon;
								return (
									<Link
										key={item.name}
										to={item.path}
										onClick={() => {
											onNavClick?.();
										}}
										className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] cursor-pointer transition-all duration-150 border ${
											isActive
												? "bg-white/[0.06] !text-white font-semibold border-white/10"
												: "!text-white/60 border-transparent hover:bg-white/[0.03] hover:!text-white/90"
										}`}
									>
										{/* Vertical indicator bar for active item */}
										{isActive && (
											<div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r bg-[var(--hh-or-m)]" />
										)}

										{/* Explicit size and no-shrink to prevent collapsing */}
										<Icon
											className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
												isActive ? "text-[var(--hh-or-m)]" : "text-white/40"
											}`}
										/>

										<span className="truncate">{item.name}</span>
										{item.badge && (
											<span
												className={`ml-auto text-[9.5px] px-2 py-0.5 rounded-full font-bold leading-none ${
													isActive
														? "bg-[var(--hh-or-m)]/15 text-[var(--hh-or-m)]"
														: "bg-white/10 text-white/50"
												}`}
											>
												{item.badge}
											</span>
										)}
									</Link>
								);
							})}
						</div>
					</div>
				))}
			</nav>

			{/* Sidebar Footer User Info */}
			<div className="p-4 border-t border-white/10 bg-white/[0.01]">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 cursor-pointer shadow-inner group"
						>
							<UserAvatarBadge
								avatar={user?.avatar}
								initials={initials}
								className="w-8 h-8 rounded-full bg-[var(--hh-or-m)] flex items-center justify-center text-xs font-bold text-[#172554] shrink-0 shadow-sm border border-white/15 ring-2 ring-[var(--hh-or-m)]/10"
							/>
							<div className="flex flex-col min-w-0 flex-1 text-left">
								<p className="text-[13px] font-semibold text-white/95 leading-none mb-1 truncate">
									{user?.fullName ?? ""}
								</p>
								<span className="text-[10px] text-white/50 font-medium truncate">
									{locationLine ?? user?.email ?? ""}
								</span>
							</div>
							<ChevronUp
								size={13}
								className="text-white/30 group-hover:text-white/55 transition-colors shrink-0"
							/>
						</button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						side="top"
						align="start"
						sideOffset={8}
						className="w-56 mb-1"
					>
						<DropdownMenuLabel className="flex items-center gap-2.5 pb-2">
							<UserAvatarBadge
								avatar={user?.avatar}
								initials={initials}
								className="w-7 h-7 rounded-full bg-[var(--dashboard-orange)] flex items-center justify-center text-[11px] font-bold text-white shrink-0"
							/>
							<div className="flex flex-col min-w-0">
								<span className="text-xs font-semibold text-foreground truncate">
									{user?.fullName ?? ""}
								</span>
								<span className="text-[10px] text-muted-foreground truncate">
									{user?.email ?? ""}
								</span>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							className="gap-2.5 cursor-pointer"
							onClick={() => navigate({ to: DASHBOARD_PATHS.settings })}
						>
							<User size={14} className="text-muted-foreground" />
							View Profile
						</DropdownMenuItem>

						<DropdownMenuItem
							className="gap-2.5 cursor-pointer"
							onClick={() => navigate({ to: DASHBOARD_PATHS.settings })}
						>
							<Settings size={14} className="text-muted-foreground" />
							Settings
						</DropdownMenuItem>

						<DropdownMenuItem className="gap-2.5 cursor-pointer">
							<HelpCircle size={14} className="text-muted-foreground" />
							Help & Support
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							className="gap-2.5 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
							onClick={() => setShowLogoutDialog(true)}
						>
							<LogOut size={14} />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<LogoutDialog
				open={showLogoutDialog}
				onClose={() => setShowLogoutDialog(false)}
				onConfirm={() => {
					setShowLogoutDialog(false);
					dispatch({ type: "RESET_STORE" });
					clearStoredSession();
					navigate({ to: "/" });
				}}
			/>
		</>
	);

	return (
		<div className="hh-dashboard flex h-dvh w-screen overflow-hidden bg-[var(--dashboard-bg)]">
			{/* ── Mobile Sidebar Drawer Overlay ──────────────────────────────── */}
			{/* Backdrop */}
			<div
				className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
					isMobileSidebarOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				}`}
				onClick={() =>
					dispatch(set_dashboard_flags({ isMobileSidebarOpen: false }))
				}
				aria-hidden="true"
			/>

			{/* Mobile Drawer Panel */}
			<aside
				className={`fixed top-0 left-0 z-50 h-full w-[280px] bg-[var(--dashboard-shell)] flex flex-col border-r border-white/5 md:hidden transition-transform duration-300 ease-in-out ${
					isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
				aria-label="Mobile navigation"
			>
				<SidebarContent
					onNavClick={() =>
						dispatch(set_dashboard_flags({ isMobileSidebarOpen: false }))
					}
				/>
			</aside>

			{/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
			<aside className="hidden md:flex flex-col bg-[var(--dashboard-shell)] w-[260px] h-full shrink-0 border-r border-white/5">
				<SidebarContent />
			</aside>

			{/* ── Main Content Area ──────────────────────────────────────────── */}
			<div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
				<Outlet />
			</div>

			{/* ── Chat Panel (Right Side) ─────────────────────────────────────── */}
			{shouldShowChatSurface && (
				<aside className="hidden lg:flex flex-col w-[320px] bg-[var(--dashboard-card)] border-l border-[var(--dashboard-border)] h-full overflow-hidden shrink-0 animate-in slide-in-from-right duration-250">
					<ChatConversation
						threadId={activeThreadId}
						providerId={activeProviderId}
						onThreadResolved={(id) =>
							dispatch(
								set_dashboard_flags({
									activeThreadId: id,
									activeProviderId: null,
								}),
							)
						}
						onBack={() =>
							dispatch(set_dashboard_flags({ hasActiveChat: false }))
						}
						compact
					/>
				</aside>
			)}

			{/* ── Provider Onboarding Modal ─────────────────────────────────── */}
			<ArtisanOnboarding
				open={showOnboarding}
				onComplete={() =>
					dispatch(set_dashboard_flags({ onboardingDismissed: true }))
				}
			/>

			<LocationAlert onRetry={retryLocation} />

			{/* ── Mobile Bottom Tab Bar ──────────────────────────────────────── */}
			<nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[var(--dashboard-shell)] border-t border-white/10 flex items-center px-2 py-1 safe-area-bottom">
				{[
					{
						name: "Home",
						icon: LayoutDashboard,
						path: DASHBOARD_PATHS.dashboard,
					},
					{ name: "Find", icon: Search, path: DASHBOARD_PATHS.artisans },
					{ name: "Bookings", icon: Calendar, path: DASHBOARD_PATHS.bookings },
					{
						name: "Messages",
						icon: MessageSquare,
						path: DASHBOARD_PATHS.messages,
						badge: 5,
					},
					{ name: "More", icon: Menu, path: null },
				].map((item) => {
					const isActive = item.path ? pathname === item.path : false;
					const Icon = item.icon;
					return (
						<button
							key={item.name}
							type="button"
							onClick={() => {
								if (item.path === null) {
									dispatch(set_dashboard_flags({ isMobileSidebarOpen: true }));
								} else {
									navigate({ to: item.path });
								}
							}}
							className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all duration-150 cursor-pointer ${
								isActive
									? "text-[var(--dashboard-orange)]"
									: "text-white/30 hover:text-white/60"
							}`}
						>
							<Icon
								size={20}
								className={`transition-transform duration-150 ${isActive ? "scale-110" : ""}`}
							/>
							<span className="text-[9px] font-semibold tracking-wide">
								{item.name}
							</span>
							{"badge" in item && item.badge && (
								<span className="absolute top-1.5 w-4 h-4 bg-[var(--dashboard-orange)] rounded-full text-[8px] text-white font-bold flex items-center justify-center">
									{item.badge}
								</span>
							)}
						</button>
					);
				})}
			</nav>
		</div>
	);
}
