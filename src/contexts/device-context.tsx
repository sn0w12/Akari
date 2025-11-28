"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { UAParser } from "ua-parser-js";

interface DeviceInfo {
    deviceType: UAParser.IDevice["type"];
    os: string;
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

    function isPWA() {
        return (
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true ||
            document.referrer.includes("android-app://")
        );
    }

    useEffect(() => {
        const parser = new UAParser(navigator.userAgent);
        const device = parser.getDevice();
        const os = parser.getOS();
        setDeviceInfo({
            deviceType: device.type,
            os: os.name || "unknown",
            isPWA: isPWA(),
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
