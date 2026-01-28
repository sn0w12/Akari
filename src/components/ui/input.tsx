import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ChevronDown, ChevronUp } from "lucide-react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className,
            )}
            {...props}
        />
    );
}

interface NumberInputProps extends React.ComponentProps<"input"> {
    wrapperClassName?: string;
}

function NumberInput({
    className,
    wrapperClassName,
    onChange,
    ...props
}: NumberInputProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleStepUp = () => {
        inputRef.current?.stepUp();
        const newValue = inputRef.current?.value;
        if (newValue !== undefined && onChange) {
            onChange({
                target: { value: newValue },
            } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const handleStepDown = () => {
        inputRef.current?.stepDown();
        const newValue = inputRef.current?.value;
        if (newValue !== undefined && onChange) {
            onChange({
                target: { value: newValue },
            } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    return (
        <div className={cn("relative", wrapperClassName)}>
            <Input
                ref={inputRef}
                {...props}
                onChange={onChange}
                type="number"
                className={cn("pr-8", className)}
            />
            <div className="absolute top-0 right-0 flex h-full flex-col">
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground h-1/2 px-2 py-0"
                    onClick={handleStepUp}
                >
                    <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground h-1/2 px-2 py-0"
                    onClick={handleStepDown}
                >
                    <ChevronDown className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}

export { Input, NumberInput };
