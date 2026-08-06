import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Check,
	ChevronLeft,
	ChevronRight,
	Droplets,
	Flame,
	Grid3X3,
	Hammer,
	LayoutGrid,
	List,
	Lock,
	MapPin,
	Paintbrush,
	Search,
	SlidersHorizontal,
	Sparkles,
	Star,
	Wind,
	X,
	Zap,
} from "lucide-react";
import {
	parseAsFloat,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
} from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { ProviderListCard } from "#/components/dashboard/provider-list-card";
import { ProviderProfileModal } from "#/components/dashboard/provider-profile-modal";
import { HHButton } from "#/components/hh/button";
import { O } from "#/components/hh/primitives";
import {
	useGetCategoriesQuery,
	useGetProvidersQuery,
} from "#/core/queries/artisan.q";
import { useGetLgasQuery, useGetStatesQuery } from "#/core/queries/location.q";
import type { AiSearchProvider, Category } from "#/core/types/artisan.types";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_public/find")({ component: FindPage });

// ─── Types & constants ────────────────────────────────────────────────────────

type SortKey = "best" | "rating" | "rate_asc" | "reviews";
const SORT_KEYS = ["best", "rating", "rate_asc", "reviews"] as const;
const API_SORT_MAP: Partial<Record<SortKey, string>> = {
	rating: "rating",
	rate_asc: "price_asc",
	reviews: "reviews",
};
const SORT_OPTIONS: { label: string; value: SortKey }[] = [
	{ label: "Best match", value: "best" },
	{ label: "Highest rated", value: "rating" },
	{ label: "Lowest rate", value: "rate_asc" },
	{ label: "Most reviews", value: "reviews" },
];

// No API param for availability — same known gap as the dashboard's Find
// Artisans page. Derived client-side from whether the provider has any
// scheduled availability slots set.
const AVAIL_OPTS = [
	{ key: "now", label: "Available now" },
	{ key: "scheduled", label: "Scheduled only" },
] as const;

function getAvailKey(p: AiSearchProvider): "now" | "scheduled" {
	return Object.keys(p.availability).length > 0 ? "scheduled" : "now";
}

const RATING_OPTS = [
	{ value: 0, label: "Any" },
	{ value: 4, label: "4+" },
	{ value: 4.5, label: "4.5+" },
	{ value: 5, label: "5.0" },
];

const QUICK_PILLS = [
	{ Icon: Zap, label: "Electrician" },
	{ Icon: Droplets, label: "Plumber" },
	{ Icon: Hammer, label: "Carpenter" },
	{ Icon: Wind, label: "AC repair" },
	{ Icon: Paintbrush, label: "Painter" },
	{ Icon: Grid3X3, label: "Tiler" },
	{ Icon: Flame, label: "Welder" },
];

const RESULTS_PER_PAGE = 12;

// ─── Reused in filter loops ───────────────────────────────────────────────────

/** True multi-select — used only for Availability, which is client-side only. */
function CheckOpt({
	id,
	label,
	checked,
	onChange,
}: {
	id: string;
	label: string;
	checked: boolean;
	onChange: (v: boolean) => void;
}) {
	return (
		<label
			htmlFor={id}
			className="flex items-center gap-2 cursor-pointer py-[5px]"
		>
			<input
				id={id}
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="hh-check w-[15px] h-[15px] shrink-0"
			/>
			<span className="flex-1 text-[13px]" style={{ color: "var(--hh-txt2)" }}>
				{label}
			</span>
		</label>
	);
}

/** Single-select row — used for Trade category and District, since the real
 *  API only accepts one categoryId/lgaId at a time (not a multi-select). */
