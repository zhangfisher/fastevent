

export async function defaultExecuteor(listeners: any[]) {
    return Promise.allSettled(listeners)
}

export async function raceExecuteor(listeners: any[]) {
    return Promise.race(listeners)
}

/**
 * 负载均衡执行器
 * 
 * 记录每个执行器的执行次数，尽可能平均分配每个listener的执行次数
 * 
 * @param listeners 监听器数组
 * @returns Promise 最先完成的监听器的执行结果
 */
export async function balanceExecuteor(listeners: any[]) {
    return Promise.race(listeners)
}
