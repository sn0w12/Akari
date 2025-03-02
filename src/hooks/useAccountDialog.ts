import { create } from "zustand";

interface AccountDialogStore {
    isAccountOpen: boolean;
    openAccount: () => void;
    closeAccount: () => void;
    toggleAccount: () => void;
}

export const useAccountDialog = create<AccountDialogStore>((set) => ({
    isAccountOpen: false,
    openAccount: () => set({ isAccountOpen: true }),
    closeAccount: () => set({ isAccountOpen: false }),
    toggleAccount: () =>
        set((state) => ({ isAccountOpen: !state.isAccountOpen })),
}));
