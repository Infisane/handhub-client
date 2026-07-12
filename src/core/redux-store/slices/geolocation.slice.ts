import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface GeolocationState {
	latitude: number | null;
	longitude: number | null;
	accuracy: number | null;
	status: "idle" | "loading" | "granted" | "denied" | "unavailable";
}

const initialState: GeolocationState = {
	latitude: null,
	longitude: null,
	accuracy: null,
	status: "idle",
};

const geolocationSlice = createSlice({
	name: "geolocationStore",
	initialState,
	reducers: {
		set_geolocation(state, action: PayloadAction<Partial<GeolocationState>>) {
			Object.assign(state, action.payload);
		},
		reset_geolocation: () => initialState,
	},
});

export const { set_geolocation, reset_geolocation } = geolocationSlice.actions;
export default geolocationSlice.reducer;
