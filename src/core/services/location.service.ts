import { getRequestData, request } from "#/core/helpers/axios.helper";
import type { LgaItem, StateItem, WardItem } from "#/core/types/location.types";

export const getStatesService = ({ signal }: { signal?: AbortSignal } = {}) =>
	getRequestData<StateItem[]>(request.get("/api/locations/states", { signal }));

export const getLgasService = ({
	stateId,
	signal,
}: {
	stateId: string;
	signal?: AbortSignal;
}) =>
	getRequestData<LgaItem[]>(
		request.get("/api/locations/lgas", { params: { stateId }, signal }),
	);

export const getWardsService = ({
	lgaId,
	signal,
}: {
	lgaId: string;
	signal?: AbortSignal;
}) =>
	getRequestData<WardItem[]>(
		request.get("/api/locations/wards", { params: { lgaId }, signal }),
	);
