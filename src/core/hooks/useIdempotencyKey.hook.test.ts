// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useIdempotencyKey } from "./useIdempotencyKey.hook";

describe("useIdempotencyKey", () => {
	it("returns the same key for a retry of an identical payload", () => {
		const { result } = renderHook(() => useIdempotencyKey());
		const first = result.current.keyFor({ amount: 5000 });
		expect(result.current.keyFor({ amount: 5000 })).toBe(first);
	});

	it("issues a new key when the payload changes, so an edited amount never replays the old one", () => {
		const { result } = renderHook(() => useIdempotencyKey());
		const first = result.current.keyFor({ amount: 5000 });
		expect(result.current.keyFor({ amount: 6000 })).not.toBe(first);
	});

	it("issues a new key after reset", () => {
		const { result } = renderHook(() => useIdempotencyKey());
		const first = result.current.keyFor({ amount: 5000 });
		result.current.reset();
		expect(result.current.keyFor({ amount: 5000 })).not.toBe(first);
	});
});
