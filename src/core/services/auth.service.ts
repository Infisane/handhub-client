import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	AuthGateResponse,
	AuthSession,
	AuthUser,
	CompletePasswordResetPayload,
	GoogleAuthPayload,
	GoogleAuthResponse,
	LoginPayload,
	RegisterPayload,
	RequestOtpPayload,
	RequestPasswordResetPayload,
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

export const googleAuthService = ({
	payload,
	signal,
}: {
	payload: GoogleAuthPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<GoogleAuthResponse>(
		request.post("/api/auth/google", payload, { signal }),
	);

/** Forgot-password flow (logged out) and Settings' "Set a Password" flow
 *  (logged in, hasPassword: false) both reuse these — same OTP endpoints
 *  either way. `/verify` is deliberately not implemented: it's optional
 *  when the UI collects the OTP and new password on one screen and submits
 *  directly to `/complete`. */
export const requestPasswordResetService = ({
	payload,
	signal,
}: {
	payload: RequestPasswordResetPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<{ message: string }>(
		request.post("/api/auth/password-reset/request", payload, { signal }),
	);

export const completePasswordResetService = ({
	payload,
	signal,
}: {
	payload: CompletePasswordResetPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<{ message: string }>(
		request.post("/api/auth/password-reset/complete", payload, { signal }),
	);
