import type { Metadata } from "next";
import localFont from "next/font/local";
import { AnalyticsWrapper } from "@/components/ui/analyticsWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import { CookieConsent } from "@/components/ui/cookieConsent";
import { ToastProvider } from "@/lib/toast/ToastContext";
import { BaseLayout } from "@/components/BaseLayout";
import "@/app/globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProximityPrefetch } from "@/lib/proximity-prefetch";

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
                className={`${geistSans.variable} ${geistMono.variable} h-dvh flex flex-col antialiased bg-background overflow-hidden fixed inset-0`}
            >
                <ProximityPrefetch>
                    <SidebarProvider
                        defaultOpen={false}
                        className="overflow-hidden"
                    >
                        <BaseLayout>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                                disableTransitionOnChange
                            >
                                <ToastProvider>
                                    <AnalyticsWrapper />
                                    <div className="flex-grow pt-2 md:p-4 md:pb-0">
                                        {children}
                                    </div>
                                    <CookieConsent />
                                    <Footer />
                                </ToastProvider>
                            </ThemeProvider>
                        </BaseLayout>
                    </SidebarProvider>
                </ProximityPrefetch>
            </body>
        </html>
    );
}
