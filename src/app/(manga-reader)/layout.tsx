import { Analytics } from "@vercel/analytics/react";
import localFont from "next/font/local";
import { ToastContainer } from "react-toastify";
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
    return (
        <html lang="en">
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                const storedTheme = localStorage.getItem('theme') || 'light';
                if (storedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
                    }}
                />
                <Analytics />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
                <ToastContainer />
            </body>
        </html>
    );
}
