import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    id?: string;
    ref?: React.Ref<HTMLInputElement>;
}

function ColorPicker({
    disabled,
    value,
    onChange,
    onBlur,
    name,
    className,
    id,
    ref,
    ...props
}: Omit<ButtonProps, "value" | "onChange" | "onBlur"> & ColorPickerProps) {
    const [open, setOpen] = useState(false);

    const parsedValue = useMemo(() => {
        return value || "#FFFFFF";
    }, [value]);

    return (
        <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger
                render={
                    <Button
                        {...props}
                        id={id}
                        className={cn("block", className)}
                        name={name}
                        onClick={() => {
                            setOpen(true);
                        }}
                        size="icon"
                        style={{
                            backgroundColor: parsedValue,
                        }}
                        variant="outline"
                    />
                }
                disabled={disabled}
                onBlur={onBlur}
            >
                <div />
            </PopoverTrigger>
            <PopoverContent className="w-full">
                <HexColorPicker
                    color={parsedValue}
                    onChange={onChange}
                    style={{ width: "100%" }}
                />
                <Input
                    maxLength={7}
                    onChange={(e) => {
                        onChange(e?.currentTarget?.value);
                    }}
                    ref={ref}
                    className="mt-2 w-full"
                    value={parsedValue}
                />
            </PopoverContent>
        </Popover>
    );
}

export { ColorPicker };
