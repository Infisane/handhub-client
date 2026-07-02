import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { useGetRecommendationsQuery } from "#/core/queries/artisan.q";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";
import type { Recommendation } from "#/core/types/artisan.types";

const AVATAR_PALETTES = [
	"bg-[#DBEAFE] text-[#1D4ED8]",
	"bg-[#E0F2FE] text-[#0369A1]",
	"bg-[#FDF4E3] text-[#B7791F]",
	"bg-[#E2FBF0] text-[#0F766E]",
	"bg-[#F3E8FF] text-[#7C3AED]",
	"bg-[#FCE7F3] text-[#BE185D]",
];

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.08 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 15 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: "spring" as const, stiffness: 100, damping: 15 },
	},
};

function getInitials(name: string) {
	return name
		.split(" ")
		.slice(0, 2)
		.map((w) => w[0])
		.join("")
		.toUpperCase();
}

function getAvailability(availability: Record<string, string[]>) {
	return Object.keys(availability).length > 0
		? { label: "Available now", className: "bg-green-50 text-green-700 border-green-200/50" }
		: { label: "Sched. only", className: "bg-amber-50 text-amber-800 border-amber-200/50" };
}

export function RecommendedArtisans() {
	const dispatch = useAppDispatch();
	const [hiredArtisans, setHiredArtisans] = useState<Record<string, boolean>>({});

	const { latitude, longitude } = useAppSelector((s) => s.geolocationStore);
	const { data, isLoading } = useGetRecommendationsQuery({
		lat: latitude ?? undefined,
		lon: longitude ?? undefined,
		radius: 50,
	});
	const recommendations = data?.recommendations ?? [];

	const handleHireClick = (providerId: string) => {
		setHiredArtisans((prev) => ({ ...prev, [providerId]: true }));
		dispatch(set_dashboard_flags({ hasActiveChat: true }));
	};

	return (
		<section>
			<h3 className="font-syne font-bold text-sm text-[var(--dashboard-text)] mb-3.5 select-none">
				Recommended artisans near you
			</h3>
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="show"
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3.5"
			>
				{isLoading &&
					Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl p-4 flex flex-col gap-3 animate-pulse"
						>
							<div className="flex items-center gap-2.5">
								<div className="w-9 h-9 rounded-full bg-neutral-100 shrink-0" />
								<div className="flex flex-col gap-1.5 flex-1">
									<div className="h-3 bg-neutral-100 rounded w-3/4" />
									<div className="h-2.5 bg-neutral-100 rounded w-1/2" />
								</div>
							</div>
							<div className="h-2.5 bg-neutral-100 rounded w-full" />
							<div className="h-8 bg-neutral-100 rounded-xl mt-auto" />
						</div>
					))}

				{!isLoading && latitude === null && longitude === null && (
					<div className="col-span-full text-center py-6 text-[12px] text-[var(--dashboard-muted)] font-medium">
						Enable location access to see artisans near you
					</div>
				)}

				{!isLoading && recommendations.length === 0 && (latitude !== null || longitude !== null) && (
					<div className="col-span-full text-center py-6 text-[12px] text-[var(--dashboard-muted)] font-medium">
						No artisans found near you. Try expanding your area.
					</div>
				)}

				{!isLoading &&
					recommendations.map((rec: Recommendation, index: number) => {
						const { provider, reason } = rec;
						const isHired = hiredArtisans[provider.id];
						const name = provider.businessName ?? provider.title ?? "Provider";
						const trade = provider.services[0]?.name ?? "General Services";
						const rating = Number(provider.averageRating);
						const minCharge = Number(provider.minCharge);
						const avail = getAvailability(provider.availability);
						const avatarClass = AVATAR_PALETTES[index % AVATAR_PALETTES.length];

						return (
							<motion.div
								key={provider.id}
								variants={itemVariants}
								className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl p-4 flex flex-col justify-between hover:border-[var(--dashboard-blue-mid)] hover:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
							>
								<div>
									<div className="flex items-center gap-2.5 mb-3">
										<div className={`w-9.5 h-9.5 rounded-full flex items-center justify-center font-extrabold text-[12.5px] shrink-0 border border-white/10 shadow-sm relative group-hover:scale-105 transition-transform duration-300 ${avatarClass}`}>
											{getInitials(name)}
											<div className="absolute inset-0 rounded-full ring-2 ring-current opacity-10" />
										</div>
										<div className="min-w-0">
											<div className="text-[13.5px] font-extrabold text-[var(--dashboard-text)] truncate leading-snug">
												{name}
											</div>
											<div className="text-[11px] text-[var(--dashboard-muted)] truncate font-semibold">
												{trade}
											</div>
										</div>
									</div>

									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-1 text-[11px] text-[var(--dashboard-muted)] font-semibold">
											{rating > 0 && (
												<>
													<Star size={11} className="fill-amber-500 text-amber-500 stroke-[2.5]" />
													<span className="text-[var(--dashboard-text)] font-extrabold">{rating.toFixed(1)}</span>
													<span className="text-neutral-300 select-none">·</span>
												</>
											)}
											<span>{provider.reviewCount} jobs</span>
										</div>
										<span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${avail.className}`}>
											{avail.label}
										</span>
									</div>

									<p className="text-[10.5px] text-[var(--dashboard-purple)] font-semibold mb-3 truncate">
										{reason}
									</p>
								</div>

								<button
									type="button"
									onClick={() => !isHired && handleHireClick(provider.id)}
									disabled={isHired}
									className={`w-full py-2 px-3 rounded-xl text-[11px] font-extrabold font-dm cursor-pointer transition-all duration-300 hover:translate-y-[-1px] active:translate-y-0 ${
										isHired
											? "bg-green-600 text-white cursor-default shadow-sm shadow-green-500/10 hover:translate-y-0"
											: "bg-[var(--dashboard-blue)] text-white hover:bg-[var(--dashboard-blue-dark)] hover:shadow-sm hover:shadow-blue-500/20"
									}`}
								>
									{isHired ? (
										<span className="flex items-center justify-center gap-1 font-bold">
											<Check size={12} className="stroke-[3]" /> Requested
										</span>
									) : minCharge > 0
										? `Hire · ₦${minCharge.toLocaleString()}`
										: "Hire"}
								</button>
							</motion.div>
						);
					})}
			</motion.div>
		</section>
	);
}
