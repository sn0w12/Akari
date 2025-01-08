"use client";

import { useRouter } from "next/navigation";
import Link, { LinkProps } from "next/link";
import React, { useCallback, useRef, useState, useEffect } from "react";

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
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                setIsScrolling(false);
            }, 150);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    const handleMouseEnter = useCallback(() => {
        timeoutRef.current = setTimeout(() => {
            if (!isScrolling) {
                router.prefetch(props.href.toString());
            }
        }, delayMs);
    }, [router, props.href, delayMs, isScrolling]);

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