function SelectOpt({
	id,
	label,
	active,
	onSelect,
}: {
	id: string;
	label: string;
	active: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			id={id}
			type="button"
			onClick={onSelect}
			className="w-full flex items-center gap-2 py-[5px] cursor-pointer text-left"
		>
			<span
				className="flex-1 text-[13px]"
				style={{
					color: active ? "var(--hh-or)" : "var(--hh-txt2)",
					fontWeight: active ? 600 : 400,
				}}
			>
				{label}
			</span>
			{active && (
				<Check size={13} style={{ color: "var(--hh-or)" }} aria-hidden />
			)}
		</button>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function FindPage() {
	const navigate = useNavigate();

	const [filters, setFilters] = useQueryStates({
		q: parseAsString.withDefault(""),
		categoryId: parseAsString.withDefault(""),
		avail: parseAsString.withDefault("all"),
		sortKey: parseAsStringLiteral(SORT_KEYS).withDefault("best"),
		minRating: parseAsFloat.withDefault(0),
		stateId: parseAsString.withDefault(""),
		lgaId: parseAsString.withDefault(""),
		minRate: parseAsFloat.withDefault(0),
		maxRate: parseAsFloat.withDefault(0),
	});
	const {
		q,
		categoryId,
		avail,
		sortKey,
		minRating,
		stateId,
		lgaId,
		minRate,
		maxRate,
	} = filters;

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [page, setPage] = useState(1);
	const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
		null,
	);
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

	const [debouncedQ, setDebouncedQ] = useState(q);
	useEffect(() => {
		const id = setTimeout(() => setDebouncedQ(q), 400);
		return () => clearTimeout(id);
	}, [q]);

	// Reset to page 1 whenever a filter changes, so we don't strand the user on
	// an offset that no longer has results.
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset-on-change trigger, values aren't read
	useEffect(() => {
		setPage(1);
	}, [
		debouncedQ,
		categoryId,
		avail,
		sortKey,
		minRating,
		stateId,
		lgaId,
		minRate,
		maxRate,
	]);

	const { data: categoriesData } = useGetCategoriesQuery();
	const categories: Category[] = categoriesData ?? [];

	const { data: states = [] } = useGetStatesQuery();
	const { data: lgas = [] } = useGetLgasQuery(stateId);
	const selectedStateName =
		states.find((s) => s.id === stateId)?.name ?? "Nigeria";

	const { data, isLoading } = useGetProvidersQuery({
		limit: RESULTS_PER_PAGE,
		offset: (page - 1) * RESULTS_PER_PAGE,
		...(debouncedQ.trim() && { q: debouncedQ.trim() }),
		...(categoryId && { categoryId }),
		...(stateId && { stateId }),
		...(lgaId && { lgaId }),
		...(minRating > 0 && { minRating }),
		...(minRate > 0 && { minRate }),
		...(maxRate > 0 && { maxRate }),
		...(API_SORT_MAP[sortKey] && { sortBy: API_SORT_MAP[sortKey] }),
	});
	const providers = data?.data ?? [];
	const results = useMemo(
		() =>
			avail === "all"
				? providers
				: providers.filter((p) => getAvailKey(p) === avail),
		[providers, avail],
	);
	const total = data?.meta.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / RESULTS_PER_PAGE));

	function set<K extends keyof typeof filters>(
		key: K,
		val: (typeof filters)[K],
	) {
		setFilters({ [key]: val });
	}

	const resetFilters = () =>
		setFilters({
			q: "",
			categoryId: "",
			avail: "all",
			sortKey: "best",
			minRating: 0,
			stateId: "",
			lgaId: "",
			minRate: 0,
			maxRate: 0,
		});

	const goToSignup = () => navigate({ to: "/signup" });

	const divider = (
		<div className="my-5 h-px" style={{ background: "var(--hh-border)" }} />
	);

	return (
		<div className="hh-dashboard">
			<div className="pt-15">
				{/* ── Search hero ──────────────────────────────────────────────── */}
				<div
					className="border-b px-[5%] py-8"
					style={{
						background: "var(--hh-bg2)",
						borderColor: "var(--hh-border)",
					}}
				>
					<div className="flex items-center gap-1.5 mb-2.5">
						<span
							className="inline-block w-4 h-0.5 rounded-sm"
							style={{ background: "var(--hh-or)" }}
							aria-hidden
						/>
						<span
							className="text-[11px] uppercase tracking-[1.2px] font-medium"
							style={{ color: "var(--hh-or)" }}
						>
							Browse artisans
						</span>
					</div>
					<h1
						className="font-extrabold tracking-[-1px] mb-5"
						style={{
							fontFamily: "var(--font-syne)",
							fontSize: "clamp(22px,3.5vw,36px)",
							color: "var(--hh-txt)",
						}}
					>
						Find skilled hands <O>near you</O>
					</h1>
					<div className="flex flex-col sm:flex-row gap-3">
						<label className="sr-only" htmlFor="hero-search">
							Search for artisans
						</label>
						<div
							className="flex flex-1 items-center gap-2.5 rounded-[12px] border px-4 transition-colors duration-150 focus-within:border-[rgba(59,130,246,0.5)] w-full"
							style={{
								background: "var(--hh-card)",
								borderColor: "var(--hh-border2)",
							}}
						>
							<Sparkles
								size={17}
								style={{ color: "var(--hh-or)" }}
								aria-hidden
							/>
							<input
								id="hero-search"
								type="text"
								value={q}
								onChange={(e) => set("q", e.target.value)}
								placeholder='Try "Emergency plumber in Ikeja" or "Carpenter Abuja"…'
								className="hh-search-input flex-1 bg-transparent border-none outline-none text-[14px] py-[13px]"
								style={{ color: "var(--hh-txt)", fontFamily: "var(--font-dm)" }}
							/>
						</div>
						<label className="sr-only" htmlFor="state-sel">
							Select state
						</label>
						<div
							className="flex items-center gap-2 rounded-[12px] border px-3.5 w-full sm:w-[180px] shrink-0 focus-within:border-[rgba(59,130,246,0.5)] transition-colors duration-150"
							style={{
								background: "var(--hh-card)",
								borderColor: "var(--hh-border2)",
							}}
						>
							<MapPin
								size={16}
								style={{ color: "var(--hh-txt3)" }}
								aria-hidden
							/>
							<select
								id="state-sel"
								value={stateId}
								onChange={(e) => {
									set("stateId", e.target.value);
									set("lgaId", "");
								}}
								className="hh-select flex-1 py-[13px] text-[13.5px]"
								style={{ color: "var(--hh-txt2)" }}
							>
								<option value="">All Nigeria</option>
								{states.map((s) => (
									<option key={s.id} value={s.id}>
										{s.name}
									</option>
								))}
							</select>
						</div>
						<HHButton size="lg" className="min-h-12 w-full sm:w-auto">
							<Search size={17} aria-hidden /> Search
						</HHButton>
					</div>
					<div className="flex items-center gap-2 mt-3.5 overflow-x-auto whitespace-nowrap pb-2 sm:pb-0 sm:flex-wrap scrollbar-none">
						<span
							className="text-[11.5px] shrink-0"
							style={{ color: "var(--hh-txt3)" }}
						>
							Quick search:
						</span>
						<div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 scrollbar-none">
							{QUICK_PILLS.map(({ Icon, label }) => (
								<button
									key={label}
									type="button"
									onClick={() => set("q", label)}
									className="hh-spill inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11.5px] cursor-pointer transition-all duration-150 shrink-0"
									style={{
										background: "rgba(255,255,255,0.05)",
										borderColor: "var(--hh-border2)",
										color: "var(--hh-txt2)",
									}}
								>
									<Icon size={12} aria-hidden /> {label}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* ── Page body ────────────────────────────────────────────────── */}
				<div
					className="flex flex-col md:flex-row relative"
					style={{ minHeight: "calc(100dvh - 220px)" }}
				>
					{/* Mobile Filters Drawer Overlay */}
					{mobileFiltersOpen && (
						<div
							className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
							onClick={() => setMobileFiltersOpen(false)}
						/>
					)}

					{/* ── Filters sidebar ────────────────────────────────────────── */}
					<aside
						className={cn(
							"fixed inset-y-0 left-0 w-[280px] max-w-[85vw] z-50 bg-[var(--hh-bg2)] border-r flex flex-col p-5 shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none md:z-auto md:w-[240px] md:h-auto md:shrink-0 md:bg-transparent md:border-r md:px-5 md:py-6 md:flex",
							mobileFiltersOpen
								? "translate-x-0"
								: "-translate-x-full md:translate-x-0",
						)}
						style={{
							background: "var(--hh-bg2)",
							borderColor: "var(--hh-border)",
						}}
					>
						{/* Header for mobile filters drawer */}
						<div className="flex items-center justify-between mb-4 md:hidden pb-3 border-b border-[var(--hh-border)]">
							<span className="font-extrabold text-[12px] text-[var(--hh-txt)] uppercase tracking-wide">
								Filters
							</span>
							<button
								type="button"
								onClick={() => setMobileFiltersOpen(false)}
								className="p-1 rounded-lg border border-[var(--hh-border)] text-[var(--hh-txt2)] hover:bg-[var(--hh-bg3)] cursor-pointer"
								aria-label="Close filters"
							>
								<X size={15} />
							</button>
						</div>

						{/* Scrollable filters list */}
						<div className="flex-1 overflow-y-auto space-y-5 pr-1 -mr-1">
							<div>
								<p
									className="text-[11px] uppercase tracking-[0.8px] font-medium mb-3"
									style={{ color: "var(--hh-txt3)" }}
								>
									Trade category
								</p>
								<SelectOpt
									id="cat-all"
									label="All trades"
									active={!categoryId}
									onSelect={() => set("categoryId", "")}
								/>
								{categories.map((cat) => (
									<SelectOpt
										key={cat.id}
										id={`cat-${cat.id}`}
										label={cat.name}
										active={categoryId === cat.id}
										onSelect={() =>
											set("categoryId", categoryId === cat.id ? "" : cat.id)
										}
									/>
								))}
							</div>

							{divider}

							<div>
								<p
									className="text-[11px] uppercase tracking-[0.8px] font-medium mb-3"
									style={{ color: "var(--hh-txt3)" }}
								>
									Availability
								</p>
								{AVAIL_OPTS.map((o) => (
									<CheckOpt
										key={o.key}
										id={`a-${o.key}`}
										label={o.label}
										checked={avail === o.key}
										onChange={(checked) =>
											set("avail", checked ? o.key : "all")
										}
									/>
								))}
							</div>

							{divider}

							<div>
								<p
									className="text-[11px] uppercase tracking-[0.8px] font-medium mb-3"
									style={{ color: "var(--hh-txt3)" }}
								>
									Minimum rating
								</p>
								<div className="flex gap-1.5 flex-wrap mt-1">
									{RATING_OPTS.map((r) => (
										<button
											key={r.value}
											type="button"
											onClick={() => set("minRating", r.value)}
											className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] cursor-pointer transition-all duration-150"
											style={{
												background:
													minRating === r.value
														? "rgba(59,130,246,0.1)"
														: "transparent",
												borderColor:
													minRating === r.value
														? "rgba(59,130,246,0.35)"
														: "var(--hh-border2)",
												color:
													minRating === r.value
														? "var(--hh-or)"
														: "var(--hh-txt2)",
											}}
										>
											{r.value > 0 && (
												<Star
													size={12}
													fill="#F59E0B"
													style={{ color: "#F59E0B" }}
													aria-hidden
												/>
											)}
											{r.label}
										</button>
									))}
								</div>
							</div>

							{divider}

							<div>
								<p
									className="text-[11px] uppercase tracking-[0.8px] font-medium mb-3"
									style={{ color: "var(--hh-txt3)" }}
								>
									Rate range (₦/hr)
								</p>
								<div className="flex items-center gap-2 mt-1">
									<input
										type="number"
										value={minRate || ""}
										onChange={(e) =>
											set("minRate", Number(e.target.value) || 0)
										}
										placeholder="Min"
										className="hh-num rounded-[8px] border px-2.5 py-[7px] text-[12.5px] w-20 outline-none focus:border-[rgba(59,130,246,0.4)] transition-colors duration-150"
										style={{
											background: "var(--hh-card)",
											borderColor: "var(--hh-border2)",
											color: "var(--hh-txt)",
											fontFamily: "var(--font-dm)",
										}}
									/>
									<span
										className="text-[12px]"
										style={{ color: "var(--hh-txt3)" }}
									>
										—
									</span>
									<input
										type="number"
										value={maxRate || ""}
										onChange={(e) =>
											set("maxRate", Number(e.target.value) || 0)
										}
										placeholder="Max"
										className="hh-num rounded-[8px] border px-2.5 py-[7px] text-[12.5px] w-20 outline-none focus:border-[rgba(59,130,246,0.4)] transition-colors duration-150"
										style={{
											background: "var(--hh-card)",
											borderColor: "var(--hh-border2)",
											color: "var(--hh-txt)",
											fontFamily: "var(--font-dm)",
										}}
									/>
								</div>
							</div>

							{divider}

							<div>
								<p
									className="text-[11px] uppercase tracking-[0.8px] font-medium mb-3"
									style={{ color: "var(--hh-txt3)" }}
								>
									District {!stateId && "(pick a state first)"}
								</p>
								<SelectOpt
									id="lga-all"
									label="All districts"
									active={!lgaId}
									onSelect={() => set("lgaId", "")}
								/>
								{lgas.map((l) => (
									<SelectOpt
										key={l.id}
										id={`lga-${l.id}`}
										label={l.name}
										active={lgaId === l.id}
										onSelect={() => set("lgaId", lgaId === l.id ? "" : l.id)}
									/>
								))}
							</div>
						</div>

						{/* Footer Actions */}
						<div className="pt-3 border-t border-[var(--hh-border)] flex flex-col gap-2 mt-4 shrink-0">
							<HHButton
								onClick={() => {
									resetFilters();
									setMobileFiltersOpen(false);
								}}
								variant="ghost"
								className="w-full"
							>
								Reset filters
							</HHButton>
							<HHButton
								onClick={() => setMobileFiltersOpen(false)}
								className="w-full md:hidden"
							>
								Apply filters
							</HHButton>
						</div>
					</aside>

					{/* ── Results pane ───────────────────────────────────────────── */}
					<div className="flex-1 min-w-0 px-4 sm:px-6 py-5 overflow-y-auto">
						{/* Gate banner */}
						<div
							className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-[16px] border p-5 sm:px-6 sm:py-5 mb-5"
							style={{
								background: "var(--hh-bg2)",
								borderColor: "var(--hh-border2)",
							}}
						>
							<div className="flex gap-4 items-center">
								<div
									className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] border"
									style={{
										background: "rgba(59,130,246,0.1)",
										borderColor: "rgba(59,130,246,0.2)",
									}}
								>
									<Lock
										size={20}
										style={{ color: "var(--hh-or)" }}
										aria-hidden
									/>
								</div>
								<div className="flex-1">
									<p
										className="text-[13.5px] font-medium"
										style={{ color: "var(--hh-txt)" }}
									>
										Sign up free to contact any artisan directly
									</p>
									<p
										className="text-[12.5px]"
										style={{ color: "var(--hh-txt3)" }}
									>
										You're browsing as a guest. Create an account to book, chat,
										and pay safely.
									</p>
								</div>
							</div>
							<div className="flex gap-2 w-full sm:w-auto justify-end shrink-0 border-t border-[var(--hh-border)] sm:border-none pt-3 sm:pt-0 mt-1 sm:mt-0">
								<HHButton size="sm" pill onClick={goToSignup}>
									Sign up free
								</HHButton>
								<HHButton
									variant="ghost"
									size="sm"
									pill
									onClick={() => navigate({ to: "/signin" })}
								>
									Sign in
								</HHButton>
							</div>
						</div>

						{/* Sort / view controls */}
						<div className="flex items-center justify-between flex-wrap gap-3 mb-4">
							<p className="text-[13.5px]" style={{ color: "var(--hh-txt2)" }}>
								{isLoading ? (
									"Loading artisans…"
								) : (
									<>
										<strong style={{ color: "var(--hh-txt)", fontWeight: 500 }}>
											{total}
										</strong>{" "}
										artisans found in {selectedStateName}
									</>
								)}
							</p>
							<div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
								{/* Mobile Filters Toggle Button */}
								<button
									type="button"
									onClick={() => setMobileFiltersOpen(true)}
									className="md:hidden flex items-center gap-1.5 rounded-[8px] border px-3 py-1.5 text-[12.5px] cursor-pointer transition-colors hover:bg-[var(--hh-bg3)]"
									style={{
										background: "var(--hh-card)",
										borderColor: "var(--hh-border2)",
										color: "var(--hh-txt2)",
									}}
								>
									<SlidersHorizontal size={14} />
									<span>Filters</span>
								</button>

								<div className="flex items-center gap-2">
									<span
										className="text-[12.5px] hidden xs:inline"
										style={{ color: "var(--hh-txt3)" }}
									>
										Sort by
									</span>
									<label className="sr-only" htmlFor="sort-sel">
										Sort results
									</label>
									<select
										id="sort-sel"
										value={sortKey}
										onChange={(e) => set("sortKey", e.target.value as SortKey)}
										className="hh-select rounded-[8px] border px-2.5 py-1.5 text-[12.5px]"
										style={{
											background: "var(--hh-card)",
											borderColor: "var(--hh-border2)",
											color: "var(--hh-txt2)",
											fontFamily: "var(--font-dm)",
										}}
									>
										{SORT_OPTIONS.map((o) => (
											<option key={o.value} value={o.value}>
												{o.label}
											</option>
										))}
									</select>
									<div className="flex gap-1">
										{(["grid", "list"] as const).map((m) => (
											<button
												key={m}
												type="button"
												onClick={() => setViewMode(m)}
												aria-label={`${m} view`}
												aria-pressed={viewMode === m}
												className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[6px] border transition-all duration-150"
												style={{
													background:
														viewMode === m ? "var(--hh-card2)" : "transparent",
													borderColor:
														viewMode === m
															? "rgba(59,130,246,0.3)"
															: "var(--hh-border)",
													color:
														viewMode === m ? "var(--hh-or)" : "var(--hh-txt3)",
												}}
											>
												{m === "grid" ? (
													<LayoutGrid size={15} aria-hidden />
												) : (
													<List size={15} aria-hidden />
												)}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Results grid */}
						{isLoading ? (
							<div
								className="grid gap-3.5"
								style={{
									gridTemplateColumns:
										viewMode === "grid"
											? "repeat(auto-fill,minmax(220px,1fr))"
											: "1fr",
								}}
							>
								{["s1", "s2", "s3", "s4", "s5", "s6"].map((key) => (
									<div
										key={key}
										className="rounded-2xl border h-[260px] animate-pulse"
										style={{
											borderColor: "var(--hh-border2)",
											background: "var(--hh-card)",
										}}
									/>
								))}
							</div>
						) : results.length === 0 ? (
							<div className="py-16 text-center">
								<p className="text-[15px]" style={{ color: "var(--hh-txt3)" }}>
									No artisans match your filters.
								</p>
								<p
									className="text-[13px] mt-1"
									style={{ color: "var(--hh-txt3)" }}
								>
									Try adjusting your search or resetting filters.
								</p>
							</div>
						) : (
							<div
								className="grid gap-3.5"
								style={{
									gridTemplateColumns:
										viewMode === "grid"
											? "repeat(auto-fill,minmax(220px,1fr))"
											: "1fr",
								}}
								role="list"
								aria-label="Artisan results"
							>
								{results.map((provider) => (
									<div key={provider.id} role="listitem">
										<ProviderListCard
											provider={provider}
											isHired={false}
											onViewProfile={() => setSelectedProviderId(provider.id)}
											onHire={goToSignup}
										/>
									</div>
								))}
							</div>
						)}

						{/* Pagination */}
						{totalPages > 1 && (
							<div
								className="flex items-center justify-center gap-1.5 mt-7"
								aria-label="Pagination"
							>
								<button
									type="button"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
									aria-label="Previous page"
									className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[8px] border text-[16px] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
									style={{
										background: "transparent",
										borderColor: "var(--hh-border)",
										color: "var(--hh-txt2)",
									}}
								>
									<ChevronLeft size={16} aria-hidden />
								</button>
								{Array.from({ length: totalPages }, (_, i) => i + 1)
									.filter(
										(p) =>
											p === 1 || p === totalPages || Math.abs(p - page) <= 1,
									)
									.map((p, i, arr) => (
										<div key={p} className="flex items-center gap-1.5">
											{i > 0 && arr[i - 1] !== p - 1 && (
												<span
													className="px-1 text-[13px]"
													style={{ color: "var(--hh-txt3)" }}
												>
													…
												</span>
											)}
											<button
												type="button"
												onClick={() => setPage(p)}
												aria-current={page === p ? "page" : undefined}
												className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[8px] border text-[13px] transition-all duration-150"
												style={{
													background:
														page === p ? "var(--hh-or)" : "transparent",
													borderColor:
														page === p ? "var(--hh-or)" : "var(--hh-border)",
													color: page === p ? "#fff" : "var(--hh-txt2)",
													fontFamily: "var(--font-dm)",
												}}
											>
												{p}
											</button>
										</div>
									))}
								<button
									type="button"
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
									aria-label="Next page"
									className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[8px] border text-[16px] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
									style={{
										background: "transparent",
										borderColor: "var(--hh-border)",
										color: "var(--hh-txt2)",
									}}
								>
									<ChevronRight size={16} aria-hidden />
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			<ProviderProfileModal
				providerId={selectedProviderId}
				isHired={false}
				onClose={() => setSelectedProviderId(null)}
				onHire={goToSignup}
				onMessage={goToSignup}
			/>
		</div>
	);
}
