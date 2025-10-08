"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { useSetting } from "@/lib/settings";

const TabsContext = React.createContext<{
    hoverIndexRef: React.MutableRefObject<number | null>;
    isHoveringRef: React.MutableRefObject<boolean>;
    updateIndicator: (index: number | null) => void;
    registerTabTrigger: (
        index: number,
        element: HTMLButtonElement | null
    ) => void;
} | null>(null);

function Tabs({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            data-slot="tabs"
            className={cn("flex flex-col gap-2", className)}
            {...props}
        />
    );
}

function TabsList({
    className,
    children,
    size = "default",
    ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
    size?: "default" | "small";
}) {
    const [isHovering, setIsHovering] = React.useState(false);
    const useFancyAnimations = useSetting("fancyAnimations") as boolean;
    const hoverIndexRef = React.useRef<number | null>(null);
    const isHoveringRef = React.useRef<boolean>(false);
    const indicatorRef = React.useRef<HTMLDivElement>(null);
    const tabsContainerRef = React.useRef<HTMLDivElement>(null);
    const tabRefs = React.useRef<Map<number, HTMLButtonElement | null>>(
        new Map()
    );

    const registerTabTrigger = React.useCallback(
        (index: number, element: HTMLButtonElement | null) => {
            tabRefs.current.set(index, element);
        },
        []
    );

    const updateIndicator = React.useCallback((index: number | null) => {
        if (index === null || !indicatorRef.current) {
            if (indicatorRef.current) {
                indicatorRef.current.style.opacity = "0";
            }
            return;
        }

        const tab = tabRefs.current.get(index);
        if (!tab || !tabsContainerRef.current) return;

        const tabRect = tab.getBoundingClientRect();
        const containerRect = tabsContainerRef.current.getBoundingClientRect();
        const left = tabRect.left - containerRect.left;

        if (indicatorRef.current) {
            indicatorRef.current.style.width = `${tabRect.width}px`;
            indicatorRef.current.style.left = `${left}px`;
            indicatorRef.current.style.opacity = isHoveringRef.current
                ? "1"
                : "0";
        }
    }, []);

    const handleMouseEnter = React.useCallback(() => {
        isHoveringRef.current = true;
        if (hoverIndexRef.current !== null) {
            updateIndicator(hoverIndexRef.current);
        }

        setTimeout(() => {
            setIsHovering(true);
        }, 50);
    }, [updateIndicator]);

    const handleMouseLeave = React.useCallback(() => {
        isHoveringRef.current = false;
        updateIndicator(null);

        setTimeout(() => {
            setIsHovering(false);
        }, 50);
    }, [updateIndicator]);

    return (
        <TabsContext.Provider
            value={{
                hoverIndexRef,
                isHoveringRef,
                updateIndicator,
                registerTabTrigger,
            }}
        >
            <div
                className={cn("relative", className)}
                ref={tabsContainerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <TabsPrimitive.List
                    data-slot="tabs-list"
                    className={cn(
                        "bg-muted text-muted-foreground relative flex flex-wrap items-center justify-center gap-1 rounded-lg p-[3px] pb-[4px]",
                        "sm:inline-flex sm:flex-nowrap sm:justify-center",
                        size === "small" ? "min-h-7 sm:h-7" : "min-h-9 sm:h-9",
                        "w-full"
                    )}
                    {...props}
                >
                    <div
                        ref={indicatorRef}
                        className={cn(
                            "bg-background/60 pointer-events-none absolute top-[4px] bottom-[4px] z-0 rounded-md hidden sm:block",
                            size === "small"
                                ? "top-[2px] bottom-[2px]"
                                : "top-[4px] bottom-[4px]"
                        )}
                        style={{
                            width: "0px",
                            left: "0px",
                            opacity: 0,
                            transform: "translateZ(0)",
                            transition: useFancyAnimations
                                ? isHovering
                                    ? "all 200ms cubic-bezier(0.16, 1, 0.3, 1)"
                                    : "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)"
                                : "none",
                        }}
                    />
                    {React.Children.map(children, (child, index) =>
                        React.isValidElement(child) &&
                        child.type === TabsTrigger
                            ? React.cloneElement(
                                  child as React.ReactElement<{
                                      size?: "default" | "small";
                                      index: number;
                                  }>,
                                  { size, index }
                              )
                            : child
                    )}
                </TabsPrimitive.List>
            </div>
        </TabsContext.Provider>
    );
}

function TabsTrigger({
    className,
    children,
    size = "default",
    index,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
    size?: "default" | "small";
    index: number;
}) {
    const tabsContext = React.useContext(TabsContext);
    const ref = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        if (tabsContext) {
            tabsContext.registerTabTrigger(index, ref.current);
        }
    }, [tabsContext, index]);

    const handleMouseEnter = React.useCallback(() => {
        if (tabsContext) {
            tabsContext.updateIndicator(index);
        }
    }, [tabsContext, index]);

    return (
        <TabsPrimitive.Trigger
            ref={ref}
            data-slot="tabs-trigger"
            className={cn(
                "text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring relative z-10 inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                "hover:bg-transparent",
                "data-[state=active]:bg-background",
                size === "small"
                    ? "h-[calc(1.5rem)] px-1 py-0.5 text-xs"
                    : "h-[calc(100%-1px)] px-2 py-1 text-sm",
                className
            )}
            onMouseEnter={handleMouseEnter}
            {...props}
        >
            {children}
        </TabsPrimitive.Trigger>
    );
}

function TabsContent({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            data-slot="tabs-content"
            className={cn("flex-1 outline-none", className)}
            {...props}
        />
    );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
