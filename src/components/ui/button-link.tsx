import { Link } from "@tanstack/react-router";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { mergeProps, useRender } from "@base-ui/react";
import { buttonVariants } from "./button";
import { Spinner } from "./spinner";

export interface ButtonLinkProps extends useRender.ComponentProps<typeof Link> {
    variant?: VariantProps<typeof buttonVariants>["variant"];
    size?: VariantProps<typeof buttonVariants>["size"];
    loading?: boolean;
}

export function ButtonLink({
    to,
    className,
    variant,
    size,
    render,
    children,
    loading = false,
    disabled: disabledProp,
    ...props
}: ButtonLinkProps): React.ReactElement {
    const isDisabled: boolean = Boolean(loading || disabledProp);
    const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
        render ? undefined : "button";

    const defaultProps = {
        children: (
            <>
                {children}
                {loading && (
                    <Spinner
                        className="pointer-events-none absolute"
                        data-slot="button-loading-indicator"
                    />
                )}
            </>
        ),
        className: cn(buttonVariants({ className, size, variant })),
        "aria-disabled": loading || undefined,
        "data-loading": loading ? "" : undefined,
        "data-slot": "button",
        disabled: isDisabled,
        type: typeValue,
    };

    return useRender({
        props: mergeProps<typeof Link>(defaultProps, props),
        render: (renderProps) => <Link to={to} {...renderProps} />,
    });
}
