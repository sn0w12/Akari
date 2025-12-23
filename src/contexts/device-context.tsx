"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

export type DeviceType = "mobile" | "tablet" | "desktop" | undefined;
export type OsType =
    | "Windows"
    | "macOS"
    | "Linux"
    | "Android"
    | "iOS"
    | "unknown";

interface DeviceInfo {
    deviceType: DeviceType;
    os: OsType;
    isPWA: boolean;
}

interface NavigatorStandalone extends Navigator {
    standalone?: boolean;
}

function isPWA() {
    const nav = window.navigator as NavigatorStandalone;
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        nav.standalone === true ||
        document.referrer.includes("android-app://")
    );
}

function parseUserAgent(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();

    // Basic OS detection
    let os = "unknown" as OsType;
    if (ua.includes("windows")) os = "Windows";
    else if (ua.includes("mac os x") || ua.includes("macos")) os = "macOS";
    else if (ua.includes("linux")) os = "Linux";
    else if (ua.includes("android")) os = "Android";
    else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
        os = "iOS";

    // Basic device type detection
    let deviceType: DeviceInfo["deviceType"] = undefined;
    if (
        ua.includes("mobile") ||
        (ua.includes("android") && !ua.includes("tablet"))
    ) {
        deviceType = "mobile";
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
        deviceType = "tablet";
    } else {
        deviceType = "desktop";
    }

    return { deviceType, os, isPWA: isPWA() };
}

const DeviceContext = createContext<DeviceInfo>({
    deviceType: undefined,
    os: "unknown",
    isPWA: false,
});

interface DeviceProviderProps {
    children: ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
        deviceType: undefined,
        os: "unknown",
        isPWA: false,
    });

    useEffect(() => {
        const { deviceType, os, isPWA } = parseUserAgent(navigator.userAgent);
        queueMicrotask(() => {
            setDeviceInfo({
                deviceType,
                os,
                isPWA,
            });
        });
    }, []);

    return (
        <DeviceContext.Provider value={deviceInfo}>
            {children}
        </DeviceContext.Provider>
    );
}

export function useDevice(): DeviceInfo {
    const context = useContext(DeviceContext);
    return context;
}
