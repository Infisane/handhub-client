import { Menu } from "lucide-react";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { useEnrichedProviderProfile } from "#/core/hooks/useEnrichedProviderProfile.hook";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";

function getGreeting() {
	const h = new Date().getHours();
	if (h < 12) return "Good morning";
	if (h < 17) return "Good afternoon";
	return "Good evening";
}

function formatDate() {
	return new Intl.DateTimeFormat("en-NG", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date());
}

export function DashboardHeader() {
	const dispatch = useAppDispatch();
	const authUser = useAppSelector((s) => s.authStore.user);
	const providerProfile = useEnrichedProviderProfile();

	const firstName = authUser?.fullName?.split(" ")[0] ?? "";
	const stateName = providerProfile?.state?.name ?? null;
	const isVerified = providerProfile?.isVerified ?? authUser?.isVerified ?? false;

	return (
		<div className="flex items-center justify-between gap-3">
			<button
				type="button"
				onClick={() => dispatch(set_dashboard_flags({ isMobileSidebarOpen: true }))}
				className="md:hidden w-9 h-9 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text)] hover:bg-[var(--dashboard-orange-light)] hover:border-[var(--dashboard-orange-mid)] hover:text-[var(--dashboard-orange)] transition-all duration-150 shrink-0 shadow-sm"
				aria-label="Open navigation"
			>
				<Menu size={18} />
			</button>

			<div className="min-w-0">
				<h2 className="font-syne font-extrabold text-[20px] sm:text-[25px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1 mt-0.5 truncate">
					{getGreeting()}{firstName ? `, ${firstName}` : ""}
				</h2>
				<div className="flex items-center gap-2 text-[11px] text-[var(--dashboard-muted)] font-medium flex-wrap">
					<span className="hidden sm:inline">{formatDate()}</span>
					<span className="text-neutral-300 select-none hidden sm:inline">·</span>
					{isVerified ? (
						<div className="flex items-center gap-1.5 bg-green-50 border border-green-200/50 rounded-full px-2.5 py-0.5 text-[9.5px] text-green-700 font-semibold shadow-sm select-none">
							<span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
							{stateName ? `${stateName} · ` : ""}Verified
						</div>
					) : (
						<div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 rounded-full px-2.5 py-0.5 text-[9.5px] text-amber-700 font-semibold shadow-sm select-none">
							<span className="w-1 h-1 rounded-full bg-amber-500" />
							{stateName ? `${stateName} · ` : ""}Unverified
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
