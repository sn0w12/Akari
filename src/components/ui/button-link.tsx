import * as React from "react";
import Link from "next/link";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

export interface ButtonLinkProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
        VariantProps<typeof buttonVariants> {
    href: string;
    prefetch?: boolean;
}

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
    ({ className, variant, size, href, prefetch, ...props }, ref) => {
        return (
            <Link
                href={href}
                prefetch={prefetch}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
ButtonLink.displayName = "ButtonLink";

export { ButtonLink };
