type PathsWithMethod<Paths, Method extends string> = keyof {
    [Path in keyof Paths as Paths[Path] extends { [M in Method]: unknown }
        ? Path
        : never]: Paths[Path];
};

export type GetPaths = PathsWithMethod<paths, "get">;
export type PostPaths = PathsWithMethod<paths, "post">;
export type PutPaths = PathsWithMethod<paths, "put">;
export type DeletePaths = PathsWithMethod<paths, "delete">;
export type PatchPaths = PathsWithMethod<paths, "patch">;
export type HeadPaths = PathsWithMethod<paths, "head">;
export type OptionsPaths = PathsWithMethod<paths, "options">;

export type AllPaths =
    | GetPaths
    | PostPaths
    | PutPaths
    | DeletePaths
    | PatchPaths
    | HeadPaths
    | OptionsPaths;
