// oxlint-disable no-unused-vars
import { CallProfiler } from "../utils/callProfiler";
import { FastEvent } from "../event";

const emitter = new FastEvent();

const profiler = new CallProfiler(emitter);

async function test() {
    let count: number = 0;
    await profiler.run(
        async () => {
            const { off } = emitter.on("test", async () => {
                count++;
            });
            await emitter.emitAsync("test", 1);
            off();
        },
        {
            executionCount: 100,
        },
    );
    console.log(profiler.render());
}

test().then(() => {
    console.log("end");
});
