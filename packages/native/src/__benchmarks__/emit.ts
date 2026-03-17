// oxlint-disable no-unused-vars
import { createMeasure } from "../utils/measure";
import { FastEvent } from "../event";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const emitter = new FastEvent();

const measure = createMeasure(emitter);

async function test() {
    let count: number = 0;
    const result = await measure(
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
            count: 100,
        },
    );
    console.log(measure.toTree());
}

test().then(() => {
    console.log("end");
});
