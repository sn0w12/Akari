declare global {
    type components = import("./api").components;
    type paths = import("./api").paths;
}

export {};
