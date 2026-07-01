import { getRequestData, request } from "#/core/helpers/axios.helper";
import type { AuthSession, AuthUser, LoginPayload, RegisterPayload } from "#/core/types/auth.types";

export type { AuthSession, AuthUser, LoginPayload, RegisterPayload };

export const registerService = ({
	payload,
	signal,
}: {
	payload: RegisterPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<unknown>(
		request.post("/api/auth/register", payload, { signal }),
	);

export const loginService = ({
	payload,
	signal,
}: {
	payload: LoginPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<AuthSession>(
		request.post("/api/auth/login", payload, { signal }),
	);

export const getMeService = ({ signal }: { signal?: AbortSignal } = {}) =>
	getRequestData<AuthUser>(request.get("/api/auth/me", { signal }));
