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
import localFont from "next/font/local";
import { Suspense } from "react";

import type { Metadata, Viewport } from "next";

const geistSans = localFont({
    src: "../../../public/fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});

export const metadata: Metadata = { title: "Akari Manga" };
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

/**
 * Return a safe origin to preconnect to from an input URL string.
 * - If the value is falsy -> undefined
 * - If it's a full URL -> return the origin (scheme + host + port)
 * - Otherwise -> return the raw value (best-effort)
 */
function getApiPreconnect(url?: string | undefined): string | undefined {
    if (!url) return undefined;
    try {
        return new URL(url).origin;
    } catch {
        return url;
    }
}

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
    const apiPreconnect = getApiPreconnect(process.env.NEXT_PUBLIC_API_URL);

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {inDevelopment && (
                    // eslint-disable-next-line @next/next/no-sync-scripts
                    <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
                )}
                {inDevelopment && <style>{buildDebugStyle()}</style>}
                {apiPreconnect && (
                    // Preconnect to API origin to reduce handshake latency
                    <link
                        rel="preconnect"
                        href={apiPreconnect}
                        crossOrigin="anonymous"
                    />
                )}
                <link
                    rel="preconnect"
                    href={"https://img.akarimanga.dpdns.org"}
                    crossOrigin="anonymous"
                />
            </head>
            <body
                className={`${geistSans.variable} md:h-screen flex flex-col antialiased bg-background overflow-y-auto pt-[var(--safe-top)]! md:pt-0! mb-[var(--header-height)] md:mb-0 md:overflow-hidden`}
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
                                </QueryProvider>
                            </ConfirmProvider>
                        </SidebarProvider>
                    </DeviceProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
