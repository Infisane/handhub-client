import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	AuthGateResponse,
	AuthSession,
	AuthUser,
	LoginPayload,
	RegisterPayload,
	RequestOtpPayload,
	VerifyOtpPayload,
} from "#/core/types/auth.types";

export type { AuthSession, AuthUser, LoginPayload, RegisterPayload };

export const registerService = ({
	payload,
	signal,
}: {
	payload: RegisterPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<AuthGateResponse>(
		request.post("/api/auth/register", payload, { signal }),
	);

export const loginService = ({
	payload,
	signal,
}: {
	payload: LoginPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<AuthGateResponse>(
		request.post("/api/auth/login", payload, { signal }),
	);

export const getMeService = ({ signal }: { signal?: AbortSignal } = {}) =>
	getRequestData<AuthUser>(request.get("/api/auth/me", { signal }));

export const resendEmailVerificationService = ({
	payload,
	signal,
}: {
	payload: RequestOtpPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<{ message: string }>(
		request.post("/api/auth/email-verification/resend", payload, { signal }),
	);

export const verifyEmailService = ({
	payload,
	signal,
}: {
	payload: VerifyOtpPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<{ message: string }>(
		request.post("/api/auth/email-verification/verify", payload, { signal }),
	);
