import { STORAGE_SCHEMAS } from "@/config";
import type {
    DataFromSchema,
    FieldType,
    KeyConfig,
    SchemaDefinition,
    StorageBackend,
    StorageValue,
} from "../types/storage";

// Helper to get a specific schema configuration
export type SchemaKey = keyof typeof STORAGE_SCHEMAS;

// Type-safe storage wrapper for a specific schema key
export type StorageType<K extends SchemaKey> = StorageWrapper<
    (typeof STORAGE_SCHEMAS)[K]["schema"]
>;

// Type-safe wrapper for a specific schema
export class StorageWrapper<T extends SchemaDefinition> {
    public key: string | ((params: Record<string, string>) => string);
    private schema: T;
    private separator: string;
    private storageBackend: StorageBackend;
    private description?: string;
    private params?: Record<string, string>;

    constructor(config: KeyConfig<T>, params?: Record<string, string>) {
        this.key = config.key;
        this.schema = config.schema;
        this.separator = config.separator || ",";
        this.storageBackend = config.storageBackend || "local";
        this.params = params;
    }

    private get storage(): Storage {
        if (typeof window === "undefined") {
            // On server side, return a mock storage that does nothing
            return {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
                clear: () => {},
                get length() {
                    return 0;
                },
                key: () => null,
            } as Storage;
        }
        return this.storageBackend === "local" ? localStorage : sessionStorage;
    }

    private getKeyString(): string {
        if (typeof this.key === "function") {
            if (!this.params) {
                throw new Error("Parameters required for dynamic key");
            }
            return this.key(this.params);
        }
        return this.key;
    }

    private getDefaults(): Record<string, StorageValue> {
        const defaults: Record<string, StorageValue> = {};
        for (const key in this.schema) {
            defaults[key] = this.schema[key].default;
        }
        return defaults;
    }

    private encode(data: Record<string, StorageValue>): string {
        const values: string[] = [];

        for (const key in this.schema) {
            if (data[key] !== undefined) {
                const fieldDef = this.schema[key];
                let encodedValue: string;

                if (fieldDef.type === "array" && Array.isArray(data[key])) {
                    const arraySep = fieldDef.arraySeparator || ";";
                    const arrayValues = (data[key] as (string | number)[]).map(
                        (item) =>
                            String(item).replace(
                                new RegExp(`\\${arraySep}`, "g"),
                                `\\${arraySep}`,
                            ),
                    );
                    encodedValue = arrayValues.join(arraySep);
                } else {
                    encodedValue = String(data[key]);
                }

                encodedValue = encodedValue.replace(
                    new RegExp(`\\${this.separator}`, "g"),
                    `\\${this.separator}`,
                );
                values.push(encodedValue);
            } else {
                values.push("");
            }
        }

        return values.join(this.separator);
    }

    private decode(encoded: string): Record<string, StorageValue> {
        const result: Record<string, StorageValue> = {};
        const values = this.splitWithEscape(encoded, this.separator);
        const keys = Object.keys(this.schema);

        keys.forEach((key, index) => {
            const value = values[index] || "";
            const fieldDef = this.schema[key];
            const fieldType = fieldDef.type;

            switch (fieldType) {
                case "number":
                    result[key] = Number(value);
                    break;
                case "boolean":
                    result[key] = value === "true";
                    break;
                case "array": {
                    const arraySep = fieldDef.arraySeparator || ";";
                    const arrayType = fieldDef.arrayType || "string";
                    if (!value) {
                        result[key] = [];
                    } else {
                        const items = this.splitWithEscape(value, arraySep);
                        result[key] =
                            arrayType === "number"
                                ? items.map((item) => Number(item))
                                : items;
                    }
                    break;
                }
                case "string":
                default:
                    result[key] = value;
            }
        });

        return result;
    }

    private splitWithEscape(str: string, separator: string): string[] {
        const result: string[] = [];
        let current = "";
        let escaped = false;

        for (let i = 0; i < str.length; i++) {
            const char = str[i];

            if (escaped) {
                current += char;
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === separator) {
                result.push(current);
                current = "";
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    }

    // Public methods
    set(data: Partial<DataFromSchema<T>>): void {
        const fullData: Record<string, StorageValue> = {
            ...this.getDefaults(),
        };
        for (const key in data) {
            if (data[key] !== undefined) {
                fullData[key] = data[key];
            }
        }
        const key = this.getKeyString();
        const encoded = this.encode(fullData);
        this.storage.setItem(key, encoded);
    }

    get(): DataFromSchema<T> | null {
        const key = this.getKeyString();
        const encoded = this.storage.getItem(key);

        if (!encoded) return null;

        try {
            return this.decode(encoded) as DataFromSchema<T>;
        } catch (error) {
            console.error(
                `Failed to decode storage item with key "${key}":`,
                error,
            );
            return null;
        }
    }

    getWithDefaults(): DataFromSchema<T> {
        const stored = this.get();
        if (stored) return stored;

        // Return schema defaults
        return this.getDefaults() as DataFromSchema<T>;
    }

    update(updates: Partial<DataFromSchema<T>>): void {
        const current = this.get() || this.getDefaults();
        const updated = { ...current, ...updates };
        this.set(updated as Partial<DataFromSchema<T>>);
    }

    remove(): void {
        const key = this.getKeyString();
        this.storage.removeItem(key);
    }

    has(): boolean {
        const key = this.getKeyString();
        return this.storage.getItem(key) !== null;
    }

    clearAll(pattern?: string | RegExp): void {
        if (!pattern) {
            this.storage.removeItem(this.getKeyString());
            return;
        }

        const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);

        for (let i = this.storage.length - 1; i >= 0; i--) {
            const key = this.storage.key(i);
            if (key && regex.test(key)) {
                this.storage.removeItem(key);
            }
        }
    }

    getDescription(): string | undefined {
        return this.description;
    }
}

// Centralized storage manager
export class StorageManager {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static instances = new Map<string, StorageWrapper<any>>();

    private static getInstanceKey(
        schemaKey: SchemaKey,
        params?: Record<string, string>,
    ): string {
        if (!params) return schemaKey;
        const normalized = Object.keys(params)
            .sort()
            .map((key) => `${key}:${params[key]}`)
            .join("|");
        return `${schemaKey}:${normalized}`;
    }

    // Get a wrapper for a specific schema
    static get<T extends SchemaKey>(
        schemaKey: T,
        params?: Record<string, string>,
    ): StorageWrapper<(typeof STORAGE_SCHEMAS)[T]["schema"]> {
        const instanceKey = this.getInstanceKey(schemaKey, params);
        if (!this.instances.has(instanceKey)) {
            const config = STORAGE_SCHEMAS[
                schemaKey
            ] as KeyConfig<SchemaDefinition>;
            if (typeof config.key === "function" && !params) {
                throw new Error("Parameters required for dynamic key");
            }
            const instance = new StorageWrapper(config, params);
            this.instances.set(instanceKey, instance);
        }
        return this.instances.get(instanceKey)! as StorageWrapper<
            (typeof STORAGE_SCHEMAS)[T]["schema"]
        >;
    }

    // Clear all storage items (use with caution)
    static clearAllStorage(): void {
        if (typeof window !== "undefined") {
            localStorage.clear();
            sessionStorage.clear();
        }
        this.instances.clear();
    }
}

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

export function useStorage<T extends SchemaKey>(
    schemaKey: T,
    params?: Record<string, string>,
) {
    return StorageManager.get(schemaKey, params);
}
