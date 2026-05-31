import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	Star,
	Search,
	X,
	Plus,
	MessageSquare,
	ChevronRight,
	ThumbsUp,
	Edit2,
	Trash2,
	Clock,
	Award,
} from "lucide-react";
import { useState, useContext, useMemo } from "react";
import { DashboardContext } from "../_dashboard";
import { cn } from "#/lib/utils.ts";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";

export const Route = createFileRoute("/_dashboard/reviews")({
	component: ReviewsPage,
});

/* ── Types ─────────────────────────────────────────────────── */
interface WrittenReview {
	id: string;
	artisanName: string;
	artisanTrade: string;
	avatarInitials: string;
	avatarBgClass: string;
	rating: number;
	date: string;
	jobTitle: string;
	comment: string;
	tags: string[];
	recommended: boolean;
}

interface PendingReview {
	id: string; // Booking Ticket ID
	artisanName: string;
	artisanTrade: string;
	avatarInitials: string;
	avatarBgClass: string;
	jobTitle: string;
	date: string;
	cost: string;
}

/* ── Seed Data ──────────────────────────────────────────────── */
const INITIAL_WRITTEN_REVIEWS: WrittenReview[] = [
	{
		id: "rev-1",
		artisanName: "Emeka Nwosu",
		artisanTrade: "Master Plumber",
		avatarInitials: "EM",
		avatarBgClass: "bg-[#E0F2FE] text-[#0369A1]",
		rating: 5,
		date: "May 29, 2026",
		jobTitle: "Kitchen Sink Leak Repair",
		comment: "Emeka arrived right on time and was extremely professional. He quickly identified the split PVC pipe under the kitchen bottom drawer cabinet and replaced it within 30 minutes. Tested everything thoroughly for leaks before leaving. The sink area is completely sealed now. Highly recommended!",
		tags: ["Punctual", "Fair Pricing", "Expert Work"],
		recommended: true,
	},
	{
		id: "rev-2",
		artisanName: "Fatima Abubakar",
		artisanTrade: "Carpenter & Joiner",
		avatarInitials: "FA",
		avatarBgClass: "bg-[#FDF4E3] text-[#B7791F]",
		rating: 4,
		date: "April 20, 2026",
		jobTitle: "Door Frame Realignment",
		comment: "Very neat job. Fatima fixed two warped bedroom door frames that wouldn't close properly. She worked diligently and vacuumed the wood shavings afterwards. The only reason for 4 stars is she was about 15 minutes late, but she communicated clearly beforehand.",
		tags: ["Clean Workspace", "Highly Skilled"],
		recommended: true,
	},
];

const INITIAL_PENDING_REVIEWS: PendingReview[] = [
	{
		id: "#1039",
		artisanName: "Biodun Kareem",
		artisanTrade: "AC Technician",
		avatarInitials: "BK",
		avatarBgClass: "bg-[#E2FBF0] text-[#0F766E]",
		jobTitle: "AC Servicing (3 Lounge Units)",
		date: "Yesterday, May 30",
		cost: "₦27,000",
	},
];

