import { robots } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Akari's privacy policy",
    robots: robots(),
};

export default function PrivacyPage() {
    return (
        <div className="flex-1 bg-background text-foreground">
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                <div className="prose dark:prose-invert">
                    <p>
                        <strong>Last Updated: 2026-01-17</strong>
                    </p>

                    <p>
                        At Akari, we take your privacy seriously. This Privacy
                        Policy explains what information we collect and how we
                        use it when you visit our website or use the Akari
                        application.
                    </p>

                    <h2>1. Self Hosting</h2>
                    <p>
                        If you are self hosting Akari, the application will
                        request manga content from our API to provide you with
                        access to manga sources. No analytics data is collected
                        if self hosting. See the{" "}
                        <a
                            href="https://github.com/sn0w12/Akari"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Github
                        </a>{" "}
                        for more details about how to self host.
                    </p>

                    <h2>2. Information We Collect</h2>
                    <p>
                        When you use Akari, the following information is
                        collected:
                    </p>
                    <ul>
                        <li>
                            <strong>Website Analytics:</strong> We use Plausible
                            Analytics to gather anonymized data on website
                            usage. No personal data is collected or stored
                            through this feature. Learn more about{" "}
                            <a
                                href="https://plausible.io/privacy-focused-web-analytics"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Plausible&apos;s privacy-focused approach
                            </a>
                            .
                        </li>
                        <li>
                            <strong>Secondary Account Data:</strong> All
                            secondary account-related data, such as your MAL
                            account token, are stored locally on your device.
                            These may be sent to our API to enable features like
                            bookmark syncing, but we do not store or persist
                            this data on our servers.
                        </li>
                    </ul>

                    <h2>3. Plausible Analytics</h2>
                    <p>
                        We use Plausible Analytics to understand how users
                        interact with our website. The analytics service
                        provides detailed insights, including:
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

                    <h2>4. Privacy Features of Plausible Analytics</h2>
                    <p>
                        Plausible Analytics is designed with privacy as a core
                        principle:
                    </p>
                    <ul>
                        <li>
                            <strong>GDPR, CCPA and PECR Compliant:</strong>{" "}
                            Plausible is fully compliant with privacy
                            regulations. Visit the{" "}
                            <a
                                href="https://plausible.io/data-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Plausible Data Policy
                            </a>{" "}
                            for more information.
                        </li>
                        <li>
                            <strong>No Cookies:</strong> Plausible does not use
                            cookies, ensuring no tracking occurs outside of
                            anonymized metrics.
                        </li>
                        <li>
                            <strong>No Personal Data Collection:</strong> All
                            data collected is anonymized and does not include
                            personal identifiers like IP addresses or names.
                        </li>
                        <li>
                            <strong>Open Source:</strong> Plausible is{" "}
                            <a
                                href="https://github.com/plausible/analytics"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                open source
                            </a>
                            , allowing full transparency in how your data is
                            handled.
                        </li>
                    </ul>

                    <h2>5. Your Privacy Choices</h2>
                    <p>As a user, you can control how your data is managed:</p>
                    <ul>
                        <li>
                            <strong>Analytics Control:</strong> You can disable
                            sending analytics data at any time through the
                            settings. Navigate to Settings to toggle analytics
                            on or off according to your preferences.
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
