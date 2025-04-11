import type { Metadata } from "next";
import localFont from "next/font/local";
import { AnalyticsWrapper } from "@/components/ui/analyticsWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CookieConsent } from "@/components/ui/cookieConsent";
import { ToastProvider } from "@/lib/toast/ToastContext";
import { BaseLayout } from "@/components/BaseLayout";
import "@/app/globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProximityPrefetch } from "@/lib/proximity-prefetch";
import type { Viewport } from "next";

const geistSans = localFont({
    src: "../fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "../fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = { title: "灯 - Akari" };
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const isDevelopment = process.env.NODE_ENV === "development";

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {isDevelopment && (
                    <script
                        src="https://unpkg.com/react-scan/dist/auto.global.js"
                        async
                    />
                )}
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} h-dvh flex flex-col antialiased bg-background`}
            >
                <ProximityPrefetch>
                    <SidebarProvider defaultOpen={false}>
                        <BaseLayout gutter={false}>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                                disableTransitionOnChange
                            >
                                <ToastProvider>
                                    <AnalyticsWrapper />
                                    <div
                                        id="scroll-element"
                                        className="flex-grow overflow-x-hidden"
                                    >
                                        {children}
                                    </div>
                                    <CookieConsent />
                                </ToastProvider>
                            </ThemeProvider>
                        </BaseLayout>
                    </SidebarProvider>
                </ProximityPrefetch>
            </body>
        </html>
    );
}
