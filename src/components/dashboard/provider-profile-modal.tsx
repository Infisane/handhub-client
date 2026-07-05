import {
	Check,
	Clock,
	MapPin,
	MessageSquare,
	Phone,
	Star,
	ThumbsUp,
	Zap,
} from "lucide-react";
import { Dialog, DialogContent } from "#/components/ui/dialog.tsx";
import { useGetProviderByIdQuery } from "#/core/queries/artisan.q";
import type { AiSearchProviderService, ProviderAvailabilitySlot, ProviderReview } from "#/core/types/artisan.types";

export interface ProviderProfileModalProps {
	providerId: string | null;
	isHired: boolean;
	onClose: () => void;
	onHire: (id: string) => void;
	onMessage: () => void;
}

function getCoverGradient(id: string) {
	const n = id.charCodeAt(0) % 7;
	const gradients = [
		"from-blue-500/20 via-blue-500/5 to-transparent",
		"from-sky-500/20 via-sky-500/5 to-transparent",
		"from-amber-500/20 via-amber-500/5 to-transparent",
		"from-teal-500/20 via-teal-500/5 to-transparent",
		"from-violet-500/20 via-violet-500/5 to-transparent",
		"from-pink-500/20 via-pink-500/5 to-transparent",
		"from-emerald-500/20 via-emerald-500/5 to-transparent",
	];
	return gradients[n];
}

function getInitials(name: string) {
	return name
		.split(" ")
		.slice(0, 2)
		.map((w) => w[0])
		.join("")
		.toUpperCase();
}

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

function renderStars(rating: number) {
	const floor = Math.floor(rating);
	return (
		<div className="flex items-center gap-0.5">
			{Array.from({ length: 5 }).map((_, i) => (
				<Star
					key={i}
					size={11}
					className={
						i < floor
							? "fill-amber-400 text-amber-400"
							: "text-neutral-300 dark:text-neutral-700"
					}
				/>
			))}
		</div>
	);
}

function formatDate(iso: string) {
	const d = new Date(iso);
	const now = Date.now();
	const diff = now - d.getTime();
	const days = Math.floor(diff / 86400000);
	if (days === 0) return "Today";
	if (days === 1) return "Yesterday";
	if (days < 7) return `${days} days ago`;
	if (days < 30) return `${Math.floor(days / 7)} wk ago`;
	return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function ModalSkeleton() {
	return (
		<div className="animate-pulse">
			<div className="h-36 sm:h-44 w-full bg-neutral-100 dark:bg-neutral-800" />
			<div className="px-6 sm:px-8 pb-4 relative">
				<div className="size-22 sm:size-24 rounded-2xl bg-neutral-200 dark:bg-neutral-700 absolute -top-11 sm:-top-12 left-6 sm:left-8 border-4 border-[var(--dashboard-card)]" />
				<div className="pt-13 sm:pt-14 space-y-2.5">
					<div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-48" />
					<div className="h-3.5 bg-neutral-100 dark:bg-neutral-800 rounded w-32" />
				</div>
			</div>
			<div className="px-6 sm:px-8 space-y-4 pb-24">
				<div className="grid grid-cols-4 gap-2.5">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="h-14 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
					))}
				</div>
				<div className="space-y-2">
					<div className="h-3 bg-neutral-100 rounded w-24" />
					<div className="h-3 bg-neutral-100 rounded w-full" />
					<div className="h-3 bg-neutral-100 rounded w-4/5" />
				</div>
			</div>
		</div>
	);
}

