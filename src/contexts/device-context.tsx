"use client";

import { parseUserAgent } from "@/lib/ua";
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

export interface DeviceInfo {
    deviceType: DeviceType;
    os: OsType;
    isPWA: boolean;
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
