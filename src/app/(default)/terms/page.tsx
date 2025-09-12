import { Metadata } from "next";
import { robots } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Akari Terms of Service",
    robots: robots(),
};

export default function TermsPage() {
    return (
        <div className="bg-background text-foreground">
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
                <div className="prose dark:prose-invert">
                    <p>
                        <strong>Last Updated: 2024-10-07</strong>
                    </p>

                    <p>
                        Welcome to Akari! By accessing or using the Akari
                        Website, you agree to be bound by these Terms of Service
                        (the &quot;Terms&quot;). If you do not agree to these
                        Terms, please do not use the Website.
                    </p>

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By using the Website, you acknowledge that you have
                        read, understood, and agree to be bound by these Terms,
                        along with our Privacy Policy. If you are using the
                        Website on behalf of a company or other legal entity,
                        you represent that you have the authority to bind that
                        entity to these Terms.
                    </p>

                    <h2>2. Description of the Website</h2>
                    <p>
                        Akari is a Next.js Website designed to enhance the manga
                        reading experience for Manganato users. It utilizes
                        Manganato as a backend, allowing users to manage and
                        retain their bookmarks from the site directly within the
                        Website.
                    </p>

                    <h2>3. User Responsibilities</h2>
                    <ul>
                        <li>
                            You agree to use the Website in compliance with all
                            applicable laws and regulations.
                        </li>
                        <li>
                            You are responsible for maintaining the
                            confidentiality of your account information and for
                            all activities that occur under your account.
                        </li>
                        <li>
                            You agree to notify us immediately of any
                            unauthorized use of your account or any other breach
                            of security.
                        </li>
                    </ul>

                    <h2>4. Content Disclaimer</h2>
                    <p>
                        The developers of this Website do not have any
                        affiliation with the content available in the Website.
                        Akari collects content from sources that are freely
                        accessible through any web browser. The Website does not
                        host any content directly.
                    </p>

                    <h2>5. Limitation of Liability</h2>
                    <p>
                        To the fullest extent permitted by law, in no event
                        shall Akari, its developers, or its affiliates be liable
                        for any indirect, incidental, special, consequential, or
                        punitive damages, including without limitation, loss of
                        profits, data, use, goodwill, or other intangible
                        losses, resulting from (i) your use of or inability to
                        use the Website; (ii) any unauthorized access to or use
                        of our servers and/or any personal information stored
                        therein; (iii) any interruption or cessation of
                        transmission to or from the Website; (iv) any bugs,
                        viruses, or the like that may be transmitted to or
                        through the Website; and/or (v) any errors or omissions
                        in any content.
                    </p>

                    <h2>6. Indemnification</h2>
                    <p>
                        You agree to defend, indemnify, and hold harmless Akari,
                        its developers, and its affiliates from and against any
                        claims, liabilities, damages, losses, costs, and
                        expenses, including reasonable attorneys fees, arising
                        out of or in connection with your use of the Website or
                        your violation of these Terms.
                    </p>

                    <h2>7. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time.
                        If we make changes, we will notify you by revising the
                        date at the top of these Terms and, in some cases, we
                        may provide additional notice (such as adding a
                        statement to our homepage or sending you a
                        notification). Your continued use of the Website after
                        the changes take effect constitutes your acceptance of
                        the new Terms.
                    </p>
                </div>
            </div>
        </div>
    );
}
