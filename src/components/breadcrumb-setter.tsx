import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { useEffect } from "react";

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
