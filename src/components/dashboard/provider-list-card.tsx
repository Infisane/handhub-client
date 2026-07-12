import { motion } from "framer-motion";
import { Check, MapPin, Star, Zap } from "lucide-react";
import type { AiSearchProvider } from "#/core/types/artisan.types";

export { type AiSearchProvider };

export const providerCardItemVariants = {
	hidden: { opacity: 0, y: 12 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: "spring" as const, stiffness: 130, damping: 18 },
	},
};

export interface ProviderListCardProps {
	provider: AiSearchProvider;
	isHired: boolean;
	onViewProfile: () => void;
	onHire: (id: string) => void;
}

type AvailBadge = "now" | "scheduled";

const availabilityConfig: Record<AvailBadge, { label: string; classes: string; dot: string }> = {
	now: {
		label: "Available now",
		classes:
			"bg-green-50 text-green-700 border-green-200/60 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
		dot: "bg-green-500 animate-pulse",
	},
	scheduled: {
		label: "Scheduled",
		classes:
			"bg-amber-50 text-amber-800 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
		dot: "bg-amber-500",
	},
};

const AVATAR_PALETTES = [
	"bg-[#DBEAFE] text-[#1D4ED8]",
	"bg-[#E0F2FE] text-[#0369A1]",
	"bg-[#FDF4E3] text-[#B7791F]",
	"bg-[#E2FBF0] text-[#0F766E]",
	"bg-[#F3E8FF] text-[#7C3AED]",
	"bg-[#FCE7F3] text-[#BE185D]",
];

function getAvatarColor(id: string) {
	const idx = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
	return AVATAR_PALETTES[idx % AVATAR_PALETTES.length];
}

function getInitials(name: string) {
	return name
		.split(" ")
		.slice(0, 2)
		.map((w) => w[0])
		.join("")
		.toUpperCase();
}

function renderStars(rating: number) {
	const stars = [];
	const floor = Math.floor(rating);
	for (let i = 0; i < 5; i++) {
		stars.push(
			<Star
				key={i}
				size={11}
				className={
					i < floor
						? "fill-amber-400 text-amber-400"
						: "text-neutral-300 dark:text-neutral-700"
				}
			/>,
		);
	}
	return <div className="flex items-center gap-0.5">{stars}</div>;
}

