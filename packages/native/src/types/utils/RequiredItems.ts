export type RequiredItems<T extends object, Items extends string[]> = Omit<T, Items[number]> & {
    [K in Items[number] & keyof T]-?: Exclude<T[K], undefined>;
};
