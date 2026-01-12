import * as React from "react";
import Link from "next/link";
import { Button } from "./button";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

export interface ButtonLinkProps
    extends
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        VariantProps<typeof buttonVariants> {
    href: string;
    prefetch?: boolean;
    disabled?: boolean;
}

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
    ({ className, variant, size, href, prefetch, disabled, ...props }, ref) => {
        if (disabled) {
            return (
                <Button
                    variant={variant}
                    size={size}
                    className={className}
                    disabled
                >
                    {props.children}
                </Button>
            );
        }

        return (
            <Link
                href={href}
                prefetch={prefetch}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    },
);
ButtonLink.displayName = "ButtonLink";

export { ButtonLink };
