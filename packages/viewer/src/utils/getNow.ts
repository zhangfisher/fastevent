/**
 * 获取高精度当前时间
 * @returns 返回相对于性能时间原点的高精度时间戳（毫秒，带小数部分）
 *
 * 使用 performance.now() 提供亚毫秒级精度（微秒级）
 * 在浏览器和 Node.js 环境中都可使用
 *
 * @example
 * ```ts
 * const start = getNow();
 * // 执行一些操作
 * const end = getNow();
 * const duration = end - start; // 精确到微秒的耗时
 * ```
 */
export function getNow(): number {
  return performance.now();
}

/**
 * 获取高精度当前时间（整数纳秒级）
 * @returns 返回 bigint 类型的纳秒时间戳
 *
 * 仅在 Node.js 环境中可用，提供纳秒级精度
 *
 * @example
 * ```ts
 * const start = getNowBigInt();
 * // 执行一些操作
 * const end = getNowBigInt();
 * const duration = Number(end - start) / 1_000_000; // 转换为毫秒
 * ```
 */
export function getNowBigInt(): bigint {
  // @ts-expect-error - process.hrtime 在 Node.js 环境中可用
  return process?.hrtime?.bigint?.() ?? BigInt(Math.floor(performance.now() * 1_000_000));
}
