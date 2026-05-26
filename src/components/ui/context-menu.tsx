import { useConfirm } from "@/contexts/confirm-context";
import { cn } from "@/lib/utils";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import * as React from "react";

function ContextMenu(props: ContextMenuPrimitive.Root.Props) {
    return <ContextMenuPrimitive.Root {...props} />;
}

function ContextMenuTrigger({
    children,
    render,
    ...props
}: ContextMenuPrimitive.Trigger.Props & { render?: React.ReactElement }) {
    return (
        <ContextMenuPrimitive.Trigger
            data-slot="context-menu-trigger"
            render={render}
            {...props}
        >
            {children}
        </ContextMenuPrimitive.Trigger>
    );
}

function ContextMenuGroup(props: ContextMenuPrimitive.Group.Props) {
    return (
        <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
    );
}

function ContextMenuPortal(props: ContextMenuPrimitive.Portal.Props) {
    return (
        <ContextMenuPrimitive.Portal
            data-slot="context-menu-portal"
            {...props}
        />
    );
}

function ContextMenuSub(props: ContextMenuPrimitive.SubmenuRoot.Props) {
    return <ContextMenuPrimitive.SubmenuRoot {...props} />;
}

function ContextMenuRadioGroup(props: ContextMenuPrimitive.RadioGroup.Props) {
    return (
        <ContextMenuPrimitive.RadioGroup
            data-slot="context-menu-radio-group"
            {...props}
        />
    );
}

