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
import { env } from "@/lib/env";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";

function buildDebugStyle(): string {
    let style = ":root {";
    if (env("VITE_SIMULATE_SAFE_AREA_INSETS") == "1") {
        style += `--safe-top: 1rem; --safe-bottom: 2rem;`;
    }
    style += "}";
    return style;
}

function getApiPreconnect(url?: string | undefined): string | undefined {
    if (!url) return undefined;
    try {
        return new URL(url).origin;
    } catch {
        return url;
    }
}

export const Route = createFileRoute("/_default")({
    component: DefaultLayout,
});

function DefaultLayout() {
    const apiPreconnect = getApiPreconnect(env("VITE_API_URL"));

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <DeviceProvider>
                <SidebarProvider defaultOpen={false} className="min-h-none">
                    <ConfirmProvider>
                        <QueryProvider>
                            <BreadcrumbProvider>
                                <BorderColorProvider>
                                    {inDevelopment && (
                                        <style>{buildDebugStyle()}</style>
                                    )}
                                    {apiPreconnect && (
                                        <link
                                            rel="preconnect"
                                            href={apiPreconnect}
                                            crossOrigin="anonymous"
                                        />
                                    )}
                                    <link
                                        rel="preconnect"
                                        href="https://img.akarimanga.dpdns.org"
                                        crossOrigin="anonymous"
                                    />
                                    <BaseLayout gutter={true}>
                                        <Suspense fallback={null}>
                                            <AnalyticsWrapper />
                                        </Suspense>
                                        <Outlet />
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
    );
}
