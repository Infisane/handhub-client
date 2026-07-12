import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
	Search,
	SlidersHorizontal,
	Star,
	Check,
	ChevronDown,
	X,
	Sparkles,
	ShieldCheck,
	Filter,
} from "lucide-react";
import { getCategoryIcon } from "#/core/helpers/category-icons.helper";
import { parseAsBoolean, parseAsFloat, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useState, useRef, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";
import { cn } from "#/lib/utils.ts";
import { ProviderListCard } from "#/components/dashboard/provider-list-card";
import { ProviderProfileModal } from "#/components/dashboard/provider-profile-modal";
import { useGetCategoriesQuery, useGetProvidersQuery } from "#/core/queries/artisan.q";
import type { AiSearchProvider, Category } from "#/core/types/artisan.types";

export const Route = createFileRoute("/dashboard/artisans")({
	component: FindPage,
});

/* ── Types ─────────────────────────────────────────────────── */
type SortKey = "recommended" | "rating" | "experience" | "rate_asc" | "rate_desc";
const SORT_KEYS = ["recommended", "rating", "experience", "rate_asc", "rate_desc"] as const;

const API_SORT_MAP: Partial<Record<SortKey, string>> = {
	rating: "rating",
	experience: "experience",
	rate_asc: "rate_asc",
	rate_desc: "rate_desc",
};

/* ── Constants ──────────────────────────────────────────────── */
const AVAILABILITY_OPTIONS = [
	{ label: "All Available", value: "all" },
	{ label: "Available Now", value: "now" },
	{ label: "Scheduled Only", value: "scheduled" },
];

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
	{ label: "Recommended", value: "recommended" },
	{ label: "Highest Rated", value: "rating" },
	{ label: "Most Experienced", value: "experience" },
	{ label: "Rate: Low → High", value: "rate_asc" },
	{ label: "Rate: High → Low", value: "rate_desc" },
];

/* ── Helpers ────────────────────────────────────────────────── */

function getAvailKey(p: AiSearchProvider): "now" | "scheduled" {
	return Object.keys(p.availability).length > 0 ? "scheduled" : "now";
}



