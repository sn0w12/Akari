import { setCookie } from "@/lib/utils";
import { Setting } from "./lib/settings";

/**
 * Determines if the application is running in development mode.
 */
export const inDevelopment = process.env.NODE_ENV === "development";

/**
 * Determines if the application is running in preview mode.
 */
export const inPreview = process.env.NEXT_PUBLIC_AKARI_PREVIEW === "1";

/**
 * Application settings configuration with categorized groups
 */
export const APP_SETTINGS = {
    general: {
        label: "General",
        settings: {
            theme: {
                label: "Theme",
                description: "Select the application theme.",
                type: "select",
                options: [
                    { label: "Light", value: "light" },
                    { label: "Dark", value: "dark" },
                    { label: "System", value: "system" },
                ],
                default: "system",
                groups: ["Appearance"],
            },
            fetchMalImage: {
                label: "Fetch MAL Data",
                description:
                    "Updates the Akari database with better images and other info.",
                type: "checkbox",
                default: true,
                groups: ["Data"],
            },
            fancyAnimations: {
                label: "Fancy Animations",
                description: "Such as manga detail pages cover image.",
                type: "checkbox",
                default: true,
                groups: ["Appearance"],
            },
            clearReadingHistory: {
                label: "Clear Reading History",
                type: "button",
                confirmation:
                    "Are you sure you want to clear your reading history?",
                default: false,
                onClick: async () => {
                    await fetch("/api/account/reading", {
                        method: "DELETE",
                    });
                },
                groups: ["Data"],
            },
        },
    },
    manga: {
        label: "Manga",
        settings: {
            showPageProgress: {
                label: "Show Page Progress",
                description:
                    "Shows a progress bar at the side/ bottom when reading.",
                type: "checkbox",
                default: true,
                groups: ["Reading"],
            },
            saveReadingHistory: {
                label: "Save Reading History",
                description: `Saves your reading history.`,
                type: "checkbox",
                default: true,
                onChange: (value) => {
                    setCookie(
                        "save_reading_history",
                        value as string,
                        "functional"
                    );
                },
                groups: ["Reading"],
            },
        },
    },
    notifications: {
        label: "Notifications",
        settings: {
            useToast: {
                label: "Show Toasts",
                description: "Show toast notifications for various actions.",
                type: "checkbox",
                default: true,
                groups: ["UI"],
            },
            loginToasts: {
                label: "Login Toasts",
                description:
                    "Show warnings when you aren't logged in to a service.",
                type: "checkbox",
                default: true,
                groups: ["UI"],
            },
        },
    },
    shortcuts: {
        label: "Shortcuts",
        settings: {
            showShortcuts: {
                type: "checkbox",
                label: "Show Shortcuts",
                value: true,
                default: true,
                groups: ["UI"],
            },
            searchManga: {
                type: "shortcut",
                label: "Search Manga",
                value: "Ctrl+K",
                default: "Ctrl+K",
                groups: ["Navigation"],
            },
            toggleSidebar: {
                type: "shortcut",
                label: "Toggle Sidebar",
                value: "Ctrl+B",
                default: "Ctrl+B",
                groups: ["Navigation"],
            },
            openSettings: {
                type: "shortcut",
                label: "Open Settings",
                value: "Ctrl+,",
                default: "Ctrl+,",
                groups: ["Navigation"],
            },
            openAccount: {
                type: "shortcut",
                label: "Open Account",
                value: "Ctrl+.",
                default: "Ctrl+.",
                groups: ["Navigation"],
            },
            navigateBookmarks: {
                type: "shortcut",
                label: "Navigate to Bookmarks",
                value: "Ctrl+Shift+B",
                default: "Ctrl+Shift+B",
                groups: ["Navigation"],
            },
        },
    },
    search: {
        label: "Search",
        settings: {
            settingsSearch: {
                type: "custom-render",
            },
        },
    },
} as const satisfies {
    [key: string]: {
        label: string;
        settings: {
            [key: string]:
                | Setting
                | {
                      type: "custom-render";
                  };
        };
    };
};
