import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
	hasActiveChat: boolean;
	isMobileSidebarOpen: boolean;
}

const initialState: DashboardState = {
	hasActiveChat: true,
	isMobileSidebarOpen: false,
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