/* ── Component ──────────────────────────────────────────────── */
function FindPage() {
	const dispatch = useAppDispatch();
	const hasActiveChat = useAppSelector((s) => s.dashboardStore.hasActiveChat);

	const [filters, setFilters] = useQueryStates({
		search: parseAsString.withDefault(""),
		activeCategory: parseAsString.withDefault("all"),
		activeAvail: parseAsString.withDefault("all"),
		sortKey: parseAsStringLiteral(SORT_KEYS).withDefault("recommended"),
		minRating: parseAsFloat.withDefault(0),
		verifiedOnly: parseAsBoolean.withDefault(false),
	});
	const { search, activeCategory, activeAvail, sortKey, minRating, verifiedOnly } = filters;

	const [sortOpen, setSortOpen] = useState(false);
	const [hiredIds, setHiredIds] = useState<Record<string, boolean>>({});
	const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const searchRef = useRef<HTMLInputElement>(null);

	const [debouncedSearch, setDebouncedSearch] = useState(search);
	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search), 400);
		return () => clearTimeout(id);
	}, [search]);

	const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
	const categories: Category[] = categoriesData ?? [];

	const { data, isLoading } = useGetProvidersQuery({
		limit: 100,
		...(debouncedSearch.trim() && { q: debouncedSearch.trim() }),
		...(activeCategory !== "all" && { categoryId: activeCategory }),
		...(verifiedOnly && { verified: true }),
		...(minRating > 0 && { minRating }),
		...(API_SORT_MAP[sortKey] && { sortBy: API_SORT_MAP[sortKey] }),
	});
	const providers: AiSearchProvider[] = data?.data ?? [];

	const clearAllFilters = () => {
		setFilters({ search: "", activeCategory: "all", activeAvail: "all", minRating: 0, verifiedOnly: false });
	};

	const hasActiveFilters =
		activeCategory !== "all" ||
		activeAvail !== "all" ||
		minRating > 0 ||
		verifiedOnly ||
		search.trim() !== "";

	const activeFiltersCount =
		(activeCategory !== "all" ? 1 : 0) +
		(activeAvail !== "all" ? 1 : 0) +
		(minRating > 0 ? 1 : 0) +
		(verifiedOnly ? 1 : 0);

	const filtered = useCallback(() => {
		if (activeAvail === "all") return providers;
		return providers.filter((p) => getAvailKey(p) === activeAvail);
	}, [providers, activeAvail]);

	const results = filtered();

	// Open the chat drawer targeting a provider. The thread + ticket are created
	// lazily on the first message (POST /threads/:providerId/messages).
	const openChatWith = (providerId: string) => {
		dispatch(
			set_dashboard_flags({
				hasActiveChat: true,
				activeProviderId: providerId,
				activeThreadId: null,
			}),
		);
	};

	const handleHire = (id: string) => {
		setHiredIds((prev) => ({ ...prev, [id]: true }));
		openChatWith(id);
	};

	const clearSearch = () => {
		setFilters({ search: "" });
		setDebouncedSearch("");
		searchRef.current?.focus();
	};

	const container = {
		hidden: { opacity: 0 },
		show: { opacity: 1, transition: { staggerChildren: 0.04 } },
	};

	const currentSort = SORT_OPTIONS.find((o) => o.value === sortKey)!;

	const getCategoryCount = (catId: string) => {
		if (catId === "all") return providers.length;
		return providers.filter((p) =>
			p.services.some((s) => s.categoryId === catId),
		).length;
	};

	const gridClass = cn(
		"grid gap-5",
		hasActiveChat
			? "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
			: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
	);

	return (
		<main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--dashboard-bg)]">
			{/* ── Top Bar ─────────────────────────────────────────────── */}
			<div className="shrink-0 bg-[var(--dashboard-bg)] px-5 sm:px-8 pt-5 sm:pt-7 pb-3 space-y-4 border-b border-[var(--dashboard-border)]">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						<h2 className="font-syne font-extrabold text-[22px] sm:text-[26px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1.5">
							Find Premium Artisans
						</h2>
						<p className="text-[12px] text-[var(--dashboard-muted)] font-medium">
							{isLoading ? (
								"Loading providers…"
							) : (
								<>
									Showing{" "}
									<span className="text-[var(--dashboard-orange)] font-bold">{results.length}</span>
									{" "}of{" "}
									<span className="font-semibold text-[var(--dashboard-text)]">{data?.meta.total ?? providers.length}</span>
									{" "}verified professionals
								</>
							)}
						</p>
					</div>
				</div>

				{/* Search + Sort */}
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)] pointer-events-none" />
						<input
							ref={searchRef}
							type="text"
							value={search}
							onChange={(e) => setFilters({ search: e.target.value })}
							placeholder="Search by name, trade, skills..."
							className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[13px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] focus:ring-2 focus:ring-[var(--dashboard-orange)]/10 transition-all duration-150 shadow-xs"
						/>
						{search && (
							<button
								type="button"
								onClick={clearSearch}
								className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-muted)] hover:bg-[var(--dashboard-orange)] hover:text-white transition-all duration-150 cursor-pointer"
							>
								<X size={10} className="stroke-[3]" />
							</button>
						)}
					</div>

					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setFiltersExpanded(!filtersExpanded)}
							className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-[12.5px] font-bold cursor-pointer transition-all duration-150 shadow-xs ${
								filtersExpanded || activeFiltersCount > 0
									? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange)] text-[var(--dashboard-orange)]"
									: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] hover:border-[var(--dashboard-orange-mid)]"
							}`}
						>
							<Filter size={13} />
							<span>Filters</span>
							{activeFiltersCount > 0 && (
								<span className="w-4.5 h-4.5 rounded-full bg-[var(--dashboard-orange)] text-white text-[9.5px] font-extrabold flex items-center justify-center shrink-0">
									{activeFiltersCount}
								</span>
							)}
						</button>

						<div className="relative">
							<button
								type="button"
								onClick={() => setSortOpen((v) => !v)}
								className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] font-bold text-[var(--dashboard-text)] hover:border-[var(--dashboard-orange-mid)] transition-all duration-150 shadow-xs cursor-pointer select-none"
							>
								<SlidersHorizontal size={13} className="text-[var(--dashboard-muted)]" />
								<span>{currentSort.label}</span>
								<ChevronDown size={12} className={`text-[var(--dashboard-muted)] transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
							</button>

							<AnimatePresence>
								{sortOpen && (
									<motion.div
										initial={{ opacity: 0, y: -6, scale: 0.96 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: -6, scale: 0.96 }}
										transition={{ duration: 0.15 }}
										className="absolute right-0 top-full mt-1.5 z-20 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl shadow-xl p-1 min-w-[195px]"
									>
										{SORT_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												type="button"
												onClick={() => { setFilters({ sortKey: opt.value }); setSortOpen(false); }}
												className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[12.5px] font-medium cursor-pointer transition-colors duration-100 ${
													sortKey === opt.value
														? "bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] font-bold"
														: "text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)]"
												}`}
											>
												{opt.label}
												{sortKey === opt.value && <Check size={12} className="stroke-[3]" />}
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>

				{/* Category chips */}
				<div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
					{/* All Artisans chip — always present */}
					{(() => {
						const isActive = activeCategory === "all";
						return (
							<button
								key="all"
								type="button"
								onClick={() => setFilters({ activeCategory: "all" })}
								className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 border transition-all duration-150 cursor-pointer ${
									isActive
										? "bg-[var(--dashboard-orange)] border-[var(--dashboard-orange)] text-white shadow-sm shadow-blue-500/20 font-bold"
										: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)] hover:text-[var(--dashboard-text)]"
								}`}
							>
								<Sparkles size={12} />
								<span>All Artisans</span>
								<span className={`text-[9.5px] px-1.5 py-0.25 rounded-full font-bold ml-1 ${
									isActive ? "bg-white/20 text-white" : "bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)]"
								}`}>
									{getCategoryCount("all")}
								</span>
							</button>
						);
					})()}

					{/* Loading skeletons */}
					{categoriesLoading &&
						Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className="h-[34px] w-28 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] animate-pulse shrink-0"
							/>
						))}

					{/* Live category chips */}
					{!categoriesLoading &&
						categories.map((cat: Category) => {
							const CatIcon = getCategoryIcon(cat.icon);
							const isActive = activeCategory === cat.id;
							const count = getCategoryCount(cat.id);
							return (
								<button
									key={cat.id}
									type="button"
									onClick={() => setFilters({ activeCategory: cat.id })}
									className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 border transition-all duration-150 cursor-pointer ${
										isActive
											? "bg-[var(--dashboard-orange)] border-[var(--dashboard-orange)] text-white shadow-sm shadow-blue-500/20 font-bold"
											: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)] hover:text-[var(--dashboard-text)]"
									}`}
								>
									<CatIcon size={12} />
									<span>{cat.name}</span>
									<span className={`text-[9.5px] px-1.5 py-0.25 rounded-full font-bold ml-1 ${
										isActive ? "bg-white/20 text-white" : "bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)]"
									}`}>
										{count}
									</span>
								</button>
							);
						})}
				</div>

				{/* Advanced filters */}
				<AnimatePresence initial={false}>
					{filtersExpanded && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.22, ease: "easeInOut" }}
							className="overflow-hidden"
						>
							<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 shadow-xs mb-1 mt-1">
								{/* Availability */}
								<div className="space-y-2">
									<label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--dashboard-muted)]">Availability</label>
									<div className="flex flex-col gap-1.5">
										{AVAILABILITY_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												type="button"
												onClick={() => setFilters({ activeAvail: opt.value })}
												className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all cursor-pointer ${
													activeAvail === opt.value
														? "border-[var(--dashboard-text)] bg-[var(--dashboard-text)] text-white"
														: "border-[var(--dashboard-border)] hover:border-[var(--dashboard-text)]/30 text-[var(--dashboard-muted)]"
												}`}
											>
												<span>{opt.label}</span>
												{activeAvail === opt.value && <Check size={11} className="stroke-[3.5]" />}
											</button>
										))}
									</div>
								</div>

								{/* Min rating */}
								<div className="space-y-2">
									<label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--dashboard-muted)]">Minimum Rating</label>
									<div className="flex gap-1.5">
										{[0, 4.5, 4.8].map((stars) => (
											<button
												key={stars}
												type="button"
												onClick={() => setFilters({ minRating: stars })}
												className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
													minRating === stars
														? "border-amber-400 bg-amber-50 text-amber-700"
														: "border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-amber-300"
												}`}
											>
												{stars === 0 ? (
													"All"
												) : (
													<>
														<span>{stars}</span>
														<Star size={10} className="fill-amber-500 text-amber-500" />
													</>
												)}
											</button>
										))}
									</div>
								</div>

								{/* Verified + Reset */}
								<div className="space-y-4 flex flex-col justify-between">
									<div className="space-y-2">
										<label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--dashboard-muted)]">Verified Badge</label>
										<div className="flex items-center justify-between px-3 py-2 bg-[var(--dashboard-bg)]/50 rounded-xl border border-[var(--dashboard-border)]/50">
											<span className="text-[12.5px] font-bold text-[var(--dashboard-text)] flex items-center gap-1.5">
												<ShieldCheck size={14} className="text-[var(--dashboard-orange)]" />
												Verified Only
											</span>
											<button
												type="button"
												onClick={() => setFilters({ verifiedOnly: !verifiedOnly })}
												className={`w-9 h-5 rounded-full relative p-0.5 transition-colors cursor-pointer ${
													verifiedOnly ? "bg-[var(--dashboard-orange)]" : "bg-[var(--dashboard-border)]"
												}`}
												aria-label="Toggle Verified Only"
											>
												<motion.div
													layout
													className="w-4 h-4 rounded-full bg-white shadow-sm"
													animate={{ x: verifiedOnly ? 16 : 0 }}
													transition={{ type: "spring", stiffness: 400, damping: 25 }}
												/>
											</button>
										</div>
									</div>

									{hasActiveFilters && (
										<button
											type="button"
											onClick={clearAllFilters}
											className="w-full py-2 rounded-lg border border-[var(--dashboard-border)] text-[12px] font-bold text-[var(--dashboard-muted)] hover:bg-[var(--dashboard-orange-light)] hover:text-[var(--dashboard-orange)] hover:border-[var(--dashboard-orange-mid)] transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
										>
											<X size={12} className="stroke-[3.5]" />
											Reset Filters
										</button>
									)}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* ── Grid ───────────────────────────────────────────────── */}
			<div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 pb-24 md:pb-8 scrollbar-none">
				{/* Loading skeleton */}
				{isLoading && (
					<div className={gridClass}>
						{Array.from({ length: 8 }).map((_, i) => (
							<div
								key={i}
								className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 flex flex-col gap-4 animate-pulse h-[260px]"
							>
								<div className="flex gap-3">
									<div className="w-12 h-12 rounded-xl bg-neutral-100 shrink-0" />
									<div className="flex flex-col gap-2 flex-1 pt-1">
										<div className="h-3.5 bg-neutral-100 rounded w-3/4" />
										<div className="h-3 bg-neutral-100 rounded w-1/2" />
									</div>
								</div>
								<div className="h-16 bg-neutral-100 rounded-xl" />
								<div className="flex gap-1.5">
									<div className="h-6 bg-neutral-100 rounded-full w-16" />
									<div className="h-6 bg-neutral-100 rounded-full w-20" />
								</div>
								<div className="flex gap-2 mt-auto">
									<div className="flex-1 h-9 bg-neutral-100 rounded-xl" />
									<div className="flex-1 h-9 bg-neutral-100 rounded-xl" />
								</div>
							</div>
						))}
					</div>
				)}

				{/* Empty state */}
				{!isLoading && results.length === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-8"
					>
						<div className="w-16 h-16 rounded-2xl bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)] flex items-center justify-center shadow-xs">
							<Search size={24} className="text-[var(--dashboard-muted)]" />
						</div>
						<div>
							<p className="font-syne font-extrabold text-[16px] text-[var(--dashboard-text)] mb-1">No artisans match your criteria</p>
							<p className="text-[12px] text-[var(--dashboard-muted)]">Try adjusting your filters or clearing search text.</p>
						</div>
						<button
							type="button"
							onClick={clearAllFilters}
							className="px-5 py-2.5 rounded-xl text-[12.5px] font-bold bg-[var(--dashboard-orange)] text-white cursor-pointer hover:bg-blue-600 active:scale-95 transition-all"
						>
							Clear All Filters
						</button>
					</motion.div>
				)}

				{/* Results grid */}
				{!isLoading && results.length > 0 && (
					<motion.div
						key={`${activeCategory}-${activeAvail}-${sortKey}-${minRating}-${verifiedOnly}`}
						variants={container}
						initial="hidden"
						animate="show"
						className={gridClass}
					>
						{results.map((provider) => (
							<ProviderListCard
								key={provider.id}
								provider={provider}
								isHired={!!hiredIds[provider.id]}
								onViewProfile={() => setSelectedProviderId(provider.id)}
								onHire={handleHire}
							/>
						))}
					</motion.div>
				)}

				{!isLoading && results.length > 0 && (
					<div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-[var(--dashboard-muted)]">
						<Sparkles size={11} className="text-[var(--dashboard-purple)] shrink-0" />
						<span>Results prioritized by AI matching · Handhub</span>
					</div>
				)}
			</div>

			<ProviderProfileModal
				providerId={selectedProviderId}
				isHired={!!selectedProviderId && !!hiredIds[selectedProviderId]}
				onClose={() => setSelectedProviderId(null)}
				onHire={(id) => { handleHire(id); setSelectedProviderId(null); }}
				onMessage={() => { if (selectedProviderId) openChatWith(selectedProviderId); setSelectedProviderId(null); }}
			/>
		</main>
	);
}
