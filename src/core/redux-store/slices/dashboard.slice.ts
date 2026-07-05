import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
	hasActiveChat: boolean;
	isMobileSidebarOpen: boolean;
	onboardingDismissed: boolean;
	/** Conversation the drawer shows: an existing thread… */
	activeThreadId: string | null;
	/** …or a provider-profile id for a not-yet-created conversation. */
	activeProviderId: string | null;
}

const initialState: DashboardState = {
	hasActiveChat: false,
	isMobileSidebarOpen: false,
	onboardingDismissed: false,
	activeThreadId: null,
	activeProviderId: null,
};

const dashboardSlice = createSlice({
	name: "dashboardStore",
	initialState,
	reducers: {
		set_dashboard_flags(state, action: PayloadAction<Partial<DashboardState>>) {
			Object.assign(state, action.payload);
		},
		reset_dashboard_flags: () => initialState,
	},
});

export const { set_dashboard_flags, reset_dashboard_flags } =
	dashboardSlice.actions;
export default dashboardSlice.reducer;
