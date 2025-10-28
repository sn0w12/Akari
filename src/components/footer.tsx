import Link from "next/link";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { CookieConsentFooter } from "./cookie-consent";
import pkg from "../../package.json";
import { Separator } from "./ui/separator";

export default async function Footer() {
    "use cache";

    const version = pkg.version;
    return (
        <footer className="border-t">
            <div
                className="mx-auto px-4 sm:px-6 lg:px-8"
                style={{ paddingBlock: "calc(var(--spacing) * 5.25)" }}
            >
                <div className="flex flex-col lg:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <p className="text-center text-base text-muted-foreground flex items-center justify-center gap-2">
                            <span>&copy; {new Date().getFullYear()} Akari</span>
                            <span className="h-4 border-r border-gray-400"></span>
                            <span>v{version}</span>
                            <span className="h-4 border-r border-gray-400"></span>
                            <Link
                                href={
                                    "https://www.gnu.org/licenses/agpl-3.0.html"
                                }
                                className="text-muted-foreground hover:text-ring"
                                prefetch={false}
                            >
                                AGPL-3.0.
                            </Link>
                        </p>
                    </div>
                    <div className="flex justify-center flex-col">
                        <div className="flex flex-row w-full justify-between">
                            <Link
                                href="/about"
                                className="text-muted-foreground hover:text-ring"
                                prefetch={false}
                            >
                                About
                            </Link>
                            <Link
                                href="/privacy"
                                className="text-muted-foreground hover:text-ring"
                                prefetch={false}
                            >
                                Privacy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-muted-foreground hover:text-ring"
                                prefetch={false}
                            >
                                Terms
                            </Link>
                        </div>
                        <Separator className="hidden md:block" />
                        <div className="flex flex-row w-full justify-between gap-6">
                            <CookieConsentFooter />
                            <Link
                                href="https://github.com/sn0w12/akari"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-ring"
                                prefetch={false}
                            >
                                <span>GitHub</span>
                            </Link>
                            <Link
                                href="https://github.com/sn0w12/akari/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-ring"
                                prefetch={false}
                            >
                                <span>Report issues</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
