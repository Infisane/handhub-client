import { useMutation, useQuery } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	aiSearchService,
	getAvailabilityOptionsService,
	getCategoriesService,
	getProviderByIdService,
	getProvidersService,
	getRecommendationsService,
	getServicesService,
	updateProviderProfileService,
} from "#/core/services/artisan.service";
import type {
	AiSearchParams,
	GetProvidersParams,
	RecommendationsParams,
	UpdateProviderPayload,
} from "#/core/types/artisan.types";
import type { AuthUser } from "#/core/types/auth.types";

export const useAiSearchQuery = (params: AiSearchParams | null) =>
	useQuery({
		queryKey: ["ai-search", params],
		queryFn: ({ signal }) => aiSearchService({ params: params!, signal }),
		enabled: !!params && params.q.trim().length > 0,
		staleTime: 1000 * 60 * 5,
	});

export const useGetRecommendationsQuery = (params: RecommendationsParams) =>
	useQuery({
		queryKey: ["recommendations", params],
		queryFn: ({ signal }) => getRecommendationsService({ params, signal }),
		enabled: !!(params.lat && params.lon) || !!params.city,
		staleTime: 1000 * 60 * 5,
	});

export const useGetProvidersQuery = (
	params?: GetProvidersParams,
	enabled = true,
) =>
	useQuery({
		queryKey: ["providers", params],
		queryFn: ({ signal }) => getProvidersService({ params, signal }),
		enabled,
		staleTime: 1000 * 60 * 5,
	});

export const useGetProviderByIdQuery = (id: string | null) =>
	useQuery({
		queryKey: ["provider", id],
		queryFn: ({ signal }) => getProviderByIdService({ id: id!, signal }),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
	});

export const useGetAvailabilityOptionsQuery = () =>
	useQuery({
		queryKey: ["availability-options"],
		queryFn: ({ signal }) => getAvailabilityOptionsService({ signal }),
		staleTime: 1000 * 60 * 60 * 24,
	});

export const useGetCategoriesQuery = () =>
	useQuery({
		queryKey: ["categories"],
		queryFn: ({ signal }) => getCategoriesService({ signal }),
		staleTime: 1000 * 60 * 60 * 24,
	});

export const useGetServicesQuery = () =>
	useQuery({
		queryKey: ["services"],
		queryFn: ({ signal }) => getServicesService({ signal }),
		staleTime: 1000 * 60 * 30,
	});

export const useUpdateProviderProfileQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (user: AuthUser) => void;
} = {}) =>
	useMutation({
		mutationFn: (payload: UpdateProviderPayload) =>
			updateProviderProfileService({ payload, signal: abortController.signal }),
		onSuccess: (user) => onSuccessCallback?.(user),
	});
