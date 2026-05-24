import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import {
    selectTriggerIconClassName,
    selectTriggerVariants,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";

function NativeSelect({
    className,
    size = "default",
    ...props
}: Omit<React.ComponentProps<"select">, "size"> & {
    size?: VariantProps<typeof selectTriggerVariants>["size"];
}) {
    return (
        <div
            className="group/native-select relative has-[select:disabled]:opacity-50"
            data-slot="native-select-wrapper"
        >
            <select
                data-slot="native-select"
                className={cn(
                    selectTriggerVariants({ size }),
                    "appearance-none",
                    className,
                )}
                {...props}
            />
            <ChevronDownIcon
                className={cn(
                    selectTriggerIconClassName,
                    "text-muted-foreground pointer-events-none absolute top-1/2 -translate-y-1/2 select-none right-3",
                )}
                aria-hidden="true"
                data-slot="native-select-icon"
            />
        </div>
    );
}

function NativeSelectOption({ ...props }: React.ComponentProps<"option">) {
    return <option data-slot="native-select-option" {...props} />;
}

function NativeSelectOptGroup({
    className,
    ...props
}: React.ComponentProps<"optgroup">) {
    return (
        <optgroup
            data-slot="native-select-optgroup"
            className={cn(className)}
            {...props}
        />
    );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