export function ProviderProfileModal({
	providerId,
	isHired,
	onClose,
	onHire,
	onMessage,
}: ProviderProfileModalProps) {
	const { data: provider, isLoading } = useGetProviderByIdQuery(providerId);

	const name = provider
		? (provider.businessName ?? provider.title ?? "Provider")
		: "";
	const avatarColor = providerId ? getAvatarColor(providerId) : AVATAR_PALETTES[0];
	const minCharge = Number(provider?.minCharge ?? 0);
	const hourlyRate = Number(provider?.hourlyRate ?? 0);
	const effectiveRate = minCharge > 0 ? minCharge : hourlyRate;
	const rateLabel = minCharge > 0
		? `₦${minCharge.toLocaleString()}`
		: `₦${hourlyRate.toLocaleString()}/hr`;

	const availDays = provider
		? (Object.entries(provider.availability) as [string, ProviderAvailabilitySlot][])
		: [];

	return (
		<Dialog open={!!providerId} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="p-0 max-w-2xl sm:rounded-2xl border-none">
				{isLoading && <ModalSkeleton />}

				{!isLoading && provider && (
					<div className="relative">
						{/* Hero gradient */}
						<div
							className={`h-36 sm:h-44 w-full bg-gradient-to-r ${getCoverGradient(provider.id)} relative`}
						/>

						{/* Profile header */}
						<div className="px-6 sm:px-8 pb-4 relative">
							<div
								className={`size-22 sm:size-24 rounded-2xl flex items-center justify-center font-black text-2xl border-4 border-[var(--dashboard-card)] shadow-md absolute -top-11 sm:-top-12 left-6 sm:left-8 ${avatarColor}`}
							>
								{getInitials(name)}
								{provider.isVerified && (
									<div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--dashboard-orange)] border-2 border-white flex items-center justify-center shadow-xs">
										<Check size={9} className="text-white stroke-[4]" />
									</div>
								)}
							</div>

							<div className="pt-13 sm:pt-14 space-y-1.5">
								<div className="flex items-center gap-2 flex-wrap">
									<h2 className="font-syne font-extrabold text-[20px] sm:text-[23px] text-[var(--dashboard-text)] leading-none tracking-tight">
										{name}
									</h2>
									{provider.isPremium && (
										<span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 flex items-center gap-0.5">
											<Star size={9} className="fill-amber-500 text-amber-500" /> PREMIUM
										</span>
									)}
								</div>
								<div className="text-[12.5px] text-[var(--dashboard-muted)] font-bold">
									{provider.services[0]?.name ?? "General Services"}
								</div>
								<div className="flex items-center gap-3 text-[11px] text-[var(--dashboard-muted)] pt-0.5 flex-wrap">
									{(provider.city ?? provider.state?.name) && (
										<span className="flex items-center gap-1">
											<MapPin size={12} className="text-[var(--dashboard-orange)]" />
											{provider.city ?? provider.state?.name}
										</span>
									)}
									{effectiveRate > 0 && (
										<>
											<span>·</span>
											<span className="text-[var(--dashboard-text)] font-extrabold">
												{rateLabel}
											</span>
										</>
									)}
								</div>
							</div>
						</div>

						{/* Scrollable body */}
						<div className="max-h-[calc(80vh-270px)] sm:max-h-[50vh] overflow-y-auto px-6 sm:px-8 pb-22 space-y-5 scrollbar-none">
							{/* Stats */}
							<div className="grid grid-cols-4 gap-2.5 pt-1">
								{[
									{ value: provider.reviewCount, label: "Jobs" },
									{ value: Number(provider.averageRating).toFixed(1), label: "Rating" },
									{ value: `${provider.yearsExperience} yrs`, label: "Exp." },
									{ value: provider.isVerified ? "Yes" : "No", label: "Verified" },
								].map(({ value, label }) => (
									<div
										key={label}
										className="bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)]/50 rounded-xl p-2.5 text-center flex flex-col justify-center"
									>
										<div className="font-syne font-extrabold text-[15px] sm:text-[17px] text-[var(--dashboard-text)]">
											{value}
										</div>
										<div className="text-[9px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider mt-0.5">
											{label}
										</div>
									</div>
								))}
							</div>

							{/* Bio */}
							{provider.bio && (
								<div className="space-y-1.5">
									<h4 className="font-syne font-extrabold text-[12.5px] uppercase tracking-wider text-[var(--dashboard-text)]">
										Biography
									</h4>
									<p className="text-[12.5px] text-[var(--dashboard-muted)] leading-relaxed font-medium">
										{provider.bio}
									</p>
								</div>
							)}

							{/* Services */}
							{provider.services.length > 0 && (
								<div className="space-y-2">
									<h4 className="font-syne font-extrabold text-[12.5px] uppercase tracking-wider text-[var(--dashboard-text)]">
										Services
									</h4>
									<div className="flex flex-wrap gap-1.5">
										{provider.services.map((s: AiSearchProviderService) => (
											<span
												key={s.id}
												className="text-[10.5px] font-bold px-3 py-1.5 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[var(--dashboard-text)] shadow-xs"
											>
												{s.name}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Availability schedule */}
							{availDays.length > 0 && (
								<div className="space-y-2">
									<h4 className="font-syne font-extrabold text-[12.5px] uppercase tracking-wider text-[var(--dashboard-text)]">
										Schedule
									</h4>
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
										{availDays.map(([day, slot]) => (
											<div
												key={day}
												className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[var(--dashboard-bg)]/60 border border-[var(--dashboard-border)]/40 text-[11px]"
											>
												<span className="font-bold text-[var(--dashboard-text)] capitalize">{day}</span>
												<span className="text-[var(--dashboard-muted)] font-medium">
													{slot.from}–{slot.to}
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Reviews */}
							<div className="space-y-3.5 pt-1.5">
								<h4 className="font-syne font-extrabold text-[12.5px] uppercase tracking-wider text-[var(--dashboard-text)] flex items-center gap-1.5">
									<ThumbsUp size={13} className="text-[var(--dashboard-orange)]" />
									Client Reviews
								</h4>
								{provider.reviews.length === 0 ? (
									<p className="text-[12px] text-[var(--dashboard-muted)] font-medium">
										No reviews yet.
									</p>
								) : (
									<div className="space-y-3">
										{provider.reviews.map((rev: ProviderReview) => (
											<div
												key={rev.id}
												className="bg-[var(--dashboard-bg)]/45 border border-[var(--dashboard-border)]/45 rounded-xl p-3.5 space-y-2.5"
											>
												<div className="flex justify-between items-start gap-2">
													<div className="flex items-center gap-2">
														<div className="w-7 h-7 rounded-full bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] text-[10px] font-bold flex items-center justify-center shrink-0">
															{getInitials(rev.customer.fullName)}
														</div>
														<div>
															<div className="text-[11.5px] font-bold text-[var(--dashboard-text)] leading-none">
																{rev.customer.fullName}
															</div>
															<div className="text-[9.5px] text-[var(--dashboard-muted)] mt-0.5 font-bold flex items-center gap-1">
																<Clock size={9} /> {formatDate(rev.createdAt)}
															</div>
														</div>
													</div>
													{renderStars(rev.rating)}
												</div>
												<p className="text-[12px] text-[var(--dashboard-muted)] leading-relaxed italic font-medium">
													"{rev.comment}"
												</p>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Sticky CTA */}
						<div className="absolute bottom-0 left-0 right-0 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4 flex gap-2.5 z-10 rounded-b-2xl shadow-xl">
							<button
								type="button"
								className="flex-1 py-2.5 rounded-xl border border-[var(--dashboard-border)] text-[12px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
							>
								<Phone size={13} /> Call
							</button>
							<button
								type="button"
								onClick={onMessage}
								className="flex-1 py-2.5 rounded-xl border border-[var(--dashboard-border)] text-[12px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
							>
								<MessageSquare size={13} /> Message
							</button>
							<button
								type="button"
								onClick={() => onHire(provider.id)}
								disabled={isHired}
								className={`flex-2 py-2.5 rounded-xl text-[12.5px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
									isHired
										? "bg-green-600 text-white cursor-default"
										: "bg-[var(--dashboard-orange)] text-white hover:bg-blue-600 active:scale-95 shadow-md shadow-blue-500/15"
								}`}
							>
								{isHired ? (
									<><Check size={13} className="stroke-[3.5]" /> Hired ✓</>
								) : effectiveRate > 0 ? (
									<><Zap size={11} className="stroke-[2.5]" /> Hire · {rateLabel}</>
								) : (
									<><Zap size={11} className="stroke-[2.5]" /> Hire Now</>
								)}
							</button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
