import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                "accent-color": "#6366F1", // Tailwind's indigo-500
                success: {
                    DEFAULT: "#10B981", // Tailwind's green-500
                    light: "#6EE7B7", // Light variant of green-500
                    dark: "#047857", // Dark variant of green-500
                },
                warning: {
                    DEFAULT: "#F59E0B", // Tailwind's yellow-500
                    light: "#FDE68A", // Light variant of yellow-500
                    dark: "#B45309", // Dark variant of yellow-500
                },
                danger: {
                    DEFAULT: "#DC2626", // Tailwind's red-600
                    light: "#F87171", // Light variant of red-600
                    dark: "#991B1B", // Dark variant of red-600
                },
                info: {
                    DEFAULT: "#0EA5E9", // Tailwind's sky-500
                    light: "#7DD3FC", // Light variant of sky-500
                    dark: "#0369A1", // Dark variant of sky-500
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                chart: {
                    "1": "hsl(var(--chart-1))",
                    "2": "hsl(var(--chart-2))",
                    "3": "hsl(var(--chart-3))",
                    "4": "hsl(var(--chart-4))",
                    "5": "hsl(var(--chart-5))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            width: {
                "128": "32rem",
            },
            height: {
                "128": "32rem",
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
        require("@tailwindcss/typography"),
    ],
};
export default config;
