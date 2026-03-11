import { Expand } from "./Expand";

export type ChangeFieldType<Record, Name extends string, Type = any> = Expand<
    Omit<Record, Name> & {
        [K in Name]: Type;
    }
>;
