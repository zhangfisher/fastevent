import { Expand } from "../Expand";

export type OptionalItems<T, K extends keyof T> = Expand<
    Omit<T, K> & {
        [P in K]?: T[P];
    }
>;
