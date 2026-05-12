import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "@/components/page-wrapper";
import SettingsPage from "@/components/settings";
import { createMetadata } from "@/lib/seo";

export const Route = createFileRoute("/_default/settings/")({
    head: () => {
        const { meta, links } = createMetadata({
            title: "Settings",
            description: "Manage your Akari account settings and preferences.",
            canonicalPath: "/settings",
        });
        return { meta, links };
    },
    component: Settings,
});

function Settings() {
    return (
        <PageWrapper>
            <SettingsPage />
        </PageWrapper>
    );
}
