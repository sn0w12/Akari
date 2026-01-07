import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient } from "@tanstack/react-query";

export function createRouter() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
                refetchOnWindowFocus: false,
            },
        },
    });

    return createTanStackRouter({
        routeTree,
        context: {
            queryClient,
        },
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
    });
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof createRouter>;
    }
}
