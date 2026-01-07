import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Meta, Scripts } from "@tanstack/start";
import type { ReactNode } from "react";
import { inDevelopment } from "@/config";
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
import { AnalyticsWrapper } from "@/components/analytics/analytics-wrapper";

// Import global styles
import "@/app/globals.css";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1, maximum-scale=1",
            },
            {
                title: "Akari",
            },
        ],
        links: [
            {
                rel: "preload",
                href: "/fonts/GeistVF.woff",
                as: "font",
                type: "font/woff",
                crossOrigin: "anonymous",
            },
        ],
    }),
    component: RootComponent,
});

function RootComponent() {
    return (
        <RootDocument>
            <Outlet />
        </RootDocument>
    );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <Meta />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                            @font-face {
                                font-family: 'Geist Sans';
                                src: url('/fonts/GeistVF.woff') format('woff');
                                font-weight: 100 900;
                                font-style: normal;
                                font-display: swap;
                            }
                            :root {
                                --font-geist-sans: 'Geist Sans', sans-serif;
                            }
                        `,
                    }}
                />
                {inDevelopment && (
                    <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
                )}
            </head>
            <body
                className="min-h-screen flex flex-col antialiased bg-background overflow-y-auto md:overflow-hidden"
                style={{ fontFamily: "var(--font-geist-sans)" }}
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
                                                    <AnalyticsWrapper />
                                                    <div className="flex-1">{children}</div>
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
                <Scripts />
                {inDevelopment && <TanStackRouterDevtools position="bottom-right" />}
            </body>
        </html>
    );
}
