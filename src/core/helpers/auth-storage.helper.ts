import type { AuthSession } from "#/core/services/auth.service";

const STORAGE_KEY = "handhub_auth";

export const readStoredSession = (): AuthSession | null => {
	if (typeof window === "undefined") return null;
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as AuthSession;
	} catch {
		return null;
	}
};

export const writeStoredSession = (session: AuthSession) => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(STORAGE_KEY);
};
