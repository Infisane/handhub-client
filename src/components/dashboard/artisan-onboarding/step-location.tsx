import { forwardRef, useImperativeHandle } from "react";
import { useValidator } from "#/core/helpers/useValidator.helper";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import {
	useGetLgasQuery,
	useGetStatesQuery,
	useGetWardsQuery,
} from "#/core/queries/location.q";
import { set_location } from "#/core/redux-store/slices/onboarding.slice";
import { LocationSchema } from "#/core/schemas/artisan-onboarding.schema";
import type { LgaItem, StateItem, WardItem } from "#/core/types/location.types";
import { cn } from "#/lib/utils";
import { Field, inputCls } from "./shared";

export interface StepLocationHandle {
	validate: () => boolean;
}

export const StepLocation = forwardRef<StepLocationHandle, object>((_, ref) => {
	const dispatch = useAppDispatch();
	const data = useAppSelector((s) => s.onboardingStore.location);
	const { validate, revalidate, errors } = useValidator({
		schema: LocationSchema,
		store: data,
	});

	useImperativeHandle(ref, () => ({ validate }));

	const { data: rawStates, isLoading: statesLoading } = useGetStatesQuery();
	const states = (rawStates ?? []) as StateItem[];

	const { data: rawLgas, isLoading: lgasLoading } = useGetLgasQuery(
		data.stateId,
	);
	const lgas = (rawLgas ?? []) as LgaItem[];

	const { data: rawWards, isLoading: wardsLoading } = useGetWardsQuery(
		data.lgaId,
	);
	const wards = (rawWards ?? []) as WardItem[];

	const handleStateChange = (stateId: string) => {
		const found = states.find((s) => s.id === stateId);
		dispatch(
			set_location({
				stateId,
				state: found?.name ?? "",
				stateCode: found?.code ?? "",
				lgaId: "",
				lga: "",
				lgaCode: "",
				wardId: "",
				wardCode: "",
				latitude: "",
				longitude: "",
			}),
		);
		revalidate("state", found?.name ?? "");
	};

	const handleLgaChange = (lgaId: string) => {
		const found = lgas.find((l) => l.id === lgaId);
		dispatch(
			set_location({
				lgaId,
				lga: found?.name ?? "",
				lgaCode: found?.code ?? "",
				wardId: "",
				wardCode: "",
				latitude: "",
				longitude: "",
			}),
		);
		revalidate("lga", found?.name ?? "");
	};

	const handleWardChange = (wardId: string) => {
		const ward = wards.find((w) => w.id === wardId);
		dispatch(
			set_location({
				wardId,
				wardCode: ward?.code ?? "",
				latitude: ward?.latitude ?? "",
				longitude: ward?.longitude ?? "",
			}),
		);
		revalidate("wardCode", ward?.code ?? "");
	};

	return (
		<div className="flex flex-col gap-4">
			{/* State */}
			<Field label="State" htmlFor="ob-state" error={errors.state}>
				<select
					id="ob-state"
					className={cn(inputCls, errors.state && "has-error")}
					value={data.stateId}
					disabled={statesLoading}
					onChange={(e) => handleStateChange(e.target.value)}
				>
					<option value="">
						{statesLoading ? "Loading states…" : "Select state"}
					</option>
					{states.map((s) => (
						<option key={s.id} value={s.id}>
							{s.name}
						</option>
					))}
				</select>
			</Field>

			{/* LGA */}
			<Field
				label="Local government area (LGA)"
				htmlFor="ob-lga"
				error={errors.lga}
			>
				<select
					id="ob-lga"
					className={cn(inputCls, errors.lga && "has-error")}
					value={data.lgaId}
					disabled={!data.stateId || lgasLoading}
					onChange={(e) => handleLgaChange(e.target.value)}
				>
					<option value="">
						{!data.stateId
							? "Select a state first"
							: lgasLoading
								? "Loading LGAs…"
								: "Select LGA"}
					</option>
					{lgas.map((l) => (
						<option key={l.id} value={l.id}>
							{l.name}
						</option>
					))}
				</select>
			</Field>

			{/* Ward / Area */}
			<Field label="Ward / area" htmlFor="ob-ward" error={errors.wardCode}>
				<select
					id="ob-ward"
					className={cn(inputCls, errors.wardCode && "has-error")}
					value={data.wardId}
					disabled={!data.lgaId || wardsLoading}
					onChange={(e) => handleWardChange(e.target.value)}
				>
					<option value="">
						{!data.lgaId
							? "Select an LGA first"
							: wardsLoading
								? "Loading wards…"
								: "Select ward / area"}
					</option>
					{wards.map((w) => (
						<option key={w.id} value={w.id}>
							{w.name}
						</option>
					))}
				</select>
			</Field>

			{/* Street address */}
			<Field label="Street address" htmlFor="ob-address" error={errors.address}>
				<textarea
					id="ob-address"
					className={cn(inputCls, "resize-none", errors.address && "has-error")}
					rows={3}
					placeholder="e.g. No. 12 Adeola Odeku Street, Victoria Island"
					value={data.address}
					onChange={(e) => {
						dispatch(set_location({ address: e.target.value }));
						revalidate("address", e.target.value);
					}}
				/>
			</Field>
		</div>
	);
});

StepLocation.displayName = "StepLocation";
