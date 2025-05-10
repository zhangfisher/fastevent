import { isExpandable } from "./expandable";
/**
 * 
 * 判断成员isExpandable，如果是则说明是一个数组，则原地展开
 * 
 * 
 */
export function expandEmitResults(items: any[]): any[] {
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (Array.isArray(item) && isExpandable(item)) {
            items.splice(i, 1, ...item)
            i += item.length - 1
        }
    }
    return items

}


// import { expandable } from "./expandable";
// const items = [1, 2, expandable([3, 4]), 0, 0, expandable([5, 6]), expandable([7, 8]), 9, 10, 11]
// // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
// expandEmitResults(items)
// console.log(items)