import Link from "next/link";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "./ui/tooltip";
import { CookieConsentFooter } from "./ui/cookieConsent";
import pkg from "../../package.json";

export default async function Footer() {
    "use cache";

    const version = pkg.version;
    return (
        <footer className="border-t">
            <div className="mx-auto pt-8.75 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex justify-center md:order-2 space-x-6">
                        <Link
                            href="/about"
                            className="text-gray-400 hover:text-gray-500"
                            prefetch={false}
                        >
                            About
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-gray-400 hover:text-gray-500"
                            prefetch={false}
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-gray-400 hover:text-gray-500"
                            prefetch={false}
                        >
                            Terms
                        </Link>
                        <CookieConsentFooter />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="https://github.com/sn0w12/akari"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-gray-500"
                                        prefetch={false}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-6 w-6"
                                        >
                                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                                        </svg>
                                        <span className="sr-only">
                                            GitHub repository
                                        </span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    View the source code
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="https://github.com/sn0w12/akari/issues"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-gray-500"
                                        prefetch={false}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-6 w-6"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <line
                                                x1="12"
                                                y1="8"
                                                x2="12"
                                                y2="12"
                                            />
                                            <line
                                                x1="12"
                                                y1="16"
                                                x2="12.01"
                                                y2="16"
                                            />
                                        </svg>
                                        <span className="sr-only">
                                            Report an issue
                                        </span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Report bugs or request features
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div>
                        <p className="text-center text-base text-gray-400 flex items-center justify-center gap-2">
                            <span>&copy; {new Date().getFullYear()} Akari</span>
                            <span className="h-4 border-r border-gray-400"></span>
                            <span>v{version}</span>
                            <span className="h-4 border-r border-gray-400"></span>
                            <Link
                                href={
                                    "https://www.gnu.org/licenses/agpl-3.0.html"
                                }
                                className="text-gray-400 hover:text-gray-500"
                                prefetch={false}
                            >
                                AGPL-3.0.
                            </Link>
                        </p>
                    </div>
                    <div className="text-center text-sm text-gray-400">
                        <p>
                            Content sourced from Manganato. Not affiliated with
                            Manganato.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
