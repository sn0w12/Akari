import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import noLocalStorage from "./eslint-rules/no-localstorage.mjs";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            "custom/no-localstorage": "warn",
        },
        plugins: {
            custom: {
                rules: {
                    "no-localstorage": noLocalStorage,
                },
            },
        },
    },
    {
        // Disable the rule in storage.ts to avoid false positives
        files: ["src/lib/storage.ts"],
        rules: {
            "custom/no-localstorage": "off",
        },
    },
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        "public/**",
    ]),
]);

export default eslintConfig;
