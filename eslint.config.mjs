import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

import noLocalStorage from "./eslint-rules/no-localstorage.mjs";

const eslintConfig = defineConfig([
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
        plugins: {
            "react-hooks": reactHooks,
            custom: {
                rules: {
                    "no-localstorage": noLocalStorage,
                },
            },
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/incompatible-library": "warn",
            "custom/no-localstorage": "warn",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
    {
        files: ["src/lib/storage.ts"],
        rules: {
            "custom/no-localstorage": "off",
        },
    },
    globalIgnores([
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        "public/**",
        ".output/**",
        "dist/**",
        "node_modules/**",
    ]),
]);

export default eslintConfig;
