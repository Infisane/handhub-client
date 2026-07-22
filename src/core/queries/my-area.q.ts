import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	createZoneService,
	deleteZoneService,
	getAreaSummaryService,
	getZoneInsightsService,
	getZonesService,
	updateProviderAvailabilityService,
	updateZoneService,
} from "#/core/services/my-area.service";
import type { ProviderProfile } from "#/core/types/auth.types";
import type {
	CreateZonePayload,
	ServiceZone,
	UpdateProviderAvailabilityPayload,
	UpdateZonePayload,
} from "#/core/types/my-area.types";

export const useGetZonesQuery = () =>
	useQuery({
		queryKey: ["provider-zones"],
		queryFn: ({ signal }) => getZonesService({ signal }),
		staleTime: 1000 * 60 * 5,
	});

export const useGetAreaSummaryQuery = () =>
	useQuery({
		queryKey: ["area-summary"],
		queryFn: ({ signal }) => getAreaSummaryService({ signal }),
		staleTime: 1000 * 60 * 5,
	});

/** Lazy — only fetches once a zone is selected (enabled guard). */
export const useGetZoneInsightsQuery = (zoneId: string | null) =>
	useQuery({
		queryKey: ["provider-zones", zoneId, "insights"],
		queryFn: ({ signal }) =>
			getZoneInsightsService({ zoneId: zoneId!, signal }),
		enabled: !!zoneId,
		staleTime: 1000 * 60 * 5,
	});

const invalidateZones = (queryClient: ReturnType<typeof useQueryClient>) => {
	queryClient.invalidateQueries({ queryKey: ["provider-zones"] });
	queryClient.invalidateQueries({ queryKey: ["area-summary"] });
};

export const useCreateZoneQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (zone: ServiceZone) => void;
} = {}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateZonePayload) =>
			createZoneService({ payload, signal: abortController.signal }),
		onSuccess: (zone) => {
			invalidateZones(queryClient);
			onSuccessCallback?.(zone);
		},
	});
};

export const useUpdateZoneQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (zone: ServiceZone) => void;
} = {}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateZonePayload }) =>
			updateZoneService({ id, payload, signal: abortController.signal }),
		onSuccess: (zone) => {
			invalidateZones(queryClient);
			onSuccessCallback?.(zone);
		},
	});
};

export const useDeleteZoneQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: () => void;
} = {}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) =>
			deleteZoneService({ id, signal: abortController.signal }),
		onSuccess: () => {
			invalidateZones(queryClient);
			onSuccessCallback?.();
		},
	});
};

/** Toggles availability and/or updates the primary dispatch radius via one
 *  PATCH /api/providers/me call. Invalidates ["auth","me"] so authStore.user
 *  .providerProfile (read by the dashboard header/nav) stays in sync. */
export const useUpdateProviderAvailabilityQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (profile: ProviderProfile) => void;
} = {}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateProviderAvailabilityPayload) =>
			updateProviderAvailabilityService({
				payload,
				signal: abortController.signal,
			}),
		onSuccess: (profile) => {
			queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
			onSuccessCallback?.(profile);
		},
	});
};
