import type { LucideIcon } from "lucide-react";
import {
	Box,
	Droplets,
	Hammer,
	Home,
	Paintbrush,
	Settings,
	Sparkles,
	Sun,
	Thermometer,
	Wind,
	Wrench,
	Zap,
} from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useValidator } from "#/core/helpers/useValidator.helper";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import {
	useGetAvailabilityOptionsQuery,
	useGetServicesQuery,
} from "#/core/queries/artisan.q";
import {
	set_services,
	toggle_availability_day,
	toggle_service,
} from "#/core/redux-store/slices/onboarding.slice";
import { ServicesSchema } from "#/core/schemas/artisan-onboarding.schema";
import type {
	AvailabilityOptions,
	ServiceCategory,
	ServiceItem,
} from "#/core/types/artisan.types";
import { cn } from "#/lib/utils";
import { Chip, Field, inputCls } from "./shared";

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
	wind: Wind,
	zap: Zap,
	droplets: Droplets,
	hammer: Hammer,
	paintbrush: Paintbrush,
	wrench: Wrench,
	home: Home,
	sun: Sun,
	thermometer: Thermometer,
	settings: Settings,
	sparkles: Sparkles,
};

const getCategoryIcon = (iconName: string): LucideIcon =>
	CATEGORY_ICON_MAP[iconName.toLowerCase()] ?? Box;

const formatTime = (t: string) => {
	const h = Number(t.split(":")[0]);
	if (h === 0) return "12:00 AM";
	if (h < 12) return `${h}:00 AM`;
	if (h === 12) return "12:00 PM";
	return `${h - 12}:00 PM`;
};

export interface StepServicesHandle {
	validate: () => boolean;
}

