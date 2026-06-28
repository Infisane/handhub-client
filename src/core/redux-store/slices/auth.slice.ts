import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "#/core/services/auth.service";

interface AuthState {
	token: string | null;
	user: AuthUser | null;
}

const initialState: AuthState = { token: null, user: null };

const authSlice = createSlice({
	name: "authStore",
	initialState,
	reducers: {
		set_auth_session(state, action: PayloadAction<Partial<AuthState>>) {
			state.token = action.payload.token ?? state.token;
			state.user = action.payload.user ?? state.user;
		},
		clear_auth_session: () => initialState,
	},
});

export const { set_auth_session, clear_auth_session } = authSlice.actions;
export default authSlice.reducer;
