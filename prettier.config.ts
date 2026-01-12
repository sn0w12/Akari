import { type Config } from "prettier";

const config: Config = {
    tabWidth: 4,
    useTabs: false,
    endOfLine: "auto",
    plugins: ["prettier-plugin-organize-imports"],
};

export default config;
