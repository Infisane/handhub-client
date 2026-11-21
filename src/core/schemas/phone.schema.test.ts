import { describe, expect, it } from "vitest";
import { isValidPhone, PhoneSchema } from "./phone.schema";

describe("isValidPhone", () => {
	it.each([
		"+2348012345678",
		"08012345678",
		"2348012345678",
		"8012345678",
		"+234 812 345 6789",
		"0801-234-5678",
		"+14155552671",
		"+44 7911 123456",
		"+233241234567",
	])("accepts %s", (value) => {
		expect(isValidPhone(value)).toBe(true);
	});

	it.each([
		"",
		"abc",
		"08012345",
		"+2341",
		// A foreign number without its country code is ambiguous — the API rejects it too.
		"4155552671",
		"07911123456",
	])("rejects %p", (value) => {
		expect(isValidPhone(value)).toBe(false);
	});
});

describe("PhoneSchema", () => {
	it("tells the user how to enter a non-Nigerian number", () => {
		const result = PhoneSchema.safeParse("4155552671");
		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toContain(
			"+ and your country code",
		);
	});
});
