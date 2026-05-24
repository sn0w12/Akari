import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

type TransitionRouteNode = {
    segment: AllSegments;
    children?: readonly TransitionRouteNode[];
};

const TRANSITION_ROUTE_TREE = [
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
] as const;

type ExtractSegments<T> = T extends readonly (infer U)[]
    ? ExtractSegments<U> // handle arrays
    : T extends { segment: infer S; children?: infer C }
      ? S extends string
          ? (C extends readonly unknown[] ? ExtractSegments<C> : never) | S
          : never
      : never;

type AllSegments = ExtractSegments<typeof TRANSITION_ROUTE_TREE>;

const LOW_LAYER_ROOT_SEGMENTS = new Set(["popular", "settings", "account"]);

function normalizePath(pathname: string): string {
    const normalizedPath = pathname.replace(/\/+$/, "");
    return normalizedPath === "" ? "/" : normalizedPath;
}

function getTransitionLayer(pathname: string): {
    layer: number;
    segment: AllSegments | null;
} {
    const normalizedPath = normalizePath(pathname);

    if (normalizedPath === "/") {
        return { layer: 1, segment: null };
    }

    const segments = normalizedPath.split("/").filter(Boolean) as AllSegments[];

    if (segments.length === 1 && LOW_LAYER_ROOT_SEGMENTS.has(segments[0])) {
        return { layer: 0, segment: segments[0] };
    }

    function walk(
        nodes: readonly TransitionRouteNode[],
        index: number,
    ): AllSegments | null {
        if (index >= segments.length) {
            return null;
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
                return node.segment;
            }

            if (!node.children) {
                return node.segment;
            }

            const childSegment = walk(node.children, index + 1);
            if (childSegment) {
                return childSegment;
            }

            return node.segment;
        }

        return null;
    }

    const segment = walk(TRANSITION_ROUTE_TREE, 0);

    return {
        layer: segment ? segments.length + 1 : 1,
        segment,
    };
}

// Key = simulated deeper in stack, Value = simulated shallower in stack
const LAYER_COLLISION_RESOLVE: Partial<Record<AllSegments, AllSegments[]>> = {
    ":mangaId": [":listId", ":userId", ":authorId", ":genreId"],
    ":listId": [":userId"],
};

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
                if (fromLayer.layer === toLayer.layer) {
                    if (fromLayer.segment && toLayer.segment) {
                        const fromCollisionTargets =
                            LAYER_COLLISION_RESOLVE[fromLayer.segment];
                        if (fromCollisionTargets?.includes(toLayer.segment)) {
                            return ["slide-right"];
                        }

                        const toCollisionTargets =
                            LAYER_COLLISION_RESOLVE[toLayer.segment];
                        if (toCollisionTargets?.includes(fromLayer.segment)) {
                            return ["slide-left"];
                        }
                    }

                    return ["blur"];
                }

                const direction =
                    toLayer.layer > fromLayer.layer ? "left" : "right";
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
