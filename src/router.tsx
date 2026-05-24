import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

type TransitionRouteNode = {
    segment: string;
    children?: TransitionRouteNode[];
};

const TRANSITION_ROUTE_TREE: TransitionRouteNode[] = [
    { segment: "auth" },
    { segment: "about" },
    { segment: "bookmarks" },
    { segment: "latest" },
    { segment: "popular" },
    { segment: "search" },
    { segment: "settings" },
    { segment: "privacy" },
    { segment: "terms" },
    {
        segment: "account",
        children: [{ segment: "setup" }],
    },
    {
        segment: "author",
        children: [{ segment: ":authorId" }],
    },
    {
        segment: "genre",
        children: [{ segment: ":genreId" }],
    },
    {
        segment: "lists",
        children: [{ segment: ":listId" }],
    },
    {
        segment: "manga",
        children: [
            {
                segment: ":mangaId",
                children: [
                    {
                        segment: ":scanlator",
                        children: [
                            {
                                segment: ":subId",
                                children: [{ segment: "comments" }],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        segment: "sync",
        children: [
            {
                segment: "ani",
            },
            {
                segment: "mal",
            },
        ],
    },
    {
        segment: "user",
        children: [{ segment: ":userId" }],
    },
    {
        segment: "dev",
        children: [{ segment: "toast" }],
    },
];

const LOW_LAYER_ROOT_SEGMENTS = new Set(["popular", "settings", "account"]);

function normalizePath(pathname: string): string {
    const normalizedPath = pathname.replace(/\/+$/, "");
    return normalizedPath === "" ? "/" : normalizedPath;
}

function getTransitionLayer(pathname: string): number {
    const normalizedPath = normalizePath(pathname);

    if (normalizedPath === "/") {
        return 1;
    }

    const segments = normalizedPath.split("/").filter(Boolean);

    if (segments.length === 1 && LOW_LAYER_ROOT_SEGMENTS.has(segments[0])) {
        return 0;
    }

    function walk(nodes: TransitionRouteNode[], index: number): number {
        if (index >= segments.length) {
            return index;
        }

        const segment = segments[index];
        const orderedNodes = [
            ...nodes.filter((node) => !node.segment.startsWith(":")),
            ...nodes.filter((node) => node.segment.startsWith(":")),
        ];

        for (const node of orderedNodes) {
            const isDynamicSegment = node.segment.startsWith(":");

            if (!isDynamicSegment && node.segment !== segment) {
                continue;
            }

            if (index === segments.length - 1) {
                return index + 1;
            }

            if (!node.children) {
                return index + 1;
            }

            return walk(node.children, index + 1);
        }

        return segments.length;
    }

    return walk(TRANSITION_ROUTE_TREE, 0) + 1;
}

export function getRouter() {
    const router = createRouter({
        routeTree,
        scrollRestoration: true,
        scrollToTopSelectors: ["#scroll-element"],
        defaultPreload: "intent",
        defaultNotFoundComponent: () => <p>Page not found</p>,
        defaultViewTransition: {
            types: ({ fromLocation, toLocation }) => {
                if (!fromLocation) {
                    return [];
                }
                if (fromLocation.pathname === toLocation.pathname) {
                    const fromPage = fromLocation.searchStr
                        .substring(1)
                        .split("&")
                        .find((param) => param.startsWith("page="));
                    const toPage = toLocation.searchStr
                        .substring(1)
                        .split("&")
                        .find((param) => param.startsWith("page="));

                    if (fromPage && toPage) {
                        const fromPageNum = parseInt(
                            fromPage.split("=")[1],
                            10,
                        );
                        const toPageNum = parseInt(toPage.split("=")[1], 10);

                        if (fromPageNum !== toPageNum) {
                            return [
                                `slide-${toPageNum > fromPageNum ? "left" : "right"}`,
                            ];
                        }
                    }

                    if (toPage) {
                        return [`slide-left`];
                    }

                    return [];
                }

                const fromLayer = getTransitionLayer(fromLocation.pathname);
                const toLayer = getTransitionLayer(toLocation.pathname);
                const direction = toLayer > fromLayer ? "left" : "right";

                return [`slide-${direction}`];
            },
        },
    });
    return router;
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }
}
