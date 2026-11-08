// @vitest-environment jsdom
import { configureStore } from "@reduxjs/toolkit";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import authReducer from "#/core/redux-store/slices/auth.slice";
import { RatesTab } from "./rates-tab";

const { mutate, OPTIONS } = vi.hoisted(() => ({
	mutate: vi.fn(),
	OPTIONS: {
		days: [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday",
		],
		timeSlots: ["08:00", "09:00", "14:00", "17:00", "18:00"],
	},
}));

vi.mock("#/core/queries/settings.q", () => ({
	useUpdateUserProfileQuery: () => ({ mutate, isPending: false }),
}));
vi.mock("#/core/queries/artisan.q", () => ({
	useGetAvailabilityOptionsQuery: () => ({ data: OPTIONS }),
}));

// Shaped like the seeded providers: weekdays 08–18, Saturday 09–14 (a per-day schedule
// the single from/to editor can't represent — it must not be flattened unless edited).
const WEEKDAY = { from: "08:00", to: "18:00" };
const PROFILE = {
	id: "prov-1",
	minCharge: "3000.00",
	availability: {
		friday: WEEKDAY,
		monday: WEEKDAY,
		tuesday: WEEKDAY,
		saturday: { from: "09:00", to: "14:00" },
		thursday: WEEKDAY,
		wednesday: WEEKDAY,
	},
};
const WORKING_DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const mount = (providerProfile: unknown = PROFILE) => {
	const store = configureStore({
		reducer: { authStore: authReducer },
		preloadedState: {
			authStore: {
				token: "t",
				user: { userType: "provider", providerProfile } as never,
			},
		},
	});
	return render(
		<Provider store={store}>
			<RatesTab />
		</Provider>,
	);
};

const dayButton = (name: string) => screen.getByRole("button", { name });
const save = () =>
	fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
const minCharge = () =>
	screen.getByLabelText("Minimum charge (₦)") as HTMLInputElement;
const select = (label: string) =>
	screen.getByLabelText(label) as HTMLSelectElement;

describe("RatesTab (providers editing what onboarding collected)", () => {
	beforeEach(() => mutate.mockClear());
	afterEach(cleanup);

	it("prefills the minimum charge, working days and hours from the profile", () => {
		mount();
		expect(minCharge().value).toBe("3000");
		for (const day of WORKING_DAYS) {
			expect(dayButton(day.slice(0, 3)).getAttribute("aria-pressed")).toBe(
				"true",
			);
		}
		expect(dayButton("Sun").getAttribute("aria-pressed")).toBe("false");
		expect(select("Start time").value).toBe("08:00");
		expect(select("End time").value).toBe("18:00");
	});

	it("saving only a new minimum charge leaves the schedule out of the request, so a per-day schedule isn't flattened", () => {
		mount();
		fireEvent.change(minCharge(), { target: { value: "3500" } });
		save();
		expect(mutate).toHaveBeenCalledTimes(1);
		expect(mutate).toHaveBeenCalledWith({ minCharge: 3500 });
	});

	it("sends the edited hours for every selected day", () => {
		mount();
		fireEvent.change(select("Start time"), { target: { value: "09:00" } });
		fireEvent.change(select("End time"), { target: { value: "17:00" } });
		save();
		expect(mutate).toHaveBeenCalledWith({
			minCharge: 3000,
			availability: Object.fromEntries(
				WORKING_DAYS.map((d) => [d, ["09:00-17:00"]]),
			),
		});
	});

	it("clears the schedule when every day is deselected", () => {
		mount();
		for (const day of WORKING_DAYS) fireEvent.click(dayButton(day.slice(0, 3)));
		save();
		expect(mutate).toHaveBeenCalledWith({ minCharge: 3000, availability: {} });
	});

	it("rejects an empty or non-whole-number minimum charge without calling the API", () => {
		mount();
		fireEvent.change(minCharge(), { target: { value: "" } });
		save();
		expect(screen.getByText("Minimum charge is required")).toBeTruthy();

		fireEvent.change(minCharge(), { target: { value: "12.5" } });
		save();
		expect(screen.getByText("Enter a whole number, e.g. 5000")).toBeTruthy();
		expect(mutate).not.toHaveBeenCalled();
	});

	it("points providers who haven't onboarded to onboarding instead of showing a form", () => {
		mount(null);
		expect(screen.getByText(/finish your artisan onboarding/i)).toBeTruthy();
		expect(screen.queryByLabelText("Minimum charge (₦)")).toBeNull();
	});
});
