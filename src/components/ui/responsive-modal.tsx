import {
    Dialog,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPanel,
    DialogPopup,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerPanel,
    DrawerPopup,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Popover,
    PopoverClose,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import * as React from "react";

type DesktopMode = "dialog" | "popover";

type ResponsiveModalContextValue = {
    isMobile: boolean;
    desktopMode: DesktopMode;
};

const ResponsiveModalContext = React.createContext<ResponsiveModalContextValue>(
    {
        isMobile: false,
        desktopMode: "dialog",
    },
);

export function useResponsiveModal() {
    return React.useContext(ResponsiveModalContext);
}

type DialogRootProps = React.ComponentProps<typeof Dialog>;
type DrawerRootProps = React.ComponentProps<typeof Drawer>;
type PopoverRootProps = React.ComponentProps<typeof Popover>;

export type ResponsiveModalProps = Omit<DialogRootProps, "children"> &
    Omit<DrawerRootProps, "children"> &
    Omit<PopoverRootProps, "children"> & {
        children?: React.ReactNode;
        mobileQuery?: string;
        desktop?: DesktopMode;
    };

export function ResponsiveModal({
    children,
    mobileQuery = "(pointer: coarse)",
    desktop = "dialog",
    ...props
}: ResponsiveModalProps) {
    const isMobile = useMediaQuery(mobileQuery);

    return (
        <ResponsiveModalContext.Provider
            value={{ isMobile, desktopMode: desktop }}
        >
            {isMobile ? (
                <Drawer {...(props as DrawerRootProps)}>{children}</Drawer>
            ) : desktop === "dialog" ? (
                <Dialog {...(props as DialogRootProps)}>{children}</Dialog>
            ) : (
                <Popover {...(props as PopoverRootProps)}>{children}</Popover>
            )}
        </ResponsiveModalContext.Provider>
    );
}

export type ResponsiveModalTriggerProps = React.ComponentProps<
    typeof DialogTrigger
> &
    React.ComponentProps<typeof DrawerTrigger> &
    React.ComponentProps<typeof PopoverTrigger>;

export function ResponsiveModalTrigger(props: ResponsiveModalTriggerProps) {
    const { isMobile, desktopMode } = useResponsiveModal();
    if (isMobile) return <DrawerTrigger {...props} />;
    if (desktopMode === "dialog") return <DialogTrigger {...props} />;
    return <PopoverTrigger {...props} />;
}

export type ResponsiveModalPopupProps = React.ComponentProps<
    typeof DialogPopup
> &
    React.ComponentProps<typeof DrawerPopup> &
    React.ComponentProps<typeof PopoverContent> & {
        className?: string;
        drawerClassName?: string;
        dialogClassName?: string;
    };

export function ResponsiveModalPopup({
    children,
    drawerClassName,
    dialogClassName,
    className,
    ...props
}: ResponsiveModalPopupProps) {
    const { isMobile, desktopMode } = useResponsiveModal();
    if (isMobile) {
        return (
            <DrawerPopup
                showBar
                className={cn(className, drawerClassName)}
                {...(props as React.ComponentProps<typeof DrawerPopup>)}
            >
                {children}
            </DrawerPopup>
        );
    }
    if (desktopMode === "dialog") {
        return (
            <DialogPopup
                bottomStickOnMobile={false}
                className={cn(className, dialogClassName)}
                {...(props as React.ComponentProps<typeof DialogPopup>)}
            >
                {children}
            </DialogPopup>
        );
    }
    return (
        <PopoverContent
            className={cn(className, dialogClassName)}
            {...(props as React.ComponentProps<typeof PopoverContent>)}
        >
            {children}
        </PopoverContent>
    );
}

export type ResponsiveModalHeaderProps = React.ComponentProps<
    typeof DialogHeader
> &
    React.ComponentProps<typeof DrawerHeader>;

export function ResponsiveModalHeader(props: ResponsiveModalHeaderProps) {
    const { isMobile, desktopMode } = useResponsiveModal();
    if (!isMobile && desktopMode === "popover") return null;
    return isMobile ? (
        <DrawerHeader
            {...(props as React.ComponentProps<typeof DrawerHeader>)}
        />
    ) : (
        <DialogHeader
            {...(props as React.ComponentProps<typeof DialogHeader>)}
        />
    );
}

export type ResponsiveModalTitleProps = React.ComponentProps<
    typeof DialogTitle
> &
    React.ComponentProps<typeof DrawerTitle>;

export function ResponsiveModalTitle({
    className,
    ...props
}: ResponsiveModalTitleProps) {
    const { isMobile, desktopMode } = useResponsiveModal();
    if (!isMobile && desktopMode === "popover") return null;

    const drawerTitleClassName = cn("text-center", className);
    const dialogTitleClassName = cn("", className);

    return isMobile ? (
        <DrawerTitle className={drawerTitleClassName} {...props} />
    ) : (
        <DialogTitle className={dialogTitleClassName} {...props} />
    );
}

export type ResponsiveModalDescriptionProps = React.ComponentProps<
    typeof DialogDescription
> &
    React.ComponentProps<typeof DrawerDescription>;

export function ResponsiveModalDescription(
    props: ResponsiveModalDescriptionProps,
) {
    const { isMobile, desktopMode } = useResponsiveModal();
    if (!isMobile && desktopMode === "popover") return null;
    return isMobile ? (
        <DrawerDescription {...props} />
    ) : (
        <DialogDescription {...props} />
    );
}

export type ResponsiveModalPanelProps = React.ComponentProps<
    typeof DialogPanel
> &
    React.ComponentProps<typeof DrawerPanel>;

export function ResponsiveModalPanel(props: ResponsiveModalPanelProps) {
    const { isMobile, desktopMode } = useResponsiveModal();
    if (!isMobile && desktopMode === "popover") {
        return <>{props.children}</>;
    }
    return isMobile ? (
        <DrawerPanel {...(props as React.ComponentProps<typeof DrawerPanel>)} />
    ) : (
        <DialogPanel {...(props as React.ComponentProps<typeof DialogPanel>)} />
    );
}

export type ResponsiveModalFooterProps = React.ComponentProps<
    typeof DialogFooter
> &
    React.ComponentProps<typeof DrawerFooter>;

export function ResponsiveModalFooter(props: ResponsiveModalFooterProps) {
    const { isMobile, desktopMode } = useResponsiveModal();
    if (!isMobile && desktopMode === "popover") return null;
    return isMobile ? (
        <DrawerFooter
            {...(props as React.ComponentProps<typeof DrawerFooter>)}
        />
    ) : (
        <DialogFooter
            {...(props as React.ComponentProps<typeof DialogFooter>)}
        />
    );
}

export type ResponsiveModalCloseProps = React.ComponentProps<
    typeof DialogClose
> &
    React.ComponentProps<typeof DrawerClose> &
    React.ComponentProps<typeof PopoverClose>;

export function ResponsiveModalClose(props: ResponsiveModalCloseProps) {
    const { isMobile, desktopMode } = useResponsiveModal();
    if (isMobile) return <DrawerClose {...props} />;
    if (desktopMode === "dialog") return <DialogClose {...props} />;
    return <PopoverClose {...props} />;
}

type RenderGuardProps = {
    children: React.ReactNode;
};

export function ResponsiveModalDialogOnly({ children }: RenderGuardProps) {
    const { isMobile } = useResponsiveModal();
    return isMobile ? null : <>{children}</>;
}

export function ResponsiveModalDrawerOnly({ children }: RenderGuardProps) {
    const { isMobile } = useResponsiveModal();
    return isMobile ? <>{children}</> : null;
}