/* ── Main Component ────────────────────────────────────────── */
function ReviewsPage() {
	const { setIsMobileSidebarOpen } = useContext(DashboardContext);

	// Core state
	const [writtenReviews, setWrittenReviews] = useState<WrittenReview[]>(INITIAL_WRITTEN_REVIEWS);
	const [pendingReviews, setPendingReviews] = useState<PendingReview[]>(INITIAL_PENDING_REVIEWS);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterRating, setFilterRating] = useState<"all" | "5" | "4" | "3">("all");

	// Add/Edit review modal states
	const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
	const [currentPending, setCurrentPending] = useState<PendingReview | null>(null);
	const [editingReview, setEditingReview] = useState<WrittenReview | null>(null);

	// Form states
	const [formRating, setFormRating] = useState<number>(5);
	const [formHoverRating, setFormHoverRating] = useState<number | null>(null);
	const [formComment, setFormComment] = useState("");
	const [formTags, setFormTags] = useState<string[]>([]);
	const [formRecommended, setFormRecommended] = useState(true);

	// Tags options
	const tagOptions = ["Punctual", "Fair Pricing", "Expert Work", "Clean Workspace", "Highly Skilled", "Polite"];

	// Computed statistics
	const stats = useMemo(() => {
		if (writtenReviews.length === 0) {
			return { average: 0, total: 0, breakdown: [0, 0, 0, 0, 0] };
		}
		const total = writtenReviews.length;
		const sum = writtenReviews.reduce((acc, r) => acc + r.rating, 0);
		const average = parseFloat((sum / total).toFixed(1));

		const counts = [0, 0, 0, 0, 0]; // index 0 for 5★, index 4 for 1★
		writtenReviews.forEach((r) => {
			const index = 5 - r.rating;
			if (index >= 0 && index < 5) counts[index]++;
		});

		const breakdown = counts.map((c) => Math.round((c / total) * 100));
		return { average, total, breakdown };
	}, [writtenReviews]);

	// Filtered feed
	const filteredReviews = useMemo(() => {
		return writtenReviews.filter((r) => {
			// Rating filter
			if (filterRating !== "all") {
				const target = parseInt(filterRating);
				if (target === 3) {
					if (r.rating > 3) return false;
				} else {
					if (r.rating !== target) return false;
				}
			}

			// Search filter
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				return (
					r.artisanName.toLowerCase().includes(q) ||
					r.artisanTrade.toLowerCase().includes(q) ||
					r.comment.toLowerCase().includes(q) ||
					r.jobTitle.toLowerCase().includes(q)
				);
			}

			return true;
		});
	}, [writtenReviews, filterRating, searchQuery]);

	// Toggle tag helper
	const handleTagToggle = (tag: string) => {
		setFormTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	// Open reviewer for a pending item
	const handleOpenReviewer = (pending: PendingReview) => {
		setCurrentPending(pending);
		setEditingReview(null);
		setFormRating(5);
		setFormComment("");
		setFormTags([]);
		setFormRecommended(true);
		setIsReviewModalOpen(true);
	};

	// Open editor for an existing review
	const handleOpenEditor = (review: WrittenReview) => {
		setEditingReview(review);
		setCurrentPending(null);
		setFormRating(review.rating);
		setFormComment(review.comment);
		setFormTags(review.tags);
		setFormRecommended(review.recommended);
		setIsReviewModalOpen(true);
	};

	// Submit review (both write and edit)
	const handleSubmitReview = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formComment.trim()) return;

		if (editingReview) {
			// Edit mode
			setWrittenReviews((prev) =>
				prev.map((r) =>
					r.id === editingReview.id
						? {
								...r,
								rating: formRating,
								comment: formComment.trim(),
								tags: formTags,
								recommended: formRecommended,
							}
						: r
				)
			);
		} else if (currentPending) {
			// Write mode
			const newReview: WrittenReview = {
				id: `rev-${Date.now()}`,
				artisanName: currentPending.artisanName,
				artisanTrade: currentPending.artisanTrade,
				avatarInitials: currentPending.avatarInitials,
				avatarBgClass: currentPending.avatarBgClass,
				rating: formRating,
				date: "Today, Just now",
				jobTitle: currentPending.jobTitle,
				comment: formComment.trim(),
				tags: formTags,
				recommended: formRecommended,
			};

			setWrittenReviews((prev) => [newReview, ...prev]);
			// Remove from pending
			setPendingReviews((prev) => prev.filter((p) => p.id !== currentPending.id));
		}

		setIsReviewModalOpen(false);
		setCurrentPending(null);
		setEditingReview(null);
	};

	// Delete review
	const handleDeleteReview = (id: string) => {
		if (window.confirm("Are you sure you want to delete this review?")) {
			setWrittenReviews((prev) => prev.filter((r) => r.id !== id));
		}
	};

	// Layout animations
	const containerVariants = {
		hidden: { opacity: 0 },
		show: { opacity: 1, transition: { staggerChildren: 0.05 } },
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 12 },
		show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
	};

	return (
		<main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--dashboard-bg)]">
			
			{/* ── Top Bar Header & Page Title ───────────────────────────────────────── */}
			<div className="shrink-0 bg-[var(--dashboard-bg)] px-5 sm:px-8 pt-5 sm:pt-7 pb-4 space-y-4 border-b border-[var(--dashboard-border)]">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setIsMobileSidebarOpen(true)}
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
								Share feedback about your artisan bookings and manage past ratings
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
							<span className="text-[20px] text-[var(--dashboard-muted)] font-extrabold pb-2">/5</span>
						</div>
						
						{/* Render Average Stars */}
						<div className="flex gap-1 my-2">
							{Array.from({ length: 5 }).map((_, i) => (
								<Star
									key={i}
									size={16}
									className={cn(
										"stroke-[2.5]",
										i < Math.round(stats.average)
											? "text-amber-500 fill-amber-500"
											: "text-[var(--dashboard-border)]"
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
									<div key={ratingNum} className="flex items-center gap-3 text-[11.5px]">
										<span className="w-8 font-bold text-[var(--dashboard-muted)] text-right shrink-0 flex items-center justify-end gap-0.5 leading-none">
											{ratingNum} <Star size={10} className="fill-amber-500 text-amber-500 inline" />
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
				{pendingReviews.length > 0 && (
					<div className="space-y-3">
						<h3 className="font-syne font-extrabold text-[14.5px] text-[var(--dashboard-text)] flex items-center gap-1.5">
							<Clock size={15} className="text-[var(--dashboard-orange)] animate-pulse" />
							Pending Feedback Tasks
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{pendingReviews.map((pending) => (
								<div
									key={pending.id}
									className="bg-orange-50/50 dark:bg-orange-500/5 border border-orange-200/50 dark:border-orange-900/10 rounded-2xl p-4.5 flex gap-3.5 items-center justify-between shadow-xs"
								>
									<div className="flex items-center gap-3 min-w-0">
										<div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-[12.5px] shrink-0 shadow-xs", pending.avatarBgClass)}>
											{pending.avatarInitials}
										</div>
										<div className="min-w-0">
											<div className="flex items-center gap-1.5">
												<span className="font-syne font-extrabold text-[13.5px] text-[var(--dashboard-text)] leading-none truncate">
													{pending.artisanName}
												</span>
												<span className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase shrink-0">
													{pending.artisanTrade}
												</span>
											</div>
											<p className="text-[11.5px] text-[var(--dashboard-muted)] truncate mt-1 leading-none font-semibold">
												{pending.jobTitle}
											</p>
											<span className="text-[9.5px] text-[var(--dashboard-muted)] mt-1.5 block leading-none">
												Completed {pending.date}
											</span>
										</div>
									</div>

									<button
										type="button"
										onClick={() => handleOpenReviewer(pending)}
										className="py-1.5 px-3.5 bg-[var(--dashboard-orange)] hover:bg-orange-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-orange-500/10 active:scale-95 transition-all shrink-0"
									>
										Rate Job <ChevronRight size={13} className="stroke-[3]" />
									</button>
								</div>
							))}
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
								Read, search, edit, or remove review comments you have logged
							</p>
						</div>

						{/* search and rating tabs filter */}
						<div className="flex items-center gap-2 max-w-sm w-full sm:w-60 relative self-end shrink-0">
							<Search size={13} className="absolute left-3 text-[var(--dashboard-muted)] pointer-events-none" />
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
										: "border-transparent text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)]"
								)}
							>
								{tab === "all" ? (
									"All Ratings"
								) : tab === "3" ? (
									"3★ & Lower"
								) : (
									<>
										{tab} <Star size={10} className="fill-amber-500 text-amber-500 inline pb-0.25" /> Stars
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
							{filteredReviews.map((review) => (
								<motion.div
									key={review.id}
									variants={itemVariants}
									className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 space-y-4 shadow-xs relative group"
								>
									{/* Top Header segment: Partner avatar & metadata */}
									<div className="flex items-start justify-between gap-3">
										<div className="flex items-center gap-3 min-w-0">
											<div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-[12.5px] shrink-0 shadow-xs", review.avatarBgClass)}>
												{review.avatarInitials}
											</div>
											<div className="min-w-0">
												<div className="flex items-center gap-1.5 flex-wrap">
													<h4 className="font-syne font-extrabold text-[14px] text-[var(--dashboard-text)] leading-none truncate">
														{review.artisanName}
													</h4>
													<span className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase shrink-0">
														{review.artisanTrade}
													</span>
												</div>
												<span className="text-[10px] text-[var(--dashboard-muted)] mt-1.5 block leading-none font-bold">
													{review.jobTitle}
												</span>
											</div>
										</div>

										{/* Rating Stars value display & actions */}
										<div className="flex items-center gap-4 shrink-0">
											<div className="text-right">
												<div className="flex gap-0.5 justify-end mb-1">
													{Array.from({ length: 5 }).map((_, i) => (
														<Star
															key={i}
															size={11.5}
															className={cn(
																"stroke-[2.5]",
																i < review.rating
																	? "text-amber-500 fill-amber-500"
																	: "text-[var(--dashboard-border)]"
															)}
														/>
													))}
												</div>
												<span className="text-[9.5px] text-[var(--dashboard-muted)] font-semibold leading-none">
													Reviewed {review.date}
												</span>
											</div>

											{/* Action triggers */}
											<div className="flex gap-1 relative opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
												<button
													type="button"
													onClick={() => handleOpenEditor(review)}
													className="w-7 h-7 rounded-lg border border-[var(--dashboard-border)] hover:border-[var(--dashboard-orange-mid)] bg-[var(--dashboard-bg)] flex items-center justify-center text-[var(--dashboard-muted)] hover:text-[var(--dashboard-orange)] transition-colors cursor-pointer"
													title="Edit feedback"
												>
													<Edit2 size={11} />
												</button>
												<button
													type="button"
													onClick={() => handleDeleteReview(review.id)}
													className="w-7 h-7 rounded-lg border border-red-200 dark:border-red-950/40 bg-[var(--dashboard-bg)] flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
													title="Delete feedback"
												>
													<Trash2 size={11} />
												</button>
											</div>
										</div>
									</div>

									{/* Evaluation comment body text */}
									<p className="text-[12.5px] text-[var(--dashboard-text)] leading-relaxed font-medium">
										{review.comment}
									</p>

									{/* bottom tags indicators */}
									<div className="flex justify-between items-center gap-3 pt-1 border-t border-[var(--dashboard-border)]/40 text-[11px] flex-wrap">
										<div className="flex gap-1 flex-wrap">
											{review.tags.map((tag) => (
												<span
													key={tag}
													className="px-2 py-0.5 rounded-md bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[9.5px] font-bold text-[var(--dashboard-muted)]"
												>
													{tag}
												</span>
											))}
										</div>

										{review.recommended && (
											<div className="flex items-center gap-1 font-bold text-green-600 dark:text-green-400">
												<ThumbsUp size={11} className="stroke-[2.5]" />
												<span>Recommends to community</span>
											</div>
										)}
									</div>
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
							{editingReview ? "Edit Feedback evaluation" : "Log Verified Evaluation"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmitReview} className="p-6 space-y-4">
						
						{/* Context artisan details */}
						{(currentPending || editingReview) && (
							<div className="bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)]/50 p-3 rounded-xl flex items-center gap-3 shrink-0">
								<div className={cn("w-9 h-9 rounded-lg flex items-center justify-center font-black text-[12px] shrink-0 shadow-xs", currentPending?.avatarBgClass || editingReview?.avatarBgClass)}>
									{currentPending?.avatarInitials || editingReview?.avatarInitials}
								</div>
								<div className="min-w-0">
									<p className="text-[13px] font-bold text-[var(--dashboard-text)] leading-none mb-1">
										{currentPending?.artisanName || editingReview?.artisanName}
									</p>
									<span className="text-[10px] text-[var(--dashboard-muted)] font-medium">
										{currentPending?.artisanTrade || editingReview?.artisanTrade} · {currentPending?.jobTitle || editingReview?.jobTitle}
									</span>
								</div>
							</div>
						)}

						{/* Interactive Rating picker segment */}
						<div className="space-y-1.5 text-center py-2 bg-[var(--dashboard-bg)]/40 rounded-xl border border-[var(--dashboard-border)]/30">
							<label className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
								Tap Stars to Rate Artisan
							</label>
							<div className="flex gap-2 justify-center items-center">
								{Array.from({ length: 5 }).map((_, i) => {
									const ratingVal = i + 1;
									const isActive = formHoverRating !== null ? ratingVal <= formHoverRating : ratingVal <= formRating;

									return (
										<button
											key={ratingVal}
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
														: "text-[var(--dashboard-border)]"
												)}
											/>
										</button>
									);
								})}
							</div>
						</div>

						{/* Text feedback description */}
						<div className="space-y-1.5">
							<label className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
								Write Comment details
							</label>
							<textarea
								required
								rows={4}
								value={formComment}
								onChange={(e) => setFormComment(e.target.value)}
								placeholder="Describe the artisan's skills, punctuality, and overall quality of work..."
								className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] resize-none"
							/>
						</div>

						{/* Tags selector segment */}
						<div className="space-y-1.5">
							<label className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
								Review Tags (Select attributes)
							</label>
							<div className="flex flex-wrap gap-1">
								{tagOptions.map((tag) => {
									const isSelected = formTags.includes(tag);
									return (
										<button
											key={tag}
											type="button"
											onClick={() => handleTagToggle(tag)}
											className={cn(
												"px-2.5 py-1 rounded-lg text-[9.5px] font-bold border transition-colors cursor-pointer",
												isSelected
													? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange-mid)] text-[var(--dashboard-orange)]"
													: "bg-[var(--dashboard-bg)] border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)]"
											)}
										>
											{tag}
										</button>
									);
								})}
							</div>
						</div>

						{/* Recommend to community toggle */}
						<label className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--dashboard-bg)]/60 border border-[var(--dashboard-border)]/40 cursor-pointer">
							<input
								type="checkbox"
								checked={formRecommended}
								onChange={(e) => setFormRecommended(e.target.checked)}
								className="accent-green-600 shrink-0"
							/>
							<div className="min-w-0 flex-1">
								<p className="text-[12px] font-extrabold text-[var(--dashboard-text)] leading-none mb-0.5">
									Recommend this Artisan
								</p>
								<span className="text-[9.5px] text-[var(--dashboard-muted)] font-medium">
									Toggles recommendations tags in community listing grids
								</span>
							</div>
						</label>

						{/* Submit/cancel action triggers */}
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
								disabled={!formComment.trim()}
								className="flex-1 py-2.5 bg-[var(--dashboard-orange)] hover:bg-orange-600 text-white disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								{editingReview ? "Save Changes" : "Publish Evaluation"}
							</button>
						</div>

					</form>
				</DialogContent>
			</Dialog>

		</main>
	);
}
