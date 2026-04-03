"use client";

import { useSetting } from "@/lib/settings";
import { ViewTransition, ViewTransitionProps } from "react";

interface CustomViewTransitionProps extends ViewTransitionProps {
    children: React.ReactNode;
}

export function CustomViewTransition({
    children,
    ...props
}: CustomViewTransitionProps) {
    const viewTransitions = useSetting("viewTransitions");

    if (!viewTransitions) {
        return <>{children}</>;
    }

    return <ViewTransition {...props}>{children}</ViewTransition>;
}
