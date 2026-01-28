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
                options: [
                    { label: "MAL", value: "mal" },
                    { label: "AniList", value: "ani" },
                ],
                default: [],
                groups: ["UI", "Notifications"],
            },
            allowAnalytics: {
                label: "Allow Analytics",
                description:
                    "Allow the collection of anonymous analytics data.",
                type: "checkbox",
                default: true,
                groups: ["Privacy"],
            },
        },
    },
    manga: {
        label: "Manga",
        settings: {
            readerType: {
                label: "Page Display Type",
                description: "Select the default reader type for manga.",
                type: "select",
                options: [
                    { label: "Auto", value: "auto" },
                    { label: "Single Page", value: "page" },
                    { label: "Strip", value: "strip" },
                ],
                default: "auto",
                groups: ["UI"],
                onChange: () => {
                    if (typeof window === "undefined") return;

                    const mangaReaderRegex =
                        /^\/manga\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/\d+$/;
                    const isMangaReaderPage = mangaReaderRegex.test(
                        window.location.pathname,
                    );
                    if (isMangaReaderPage) {
                        window.location.reload();
                    }
                },
            },
            showPageProgress: {
                label: "Show Page Progress",
                description:
                    "Shows a progress bar at the side/ bottom when reading.",
                type: "checkbox",
                default: true,
                groups: ["UI"],
            },
            stripWidth: {
                label: "Strip Reader Width",
                description: "Width of the strip reader.",
                type: "slider",
                default: "144",
                min: 32,
                max: 256,
                step: 8,
                groups: ["UI"],
            },
            readingDirection: {
                label: "Reading Direction",
                description: "Select the reading direction for manga.",
                type: "select",
                options: [
                    { label: "Left to Right", value: "ltr" },
                    { label: "Right to Left", value: "rtl" },
                ],
                default: "ltr",
                groups: ["Reading"],
            },
            continueAfterChapter: {
                label: "Advance chapter on last page",
                description:
                    "Automatically advance to the next chapter when reaching the last page.",
                type: "checkbox",
                default: true,
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
    test: {
        label: "Test Settings",
        settings: {
            testCheckbox1: {
                label: "Test Checkbox 1",
                description: "A test checkbox setting.",
                type: "checkbox",
                default: true,
                groups: ["UI"],
            },
            testCheckbox2: {
                label: "Test Checkbox 2",
                description: "Another test checkbox setting.",
                type: "checkbox",
                default: false,
                groups: ["UI", "Notifications"],
            },
            testCheckbox3: {
                label: "Test Checkbox 3",
                description: "Yet another test checkbox setting.",
                type: "checkbox",
                default: true,
                groups: ["Privacy"],
            },
            testCheckboxGroup1: {
                label: "Test Checkbox Group 1",
                description: "A test checkbox group setting.",
                type: "checkbox-group",
                options: [
                    { label: "Option A", value: "a" },
                    { label: "Option B", value: "b" },
                    { label: "Option C", value: "c" },
                ],
                default: ["a"],
                groups: ["UI", "Privacy"],
            },
            testCheckboxGroup2: {
                label: "Test Checkbox Group 2",
                description: "Another test checkbox group setting.",
                type: "checkbox-group",
                options: [
                    { label: "Choice 1", value: "1" },
                    { label: "Choice 2", value: "2" },
                    { label: "Choice 3", value: "3" },
                    { label: "Choice 4", value: "4" },
                ],
                default: ["1", "3"],
                groups: ["UI", "Notifications"],
            },
            testText1: {
                label: "Test Text 1",
                description: "A test text input setting.",
                type: "text",
                default: "Default text",
                groups: ["UI", "Reading"],
            },
            testText2: {
                label: "Test Text 2",
                description: "Another test text input setting.",
                type: "text",
                default: "",
                groups: ["Privacy"],
            },
            testPassword1: {
                label: "Test Password 1",
                description: "A test password input setting.",
                type: "password",
                default: "",
                groups: ["Privacy", "UI"],
            },
            testPassword2: {
                label: "Test Password 2",
                description: "Another test password input setting.",
                type: "password",
                default: "secret",
                groups: ["Privacy"],
            },
            testEmail1: {
                label: "Test Email 1",
                description: "A test email input setting.",
                type: "email",
                default: "test@example.com",
                groups: ["Privacy", "Notifications"],
            },
            testEmail2: {
                label: "Test Email 2",
                description: "Another test email input setting.",
                type: "email",
                default: "",
                groups: ["Privacy"],
            },
            testNumber1: {
                label: "Test Number 1",
                description: "A test number input setting.",
                type: "number",
                default: "42",
                groups: ["UI", "Reading"],
            },
            testNumber2: {
                label: "Test Number 2",
                description: "Another test number input setting.",
                type: "number",
                default: "0",
                groups: ["UI"],
            },
            testTextarea1: {
                label: "Test Textarea 1",
                description: "A test textarea setting.",
                type: "textarea",
                default:
                    "This is a default textarea content.\nIt can have multiple lines.",
                groups: ["UI", "Privacy"],
            },
            testTextarea2: {
                label: "Test Textarea 2",
                description: "Another test textarea setting.",
                type: "textarea",
                default: "",
                groups: ["Privacy"],
            },
            testSelect1: {
                label: "Test Select 1",
                description: "A test select setting.",
                type: "select",
                options: [
                    { label: "Option 1", value: "1" },
                    { label: "Option 2", value: "2" },
                    { label: "Option 3", value: "3" },
                ],
                default: "1",
                groups: ["UI", "Navigation"],
            },
            testSelect2: {
                label: "Test Select 2",
                description: "Another test select setting.",
                type: "select",
                options: [
                    { label: "Choice A", value: "a" },
                    { label: "Choice B", value: "b" },
                    { label: "Choice C", value: "c" },
                    { label: "Choice D", value: "d" },
                ],
                default: "b",
                groups: ["UI"],
            },
            testRadio1: {
                label: "Test Radio 1",
                description: "A test radio setting.",
                type: "radio",
                options: [
                    { label: "Radio 1", value: "r1" },
                    { label: "Radio 2", value: "r2" },
                    { label: "Radio 3", value: "r3" },
                ],
                default: "r1",
                groups: ["UI", "Reading"],
            },
            testRadio2: {
                label: "Test Radio 2",
                description: "Another test radio setting.",
                type: "radio",
                options: [
                    { label: "Option X", value: "x" },
                    { label: "Option Y", value: "y" },
                ],
                default: "x",
                groups: ["UI"],
            },
            testShortcut1: {
                label: "Test Shortcut 1",
                description: "A test shortcut setting.",
                type: "shortcut",
                default: "Ctrl+T",
                groups: ["UI", "Navigation"],
            },
            testShortcut2: {
                label: "Test Shortcut 2",
                description: "Another test shortcut setting.",
                type: "shortcut",
                default: "Alt+S",
                groups: ["UI"],
            },
            testButton1: {
                label: "Test Button 1",
                description: "A test button setting.",
                type: "button",
                default: "",
                onClick: () => {
                    alert("Test Button 1 clicked!");
                },
                groups: ["UI", "Notifications"],
            },
            testButton2: {
                label: "Test Button 2",
                description: "Another test button setting.",
                type: "button",
                default: "",
                confirmation: "Are you sure you want to click this button?",
                onClick: () => {
                    alert("Test Button 2 clicked!");
                },
                groups: ["UI"],
            },
            testSlider1: {
                label: "Test Slider 1",
                description: "A test slider setting.",
                type: "slider",
                default: "50",
                min: 0,
                max: 100,
                step: 1,
                groups: ["UI", "Reading"],
            },
            testSlider2: {
                label: "Test Slider 2",
                description: "Another test slider setting.",
                type: "slider",
                default: "25",
                min: 10,
                max: 200,
                step: 5,
                groups: ["UI"],
            },
            testColor1: {
                label: "Test Color 1",
                description: "A test color setting.",
                type: "color",
                default: "#ff0000",
                groups: ["UI", "Privacy"],
            },
            testColor2: {
                label: "Test Color 2",
                description: "Another test color setting.",
                type: "color",
                default: "#00ff00",
                groups: ["UI"],
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
    secondaryAccountSettingActivated: {
        key: createDynamicKey("account-activated-before-{accountId}", [
            "accountId",
        ]),
        schema: {
            activated: createField("boolean", false),
        },
    },
    secondaryAccountUser: {
        key: createDynamicKey("{accountId}-user", ["accountId"]),
        schema: {
            id: createField("number", 0),
            name: createField("string", ""),
        },
    },
    malUser: {
        key: "mal-user",
        schema: {
            id: createField("number", 0),
            name: createField("string", ""),
        },
    },
    aniListUser: {
        key: "anilist-user",
        schema: {
            id: createField("number", 0),
            name: createField("string", ""),
        },
    },
    favoriteAttachments: {
        key: "favorite-attachments",
        schema: {
            ids: createField("array", [], { arrayType: "string" }),
            urls: createField("array", [], { arrayType: "string" }),
        },
    },
} satisfies StorageSchemas;
