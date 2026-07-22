import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { readStoredSession } from "#/core/helpers/auth-storage.helper";

export const Route = createFileRoute("/_auth")({
	beforeLoad: () => {
		if (typeof window !== "undefined" && readStoredSession()) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: () => <Outlet />,
});
