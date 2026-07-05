import { useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	Calendar,
	Check,
	Clock,
	MessageSquare,
	ShieldCheck,
	TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatNaira, parseMoney } from "#/core/helpers/money.helper";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { useGetThreadsQuery } from "#/core/queries/thread.q";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";
import { getThreadByIdService } from "#/core/services/thread.service";
import type {
	Booking,
	BookingStatus,
	ThreadProvider,
} from "#/core/types/chat.types";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/bookings")({
	component: BookingsPage,
});

/* ── Types ─────────────────────────────────────────────────── */
type BookingTab = "all" | "active" | "completed" | "cancelled";

interface BookingRow {
	threadId: string;
	provider: ThreadProvider;
	booking: Booking;
}

/* Ticket statuses that imply a booking exists (past invoice acceptance). */
const BOOKED_TICKET_STATUSES = new Set([
	"booked",
	"in_progress",
	"completed",
	"closed",
]);

const STATUS_CONFIG: Record<
	string,
	{ label: string; bg: string; text: string; dot: string }
> = {
	accepted: {
		label: "Scheduled",
		bg: "bg-blue-50 dark:bg-blue-500/10",
		text: "text-blue-700 dark:text-blue-400",
		dot: "bg-blue-500",
	},
	in_progress: {
		label: "In Progress",
		bg: "bg-blue-50 dark:bg-blue-500/10",
		text: "text-blue-700 dark:text-blue-400",
		dot: "bg-blue-500 animate-pulse",
	},
	completed: {
		label: "Completed",
		bg: "bg-green-50 dark:bg-green-500/10",
		text: "text-green-700 dark:text-green-400",
		dot: "bg-green-500",
	},
	cancelled: {
		label: "Cancelled",
		bg: "bg-neutral-100 dark:bg-neutral-800",
		text: "text-neutral-500 dark:text-neutral-400",
		dot: "bg-neutral-400",
	},
	declined: {
		label: "Declined",
		bg: "bg-neutral-100 dark:bg-neutral-800",
		text: "text-neutral-500 dark:text-neutral-400",
		dot: "bg-neutral-400",
	},
};

function tabOf(status: BookingStatus): BookingTab {
	if (status === "completed") return "completed";
	if (status === "cancelled" || status === "declined") return "cancelled";
	return "active";
}

function providerName(provider: ThreadProvider) {
	return provider.businessName || provider.title || "Provider";
}

function initialsOf(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join("");
}

