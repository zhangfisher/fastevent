import { ChangeFieldType } from "./ChangeFieldType";

// 用当继承FastEvent时重载Options使用

export type OverrideOptions<T> = ChangeFieldType<Required<T>, "context", never>;
