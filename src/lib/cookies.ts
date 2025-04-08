import { useCookieConsent } from "@/hooks/useCookieConsent";

export type CookieConsent = {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
};

export type CookieCategory = keyof CookieConsent;

export const setCookie = (
    name: string,
    value: string,
    category: CookieCategory,
    maxAge = 31536000,
) => {
    const { consent } = useCookieConsent.getState();

    if (!consent[category]) {
        return false;
    }

    document.cookie = `${name}=${value};path=/;max-age=${maxAge}`;
    return true;
};

export function getServerCookieConsent(cookieStore: {
    get: (arg0: string) => { value: string } | undefined;
}): CookieConsent {
    const consentCookie = cookieStore.get("cookie-consent");

    if (!consentCookie) {
        return {
            necessary: true,
            functional: false,
            analytics: false,
        };
    }

    return JSON.parse(consentCookie.value);
}

export function hasConsentFor(
    cookieStore: { get: (arg0: string) => { value: string } | undefined },
    category: keyof CookieConsent,
): boolean {
    const consent = getServerCookieConsent(cookieStore);
    return category === "necessary" || consent[category];
}
