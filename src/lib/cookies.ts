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