function BookingsPage() {
	const dispatch = useAppDispatch();
	const hasActiveChat = useAppSelector((s) => s.dashboardStore.hasActiveChat);
	const [activeTab, setActiveTab] = useState<BookingTab>("all");

	const { data: threads = [] } = useGetThreadsQuery();

	// Threads that have reached a booking — fetch their details (cached under the
	// same ["thread", id] key the conversation uses, so opening chat is instant).
	const bookedThreadIds = useMemo(
		() =>
			threads
				.filter(
					(t) =>
						t.activeTicket && BOOKED_TICKET_STATUSES.has(t.activeTicket.status),
				)
				.map((t) => t.id),
		[threads],
	);

	const detailQueries = useQueries({
		queries: bookedThreadIds.map((id) => ({
			queryKey: ["thread", id],
			queryFn: ({ signal }: { signal: AbortSignal }) =>
				getThreadByIdService({ id, signal }),
			staleTime: 1000 * 5,
		})),
	});

	const rows: BookingRow[] = useMemo(() => {
		const out: BookingRow[] = [];
		for (const q of detailQueries) {
			const thread = q.data;
			if (!thread) continue;
			for (const ticket of thread.tickets) {
				if (ticket.booking) {
					out.push({
						threadId: thread.id,
						provider: thread.provider,
						booking: ticket.booking,
					});
				}
			}
		}
		return out.sort(
			(a, b) =>
				new Date(b.booking.createdAt).getTime() -
				new Date(a.booking.createdAt).getTime(),
		);
	}, [detailQueries]);

	const counts = useMemo(() => {
		const c = { all: rows.length, active: 0, completed: 0, cancelled: 0 };
		for (const r of rows) c[tabOf(r.booking.status)] += 1;
		return c;
	}, [rows]);

	const totalSpent = useMemo(
		() =>
			rows
				.filter((r) => r.booking.status === "completed")
				.reduce((sum, r) => sum + parseMoney(r.booking.price), 0),
		[rows],
	);

	const filtered = useMemo(
		() =>
			activeTab === "all"
				? rows
				: rows.filter((r) => tabOf(r.booking.status) === activeTab),
		[rows, activeTab],
	);

	const openConversation = (threadId: string) =>
		dispatch(
			set_dashboard_flags({
				hasActiveChat: true,
				activeThreadId: threadId,
				activeProviderId: null,
			}),
		);

	const containerVariants = {
		hidden: { opacity: 0 },
		show: { opacity: 1, transition: { staggerChildren: 0.05 } },
	};
	const itemVariants = {
		hidden: { opacity: 0, y: 12 },
		show: {
			opacity: 1,
			y: 0,
			transition: { type: "spring" as const, stiffness: 130, damping: 18 },
		},
	};

	return (
		<main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--dashboard-bg)]">
			{/* Header + stats */}
			<div className="shrink-0 bg-[var(--dashboard-bg)] px-5 sm:px-8 pt-5 sm:pt-7 pb-4 space-y-4 border-b border-[var(--dashboard-border)]">
				<div>
					<h2 className="font-syne font-extrabold text-[22px] sm:text-[26px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1.5">
						Manage Bookings
					</h2>
					<p className="text-[12px] text-[var(--dashboard-muted)] font-medium">
						Track scheduled, in-progress, and completed artisan jobs
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
					<StatTile
						icon={<Clock size={16} className="animate-pulse" />}
						value={`${counts.active} Active`}
						label="Jobs In-Flight"
						tone="blue"
					/>
					<StatTile
						icon={<Check size={16} />}
						value={`${counts.completed} Done`}
						label="Jobs Completed"
						tone="green"
					/>
					<StatTile
						icon={<TrendingUp size={16} />}
						value={formatNaira(totalSpent)}
						label="Total Invested"
						tone="orange"
					/>
				</div>
			</div>

			{/* Tabs */}
			<div className="shrink-0 px-5 sm:px-8 py-3.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-[var(--dashboard-bg)] border-b border-[var(--dashboard-border)]/50">
				{(["all", "active", "completed", "cancelled"] as const).map((tab) => (
					<button
						key={tab}
						type="button"
						onClick={() => setActiveTab(tab)}
						className={cn(
							"px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5",
							activeTab === tab
								? "bg-[var(--dashboard-text)] border-[var(--dashboard-text)] text-white"
								: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)]",
						)}
					>
						<span className="capitalize">
							{tab === "all" ? "All Bookings" : tab}
						</span>
						<span
							className={cn(
								"text-[9px] px-1.5 py-0.25 rounded-full font-bold",
								activeTab === tab
									? "bg-white/20 text-white"
									: "bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)]",
							)}
						>
							{counts[tab]}
						</span>
					</button>
				))}
			</div>

			{/* List */}
			<div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 pb-24 md:pb-8 scrollbar-none">
				{filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-8">
						<div className="w-14 h-14 rounded-2xl bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)] flex items-center justify-center shadow-xs">
							<Calendar size={20} className="text-[var(--dashboard-muted)]" />
						</div>
						<div>
							<p className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)] mb-1">
								No bookings yet
							</p>
							<p className="text-[12px] text-[var(--dashboard-muted)]">
								Accepted invoices become bookings and show up here.
							</p>
						</div>
					</div>
				) : (
					<motion.div
						key={activeTab}
						variants={containerVariants}
						initial="hidden"
						animate="show"
						className={cn(
							"grid gap-5",
							hasActiveChat
								? "grid-cols-1 xl:grid-cols-2"
								: "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3",
						)}
					>
						{filtered.map((row) => {
							const name = providerName(row.provider);
							const cfg =
								STATUS_CONFIG[row.booking.status] ?? STATUS_CONFIG.accepted;
							return (
								<motion.div
									key={row.booking.id}
									variants={itemVariants}
									layout
									className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[var(--dashboard-orange-mid)]/40 transition-all duration-300 flex flex-col justify-between"
								>
									<div className="p-5 flex-1 flex flex-col space-y-4">
										<div className="flex items-center justify-between">
											<span className="text-[11.5px] font-extrabold text-[var(--dashboard-muted)] tracking-wider">
												{row.booking.bookingRef}
											</span>
											<span
												className={cn(
													"inline-flex items-center gap-1.5 text-[10.5px] font-extrabold px-2.5 py-0.75 rounded-full border",
													cfg.bg,
													cfg.text,
													"border-[var(--dashboard-border)]/50",
												)}
											>
												<span
													className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)}
												/>
												{cfg.label}
											</span>
										</div>

										<h3 className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)] leading-snug">
											{row.booking.serviceTitle}
										</h3>

										<div className="bg-[var(--dashboard-bg)]/50 border border-[var(--dashboard-border)]/40 rounded-xl p-3.5 flex items-center justify-between gap-2.5">
											<div className="flex items-center gap-2.5 min-w-0">
												<div className="w-8 h-8 rounded-lg bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] flex items-center justify-center font-black text-[11.5px] shrink-0">
													{initialsOf(name)}
												</div>
												<div className="min-w-0">
													<div className="text-[12px] font-bold text-[var(--dashboard-text)] flex items-center gap-1 truncate">
														{name}
														<ShieldCheck
															size={11}
															className="text-[var(--dashboard-orange)] shrink-0"
														/>
													</div>
													<div className="text-[10px] text-[var(--dashboard-muted)] font-bold capitalize">
														{row.booking.urgency} priority
													</div>
												</div>
											</div>
											<div className="text-right shrink-0">
												<div className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">
													Total Fee
												</div>
												<div className="font-syne font-extrabold text-[13.5px] text-[var(--dashboard-text)] mt-0.5">
													{formatNaira(row.booking.price)}
												</div>
											</div>
										</div>
									</div>

									<div className="px-5 pb-5 pt-4 border-t border-[var(--dashboard-border)]/40">
										<button
											type="button"
											onClick={() => openConversation(row.threadId)}
											className="w-full h-10 rounded-xl bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white text-[12px] font-extrabold flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-blue-500/10 transition-all"
										>
											<MessageSquare size={13} /> Open conversation
										</button>
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

function StatTile({
	icon,
	value,
	label,
	tone,
}: {
	icon: React.ReactNode;
	value: string;
	label: string;
	tone: "blue" | "green" | "orange";
}) {
	const toneCls =
		tone === "green"
			? "bg-green-50 dark:bg-green-500/10 text-green-600"
			: tone === "orange"
				? "bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)]"
				: "bg-blue-50 dark:bg-blue-500/10 text-[var(--dashboard-orange)]";
	return (
		<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
			<div
				className={cn(
					"w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
					toneCls,
				)}
			>
				{icon}
			</div>
			<div>
				<div className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)]">
					{value}
				</div>
				<div className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">
					{label}
				</div>
			</div>
		</div>
	);
}
