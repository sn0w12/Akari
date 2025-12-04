import { STORAGE_SCHEMAS } from "@/config";
import type {
    StorageValue,
    SchemaDefinition,
    KeyConfig,
    FieldType,
    StorageBackend,
    DataFromSchema,
} from "../types/storage";

// Helper to get a specific schema configuration
export type SchemaKey = keyof typeof STORAGE_SCHEMAS;

// Type-safe wrapper for a specific schema
export class StorageWrapper<T extends SchemaDefinition> {
    public key: string | ((params: Record<string, string>) => string);
    private schema: T;
    private separator: string;
    private storageBackend: StorageBackend;
    private description?: string;

    constructor(config: KeyConfig<T>) {
        this.key = config.key;
        this.schema = config.schema;
        this.separator = config.separator || ",";
        this.storageBackend = config.storageBackend || "local";
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

    private getKeyString(params?: Record<string, string>): string {
        if (typeof this.key === "function") {
            if (!params) {
                throw new Error("Parameters required for dynamic key");
            }
            return this.key(params);
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
                const value = String(data[key]).replace(
                    new RegExp(`\\${this.separator}`, "g"),
                    `\\${this.separator}`
                );
                values.push(value);
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
            const fieldType = this.schema[key].type;

            switch (fieldType) {
                case "number":
                    result[key] = Number(value);
                    break;
                case "boolean":
                    result[key] = value === "true";
                    break;
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
    set(
        data: Partial<DataFromSchema<T>>,
        params?: Record<string, string>
    ): void {
        const fullData: Record<string, StorageValue> = {
            ...this.getDefaults(),
        };
        for (const key in data) {
            if (data[key] !== undefined) {
                fullData[key] = data[key];
            }
        }
        const key = this.getKeyString(params);
        const encoded = this.encode(fullData);
        this.storage.setItem(key, encoded);
    }

    get(params?: Record<string, string>): DataFromSchema<T> | null {
        const key = this.getKeyString(params);
        const encoded = this.storage.getItem(key);

        if (!encoded) return null;

        try {
            return this.decode(encoded) as DataFromSchema<T>;
        } catch (error) {
            console.error(
                `Failed to decode storage item with key "${key}":`,
                error
            );
            return null;
        }
    }

    getWithDefaults(params?: Record<string, string>): DataFromSchema<T> {
        const stored = this.get(params);
        if (stored) return stored;

        // Return schema defaults
        return this.getDefaults() as DataFromSchema<T>;
    }

    update(
        updates: Partial<DataFromSchema<T>>,
        params?: Record<string, string>
    ): void {
        const current = this.get(params) || this.getDefaults();
        const updated = { ...current, ...updates };
        this.set(updated as Partial<DataFromSchema<T>>, params);
    }

    remove(params?: Record<string, string>): void {
        const key = this.getKeyString(params);
        this.storage.removeItem(key);
    }

    has(params?: Record<string, string>): boolean {
        const key = this.getKeyString(params);
        return this.storage.getItem(key) !== null;
    }

    clearAll(pattern?: string | RegExp): void {
        if (!pattern && typeof this.key === "string") {
            this.storage.removeItem(this.key);
            return;
        }

        const regex =
            pattern instanceof RegExp
                ? pattern
                : typeof pattern === "string"
                ? new RegExp(pattern)
                : typeof this.key === "function"
                ? new RegExp(this.key({}).replace(/\{[^}]+\}/g, ".*"))
                : null;

        if (!regex) return;

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
    private static instances = new Map<SchemaKey, StorageWrapper<any>>();

    // Get a wrapper for a specific schema
    static get<T extends SchemaKey>(
        schemaKey: T
    ): StorageWrapper<(typeof STORAGE_SCHEMAS)[T]["schema"]> {
        if (!this.instances.has(schemaKey)) {
            const config = STORAGE_SCHEMAS[
                schemaKey
            ] as KeyConfig<SchemaDefinition>;
            const instance = new StorageWrapper(config);
            this.instances.set(schemaKey, instance);
        }
        return this.instances.get(schemaKey)! as StorageWrapper<
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
    paramNames: string[]
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
    defaultValue: StorageValue
) => ({ type, default: defaultValue } as const);

export function useStorage<T extends SchemaKey>(schemaKey: T) {
    return StorageManager.get(schemaKey);
}
