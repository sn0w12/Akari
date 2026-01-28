import { type VariantProps } from "class-variance-authority";
import Link from "next/link";
import * as React from "react";

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
                <span
                    className={cn(
                        buttonVariants({ variant, size, className }),
                        "pointer-events-none opacity-50",
                    )}
                    aria-disabled={true}
                    ref={ref as React.Ref<HTMLSpanElement>}
                    {...props}
                >
                    {props.children}
                </span>
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
