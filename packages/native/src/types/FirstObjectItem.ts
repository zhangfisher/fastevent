import { Keys } from './Keys';

/**
 * 保留对象中第一项
 */
export type FirstObjectItem<T extends Record<string, any>> = Pick<T, Keys<T> extends any[] ? Keys<T>[0] : never>;
  
// type isEmpty<T extends Record<string, any>> = keyof T extends never ? true : false;
// // 获取所有Key包括通配符字符*的项
// export type GetWildcardItems<T extends Record<string, any>> = {
//     [K in keyof T as K extends `${string}*${string}` ? K : K extends `*`  ? K : never]: T[K];
// }

// export type GetNotWildcardItems<T extends Record<string, any>> = {
//     [K in keyof T as K extends `${string}*${string}` ? never : K extends `*`  ? never : K]: T[K];
// }

// export type GetFirstMatchedItem<T extends Record<string, any>> =FirstObjectItem<isEmpty<GetNotWildcardItems<T>> extends true
//     ? GetWildcardItems<T>
//     : GetNotWildcardItems<T>>


// // type Events = {
// //    'rooms/*/$join': { room: string; welcome: string; users: string[] }
// //     'rooms/*/$leave': string
// //     'rooms/*/$error': string
// //     'rooms/*/$add': string
// //     'rooms/*/$remove': string
// //     'rooms/*/*': number
// // };
// type F1 =GetWildcardItems<{
//     'a': string
//     'b': number    
//     'rooms/*/$join': number 
//     'c': number    
//     '*': string
// }>
// type F2 =GetNotWildcardItems<{
//     'a': string
//     'b': number    
//     'rooms/*/$join': number 
//     'c': number    
//     '*': string
// }>

// type f1 = GetFirstMatchedItem<{
//     'rooms/*/$join': number
//     'rooms/a/$join': string
// }>
// type f2 = GetFirstMatchedItem<{
//     'rooms/a/$join': string
//     'rooms/*/$join': number    
// }>

// type f3 = GetFirstMatchedItem<{
//     'rooms/a/$join': string
//     'rooms/b/$join': number    
//     'rooms/c/$join': number    
//     '*': string
// }>
// type f4 = GetFirstMatchedItem<{
//     'a': string
//     'b': number    
//     'c': number    
//     '*': string
// }>
// type f5 = GetFirstMatchedItem<{
//     'rooms/a/$join': string
//     'rooms/b/$join': number    
//     'rooms/c/$join': number    
//     '*': string
// }>
// type f6 = GetFirstMatchedItem<{}>