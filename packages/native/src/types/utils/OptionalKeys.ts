import { Expand } from "./Expand";

export type OptionalKeys<T, K extends keyof T> = Expand<
    Omit<T, K> & {
        [P in K]?: T[P];
    }
>;

// type A=OptionalItems<{
//     type:string
//     payload: object
//     meta:{
//         a:1
//     }
// },'meta'>
