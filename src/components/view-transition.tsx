"use client";

import { useSetting } from "@/lib/settings";

export function CustomViewTransition({ children }: { children: React.ReactNode }) {
    const viewTransitions = useSetting("viewTransitions");

    if (!viewTransitions) {
        return <>{children}</>;
    }

    return <>{children}</>;
}
