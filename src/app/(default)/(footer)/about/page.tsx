import { robots } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Akari",
    description: "Discover Akari, a high-quality open-source manga reader",
    robots: robots(),
    openGraph: {
        title: "Akari - Open Source Manga Reader",
        description: "Discover Akari, a high-quality open-source manga reader",
        images: [
            {
                url: "/og/akari.webp",
                alt: "Akari Manga",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@Akari",
        title: "Akari - Open Source Manga Reader",
        description: "Discover Akari, a high-quality open-source manga reader",
        images: {
            url: "/og/akari.webp",
            alt: "Akari Manga",
        },
    },
};

export default function AboutPage() {
    return (
        <div className="flex-1 bg-background text-foreground">
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-6">About Akari</h1>
                <p className="text-lg mb-4">
                    Akari is a high-quality, open-source manga reader built with
                    Next.js. It provides an enhanced reading experience,
                    allowing users to manage bookmarks and reading history
                    seamlessly.
                </p>
                <p className="text-lg mb-4">
                    Featuring a modern, responsive UI powered by Tailwind CSS
                    and shadcn/ui components, Akari ensures a smooth and
                    intuitive interface across all devices. Users can easily
                    navigate through manga collections, search for titles, and
                    enjoy keyboard shortcuts for efficient reading.
                </p>
                <p className="text-lg mb-4">
                    As an open-source project, Akari welcomes contributions from
                    the community. Whether you&apos;re a developer looking to
                    add new features or a user reporting issues, your input
                    helps make Akari better for everyone. The project is hosted
                    on GitHub, where you can explore the codebase and get
                    involved.
                </p>
            </div>
        </div>
    );
}
