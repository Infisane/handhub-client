// @vitest-environment jsdom
import { isRedirect } from "@tanstack/react-router";
import { beforeEach, describe, expect, it } from "vitest";
import type { AuthUser } from "#/core/types/auth.types";
import { Route as MyAreaRoute } from "#/routes/dashboard/my-area";
import { clearStoredSession, writeStoredSession } from "./auth-storage.helper";

const signInAs = (userType: AuthUser["userType"]) =>
	writeStoredSession({ token: "t", user: { userType } as AuthUser });

/** Runs the route's beforeLoad guard; returns the redirect target, or null if it lets you through. */
const redirectedTo = (): string | null => {
	try {
		MyAreaRoute.options.beforeLoad?.({} as never);
		return null;
	} catch (e) {
		if (isRedirect(e)) return e.options.to as string;
		throw e;
	}
};

describe("/dashboard/my-area guard (BUG-011 / BUG-014)", () => {
	beforeEach(() => clearStoredSession());

	it("sends a customer back to /dashboard", () => {
		signInAs("customer");
		expect(redirectedTo()).toBe("/dashboard");
	});

	it("lets a provider through", () => {
		signInAs("provider");
		expect(redirectedTo()).toBeNull();
	});

	it("sends a signed-out visitor to /dashboard (whose own guard then sends them to /signin)", () => {
		expect(redirectedTo()).toBe("/dashboard");
	});
});
