import { useAppSelector } from "#/core/hooks/useStore.hook";
import {
	useGetLgasQuery,
	useGetStatesQuery,
	useGetWardsQuery,
} from "#/core/queries/location.q";
import type { LgaItem, StateItem, WardItem } from "#/core/types/location.types";

export const useEnrichedProviderProfile = () => {
	const profile = useAppSelector((s) => s.authStore.user?.providerProfile);

	const stateId = profile?.stateId ?? "";
	const lgaId = profile?.lgaId ?? "";

	const { data: rawStates } = useGetStatesQuery();
	const { data: rawLgas } = useGetLgasQuery(stateId);
	const { data: rawWards } = useGetWardsQuery(lgaId);

	const states = (rawStates ?? []) as StateItem[];
	const lgas = (rawLgas ?? []) as LgaItem[];
	const wards = (rawWards ?? []) as WardItem[];

	if (!profile) return null;

	return {
		...profile,
		state: states.find((s) => s.id === stateId) ?? profile.state,
		lga: lgas.find((l) => l.id === lgaId) ?? profile.lga,
		ward:
			wards.find((w) => w.id === (profile.wardId ?? "")) ?? profile.ward,
	};
};
