"use client";

import * as React from "react";

import {
    Drawer,
    DrawerContent,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
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

type PopoverDrawerMode = "popover" | "drawer";

interface PopoverDrawerContextValue {
    mode: PopoverDrawerMode;
    hasDrawerContent: boolean;
    hasPopoverContent: boolean;
}

const PopoverDrawerContext =
    React.createContext<PopoverDrawerContextValue | null>(null);

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
}

export interface PopoverDrawerContentProps {
    children: React.ReactNode;
    drawerTitle?: string;
    /** If omitted, this content is used for both popover and drawer. */
    type?: "popover" | "drawer";
    popoverClassName?: string;
    drawerClassName?: string;
    wrapperClassName?: string;
    popoverAlign?: PopoverDrawerAlign;
    popoverSide?: PopoverDrawerSide;
}

function usePopoverDrawerContext(
    componentName: string,
): PopoverDrawerContextValue {
    const context = React.useContext(PopoverDrawerContext);

    if (!context) {
        throw new Error(`${componentName} must be used within PopoverDrawer`);
    }

    return context;
}

function isPopoverDrawerContentElement(
    child: React.ReactNode,
): child is React.ReactElement<PopoverDrawerContentProps> {
    return React.isValidElement(child) && child.type === PopoverDrawerContent;
}

function wrapContent(
    child: React.ReactNode,
    wrapperClassName: string | undefined,
    isDrawer: boolean,
): React.ReactNode {
    if (!wrapperClassName) {
        return child;
    }

    return (
        <div
            className={wrapperClassName}
            style={{
                paddingBottom: isDrawer
                    ? "max(calc(calc(var(--spacing) * 2)), var(--safe-bottom))"
                    : undefined,
            }}
        >
            {child}
        </div>
    );
}

export function PopoverDrawerTrigger({
    children,
    className,
}: PopoverDrawerTriggerProps) {
    const { mode } = usePopoverDrawerContext("PopoverDrawerTrigger");
    const trigger = mergeClassName(children, className ?? "");

    if (mode === "drawer") {
        return <DrawerTrigger asChild>{trigger}</DrawerTrigger>;
    }

    return <PopoverTrigger asChild>{trigger}</PopoverTrigger>;
}

export function PopoverDrawerContent({
    children,
    type,
    drawerTitle,
    popoverClassName,
    drawerClassName = DEFAULT_DRAWER_CLASSNAME,
    wrapperClassName = DEFAULT_WRAPPER_CLASSNAME,
    popoverAlign = "end",
    popoverSide = "bottom",
}: PopoverDrawerContentProps) {
    const { mode, hasDrawerContent, hasPopoverContent } =
        usePopoverDrawerContext("PopoverDrawerContent");

    if (type && type !== mode) {
        return null;
    }

    const hasTypedContentForMode =
        mode === "drawer" ? hasDrawerContent : hasPopoverContent;

    if (!type && hasTypedContentForMode) {
        return null;
    }

    const content = wrapContent(children, wrapperClassName, mode === "drawer");

    if (mode === "drawer") {
        return (
            <DrawerContent className={drawerClassName}>
                <div
                    className={wrapperClassName}
                    style={{
                        paddingBottom:
                            "max(calc(calc(var(--spacing) * 2)), var(--safe-bottom))",
                    }}
                >
                    {drawerTitle && (
                        <DrawerTitle className="mb-2.5 pb-1 border-b text-center">
                            <h4 className="font-semibold">{drawerTitle}</h4>
                        </DrawerTitle>
                    )}
                    {children}
                </div>
            </DrawerContent>
        );
    }

    return (
        <PopoverContent
            side={popoverSide}
            align={popoverAlign}
            className={popoverClassName}
        >
            {content}
        </PopoverContent>
    );
}

export function PopoverDrawer({
    children,
    open,
    onOpenChange,
}: PopoverDrawerProps) {
    const width = useWindowWidth();
    const mode: PopoverDrawerMode =
        width > 0 && width < 768 ? "drawer" : "popover";
    const childArray = React.Children.toArray(children);
    const hasDrawerContent = childArray.some(
        (child) =>
            isPopoverDrawerContentElement(child) &&
            child.props.type === "drawer",
    );
    const hasPopoverContent = childArray.some(
        (child) =>
            isPopoverDrawerContentElement(child) &&
            child.props.type === "popover",
    );
    const Root = mode === "drawer" ? Drawer : Popover;

    return (
        <PopoverDrawerContext.Provider
            value={{ mode, hasDrawerContent, hasPopoverContent }}
        >
            <Root open={open} onOpenChange={onOpenChange}>
                {children}
            </Root>
        </PopoverDrawerContext.Provider>
    );
}
