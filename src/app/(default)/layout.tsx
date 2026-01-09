import "@/app/globals.css";
import localFont from "next/font/local";
import { inDevelopment } from "@/config";
import { AnalyticsWrapper } from "@/components/analytics/analytics-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { BaseLayout } from "@/components/base-layout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserProvider } from "@/contexts/user-context";
import { CookieConsent } from "@/components/cookie-consent";
import Footer from "@/components/footer";
import { QueryProvider } from "@/components/query-provider";
import { ConfirmProvider } from "@/contexts/confirm-context";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";
import { DeviceProvider } from "@/contexts/device-context";
import { Toaster } from "@/components/ui/sonner";
import { PWANavigationRestore } from "@/components/pwa-navigation-restore";
import { BorderColorProvider } from "@/contexts/border-color-context";
import { Suspense } from "react";

import type { Metadata } from "next";
import type { Viewport } from "next";

const geistSans = localFont({
    src: "../../../public/fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});

export const metadata: Metadata = { title: "Akari" };
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {inDevelopment && (
                    // eslint-disable-next-line @next/next/no-sync-scripts
                    <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
                )}
            </head>
            <body
                className={`${geistSans.variable} min-h-screen flex flex-col antialiased bg-background overflow-y-auto md:overflow-hidden`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <DeviceProvider>
                        <SidebarProvider defaultOpen={false}>
                            <ConfirmProvider>
                                <QueryProvider>
                                    <UserProvider>
                                        <BreadcrumbProvider>
                                            <BorderColorProvider baseColor="border-border">
                                                <Suspense fallback={null}>
                                                    <PWANavigationRestore />
                                                </Suspense>
                                                <BaseLayout gutter={true}>
                                                    <Suspense fallback={null}>
                                                        <AnalyticsWrapper />
                                                    </Suspense>
                                                    <div className="flex-1">
                                                        {children}
                                                    </div>
                                                    <CookieConsent />
                                                    <Toaster
                                                        position="top-right"
                                                        visibleToasts={5}
                                                    />
                                                    <Footer />
                                                </BaseLayout>
                                            </BorderColorProvider>
                                        </BreadcrumbProvider>
                                    </UserProvider>
                                </QueryProvider>
                            </ConfirmProvider>
                        </SidebarProvider>
                    </DeviceProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
