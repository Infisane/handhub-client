import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	Calendar,
	Check,
	Clock,
	MessageSquare,
	Search,
	ShieldCheck,
	ThumbsUp,
	TrendingUp,
	X,
	Zap,
} from "lucide-react";
import { useState, useContext, useMemo } from "react";
import { DashboardContext } from "../_dashboard";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/_dashboard/bookings")({
	component: BookingsPage,
});

/* ── Types ─────────────────────────────────────────────────── */
type BookingStatus = "in_progress" | "scheduled" | "completed" | "cancelled";

interface Booking {
	id: string; // e.g. Ticket #1042
	artisanName: string;
	artisanInitials: string;
	artisanTrade: string;
	avatarColor: string;
	verified: boolean;
	jobTitle: string;
	status: BookingStatus;
	date: string;
	cost: string;
	notes: string;
	hasProposal?: boolean;
}

/* ── Data ───────────────────────────────────────────────────── */
const MOCK_BOOKINGS: Booking[] = [
	{
		id: "#1042",
		artisanName: "Taiwo Johnson",
		artisanInitials: "TJ",
		artisanTrade: "Licensed Electrician",
		avatarColor: "bg-[#FEE9E1] text-[#C2410C]",
		verified: true,
		jobTitle: "Inverter Inspection & Phase Balance",
		status: "in_progress",
		date: "Today, May 31 at 09:14 AM",
		cost: "₦45,000",
		notes: "Smoking solar panel inverter, phase balancing issues. Technician is currently on-site balancing load distributions.",
		hasProposal: true,
	},
	{
		id: "#1039",
		artisanName: "Biodun Kareem",
		artisanInitials: "BK",
		artisanTrade: "AC Technician",
		avatarColor: "bg-[#E2FBF0] text-[#0F766E]",
		verified: true,
		jobTitle: "AC Servicing (3 Lounge Units)",
		status: "scheduled",
		date: "Tomorrow, June 1 at 10:00 AM",
		cost: "₦27,000",
		notes: "Comprehensive cleaning, filter washing, and refrigerant gas top-up for 3 split-unit air conditioners in the lounge.",
	},
	{
		id: "#1012",
		artisanName: "Emeka Nwosu",
		artisanInitials: "EM",
		artisanTrade: "Master Plumber",
		avatarColor: "bg-[#E0F2FE] text-[#0369A1]",
		verified: true,
		jobTitle: "Kitchen Sink Leak Repair",
		status: "completed",
		date: "May 28, 2026",
		cost: "₦14,400",
		notes: "Successfully detected leak beneath bottom drawer cabinet and replaced damaged PVC flex water pipe pipes. 100% sealed.",
	},
	{
		id: "#0984",
		artisanName: "Fatima Abubakar",
		artisanInitials: "FA",
		artisanTrade: "Carpenter & Joiner",
		avatarColor: "bg-[#FDF4E3] text-[#B7791F]",
		verified: true,
		jobTitle: "Wardrobe Door Alignment",
		status: "cancelled",
		date: "May 15, 2026",
		cost: "₦6,000",
		notes: "Job cancelled due to a conflict in user availability. Refund processed successfully to user wallet.",
	},
];