export function ProviderListCard({
	provider,
	isHired,
	onViewProfile,
	onHire,
}: ProviderListCardProps) {
	const name = provider.businessName ?? provider.title ?? "Provider";
	const trade = provider.services[0]?.name ?? "General Services";
	const location = provider.city ?? provider.state?.name ?? "";
	const rating = Number(provider.averageRating);
	const minCharge = Number(provider.minCharge ?? 0);
	const hourlyRate = Number(provider.hourlyRate ?? 0);
	const effectiveRate = minCharge > 0 ? minCharge : hourlyRate;
	const rateLabel = minCharge > 0
		? `₦${minCharge.toLocaleString()}`
		: `₦${hourlyRate.toLocaleString()}/hr`;
	const availKey: AvailBadge =
		Object.keys(provider.availability).length > 0 ? "scheduled" : "now";
	const avail = availabilityConfig[availKey];
	const avatarColor = getAvatarColor(provider.id);
	const skills = provider.services.map((s) => s.name);

	return (
		<motion.div
			variants={providerCardItemVariants}
			layout
			onClick={onViewProfile}
			className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[var(--dashboard-orange-mid)]/60 transition-all duration-300 cursor-pointer flex flex-col justify-between group h-full relative"
		>
			{/* Availability badge */}
			<div className="absolute top-4 right-4 z-10">
				<span
					className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs shadow-xs ${avail.classes}`}
				>
					<span className={`w-1.5 h-1.5 rounded-full ${avail.dot}`} />
					{avail.label}
				</span>
			</div>

			{/* Premium accent line */}
			{provider.isPremium && (
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
			)}

			{/* Main content */}
			<div className="p-5 flex-1 flex flex-col space-y-4">
				<div className="flex gap-3">
					{/* Avatar */}
					<div
						className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[13.5px] shrink-0 relative shadow-xs transition-transform duration-200 group-hover:scale-105 ${avatarColor}`}
					>
						{getInitials(name)}
						{provider.isVerified && (
							<div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-[var(--dashboard-orange)] border-2 border-white flex items-center justify-center shadow-xs">
								<Check size={8} className="text-white stroke-[4]" />
							</div>
						)}
					</div>

					{/* Name + trade */}
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-1 flex-wrap pr-16">
							<span className="font-syne font-extrabold text-[14px] text-[var(--dashboard-text)] truncate leading-snug group-hover:text-[var(--dashboard-orange)] transition-colors">
								{name}
							</span>
						</div>
						<div className="text-[11.5px] text-[var(--dashboard-muted)] font-bold truncate mt-0.5">
							{trade}
						</div>
					</div>
				</div>

				{/* Rating + location */}
				<div className="bg-[var(--dashboard-bg)]/60 rounded-xl p-3 flex flex-col gap-2 border border-[var(--dashboard-border)]/40">
					<div className="flex items-center justify-between text-[11.5px] gap-2 flex-wrap sm:flex-nowrap">
						<div className="flex items-center gap-1.5 shrink-0">
							{rating > 0 ? (
								<>
									{renderStars(rating)}
									<span className="font-extrabold text-[var(--dashboard-text)]">
										{rating.toFixed(1)}
									</span>
									<span className="text-[var(--dashboard-muted)]">
										({provider.reviewCount})
									</span>
								</>
							) : (
								<span className="text-[var(--dashboard-muted)]">No reviews yet</span>
							)}
						</div>
						{effectiveRate > 0 && (
							<span className="font-syne font-extrabold text-[13.5px] text-[var(--dashboard-text)] shrink-0">
								{rateLabel}
							</span>
						)}
					</div>

					{location && (
						<div className="flex items-center gap-2 text-[11px] text-[var(--dashboard-muted)]">
							<MapPin size={12} className="text-[var(--dashboard-orange)]" />
							<span className="truncate">{location}</span>
						</div>
					)}
				</div>

				{/* Skills chips */}
				{skills.length > 0 && (
					<div className="flex flex-wrap gap-1.5 pt-1">
						{skills.slice(0, 3).map((skill) => (
							<span
								key={skill}
								className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] border border-[var(--dashboard-border)]/50"
							>
								{skill}
							</span>
						))}
						{skills.length > 3 && (
							<span className="text-[10px] font-bold px-2 py-1 text-[var(--dashboard-muted)] bg-transparent">
								+{skills.length - 3} more
							</span>
						)}
					</div>
				)}
			</div>

			{/* CTA footer */}
			<div
				className="px-5 pb-5 pt-0 flex gap-2"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onViewProfile}
					className="flex-1 py-2.5 rounded-xl border border-[var(--dashboard-border)] text-[12px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-colors cursor-pointer text-center"
				>
					View Profile
				</button>
				<button
					type="button"
					onClick={() => !isHired && onHire(provider.id)}
					disabled={isHired}
					className={`flex-1 py-2.5 rounded-xl text-[12px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
						isHired
							? "bg-green-600 text-white cursor-default shadow-xs"
							: "bg-[var(--dashboard-text)] text-white hover:bg-[var(--dashboard-orange)] shadow-xs"
					}`}
				>
					{isHired ? (
						<>
							<Check size={12} className="stroke-[3.5]" /> Hired ✓
						</>
					) : effectiveRate > 0 ? (
						<>
							<Zap size={11} className="stroke-[2.5]" /> Hire · {rateLabel}
						</>
					) : (
						<>
							<Zap size={11} className="stroke-[2.5]" /> Hire Now
						</>
					)}
				</button>
			</div>
		</motion.div>
	);
}
