import { AnalyticsWrapper } from "@/components/ui/analyticsWrapper";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/lib/toast/ToastContext";
import "@/app/globals.css";

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

export default function MangaReaderLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
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
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