const statusConfig: Record<BookingStatus, { label: string; bg: string; text: string; dot: string }> = {
	in_progress: { label: "In Progress", bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500 animate-pulse" },
	scheduled: { label: "Scheduled", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
	completed: { label: "Completed", bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-700 dark:text-green-400", dot: "bg-green-500" },
	cancelled: { label: "Cancelled", bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-500 dark:text-neutral-400", dot: "bg-neutral-400" },
};

/* ── Component ──────────────────────────────────────────────── */
function BookingsPage() {
	const { hasActiveChat, setHasActiveChat } = useContext(DashboardContext);

	const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Statistics computations
	const stats = useMemo(() => {
		const activeCount = MOCK_BOOKINGS.filter((b) => b.status === "in_progress" || b.status === "scheduled").length;
		const completedCount = MOCK_BOOKINGS.filter((b) => b.status === "completed").length;
		const totalSpent = "₦86,400"; // Based on completed job cost and others
		return { activeCount, completedCount, totalSpent };
	}, []);

	// Filtered list
	const filteredBookings = useMemo(() => {
		return MOCK_BOOKINGS.filter((b) => {
			// Tab filtering
			if (activeTab === "active" && b.status !== "in_progress" && b.status !== "scheduled") return false;
			if (activeTab === "completed" && b.status !== "completed") return false;
			if (activeTab === "cancelled" && b.status !== "cancelled") return false;

			// Search query filtering
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				return (
					b.jobTitle.toLowerCase().includes(q) ||
					b.artisanName.toLowerCase().includes(q) ||
					b.artisanTrade.toLowerCase().includes(q) ||
					b.id.toLowerCase().includes(q)
				);
			}
			return true;
		});
	}, [activeTab, searchQuery]);

	// Badge counts
	const counts = useMemo(() => {
		return {
			all: MOCK_BOOKINGS.length,
			active: MOCK_BOOKINGS.filter((b) => b.status === "in_progress" || b.status === "scheduled").length,
			completed: MOCK_BOOKINGS.filter((b) => b.status === "completed").length,
			cancelled: MOCK_BOOKINGS.filter((b) => b.status === "cancelled").length,
		};
	}, []);

	/* motion variants */
	const containerVariants = {
		hidden: { opacity: 0 },
		show: { opacity: 1, transition: { staggerChildren: 0.05 } },
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 12 },
		show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 130, damping: 18 } },
	};

	return (
		<main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--dashboard-bg)]">
			
			{/* ── Top Bar Header & Page Title ───────────────────────────────────────── */}
			<div className="shrink-0 bg-[var(--dashboard-bg)] px-5 sm:px-8 pt-5 sm:pt-7 pb-4 space-y-4 border-b border-[var(--dashboard-border)]">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						<h2 className="font-syne font-extrabold text-[22px] sm:text-[26px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1.5">
							Manage Bookings
						</h2>
						<p className="text-[12px] text-[var(--dashboard-muted)] font-medium">
							Track active repairs, scheduled servicing, and completed artisan jobs
						</p>
					</div>
				</div>

				{/* ── Statistics Grid ───────────────────────────────────────────────── */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
						<div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[var(--dashboard-orange)] shrink-0">
							<Clock size={16} className="animate-pulse" />
						</div>
						<div>
							<div className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)]">
								{stats.activeCount} Active
							</div>
							<div className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">Jobs In-Flight</div>
						</div>
					</div>

					<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
						<div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
							<Check size={16} />
						</div>
						<div>
							<div className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)]">
								{stats.completedCount} Done
							</div>
							<div className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">Jobs Completed</div>
						</div>
					</div>

					<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
						<div className="w-9 h-9 rounded-xl bg-[var(--dashboard-orange-light)] flex items-center justify-center text-[var(--dashboard-orange)] shrink-0">
							<TrendingUp size={16} />
						</div>
						<div>
							<div className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)]">
								{stats.totalSpent}
							</div>
							<div className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">Total Invested</div>
						</div>
					</div>

					<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
						<div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
							<ThumbsUp size={15} />
						</div>
						<div>
							<div className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)]">
								100%
							</div>
							<div className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">Job Satisfaction</div>
						</div>
					</div>
				</div>
			</div>

			{/* ── Filters & Bookings Main Panel ─────────────────────────────────────── */}
			<div className="shrink-0 px-5 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--dashboard-bg)] border-b border-[var(--dashboard-border)]/50">
				
				{/* Tab selectors */}
				<div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
					{(["all", "active", "completed", "cancelled"] as const).map((tab) => (
						<button
							key={tab}
							type="button"
							onClick={() => setActiveTab(tab)}
							className={cn(
								"px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5",
								activeTab === tab
									? "bg-[var(--dashboard-text)] border-[var(--dashboard-text)] text-white"
									: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)]"
							)}
						>
							<span className="capitalize">{tab === "all" ? "All Bookings" : tab}</span>
							<span className={cn(
								"text-[9px] px-1.5 py-0.25 rounded-full font-bold",
								activeTab === tab ? "bg-white/20 text-white" : "bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)]"
							)}>
								{counts[tab]}
							</span>
						</button>
					))}
				</div>

				{/* Search bookings */}
				<div className="relative w-full sm:w-64">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)] pointer-events-none" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search by ticket, artisan..."
						className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] focus:ring-1 focus:ring-[var(--dashboard-orange)]/15 transition-all shadow-xs"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)] hover:text-[var(--dashboard-orange)]"
						>
							<X size={12} className="stroke-[3.5]" />
						</button>
					)}
				</div>
			</div>

			{/* ── Bookings Grid Content Scroll ─────────────────────────────────────── */}
			<div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 pb-24 md:pb-8 scrollbar-none">
				{filteredBookings.length === 0 ? (
					/* Empty State */
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-8"
					>
						<div className="w-14 h-14 rounded-2xl bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)] flex items-center justify-center shadow-xs">
							<Calendar size={20} className="text-[var(--dashboard-muted)]" />
						</div>
						<div>
							<p className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)] mb-1">No bookings found</p>
							<p className="text-[12px] text-[var(--dashboard-muted)]">No ticketed service matches your current selection filter.</p>
						</div>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="px-4 py-2 rounded-xl text-[12px] font-bold bg-[var(--dashboard-orange)] text-white cursor-pointer hover:bg-orange-600 active:scale-95 transition-all"
							>
								Clear Search
							</button>
						)}
					</motion.div>
				) : (
					/* Bookings Cards Layout Grid responsive to side panel state */
					<motion.div
						key={activeTab}
						variants={containerVariants}
						initial="hidden"
						animate="show"
						className={cn(
							"grid gap-5",
							hasActiveChat
								? "grid-cols-1 xl:grid-cols-2"
								: "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
						)}
					>
						{filteredBookings.map((booking) => {
							const cfg = statusConfig[booking.status];

							return (
								<motion.div
									key={booking.id}
									variants={itemVariants}
									layout
									className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[var(--dashboard-orange-mid)]/40 transition-all duration-300 flex flex-col justify-between"
								>
									{/* Top card metadata */}
									<div className="p-5 flex-1 flex flex-col space-y-4">
										
										{/* Ticket ID, Date & status indicator */}
										<div className="flex items-center justify-between">
											<span className="text-[11.5px] font-extrabold text-[var(--dashboard-muted)] tracking-wider">
												Ticket {booking.id}
											</span>
											<span className={cn(
												"inline-flex items-center gap-1.5 text-[10.5px] font-extrabold px-2.5 py-0.75 rounded-full border",
												cfg.bg, cfg.text, "border-[var(--dashboard-border)]/50"
											)}>
												<span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
												{cfg.label}
											</span>
										</div>

										{/* Job title & description */}
										<div className="space-y-1.5">
											<h3 className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)] leading-snug">
												{booking.jobTitle}
											</h3>
											<p className="text-[12px] text-[var(--dashboard-muted)] leading-relaxed font-medium">
												{booking.notes}
											</p>
										</div>

										{/* Artisan profile bar */}
										<div className="bg-[var(--dashboard-bg)]/50 border border-[var(--dashboard-border)]/40 rounded-xl p-3.5 flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
											<div className="flex items-center gap-2.5 shrink-0">
												<div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-black text-[11.5px] shrink-0 relative", booking.avatarColor)}>
													{booking.artisanInitials}
													{booking.verified && (
														<div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--dashboard-orange)] border border-white flex items-center justify-center">
															<Check size={6} className="text-white stroke-[4]" />
														</div>
													)}
												</div>
												<div>
													<div className="text-[12px] font-bold text-[var(--dashboard-text)] flex items-center gap-1">
														{booking.artisanName}
														<ShieldCheck size={11} className="text-[var(--dashboard-orange)]" />
													</div>
													<div className="text-[10px] text-[var(--dashboard-muted)] font-bold">{booking.artisanTrade}</div>
												</div>
											</div>

											{/* Cost breakdown */}
											<div className="text-right shrink-0">
												<div className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">Total Fee</div>
												<div className="font-syne font-extrabold text-[13.5px] text-[var(--dashboard-text)] mt-0.5">
													{booking.cost}
												</div>
											</div>
										</div>

										{/* Additional Date block */}
										<div className="flex items-center gap-1.5 text-[11px] text-[var(--dashboard-muted)] pt-0.5">
											<Clock size={12} className="text-[var(--dashboard-orange)] shrink-0" />
											<span>{booking.date}</span>
										</div>
									</div>

									{/* Hires / pay invoices action buttons */}
									<div className="px-5 pb-5 pt-0 flex gap-2.5 border-t border-[var(--dashboard-border)]/40 pt-4 items-center">
										
										{/* Chat icon button */}
										<button
											type="button"
											onClick={() => setHasActiveChat(true)}
											className="size-10 rounded-xl border border-[var(--dashboard-border)] text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
											title="Chat with Artisan"
											aria-label="Chat with Artisan"
										>
											<MessageSquare size={14} className="text-[var(--dashboard-text)]" />
										</button>

										{/* Action CTAs based on status */}
										{booking.status === "in_progress" && booking.hasProposal ? (
											<button
												type="button"
												onClick={() => setHasActiveChat(true)}
												className="flex-1 h-10 rounded-xl bg-[var(--dashboard-orange)] text-white text-[12px] font-extrabold text-center hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
											>
												<Zap size={11} className="stroke-[2.5]" />
												<span>Pay Proposal</span>
											</button>
										) : booking.status === "scheduled" ? (
											<button
												type="button"
												className="flex-1 h-10 rounded-xl border border-[var(--dashboard-border)] text-[12px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-colors text-center cursor-pointer flex items-center justify-center shrink-0"
											>
												<span>Reschedule</span>
											</button>
										) : booking.status === "completed" ? (
											<button
												type="button"
												className="flex-1 h-10 rounded-xl bg-[var(--dashboard-text)] hover:bg-[var(--dashboard-orange)] text-white text-[12px] font-extrabold text-center transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
											>
												<ThumbsUp size={11} />
												<span>Review Job</span>
											</button>
										) : (
											<button
												type="button"
												className="flex-1 h-10 rounded-xl border border-[var(--dashboard-border)] text-[12px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-colors text-center cursor-pointer flex items-center justify-center shrink-0"
											>
												<span>Rebook Job</span>
											</button>
										)}
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</div>
		</main>
	);
}
