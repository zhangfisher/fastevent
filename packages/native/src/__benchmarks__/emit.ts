// oxlint-disable no-unused-vars
import { createCallProfiler } from "../utils/measure";
import { FastEvent } from "../event";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const emitter = new FastEvent();

const profiler = createCallProfiler(emitter);

async function test() {
    let count: number = 0;
    const stats = await profiler(
        async () => {
            // return new Promise<void>(async (resolve) => {
            const { off } = emitter.on("test", async () => {
                count++;
                // await delay(1);
            });
            await emitter.emitAsync("test", 1);
            off();
            // });
        },
        {
            executionCount: 100,
        },
    );
    console.log(stats.toTree());
}

test().then(() => {
    console.log("end");
});
