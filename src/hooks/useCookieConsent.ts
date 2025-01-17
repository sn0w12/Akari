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
            setConsent: (category, value) =>
                set((state) => ({
                    consent: { ...state.consent, [category]: value },
                })),
            setInteracted: () => set({ hasInteracted: true }),
        }),
        { name: "cookie-consent" },
    ),
);
