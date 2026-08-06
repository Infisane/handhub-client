import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowDownRight,
	ArrowUpRight,
	Briefcase,
	CreditCard,
	MessageSquare,
	Users,
} from "lucide-react";
import { AiSearch } from "#/components/dashboard/ai-search";
import { DashboardHeader } from "#/components/dashboard/dashboard-header";
import { RecommendedArtisans } from "#/components/dashboard/recommended-artisans";
import { formatNaira, parseMoney } from "#/core/helpers/money.helper";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { useGetProvidersQuery } from "#/core/queries/artisan.q";
import { useGetBookingsQuery } from "#/core/queries/booking.q";
import { useGetUnreadCountQuery } from "#/core/queries/thread.q";
import { useGetWalletQuery } from "#/core/queries/wallet.q";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardPage,
});

const NEARBY_RADIUS_KM = 5;

function DashboardPage() {
	const dispatch = useAppDispatch();
	const hasActiveChat = useAppSelector((s) => s.dashboardStore.hasActiveChat);
	const activeThreadId = useAppSelector((s) => s.dashboardStore.activeThreadId);
	const activeProviderId = useAppSelector(
		(s) => s.dashboardStore.activeProviderId,
	);

	const { latitude, longitude } = useAppSelector((s) => s.geolocationStore);
	const hasCoords = latitude !== null && longitude !== null;

	const { data: activeBookings } = useGetBookingsQuery({
		status: "in_progress",
	});
	const activeJobsCount = activeBookings?.length ?? 0;
	const newTodayCount =
		activeBookings?.filter(
			(b) => new Date(b.createdAt).toDateString() === new Date().toDateString(),
		).length ?? 0;

	const { data: nearbyProviders } = useGetProvidersQuery(
		{
			lat: latitude ?? undefined,
			lon: longitude ?? undefined,
			radius: NEARBY_RADIUS_KM,
		},
		hasCoords,
	);
	const nearbyCount = nearbyProviders?.meta.total ?? 0;

	const { data: wallet } = useGetWalletQuery();
	const currentMonthSpend = parseMoney(wallet?.monthlyTotals.currentMonth);
	const previousMonthSpend = parseMoney(wallet?.monthlyTotals.previousMonth);
	const spendTrendUp = currentMonthSpend >= previousMonthSpend;

	const { data: unread } = useGetUnreadCountQuery();

	return (
		<main className="flex-1 p-4 sm:p-5 md:p-6 pb-24 md:pb-6 flex flex-col gap-4 md:gap-5 overflow-y-auto h-full max-h-screen bg-[var(--dashboard-bg)]">
			<DashboardHeader />

			{/* Statistics widgets grid */}
			<section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
				{/* Active Jobs (Signal Blue gradient) */}
				<div className="bg-gradient-to-br from-(--dashboard-blue) to-[#1D4ED8] border border-[#1D4ED8]/20 rounded-xl p-4 shadow-md shadow-blue-500/10 text-white relative overflow-hidden group hover:shadow-lg transition-all duration-350">
					<div className="absolute -right-6 -top-6 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
					<div className="absolute right-3.5 bottom-3.5 text-white/12">
						<Briefcase size={36} className="stroke-[1.5]" />
					</div>

					<div className="relative z-10">
						<div className="text-[9px] uppercase font-extrabold tracking-wider text-white/70 mb-1.5">
							Active jobs
						</div>
						<div className="font-syne text-3xl font-black mb-0.5 leading-none">
							{activeJobsCount}
						</div>
						<div className="text-[10.5px] text-white/85 font-semibold flex items-center gap-1 mt-1">
							<span className="flex h-1.5 w-1.5 relative shrink-0">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
								<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
							</span>
							{newTodayCount > 0
								? `↑ ${newTodayCount} new today`
								: "No new jobs today"}
						</div>
					</div>
				</div>

				{/* Artisans Nearby */}
				<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl p-4 shadow-xs hover:shadow-sm transition-all duration-300 text-[var(--dashboard-text)] relative overflow-hidden group">
					<div className="absolute -right-6 -top-6 w-20 h-20 bg-neutral-100 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
					<div className="absolute right-3.5 bottom-3.5 text-neutral-200/40">
						<Users size={36} className="stroke-[1.5]" />
					</div>

					<div className="relative z-10">
						<div className="text-[9px] uppercase font-extrabold tracking-wider text-[var(--dashboard-muted)] mb-1.5">
							Artisans nearby
						</div>
						<div className="font-syne text-3xl font-black mb-0.5 text-[var(--dashboard-text)] leading-none">
							{hasCoords ? nearbyCount : "—"}
						</div>
						<div className="text-[10.5px] text-[var(--dashboard-muted)] font-semibold mt-1">
							{hasCoords
								? `Within ${NEARBY_RADIUS_KM} km radius`
								: "Enable location to see nearby artisans"}
						</div>
					</div>
				</div>

				{/* Total Spent */}
				<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl p-4 shadow-xs hover:shadow-sm transition-all duration-300 text-[var(--dashboard-text)] relative overflow-hidden group">
					<div className="absolute -right-6 -top-6 w-20 h-20 bg-neutral-100 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
					<div className="absolute right-3.5 bottom-3.5 text-neutral-200/40">
						<CreditCard size={36} className="stroke-[1.5]" />
					</div>

					<div className="relative z-10">
						<div className="text-[9px] uppercase font-extrabold tracking-wider text-[var(--dashboard-muted)] mb-1.5">
							Total spent
						</div>
						<div className="font-syne text-3xl font-black mb-0.5 text-[var(--dashboard-text)] leading-none">
							{formatNaira(currentMonthSpend)}
						</div>
						<div
							className={`text-[10.5px] font-bold flex items-center gap-0.5 mt-1 ${spendTrendUp ? "text-green-600" : "text-red-500"}`}
						>
							This month{" "}
							{spendTrendUp ? (
								<ArrowUpRight size={11} className="stroke-[2.5]" />
							) : (
								<ArrowDownRight size={11} className="stroke-[2.5]" />
							)}
						</div>
					</div>
				</div>
			</section>

			<AiSearch />

			<RecommendedArtisans />

			{/* Floating Chat Drawer Re-opener Toggle */}
			{!hasActiveChat && (activeThreadId || activeProviderId) && (
				<button
					type="button"
					onClick={() => dispatch(set_dashboard_flags({ hasActiveChat: true }))}
					className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--dashboard-blue)] hover:bg-[var(--dashboard-blue-dark)] text-white flex items-center justify-center cursor-pointer shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95 animate-in zoom-in-50 duration-200"
					aria-label="Open chat panel"
				>
					<div className="relative">
						<MessageSquare size={22} className="stroke-[2.2]" />
						{!!unread?.count && (
							<span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-red-500/10">
								{unread.count}
							</span>
						)}
					</div>
				</button>
			)}
		</main>
	);
}
