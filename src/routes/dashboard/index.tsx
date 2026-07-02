import { createFileRoute } from "@tanstack/react-router";
import {
	Sparkles,
	Receipt,
	Briefcase,
	Users,
	CreditCard,
	ArrowUpRight,
	MessageSquare,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { DashboardHeader } from "#/components/dashboard/dashboard-header";
import { AiSearch } from "#/components/dashboard/ai-search";
import { RecommendedArtisans } from "#/components/dashboard/recommended-artisans";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const dispatch = useAppDispatch();
	const hasActiveChat = useAppSelector((s) => s.dashboardStore.hasActiveChat);

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
						<div className="font-syne text-3xl font-black mb-0.5 leading-none">3</div>
						<div className="text-[10.5px] text-white/85 font-semibold flex items-center gap-1 mt-1">
							<span className="flex h-1.5 w-1.5 relative shrink-0">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
								<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
							</span>
							↑ 1 new today
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
						<div className="font-syne text-3xl font-black mb-0.5 text-[var(--dashboard-text)] leading-none">48</div>
						<div className="text-[10.5px] text-[var(--dashboard-muted)] font-semibold mt-1">
							Within 5 km radius
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
						<div className="font-syne text-3xl font-black mb-0.5 text-[var(--dashboard-text)] leading-none">₦64k</div>
						<div className="text-[10.5px] text-green-600 font-bold flex items-center gap-0.5 mt-1">
							This month <ArrowUpRight size={11} className="stroke-[2.5]" />
						</div>
					</div>
				</div>
			</section>

			<AiSearch />

			<RecommendedArtisans />

			{/* Recent Activities Section */}
			<section>
				<h3 className="font-syne font-bold text-sm text-[var(--dashboard-text)] mb-3.5 select-none">
					Recent activity
				</h3>
				<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 flex flex-col relative shadow-sm">
					<div className="absolute left-[39px] top-6 bottom-6 w-[1.5px] bg-neutral-100" />

					<div className="relative flex items-start gap-4 pb-5 last:pb-0">
						<div className="w-8.5 h-8.5 rounded-xl bg-[var(--dashboard-orange-light)] border border-[var(--dashboard-orange-mid)]/40 flex items-center justify-center text-[var(--dashboard-orange)] shrink-0 z-10 shadow-sm">
							<Receipt size={14} className="stroke-[2.5]" />
						</div>
						<div className="min-w-0 pt-0.5">
							<p className="text-[13.5px] font-bold text-[var(--dashboard-text)] leading-snug">
								Taiwo Johnson accepted your booking
							</p>
							<span className="text-[11px] text-[var(--dashboard-muted)] font-medium">
								Inverter panel inspection · Today
							</span>
						</div>
						<span className="ml-auto text-[11px] text-[var(--dashboard-muted)] whitespace-nowrap font-semibold pl-2 pt-0.5">
							09:14
						</span>
					</div>

					<div className="relative flex items-start gap-4 pb-5 last:pb-0">
						<div className="w-8.5 h-8.5 rounded-xl bg-[var(--dashboard-purple-light)] border border-[var(--dashboard-purple-mid)]/40 flex items-center justify-center text-[var(--dashboard-purple)] shrink-0 z-10 shadow-sm">
							<Sparkles size={14} />
						</div>
						<div className="min-w-0 pt-0.5">
							<p className="text-[13.5px] font-bold text-[var(--dashboard-text)] leading-snug">
								AI matched 3 plumbers for your pipe request
							</p>
							<span className="text-[11px] text-[var(--dashboard-muted)] font-medium">
								Based on location + urgency
							</span>
						</div>
						<span className="ml-auto text-[11px] text-[var(--dashboard-muted)] whitespace-nowrap font-semibold pl-2 pt-0.5">
							08:50
						</span>
					</div>

					<div className="relative flex items-start gap-4 last:pb-0">
						<div className="w-8.5 h-8.5 rounded-xl bg-green-50 border border-green-200/50 flex items-center justify-center text-green-700 shrink-0 z-10 shadow-sm">
							<Receipt size={14} />
						</div>
						<div className="min-w-0 pt-0.5">
							<p className="text-[13.5px] font-bold text-[var(--dashboard-text)] leading-snug">
								Payment confirmed — ₦45,000
							</p>
							<span className="text-[11px] text-[var(--dashboard-muted)] font-medium">
								Fatima Abubakar · Carpentry work
							</span>
						</div>
						<span className="ml-auto text-[11px] text-[var(--dashboard-muted)] whitespace-nowrap font-semibold pl-2 pt-0.5">
							Yesterday
						</span>
					</div>
				</div>
			</section>

			{/* Floating Chat Drawer Re-opener Toggle */}
			{!hasActiveChat && (
				<button
					type="button"
					onClick={() => dispatch(set_dashboard_flags({ hasActiveChat: true }))}
					className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--dashboard-blue)] hover:bg-[var(--dashboard-blue-dark)] text-white flex items-center justify-center cursor-pointer shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95 animate-in zoom-in-50 duration-200"
					aria-label="Open chat panel"
				>
					<div className="relative">
						<MessageSquare size={22} className="stroke-[2.2]" />
						<span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-red-500/10">
							5
						</span>
					</div>
				</button>
			)}
		</main>
	);
}
