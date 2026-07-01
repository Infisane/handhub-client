import { useQuery } from "@tanstack/react-query";
import {
	getLgasService,
	getStatesService,
	getWardsService,
} from "#/core/services/location.service";

export const useGetStatesQuery = () =>
	useQuery({
		queryKey: ["locations", "states"],
		queryFn: ({ signal }) => getStatesService({ signal }),
		staleTime: 1000 * 60 * 60 * 24,
	});

export const useGetLgasQuery = (stateId: string) =>
	useQuery({
		queryKey: ["locations", "lgas", stateId],
		queryFn: ({ signal }) => getLgasService({ stateId, signal }),
		enabled: !!stateId,
		staleTime: 1000 * 60 * 60 * 24,
	});

export const useGetWardsQuery = (lgaId: string) =>
	useQuery({
		queryKey: ["locations", "wards", lgaId],
		queryFn: ({ signal }) => getWardsService({ lgaId, signal }),
		enabled: !!lgaId,
		staleTime: 1000 * 60 * 60 * 24,
	});
