"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import {
    ChevronDown,
    Circle,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useShortcut } from "@/hooks/useShortcut";
import { useSetting } from "@/lib/settings";
import { ScrollArea } from "./scroll-area";
import Link from "next/link";
import { ContextMenuLabel } from "@radix-ui/react-context-menu";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";

type SidebarContextProps = {
    state: "expanded" | "collapsed";
    open: boolean;
    setOpen: (open: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
    isAnimating: boolean;
    onAnimationComplete: (callback: () => void) => () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }

    return context;
}

function SidebarProvider({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
}: React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const animationCallbacksRef = React.useRef<Set<() => void>>(new Set());

    const [_open, _setOpen] = React.useState(() => {
        if (typeof window === "undefined") return defaultOpen;

        try {
            // Parse cookie to find sidebar state
            const cookies = document.cookie.split(";");
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split("=");
                if (name === SIDEBAR_COOKIE_NAME) {
                    return value === "true";
                }
            }
        } catch (e) {
            console.error("Error reading sidebar cookie:", e);
        }

        return defaultOpen;
    });
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
        (value: boolean | ((value: boolean) => boolean)) => {
            const openState = typeof value === "function" ? value(open) : value;
            setIsAnimating(true);
            if (setOpenProp) {
                setOpenProp(openState);
            } else {
                _setOpen(openState);
            }

            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;

            setTimeout(() => {
                setIsAnimating(false);
                animationCallbacksRef.current.forEach((callback) => callback());
            }, 250);
        },
        [setOpenProp, open],
    );

    const onAnimationComplete = React.useCallback((callback: () => void) => {
        animationCallbacksRef.current.add(callback);

        return () => {
            animationCallbacksRef.current.delete(callback);
        };
    }, []);

    const toggleSidebar = React.useCallback(() => {
        return isMobile
            ? setOpenMobile((open) => !open)
            : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    const shortCut = useSetting("toggleSidebar");
    useShortcut(shortCut, toggleSidebar);

    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo<SidebarContextProps>(
        () => ({
            state,
            open,
            setOpen,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
            isAnimating,
            onAnimationComplete,
        }),
        [
            state,
            open,
            setOpen,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
            isAnimating,
            onAnimationComplete,
        ],
    );

    return (
        <SidebarContext.Provider value={contextValue}>
            <TooltipProvider delayDuration={0}>
                <div
                    data-slot="sidebar-wrapper"
                    style={
                        {
                            "--sidebar-width": SIDEBAR_WIDTH,
                            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                            ...style,
                        } as React.CSSProperties
                    }
                    className={cn(
                        "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
                        className,
                    )}
                    {...props}
                >
                    {children}
                </div>
            </TooltipProvider>
        </SidebarContext.Provider>
    );
}

function Sidebar({
    side = "left",
    variant = "sidebar",
    collapsible = "icon",
    className,
    children,
    ...props
}: React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
}) {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (collapsible === "none") {
        return (
            <div
                data-slot="sidebar"
                className={cn(
                    "bg-sidebar text-sidebar-foreground mt-8 flex h-[calc(100vh-32px)] flex-col",
                    className,
                )}
                {...props}
            >
                {children}
            </div>
        );
    }

    if (isMobile) {
        return (
            <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
                <SheetContent
                    data-sidebar="sidebar"
                    data-slot="sidebar"
                    data-mobile="true"
                    className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
                    style={
                        {
                            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                        } as React.CSSProperties
                    }
                    side={side}
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Sidebar</SheetTitle>
                        <SheetDescription>
                            Displays the mobile sidebar.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex h-full w-full flex-col">
                        {children}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div
            className="group peer text-sidebar-foreground hidden md:block z-50 bg-sidebar"
            data-state={state}
            data-collapsible={state === "collapsed" ? collapsible : ""}
            data-variant={variant}
            data-side={side}
            data-slot="sidebar"
        >
            <div
                data-slot="sidebar-gap"
                className={cn(
                    "ease-snappy relative w-(--sidebar-width) bg-transparent transition-[width] duration-200",
                    "group-data-[collapsible=offcanvas]:w-0",
                    "group-data-[side=right]:rotate-180",
                    variant === "floating" || variant === "inset"
                        ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
                        : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
                )}
            />
            <div
                data-slot="sidebar-container"
                className={cn(
                    "ease-snappy fixed top-[29px] bottom-0 z-10 hidden h-[calc(100vh-32px)] w-(--sidebar-width) transition-[left,right,width] duration-200 md:flex",
                    side === "left"
                        ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
                        : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                    variant === "floating" || variant === "inset"
                        ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
                        : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
                    className,
                )}
                {...props}
            >
                <div
                    data-sidebar="sidebar"
                    data-slot="sidebar-inner"
                    className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

function SidebarTrigger({
    className,
    onClick,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { toggleSidebar, state } = useSidebar();

    return (
        <>
            <Button
                data-sidebar="trigger"
                data-slot="sidebar-trigger"
                variant="ghost"
                size="icon"
                className={cn(
                    "hidden md:flex hover:bg-accent hover:text-accent-foreground ease-snappy size-8",
                    className,
                )}
                onClick={(event) => {
                    onClick?.(event);
                    toggleSidebar();
                }}
                aria-describedby="toggle-sidebar"
                {...props}
            >
                {state === "collapsed" ? (
                    <PanelLeftOpen className={"h-6 w-6"} />
                ) : (
                    <PanelLeftClose className={"h-6 w-6"} />
                )}
                <span id="toggle-sidebar" className="sr-only">
                    Toggle Sidebar
                </span>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "md:hidden hover:bg-accent transition-colors duration-200 select-none touch-none border",
                    className,
                )}
                onClick={(event) => {
                    onClick?.(event);
                    toggleSidebar();
                }}
                aria-describedby="open-menu"
            >
                <Menu className="h-5 w-5" />
                <span id="open-menu" className="sr-only">
                    Open menu
                </span>
            </Button>
        </>
    );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
    const { toggleSidebar } = useSidebar();

    return (
        <button
            data-sidebar="rail"
            data-slot="sidebar-rail"
            aria-label="Toggle Sidebar"
            tabIndex={-1}
            onClick={toggleSidebar}
            title="Toggle Sidebar"
            className={cn(
                "hover:after:bg-sidebar-border ease-snappy absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
                "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
                "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
                "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
                "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
                "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
                className,
            )}
            {...props}
        />
    );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
    return (
        <main
            data-slot="sidebar-inset"
            className={cn(
                "bg-background relative flex w-full flex-1 flex-col",
                "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
                className,
            )}
            {...props}
        />
    );
}

function SidebarInput({
    className,
    ...props
}: React.ComponentProps<typeof Input>) {
    return (
        <Input
            data-slot="sidebar-input"
            data-sidebar="input"
            className={cn("bg-background h-8 w-full shadow-none", className)}
            {...props}
        />
    );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-header"
            data-sidebar="header"
            className={cn("flex flex-col gap-2 p-2", className)}
            {...props}
        />
    );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-footer"
            data-sidebar="footer"
            className={cn("flex flex-col gap-2 p-2", className)}
            {...props}
        />
    );
}