export const StepServices = forwardRef<StepServicesHandle, object>((_, ref) => {
	const dispatch = useAppDispatch();
	const data = useAppSelector((s) => s.onboardingStore.services);
	const { validate, revalidate, errors } = useValidator({
		schema: ServicesSchema,
		store: data,
	});
	const { data: rawServices, isLoading } = useGetServicesQuery();
	const services = (rawServices ?? []) as ServiceItem[];

	const { data: rawAvailOpts } = useGetAvailabilityOptionsQuery();
	const availOpts = rawAvailOpts as AvailabilityOptions | undefined;

	useImperativeHandle(ref, () => ({ validate }));

	const [activeCategory, setActiveCategory] = useState<string>("");

	const grouped = services
		.filter((s: ServiceItem) => s.isActive)
		.reduce(
			(
				acc: Record<
					string,
					{ category: ServiceCategory; items: ServiceItem[] }
				>,
				svc: ServiceItem,
			) => {
				const key = svc.category.name;
				if (!acc[key]) acc[key] = { category: svc.category, items: [] };
				acc[key].items.push(svc);
				return acc;
			},
			{},
		);

	const categoryKeys = Object.keys(grouped);
	const activeCategoryName = categoryKeys.includes(activeCategory)
		? activeCategory
		: (categoryKeys[0] ?? "");
	const activeItems = grouped[activeCategoryName]?.items ?? [];

	const selectedNames = data.services
		.map((id) => services.find((s) => s.id === id)?.name)
		.filter(Boolean) as string[];

	const handleToggleService = (serviceId: string) => {
		const newServices = data.services.includes(serviceId)
			? data.services.filter((v) => v !== serviceId)
			: [...data.services, serviceId];
		dispatch(toggle_service(serviceId));
		revalidate("services", newServices);
	};

	return (
		<div className="flex flex-col gap-4">
			<Field label="Services you offer" error={errors.services}>
				{isLoading ? (
					<div className="flex flex-col gap-2">
						<div className="flex gap-1.5">
							{[72, 88, 64, 96, 80].map((w) => (
								<div
									key={w}
									className="h-8 rounded-lg bg-[var(--dashboard-border)] animate-pulse shrink-0"
									style={{ width: `${w}px` }}
								/>
							))}
						</div>
						<div className="flex flex-wrap gap-2 min-h-[72px] pt-1">
							{[84, 120, 96, 140, 100, 116].map((w) => (
								<div
									key={w}
									className="h-7 rounded-full bg-[var(--dashboard-border)] animate-pulse"
									style={{ width: `${w}px` }}
								/>
							))}
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						{/* Category tab strip */}
						<div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5 -mx-0.5 px-0.5">
							{categoryKeys.map((catName) => {
								const { category } = grouped[catName];
								const Icon = getCategoryIcon(category.icon);
								const count = grouped[catName].items.filter((s) =>
									data.services.includes(s.id),
								).length;
								const isActive = catName === activeCategoryName;
								return (
									<button
										key={catName}
										type="button"
										onClick={() => setActiveCategory(catName)}
										className={cn(
											"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer",
											isActive
												? "bg-[var(--dashboard-orange)] text-white"
												: "bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)] hover:border-[var(--dashboard-orange)]/40",
										)}
									>
										<Icon size={11} />
										{catName}
										{count > 0 && (
											<span
												className={cn(
													"text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shrink-0",
													isActive
														? "bg-white/25 text-white"
														: "bg-[var(--dashboard-orange)] text-white",
												)}
											>
												{count}
											</span>
										)}
									</button>
								);
							})}
						</div>

						{/* Chips for active category */}
						<div className="flex flex-wrap gap-2 min-h-18 items-start content-start">
							{activeItems.map((svc) => (
								<Chip
									key={svc.id}
									label={svc.name}
									active={data.services.includes(svc.id)}
									onClick={() => handleToggleService(svc.id)}
								/>
							))}
						</div>

						{/* Selected summary */}
						{selectedNames.length > 0 && (
							<p className="text-[11px] text-[var(--dashboard-muted)] leading-relaxed">
								<span className="font-semibold text-[var(--dashboard-text)]">
									{selectedNames.length} selected
								</span>
								{" · "}
								{selectedNames.slice(0, 3).join(", ")}
								{selectedNames.length > 3 &&
									` +${selectedNames.length - 3} more`}
							</p>
						)}
					</div>
				)}
			</Field>

			<Field label="Business name" htmlFor="ob-bizname" optional>
				<input
					id="ob-bizname"
					className={inputCls}
					placeholder="e.g. SparkRight Electricals"
					value={data.businessName}
					onChange={(e) =>
						dispatch(set_services({ businessName: e.target.value }))
					}
				/>
			</Field>

			<Field
				label="Professional bio / about me"
				htmlFor="ob-bio"
				error={errors.bio}
			>
				<textarea
					id="ob-bio"
					className={cn(inputCls, "resize-none", errors.bio && "has-error")}
					rows={3}
					placeholder="Tell clients about your experience, specialties and what sets you apart."
					value={data.bio}
					onChange={(e) => {
						dispatch(set_services({ bio: e.target.value }));
						revalidate("bio", e.target.value);
					}}
				/>
			</Field>

			<Field
				label="Years of experience"
				htmlFor="ob-exp"
				error={errors.experience}
			>
				<input
					id="ob-exp"
					type="number"
					min="0"
					className={cn(inputCls, errors.experience && "has-error")}
					placeholder="e.g. 5"
					value={data.experience}
					onChange={(e) => {
						dispatch(set_services({ experience: e.target.value }));
						revalidate("experience", e.target.value);
					}}
				/>
			</Field>

			{availOpts && availOpts.days.length > 0 && (
				<Field label="Availability days" optional>
					<div className="flex flex-wrap gap-2">
						{availOpts.days.map((day) => (
							<Chip
								key={day}
								label={day.slice(0, 3)}
								active={data.availabilityDays.includes(day)}
								onClick={() => dispatch(toggle_availability_day(day))}
							/>
						))}
					</div>
					{data.availabilityDays.length > 0 && (
						<div className="flex items-center gap-2 mt-3">
							<select
								className={inputCls}
								value={data.availabilityFrom}
								onChange={(e) => {
									const from = e.target.value;
									dispatch(
										set_services({
											availabilityFrom: from,
											availabilityTo:
												data.availabilityTo <= from ? "" : data.availabilityTo,
										}),
									);
								}}
							>
								<option value="">From</option>
								{availOpts.timeSlots.map((t) => (
									<option key={t} value={t}>
										{formatTime(t)}
									</option>
								))}
							</select>
							<span className="text-(--dashboard-muted) shrink-0">—</span>
							<select
								className={inputCls}
								value={data.availabilityTo}
								onChange={(e) =>
									dispatch(set_services({ availabilityTo: e.target.value }))
								}
							>
								<option value="">To</option>
								{availOpts.timeSlots
									.filter((t) => t > data.availabilityFrom)
									.map((t) => (
										<option key={t} value={t}>
											{formatTime(t)}
										</option>
									))}
							</select>
						</div>
					)}
				</Field>
			)}

			<Field
				label="Minimum charge (₦)"
				htmlFor="ob-min"
				error={errors.minCharge}
			>
				<input
					id="ob-min"
					type="number"
					min="0"
					className={cn(inputCls, errors.minCharge && "has-error")}
					placeholder="e.g. 5000"
					value={data.minCharge}
					onChange={(e) => {
						dispatch(set_services({ minCharge: e.target.value }));
						revalidate("minCharge", e.target.value);
					}}
				/>
			</Field>
		</div>
	);
});

StepServices.displayName = "StepServices";
