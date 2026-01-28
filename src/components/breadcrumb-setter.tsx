"use client";

import { useEffect } from "react";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";

interface BreadcrumbSetterProps {
    orig: string;
    title: string;
}

export function BreadcrumbSetter({ orig, title }: BreadcrumbSetterProps) {
    const { setOverride, clearOverride } = useBreadcrumb();

    useEffect(() => {
        setOverride(orig, title);
        return () => clearOverride(orig);
    }, [orig, title, setOverride, clearOverride]);

    return null;
}
