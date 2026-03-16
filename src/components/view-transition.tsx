"use client";

import { useDevice } from "@/contexts/device-context";
import { useMemo, ViewTransition, ViewTransitionProps } from "react";

interface CustomViewTransitionProps extends ViewTransitionProps {
    children: React.ReactNode;
}

export function CustomViewTransition({
    children,
    ...props
}: CustomViewTransitionProps) {
    const { os, isPWA } = useDevice();
    const enabled = useMemo(() => {
        if (os === "iOS" || isPWA) {
            return false;
        }

        return true;
    }, [os, isPWA]);

    if (enabled) {
        return <ViewTransition {...props}>{children}</ViewTransition>;
    }

    return <>{children}</>;
}
