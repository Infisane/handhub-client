import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
	FLUSH,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
	REHYDRATE,
	persistReducer,
	persistStore,
} from "redux-persist";
import authReducer from "./slices/auth.slice";
import dashboardReducer from "./slices/dashboard.slice";

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
	whitelist: ["authStore"],
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

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
