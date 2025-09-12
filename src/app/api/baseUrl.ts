export function getBaseUrl() {
    const host = process.env.NEXT_HOST;
    if (host) {
        return `https://${host}`;
    }

    const vercelEnv = process.env.VERCEL_ENV;
    const port = process.env.PORT || 3000;

    if (vercelEnv) {
        if (vercelEnv === "production") {
            return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
        } else {
            return `https://${process.env.VERCEL_BRANCH_URL}`;
        }
    } else {
        return `http://localhost:${port}`;
    }
}

export function getProductionUrl() {
    const host = process.env.NEXT_HOST;
    if (host) {
        return `https://${host}`;
    }

    const vercelEnv = process.env.VERCEL_ENV;
    const port = process.env.PORT || 3000;

    if (vercelEnv) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    } else {
        return `http://localhost:${port}`;
    }
}
