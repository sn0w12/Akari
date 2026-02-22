import { execSync } from "child_process";
import { existsSync, readdirSync } from "fs";
import { extname, join } from "path";

const templatesDir = join(__dirname, "..", "emails", "templates");
const outputDir = join(__dirname, "..", "public", "email-templates");

// Ensure output directory exists
if (!existsSync(outputDir)) {
    execSync(`mkdir -p "${outputDir}"`);
}

// Get all .mjml files except head.mjml
const mjmlFiles = readdirSync(templatesDir)
    .filter((file) => extname(file) === ".mjml" && file !== "head.mjml")
    .map((file) => file.replace(".mjml", ""));

console.log("Compiling MJML templates to HTML...");

for (const file of mjmlFiles) {
    const inputPath = join(templatesDir, `${file}.mjml`);
    const outputPath = join(outputDir, `${file}.html`);

    try {
        execSync(`mjml "${inputPath}" -o "${outputPath}"`, {
            stdio: "inherit",
        });
        console.log(`✓ Compiled ${file}.mjml to ${file}.html`);
    } catch (error) {
        console.error(`✗ Failed to compile ${file}.mjml:`, error);
        process.exit(1);
    }
}

console.log("All templates compiled successfully!");
