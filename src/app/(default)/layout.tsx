import "@/app/globals.css";
import { AnalyticsWrapper } from "@/components/analytics/analytics-wrapper";
import { BaseLayout } from "@/components/base-layout";
import Footer from "@/components/footer";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { inDevelopment } from "@/config";
import { BorderColorProvider } from "@/contexts/border-color-context";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";
import { ConfirmProvider } from "@/contexts/confirm-context";
import { DeviceProvider } from "@/contexts/device-context";
import { UserProvider } from "@/contexts/user-context";
import localFont from "next/font/local";
import { Suspense } from "react";

import type { Metadata, Viewport } from "next";

const geistSans = localFont({
    src: "../../../public/fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});

export const metadata: Metadata = { title: "Akari" };
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

function buildDebugStyle(): string {
    let style = ":root {";
    if (process.env.NEXT_PUBLIC_SIMULATE_SAFE_AREA_INSETS == "1") {
        style += `--safe-top: 1rem; --safe-bottom: 2rem;`;
    }
    style += "}";
    return style;
}

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
                {inDevelopment && <style>{buildDebugStyle()}</style>}
            </head>
            <body
                className={`${geistSans.variable} md:h-screen flex flex-col antialiased bg-background overflow-y-auto pt-[var(--safe-top)] md:pt-0 mb-[var(--header-height)] md:mb-0 md:overflow-hidden`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <DeviceProvider>
                        <SidebarProvider
                            defaultOpen={false}
                            className="min-h-none"
                        >
                            <ConfirmProvider>
                                <QueryProvider>
                                    <UserProvider>
                                        <BreadcrumbProvider>
                                            <BorderColorProvider>
                                                <BaseLayout gutter={true}>
                                                    <Suspense fallback={null}>
                                                        <AnalyticsWrapper />
                                                    </Suspense>
                                                    {children}
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
