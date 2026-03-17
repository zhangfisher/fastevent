// oxlint-disable no-unused-vars
import { createMeasure } from "../utils/measure";
import { FastEvent } from "../event";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const emitter = new FastEvent();

const measure = createMeasure(emitter, [
    "on",
    "emitAsync",
    "emit",
    "_traverseToPath",
    "_executeListeners",
    "_executeListener",
]);

async function test() {
    let count: number = 0;
    const result = await measure(
        () => {
            return new Promise<void>(async (resolve) => {
                const { off } = emitter.on("test", async () => {
                    count++;
                    await delay(1);
                    resolve();
                });
                await emitter.emitAsync("test", 1);
                off();
            });
        },
        {
            count: 10,
        },
    );
    console.log(measure.toTree());
}

test().then(() => {
    console.log("end");
});
