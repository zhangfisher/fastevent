/**
 * 从数组中移除满足条件的元素并返回被移除元素的索引
 * @param {any[]} arr - 需要操作的数组
 * @param {(item: any) => boolean} condition - 判断元素是否应该被移除的条件函数
 * @returns {number[]} 被移除元素在原数组中的索引集合
 */
export function removeItem(arr: any[], condition: (item: any) => boolean) {
    const removedIndices: number[] = [];
    // 从后往前遍历，避免删除元素时索引变化的问题
    for (let i = arr.length - 1; i >= 0; i--) {
        if (condition(arr[i])) {
            removedIndices.push(i); // 记录原始索引
            arr.splice(i, 1); // 删除元素
        }
    }

    // 因为是从后往前遍历的，所以索引是降序的，需要反转得到升序结果
    return removedIndices.reverse();
}
// let index: number[] = [];
// while (true) {
//     const i = arr.findIndex((item) => {
//         return condition(item);
//     });
//     if (i === -1) {
//         index.push(i);
//         break;
//     }
//     arr.splice(i, 1);
// }
// return index;
