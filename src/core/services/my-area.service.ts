import { getRequestData, request } from "#/core/helpers/axios.helper";
import type { ProviderProfile } from "#/core/types/auth.types";
import type {
	AreaSummary,
	CreateZonePayload,
	ServiceZone,
	UpdateProviderAvailabilityPayload,
	UpdateZonePayload,
	ZoneInsights,
} from "#/core/types/my-area.types";

export const getZonesService = ({ signal }: { signal?: AbortSignal } = {}) =>
	getRequestData<ServiceZone[]>(
		request.get("/api/providers/me/zones", { signal }),
	);

export const createZoneService = ({
	payload,
	signal,
}: {
	payload: CreateZonePayload;
	signal?: AbortSignal;
}) =>
	getRequestData<ServiceZone>(
		request.post("/api/providers/me/zones", payload, { signal }),
	);

export const updateZoneService = ({
	id,
	payload,
	signal,
}: {
	id: string;
	payload: UpdateZonePayload;
	signal?: AbortSignal;
}) =>
	getRequestData<ServiceZone>(
		request.patch(`/api/providers/me/zones/${id}`, payload, { signal }),
	);

export const deleteZoneService = ({
	id,
	signal,
}: {
	id: string;
	signal?: AbortSignal;
}) =>
	getRequestData<{ message: string }>(
		request.delete(`/api/providers/me/zones/${id}`, { signal }),
	);

export const getZoneInsightsService = ({
	zoneId,
	signal,
}: {
	zoneId: string;
	signal?: AbortSignal;
}) =>
	getRequestData<ZoneInsights>(
		request.get(`/api/providers/me/zones/${zoneId}/insights`, { signal }),
	);

export const getAreaSummaryService = ({
	signal,
}: {
	signal?: AbortSignal;
} = {}) =>
	getRequestData<AreaSummary>(
		request.get("/api/providers/me/area/summary", { signal }),
	);

/** Toggles availability and/or updates the primary dispatch radius. Setting
 *  serviceRadius also syncs the primary zone's coverageKm server-side. */
export const updateProviderAvailabilityService = ({
	payload,
	signal,
}: {
	payload: UpdateProviderAvailabilityPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<ProviderProfile>(
		request.patch("/api/providers/me", payload, { signal }),
	);
