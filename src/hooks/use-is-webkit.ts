import { useEffect, useState } from "react";

export function useIsWebKit(): boolean {
    const [isWebKit, setIsWebKit] = useState(false);

    useEffect(() => {
        setIsWebKit(
            typeof CSS !== "undefined" &&
                !!CSS.supports?.("-webkit-backdrop-filter:none"),
        );
    }, []);

    return isWebKit;
}
