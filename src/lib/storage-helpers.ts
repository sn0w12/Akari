import type { FieldType, StorageValue } from "../types/storage";

export const createDynamicKey = (
    basePattern: string,
    paramNames: string[],
): ((params: Record<string, string>) => string) => {
    return (params: Record<string, string>) => {
        let key = basePattern;
        paramNames.forEach((param) => {
            if (params[param]) {
                key = key.replace(`{${param}}`, params[param]);
            } else {
                throw new Error(`Missing required parameter: ${param}`);
            }
        });
        return key;
    };
};

export const createKeyPattern = (basePattern: string): RegExp => {
    const pattern = basePattern.replace(/\{[^}]+\}/g, "([^\\-]+)");
    return new RegExp(`^${pattern}$`);
};

export const createField = <T extends FieldType>(
    type: T,
    defaultValue: StorageValue,
    options?: { arrayType?: "string" | "number"; arraySeparator?: string },
) =>
    ({
        type,
        default: defaultValue,
        ...(options?.arrayType && { arrayType: options.arrayType }),
        ...(options?.arraySeparator && {
            arraySeparator: options.arraySeparator,
        }),
    }) as const;
