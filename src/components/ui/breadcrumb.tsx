import { cn } from "@/lib/utils";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import type * as React from "react";

export function Breadcrumb({
    ...props
}: React.ComponentProps<"nav">): React.ReactElement {
    return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

export function BreadcrumbList({
    className,
    ...props
}: React.ComponentProps<"ol">): React.ReactElement {
    return (
        <ol
            className={cn(
                "wrap-break-word flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm",
                className,
            )}
            data-slot="breadcrumb-list"
            {...props}
        />
    );
}

export function BreadcrumbItem({
    className,
    ...props
}: React.ComponentProps<"li">): React.ReactElement {
    return (
        <li
            className={cn("inline-flex items-center gap-1.5", className)}
            data-slot="breadcrumb-item"
            {...props}
        />
    );
}

export function BreadcrumbLink({
    className,
    to,
    ...props
}: useRender.ComponentProps<typeof Link>): React.ReactElement {
    const defaultProps = {
        className: cn("transition-colors hover:text-foreground", className),
        "data-slot": "breadcrumb-link",
    };

    return useRender({
        props: mergeProps<typeof Link>(defaultProps, props),
        render: (renderProps) => <Link to={to} {...renderProps} />,
    });
}

export function BreadcrumbPage({
    className,
    ...props
}: React.ComponentProps<"span">): React.ReactElement {
    return (
        <span
            aria-current="page"
            className={cn("font-normal text-foreground", className)}
            data-slot="breadcrumb-page"
            {...props}
        />
    );
}

export function BreadcrumbSeparator({
    children,
    className,
    ...props
}: React.ComponentProps<"li">): React.ReactElement {
    return (
        <li
            aria-hidden="true"
            className={cn("opacity-80 [&>svg]:size-4", className)}
            data-slot="breadcrumb-separator"
            role="presentation"
            {...props}
        >
            {children ?? "/"}
        </li>
    );
}

export function BreadcrumbEllipsis({
    className,
    ...props
}: React.ComponentProps<"span">): React.ReactElement {
    return (
        <span
            aria-hidden="true"
            className={className}
            data-slot="breadcrumb-ellipsis"
            role="presentation"
            {...props}
        >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">More</span>
        </span>
    );
}
