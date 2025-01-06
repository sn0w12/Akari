export function getBaseUrl() {
    const vercelEnv = process.env.VERCEL_ENV;
    const port = process.env.PORT || 3000;

    if (vercelEnv) {
        if (vercelEnv === "production") {
            return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
        } else {
            return `https://${process.env.VERCEL_BRANCH_URL}`;
        }
    } else {
        return `http://127.0.0.1:${port}`;
    }
}

export function getProductionUrl() {
    const vercelEnv = process.env.VERCEL_ENV;
    const port = process.env.PORT || 3000;

    if (vercelEnv) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    } else {
        return `http://127.0.0.1:${port}`;
    }
}
