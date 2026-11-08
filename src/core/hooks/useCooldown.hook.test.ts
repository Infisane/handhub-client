// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCooldown } from "./useCooldown.hook";

describe("useCooldown", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("is ready (0) until started", () => {
		const { result } = renderHook(() => useCooldown(30));
		expect(result.current.remaining).toBe(0);
	});

	it("counts down from the full duration to 0, then stays ready", () => {
		const { result } = renderHook(() => useCooldown(30));
		act(() => result.current.start());
		expect(result.current.remaining).toBe(30);
		act(() => vi.advanceTimersByTime(10_000));
		expect(result.current.remaining).toBe(20);
		act(() => vi.advanceTimersByTime(20_000));
		expect(result.current.remaining).toBe(0);
		act(() => vi.advanceTimersByTime(5_000));
		expect(result.current.remaining).toBe(0);
	});

	it("restarts the full duration when started again", () => {
		const { result } = renderHook(() => useCooldown(30));
		act(() => result.current.start());
		act(() => vi.advanceTimersByTime(25_000));
		act(() => result.current.start());
		expect(result.current.remaining).toBe(30);
	});
});
