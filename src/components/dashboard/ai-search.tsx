import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { getCategoryIcon } from "#/core/helpers/category-icons.helper";
import { useRef, useState } from "react";
import { useAiSearchQuery, useGetCategoriesQuery } from "#/core/queries/artisan.q";
import { useAppSelector } from "#/core/hooks/useStore.hook";
import type { AiSearchParams, AiSearchProvider, Category } from "#/core/types/artisan.types";

const RADIUS_OPTIONS = [5, 10, 25, 50];

function ProviderCard({ provider }: { provider: AiSearchProvider }) {
	const name = provider.businessName ?? provider.title ?? "Provider";
	const location = [provider.ward?.name, provider.lga?.name].filter(Boolean).join(", ");
	const minCharge = Number(provider.minCharge);
	const rating = Number(provider.averageRating);

	return (
		<div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-purple-mid)]/20 hover:border-[var(--dashboard-purple-mid)]/50 transition-all cursor-pointer">
			<div className="w-9 h-9 rounded-full bg-[var(--dashboard-purple-light)] flex items-center justify-center shrink-0">
				<span className="text-[11px] font-extrabold text-[var(--dashboard-purple)]">
					{name.slice(0, 2).toUpperCase()}
				</span>
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<span className="text-[13px] font-bold text-[var(--dashboard-text)] truncate">
						{name}
					</span>
					{provider.isVerified && (
						<span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 rounded-full px-1.5 py-0.5 shrink-0">
							Verified
						</span>
					)}
				</div>
				<div className="flex gap-1 mt-1 flex-wrap">
					{provider.services.slice(0, 3).map((s) => (
						<span
							key={s.id}
							className="text-[10px] text-[var(--dashboard-purple)] bg-[var(--dashboard-purple-light)] rounded-full px-2 py-0.5 font-semibold"
						>
							{s.name}
						</span>
					))}
				</div>
				<div className="flex items-center gap-2 mt-1.5 flex-wrap">
					<span className="text-[10.5px] text-[var(--dashboard-muted)]">
						{location}
					</span>
					{minCharge > 0 && (
						<span className="text-[10.5px] font-bold text-[var(--dashboard-text)]">
							from ₦{minCharge.toLocaleString()}
						</span>
					)}
					{rating > 0 && (
						<span className="text-[10.5px] text-amber-500 font-bold">
							★ {rating.toFixed(1)}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export function AiSearch() {
	const [searchValue, setSearchValue] = useState("");
	const [radius, setRadius] = useState(25);
	const [submittedParams, setSubmittedParams] = useState<AiSearchParams | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const { latitude, longitude, status: geoStatus } = useAppSelector(
		(s) => s.geolocationStore,
	);
	const { data, isFetching } = useAiSearchQuery(submittedParams);
	const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery();

	const canSearch = searchValue.trim().length > 0 && latitude !== null && longitude !== null;

	const handleSubmit = () => {
		if (!canSearch) return;
		setSubmittedParams({
			q: searchValue.trim(),
			lat: latitude!,
			lon: longitude!,
			radius,
		});
	};

	const handlePillClick = (label: string) => {
		setSearchValue(label);
		if (latitude !== null && longitude !== null) {
			setSubmittedParams({ q: label, lat: latitude, lon: longitude, radius });
		}
		searchInputRef.current?.focus();
	};

	return (
		<section className="bg-[var(--dashboard-card)] border-2 border-[var(--dashboard-purple-mid)] rounded-xl p-4 shadow-xs relative focus-within:ring-4 focus-within:ring-[var(--dashboard-purple-mid)]/15 focus-within:border-[var(--dashboard-purple)] transition-all duration-200 shadow-blue-50/15">
			<div className="flex items-center gap-2.5">
				<Sparkles size={16} className="text-[var(--dashboard-purple)] shrink-0" />
				<input
					ref={searchInputRef}
					type="text"
					className="flex-1 border-none outline-none font-dm text-[13.5px] text-[var(--dashboard-text)] bg-transparent placeholder-[var(--dashboard-muted)]"
					placeholder='Try "Emergency plumber in Ikeja right now…"'
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
					aria-label="AI-powered artisan search"
				/>
				<button
					type="button"
					onClick={handleSubmit}
					disabled={!canSearch}
					className="w-7 h-7 rounded-full bg-[var(--dashboard-purple)] text-white flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-90 transition-opacity"
					aria-label="Search"
				>
					<ArrowRight size={13} strokeWidth={2.5} />
				</button>
				<div className="flex items-center gap-1 bg-[var(--dashboard-purple-light)] border border-[var(--dashboard-purple-mid)] rounded-full px-2.5 py-0.5 text-[10px] text-[var(--dashboard-purple)] font-bold shrink-0 select-none animate-pulse">
					<Zap size={9} className="stroke-[3]" /> AI Search
				</div>
			</div>

			{/* Location status notice */}
			{geoStatus !== "granted" && (
				<p className="text-[11px] text-amber-600 mt-2 font-medium">
					{geoStatus === "idle" || geoStatus === "loading"
						? "Getting your location…"
						: "Enable location access to search near you"}
				</p>
			)}

			{/* Quick Suggestion Pills */}
			<div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-none pb-0.5 flex-wrap">
				{categoriesLoading
					? Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className="h-[26px] w-24 rounded-full bg-[var(--dashboard-purple-light)] animate-pulse"
							/>
						))
					: categories?.map((cat: Category) => (
							<button
								key={cat.id}
								type="button"
								onClick={() => handlePillClick(cat.name)}
								className="flex items-center gap-1 bg-[var(--dashboard-purple-light)] border border-[var(--dashboard-purple-mid)]/20 rounded-full px-2.5 py-1 text-[11px] text-[var(--dashboard-purple)] cursor-pointer hover:bg-[var(--dashboard-purple)] hover:text-white hover:border-[var(--dashboard-purple)] hover:translate-y-[-1px] transition-all duration-200 whitespace-nowrap font-semibold"
							>
								{(() => { const Icon = getCategoryIcon(cat.icon); return <Icon size={11} />; })()}
								{cat.name}
							</button>
						))}
			</div>

			{/* Radius chips */}
			<div className="flex items-center gap-1.5 mt-2">
				<span className="text-[10.5px] text-[var(--dashboard-muted)] font-medium">
					Radius:
				</span>
				{RADIUS_OPTIONS.map((r) => (
					<button
						key={r}
						type="button"
						onClick={() => setRadius(r)}
						className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
							radius === r
								? "bg-[var(--dashboard-purple)] text-white border-[var(--dashboard-purple)]"
								: "bg-transparent text-[var(--dashboard-purple)] border-[var(--dashboard-purple-mid)]/40 hover:border-[var(--dashboard-purple)]"
						}`}
					>
						{r}km
					</button>
				))}
			</div>

			{/* Loading state */}
			{isFetching && (
				<div
					className="flex items-center gap-2 mt-4 p-2.5 bg-[var(--dashboard-purple-light)] rounded-xl border border-[var(--dashboard-purple-mid)]/20 animate-fade-in"
					role="status"
					aria-live="polite"
				>
					<div className="flex gap-1 shrink-0 pl-1">
						<span
							className="w-1.5 h-1.5 bg-[var(--dashboard-purple)] rounded-full animate-bounce"
							style={{ animationDelay: "0ms" }}
						/>
						<span
							className="w-1.5 h-1.5 bg-[var(--dashboard-purple)] rounded-full animate-bounce"
							style={{ animationDelay: "150ms" }}
						/>
						<span
							className="w-1.5 h-1.5 bg-[var(--dashboard-purple)] rounded-full animate-bounce"
							style={{ animationDelay: "300ms" }}
						/>
					</div>
					<span className="text-xs text-[var(--dashboard-purple)] font-bold">
						Finding best artisan matches in your area…
					</span>
				</div>
			)}

			{/* Results */}
			{!isFetching && data && data.data.length > 0 && (
				<div className="mt-3 flex flex-col gap-2">
					<p className="text-[10.5px] text-[var(--dashboard-muted)] font-semibold">
						{data.meta.total} match{data.meta.total !== 1 ? "es" : ""} found
					</p>
					{data.data.map((p: AiSearchProvider) => (
						<ProviderCard key={p.id} provider={p} />
					))}
				</div>
			)}

			{/* Empty state */}
			{!isFetching && data && data.data.length === 0 && submittedParams && (
				<p className="text-[12px] text-[var(--dashboard-muted)] mt-3 text-center py-2">
					No artisans found for "{submittedParams.q}" in this area. Try a wider radius.
				</p>
			)}
		</section>
	);
}
