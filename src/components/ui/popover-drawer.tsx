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
    "max-h-[calc(100vh-10rem)] overflow-y-auto p-2 pt-0 mt-4 md:mt-0 md:max-h-none md:p-0";
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

    const contentElement = childrenArray.find(
        (child) =>
            React.isValidElement(child) && child.type === PopoverDrawerContent,
    ) as React.ReactElement<PopoverDrawerContentProps> | undefined;

    if (!triggerElement || !contentElement) return null;

    const { className, children: triggerChild } = triggerElement.props;
    const {
        children: contentChild,
        popoverClassName,
        drawerClassName = DEFAULT_DRAWER_CLASSNAME,
        wrapperClassName = DEFAULT_WRAPPER_CLASSNAME,
        popoverAlign = "end",
        popoverSide = "bottom",
    } = contentElement.props;

    const trigger = mergeClassName(triggerChild, className ?? "");

    const content = wrapperClassName ? (
        <div className={wrapperClassName}>{contentChild}</div>
    ) : (
        contentChild
    );

    if (width !== undefined && width < 768) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerTrigger asChild>{trigger}</DrawerTrigger>
                <DrawerContent className={drawerClassName}>
                    {content}
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
                {content}
            </PopoverContent>
        </Popover>
    );
}
