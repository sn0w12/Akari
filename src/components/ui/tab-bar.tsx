import { cn } from "@/lib/utils";
import { useRender } from "@base-ui/react/use-render";
import { Link } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Card } from "./card";
import { Button } from "./button";
import { ButtonGroup } from "./group";

const tabBarTriggerVariants = cva(
    "w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-xs transition-colors focus:outline-none rounded-lg",
    {
        variants: {
            variant: {
                default: "text-muted-foreground hover:text-foreground",
            },
            active: {
                true: "border-primary text-foreground bg-sidebar-accent",
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
                "block md:hidden fixed bottom-0 left-0 right-0 z-50 tabbar py-4 px-6",
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
        <Card
            className={cn(
                "flex flex-row h-14 items-center justify-around bg-sidebar mb-[var(--safe-bottom)]",
                className,
            )}
            render={<nav />}
            {...props}
        />
    );
}

export interface TabBarTriggerProps
    extends
        VariantProps<typeof tabBarTriggerVariants>,
        useRender.ComponentProps<typeof Link> {
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

    const content = href ? (
        <Link
            to={href}
            className={cn(
                tabBarTriggerVariants({ variant, active: isActive }),
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    ) : (
        <button
            className={cn(
                tabBarTriggerVariants({ variant, active: isActive }),
                className,
            )}
            {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
            {children as React.ReactNode}
        </button>
    );

    return <div className="p-2">{content}</div>;
}

function TabBarAdditionList({
    className,
    ...props
}: React.ComponentProps<typeof ButtonGroup>) {
    return (
        <div
            className={cn(
                "flex md:hidden flex-row fixed bottom-15 left-0 right-0 z-40 tabbar py-4 px-9 items-center justify-end tabbar-addition-list mb-[var(--safe-bottom)]",
                className,
            )}
        >
            <ButtonGroup
                className="rounded-3xl bg-sidebar [&_button:last-child]:pr-3.5 [&_button:first-child]:pl-3.5"
                orientation="horizontal"
                {...props}
            />
        </div>
    );
}

function TabBarAdditionTrigger({
    className,
    ...props
}: React.ComponentProps<typeof Button>) {
    return (
        <Button
            size="pill"
            variant="outline"
            className={className}
            {...props}
        />
    );
}

export {
    TabBar,
    TabBarList,
    TabBarTrigger,
    TabBarAdditionList,
    TabBarAdditionTrigger,
    tabBarTriggerVariants,
};
