import { describe, expect, it } from "vitest";
import { HelperMethods } from "./methods.helper";

const DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

describe("HelperMethods.parseAvailability", () => {
	it("reads what onboarding writes: capitalised day → ['from-to']", () => {
		expect(
			HelperMethods.parseAvailability({ Saturday: ["07:00-09:00"] }, DAYS),
		).toEqual({ days: ["Saturday"], from: "07:00", to: "09:00" });
	});

	it("reads seed/older data: lowercase day → { from, to }, returning days in week order", () => {
		const stored = {
			friday: { from: "08:00", to: "18:00" },
			monday: { from: "08:00", to: "18:00" },
		};
		expect(HelperMethods.parseAvailability(stored, DAYS)).toEqual({
			days: ["Monday", "Friday"],
			from: "08:00",
			to: "18:00",
		});
	});

	it("keeps a day that has no hours, with an empty range", () => {
		expect(HelperMethods.parseAvailability({ Monday: [] }, DAYS)).toEqual({
			days: ["Monday"],
			from: "",
			to: "",
		});
	});

	it("returns an empty schedule for null/empty input and ignores unknown day keys", () => {
		const empty = { days: [], from: "", to: "" };
		expect(HelperMethods.parseAvailability(null, DAYS)).toEqual(empty);
		expect(HelperMethods.parseAvailability({}, DAYS)).toEqual(empty);
		expect(
			HelperMethods.parseAvailability({ Funday: ["08:00-09:00"] }, DAYS).days,
		).toEqual([]);
	});

	it("round-trips with buildAvailabilityPayload", () => {
		const payload = HelperMethods.buildAvailabilityPayload(
			["Tuesday", "Thursday"],
			"09:00",
			"17:00",
		);
		expect(HelperMethods.parseAvailability(payload, DAYS)).toEqual({
			days: ["Tuesday", "Thursday"],
			from: "09:00",
			to: "17:00",
		});
	});
});

describe("HelperMethods.formatTime", () => {
	it("formats hours as 12-hour clock times", () => {
		expect(HelperMethods.formatTime("06:00")).toBe("6:00 AM");
		expect(HelperMethods.formatTime("12:00")).toBe("12:00 PM");
		expect(HelperMethods.formatTime("18:00")).toBe("6:00 PM");
	});
});
