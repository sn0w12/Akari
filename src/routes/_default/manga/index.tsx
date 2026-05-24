import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_default/manga/")({
    loader: () => {
        throw redirect({ to: "/" });
    },
    component: () => null,
});
