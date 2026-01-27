"use client";

import { useWindowWidth } from "@/hooks/use-window-width";
import { DesktopHeader } from "./header/desktop-header";
import { MobileHeader } from "./header/mobile-header";

interface HeaderProps {
    notification: string;
}

export function HeaderComponent({ notification }: HeaderProps) {
    const windowWidth = useWindowWidth();

    return (
        <>
            {windowWidth < 768 && windowWidth !== 0 ? (
                <MobileHeader />
            ) : (
                <DesktopHeader notification={notification} />
            )}
        </>
    );
}