function ContextMenuSubTrigger({
    className,
    inset,
    children,
    ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props & { inset?: boolean }) {
    return (
        <ContextMenuPrimitive.SubmenuTrigger
            data-slot="context-menu-sub-trigger"
            data-inset={inset}
            className={cn(
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        >
            {children}
            <ChevronRightIcon className="ml-auto" />
        </ContextMenuPrimitive.SubmenuTrigger>
    );
}

function ContextMenuSubContent({
    className,
    children,
    side = "right",
    sideOffset = 4,
    align = "start",
    alignOffset = -4,
    ...props
}: ContextMenuPrimitive.Popup.Props & {
    side?: ContextMenuPrimitive.Positioner.Props["side"];
    sideOffset?: ContextMenuPrimitive.Positioner.Props["sideOffset"];
    align?: ContextMenuPrimitive.Positioner.Props["align"];
    alignOffset?: ContextMenuPrimitive.Positioner.Props["alignOffset"];
}) {
    return (
        <ContextMenuPrimitive.Portal>
            <ContextMenuPrimitive.Positioner
                align={align}
                alignOffset={alignOffset}
                className="z-50"
                side={side}
                sideOffset={sideOffset}
            >
                <ContextMenuPrimitive.Popup
                    data-slot="context-menu-sub-content"
                    className={cn(
                        "bg-popover text-popover-foreground data-starting-style:animate-in data-ending-style:animate-out data-ending-style:fade-out-0 data-starting-style:fade-in-0 data-ending-style:zoom-out-95 data-starting-style:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 min-w-[8rem] origin-(--transform-origin) overflow-hidden rounded-md border p-1 outline-none",
                        className,
                    )}
                    {...props}
                >
                    {children}
                </ContextMenuPrimitive.Popup>
            </ContextMenuPrimitive.Positioner>
        </ContextMenuPrimitive.Portal>
    );
}

function ContextMenuContent({
    className,
    children,
    side = "bottom",
    sideOffset = 4,
    align = "start",
    alignOffset = 0,
    ...props
}: ContextMenuPrimitive.Popup.Props & {
    side?: ContextMenuPrimitive.Positioner.Props["side"];
    sideOffset?: ContextMenuPrimitive.Positioner.Props["sideOffset"];
    align?: ContextMenuPrimitive.Positioner.Props["align"];
    alignOffset?: ContextMenuPrimitive.Positioner.Props["alignOffset"];
}) {
    return (
        <ContextMenuPrimitive.Portal>
            <ContextMenuPrimitive.Positioner
                align={align}
                alignOffset={alignOffset}
                className="z-50"
                side={side}
                sideOffset={sideOffset}
            >
                <ContextMenuPrimitive.Popup
                    data-slot="context-menu-content"
                    className={cn(
                        "bg-popover text-popover-foreground data-starting-style:animate-in data-ending-style:animate-out data-ending-style:fade-out-0 data-starting-style:fade-in-0 data-ending-style:zoom-out-95 data-starting-style:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none",
                        className,
                    )}
                    {...props}
                >
                    {children}
                </ContextMenuPrimitive.Popup>
            </ContextMenuPrimitive.Positioner>
        </ContextMenuPrimitive.Portal>
    );
}

function ContextMenuItem({
    className,
    inset,
    variant = "default",
    onClick,
    ...props
}: ContextMenuPrimitive.Item.Props & {
    inset?: boolean;
    variant?: "default" | "destructive";
}) {
    const { confirm } = useConfirm();

    const handleItemClick = React.useCallback<
        NonNullable<ContextMenuPrimitive.Item.Props["onClick"]>
    >(
        async (event) => {
            if (variant === "destructive") {
                event.preventDefault();
                const confirmed = await confirm({
                    title: "Confirm Action",
                    description:
                        "Are you sure you want to proceed with this action?",
                    confirmText: "Proceed",
                    cancelText: "Cancel",
                    variant: "destructive",
                });

                if (!confirmed) {
                    return;
                }
            }
            onClick?.(event);
        },
        [onClick, variant, confirm],
    );

    return (
        <ContextMenuPrimitive.Item
            data-slot="context-menu-item"
            data-inset={inset}
            data-variant={variant}
            className={cn(
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-[variant=destructive]:data-highlighted:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            onClick={handleItemClick}
            {...props}
        />
    );
}

function ContextMenuCheckboxItem({
    className,
    children,
    checked,
    ...props
}: ContextMenuPrimitive.CheckboxItem.Props) {
    return (
        <ContextMenuPrimitive.CheckboxItem
            data-slot="context-menu-checkbox-item"
            className={cn(
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            checked={checked}
            {...props}
        >
            <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                <ContextMenuPrimitive.CheckboxItemIndicator>
                    <CheckIcon className="size-4" />
                </ContextMenuPrimitive.CheckboxItemIndicator>
            </span>
            {children}
        </ContextMenuPrimitive.CheckboxItem>
    );
}

function ContextMenuRadioItem({
    className,
    children,
    ...props
}: ContextMenuPrimitive.RadioItem.Props) {
    return (
        <ContextMenuPrimitive.RadioItem
            data-slot="context-menu-radio-item"
            className={cn(
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        >
            <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                <ContextMenuPrimitive.RadioItemIndicator>
                    <CircleIcon className="size-2 fill-current" />
                </ContextMenuPrimitive.RadioItemIndicator>
            </span>
            {children}
        </ContextMenuPrimitive.RadioItem>
    );
}

function ContextMenuLabel({
    className,
    inset,
    ...props
}: ContextMenuPrimitive.GroupLabel.Props & { inset?: boolean }) {
    return (
        <ContextMenuPrimitive.GroupLabel
            data-slot="context-menu-label"
            data-inset={inset}
            className={cn(
                "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
                className,
            )}
            {...props}
        />
    );
}

function ContextMenuSeparator({
    className,
    ...props
}: ContextMenuPrimitive.Separator.Props) {
    return (
        <ContextMenuPrimitive.Separator
            data-slot="context-menu-separator"
            className={cn("bg-border -mx-1 my-1 h-px", className)}
            {...props}
        />
    );
}

function ContextMenuShortcut({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            data-slot="context-menu-shortcut"
            className={cn(
                "text-muted-foreground ml-auto text-xs tracking-widest",
                className,
            )}
            {...props}
        />
    );
}

export {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuPortal,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
};
