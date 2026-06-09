/**
 * Lightweight current-user / role helpers.
 *
 * This app has no auth backend yet, so role + onboarding state live in
 * localStorage. Swap the bodies of these functions for your real auth/session
 * source when it lands — the call sites won't need to change.
 */

export type UserRole = "customer" | "artisan";

const ROLE_KEY = "hh_role";
const ARTISAN_ONBOARDED_KEY = "hh_artisan_onboarded";

/**
 * The current user's role. Defaults to "artisan" in this prototype so the
 * artisan experience (incl. onboarding) is visible out of the box. Set
 * `localStorage.hh_role = "customer"` to preview the customer view.
 */
export function getUserRole(): UserRole {
	if (typeof window === "undefined") return "artisan";
	const stored = window.localStorage.getItem(ROLE_KEY);
	return stored === "customer" || stored === "artisan" ? stored : "artisan";
}

export function setUserRole(role: UserRole): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(ROLE_KEY, role);
}

export function isArtisan(): boolean {
	return getUserRole() === "artisan";
}

/** Whether the artisan has finished (or skipped) the onboarding wizard. */
export function hasCompletedArtisanOnboarding(): boolean {
	if (typeof window === "undefined") return true;
	return window.localStorage.getItem(ARTISAN_ONBOARDED_KEY) === "true";
}

export function completeArtisanOnboarding(): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(ARTISAN_ONBOARDED_KEY, "true");
}

/** Clears the onboarding flag — handy for re-testing the flow. */
export function resetArtisanOnboarding(): void {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(ARTISAN_ONBOARDED_KEY);
}
