import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	ChangePasswordPayload,
	NotificationPreferences,
	SecurityStatus,
	UpdateNotificationPreferencesPayload,
	UpdateProfilePayload,
	UpdateProfileResponse,
	UserProfile,
} from "#/core/types/settings.types";

/** GET returns the user fields flat (no envelope). */
export const getUserProfileService = ({
	signal,
}: {
	signal?: AbortSignal;
} = {}) =>
	getRequestData<UserProfile>(request.get("/api/user/profile", { signal }));

/** PUT wraps the updated user in `{ status, message, data }` — unwrap `.data`. */
export const updateUserProfileService = async ({
	payload,
	signal,
}: {
	payload: UpdateProfilePayload;
	signal?: AbortSignal;
}): Promise<UserProfile> => {
	const envelope = await getRequestData<UpdateProfileResponse>(
		request.put("/api/user/profile", payload, { signal }),
	);
	return envelope.data;
};

export const changePasswordService = ({
	payload,
	signal,
}: {
	payload: ChangePasswordPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<{ message: string }>(
		request.patch("/api/auth/password", payload, { signal }),
	);

export const getSecurityStatusService = ({
	signal,
}: {
	signal?: AbortSignal;
} = {}) =>
	getRequestData<SecurityStatus>(
		request.get("/api/auth/security/status", { signal }),
	);

/** Row is auto-created (all flags true) on first read — no 404 to handle. */
export const getNotificationPreferencesService = ({
	signal,
}: {
	signal?: AbortSignal;
} = {}) =>
	getRequestData<NotificationPreferences>(
		request.get("/api/notifications/preferences", { signal }),
	);

export const updateNotificationPreferencesService = ({
	payload,
	signal,
}: {
	payload: UpdateNotificationPreferencesPayload;
	signal?: AbortSignal;
}) =>
	getRequestData<NotificationPreferences>(
		request.patch("/api/notifications/preferences", payload, { signal }),
	);
