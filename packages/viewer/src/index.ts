import { FastEvent } from "fastevent";

const emitter = new FastEvent();
globalThis.emitter = emitter;

document.addEventListener("click", (event) => {
    emitter.emit("click", {
        // target: event.target,
        x: event.clientX,
        y: event.clientY,
        // pageX: event.pageX,
        // pageY: event.pageY,
    });
});

declare global {
    var emitter: FastEvent;
}
