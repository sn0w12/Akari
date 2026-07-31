import {
    RegisterableHotkey,
    useHotkey,
    UseHotkeyOptions,
} from "@tanstack/react-hotkeys";

// A valid Hotkey that is almost never used intentionally.
// It will only be active if `shortcut` is provided AND `enabled` is true –
// but in that case we never use this dummy value.
const DISABLED_HOTKEY = "Control+Alt+Shift+Meta+F12";

/**
 * Wraps `useHotkey` and makes the `shortcut` optional.
 * If `shortcut` is falsy, the hotkey is disabled.
 *
 * @param shortcut - The hotkey(s) to listen for (optional).
 * @param callback - Function called when the hotkey is pressed.
 * @param options - Additional options (enabled, preventDefault, scope, etc.).
 */
export function useOptionalHotkey(
    shortcut?: RegisterableHotkey | null,
    callback?: (event: KeyboardEvent) => void,
    options?: UseHotkeyOptions,
): void {
    // Use the dummy when no shortcut is given – it's safe because we force `enabled: false`.
    const effectiveShortcut = shortcut ?? DISABLED_HOTKEY;

    // Only enable if a real shortcut was provided and (if specified) the user's `enabled` is true.
    const enabled = shortcut ? (options?.enabled ?? true) : false;

    useHotkey(effectiveShortcut, callback ?? (() => {}), {
        ...options,
        enabled,
    });
}
