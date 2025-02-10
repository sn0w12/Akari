"use client";

import { useRouter } from "next/navigation";
import Link, { LinkProps } from "next/link";
import React, { useCallback, useRef, useEffect } from "react";
import { initializeScrollListener, scrollState } from "@/lib/scrollUtils";

interface HoverLinkProps extends LinkProps {
    children: React.ReactNode;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    rel?: string;
    prefetch?: boolean;
    delayMs?: number;
}

export default function HoverLink({
    children,
    prefetch = false,
    delayMs = 75,
    ...props
}: HoverLinkProps) {
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        return initializeScrollListener();
    }, []);

    const handleMouseEnter = useCallback(() => {
        timeoutRef.current = setTimeout(() => {
            if (!scrollState.isScrolling) {
                router.prefetch(props.href.toString());
            }
        }, delayMs);
    }, [router, props.href, delayMs]);

    const handleMouseLeave = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    return (
        <Link
            prefetch={prefetch}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {children}
        </Link>
    );
}
