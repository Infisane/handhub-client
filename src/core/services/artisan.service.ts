import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	AvailabilityOptions,
	ServiceItem,
	UpdateProviderPayload,
} from "#/core/types/artisan.types";
import type { AuthUser } from "#/core/types/auth.types";

export const getServicesService = ({ signal }: { signal?: AbortSignal } = {}) =>
	getRequestData<ServiceItem[]>(request.get("/api/services", { signal }));

export const getAvailabilityOptionsService = ({
	signal,
}: { signal?: AbortSignal } = {}) =>
	getRequestData<AvailabilityOptions>(
		request.get("/api/providers/availability-options", { signal }),
	);

export const updateProviderProfileService = ({
	payload,
	signal,
}: {
	payload: UpdateProviderPayload;
	signal?: AbortSignal;
}): Promise<AuthUser> =>
	getRequestData<AuthUser>(
		request.put("/api/user/profile", payload, { signal }),
	);
