/**
 * 返回对象的所有Keys
 */
export type ObjectKeys<T, I = string> = {
    [P in keyof T]: P extends I ? P : never;
}[keyof T];
