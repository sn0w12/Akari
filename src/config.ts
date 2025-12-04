import { Setting, SettingVisibility } from "./lib/settings";
import { createDynamicKey, createField } from "./lib/storage";
import { StorageSchemas } from "./types/storage";

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
                groups: ["UI"],
            },
            fancyAnimations: {
                label: "Fancy Animations",
                description: "Such as manga detail pages cover image.",
                type: "checkbox",
                default: true,
                groups: ["UI"],
            },
            pwaRestorePath: {
                label: "Navigation Restore",
                description:
                    "Restore the last visited page when reopening the app.",
                type: "checkbox",
                default: true,
                groups: ["UI"],
                visibility: ["pwa"],
            },
            useToast: {
                label: "Show Toasts",
                description: "Show toast notifications for various actions.",
                type: "checkbox",
                default: true,
                groups: ["UI", "Notifications"],
            },
            groupLoginToasts: {
                label: "Login Toasts",
                description:
                    "Show warnings when you aren't logged in to a service.",
                type: "checkbox-group",
                options: [{ label: "MAL", value: "MAL" }],
                default: ["MAL"],
                groups: ["UI", "Notifications"],
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
            stripWidth: {
                label: "Strip Reader Width",
                description: "Width of the strip reader.",
                type: "slider",
                default: "144",
                min: 32,
                max: 256,
                step: 8,
                groups: ["Reading"],
            },
        },
    },
    shortcuts: {
        label: "Shortcuts",
        visibility: ["desktop"],
        settings: {
            showShortcuts: {
                label: "Show Shortcuts",
                description: "Enable or disable keyboard shortcuts.",
                type: "checkbox",
                value: true,
                default: true,
                groups: ["UI"],
            },
            searchManga: {
                label: "Search Manga",
                description: "Shortcut to search manga.",
                type: "shortcut",
                value: "Ctrl+K",
                default: "Ctrl+K",
                groups: ["Navigation"],
            },
            toggleSidebar: {
                label: "Toggle Sidebar",
                description: "Shortcut to toggle the sidebar.",
                type: "shortcut",
                value: "Ctrl+B",
                default: "Ctrl+B",
                groups: ["Navigation"],
            },
            openSettings: {
                label: "Open Settings",
                description: "Shortcut to open settings.",
                type: "shortcut",
                value: "Ctrl+,",
                default: "Ctrl+,",
                groups: ["Navigation"],
            },
            openAccount: {
                label: "Open Account",
                description: "Shortcut to open account page.",
                type: "shortcut",
                value: "Ctrl+.",
                default: "Ctrl+.",
                groups: ["Navigation"],
            },
            navigateBookmarks: {
                label: "Navigate to Bookmarks",
                description: "Shortcut to navigate to bookmarks.",
                type: "shortcut",
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
        visibility?: SettingVisibility[];
        settings: {
            [key: string]:
                | Setting
                | {
                      type: "custom-render";
                  };
        };
    };
};

export const STORAGE_SCHEMAS = {
    readerMode: {
        key: createDynamicKey("reading-{mangaId}-{chapterId}", [
            "mangaId",
            "chapterId",
        ]),
        schema: {
            isStripMode: createField("boolean", false),
        },
    },
    pushNotifications: {
        key: "push-notifications",
        schema: {
            declined: createField("boolean", false),
            enabled: createField("boolean", false),
            pending: createField("boolean", false),
        },
    },
    pwaLastPage: {
        key: "pwa-last-page",
        schema: {
            path: createField("string", ""),
        },
    },
    pwaSessionRestored: {
        key: "pwa-session-restored",
        schema: {
            restored: createField("boolean", false),
        },
        storageBackend: "session",
    },
    installPromptDismissed: {
        key: "install-prompt-dismissed",
        schema: {
            dismissed: createField("boolean", false),
        },
    },
    secondaryAccountCache: {
        key: createDynamicKey("secondary-account-{accountId}", ["accountId"]),
        schema: {
            valid: createField("boolean", false),
        },
        storageBackend: "session",
    },
} satisfies StorageSchemas;
