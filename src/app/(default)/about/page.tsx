export default function AboutPage() {
    return (
        <div className="bg-background text-foreground">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-6">About Akari</h1>
                <p className="text-lg mb-4">
                    Akari is a Next.js application designed to provide an
                    enhanced manga reading experience for Manganato users. It
                    uses Manganato as a backend, leveraging its content while
                    allowing users to manage and retain their bookmarks from the
                    site directly within the application.
                </p>
                <p className="text-lg">
                    Our goal is to offer a seamless, user-friendly interface for
                    manga enthusiasts, combining the vast library of Manganato
                    with improved functionality and a modern design.
                </p>
            </div>
        </div>
    );
}
