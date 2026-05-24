import { ResponseCacheControlBuilder } from "@/lib/cache";
import { createMetadata } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_default/about/")({
    head: () => {
        const { meta, links } = createMetadata({
            title: "About Akari",
            description:
                "Learn more about Akari, an open-source manga reader with modern UI and enhanced reading experience.",
            canonicalPath: "/about",
        });
        return { meta, links };
    },
    component: AboutPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .maxAge({ hours: 1 })
            .staleWhileRevalidate({ days: 1 })
            .public()
            .build(),
    }),
});

function AboutPage() {
    return (
        <div className="flex-1 bg-background text-foreground">
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold mb-6">About Akari</h1>
                <p className="text-lg mb-4">
                    Akari is a high-quality, open-source manga reader built with
                    Tanstack Start. It provides an enhanced reading experience,
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
