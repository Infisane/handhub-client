import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	Award,
	ChevronRight,
	Clock,
	MessageSquare,
	Plus,
	Search,
	Star,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import { formatNaira } from "#/core/helpers/money.helper";
import { useAppDispatch } from "#/core/hooks/useStore.hook";
import { useGetBookingsQuery } from "#/core/queries/booking.q";
import {
	useCreateReviewQuery,
	useGetMyReviewsQuery,
} from "#/core/queries/review.q";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";
import type { Booking } from "#/core/types/chat.types";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/reviews")({
	component: ReviewsPage,
});

function initialsOf(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join("");
}

/* ── Main Component ────────────────────────────────────────── */
function ReviewsPage() {
	const dispatch = useAppDispatch();

	const [searchQuery, setSearchQuery] = useState("");
	const [filterRating, setFilterRating] = useState<"all" | "5" | "4" | "3">(
		"all",
	);

	const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
	const [currentPending, setCurrentPending] = useState<Booking | null>(null);

	const [formRating, setFormRating] = useState<number>(5);
	const [formHoverRating, setFormHoverRating] = useState<number | null>(null);
	const [formComment, setFormComment] = useState("");

	const { data: myReviews } = useGetMyReviewsQuery();
	const { data: pendingBookings } = useGetBookingsQuery({
		status: "completed",
		reviewed: false,
	});
	// Enrichment join — Review has no artisan name/job title, Booking does.
	const { data: reviewedBookings } = useGetBookingsQuery({
		status: "completed",
		reviewed: true,
	});

	const createReview = useCreateReviewQuery({
		onSuccessCallback: () => {
			setIsReviewModalOpen(false);
			setCurrentPending(null);
			setFormComment("");
		},
	});

	const enrichedReviews = useMemo(() => {
		const bookingsById = new Map(
			(reviewedBookings ?? []).map((b) => [b.id, b]),
		);
		return (myReviews ?? []).map((review) => {
			const booking = bookingsById.get(review.bookingId);
			return {
				review,
				artisanName: booking?.provider?.businessName ?? "Provider",
				jobTitle: booking?.serviceTitle ?? "Service",
			};
		});
	}, [myReviews, reviewedBookings]);

	// Computed statistics
	const stats = useMemo(() => {
		const reviews = myReviews ?? [];
		if (reviews.length === 0) {
			return { average: 0, total: 0, breakdown: [0, 0, 0, 0, 0] };
		}
		const total = reviews.length;
		const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
		const average = Number.parseFloat((sum / total).toFixed(1));

		const counts = [0, 0, 0, 0, 0]; // index 0 for 5★, index 4 for 1★
		for (const r of reviews) {
			const index = 5 - r.rating;
			if (index >= 0 && index < 5) counts[index]++;
		}

		const breakdown = counts.map((c) => Math.round((c / total) * 100));
		return { average, total, breakdown };
	}, [myReviews]);

	// Filtered feed
	const filteredReviews = useMemo(() => {
		return enrichedReviews.filter(({ review, artisanName, jobTitle }) => {
			if (filterRating !== "all") {
				const target = Number.parseInt(filterRating, 10);
				if (target === 3) {
					if (review.rating > 3) return false;
				} else if (review.rating !== target) {
					return false;
				}
			}

			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				return (
					artisanName.toLowerCase().includes(q) ||
					jobTitle.toLowerCase().includes(q) ||
					review.comment.toLowerCase().includes(q)
				);
			}

			return true;
		});
	}, [enrichedReviews, filterRating, searchQuery]);

	const handleOpenReviewer = (pending: Booking) => {
		setCurrentPending(pending);
		setFormRating(5);
		setFormComment("");
		setIsReviewModalOpen(true);
	};

	const handleSubmitReview = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formComment.trim() || !currentPending) return;
		createReview.mutate({
			bookingId: currentPending.id,
			rating: formRating,
			comment: formComment.trim(),
		});
	};

	// Layout animations
	const containerVariants = {
		hidden: { opacity: 0 },
		show: { opacity: 1, transition: { staggerChildren: 0.05 } },
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 12 },
		show: {
			opacity: 1,
			y: 0,
			transition: { type: "spring" as const, stiffness: 120, damping: 18 },
		},
	};

	const modalArtisanName = currentPending?.provider?.businessName ?? "Provider";

	return (
		<main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--dashboard-bg)]">
			{/* ── Top Bar Header & Page Title ───────────────────────────────────────── */}
			<div className="shrink-0 bg-[var(--dashboard-bg)] px-5 sm:px-8 pt-5 sm:pt-7 pb-4 space-y-4 border-b border-[var(--dashboard-border)]">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() =>
								dispatch(set_dashboard_flags({ isMobileSidebarOpen: true }))
							}
							className="md:hidden w-9 h-9 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text)] hover:bg-[var(--dashboard-orange-light)] transition-all shrink-0 shadow-xs"
							aria-label="Open navigation"
						>
							<Plus size={16} className="rotate-45" />
						</button>
						<div>
							<h2 className="font-syne font-extrabold text-[22px] sm:text-[26px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1.5 flex items-center gap-2">
								My Reviews
							</h2>
							<p className="text-[12px] text-[var(--dashboard-muted)] font-medium">
								Share feedback about your artisan bookings and manage past
								ratings
							</p>
						</div>
					</div>
				</div>

				{/* ── Statistics Breakdown row ───────────────────────────────────────── */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
					{/* Rating Average Big Badge */}
					<div className="md:col-span-4 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-xs relative overflow-hidden group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all" />
						<div className="font-syne font-black text-[46px] sm:text-[52px] text-[var(--dashboard-text)] leading-none tracking-tighter flex items-end gap-1.5">
							{stats.average}
							<span className="text-[20px] text-[var(--dashboard-muted)] font-extrabold pb-2">
								/5
							</span>
						</div>

						{/* Render Average Stars */}
						<div className="flex gap-1 my-2">
							{Array.from({ length: 5 }).map((_, i) => (
								<Star
									// biome-ignore lint/suspicious/noArrayIndexKey: static fixed-length star row
									key={`avg-star-${i}`}
									size={16}
									className={cn(
										"stroke-[2.5]",
										i < Math.round(stats.average)
											? "text-amber-500 fill-amber-500"
											: "text-[var(--dashboard-border)]",
									)}
								/>
							))}
						</div>

						<p className="text-[11.5px] text-[var(--dashboard-muted)] font-extrabold uppercase tracking-wider mt-1 leading-none">
							Average Rating Given
						</p>
						<span className="text-[10px] text-[var(--dashboard-muted)] mt-1.5 block">
							Based on {stats.total} total verified evaluations
						</span>
					</div>

					{/* Stars Progress bars breakdown */}
					<div className="md:col-span-8 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 flex flex-col justify-between shadow-xs">
						<h4 className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
							<Award size={13} className="text-[var(--dashboard-orange)]" />
							Feedback Rating Distribution
						</h4>

						<div className="space-y-1.5 flex-1 flex flex-col justify-center">
							{stats.breakdown.map((pct, idx) => {
								const ratingNum = 5 - idx;
								return (
									<div
										key={ratingNum}
										className="flex items-center gap-3 text-[11.5px]"
									>
										<span className="w-8 font-bold text-[var(--dashboard-muted)] text-right shrink-0 flex items-center justify-end gap-0.5 leading-none">
											{ratingNum}{" "}
											<Star
												size={10}
												className="fill-amber-500 text-amber-500 inline"
											/>
										</span>
										<div className="flex-1 h-2 rounded-full bg-[var(--dashboard-bg)] overflow-hidden border border-[var(--dashboard-border)]/50">
											<div
												className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
												style={{ width: `${pct}%` }}
											/>
										</div>
										<span className="w-10 text-[var(--dashboard-muted)] font-bold text-left shrink-0 leading-none">
											{pct}%
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* ── main content area scroll feed ─────────────────────────────────── */}
			<div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-7 scrollbar-none pb-24 sm:pb-8">
				{/* ── Pending Reviews Alert Section ──────────────────────────────────── */}
				{!!pendingBookings?.length && (
					<div className="space-y-3">
						<h3 className="font-syne font-extrabold text-[14.5px] text-[var(--dashboard-text)] flex items-center gap-1.5">
							<Clock
								size={15}
								className="text-[var(--dashboard-orange)] animate-pulse"
							/>
							Pending Feedback Tasks
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{pendingBookings.map((pending) => {
								const artisanName =
									pending.provider?.businessName ?? "Provider";
								return (
									<div
										key={pending.id}
										className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/50 dark:border-blue-900/10 rounded-2xl p-4.5 flex gap-3.5 items-center justify-between shadow-xs"
									>
										<div className="flex items-center gap-3 min-w-0">
											<div className="w-10 h-10 rounded-xl bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] flex items-center justify-center font-black text-[12.5px] shrink-0 shadow-xs">
												{initialsOf(artisanName)}
											</div>
											<div className="min-w-0">
												<span className="font-syne font-extrabold text-[13.5px] text-[var(--dashboard-text)] leading-none truncate block">
													{artisanName}
												</span>
												<p className="text-[11.5px] text-[var(--dashboard-muted)] truncate mt-1 leading-none font-semibold">
													{pending.serviceTitle}
												</p>
												<span className="text-[9.5px] text-[var(--dashboard-muted)] mt-1.5 block leading-none">
													{formatNaira(pending.price)}
												</span>
											</div>
										</div>

										<button
											type="button"
											onClick={() => handleOpenReviewer(pending)}
											className="py-1.5 px-3.5 bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 transition-all shrink-0"
										>
											Rate Job <ChevronRight size={13} className="stroke-[3]" />
										</button>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* ── Past Feedback Written Feed ─────────────────────────────────────── */}
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div>
							<h3 className="font-syne font-extrabold text-[15px] sm:text-[17px] text-[var(--dashboard-text)] leading-none mb-1">
								Written Evaluations Feed
							</h3>
							<p className="text-[11.5px] text-[var(--dashboard-muted)] font-medium">
								Feedback you've logged for completed bookings
							</p>
						</div>

						<div className="flex items-center gap-2 max-w-sm w-full sm:w-60 relative self-end shrink-0">
							<Search
								size={13}
								className="absolute left-3 text-[var(--dashboard-muted)] pointer-events-none"
							/>
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search artisan or evaluation..."
								className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] transition-colors shadow-xs"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-2 text-[var(--dashboard-muted)] hover:text-[var(--dashboard-orange)]"
								>
									<X size={12} className="stroke-[3.5]" />
								</button>
							)}
						</div>
					</div>

					{/* Stars tab row */}
					<div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5 border-b border-[var(--dashboard-border)]/40">
						{(["all", "5", "4", "3"] as const).map((tab) => (
							<button
								key={tab}
								type="button"
								onClick={() => setFilterRating(tab)}
								className={cn(
									"px-3.5 py-1.5 rounded-t-xl text-[12px] font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1",
									filterRating === tab
										? "border-[var(--dashboard-orange)] text-[var(--dashboard-orange)] bg-[var(--dashboard-orange-light)]/10"
										: "border-transparent text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)]",
								)}
							>
								{tab === "all" ? (
									"All Ratings"
								) : tab === "3" ? (
									"3★ & Lower"
								) : (
									<>
										{tab}{" "}
										<Star
											size={10}
											className="fill-amber-500 text-amber-500 inline pb-0.25"
										/>{" "}
										Stars
									</>
								)}
							</button>
						))}
					</div>

					{/* Feed cards list */}
					{filteredReviews.length === 0 ? (
						<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl text-center py-12 text-[var(--dashboard-muted)] space-y-2">
							<MessageSquare className="mx-auto size-7 opacity-35" />
							<p className="text-[12px] font-bold">No evaluation logs found</p>
						</div>
					) : (
						<motion.div
							variants={containerVariants}
							initial="hidden"
							animate="show"
							className="space-y-4"
						>
							{filteredReviews.map(({ review, artisanName, jobTitle }) => (
								<motion.div
									key={review.id}
									variants={itemVariants}
									className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 space-y-4 shadow-xs relative group"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex items-center gap-3 min-w-0">
											<div className="w-10 h-10 rounded-xl bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] flex items-center justify-center font-black text-[12.5px] shrink-0 shadow-xs">
												{initialsOf(artisanName)}
											</div>
											<div className="min-w-0">
												<h4 className="font-syne font-extrabold text-[14px] text-[var(--dashboard-text)] leading-none truncate">
													{artisanName}
												</h4>
												<span className="text-[10px] text-[var(--dashboard-muted)] mt-1.5 block leading-none font-bold">
													{jobTitle}
												</span>
											</div>
										</div>

										<div className="text-right shrink-0">
											<div className="flex gap-0.5 justify-end mb-1">
												{Array.from({ length: 5 }).map((_, i) => (
													<Star
														// biome-ignore lint/suspicious/noArrayIndexKey: static fixed-length star row
														key={`${review.id}-star-${i}`}
														size={11.5}
														className={cn(
															"stroke-[2.5]",
															i < review.rating
																? "text-amber-500 fill-amber-500"
																: "text-[var(--dashboard-border)]",
														)}
													/>
												))}
											</div>
											<span className="text-[9.5px] text-[var(--dashboard-muted)] font-semibold leading-none">
												Reviewed{" "}
												{new Date(review.createdAt).toLocaleDateString([], {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</span>
										</div>
									</div>

									<p className="text-[12.5px] text-[var(--dashboard-text)] leading-relaxed font-medium">
										{review.comment}
									</p>
								</motion.div>
							))}
						</motion.div>
					)}
				</div>
			</div>

			{/* ── Dialog modal reviewer component ─────────────────────────────────── */}
			<Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader className="p-6 pb-2 border-b border-[var(--dashboard-border)]">
						<DialogTitle className="font-syne font-extrabold text-[18px] text-[var(--dashboard-text)] leading-none flex items-center gap-2">
							<Star size={18} className="text-[var(--dashboard-orange)]" />
							Log Verified Evaluation
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmitReview} className="p-6 space-y-4">
						{currentPending && (
							<div className="bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)]/50 p-3 rounded-xl flex items-center gap-3 shrink-0">
								<div className="w-9 h-9 rounded-lg bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] flex items-center justify-center font-black text-[12px] shrink-0 shadow-xs">
									{initialsOf(modalArtisanName)}
								</div>
								<div className="min-w-0">
									<p className="text-[13px] font-bold text-[var(--dashboard-text)] leading-none mb-1">
										{modalArtisanName}
									</p>
									<span className="text-[10px] text-[var(--dashboard-muted)] font-medium">
										{currentPending.serviceTitle}
									</span>
								</div>
							</div>
						)}

						<div className="space-y-1.5 text-center py-2 bg-[var(--dashboard-bg)]/40 rounded-xl border border-[var(--dashboard-border)]/30">
							<label className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
								Tap Stars to Rate Artisan
							</label>
							<div className="flex gap-2 justify-center items-center">
								{Array.from({ length: 5 }).map((_, i) => {
									const ratingVal = i + 1;
									const isActive =
										formHoverRating !== null
											? ratingVal <= formHoverRating
											: ratingVal <= formRating;

									return (
										<button
											key={`rate-star-${ratingVal}`}
											type="button"
											onClick={() => setFormRating(ratingVal)}
											onMouseEnter={() => setFormHoverRating(ratingVal)}
											onMouseLeave={() => setFormHoverRating(null)}
											className="p-1 focus:outline-none transition-transform hover:scale-120 cursor-pointer"
										>
											<Star
												size={26}
												className={cn(
													"stroke-[2.5] transition-colors duration-150",
													isActive
														? "text-amber-500 fill-amber-500 filter drop-shadow-[0_0_2px_rgba(245,158,11,0.25)]"
														: "text-[var(--dashboard-border)]",
												)}
											/>
										</button>
									);
								})}
							</div>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="review-comment"
								className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block"
							>
								Write Comment details
							</label>
							<textarea
								id="review-comment"
								required
								rows={4}
								value={formComment}
								onChange={(e) => setFormComment(e.target.value)}
								placeholder="Describe the artisan's skills, punctuality, and overall quality of work..."
								className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] resize-none"
							/>
						</div>

						<div className="flex gap-2.5 pt-3">
							<button
								type="button"
								onClick={() => setIsReviewModalOpen(false)}
								className="flex-1 py-2.5 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={!formComment.trim() || createReview.isPending}
								className="flex-1 py-2.5 bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								{createReview.isPending ? "Publishing…" : "Publish Evaluation"}
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</main>
	);
}
