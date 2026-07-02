import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	AiSearchParams,
	AiSearchResponse,
	AvailabilityOptions,
	RecommendationsParams,
	RecommendationsResponse,
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

export const aiSearchService = ({
	params,
	signal,
}: {
	params: AiSearchParams;
	signal?: AbortSignal;
}) =>
	getRequestData<AiSearchResponse>(
		request.get("/api/ai/search", { params, signal }),
	);

export const getRecommendationsService = ({
	params,
	signal,
}: {
	params: RecommendationsParams;
	signal?: AbortSignal;
}) =>
	getRequestData<RecommendationsResponse>(
		request.get("/api/ai/recommendations", { params, signal }),
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
