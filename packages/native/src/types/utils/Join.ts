// 将字符串数组连接成字符串
export type Join<T extends string[], Delimiter extends string = "/"> = T extends [
    infer First extends string,
    ...infer Rest extends string[],
]
    ? Rest["length"] extends 0
        ? First
        : `${First}${Delimiter}${Join<Rest, Delimiter>}`
    : "";

// export type Join<Arr extends string[], Delimiter extends string = "/"> = Arr extends []
//     ? ""
//     : Arr extends [infer First extends string]
//       ? First
//       : Arr extends [infer First extends string, ...infer Rest extends string[]]
//         ? `${First}${Delimiter}${Join<Rest, Delimiter>}`
//         : string;
