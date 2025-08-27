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
import type { Viewport } from "next";

const geistSans = localFont({
    src: "../../../public/fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "../../../public/fonts/GeistMonoVF.woff",
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
                className={`${geistSans.variable} ${geistMono.variable} h-dvh flex flex-col antialiased bg-background overflow-y-auto md:overflow-hidden`}
            >
                <ProximityPrefetch>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <SidebarProvider defaultOpen={false}>
                            <BaseLayout gutter={true}>
                                <ToastProvider>
                                    <AnalyticsWrapper />
                                    <div className="flex-grow pt-2 md:p-4 md:pb-0">
                                        {children}
                                    </div>
                                    <CookieConsent />
                                    <Footer />
                                </ToastProvider>
                            </BaseLayout>
                        </SidebarProvider>
                    </ThemeProvider>
                </ProximityPrefetch>
            </body>
        </html>
    );
}
