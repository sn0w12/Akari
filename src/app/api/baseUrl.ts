export function getBaseUrl() {
    const vercelEnv = process.env.VERCEL_ENV;
    if (vercelEnv) {
        if (vercelEnv === "production") {
            return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
        } else {
            return `https://${process.env.VERCEL_BRANCH_URL}`;
        }
    } else {
        return "http://localhost:3000";
    }
}

export function getProductionUrl() {
    const vercelEnv = process.env.VERCEL_ENV;
    if (vercelEnv) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    } else {
        return "http://localhost:3000";
    }
}
