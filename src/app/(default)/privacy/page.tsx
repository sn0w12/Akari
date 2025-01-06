import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Akari's privacy policy",
};

export default function PrivacyPage() {
    return (
        <div className="bg-background text-foreground">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                <div className="prose dark:prose-invert">
                    <p>
                        <strong>Last Updated: 2024-10-07</strong>
                    </p>

                    <p>
                        At Akari, we take your privacy seriously. This Privacy
                        Policy explains what information we collect and how we
                        use it when you visit our website or use the Akari
                        application.
                    </p>

                    <h2>1. Local Usage</h2>
                    <p>
                        If you are running Akari locally on your device, no data
                        is sent to any of our servers. All interactions,
                        including the use of cookies and account data, remain
                        entirely on your local device. Vercel Web Analytics and
                        any other external services will not be invoked in the
                        local environment.
                    </p>

                    <h2>2. Information We Collect</h2>
                    <p>
                        When you use Akari, the following information is
                        collected:
                    </p>
                    <ul>
                        <li>
                            <strong>Website Analytics:</strong> We use Vercel
                            Web Analytics to gather anonymized data on website
                            usage. No personal data is collected or stored
                            through this feature.
                        </li>
                        <li>
                            <strong>Account Data:</strong> All account-related
                            data, such as your MAL account token, are stored
                            locally on your device in cookies. These cookies are
                            sent to our API to enable features like bookmark
                            syncing, but we do not store or persist this data on
                            our servers.
                        </li>
                    </ul>

                    <h2>3. Vercel Web Analytics</h2>
                    <p>
                        We leverage Vercel&apos;s Web Analytics to understand
                        how users interact with our website. The analytics
                        service provides detailed insights, including:
                    </p>
                    <ul>
                        <li>
                            <strong>Top Pages:</strong> Identifies the most
                            visited pages on the site.
                        </li>
                        <li>
                            <strong>Top Referrers:</strong> Shows where the
                            traffic is coming from (e.g., external websites).
                        </li>
                        <li>
                            <strong>Demographics:</strong> Tracks data such as
                            location, operating systems, and browser types.
                        </li>
                    </ul>

                    <h2>4. Privacy Features of Vercel Web Analytics</h2>
                    <p>
                        Vercel&apos;s Web Analytics is designed with privacy in
                        mind:
                    </p>
                    <ul>
                        <li>
                            <strong>Anonymized Data:</strong> The data collected
                            is anonymized and does not include personal
                            identifiers like IP addresses or names.
                        </li>
                        <li>
                            <strong>No Cookies Used by Analytics:</strong> The
                            analytics feature does not use cookies, ensuring
                            that no tracking occurs outside of anonymized
                            metrics.
                        </li>
                    </ul>

                    <h2>5. Your Privacy Choices</h2>
                    <p>As a user, you can control how your data is managed:</p>
                    <ul>
                        <li>
                            <strong>Cookie Management:</strong> You can manage
                            or delete cookies directly through your browser
                            settings at any time.
                        </li>
                    </ul>

                    <h2>6. Changes to This Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time to
                        reflect changes in our practices or for other
                        operational, legal, or regulatory reasons. Any changes
                        will be posted on this page, and we will update the date
                        at the top of the policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
