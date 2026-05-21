import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
    const router = createRouter({
        routeTree,
        scrollRestoration: true,
        scrollToTopSelectors: ["#scroll-element"],
        defaultPreload: "intent",
        defaultNotFoundComponent: () => <p>Page not found</p>,
    });
    return router;
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }
}
