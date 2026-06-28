import { getRequestData, request } from "#/core/helpers/axios.helper";

export interface AuthUser {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	userType: "customer" | "artisan";
	isVerified: boolean;
	isActive: boolean;
	city: string | null;
	avatar: string | null;
	createdAt: string;
}

export interface AuthSession {
	token: string;
	user: AuthUser;
}

export interface RegisterPayload {
	fullName: string;
	email: string;
	phone: string;
	password: string;
	userType: "customer" | "artisan";
}

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

export interface LoginPayload {
	credential: string;
	password: string;
	userType: "customer" | "artisan";
}

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
