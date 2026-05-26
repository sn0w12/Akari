import { cn } from "@/lib/utils";
import { Menu as DropdownMenuPrimitive } from "@base-ui/react/menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import type React from "react";

function DropdownMenu(props: DropdownMenuPrimitive.Root.Props<unknown>) {
    return <DropdownMenuPrimitive.Root {...props} />;
}

function DropdownMenuPortal(props: DropdownMenuPrimitive.Portal.Props) {
    return (
        <DropdownMenuPrimitive.Portal
            data-slot="dropdown-menu-portal"
            {...props}
        />
    );
}

function DropdownMenuTrigger({
    children,
    render,
    ...props
}: DropdownMenuPrimitive.Trigger.Props & { render?: React.ReactElement }) {
    return (
        <DropdownMenuPrimitive.Trigger
            data-slot="dropdown-menu-trigger"
            render={render}
            {...props}
        >
            {children}
        </DropdownMenuPrimitive.Trigger>
    );
}

function DropdownMenuContent({
    className,
    children,
    side = "bottom",
    sideOffset = 4,
    align = "center",
    alignOffset = 0,
    ...props
}: DropdownMenuPrimitive.Popup.Props & {
    side?: DropdownMenuPrimitive.Positioner.Props["side"];
    sideOffset?: DropdownMenuPrimitive.Positioner.Props["sideOffset"];
    align?: DropdownMenuPrimitive.Positioner.Props["align"];
    alignOffset?: DropdownMenuPrimitive.Positioner.Props["alignOffset"];
}) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Positioner
                align={align}
                alignOffset={alignOffset}
                className="z-50"
                side={side}
                sideOffset={sideOffset}
            >
                <DropdownMenuPrimitive.Popup
                    data-slot="dropdown-menu-content"
                    className={cn(
                        "bg-popover text-popover-foreground data-starting-style:animate-in data-ending-style:animate-out data-ending-style:fade-out-0 data-starting-style:fade-in-0 data-ending-style:zoom-out-95 data-starting-style:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none",
                        className,
                    )}
                    {...props}
                >
                    {children}
                </DropdownMenuPrimitive.Popup>
            </DropdownMenuPrimitive.Positioner>
        </DropdownMenuPrimitive.Portal>
    );
}

function DropdownMenuGroup(props: DropdownMenuPrimitive.Group.Props) {
    return (
        <DropdownMenuPrimitive.Group
            data-slot="dropdown-menu-group"
            {...props}
        />
    );
}

function DropdownMenuItem({
    className,
    inset,
    variant = "default",
    ...props
}: DropdownMenuPrimitive.Item.Props & {
    inset?: boolean;
    variant?: "default" | "destructive";
}) {
    return (
        <DropdownMenuPrimitive.Item
            data-slot="dropdown-menu-item"
            data-inset={inset}
            data-variant={variant}
            className={cn(
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-[variant=destructive]:data-highlighted:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        />
    );
}

function DropdownMenuCheckboxItem({
    className,
    children,
    checked,
    ...props
}: DropdownMenuPrimitive.CheckboxItem.Props) {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            data-slot="dropdown-menu-checkbox-item"
            className={cn(
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            checked={checked}
            {...props}
        >
            <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                <DropdownMenuPrimitive.CheckboxItemIndicator>
                    <CheckIcon className="size-4" />
                </DropdownMenuPrimitive.CheckboxItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.CheckboxItem>
    );
}

function DropdownMenuRadioGroup(props: DropdownMenuPrimitive.RadioGroup.Props) {
    return (
        <DropdownMenuPrimitive.RadioGroup
            data-slot="dropdown-menu-radio-group"
            {...props}
        />
    );
}

function DropdownMenuRadioItem({
    className,
    children,
    ...props
}: DropdownMenuPrimitive.RadioItem.Props) {
    return (
        <DropdownMenuPrimitive.RadioItem
            data-slot="dropdown-menu-radio-item"
            className={cn(
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        >
            <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                <DropdownMenuPrimitive.RadioItemIndicator>
                    <CircleIcon className="size-2 fill-current" />
                </DropdownMenuPrimitive.RadioItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.RadioItem>
    );
}

function DropdownMenuLabel({
    className,
    inset,
    ...props
}: DropdownMenuPrimitive.GroupLabel.Props & { inset?: boolean }) {
    return (
        <DropdownMenuPrimitive.GroupLabel
            data-slot="dropdown-menu-label"
            data-inset={inset}
            className={cn(
                "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
                className,
            )}
            {...props}
        />
    );
}

function DropdownMenuSeparator({
    className,
    ...props
}: DropdownMenuPrimitive.Separator.Props) {
    return (
        <DropdownMenuPrimitive.Separator
            data-slot="dropdown-menu-separator"
            className={cn("bg-border -mx-1 my-1 h-px", className)}
            {...props}
        />
    );
}

function DropdownMenuShortcut({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            data-slot="dropdown-menu-shortcut"
            className={cn(
                "text-muted-foreground ml-auto text-xs tracking-widest",
                className,
            )}
            {...props}
        />
    );
}

function DropdownMenuSub(props: DropdownMenuPrimitive.SubmenuRoot.Props) {
    return <DropdownMenuPrimitive.SubmenuRoot {...props} />;
}

function DropdownMenuSubTrigger({
    className,
    inset,
    children,
    ...props
}: DropdownMenuPrimitive.SubmenuTrigger.Props & { inset?: boolean }) {
    return (
        <DropdownMenuPrimitive.SubmenuTrigger
            data-slot="dropdown-menu-sub-trigger"
            data-inset={inset}
            className={cn(
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        >
            {children}
            <ChevronRightIcon className="ml-auto size-4" />
        </DropdownMenuPrimitive.SubmenuTrigger>
    );
}

function DropdownMenuSubContent({
    className,
    children,
    side = "right",
    sideOffset = 4,
    align = "start",
    alignOffset = -4,
    ...props
}: DropdownMenuPrimitive.Popup.Props & {
    side?: DropdownMenuPrimitive.Positioner.Props["side"];
    sideOffset?: DropdownMenuPrimitive.Positioner.Props["sideOffset"];
    align?: DropdownMenuPrimitive.Positioner.Props["align"];
    alignOffset?: DropdownMenuPrimitive.Positioner.Props["alignOffset"];
}) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Positioner
                align={align}
                alignOffset={alignOffset}
                className="z-50"
                side={side}
                sideOffset={sideOffset}
            >
                <DropdownMenuPrimitive.Popup
                    data-slot="dropdown-menu-sub-content"
                    className={cn(
                        "bg-popover text-popover-foreground data-starting-style:animate-in data-ending-style:animate-out data-ending-style:fade-out-0 data-starting-style:fade-in-0 data-ending-style:zoom-out-95 data-starting-style:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 min-w-[8rem] origin-(--transform-origin) overflow-hidden rounded-md border p-1 shadow-lg outline-none",
                        className,
                    )}
                    {...props}
                >
                    {children}
                </DropdownMenuPrimitive.Popup>
            </DropdownMenuPrimitive.Positioner>
        </DropdownMenuPrimitive.Portal>
    );
}

export {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
};
