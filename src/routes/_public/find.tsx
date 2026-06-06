import { createFileRoute } from '@tanstack/react-router'
import {
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
import { useMemo, useState } from "react";
import { ArtisanCard } from "#/components/find/artisan-card";
import { ArtisanModal } from "#/components/find/artisan-modal";
import { HHButton } from "#/components/hh/button";
import { O } from "#/components/hh/primitives";
import { cn } from "#/lib/utils";
import type { Artisan } from "#/types/artisan";
import { ARTISANS } from "#/types/artisan";

export const Route = createFileRoute("/_public/find")({ component: FindPage });

// ─── Types & constants ────────────────────────────────────────────────────────

interface Filters {
	trades: Record<string, boolean>;
	avail: Record<string, boolean>;
	minRating: number;
	minRate: number;
	maxRate: number;
	districts: Record<string, boolean>;
}

const DEFAULT_FILTERS: Filters = {
	trades: {},
	avail: {},
	minRating: 0,
	minRate: 3000,
	maxRate: 20000,
	districts: {},
};

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu"];
const SORT_OPTIONS = [
	"Best match",
	"Highest rated",
	"Nearest first",
	"Lowest rate",
	"Most reviews",
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

const TRADE_OPTS = [
	{ label: "Electrician", count: 14 },
	{ label: "Plumber", count: 11 },
	{ label: "Carpenter", count: 9 },
	{ label: "AC Technician", count: 7 },
	{ label: "Painter", count: 6 },
	{ label: "Tiler", count: 5 },
	{ label: "Welder", count: 4 },
	{ label: "Generator tech", count: 4 },
];
const AVAIL_OPTS = [
	{ key: "now", label: "Available now", count: 28 },
	{ key: "sched", label: "Scheduled only", count: 32 },
	{ key: "emergency", label: "Emergency", count: 12 },
];
const DISTRICT_OPTS = [
	{ label: "Ikeja", count: 18 },
	{ label: "Lekki", count: 14 },
	{ label: "Surulere", count: 9 },
	{ label: "Yaba", count: 8 },
	{ label: "VI", count: 7 },
];
const RATING_OPTS = [
	{ value: 0, label: "Any" },
	{ value: 4, label: "4+" },
	{ value: 4.5, label: "4.5+" },
	{ value: 5, label: "5.0" },
];
const TOTAL_PAGES = 8;

// ─── Reused in filter loops ───────────────────────────────────────────────────

function CheckOpt({
	id,
	label,
	count,
	checked,
	onChange,
}: {
	id: string;
	label: string;
	count: number;
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
			<span className="text-[11px]" style={{ color: "var(--hh-txt3)" }}>
				{count}
			</span>
		</label>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function FindPage() {
	const [query, setQuery] = useState("");
	const [city, setCity] = useState("Lagos");
	const [sortBy, setSortBy] = useState("Best match");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [page, setPage] = useState(1);
	const [activeArtisan, setActiveArtisan] = useState<Artisan | null>(null);
	const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

	const filtered = useMemo(() => {
		let r = [...ARTISANS];
		const q = query.toLowerCase().trim();
		if (q)
			r = r.filter(
				(a) =>
					a.name.toLowerCase().includes(q) ||
					a.role.toLowerCase().includes(q) ||
					a.tags.some((t) => t.toLowerCase().includes(q)) ||
					a.loc.toLowerCase().includes(q),
			);

		const trades = Object.entries(filters.trades)
			.filter(([, v]) => v)
			.map(([k]) => k);
		if (trades.length)
			r = r.filter((a) =>
				trades.some((t) => a.role.toLowerCase().includes(t.toLowerCase())),
			);

		const avails = Object.entries(filters.avail)
			.filter(([, v]) => v)
			.map(([k]) => k);
		if (avails.length) r = r.filter((a) => avails.includes(a.avail));

		if (filters.minRating > 0)
			r = r.filter((a) => a.rating >= filters.minRating);
		r = r.filter((a) => a.rate >= filters.minRate && a.rate <= filters.maxRate);

		const districts = Object.entries(filters.districts)
			.filter(([, v]) => v)
			.map(([k]) => k);
		if (districts.length)
			r = r.filter((a) => districts.some((d) => a.loc.includes(d)));

		if (sortBy === "Highest rated") r.sort((a, b) => b.rating - a.rating);
		if (sortBy === "Nearest first")
			r.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
		if (sortBy === "Lowest rate") r.sort((a, b) => a.rate - b.rate);
		if (sortBy === "Most reviews") r.sort((a, b) => b.jobs - a.jobs);
		return r;
	}, [query, filters, sortBy]);

	function set<K extends keyof Filters>(key: K, val: Filters[K]) {
		setFilters((f) => ({ ...f, [key]: val }));
	}

	const divider = (
		<div className="my-5 h-px" style={{ background: "var(--hh-border)" }} />
	);

	return (
		<>
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
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && setQuery(query)}
								placeholder='Try "Emergency plumber in Ikeja" or "Carpenter Abuja"…'
								className="hh-search-input flex-1 bg-transparent border-none outline-none text-[14px] py-[13px]"
								style={{ color: "var(--hh-txt)", fontFamily: "var(--font-dm)" }}
							/>
						</div>
						<label className="sr-only" htmlFor="city-sel">
							Select city
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
								id="city-sel"
								value={city}
								onChange={(e) => setCity(e.target.value)}
								className="hh-select flex-1 py-[13px] text-[13.5px]"
								style={{ color: "var(--hh-txt2)" }}
							>
								{CITIES.map((c) => (
									<option key={c}>{c}</option>
								))}
							</select>
						</div>
						<HHButton size="lg" className="min-h-12 w-full sm:w-auto">
							<Search size={17} aria-hidden /> Search
						</HHButton>
					</div>
					<div className="flex items-center gap-2 mt-3.5 overflow-x-auto whitespace-nowrap pb-2 sm:pb-0 sm:flex-wrap scrollbar-none">
						<span className="text-[11.5px] shrink-0" style={{ color: "var(--hh-txt3)" }}>
							Quick search:
						</span>
						<div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 scrollbar-none">
							{QUICK_PILLS.map(({ Icon, label }) => (
								<button
									key={label}
									type="button"
									onClick={() => setQuery(label)}
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
				<div className="flex flex-col md:flex-row relative" style={{ minHeight: "calc(100dvh - 220px)" }}>
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
							mobileFiltersOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
						)}
						style={{
							background: "var(--hh-bg2)",
							borderColor: "var(--hh-border)",
						}}
					>
						{/* Header for mobile filters drawer */}
						<div className="flex items-center justify-between mb-4 md:hidden pb-3 border-b border-[var(--hh-border)]">
							<span className="font-extrabold text-[12px] text-[var(--hh-txt)] uppercase tracking-wide">Filters</span>
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
								{TRADE_OPTS.map((o) => (
									<CheckOpt
										key={o.label}
										id={`t-${o.label}`}
										label={o.label}
										count={o.count}
										checked={!!filters.trades[o.label]}
										onChange={(v) =>
											set("trades", { ...filters.trades, [o.label]: v })
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
										count={o.count}
										checked={!!filters.avail[o.key]}
										onChange={(v) => set("avail", { ...filters.avail, [o.key]: v })}
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
													filters.minRating === r.value
														? "rgba(59,130,246,0.1)"
														: "transparent",
												borderColor:
													filters.minRating === r.value
														? "rgba(59,130,246,0.35)"
														: "var(--hh-border2)",
												color:
													filters.minRating === r.value
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
									{(["minRate", "maxRate"] as const).map((k, i) => (
										<input
											key={k}
											type="number"
											value={filters[k]}
											onChange={(e) => set(k, Number(e.target.value))}
											placeholder={i === 0 ? "Min" : "Max"}
											className="hh-num rounded-[8px] border px-2.5 py-[7px] text-[12.5px] w-20 outline-none focus:border-[rgba(59,130,246,0.4)] transition-colors duration-150"
											style={{
												background: "var(--hh-card)",
												borderColor: "var(--hh-border2)",
												color: "var(--hh-txt)",
												fontFamily: "var(--font-dm)",
											}}
										/>
									))}
									<span className="text-[12px]" style={{ color: "var(--hh-txt3)" }}>
										—
									</span>
								</div>
							</div>

							{divider}

							<div>
								<p
									className="text-[11px] uppercase tracking-[0.8px] font-medium mb-3"
									style={{ color: "var(--hh-txt3)" }}
								>
									District
								</p>
								{DISTRICT_OPTS.map((o) => (
									<CheckOpt
										key={o.label}
										id={`d-${o.label}`}
										label={o.label}
										count={o.count}
										checked={!!filters.districts[o.label]}
										onChange={(v) =>
											set("districts", { ...filters.districts, [o.label]: v })
										}
									/>
								))}
							</div>
						</div>

						{/* Footer Actions */}
						<div className="pt-3 border-t border-[var(--hh-border)] flex flex-col gap-2 mt-4 shrink-0">
							<HHButton
								onClick={() => {
									setFilters(DEFAULT_FILTERS);
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
									<Lock size={20} style={{ color: "var(--hh-or)" }} aria-hidden />
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
								<HHButton size="sm" pill>
									Sign up free
								</HHButton>
								<HHButton variant="ghost" size="sm" pill>
									Sign in
								</HHButton>
							</div>
						</div>

						{/* Sort / view controls */}
						<div className="flex items-center justify-between flex-wrap gap-3 mb-4">
							<p className="text-[13.5px]" style={{ color: "var(--hh-txt2)" }}>
								<strong style={{ color: "var(--hh-txt)", fontWeight: 500 }}>
									{filtered.length} artisans
								</strong>{" "}
								found in {city}
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
										value={sortBy}
										onChange={(e) => setSortBy(e.target.value)}
										className="hh-select rounded-[8px] border px-2.5 py-1.5 text-[12.5px]"
										style={{
											background: "var(--hh-card)",
											borderColor: "var(--hh-border2)",
											color: "var(--hh-txt2)",
											fontFamily: "var(--font-dm)",
										}}
									>
										{SORT_OPTIONS.map((o) => (
											<option key={o}>{o}</option>
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
						{filtered.length === 0 ? (
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
								{filtered.map((a) => (
									<div key={a.id} role="listitem">
										<ArtisanCard artisan={a} onView={setActiveArtisan} />
									</div>
								))}
							</div>
						)}

						{/* Pagination */}
						<div
							className="flex items-center justify-center gap-1.5 mt-7"
							aria-label="Pagination"
						>
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
								aria-label="Previous page"
								className={cn(
									"flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[8px] border text-[16px] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed",
								)}
								style={{
									background: "transparent",
									borderColor: "var(--hh-border)",
									color: "var(--hh-txt2)",
								}}
							>
								<ChevronLeft size={16} aria-hidden />
							</button>
							{[1, 2, 3].map((p) => (
								<button
									key={p}
									type="button"
									onClick={() => setPage(p)}
									aria-current={page === p ? "page" : undefined}
									className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[8px] border text-[13px] transition-all duration-150"
									style={{
										background: page === p ? "var(--hh-or)" : "transparent",
										borderColor:
											page === p ? "var(--hh-or)" : "var(--hh-border)",
										color: page === p ? "#fff" : "var(--hh-txt2)",
										fontFamily: "var(--font-dm)",
									}}
								>
									{p}
								</button>
							))}
							<span
								className="px-1 text-[13px]"
								style={{ color: "var(--hh-txt3)" }}
							>
								…
							</span>
							<button
								type="button"
								onClick={() => setPage(TOTAL_PAGES)}
								className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[8px] border text-[13px] transition-all duration-150"
								style={{
									background: "transparent",
									borderColor: "var(--hh-border)",
									color: "var(--hh-txt2)",
									fontFamily: "var(--font-dm)",
								}}
							>
								{TOTAL_PAGES}
							</button>
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
								disabled={page === TOTAL_PAGES}
								aria-label="Next page"
								className={cn(
									"flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[8px] border text-[16px] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed",
								)}
								style={{
									background: "transparent",
									borderColor: "var(--hh-border)",
									color: "var(--hh-txt2)",
								}}
							>
								<ChevronRight size={16} aria-hidden />
							</button>
						</div>
					</div>
				</div>
			</div>

			<ArtisanModal
				artisan={activeArtisan}
				onClose={() => setActiveArtisan(null)}
			/>
		</>
	);
}
