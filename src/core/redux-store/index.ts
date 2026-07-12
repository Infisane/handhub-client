import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
	FLUSH,
	PAUSE,
	PERSIST,
	PURGE,
	persistReducer,
	persistStore,
	REGISTER,
	REHYDRATE,
} from "redux-persist";
import authReducer from "./slices/auth.slice";
import dashboardReducer from "./slices/dashboard.slice";
import geolocationReducer from "./slices/geolocation.slice";
import onboardingReducer from "./slices/onboarding.slice";

// SSR-safe storage: Cloudflare Workers don't have localStorage.
// On the server this is a no-op; redux-persist only rehydrates on the client.
const storage = {
	getItem: (key: string) =>
		typeof window !== "undefined"
			? Promise.resolve(window.localStorage.getItem(key))
			: Promise.resolve(null),
	setItem: (key: string, value: string) => {
		if (typeof window !== "undefined") window.localStorage.setItem(key, value);
		return Promise.resolve();
	},
	removeItem: (key: string) => {
		if (typeof window !== "undefined") window.localStorage.removeItem(key);
		return Promise.resolve();
	},
};

const appReducer = combineReducers({
	authStore: authReducer,
	dashboardStore: dashboardReducer,
	geolocationStore: geolocationReducer,
	onboardingStore: onboardingReducer,
});

type AppReducerState = ReturnType<typeof appReducer>;

const rootReducer = (
	state: AppReducerState | undefined,
	action: { type: string },
) => {
	if (action.type === "RESET_STORE") {
		return appReducer(undefined, action as Parameters<typeof appReducer>[1]);
	}
	return appReducer(state, action as Parameters<typeof appReducer>[1]);
};

const persistConfig = {
	key: "handhub",
	storage,
	whitelist: ["authStore", "geolocationStore"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

// redux-persist's persistStore dispatches PERSIST, whose persistoid schedules a
// setTimeout — a disallowed global-scope operation on Cloudflare Workers. It also
// only rehydrates in the browser, so only create the persistor on the client.
export const persistor =
	typeof window !== "undefined" ? persistStore(store) : null;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
