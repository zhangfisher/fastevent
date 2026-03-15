export type RemoveAnyRecord<T extends Record<string, any>> = T extends Record<string, any> &
    (infer X)
    ? X extends Record<string, any>
        ? X
        : Record<string, any>
    : T;
