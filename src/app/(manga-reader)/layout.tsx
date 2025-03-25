import { AnalyticsWrapper } from "@/components/ui/analyticsWrapper";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CookieConsent } from "@/components/ui/cookieConsent";
import { ToastProvider } from "@/lib/toast/ToastContext";
import "@/app/globals.css";

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

export default function MangaReaderLayout({
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
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ToastProvider>
                        <AnalyticsWrapper />
                        {children}
                        <CookieConsent />
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
