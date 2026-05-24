export function env(name: string): string | undefined {
    const sources = [
        () =>
            typeof process !== "undefined" && process.env
                ? process.env[name]
                : undefined,
        () => {
            try {
                return import.meta.env?.[name];
            } catch {
                return undefined;
            }
        },
    ];

    for (const source of sources) {
        const value = source();
        if (value !== undefined && value !== "") return value;
    }
    return undefined;
}
