"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Tree root component.
 */
export function Tree({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLUListElement>) {
    return (
        <ul
            role="tree"
            className={cn("m-0 list-none space-y-0.5 p-0", className)}
            {...props}
        >
            {children}
        </ul>
    );
}

/**
 * TreeItem props.
 */
export interface TreeItemProps extends React.HTMLAttributes<HTMLLIElement> {
    label: React.ReactNode;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    children?: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
}

/**
 * TreeItem component.
 */
export function TreeItem({
    label,
    collapsible = false,
    defaultCollapsed = false,
    children,
    className,
    onClick,
    active,
    ...props
}: TreeItemProps) {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
    const hasChildren = React.Children.count(children) > 0;
    const showCollapse = collapsible && hasChildren;

    return (
        <li
            role="treeitem"
            aria-expanded={showCollapse ? !collapsed : undefined}
            aria-selected={active ? "true" : "false"}
            className={cn("flex flex-col", className)}
            {...props}
        >
            <div
                className={cn(
                    "flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 transition-colors",
                    "text-sm",
                    active
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "hover:bg-muted hover:text-foreground",
                    collapsible && "pl-0",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
                )}
                tabIndex={0}
                onClick={onClick}
                onKeyDown={(e) => {
                    if (onClick && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        onClick();
                    }
                }}
                role="button"
                aria-pressed={active}
            >
                {showCollapse ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={collapsed ? "Expand" : "Collapse"}
                        onClick={(e) => {
                            e.stopPropagation();
                            setCollapsed((c) => !c);
                        }}
                        tabIndex={-1}
                        className={cn("h-4 w-4 min-w-0 shrink-0 rounded p-0")}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-3 w-3" />
                        ) : (
                            <ChevronDown className="h-3 w-3" />
                        )}
                    </Button>
                ) : null}
                <span className="truncate">{label}</span>
            </div>
            {hasChildren && !collapsed ? (
                <TreeChildren>{children}</TreeChildren>
            ) : null}
        </li>
    );
}

/**
 * TreeChildren: wrapper for nested tree items.
 */
export function TreeChildren({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLUListElement>) {
    return (
        <ul
            role="group"
            className={cn(
                "border-muted mt-0.5 ml-2 space-y-0.5 border-l pl-2",
                className
            )}
            {...props}
        >
            {children}
        </ul>
    );
}
