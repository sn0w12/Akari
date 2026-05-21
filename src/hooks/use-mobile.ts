import { useMediaQuery } from "./use-media-query";

export function useIsMobile() {
    return useMediaQuery({ pointer: "coarse" });
}
