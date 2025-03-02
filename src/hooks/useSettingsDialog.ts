import { create } from "zustand";

interface SettingsDialogStore {
    isSettingsOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;
    toggleSettings: () => void;
}

export const useSettingsDialog = create<SettingsDialogStore>((set) => ({
    isSettingsOpen: false,
    openSettings: () => set({ isSettingsOpen: true }),
    closeSettings: () => set({ isSettingsOpen: false }),
    toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
}));
