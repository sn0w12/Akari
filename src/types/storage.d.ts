export type StorageValue = string | number | boolean;
export type FieldType = "string" | "number" | "boolean";
export type StorageBackend = "local" | "session";
export type StorageSchema = Record<string, StorageValue>;
export type StorageEntry<T extends StorageSchema> = {
    [K in keyof T]: T[K];
};

export type SchemaField = {
    type: FieldType;
    default: StorageValue;
};

export type SchemaDefinition = Record<string, SchemaField>;

export type KeyConfig<T extends SchemaDefinition> = {
    key: string | ((params: Record<string, string>) => string);
    schema: T;
    separator?: string;
    storageBackend?: StorageBackend;
};

export type StorageSchemas = {
    [key: string]: KeyConfig<unknown>;
};

export type SchemaFromConfig<T extends KeyConfig<unknown>> =
    T extends KeyConfig<infer S> ? S : never;

export type DataFromSchema<T extends SchemaDefinition> = {
    [K in keyof T]: T[K]["type"] extends "string"
        ? string
        : T[K]["type"] extends "number"
          ? number
          : boolean;
};
