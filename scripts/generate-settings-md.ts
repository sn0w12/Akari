import { APP_SETTINGS } from "../src/config";
import { Setting } from "@/lib/settings";

/**
 * Formats the default value of a setting for display in markdown tables.
 */
function formatDefault(setting: Setting): string {
    const def =
        typeof setting.default === "function"
            ? setting.default()
            : setting.default;
    switch (setting.type) {
        case "checkbox":
            return def ? "Enabled" : "Disabled";
        case "select":
            const option = setting.options?.find((o) => o.value === def);
            return option ? option.label : String(def);
        case "checkbox-group":
            return (def as string[]).length > 0 ? "Enabled" : "Disabled";
        default:
            return String(def);
    }
}

/**
 * Generates markdown tables for the application settings, similar to the README.
 */
export function generateSettingsMarkdown(): string {
    let markdown = "# Settings\n\n";

    for (const [, category] of Object.entries(APP_SETTINGS)) {
        const displayableSettings = Object.entries(category.settings).filter(
            ([, setting]) => setting.type !== "custom-render"
        );

        if (displayableSettings.length === 0) continue;

        markdown += `## ${category.label}\n\n`;
        markdown += "| Setting | Default | Description |\n";
        markdown += "| ------- | ------- | ----------- |\n";

        for (const [, setting] of displayableSettings) {
            const label = setting.label;
            const defaultVal = formatDefault(setting);
            const desc = setting.description || "";

            markdown += `| ${label} | ${defaultVal} | ${desc} |\n`;
        }

        markdown += "\n";
    }

    return markdown;
}

console.log(generateSettingsMarkdown());
