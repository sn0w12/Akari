"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import * as React from "react";

const tabBarTriggerVariants = cva(
    "w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-xs transition-colors focus:outline-none border-t",
    {
        variants: {
            variant: {
                default: "text-muted-foreground hover:text-foreground",
            },
            active: {
                true: "border-primary text-foreground",
                false: "border-border",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

function TabBar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 bg-sidebar",
                className,
            )}
            {...props}
        />
    );
}

function TabBarList({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex h-14 items-center justify-around",
                className,
            )}
            {...props}
        />
    );
}

export interface TabBarTriggerProps
    extends
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof tabBarTriggerVariants> {
    href?: string;
    prefetch?: boolean | "auto" | null;
    active?: boolean;
}

function TabBarTrigger({
    className,
    variant,
    href,
    prefetch,
    active,
    children,
    ...props
}: TabBarTriggerProps) {
    const isActive = active ?? false;

    if (href) {
        return (
            <Link
                href={href}
                prefetch={prefetch}
                className={cn(
                    tabBarTriggerVariants({ variant, active: isActive }),
                    className,
                )}
            >
                {children}
            </Link>
        );
    }

    return (
        <button
            className={cn(
                tabBarTriggerVariants({ variant, active: isActive }),
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export { TabBar, TabBarList, TabBarTrigger, tabBarTriggerVariants };
