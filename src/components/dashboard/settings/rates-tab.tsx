import { useState } from "react";
import { HelperMethods } from "#/core/helpers/methods.helper";
import { useValidator } from "#/core/helpers/useValidator.helper";
import { useAppSelector } from "#/core/hooks/useStore.hook";
import { useGetAvailabilityOptionsQuery } from "#/core/queries/artisan.q";
import { useUpdateUserProfileQuery } from "#/core/queries/settings.q";
import { RatesSchema } from "#/core/schemas/settings.schema";
import type { AvailabilityOptions } from "#/core/types/artisan.types";
import { cn } from "#/lib/utils.ts";
import { SettingsSaveBar, useSavedFlash } from "./settings-save-bar.tsx";

const inputCls =
	"w-full px-3.5 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] font-semibold text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]";
const labelCls =
	"text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block";

/** Provider-only: edit the minimum charge and weekly schedule collected during
 *  onboarding (which only appears once). Saves through PUT /api/user/profile,
 *  the same endpoint onboarding used — the API applies just the fields sent. */
export function RatesTab() {
	const profile = useAppSelector((s) => s.authStore.user?.providerProfile);
	const { data: rawOpts } = useGetAvailabilityOptionsQuery();
	const opts = rawOpts as AvailabilityOptions | undefined;

	const [form, setForm] = useState({ minCharge: "" });
	const [days, setDays] = useState<string[]>([]);
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	// Only send the schedule if it was edited: the editor models one from/to range
	// for every selected day, so re-saving an untouched per-day schedule would flatten it.
	const [scheduleTouched, setScheduleTouched] = useState(false);
	const [seededId, setSeededId] = useState<string | null>(null);
	const [saved, flashSaved] = useSavedFlash();

	// Seed the editable copy once the profile and day options have loaded (adjust
	// state during render — no effect), like ProfileTab.
	if (profile && opts && profile.id !== seededId) {
		setSeededId(profile.id);
		const minCharge = Number(profile.minCharge);
		setForm({ minCharge: minCharge > 0 ? String(Math.round(minCharge)) : "" });
		const schedule = HelperMethods.parseAvailability(
			profile.availability,
			opts.days,
		);
		setDays(schedule.days);
		setFrom(schedule.from);
		setTo(schedule.to);
	}

	const { validate, revalidate, errors } = useValidator({
		schema: RatesSchema,
		store: form,
	});

	const update = useUpdateUserProfileQuery({
		onSuccessCallback: () => {
			setScheduleTouched(false);
			flashSaved();
		},
	});

	const toggleDay = (day: string) => {
		setScheduleTouched(true);
		setDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		validate(() =>
			update.mutate({
				minCharge: Number(form.minCharge),
				...(scheduleTouched && {
					// No days selected = clear the schedule.
					availability:
						HelperMethods.buildAvailabilityPayload(days, from, to) ?? {},
				}),
			}),
		);
	};

	if (!profile) {
		return (
			<p className="text-[12px] text-[var(--dashboard-muted)]">
				Finish your artisan onboarding to set your rates and hours.
			</p>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div>
				<h3 className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)] leading-none mb-1">
					Rates &amp; Working Hours
				</h3>
				<p className="text-[11px] text-[var(--dashboard-muted)]">
					What customers see on your profile and in search results
				</p>
			</div>

			<div className="space-y-1.5">
				<label htmlFor="rt-minCharge" className={labelCls}>
					Minimum charge (₦)
				</label>
				<input
					id="rt-minCharge"
					type="text"
					inputMode="numeric"
					value={form.minCharge}
					onChange={(e) => {
						const value = e.target.value;
						setForm({ minCharge: value });
						revalidate("minCharge", value);
					}}
					placeholder="e.g. 5000"
					className={cn(inputCls, errors.minCharge && "border-red-400")}
				/>
				{errors.minCharge && (
					<p className="text-[10px] text-red-500 font-semibold">
						{errors.minCharge}
					</p>
				)}
			</div>

			{opts && opts.days.length > 0 && (
				<div className="space-y-2">
					<span className={labelCls}>Working days</span>
					<div className="flex flex-wrap gap-2">
						{opts.days.map((day) => {
							const active = days.includes(day);
							return (
								<button
									key={day}
									type="button"
									aria-pressed={active}
									onClick={() => toggleDay(day)}
									className={cn(
										"px-3 py-1.5 rounded-full border text-[12px] font-bold cursor-pointer transition-all",
										active
											? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange-mid)] text-[var(--dashboard-orange)]"
											: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)]",
									)}
								>
									{day.slice(0, 3)}
								</button>
							);
						})}
					</div>

					{days.length > 0 && (
						<>
							<div className="flex items-center gap-2">
								<select
									aria-label="Start time"
									className={inputCls}
									value={from}
									onChange={(e) => {
										const next = e.target.value;
										setScheduleTouched(true);
										setFrom(next);
										if (to <= next) setTo("");
									}}
								>
									<option value="">From</option>
									{opts.timeSlots.map((t) => (
										<option key={t} value={t}>
											{HelperMethods.formatTime(t)}
										</option>
									))}
								</select>
								<span className="text-[var(--dashboard-muted)] shrink-0">
									—
								</span>
								<select
									aria-label="End time"
									className={inputCls}
									value={to}
									onChange={(e) => {
										setScheduleTouched(true);
										setTo(e.target.value);
									}}
								>
									<option value="">To</option>
									{opts.timeSlots
										.filter((t) => t > from)
										.map((t) => (
											<option key={t} value={t}>
												{HelperMethods.formatTime(t)}
											</option>
										))}
								</select>
							</div>
							<p className="text-[10px] text-[var(--dashboard-muted)]">
								The same hours apply to every selected day.
							</p>
						</>
					)}
				</div>
			)}

			<SettingsSaveBar isSaving={update.isPending} saved={saved} />
		</form>
	);
}
