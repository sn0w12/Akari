import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
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
                "fixed bottom-0 left-0 right-0 z-50 bg-sidebar tabbar",
                className,
            )}
            {...props}
        />
    );
}

function TabBarList({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    return (
        <nav
            className={cn("flex h-14 items-center justify-around", className)}
            {...props}
        />
    );
}

export interface TabBarTriggerProps
    extends
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof tabBarTriggerVariants> {
    href?: string;
    active?: boolean;
}

function TabBarTrigger({
    className,
    variant,
    href,
    active,
    children,
    ...props
}: TabBarTriggerProps) {
    const isActive = active ?? false;

    if (href) {
        return (
            <Link
                to={href}
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
