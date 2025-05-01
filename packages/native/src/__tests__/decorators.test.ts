import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { FastEvent } from "../event"
import { queue } from "../decorators/queue"

describe("监听器装饰器", () => {
    let emitter: FastEvent

    beforeEach(() => {
        emitter = new FastEvent()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    // 使用Promise包装setTimeout，配合vi.advanceTimersByTime使用
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    describe("Queue", () => {
        it("应该使用默认配置正确工作", async () => {
            const results: number[] = []

            // 不传入任何配置，使用默认值
            emitter.on("test", async (msg) => {
                await delay(50)  // 每个消息处理时间50ms
                results.push(msg.payload)
            }, {
                decorators: [queue()]
            })

            // 快速发送12个消息
            // - 第1个消息直接处理
            // - 接下来10个消息进入缓冲区（默认大小为10）
            // - 第12个消息由于缓冲区已满，根据slide策略会替换掉最早进入缓冲区的消息
            await Promise.all([
                emitter.emit("test", 0),   // 直接处理
                emitter.emit("test", 1),   // 进入缓冲区
                emitter.emit("test", 2),   // 进入缓冲区
                emitter.emit("test", 3),   // 进入缓冲区
                emitter.emit("test", 4),   // 进入缓冲区
                emitter.emit("test", 5),   // 进入缓冲区
                emitter.emit("test", 6),   // 进入缓冲区
                emitter.emit("test", 7),   // 进入缓冲区
                emitter.emit("test", 8),   // 进入缓冲区
                emitter.emit("test", 9),   // 进入缓冲区
                emitter.emit("test", 10),  // 进入缓冲区
                emitter.emit("test", 11),  // 替换掉消息1
            ])

            // 推进时间以处理所有消息
            await vi.advanceTimersByTimeAsync(50)  // 处理消息0
            for (let i = 0; i < 11; i++) {
                await vi.advanceTimersByTimeAsync(50)  // 处理缓冲区中的消息
            }

            // 期望结果：
            // - 消息0直接处理
            // - 消息1-10进入缓冲区
            // - 消息11替换掉消息1
            // 所以最终结果应该是[0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            expect(results).toEqual([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        })

        it("应该按顺序处理消息", async () => {
            const results: number[] = []

            emitter.on("test", async (msg) => {
                await delay(msg.payload)  // 延迟处理
                results.push(msg.payload)
            }, {
                decorators: [queue()]
            })

            // 发送3个消息，每个都有不同的处理时间
            await Promise.all([
                emitter.emit("test", 100),  // 延迟100ms
                emitter.emit("test", 50),   // 延迟50ms
                emitter.emit("test", 30),   // 延迟30ms
            ])

            // 推进时间以处理所有消息
            await vi.advanceTimersByTimeAsync(100)  // 处理第一个消息
            await vi.advanceTimersByTimeAsync(50)   // 处理第二个消息
            await vi.advanceTimersByTimeAsync(30)   // 处理第三个消息

            // 虽然后面的消息处理时间更短，但应该按照发送顺序处理
            expect(results).toEqual([100, 50, 30])
        })

        it("当缓冲区满时应该根据溢出策略处理消息", async () => {
            const results: number[] = []

            // 设置缓冲区大小为2，使用drop策略
            emitter.on("test", async (msg) => {
                await delay(50)  // 每个消息处理时间50ms
                results.push(msg.payload)
            }, {
                decorators: [queue({ size: 2, overflow: "drop" })]
            })

            // 快速发送4个消息
            await Promise.all([
                emitter.emit("test", 1),
                emitter.emit("test", 2),
                emitter.emit("test", 3),
                emitter.emit("test", 4),
            ])

            // 推进时间以处理所有消息
            await vi.advanceTimersByTimeAsync(50)  // 处理第一个消息
            await vi.advanceTimersByTimeAsync(50)  // 处理第二个消息
            await vi.advanceTimersByTimeAsync(50)  // 处理第三个消息

            // 由于缓冲区大小为2，且使用drop策略，应该只处理前3个消息
            // 第一个消息直接处理，第2、3个进入缓冲区，第4个被丢弃
            expect(results).toEqual([1, 2, 3])
        })

        it("使用slide策略时应该丢弃旧消息", async () => {
            const results: number[] = []

            // 设置缓冲区大小为2，使用slide策略
            emitter.on("test", async (msg) => {
                await delay(50)
                results.push(msg.payload)
            }, {
                decorators: [queue({ size: 2, overflow: "slide" })]
            })

            // 快速发送4个消息
            await Promise.all([
                emitter.emit("test", 1),
                emitter.emit("test", 2),
                emitter.emit("test", 3),
                emitter.emit("test", 4),
            ])

            // 推进时间以处理所有消息
            await vi.advanceTimersByTimeAsync(50)  // 处理第一个消息
            await vi.advanceTimersByTimeAsync(50)  // 处理第三个消息（第二个被丢弃）
            await vi.advanceTimersByTimeAsync(50)  // 处理第四个消息

            // 第一个消息直接处理，当发送第4个消息时，第2个消息被丢弃
            expect(results).toEqual([1, 3, 4])
        })

        it("使用expand策略时应该扩展缓冲区", async () => {
            const results: number[] = []

            // 设置初始缓冲区大小为2，使用expand策略，最大扩展到4
            emitter.on("test", async (msg) => {
                await delay(50)
                results.push(msg.payload)
            }, {
                decorators: [queue({ size: 2, overflow: "expand", maxExpandSize: 4 })]
            })

            // 快速发送5个消息
            // - 第1个消息直接处理
            // - 第2-4个消息进入扩展的缓冲区（从大小2扩展到4）
            // - 第5个消息被丢弃（已达到最大扩展大小）
            await Promise.all([
                emitter.emit("test", 1),
                emitter.emit("test", 2),
                emitter.emit("test", 3),
                emitter.emit("test", 4),
                emitter.emit("test", 5),
            ])

            // 推进时间以处理所有消息
            await vi.advanceTimersByTimeAsync(50)  // 处理第一个消息
            await vi.advanceTimersByTimeAsync(50)  // 处理第二个消息
            await vi.advanceTimersByTimeAsync(50)  // 处理第三个消息
            await vi.advanceTimersByTimeAsync(50)  // 处理第四个消息

            // 缓冲区会扩展到最大值4，第5个消息被丢弃
            expect(results).toEqual([1, 2, 3, 4])
        })

        it("使用throw策略时应该返回错误", async () => {
            const results: number[] = []

            // 设置缓冲区大小为2，使用throw策略
            emitter.on("test", async (msg) => {
                await delay(50)
                results.push(msg.payload)
            }, {
                decorators: [queue({ size: 2, overflow: "throw" })]
            })

            // 发送第一个消息（开始处理但还未完成）
            const firstMessagePromise = emitter.emit("test", 1)[0]

            // 等待一小段时间确保第一个消息开始处理
            await vi.advanceTimersByTimeAsync(10)

            // 发送第二个消息（进入缓冲区）
            const secondMessagePromise = emitter.emit("test", 2)[0]

            // 发送第三个消息（进入缓冲区）
            const thirdMessagePromise = emitter.emit("test", 3)[0]

            // 发送第四个消息（缓冲区已满，应该抛出错误）
            const fourthMessageResults = emitter.emit("test", 4)
            await expect(fourthMessageResults[0]).rejects.toThrow('Queue buffer overflow')

            // 推进时间完成第一个消息的处理
            await vi.advanceTimersByTimeAsync(40)  // 剩余40ms
            await firstMessagePromise[0]

            // 推进时间完成第二个消息的处理
            await vi.advanceTimersByTimeAsync(50)
            await secondMessagePromise[0]

            // 推进时间完成第三个消息的处理
            await vi.advanceTimersByTimeAsync(50)
            await thirdMessagePromise[0]

            // 验证消息处理顺序
            expect(results).toEqual([1, 2, 3])
        })

        it("当消息处理出错时应该能正确恢复", async () => {
            const results: number[] = []

            emitter.on("test", async (msg) => {
                await delay(10)
                if (msg.payload === 2) {
                    throw new Error("处理消息2时出错")
                }
                results.push(msg.payload)
            }, {
                decorators: [queue()]
            })

            // 发送第一个消息并等待处理完成
            const [firstResult] = emitter.emit("test", 1)
            await vi.advanceTimersByTimeAsync(10)
            await firstResult

            // 发送会触发错误的消息
            const [secondResult] = emitter.emit("test", 2)
            await vi.advanceTimersByTimeAsync(10)
            await expect(secondResult).rejects.toThrow("处理消息2时出错")

            // 发送后续消息并等待处理完成
            const [thirdResult] = emitter.emit("test", 3)
            await vi.advanceTimersByTimeAsync(10)
            await thirdResult

            const [fourthResult] = emitter.emit("test", 4)
            await vi.advanceTimersByTimeAsync(10)
            await fourthResult

            // 虽然消息2处理失败，但不应影响其他消息的处理
            expect(results).toEqual([1, 3, 4])
        })

        it("应该正确处理并发消息", async () => {
            const results: number[] = []
            emitter.on("test", async (msg) => {
                await delay(20) // 模拟消息处理时间
                results.push(msg.payload)
            }, {
                decorators: [queue()]
            })

            // 并发发送多个消息
            await Promise.all([
                emitter.emit("test", 1),
                emitter.emit("test", 2),
                emitter.emit("test", 3),
            ])

            // 推进时间处理每个消息
            await vi.advanceTimersByTimeAsync(20)  // 处理第一个消息
            await vi.advanceTimersByTimeAsync(20)  // 处理第二个消息
            await vi.advanceTimersByTimeAsync(20)  // 处理第三个消息

            // 验证消息按顺序处理
            expect(results).toEqual([1, 2, 3])
        })

        it("应该在达到maxExpandSize时切换到drop策略", async () => {
            const results: number[] = []
            let first: boolean = true
            // 设置初始缓冲区大小为2，使用expand策略，最大扩展到4
            emitter.on("test", async (msg) => {
                await delay(first ? 1000 : 20)
                first = false
                results.push(msg.payload)
            }, {
                decorators: [queue({
                    size: 2,           // 初始缓冲区大小为2
                    overflow: "expand", // 使用expand策略
                    expandOverflow: 'drop',
                    maxExpandSize: 4    // 最大扩展到4
                })]
            })

            // 发送第一个消息并等待开始处理
            const promises = [
                ...emitter.emit("test", 1),  // 马上开始处理
                ...emitter.emit("test", 2),  // 进入缓冲区，大小=1
                ...emitter.emit("test", 3),  // 进入缓冲区，大小=2
                ...emitter.emit("test", 4),  // 触发扩展，大小=3
                ...emitter.emit("test", 5),  // 达到最大扩展，大小=4
                ...emitter.emit("test", 6),  // 超出maxExpandSize，应该被丢弃
                ...emitter.emit("test", 7),  // 超出maxExpandSize，应该被丢弃
                ...emitter.emit("test", 8),  // 超出maxExpandSize，应该被丢弃
            ]
            await vi.runAllTimersAsync()
            await Promise.all(promises)

            // 验证结果
            expect(results).toEqual([1, 2, 3, 4, 5])  // 消息6, 7, 8被丢弃
        })

    })
})