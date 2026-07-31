import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import useEmblaCarousel, {
    type UseEmblaCarouselType,
} from "embla-carousel-react";
import * as React from "react";

type EmblaCarouselApi = UseEmblaCarouselType[1];

export type TabsVariant = "default" | "underline";

export type TabsSwipeableProps = {
    /**
     * Allows swiping between tab panels on touch devices (coarse pointer).
     * Desktop keeps the default tab behavior.
     */
    swipeable?: boolean;
};

export function Tabs({
    className,
    swipeable = false,
    value,
    defaultValue,
    onValueChange,
    children,
    ...props
}: TabsPrimitive.Root.Props & TabsSwipeableProps): React.ReactElement {
    const { panels, otherChildren, panelValues } = React.useMemo(() => {
        const panels: React.ReactElement<TabsPrimitive.Panel.Props>[] = [];
        const otherChildren: React.ReactNode[] = [];
        React.Children.forEach(children, (child) => {
            if (React.isValidElement(child) && child.type === TabsPanel) {
                panels.push(
                    child as React.ReactElement<TabsPrimitive.Panel.Props>,
                );
            } else {
                otherChildren.push(child);
            }
        });
        return {
            panels,
            otherChildren,
            panelValues: panels.map((panel) => panel.props.value),
        };
    }, [children]);

    const isTouch = useMediaQuery({ pointer: "coarse" });
    const enableSwipe =
        swipeable &&
        isTouch &&
        panels.length > 1 &&
        props.orientation !== "vertical";

    const [internalValue, setInternalValue] =
        React.useState<TabsPrimitive.Tab.Value>(
            value !== undefined ? value : defaultValue,
        );
    const activeValue = value !== undefined ? value : internalValue;

    const handleValueChange = React.useCallback(
        (
            nextValue: TabsPrimitive.Tab.Value,
            eventDetails: TabsPrimitive.Root.ChangeEventDetails,
        ) => {
            setInternalValue(nextValue);
            onValueChange?.(nextValue, eventDetails);
        },
        [onValueChange],
    );

    const [carouselRef, emblaApi] = useEmblaCarousel(
        enableSwipe ? { axis: "x", containScroll: "keepSnaps" } : undefined,
    );

    const activeValueRef = React.useRef(activeValue);
    activeValueRef.current = activeValue;
    const didInitialAlignRef = React.useRef(false);

    // Keep the carousel in sync when the active tab changes.
    React.useEffect(() => {
        if (!enableSwipe || !emblaApi) return;
        const firstAlign = !didInitialAlignRef.current;
        didInitialAlignRef.current = true;
        const index = panelValues.indexOf(activeValue);
        if (index < 0) return;
        if (index === emblaApi.selectedScrollSnap()) return;
        emblaApi.scrollTo(index, firstAlign);
    }, [enableSwipe, emblaApi, activeValue, panelValues]);

    // Update the active tab when the user finishes swiping to another panel.
    // `select` is used instead of `settle` because `settle` never fires when
    // the carousel stops at the first or last slide.
    React.useEffect(() => {
        if (!enableSwipe || !emblaApi) return;
        const onSelect = (api: EmblaCarouselApi) => {
            if (!api) return;
            // Ignore mid-drag target changes; only react once the user has
            // released and the carousel has settled on its final snap.
            if (api.internalEngine().dragHandler.pointerDown()) return;
            const index = api.selectedScrollSnap();
            const nextValue = panelValues[index];
            if (nextValue === undefined) return;
            if (nextValue === activeValueRef.current) return;
            const previousIndex = panelValues.indexOf(activeValueRef.current);
            handleValueChange(nextValue, {
                reason: "none",
                activationDirection: index > previousIndex ? "right" : "left",
            } as unknown as TabsPrimitive.Root.ChangeEventDetails);
        };
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [enableSwipe, emblaApi, panelValues, handleValueChange]);

    const rootClassName = cn(
        "flex flex-col gap-2 data-[orientation=vertical]:flex-row",
        className,
    );

    if (!enableSwipe) {
        return (
            <TabsPrimitive.Root
                className={rootClassName}
                value={value}
                defaultValue={defaultValue}
                onValueChange={onValueChange}
                data-slot="tabs"
                {...props}
            >
                {children}
            </TabsPrimitive.Root>
        );
    }

    return (
        <TabsPrimitive.Root
            className={rootClassName}
            value={activeValue}
            onValueChange={handleValueChange}
            data-slot="tabs"
            {...props}
        >
            {otherChildren}
            <div
                ref={carouselRef}
                className="min-w-0 overflow-hidden"
                data-slot="tabs-swipe-viewport"
            >
                <div className="flex w-full gap-2">
                    {panels.map((panel) => (
                        <div
                            key={panel.props.value}
                            className="flex min-w-0 shrink-0 grow-0 basis-full flex-col"
                            data-slot="tabs-swipe-slide"
                        >
                            {React.cloneElement(panel, {
                                keepMounted: true,
                                // base-ui hides not-yet-open panels with the
                                // `hidden` attribute; keep all slides visible so
                                // their content is already there while swiping.
                                hidden: false,
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </TabsPrimitive.Root>
    );
}

export function TabsList({
    variant = "default",
    className,
    children,
    ...props
}: TabsPrimitive.List.Props & {
    variant?: TabsVariant;
}): React.ReactElement {
    return (
        <TabsPrimitive.List
            className={cn(
                "relative z-0 flex w-fit items-center justify-center gap-x-0.5 text-muted-foreground",
                "data-[orientation=vertical]:flex-col",
                variant === "default"
                    ? "rounded-lg bg-muted p-0.5 text-muted-foreground/72"
                    : "*:data-[slot=tabs-tab]:hover:bg-accent",
                className,
            )}
            data-slot="tabs-list"
            {...props}
        >
            {children}
            <TabsPrimitive.Indicator
                className={cn(
                    "absolute bottom-0 left-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-(--active-tab-bottom) transition-[width,translate] duration-200 ease-in-out",
                    variant === "underline"
                        ? "z-10 bg-primary data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:-translate-x-px data-[orientation=horizontal]:translate-y-px"
                        : "-z-1 rounded-md bg-background shadow-sm/5 dark:bg-input",
                )}
                data-slot="tab-indicator"
            />
        </TabsPrimitive.List>
    );
}

export function TabsTab({
    className,
    ...props
}: TabsPrimitive.Tab.Props): React.ReactElement {
    return (
        <TabsPrimitive.Tab
            className={cn(
                "relative flex h-9 shrink-0 grow cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-[calc(--spacing(2.5)-1px)] font-medium text-base outline-none transition-[color,background-color,box-shadow] hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-active:text-foreground data-disabled:opacity-64 sm:h-8 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
                className,
            )}
            data-slot="tabs-tab"
            {...props}
        />
    );
}

export function TabsPanel({
    className,
    ...props
}: TabsPrimitive.Panel.Props): React.ReactElement {
    return (
        <TabsPrimitive.Panel
            className={cn("flex-1 outline-none", className)}
            data-slot="tabs-content"
            {...props}
        />
    );
}

export { TabsPanel as TabsContent, TabsPrimitive, TabsTab as TabsTrigger };
