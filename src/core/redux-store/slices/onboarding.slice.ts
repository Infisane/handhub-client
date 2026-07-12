import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AccountType } from "#/components/dashboard/artisan-onboarding/types";

interface AccountTypeState {
	accountType: AccountType | null;
}

interface LocationState {
	stateId: string;
	state: string;
	stateCode: string;
	lgaId: string;
	lga: string;
	lgaCode: string;
	wardId: string;
	wardCode: string;
	latitude: string;
	longitude: string;
	address: string;
}

interface ServicesState {
	services: string[];
	businessName: string;
	bio: string;
	experience: string;
	workHours: string;
	minCharge: string;
	availabilityDays: string[];
	availabilityFrom: string;
	availabilityTo: string;
}

interface VerificationState {
	idType: string;
	idNumber: string;
	communication: string[];
	documentName: string;
	documentUrl: string;
}

interface OnboardingState {
	accountType: AccountTypeState;
	location: LocationState;
	services: ServicesState;
	verification: VerificationState;
}

const initialState: OnboardingState = {
	accountType: { accountType: null },
	location: {
		stateId: "",
		state: "",
		stateCode: "",
		lgaId: "",
		lga: "",
		lgaCode: "",
		wardId: "",
		wardCode: "",
		latitude: "",
		longitude: "",
		address: "",
	},
	services: {
		services: [],
		businessName: "",
		bio: "",
		experience: "",
		workHours: "",
		minCharge: "",
		availabilityDays: [],
		availabilityFrom: "",
		availabilityTo: "",
	},
	verification: {
		idType: "",
		idNumber: "",
		communication: [],
		documentName: "",
		documentUrl: "",
	},
};

const onboardingSlice = createSlice({
	name: "onboardingStore",
	initialState,
	reducers: {
		set_account_type(state, action: PayloadAction<AccountType | null>) {
			state.accountType.accountType = action.payload;
		},
		set_location(state, action: PayloadAction<Partial<LocationState>>) {
			Object.assign(state.location, action.payload);
		},
		set_services(state, action: PayloadAction<Partial<ServicesState>>) {
			Object.assign(state.services, action.payload);
		},
		toggle_service(state, action: PayloadAction<string>) {
			const arr = state.services.services;
			state.services.services = arr.includes(action.payload)
				? arr.filter((v) => v !== action.payload)
				: [...arr, action.payload];
		},
		set_verification(state, action: PayloadAction<Partial<VerificationState>>) {
			Object.assign(state.verification, action.payload);
		},
		toggle_availability_day(state, action: PayloadAction<string>) {
			const arr = state.services.availabilityDays;
			state.services.availabilityDays = arr.includes(action.payload)
				? arr.filter((v) => v !== action.payload)
				: [...arr, action.payload];
		},
		toggle_communication(state, action: PayloadAction<string>) {
			const arr = state.verification.communication;
			state.verification.communication = arr.includes(action.payload)
				? arr.filter((v) => v !== action.payload)
				: [...arr, action.payload];
		},
		reset_onboarding: () => initialState,
	},
});

export const {
	set_account_type,
	set_location,
	set_services,
	toggle_service,
	toggle_availability_day,
	set_verification,
	toggle_communication,
	reset_onboarding,
} = onboardingSlice.actions;
export default onboardingSlice.reducer;