function SidebarSeparator({
    className,
    ...props
}: React.ComponentProps<typeof Separator>) {
    return (
        <Separator
            data-slot="sidebar-separator"
            data-sidebar="separator"
            className={cn("bg-sidebar-border mx-2 w-auto", className)}
            {...props}
        />
    );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-content"
            data-sidebar="content"
            className={cn(
                "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-group"
            data-sidebar="group"
            className={cn(
                "relative flex w-full min-w-0 flex-col p-2",
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroupLabel({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "div";

    return (
        <Comp
            data-slot="sidebar-group-label"
            data-sidebar="group-label"
            className={cn(
                "text-sidebar-foreground/70 ring-sidebar-ring ease-snappy flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroupAction({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="sidebar-group-action"
            data-sidebar="group-action"
            className={cn(
                "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                "after:absolute after:-inset-2 md:after:hidden",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroupContent({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-group-content"
            data-sidebar="group-content"
            className={cn("w-full text-sm", className)}
            {...props}
        />
    );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
    return (
        <ul
            data-slot="sidebar-menu"
            data-sidebar="menu"
            className={cn("flex w-full min-w-0 flex-col gap-1", className)}
            {...props}
        />
    );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
    return (
        <li
            data-slot="sidebar-menu-item"
            data-sidebar="menu-item"
            className={cn("group/menu-item relative", className)}
            {...props}
        />
    );
}

const sidebarMenuButtonVariants = cva(
    "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 transition-[background-color] duration-200 ease-snappy",
    {
        variants: {
            variant: {
                default:
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                outline:
                    "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
            },
            size: {
                default: "h-8 text-sm",
                sm: "h-7 text-xs",
                lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
            },
        },
        defaultVariants: { variant: "default", size: "default" },
    },
);

function SidebarMenuButton({
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    children,
    labelClassName,
    ...props
}: React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
    labelClassName?: string;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();

    const wrappedChildren = (
        <div
            className={cn(
                `flex items-center gap-2 ${isMobile ? "w-full" : ""}`,
                labelClassName,
            )}
            style={{ marginLeft: -4 }}
        >
            {children}
        </div>
    );

    const button = (
        <Comp
            data-slot="sidebar-menu-button"
            data-sidebar="menu-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                sidebarMenuButtonVariants({ variant, size }),
                className,
            )}
            {...props}
        >
            {wrappedChildren}
        </Comp>
    );

    if (!tooltip) {
        return button;
    }

    if (typeof tooltip === "string") {
        tooltip = { children: tooltip };
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent
                side="right"
                align="center"
                hidden={state !== "collapsed" || isMobile}
                {...tooltip}
            />
        </Tooltip>
    );
}

function SidebarMenuLink({
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    children,
    href,
    labelClassName,
    ...props
}: React.ComponentProps<"a"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
    href: string;
    labelClassName?: string;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
    const Comp = asChild ? Slot : Link;
    const { isMobile, state, setOpenMobile } = useSidebar();

    const wrappedChildren = (
        <div
            className={cn(
                `flex items-center gap-2 ${isMobile ? "w-full" : ""}`,
                labelClassName,
            )}
            style={{ marginLeft: -4 }}
        >
            {children}
        </div>
    );

    const link = (
        <Comp
            data-slot="sidebar-menu-link"
            data-sidebar="menu-button"
            data-size={size}
            data-active={isActive}
            href={href}
            className={cn(
                sidebarMenuButtonVariants({ variant, size }),
                className,
            )}
            onClick={() => {
                if (isMobile) {
                    setOpenMobile(false);
                }
            }}
            {...props}
        >
            {wrappedChildren}
        </Comp>
    );

    if (!tooltip) {
        return link;
    }

    if (typeof tooltip === "string") {
        tooltip = { children: tooltip };
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent
                side="right"
                align="center"
                hidden={state !== "collapsed" || isMobile}
                {...tooltip}
            />
        </Tooltip>
    );
}

function SidebarMenuAction({
    className,
    asChild = false,
    showOnHover = false,
    ...props
}: React.ComponentProps<"button"> & {
    asChild?: boolean;
    showOnHover?: boolean;
}) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="sidebar-menu-action"
            data-sidebar="menu-action"
            className={cn(
                "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                "after:absolute after:-inset-2 md:after:hidden",
                "peer-data-[size=sm]/menu-button:top-1",
                "peer-data-[size=default]/menu-button:top-1.5",
                "peer-data-[size=lg]/menu-button:top-2.5",
                "group-data-[collapsible=icon]:hidden",
                showOnHover &&
                    "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuBadge({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-menu-badge"
            data-sidebar="menu-badge"
            className={cn(
                "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
                "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
                "peer-data-[size=sm]/menu-button:top-1",
                "peer-data-[size=default]/menu-button:top-1.5",
                "peer-data-[size=lg]/menu-button:top-2.5",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuSkeleton({
    className,
    showIcon = false,
    ...props
}: React.ComponentProps<"div"> & { showIcon?: boolean }) {
    const width = React.useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);

    return (
        <div
            data-slot="sidebar-menu-skeleton"
            data-sidebar="menu-skeleton"
            className={cn(
                "flex h-8 items-center gap-2 rounded-md px-2",
                className,
            )}
            {...props}
        >
            {showIcon && (
                <Skeleton
                    className="size-4 rounded-md"
                    data-sidebar="menu-skeleton-icon"
                />
            )}
            <Skeleton
                className="h-4 max-w-(--skeleton-width) flex-1"
                data-sidebar="menu-skeleton-text"
                style={{ "--skeleton-width": width } as React.CSSProperties}
            />
        </div>
    );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
    return (
        <ul
            data-slot="sidebar-menu-sub"
            data-sidebar="menu-sub"
            className={cn(
                "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuSubItem({
    className,
    ...props
}: React.ComponentProps<"li">) {
    return (
        <li
            data-slot="sidebar-menu-sub-item"
            data-sidebar="menu-sub-item"
            className={cn("group/menu-sub-item relative", className)}
            {...props}
        />
    );
}

function SidebarMenuSubButton({
    asChild = false,
    size = "md",
    isActive = false,
    className,
    ...props
}: React.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
}) {
    const Comp = asChild ? Slot : "a";

    return (
        <Comp
            data-slot="sidebar-menu-sub-button"
            data-sidebar="menu-sub-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
                "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                size === "sm" && "text-xs",
                size === "md" && "text-sm",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
}

type SectionItem = { id: string; name: string; pinned?: boolean };

interface ContextMenuItemDef {
    label: string;
    onClick: (id: string) => void;
    icon?: React.ReactNode;
    variant?: "default" | "destructive";
    position?: "before-pin" | "after-pin";
}

interface SidebarSectionProps {
    title: string;
    icon: React.ReactNode;
    items: SectionItem[];
    isActive: boolean;
    isSidebarCollapsed: boolean;
    basePath: string;
    onNavigate: (path: string) => void;
    isItemActive: (itemId: string) => boolean;
    contextMenuItems?: ContextMenuItemDef[];
    onPinItem?: (itemId: string, pinned: boolean) => void;
    maxHeight?: number;
}

function usePinnedItems(sectionTitle: string) {
    const storageKey = `pinned_items_${sectionTitle.toLowerCase().replace(/\s+/g, "_")}`;
    const [pinnedIds, setPinnedIds] = React.useState<string[]>([]);
    React.useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setPinnedIds(JSON.parse(saved));
            }
        } catch (error) {
            console.error(
                "Failed to load pinned items from localStorage",
                error,
            );
        }
    }, [storageKey]);

    const togglePin = React.useCallback(
        (id: string, pinned: boolean) => {
            setPinnedIds((prev) => {
                const newPinnedIds = pinned
                    ? [...prev, id]
                    : prev.filter((pinnedId) => pinnedId !== id);

                try {
                    localStorage.setItem(
                        storageKey,
                        JSON.stringify(newPinnedIds),
                    );
                } catch (error) {
                    console.error(
                        "Failed to save pinned items to localStorage",
                        error,
                    );
                }

                return newPinnedIds;
            });
        },
        [storageKey],
    );

    return {
        pinnedIds,
        isPinned: (id: string) => pinnedIds.includes(id),
        togglePin,
    };
}

function SidebarSection({
    title,
    icon,
    items,
    isActive,
    isSidebarCollapsed,
    basePath,
    isItemActive,
    maxHeight = 320,
}: SidebarSectionProps) {
    const { isPinned } = usePinnedItems(title);
    const isMobile = useIsMobile();
    const { setOpen } = useSidebar();
    const [isExpanded, setIsExpanded] = React.useState(isActive);
    const hoverIndexRef = React.useRef<number | null>(null);
    const isHoveringRef = React.useRef<boolean>(false);
    const indicatorRef = React.useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = React.useState(false);
    const [contentHeight, setContentHeight] = React.useState<number | null>(
        null,
    );
    const contentRef = React.useRef<HTMLDivElement>(null);
    const itemsContainerRef = React.useRef<HTMLDivElement>(null);
    const itemRefs = React.useRef<(HTMLElement | null)[]>([]);

    React.useLayoutEffect(() => {
        if (contentRef.current) {
            setContentHeight(
                Math.min(contentRef.current.scrollHeight, maxHeight),
            );
        }
    }, [items, isExpanded, maxHeight]);

    const getItemRef = (index: number) => (el: HTMLElement | null) => {
        itemRefs.current[index] = el;
    };

    const updateIndicator = React.useCallback((index: number | null) => {
        if (index === null || !indicatorRef.current) {
            if (indicatorRef.current) {
                indicatorRef.current.style.opacity = "0";
            }
            return;
        }

        const item = itemRefs.current[index];
        if (!item || !itemsContainerRef.current) return;

        const itemRect = item.getBoundingClientRect();
        const containerRect = itemsContainerRef.current.getBoundingClientRect();
        const top = itemRect.top - containerRect.top;

        if (indicatorRef.current) {
            indicatorRef.current.style.height = `${itemRect.height}px`;
            indicatorRef.current.style.top = `${top}px`;
            indicatorRef.current.style.opacity = isHoveringRef.current
                ? "1"
                : "0";
        }
    }, []);

    const handleItemHover = React.useCallback(
        (index: number) => {
            hoverIndexRef.current = index;
            requestAnimationFrame(() => {
                updateIndicator(index);
            });
        },
        [updateIndicator],
    );

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

    const handleSectionToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsExpanded(!isExpanded);
        setOpen(true);
    };

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            const aPinned = a.pinned !== undefined ? a.pinned : isPinned(a.id);
            const bPinned = b.pinned !== undefined ? b.pinned : isPinned(b.id);

            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return 0;
        });
    }, [items, isPinned]);

    const handleLinkClick = () => {
        const escEvent = new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            bubbles: true,
        });
        document.dispatchEvent(escEvent);
    };

    return (
        <SidebarMenuItem>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <SidebarMenuButton
                        onClick={handleSectionToggle}
                        isActive={isActive}
                        tooltip={title}
                        labelClassName={
                            isSidebarCollapsed ? "" : "w-full justify-between"
                        }
                        aria-label={title}
                    >
                        <div className="flex max-w-[85%] items-center gap-2">
                            <div className="min-w-6">{icon}</div>
                            <span className="truncate">{title}</span>
                        </div>
                        {(!isSidebarCollapsed || isMobile) && (
                            <ChevronDown
                                className={cn(
                                    "ease-snappy h-4 w-4 transition-transform duration-200",
                                    isExpanded ? "rotate-0" : "-rotate-90",
                                )}
                            />
                        )}
                    </SidebarMenuButton>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                    <ContextMenuLabel>
                        <span className="text-sm p-2 font-medium">{title}</span>
                    </ContextMenuLabel>
                    <ContextMenuSeparator />
                    <ScrollArea
                        className="w-full"
                        style={{
                            height:
                                sortedItems.length > 0
                                    ? Math.min(sortedItems.length * 32, 384) +
                                      "px"
                                    : "40px",
                        }}
                    >
                        {sortedItems.length > 0 ? (
                            <>
                                {sortedItems.map((item) => (
                                    <ContextMenuItem key={item.id}>
                                        <Link
                                            key={"link" + item.id}
                                            href={`${basePath}/${item.id}`}
                                            className="flex items-center w-full"
                                            onClick={handleLinkClick}
                                        >
                                            {item.name}
                                        </Link>
                                    </ContextMenuItem>
                                ))}
                            </>
                        ) : (
                            <ContextMenuItem disabled>
                                No items available
                            </ContextMenuItem>
                        )}
                    </ScrollArea>
                </ContextMenuContent>
            </ContextMenu>

            {(!isSidebarCollapsed || isMobile) && (
                <div
                    ref={contentRef}
                    className={cn(
                        "ease-snappy overflow-auto transition-all duration-200",
                        !isExpanded && "h-0",
                    )}
                    style={{
                        height: isExpanded
                            ? contentHeight
                                ? `${contentHeight}px`
                                : "auto"
                            : "0px",
                    }}
                    data-scrollbar-custom="true"
                >
                    <div
                        ref={itemsContainerRef}
                        className="border-muted relative mt-1 ml-6 border-l-2 pt-0 pl-2"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div
                            ref={indicatorRef}
                            className="bg-sidebar-accent pointer-events-none absolute right-0 left-0 ml-2 rounded-md will-change-transform"
                            style={{
                                height: "0px",
                                top: "0px",
                                opacity: 0,
                                transition: isHovering
                                    ? "all 200ms cubic-bezier(0.16, 1, 0.3, 1)"
                                    : "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)",
                                transform: "translateZ(0)",
                            }}
                        />

                        {sortedItems.map((item, index) => {
                            const itemPinned =
                                item.pinned !== undefined
                                    ? item.pinned
                                    : isPinned(item.id);

                            return (
                                <SidebarMenuLink
                                    ref={getItemRef(index)}
                                    key={item.id}
                                    href={`${basePath}/${item.id}`}
                                    isActive={isItemActive(item.id)}
                                    tooltip={item.name}
                                    size="sm"
                                    className={cn(
                                        "relative z-10 mt-1 px-3 py-1 text-sm hover:bg-transparent",
                                        itemPinned && "font-medium",
                                    )}
                                    onMouseEnter={() => handleItemHover(index)}
                                >
                                    <div className="flex max-w-[150px] items-center gap-1.5">
                                        {itemPinned && (
                                            <Circle className="text-accent-positive h-2 w-2 fill-current" />
                                        )}
                                        <span className={`truncate`}>
                                            {item.name}
                                        </span>
                                    </div>
                                </SidebarMenuLink>
                            );
                        })}
                    </div>
                </div>
            )}
        </SidebarMenuItem>
    );
}

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuLink,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    SidebarSection,
    useSidebar,
};
