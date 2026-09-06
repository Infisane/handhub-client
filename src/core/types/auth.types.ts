import type { UserType } from "../helpers/constants.helper";

interface ProviderProfileLocation {
	id: string;
	code: string;
	name: string;
}

interface ProviderProfileWard extends ProviderProfileLocation {
	latitude: string;
	longitude: string;
}

interface ProviderProfileService {
	id: string;
	name: string;
	categoryId: string;
}

export interface ProviderProfile {
	id: string;
	accountType: "individual" | "business" | "agency";
	title: string | null;
	bio: string;
	experience: number;
	categoryId: string | null;
	services: ProviderProfileService[];
	stateId: string | null;
	lgaId: string | null;
	wardId: string | null;
	state: ProviderProfileLocation | null;
	lga: ProviderProfileLocation | null;
	ward: ProviderProfileWard | null;
	city: string | null;
	address: string;
	latitude: string;
	longitude: string;
	serviceRadius: number | null;
	isAvailable: boolean;
	aiIntakeEnabled: boolean;
	hourlyRate: string;
	minCharge: string;
	availability: Record<string, string[]>;
	portfolioImages: string[];
	businessName: string | null;
	workHours: string | null;
	idType: string | null;
	idNumber: string | null;
	idDocumentUrl: string | null;
	preferredCommunication: string[];
	isOnboarded: boolean;
	isVerified: boolean;
	averageRating: string;
	reviewCount: number;
	approvalStatus: string;
	createdAt: string;
	updatedAt: string;
}

export interface AuthUser {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	userType: UserType;
	isVerified: boolean;
	isActive: boolean;
	avatar: string | null;
	emailVerifiedAt?: string;
	lastLoginAt?: string;
	firstLoginAt?: string;
	createdAt: string;
	updatedAt: string;
	providerProfile?: ProviderProfile | null;
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
	userType: UserType;
}

export interface LoginPayload {
	credential: string;
	password: string;
	userType: UserType;
}

/** Shared shape for /auth/register and /auth/login — both can now return a
 *  200 with no token when email verification is required. Check for `token`
 *  presence, not status code, to know which case you got. */
export interface AuthGateResponse {
	token?: string;
	user?: AuthUser;
	emailVerificationRequired: boolean;
	message?: string;
}

export interface RequestOtpPayload {
	email: string;
}

export interface VerifyOtpPayload {
	email: string;
	otp: string;
}

export interface GoogleAuthPayload {
	idToken: string;
	phone: string;
	userType: UserType;
}

export interface GoogleAuthResponse {
	token: string;
	user: AuthUser;
	isNewAccount: boolean;
}

export interface RequestPasswordResetPayload {
	email: string;
}

export interface CompletePasswordResetPayload {
	email: string;
	otp: string;
	newPassword: string;
}
