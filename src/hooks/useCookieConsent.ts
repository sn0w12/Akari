import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CookieConsent, CookieCategory } from "@/lib/cookies";

interface CookieStore {
    consent: CookieConsent;
    setConsent: (category: CookieCategory, value: boolean) => void;
    hasInteracted: boolean;
    setInteracted: () => void;
}

export const useCookieConsent = create<CookieStore>()(
    persist(
        (set) => ({
            consent: {
                necessary: false,
                functional: false,
                analytics: false,
            },
            hasInteracted: false,
            setConsent: (category, value) => {
                set((state) => {
                    const newConsent = {
                        ...state.consent,
                        [category]: value,
                    };
                    document.cookie = `cookie-consent=${JSON.stringify(newConsent)};path=/;max-age=31536000`;
                    return { consent: newConsent };
                });
            },
            setInteracted: () => set({ hasInteracted: true }),
        }),
        { name: "cookie-consent" },
    ),
);
