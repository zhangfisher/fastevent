// 分割字符串为元组类型
export type Split<
    S extends string,
    Delimiter extends string = "/",
> = S extends `${infer Head}${Delimiter}${infer Tail}` ? [Head, ...Split<Tail, Delimiter>] : [S];
