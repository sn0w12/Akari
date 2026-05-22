import { Link } from "@tanstack/react-router";
import pkg from "../../package.json";
import { Separator } from "./ui/separator";

export default function Footer() {
    const version = pkg.version;

    return (
        <footer className="flex flex-col justify-center border-t h-30 md:h-23 flex-shrink-0">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <p className="text-center text-base flex items-center justify-center gap-2">
                            <span suppressHydrationWarning>&copy; {new Date().getFullYear()} Akari</span>
                            <span className="h-4 border-r border-gray-400"></span>
                            <span>v{version}</span>
                            <span className="h-4 border-r border-gray-400"></span>
                            <a
                                href="https://www.gnu.org/licenses/agpl-3.0.html"
                                className="hover:text-foreground/70"
                            >
                                AGPL-3.0.
                            </a>
                        </p>
                    </div>
                    <div className="flex justify-center flex-col">
                        <div className="flex flex-row w-full justify-between gap-6">
                            <Link
                                to="/about"
                                className="hover:text-foreground/70"
                            >
                                About
                            </Link>
                            <Link
                                to="/privacy"
                                className="hover:text-foreground/70"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/terms"
                                className="hover:text-foreground/70"
                            >
                                Terms
                            </Link>
                        </div>
                        <Separator className="hidden md:block" />
                        <div className="flex flex-row w-full justify-between gap-6">
                            <a
                                href="https://github.com/sn0w12/akari"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground/70"
                            >
                                <span>GitHub</span>
                            </a>
                            <a
                                href="https://github.com/sn0w12/akari/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground/70"
                            >
                                <span>Report issues</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
