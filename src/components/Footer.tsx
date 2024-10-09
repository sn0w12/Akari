import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center md:order-2 space-x-6">
                        <Link
                            href="/about"
                            className="text-gray-400 hover:text-gray-500"
                        >
                            About
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-gray-400 hover:text-gray-500"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-gray-400 hover:text-gray-500"
                        >
                            Terms
                        </Link>
                        <a
                            href="https://github.com/sn0w12/akari"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-500"
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
                            <span className="sr-only">GitHub repository</span>
                        </a>
                    </div>
                    <div className="mt-8 md:mt-0 md:order-1">
                        <p className="text-center text-base text-gray-400">
                            &copy; {new Date().getFullYear()} Akari. Licensed
                            under the AGPL-3.0 License.
                        </p>
                    </div>
                </div>
                <div className="mt-8 text-center text-sm text-gray-400">
                    <p>
                        Content sourced from Manganato. Not affiliated with
                        Manganato.
                    </p>
                </div>
            </div>
        </footer>
    );
}
