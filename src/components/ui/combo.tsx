import * as React from "react";

import { cn } from "@/lib/utils";

export interface ComboProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[]; // Define the options for the combo box
}

const Combo = React.forwardRef<HTMLSelectElement, ComboProps>(
    ({ className, options, ...props }, ref) => {
        return (
            <select
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                ref={ref}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    },
);
Combo.displayName = "Combo";

export { Combo };
