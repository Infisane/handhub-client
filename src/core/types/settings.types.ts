import type { UserType } from "#/core/helpers/constants.helper";

/* ── Profile ─────────────────────────────────────────────────── */
export interface UserProfile {
	id: string;
	fullName: string;
	email: string; // read-only — never sent back
	phone: string;
	userType: UserType;
	isVerified: boolean;
	avatar: string | null;
	address: string | null;
	bio: string | null;
	createdAt: string;
	updatedAt: string;
}

/** Only the editable fields. Email is intentionally excluded — the API rejects
 *  it (`400 property email should not exist`). Omit a field to leave it alone;
 *  send `avatar: ""` to clear the avatar. */
export interface UpdateProfilePayload {
	fullName?: string;
	phone?: string;
	address?: string;
	bio?: string;
	avatar?: string;
}

/** PUT /api/user/profile wraps the user in an envelope (GET is flat). */
export interface UpdateProfileResponse {
	status: string;
	message: string;
	data: UserProfile;
}

/* ── Security ────────────────────────────────────────────────── */
export interface ChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
}

export interface SecurityStatus {
	isVerified: boolean;
	emailVerifiedAt: string | null;
	lastLoginAt: string | null;
	passwordChangedAt: string | null;
	hasPassword: boolean;
}

/* ── Notification preferences ────────────────────────────────── */
export interface NotificationPreferences {
	id: string;
	userId: string;
	bookingUpdates: boolean;
	chatMessages: boolean;
	quotesAndInvoices: boolean;
	escrowAndPayments: boolean;
	promotions: boolean;
	createdAt: string;
	updatedAt: string;
}

export type NotificationPreferenceKey =
	| "bookingUpdates"
	| "chatMessages"
	| "quotesAndInvoices"
	| "escrowAndPayments"
	| "promotions";

export type UpdateNotificationPreferencesPayload = Partial<
	Record<NotificationPreferenceKey, boolean>
>;
