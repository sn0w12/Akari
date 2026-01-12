import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "bg-destructive/70 border border-destructive text-white hover:bg-destructive/90",
                outline: "text-foreground",
                shadow: "relative hover:translate-y-[-2px] transition-transform duration-200",
                positive: "border-transparent bg-accent-positive text-white",
                info: "border-transparent bg-info text-white",
                warning: "border-transparent bg-warning text-white",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

export interface BadgeProps
    extends
        React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {
    withShadow?: boolean;
    shadowClassName?: string;
}

function Badge({
    className,
    variant,
    withShadow = false,
    shadowClassName,
    ...props
}: BadgeProps) {
    if (withShadow) {
        return (
            <div className="relative inline-block group">
                <div
                    className={cn(
                        badgeVariants({ variant }),
                        "relative z-10 hover:bg-primary",
                        className,
                    )}
                    {...props}
                />
                <div
                    className={cn(
                        badgeVariants({ variant }),
                        "bg-accent-positive text-transparent absolute top-0 left-0 z-0 scale-90",
                        "group-hover:translate-x-[3px] group-hover:translate-y-[3px] group-hover:scale-100",
                        "transition-all duration-200 pointer-events-none",
                        shadowClassName ?? className,
                    )}
                    {...props}
                />
            </div>
        );
    }

    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
