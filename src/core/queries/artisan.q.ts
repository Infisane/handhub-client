import { useMutation, useQuery } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	getAvailabilityOptionsService,
	getServicesService,
	updateProviderProfileService,
} from "#/core/services/artisan.service";
import type { UpdateProviderPayload } from "#/core/types/artisan.types";
import type { AuthUser } from "#/core/types/auth.types";

export const useGetAvailabilityOptionsQuery = () =>
	useQuery({
		queryKey: ["availability-options"],
		queryFn: ({ signal }) => getAvailabilityOptionsService({ signal }),
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
