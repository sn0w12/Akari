"use client";

import * as React from "react";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useWindowWidth } from "@/hooks/use-window-width";
import { cn } from "@/lib/utils";

export type PopoverDrawerAlign = "start" | "center" | "end";
export type PopoverDrawerSide = "top" | "right" | "bottom" | "left";

const DEFAULT_WRAPPER_CLASSNAME =
    "max-h-[calc(100vh-10rem)] overflow-y-auto px-2 pt-0 mt-4 md:mt-0 md:max-h-none md:p-0";
const DEFAULT_DRAWER_CLASSNAME = "p-0";

type ClassNameProps = { className?: string };

function mergeClassName(
    element: React.ReactElement,
    className: string,
): React.ReactElement {
    if (!React.isValidElement<ClassNameProps>(element)) return element;
    return React.cloneElement(element, {
        className: cn(element.props.className, className),
    });
}

export interface PopoverDrawerProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export interface PopoverDrawerTriggerProps {
    children: React.ReactElement;
    className?: string;
    desktopClassName?: string;
    mobileClassName?: string;
}

export interface PopoverDrawerContentProps {
    children: React.ReactNode;
    /** If omitted, this content is used for both popover and drawer. */
    type?: "popover" | "drawer";
    popoverClassName?: string;
    drawerClassName?: string;
    wrapperClassName?: string;
    popoverAlign?: PopoverDrawerAlign;
    popoverSide?: PopoverDrawerSide;
}

export function PopoverDrawerTrigger({ children }: PopoverDrawerTriggerProps) {
    return <>{children}</>;
}

export function PopoverDrawerContent({ children }: PopoverDrawerContentProps) {
    return <>{children}</>;
}

export function PopoverDrawer({
    children,
    open,
    onOpenChange,
}: PopoverDrawerProps) {
    const width = useWindowWidth();
    const childrenArray = React.Children.toArray(children);

    const triggerElement = childrenArray.find(
        (child) =>
            React.isValidElement(child) && child.type === PopoverDrawerTrigger,
    ) as React.ReactElement<PopoverDrawerTriggerProps> | undefined;

    const contentElements = childrenArray.filter(
        (child) =>
            React.isValidElement(child) && child.type === PopoverDrawerContent,
    ) as React.ReactElement<PopoverDrawerContentProps>[];

    // A typed element takes priority; fall back to an untyped (shared) element.
    const sharedContent = contentElements.find((el) => !el.props.type);
    const popoverContentElement =
        contentElements.find((el) => el.props.type === "popover") ??
        sharedContent;
    const drawerContentElement =
        contentElements.find((el) => el.props.type === "drawer") ??
        sharedContent;

    if (!triggerElement || (!popoverContentElement && !drawerContentElement))
        return null;

    const { className, children: triggerChild } = triggerElement.props;

    // Resolve props from the relevant content element, with fallbacks.
    const resolvedPopover: Partial<PopoverDrawerContentProps> =
        popoverContentElement?.props ?? {};
    const resolvedDrawer: Partial<PopoverDrawerContentProps> =
        drawerContentElement?.props ?? {};

    const {
        children: popoverChild,
        popoverClassName,
        popoverAlign = "end",
        popoverSide = "bottom",
    } = resolvedPopover;

    const {
        children: drawerChild,
        drawerClassName = DEFAULT_DRAWER_CLASSNAME,
        wrapperClassName = DEFAULT_WRAPPER_CLASSNAME,
    } = resolvedDrawer;

    const trigger = mergeClassName(triggerChild, className ?? "");
    const isDrawer = width !== undefined && width < 768;

    function wrapContent(child: React.ReactNode, forDrawer: boolean) {
        return wrapperClassName ? (
            <div
                className={wrapperClassName}
                style={{
                    paddingBottom:
                        forDrawer && isDrawer
                            ? "max(calc(calc(var(--spacing) * 2)), var(--safe-bottom))"
                            : undefined,
                }}
            >
                {child}
            </div>
        ) : (
            child
        );
    }

    if (isDrawer) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerTrigger asChild>{trigger}</DrawerTrigger>
                <DrawerContent className={drawerClassName}>
                    {wrapContent(drawerChild, true)}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent
                side={popoverSide}
                align={popoverAlign}
                className={popoverClassName}
            >
                {wrapContent(popoverChild, false)}
            </PopoverContent>
        </Popover>
    );
}
