import Link from "next/link";
import pkg from "../../package.json";
import { Separator } from "./ui/separator";

export default async function Footer() {
    "use cache";

    const version = pkg.version;
    return (
        <footer className="flex flex-col justify-center border-t h-30 md:h-23 flex-shrink-0">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <p className="text-center text-base flex items-center justify-center gap-2">
                            <span>&copy; {new Date().getFullYear()} Akari</span>
                            <span className="h-4 border-r border-gray-400"></span>
                            <span>v{version}</span>
                            <span className="h-4 border-r border-gray-400"></span>
                            <Link
                                href={
                                    "https://www.gnu.org/licenses/agpl-3.0.html"
                                }
                                className="hover:text-foreground/70"
                                prefetch={false}
                            >
                                AGPL-3.0.
                            </Link>
                        </p>
                    </div>
                    <div className="flex justify-center flex-col">
                        <div className="flex flex-row w-full justify-between gap-6">
                            <Link
                                href="/about"
                                className="hover:text-foreground/70"
                                prefetch={false}
                            >
                                About
                            </Link>
                            <Link
                                href="/privacy"
                                className="hover:text-foreground/70"
                                prefetch={false}
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="hover:text-foreground/70"
                                prefetch={false}
                            >
                                Terms
                            </Link>
                        </div>
                        <Separator className="hidden md:block" />
                        <div className="flex flex-row w-full justify-between gap-6">
                            <Link
                                href="https://github.com/sn0w12/akari"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground/70"
                                prefetch={false}
                            >
                                <span>GitHub</span>
                            </Link>
                            <Link
                                href="https://github.com/sn0w12/akari/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground/70"
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
