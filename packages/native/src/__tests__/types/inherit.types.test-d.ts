/* eslint-disable no-unused-vars */
import { describe, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { FastEventScope, FastEventScopeOptions } from "../../scope";
import type { FastEventOptions } from "../../";

describe("事件继承类型测试", () => {
    test("继承子类的类型", () => {
        interface MyEventOptions extends FastEventOptions {
            count?: number;
        }
        class MyEvent extends FastEvent {
            constructor(options?: Partial<MyEventOptions>) {
                super(Object.assign({}, options));
            }
            get options() {
                return super.options as MyEventOptions;
            }
        }
        const emitter = new MyEvent();
        emitter.on("test", function (this, message) {
            type This = typeof this; // [!code ++]
        });
        type OptionsType = typeof emitter.options;
        emitter.options.count = 100;
    });
    test("基本子类继承类型", () => {
        class MyEvent extends FastEvent {
            test() {
                this.emit("a", 1);
                this.emit({ type: "a", payload: 1 });
                this.on("a", (message) => {
                    type cases = [
                        Expect<Equal<typeof message.type, "a">>,
                        Expect<Equal<typeof message.payload, any>>,
                    ];
                });
                this.once("a", (message) => {
                    type cases = [
                        Expect<Equal<typeof message.type, "a">>,
                        Expect<Equal<typeof message.payload, any>>,
                    ];
                });
                this.onAny((message) => {
                    type cases = [
                        Expect<Equal<typeof message.type, string>>,
                        Expect<Equal<typeof message.payload, any>>,
                    ];
                });
            }
        }
        const emitter = new MyEvent();
        emitter.emit("a", 1);
        emitter.on("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
        emitter.once("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
        emitter.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.type, string>>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
    });
    test("基本子类继承类型时指定事件类型", () => {
        type BaseEvents = {
            a: number;
            b: string;
            c: boolean;
        };
        class MyEvent extends FastEvent<BaseEvents> {
            test() {
                this.emit("a", 1);
                this.emit({ type: "a", payload: 1 });
                this.on("a", (message) => {
                    type cases = [
                        Expect<Equal<typeof message.type, "a">>,
                        Expect<Equal<typeof message.payload, number>>,
                    ];
                });
                this.once("b", (message) => {
                    type cases = [
                        Expect<Equal<typeof message.type, "b">>,
                        Expect<Equal<typeof message.payload, string>>,
                    ];
                });
                this.onAny((message) => {
                    type cases = [
                        Expect<Equal<typeof message.type, "a" | "b" | "c">>,
                        Expect<Equal<typeof message.payload, string | number | boolean>>,
                    ];
                });
            }
        }

        const emitter = new MyEvent();
        emitter.emit("a", 1);
        emitter.on("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, number>>,
            ];
        });
        emitter.once("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, number>>,
            ];
        });
        emitter.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a" | "b" | "c">>,
                Expect<Equal<typeof message.payload, string | number | boolean>>,
            ];
        });
    });
    test("子类传递事件类型给基类进行类型合并", () => {
        type BaseEvents = {
            a: number;
            b: string;
            c: boolean;
        };
        type ChildEvents = {
            x: 1;
            y: 2;
            z: 3;
        };
        class MyEvent extends FastEvent<ChildEvents & BaseEvents> {
            test() {
                this.emit("a", 1);
                this.emit({ type: "a", payload: 1 });
                this.on("a", (message) => {
                    type cases = [
                        Expect<Equal<typeof message.type, "a">>,
                        Expect<Equal<typeof message.payload, number>>,
                    ];
                });
                this.once("b", (message) => {
                    type cases = [
                        Expect<Equal<typeof message.type, "b">>,
                        Expect<Equal<typeof message.payload, string>>,
                    ];
                });
                this.on("x", (message) => {
                    type cases = [
                        Expect<Equal<typeof message.type, "x">>,
                        Expect<Equal<typeof message.payload, 1>>,
                    ];
                });
                this.once("y", (message) => {
                    type cases = [
                        Expect<Equal<typeof message.type, "y">>,
                        Expect<Equal<typeof message.payload, 2>>,
                    ];
                });
                this.onAny((message) => {
                    type cases = [
                        Expect<Equal<typeof message.type, "x" | "y" | "z" | "a" | "b" | "c">>,
                        Expect<Equal<typeof message.payload, string | number | boolean>>,
                    ];
                });
            }
        }

        const emitter = new MyEvent();
        emitter.emit("a", 1);
        emitter.on("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, number>>,
            ];
        });
        emitter.once("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, number>>,
            ];
        });
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x">>,
                Expect<Equal<typeof message.payload, 1>>,
            ];
        });
        emitter.once("y", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "y">>,
                Expect<Equal<typeof message.payload, 2>>,
            ];
        });
        emitter.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x" | "y" | "z" | "a" | "b" | "c">>,
                Expect<Equal<typeof message.payload, string | number | boolean>>,
            ];
        });
    });
    test("继承时FastEventScope时覆盖重载Options", () => {
        type BaseEvents = {
            a: number;
            b: string;
            c: boolean;
        };
        type ChildEvents = {
            x: 1;
            y: 2;
            z: 3;
        };
        type MyOptions = {
            a: number;
            b: string;
            c: boolean;
        };
        class MyEventScope extends FastEventScope<ChildEvents & BaseEvents> {
            constructor(options?: MyOptions & FastEventScopeOptions) {
                super(options);
            }
            get options() {
                return super.options as MyOptions & FastEventScopeOptions;
            }
        }
        const scope = new MyEventScope();
    });
    test("继承时FastEventScope时覆盖重载Options类型", () => {
        interface MyEventOptions extends FastEventOptions {
            count?: number;
        }
        class MyEvent extends FastEvent {
            constructor(options?: Partial<MyEventOptions>) {
                super(Object.assign({}, options));
            }
            get options() {
                return super.options as MyEventOptions; // [!code ++]
            }
        }

        const emitter = new MyEvent();
        emitter.on("test", function (this, message) {
            type This = typeof this; // [!code ++]
        });
        type OptionsType = typeof emitter.options;
        emitter.options.count = 100;
    });

    // TODO: 解决继承时的动态泛型问题
    // test("动态传递事件类型给基类进行类型合并", () => {
    //     type BaseEvents = {
    //         a: number
    //         b: string
    //         c: boolean
    //     }
    //     type ExtendEvents = {
    //         x: 1
    //         y: 2
    //         z: 3
    //     }
    //     class MyEvent<Events extends FastEvents = FastEvents> extends FastEvent<BaseEvents & ExtendEvents & Events> {
    //         test() {
    //             this.emit("a", 1)
    //             this.emit("b", 1)
    //             this.emit("c", 1)
    //             this.emit("x", 1)
    //             this.emit("y", 2)
    //             this.emit("z", 3)

    //             this.emit({ type: "a", payload: 1 })
    //             this.on("a", (message) => {
    //                 type cases = [
    //                     Expect<Equal<typeof message.type, 'a'>>,
    //                     Expect<Equal<typeof message.payload, number>>
    //                 ]
    //             })
    //             this.once("b", (message) => {
    //                 type cases = [
    //                     Expect<Equal<typeof message.type, 'b'>>,
    //                     Expect<Equal<typeof message.payload, string>>
    //                 ]
    //             })
    //             this.on("x", (message) => {
    //                 type cases = [
    //                     Expect<Equal<typeof message.type, 'x'>>,
    //                     Expect<Equal<typeof message.payload, 1>>
    //                 ]
    //             })
    //             this.once("y", (message) => {
    //                 type cases = [
    //                     Expect<Equal<typeof message.type, 'y'>>,
    //                     Expect<Equal<typeof message.payload, 2>>
    //                 ]
    //             })
    //             this.onAny((message) => {
    //                 type cases = [
    //                     Expect<Equal<typeof message.type, string>>,
    //                     Expect<Equal<typeof message.payload, any>>
    //                 ]
    //             })
    //         }
    //     }

    //     const emitter = new MyEvent<{
    //         m: number,
    //         n: boolean
    //     }>()
    //     emitter.emit('m', 1)
    //     emitter.emit('n', 1)

    //     emitter.emit('a', 1)
    //     emitter.on("a", (message) => {
    //         type cases = [
    //             Expect<Equal<typeof message.type, 'a'>>,
    //             Expect<Equal<typeof message.payload, number>>
    //         ]
    //     })
    //     emitter.once("a", (message) => {
    //         type cases = [
    //             Expect<Equal<typeof message.type, 'a'>>,
    //             Expect<Equal<typeof message.payload, number>>
    //         ]
    //     })
    //     emitter.on("x", (message) => {
    //         type cases = [
    //             Expect<Equal<typeof message.type, 'x'>>,
    //             Expect<Equal<typeof message.payload, 1>>
    //         ]
    //     })
    //     emitter.once("y", (message) => {
    //         type cases = [
    //             Expect<Equal<typeof message.type, 'y'>>,
    //             Expect<Equal<typeof message.payload, 2>>
    //         ]
    //     })
    //     emitter.onAny((message) => {
    //         type cases = [
    //             Expect<Equal<typeof message.type, string>>,
    //             Expect<Equal<typeof message.payload, any>>
    //         ]
    //     })
    // })
});
