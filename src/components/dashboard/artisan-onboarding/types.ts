export type AccountType = "individual" | "business" | "agency";

export const STEP = {
	ACCOUNT_TYPE: 0,
	LOCATION: 1,
	SERVICES: 2,
	VERIFICATION: 3,
} as const;

export interface OnboardingData {
	accountType: AccountType | null;
	state: string;
	city: string;
	address: string;
	services: string[];
	businessName: string;
	bio: string;
	experience: string;
	workHours: string;
	minCharge: string;
	maxCharge: string;
	idType: string;
	idNumber: string;
	communication: string[];
	documentName: string;
}

