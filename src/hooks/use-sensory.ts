import { useCallback } from "react";
import { useSetting } from "../lib/settings";
import { useWebHaptics } from "web-haptics/react";
import { play as triggerSound, type SoundName } from "cuelume";

export type Interactions =
    | "press"
    | "info"
    | "success"
    | "error"
    | "warning"
    | "destructive";

interface InteractionPreset {
    sound: SoundName;
    haptic:
        | "success"
        | "warning"
        | "error"
        | "light"
        | "medium"
        | "heavy"
        | "soft"
        | "rigid"
        | "selection"
        | "nudge"
        | "buzz";
}

const sensoryToPreset: Record<Interactions, InteractionPreset> = {
    press: { sound: "press", haptic: "light" },
    info: { sound: "ready", haptic: "soft" },
    success: { sound: "success", haptic: "success" },
    error: { sound: "error", haptic: "error" },
    warning: { sound: "ready", haptic: "warning" },
    destructive: { sound: "bloom", haptic: "nudge" },
};

export function useSensory() {
    const canHaptic = useSetting("hapticFeedback");
    const canSound = useSetting("soundFeedback");

    const { trigger: triggerHaptic } = useWebHaptics();

    const trigger = useCallback(
        (interaction: Interactions) => {
            if (!canHaptic && !canSound) return;

            const preset = sensoryToPreset[interaction];
            if (canHaptic) void triggerHaptic(preset.haptic);
            if (canSound) triggerSound(preset.sound);
        },
        [canHaptic, canSound, triggerHaptic],
    );

    return { trigger };
}
