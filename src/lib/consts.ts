export function get_base_url() {
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    } else if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    } else {
        return "http://localhost:3000";
    }
}
