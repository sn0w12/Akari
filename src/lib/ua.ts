import { DeviceInfo, OsType } from "@/contexts/device-context";

interface NavigatorStandalone extends Navigator {
    standalone?: boolean;
}

function isPWA() {
    if (typeof window === "undefined") return false;

    const nav = window.navigator as NavigatorStandalone;
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        nav.standalone === true ||
        document.referrer.includes("android-app://")
    );
}

export function parseUserAgent(userAgent: string): DeviceInfo {
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
