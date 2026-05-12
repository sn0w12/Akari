import type { LinkProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

export interface ButtonLinkProps
    extends Omit<LinkProps, "children" | "className">,
        VariantProps<typeof buttonVariants> {
    href?: string;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
    (
        {
            className,
            variant,
            size,
            disabled,
            children,
            href,
            to: toProp,
            style,
            ...props
        },
        ref,
    ) => {
        const to = (href ?? toProp) as LinkProps["to"];

        if (disabled) {
            return (
                <span
                    className={cn(
                        buttonVariants({ variant, size, className }),
                        "pointer-events-none opacity-50",
                    )}
                    aria-disabled={true}
                    ref={ref as React.Ref<HTMLSpanElement>}
                    style={style}
                >
                    {children}
                </span>
            );
        }

        return (
            <Link
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                to={to}
                style={style}
                {...(props as LinkProps)}
            >
                {children}
            </Link>
        );
    },
);
ButtonLink.displayName = "ButtonLink";

export { ButtonLink };
