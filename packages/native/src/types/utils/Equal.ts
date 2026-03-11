/**
 * 判断两个类型是否相等
 * @description 使用函数返回类型来比较两个类型是否完全相同
 */
export type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
