import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { NotFound } from "./components/not-found";
import { ErrorHandler } from "./core/helpers/error-handler.helper";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { refetchOnWindowFocus: "always" },
		},
		queryCache: new QueryCache({
			onError: (error) => ErrorHandler.parser(error),
		}),
		mutationCache: new MutationCache({
			onError: (error) => ErrorHandler.parser(error),
		}),
	});

	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: NotFound,
		context: { queryClient },
	});

	setupRouterSsrQueryIntegration({ router, queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
