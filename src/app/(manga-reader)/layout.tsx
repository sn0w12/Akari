import { AnalyticsWrapper } from "@/components/ui/analyticsWrapper";
import localFont from "next/font/local";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CookieConsent } from "@/components/ui/cookieConsent";
import "@/app/globals.css";
import "react-toastify/dist/ReactToastify.css";

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
}: Readonly<{
    children: React.ReactNode;
}>) {
    const isDevelopment = process.env.NODE_ENV === "development";

    return (
        <html lang="en">
            <head>
                {isDevelopment && (
                    <script
                        src="https://unpkg.com/react-scan/dist/auto.global.js"
                        async
                    />
                )}
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AnalyticsWrapper />
                    {children}
                    <ToastContainer />
                    <CookieConsent />
                </ThemeProvider>
            </body>
        </html>
    );
}
