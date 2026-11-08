// @vitest-environment jsdom
import { configureStore } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useGeolocated } from "react-geolocated";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import geolocationReducer from "#/core/redux-store/slices/geolocation.slice";
import { useUserLocation } from "./useUserLocation.hook";

vi.mock("react-geolocated", () => ({ useGeolocated: vi.fn() }));

// What redux-persist hands back from localStorage after a previous session.
const PERSISTED = {
	latitude: 6.5,
	longitude: 3.3,
	accuracy: 20,
	status: "granted" as const,
};
const NO_COORDS = { latitude: null, longitude: null, accuracy: null };

/** Mounts the hook against a store seeded with PERSISTED and returns the resulting state. */
const mountWith = (geo: object) => {
	vi.mocked(useGeolocated).mockReturnValue({
		coords: undefined,
		isGeolocationAvailable: true,
		positionError: undefined,
		getPosition: vi.fn(),
		...geo,
	} as never);
	const store = configureStore({
		reducer: { geolocationStore: geolocationReducer },
		preloadedState: { geolocationStore: PERSISTED },
	});
	renderHook(() => useUserLocation(), {
		wrapper: ({ children }: { children: ReactNode }) =>
			createElement(Provider, { store, children }),
	});
	return store.getState().geolocationStore;
};

describe("useUserLocation vs coordinates persisted from an earlier session (BUG-012)", () => {
	it("drops them while the browser is still asking for permission", () => {
		expect(mountWith({})).toEqual({ ...NO_COORDS, status: "loading" });
	});

	it("drops them when permission is denied", () => {
		const positionError = { code: 1, PERMISSION_DENIED: 1 };
		expect(mountWith({ positionError })).toEqual({
			...NO_COORDS,
			status: "denied",
		});
	});

	it("drops them when geolocation is unavailable", () => {
		expect(mountWith({ isGeolocationAvailable: false })).toEqual({
			...NO_COORDS,
			status: "unavailable",
		});
	});

	it("replaces them with the live fix once granted", () => {
		const coords = { latitude: 9.07, longitude: 7.47, accuracy: 5 };
		expect(mountWith({ coords })).toEqual({ ...coords, status: "granted" });
	});
});
