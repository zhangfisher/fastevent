import { describe, test, expect } from "bun:test";
import { createMeasure } from "../../utils/measure";

describe("measureObject - 基础功能", () => {
    class TestClass {
        syncMethod() {
            let _sum = 0;
            for (let i = 0; i < 100000; i++) {
                _sum += i;
            }
            return "sync-result";
        }

        async asyncMethod() {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return "async-result";
        }

        methodWithArgs(a: number, b: number) {
            return a + b;
        }

        notMeasured() {
            return "not-measured";
        }
    }

    test("应该返回测量函数", () => {
        const obj = new TestClass();
        const measure = createMeasure(obj, ["syncMethod", "asyncMethod", "methodWithArgs"]);

        expect(measure).toBeInstanceOf(Function);
        expect(measure.results).toBeInstanceOf(Array);
        expect(measure.enabled).toBe(false);
    });

    test("应该能执行测量并返回统计数据", async () => {
        const obj = new TestClass();
        const measure = createMeasure(obj, ["syncMethod"]);

        const stats = await measure(
            () => {
                obj.syncMethod();
            },
            { warmup: 2, count: 5 },
        );

        expect(stats.duration).toBeGreaterThanOrEqual(0);
        expect(stats.max).toBeGreaterThanOrEqual(0);
        expect(stats.min).toBeGreaterThanOrEqual(0);
        expect(stats.max).toBeGreaterThanOrEqual(stats.min);
    });

    test("应该正确计算平均执行时间", async () => {
        const obj = new TestClass();
        const measure = createMeasure(obj, ["syncMethod"]);

        const stats = await measure(
            () => {
                obj.syncMethod();
            },
            { warmup: 1, count: 10 },
        );

        // 平均时间应该在合理范围内
        expect(stats.duration).toBeGreaterThan(0);
        expect(stats.max).toBeGreaterThanOrEqual(stats.duration);
        expect(stats.min).toBeLessThanOrEqual(stats.duration);
    });

    test("默认使用 warmupCount=5 和 executionCount=100", async () => {
        const obj = new TestClass();
        const measure = createMeasure(obj, ["syncMethod"]);

        let callCount = 0;
        const stats = await measure(() => {
            callCount++;
            obj.syncMethod();
        });

        // 总调用次数 = warmup (5) + execution (100)
        expect(callCount).toBe(105);
    });

    test("方法应保持原有功能", async () => {
        const obj = new TestClass();
        const measure = createMeasure(obj, ["syncMethod", "asyncMethod", "methodWithArgs"]);

        await measure(
            () => {
                const syncResult = obj.syncMethod();
                expect(syncResult).toBe("sync-result");
            },
            { count: 1 },
        );

        await measure(
            async () => {
                const asyncResult = await obj.asyncMethod();
                expect(asyncResult).toBe("async-result");
            },
            { count: 1 },
        );

        await measure(
            () => {
                const argsResult = obj.methodWithArgs(3, 7);
                expect(argsResult).toBe(10);
            },
            { count: 1 },
        );
    });

    test("未测量的方法不影响测量", async () => {
        const obj = new TestClass();
        const measure = createMeasure(obj, ["syncMethod"]);

        const stats = await measure(
            () => {
                obj.syncMethod();
                obj.notMeasured(); // 这个不会被测量
            },
            { count: 5 },
        );

        // 仍然应该有统计数据
        expect(stats.duration).toBeGreaterThan(0);
    });

    test("空方法列表应正常工作", async () => {
        const obj = new TestClass();
        const measure = createMeasure(obj, []);

        const stats = await measure(
            () => {
                obj.syncMethod();
            },
            { count: 1 },
        );

        // 没有方法被测量，但仍然返回统计数据
        expect(stats).toBeDefined();
    });

    test("不存在的属性应被忽略", async () => {
        const obj = new TestClass();
        const measure = createMeasure(obj, ["nonExistent" as any]);

        const stats = await measure(
            () => {
                obj.syncMethod();
            },
            { count: 1 },
        );

        // syncMethod 不在测量列表中，所以没有详细结果
        expect(measure.results.length).toBe(0);
    });

    test("应正确传递方法参数和 this 上下文", async () => {
        class ContextTest {
            value = 42;

            getValue() {
                return this.value;
            }

            add(a: number, b: number) {
                return a + b + this.value;
            }
        }

        const obj = new ContextTest();
        const measure = createMeasure(obj, ["getValue", "add"]);

        await measure(
            () => {
                const value = obj.getValue();
                expect(value).toBe(42);
            },
            { count: 1 },
        );

        await measure(
            () => {
                const sum = obj.add(10, 20);
                expect(sum).toBe(72);
            },
            { count: 1 },
        );
    });

    test("应该避免重复封装同一个对象", async () => {
        class TestClass {
            method1() {
                return "method1";
            }

            method2() {
                return "method2";
            }
        }

        const obj = new TestClass();

        // 第一次封装
        const measure1 = createMeasure(obj, ["method1", "method2"]);

        // 第二次封装同一个对象（应该跳过已封装的方法）
        const measure2 = createMeasure(obj, ["method1", "method2"]);

        // 两个 measure 函数应该是不同的实例
        expect(measure1).not.toBe(measure2);

        // 但方法应该正常工作
        await measure1(
            () => {
                const result = obj.method1();
                expect(result).toBe("method1");
            },
            { count: 1 },
        );

        await measure2(
            () => {
                const result = obj.method2();
                expect(result).toBe("method2");
            },
            { count: 1 },
        );
    });

    test("应该能够为已封装对象添加新方法", async () => {
        class TestClass {
            method1() {
                return "method1";
            }

            method2() {
                return "method2";
            }

            method3() {
                return "method3";
            }
        }

        const obj = new TestClass();

        // 第一次封装部分方法
        const measure1 = createMeasure(obj, ["method1", "method2"]);

        // 第二次封装，添加新方法
        const measure2 = createMeasure(obj, ["method2", "method3"]);

        // method1 和 method2 应该在 measure1 中
        await measure1(
            () => {
                obj.method1();
                obj.method2();
            },
            { count: 1 },
        );

        expect(measure1.results.length).toBe(2);

        // 清空结果
        measure1.clear();

        // method2 和 method3 应该在 measure2 中
        await measure2(
            () => {
                obj.method2();
                obj.method3();
            },
            { count: 1 },
        );

        // 注意：method2 在第一次封装时已经被包装，所以会共享同一个包装器
        // 但 measure2 仍然能追踪到调用
        expect(measure2.results.length).toBeGreaterThanOrEqual(1);
    });

    test("应该支持对象数组并为方法名添加前缀", async () => {
        class User {
            getName() {
                return "user";
            }

            getId() {
                return 1;
            }
        }

        class Post {
            getTitle() {
                return "post";
            }

            getContent() {
                return "content";
            }
        }

        const user = new User();
        const post = new Post();

        // 新签名：为每个对象指定不同的方法
        const measure = createMeasure([
            [user, ["getName"]],
            [post, ["getTitle"]],
        ]);

        await measure(
            () => {
                user.getName();
                post.getTitle();
            },
            { count: 1 },
        );

        // 验证结果中方法名带有对象前缀
        const flatResults = measure.getFlatResults();
        expect(flatResults.length).toBe(2);

        const getNameCall = flatResults.find((r: any) => r.callee === "User:getName");
        const getTitleCall = flatResults.find((r: any) => r.callee === "Post:getTitle");

        expect(getNameCall).toBeDefined();
        expect(getTitleCall).toBeDefined();
    });

    test("单个对象不应该添加前缀", async () => {
        class User {
            getName() {
                return "user";
            }
        }

        const user = new User();
        const measure = createMeasure(user, ["getName"]);

        await measure(
            () => {
                user.getName();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();
        expect(flatResults.length).toBe(1);

        // 单个对象不应该有前缀
        expect(flatResults[0].callee).toBe("getName");
        expect(flatResults[0].callee).not.toMatch(/:/);
    });

    test("对象数组应该正确显示树形结构", async () => {
        class Calculator {
            add(a: number, b: number) {
                return a + b;
            }

            multiply(a: number, b: number) {
                return a * b;
            }
        }

        class Validator {
            validate(value: number) {
                return value > 0;
            }
        }

        const calc = new Calculator();
        const validator = new Validator();

        // 新签名：为每个对象指定不同的方法
        const measure = createMeasure([
            [calc, ["add"]],
            [validator, ["validate"]],
        ]);

        await measure(
            () => {
                calc.add(1, 2);
                validator.validate(5);
            },
            { count: 1 },
        );

        const treeStr = measure.toTree();

        // 验证树形结构包含带前缀的方法名
        expect(treeStr).toContain("Calculator:add");
        expect(treeStr).toContain("Validator:validate");
    });
});

describe("measureObject - 边界情况", () => {
    test("方法返回 Promise.reject 应正确处理", async () => {
        class ErrorClass {
            async errorMethod() {
                await new Promise((resolve) => setTimeout(resolve, 5));
                throw new Error("Test error");
            }
        }

        const obj = new ErrorClass();
        const measure = createMeasure(obj, ["errorMethod"]);

        let errorCount = 0;
        const stats = await measure(
            async () => {
                try {
                    await obj.errorMethod();
                } catch {
                    errorCount++;
                }
            },
            { warmup: 2, count: 3 },
        );

        // 总调用次数 = warmup (2) + execution (3)
        expect(errorCount).toBe(5);
        expect(stats.duration).toBeGreaterThanOrEqual(0);
    });

    test("方法返回非 Promise 的值应正常处理", async () => {
        class ValueClass {
            getNumber() {
                return 12345;
            }

            getObject() {
                return { key: "value" };
            }

            getNull() {
                return null;
            }

            getUndefined() {
                return undefined;
            }
        }

        const obj = new ValueClass();
        const measure = createMeasure(obj, ["getNumber", "getObject", "getNull", "getUndefined"]);

        await measure(
            () => {
                const num = obj.getNumber();
                expect(num).toBe(12345);
            },
            { count: 1 },
        );

        await measure(
            () => {
                const objResult = obj.getObject();
                expect(objResult).toEqual({ key: "value" });
            },
            { count: 1 },
        );

        await measure(
            () => {
                const nullVal = obj.getNull();
                expect(nullVal).toBeNull();
            },
            { count: 1 },
        );

        await measure(
            () => {
                const undefVal = obj.getUndefined();
                expect(undefVal).toBeUndefined();
            },
            { count: 1 },
        );
    });
});

describe("measureObject - 方法调用链测试", () => {
    // 具有清晰调用树的测试类
    // 调用结构：
    // A1()
    // ├── A2()
    // │   ├── A11()
    // │   └── A12()
    // └── A3()
    //     └── A21()
    class CallTreeTestClass {
        A1() {
            this._simulateWork("A1");
            this.A2();
            this.A3();
        }

        A2() {
            this._simulateWork("A2");
            this.A11();
            this.A12();
        }

        A3() {
            this._simulateWork("A3");
            this.A21();
        }

        A11() {
            this._simulateWork("A11");
        }

        A12() {
            this._simulateWork("A12");
        }

        A21() {
            this._simulateWork("A21");
        }

        _simulateWork(_name: string) {
            let _sum = 0;
            for (let i = 0; i < 10000; i++) {
                _sum += i;
            }
        }
    }

    test("应该记录完整的方法调用链", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A1();
            },
            { count: 1 },
        );

        // control.results 包含树形结构
        expect(measure.results.length).toBe(1);
        expect(measure.results[0].callee).toBe("A1");
    });

    test("应该能追踪多层嵌套调用", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A1();
            },
            { count: 1 },
        );

        const tree = measure.results;

        // 验证调用深度：A1 -> A2 -> A11 (3层)
        const a1 = tree[0];
        const a2 = a1.children[0];
        const a11 = a2.children[0];

        expect(a1.callee).toBe("A1");
        expect(a2.callee).toBe("A2");
        expect(a11.callee).toBe("A11");

        // 验证深度
        expect(a1.depth).toBe(0);
        expect(a2.depth).toBe(1);
        expect(a11.depth).toBe(2);
    });

    test("应该能从中间节点开始追踪调用链", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A2(); // 直接调用 A2
            },
            { count: 1 },
        );

        // 只应该记录 A2 及其子调用
        expect(measure.results.length).toBe(1);
        expect(measure.results[0].callee).toBe("A2");
        expect(measure.results[0].children.length).toBe(2);
    });

    test("应该能追踪多个入口点的调用", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A2();
                obj.A3();
            },
            { count: 1 },
        );

        // 应该有 2 个根节点（A2 和 A3）
        expect(measure.results.length).toBe(2);

        const rootCallees = measure.results.map((node) => node.callee);
        expect(rootCallees).toContain("A2");
        expect(rootCallees).toContain("A3");
    });

    test("应该支持获取特定方法的所有调用", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A1();
                obj.A1();
            },
            { count: 1 },
        );

        // 获取所有 A2 的调用（A1 调用了 A2，所以有 2 次）
        const a2Calls = measure.getCalls("A2");
        expect(a2Calls.length).toBe(2);
    });

    test("应该支持清空测量结果", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A1();
            },
            { count: 1 },
        );

        expect(measure.results.length).toBe(1);

        // 清空结果
        measure.clear();
        expect(measure.results.length).toBe(0);

        // 再次测量应该重新记录
        await measure(
            () => {
                obj.A2();
            },
            { count: 1 },
        );

        expect(measure.results.length).toBe(1);
    });

    test("应该支持将树形结构渲染为字符串", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A1();
            },
            { count: 1 },
        );

        const treeStr = measure.toTree();

        // 验证树形字符串格式
        expect(treeStr).toContain("A1");
        expect(treeStr).toContain("└──");
        expect(treeStr).toContain("├──");
        expect(treeStr).toContain("ms)");
    });

    test("toTree 应该显示正确的层级结构", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A1();
            },
            { count: 1 },
        );

        const treeStr = measure.toTree();
        const lines = treeStr.split("\n").filter((line: string) => line.trim());

        // 第一行应该是 A1（无缩进）
        expect(lines[0]).toMatch(/^[└─]{3}\s+A1\s+\([\d.]+ms\)$/);

        // 第二行应该是 A2（一级缩进）
        expect(lines[1]).toMatch(/^[│\s]*[├─]{3}\s+A2\s+\([\d.]+ms\)$/);

        // 第三行应该是 A11（二级缩进）
        expect(lines[2]).toMatch(/^[│\s]*[├─]{3}\s+A11\s+\([\d.]+ms\)$/);
    });

    test("toTree 在没有测量结果时应返回提示信息", () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        const treeStr = measure.toTree();
        expect(treeStr).toContain("no measurements");
    });

    test("父方法的执行时间应该包含子方法的执行时间", async () => {
        class SlowTestClass {
            A2() {
                this._simulateWork("A2");
                this.A11();
                this.A12();
            }

            A11() {
                this._simulateWork("A11");
            }

            A12() {
                this._simulateWork("A12");
            }

            _simulateWork(_name: string) {
                let _sum = 0;
                for (let i = 0; i < 100000; i++) {
                    _sum += i;
                }
            }
        }

        const obj = new SlowTestClass();
        const measure = createMeasure(obj, ["A2", "A11", "A12"]);

        await measure(
            () => {
                obj.A2();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();
        const a2 = flatResults.find((r: any) => r.callee === "A2");
        const a11 = flatResults.find((r: any) => r.callee === "A11");
        const a12 = flatResults.find((r: any) => r.callee === "A12");

        expect(a2).toBeDefined();
        expect(a11).toBeDefined();
        expect(a12).toBeDefined();

        // A2 的执行时间应该 >= A11 + A12 的总时间
        const childTimeSum = a11!.duration + a12!.duration;
        expect(a2!.duration).toBeGreaterThanOrEqual(childTimeSum);

        // A2 的时间应该明显大于单个子方法的时间
        expect(a2!.duration).toBeGreaterThan(a11!.duration);
        expect(a2!.duration).toBeGreaterThan(a12!.duration);
    });

    test("应该能通过 getFlatResults 获取所有调用", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A1();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // 应该有 6 个方法调用：A1, A2, A3, A11, A12, A21
        expect(flatResults.length).toBe(6);
    });

    test("应该支持获取树形结构", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A1();
            },
            { count: 1 },
        );

        const tree = measure.results;

        // 应该只有一个根节点（A1）
        expect(tree.length).toBe(1);
        expect(tree[0].callee).toBe("A1");

        // A1 应该有两个子节点（A2 和 A3）
        expect(tree[0].children.length).toBe(2);
        expect(tree[0].children[0].callee).toBe("A2");
        expect(tree[0].children[1].callee).toBe("A3");

        // A2 应该有两个子节点（A11 和 A12）
        expect(tree[0].children[0].children.length).toBe(2);
        expect(tree[0].children[0].children[0].callee).toBe("A11");
        expect(tree[0].children[0].children[1].callee).toBe("A12");

        // A3 应该有一个子节点（A21）
        expect(tree[0].children[1].children.length).toBe(1);
        expect(tree[0].children[1].children[0].callee).toBe("A21");
    });

    test("每个节点都应有正确的 ID 和深度", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A1();
            },
            { count: 1 },
        );

        const tree = measure.results;

        // 根节点有 ID 和深度 0
        expect(tree[0].id).toBeDefined();
        expect(typeof tree[0].id).toBe("number");
        expect(tree[0].depth).toBe(0);

        // 子节点也有 ID 和正确的深度
        const a2 = tree[0].children[0];
        expect(a2.id).toBeDefined();
        expect(a2.depth).toBe(1);

        const a3 = tree[0].children[1];
        expect(a3.id).toBeDefined();
        expect(a3.depth).toBe(1);

        const a11 = a2.children[0];
        expect(a11.id).toBeDefined();
        expect(a11.depth).toBe(2);
    });

    test("应该能从树形结构重建完整的调用路径", async () => {
        const obj = new CallTreeTestClass();
        const measure = createMeasure(obj, ["A1", "A2", "A3", "A11", "A12", "A21"]);

        await measure(
            () => {
                obj.A1();
            },
            { count: 1 },
        );

        const tree = measure.results;

        // 从 A11 回溯到根节点
        const a11 = tree[0].children[0].children[0];
        const a2 = tree[0].children[0];
        const a1 = tree[0];

        // 验证父子关系链（通过 children）
        expect(a2.children).toContain(a11);
        expect(a1.children).toContain(a2);

        // 验证调用路径：A1 -> A2 -> A11
        const path = [a11.callee, a2.callee, a1.callee];
        expect(path).toEqual(["A11", "A2", "A1"]);
    });
});

describe("measureObject - 多个对象方法调用链测试", () => {
    // UserService 使用层级命名：A1, A11, A111, A2, A21 等
    // A1 是第一层，A11 是 A1 的子调用（第二层），A111 是 A11 的子调用（第三层）
    class UserService {
        // 第一层方法
        A1() {
            this._simulateWork("A1");
            this.A11();
            this.A12();
        }

        A2() {
            this._simulateWork("A2");
            this.A21();
        }

        // 第二层方法（被 A1 调用）
        A11() {
            this._simulateWork("A11");
            this.A111();
            this.A112();
        }

        A12() {
            this._simulateWork("A12");
        }

        // 第二层方法（被 A2 调用）
        A21() {
            this._simulateWork("A21");
        }

        // 第三层方法（被 A11 调用）
        A111() {
            this._simulateWork("A111");
        }

        A112() {
            this._simulateWork("A112");
        }

        _simulateWork(_name: string) {
            let sum = 0;
            for (let i = 0; i < 5000; i++) {
                sum += i;
            }
        }
    }

    // PostService 使用层级命名：B1, B11, B111 等
    // 支持跨对象调用：在构造函数中接收 UserService 实例
    class PostService {
        private userService: UserService;

        constructor(userService: UserService) {
            this.userService = userService;
        }

        // 第一层方法
        B1() {
            this._simulateWork("B1");
            this.B11();
        }

        B2() {
            this._simulateWork("B2");
            this.B21();
            // 跨对象调用：调用 UserService 的方法
            this.userService.A1();
        }

        // 第二层方法（被 B1 调用）
        B11() {
            this._simulateWork("B11");
            this.B111();
        }

        // 第二层方法（被 B2 调用）
        B21() {
            this._simulateWork("B21");
            // 跨对象调用：调用 UserService 的方法
            this.userService.A11();
        }

        // 第三层方法（被 B11 调用）
        B111() {
            this._simulateWork("B111");
        }

        _simulateWork(_name: string) {
            let sum = 0;
            for (let i = 0; i < 5000; i++) {
                sum += i;
            }
        }
    }

    test("应该追踪多个对象的独立方法调用", async () => {
        const userService = new UserService();
        const postService = new PostService(userService);

        // 新签名：为每个对象指定不同的方法
        const measure = createMeasure([
            [userService, ["A1", "A2"]],
            [postService, ["B1"]],
        ]);

        await measure(
            () => {
                userService.A1();
                postService.B1();
            },
            { count: 1 },
        );
        const flatResults = measure.getFlatResults();

        // 应该有 2 个根方法调用
        expect(flatResults.length).toBeGreaterThanOrEqual(2);

        const a1Call = flatResults.find((r: any) => r.callee === "UserService:A1");
        const b1Call = flatResults.find((r: any) => r.callee === "PostService:B1");

        expect(a1Call).toBeDefined();
        expect(b1Call).toBeDefined();
    });

    test("应该追踪多个对象的所有方法调用", async () => {
        const userService = new UserService();
        const postService = new PostService(userService);

        // 新签名：为每个对象指定不同的方法
        const measure = createMeasure([userService, postService]);

        await measure(
            () => {
                userService.A1();
                postService.B2();
            },
            { count: 1 },
        );
        console.log(measure.toTree());
    });

    test("应该追踪跨对象的嵌套调用", async () => {
        const userService = new UserService();

        // 新签名：为每个对象指定不同的方法
        const measure = createMeasure([[userService, ["A1", "A11", "A12", "A111", "A112"]]]);

        await measure(
            () => {
                userService.A1();
            },
            { count: 1 },
        );

        const tree = measure.results;

        // 应该有一个根节点
        expect(tree.length).toBe(1);
        expect(tree[0].callee).toBe("UserService:A1");

        // 根节点应该有两个子节点（A11 和 A12）
        expect(tree[0].children.length).toBe(2);

        const childCallees = tree[0].children.map((child) => child.callee);
        expect(childCallees).toContain("UserService:A11");
        expect(childCallees).toContain("UserService:A12");

        // A11 应该有两个子节点（A111 和 A112）
        const a11Node = tree[0].children.find((child) => child.callee === "UserService:A11");
        expect(a11Node).toBeDefined();
        expect(a11Node!.children.length).toBe(2);
    });

    test("应该正确显示跨对象调用的树形结构", async () => {
        const userService = new UserService();
        const postService = new PostService(userService);

        // 新签名：为每个对象指定不同的方法
        const measure = createMeasure([
            [userService, ["A1"]],
            [postService, ["B1"]],
        ]);

        await measure(
            () => {
                userService.A1();
                postService.B1();
            },
            { count: 1 },
        );

        const treeStr = measure.toTree();

        // 验证树形结构包含正确的对象前缀
        expect(treeStr).toContain("UserService:A1");
        expect(treeStr).toContain("PostService:B1");
    });

    test("应该在多个对象中正确区分同名方法", async () => {
        const userService = new UserService();
        const postService = new PostService(userService);

        // 新签名：为每个对象指定不同的方法
        const measure = createMeasure([
            [userService, ["A11"]],
            [postService, ["B11"]],
        ]);

        await measure(
            () => {
                userService.A11();
                postService.B11();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        expect(flatResults.length).toBe(2);

        const a11Call = flatResults.find((r: any) => r.callee === "UserService:A11");
        const b11Call = flatResults.find((r: any) => r.callee === "PostService:B11");

        expect(a11Call).toBeDefined();
        expect(b11Call).toBeDefined();

        // 验证它们是不同的调用
        expect(a11Call).not.toBe(b11Call);
    });

    test("应该支持获取特定对象的方法调用", async () => {
        const userService = new UserService();
        const postService = new PostService(userService);

        // 新签名：为每个对象指定不同的方法
        const measure = createMeasure([
            [userService, ["A1"]],
            [postService, ["B1"]],
        ]);

        await measure(
            () => {
                userService.A1();
                userService.A1();
                postService.B1();
            },
            { count: 1 },
        );

        // 获取 UserService 的所有 A1 调用
        const a1Calls = measure.getCalls("UserService:A1");
        expect(a1Calls.length).toBe(2);

        // 获取 PostService 的 B1 调用
        const b1Calls = measure.getCalls("PostService:B1");
        expect(b1Calls.length).toBe(1);
    });

    test("应该在嵌套调用中正确设置深度", async () => {
        const userService = new UserService();

        // 新签名：为每个对象指定不同的方法
        const measure = createMeasure([[userService, ["A1", "A11", "A12"]]]);

        await measure(
            () => {
                userService.A1();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // 找到根节点和子节点
        const rootCall = flatResults.find((r: any) => r.callee === "UserService:A1");
        const a11Call = flatResults.find((r: any) => r.callee === "UserService:A11");
        const a12Call = flatResults.find((r: any) => r.callee === "UserService:A12");

        expect(rootCall).toBeDefined();
        expect(rootCall!.depth).toBe(0);

        expect(a11Call).toBeDefined();
        expect(a11Call!.depth).toBe(1);

        expect(a12Call).toBeDefined();
        expect(a12Call!.depth).toBe(1);
    });

    test("应该正确处理混合调用多个对象的方法", async () => {
        const userService = new UserService();
        const postService = new PostService(userService);

        // 新签名：为每个对象指定不同的方法
        const measure = createMeasure([
            [userService, ["A1", "A2", "A11", "A12"]],
            [postService, ["B1", "B2", "B11", "B21"]],
        ]);

        await measure(
            () => {
                userService.A1();
                postService.B1();
                userService.A2();
                postService.B2();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // A1 会调用 A11, A12，A2 会调用 A21，B1 会调用 B11，B2 会调用 B21
        // 总共会有多个调用
        expect(flatResults.length).toBeGreaterThan(4);

        // 验证根调用的对象前缀
        const rootCalls = flatResults.filter((r: any) => r.depth === 0);
        expect(rootCalls.length).toBe(4);

        const callees = rootCalls.map((r) => r.callee);
        expect(callees).toContain("UserService:A1");
        expect(callees).toContain("PostService:B1");
        expect(callees).toContain("UserService:A2");
        expect(callees).toContain("PostService:B2");
    });

    test("应该正确追踪跨对象调用链（PostService 调用 UserService）", async () => {
        const userService = new UserService();
        const postService = new PostService(userService);

        // 为两个服务的方法都添加测量
        const measure = createMeasure([
            [userService, ["A1", "A11", "A12", "A111"]],
            [postService, ["B2", "B21"]],
        ]);

        await measure(
            () => {
                // PostService.B2 会调用：
                // 1. B21 (PostService 内部)
                // 2. A1 (UserService 方法，跨对象调用)
                // A1 会进一步调用 A11 和 A12
                // A11 会进一步调用 A111 和 A112
                postService.B2();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // 验证跨对象调用被正确记录
        const postServiceCalls = flatResults.filter((r: any) =>
            r.callee.startsWith("PostService:"),
        );
        const userServiceCalls = flatResults.filter((r: any) =>
            r.callee.startsWith("UserService:"),
        );

        // 应该有 PostService 的调用（B2, B21）
        expect(postServiceCalls.length).toBeGreaterThanOrEqual(2);
        expect(postServiceCalls.some((r: any) => r.callee === "PostService:B2")).toBe(true);
        expect(postServiceCalls.some((r: any) => r.callee === "PostService:B21")).toBe(true);

        // 应该有 UserService 的调用（B2 调用了 A1，A1 调用了 A11, A12，A11 调用了 A111, A112）
        expect(userServiceCalls.length).toBeGreaterThanOrEqual(3);
        expect(userServiceCalls.some((r: any) => r.callee === "UserService:A1")).toBe(true);
        expect(userServiceCalls.some((r: any) => r.callee === "UserService:A11")).toBe(true);

        // 验证调用树的层级关系
        const tree = measure.results;

        // 根节点应该是 B2
        expect(tree.length).toBe(1);
        expect(tree[0].callee).toBe("PostService:B2");

        // B2 的子节点应该包含 B21 和 A1
        const b2Children = tree[0].children;
        const b2ChildCallees = b2Children.map((child) => child.callee);
        expect(b2ChildCallees).toContain("PostService:B21");
        expect(b2ChildCallees).toContain("UserService:A1");

        // A1 的子节点应该包含 A11 和 A12
        const a1Node = b2Children.find((child) => child.callee === "UserService:A1");
        expect(a1Node).toBeDefined();
        const a1ChildCallees = a1Node!.children.map((child) => child.callee);
        expect(a1ChildCallees).toContain("UserService:A11");
        expect(a1ChildCallees).toContain("UserService:A12");
    });

    test("应该在跨对象调用中正确显示树形结构", async () => {
        const userService = new UserService();
        const postService = new PostService(userService);

        const measure = createMeasure([
            [userService, ["A1", "A11", "A12", "A111", "A112"]],
            [postService, ["B2", "B21"]],
        ]);

        await measure(
            () => {
                postService.B2();
            },
            { count: 1 },
        );

        const treeStr = measure.toTree();

        // 验证树形字符串包含跨对象调用的信息
        expect(treeStr).toContain("PostService:B2");
        expect(treeStr).toContain("PostService:B21");
        expect(treeStr).toContain("UserService:A1");
        expect(treeStr).toContain("UserService:A11");
        expect(treeStr).toContain("UserService:A12");
    });
});

describe("createMeasure - 多对象不同方法签名测试", () => {
    class ServiceA {
        method1(): number {
            let sum = 0;
            for (let i = 0; i < 100; i++) {
                sum += i;
            }
            return sum;
        }

        method2(): number {
            let sum = 0;
            for (let i = 0; i < 200; i++) {
                sum += i;
            }
            return sum;
        }

        notMeasured(): number {
            return 42;
        }
    }

    class ServiceB {
        method3(): number {
            let sum = 0;
            for (let i = 0; i < 150; i++) {
                sum += i;
            }
            return sum;
        }

        method4(): number {
            let sum = 0;
            for (let i = 0; i < 250; i++) {
                sum += i;
            }
            return sum;
        }

        notMeasured(): number {
            return 100;
        }
    }

    test("应该能够为每个对象指定不同的方法", async () => {
        const serviceA = new ServiceA();
        const serviceB = new ServiceB();

        // 新签名：为每个对象指定不同的方法
        const measure = createMeasure([
            [serviceA, ["method1", "method2"]],
            [serviceB, ["method3", "method4"]],
        ]);

        await measure(
            () => {
                serviceA.method1();
                serviceA.method2();
                serviceB.method3();
                serviceB.method4();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // 应该有 4 个方法调用（每个对象 2 个方法）
        expect(flatResults.length).toBe(4);

        // 验证每个调用都有正确的对象前缀
        const callees = flatResults.map((r) => r.callee);
        expect(callees).toContain("ServiceA:method1");
        expect(callees).toContain("ServiceA:method2");
        expect(callees).toContain("ServiceB:method3");
        expect(callees).toContain("ServiceB:method4");
    });

    test("应该不会测量未指定的方法", async () => {
        const serviceA = new ServiceA();
        const serviceB = new ServiceB();

        const measure = createMeasure([
            [serviceA, ["method1"]], // 只测量 method1
            [serviceB, ["method3"]], // 只测量 method3
        ]);

        await measure(
            () => {
                serviceA.method1(); // 应该被测量
                serviceA.method2(); // 不应该被测量
                serviceA.notMeasured(); // 不应该被测量
                serviceB.method3(); // 应该被测量
                serviceB.method4(); // 不应该被测量
                serviceB.notMeasured(); // 不应该被测量
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // 只有 method1 和 method3 被测量
        expect(flatResults.length).toBe(2);

        const callees = flatResults.map((r) => r.callee);
        expect(callees).toContain("ServiceA:method1");
        expect(callees).toContain("ServiceB:method3");
        expect(callees).not.toContain("ServiceA:method2");
        expect(callees).not.toContain("ServiceA:notMeasured");
        expect(callees).not.toContain("ServiceB:method4");
        expect(callees).not.toContain("ServiceB:notMeasured");
    });

    test("应该能够为不同对象指定不同数量的方法", async () => {
        const serviceA = new ServiceA();
        const serviceB = new ServiceB();

        const measure = createMeasure([
            [serviceA, ["method1"]], // ServiceA 只有 1 个方法
            [serviceB, ["method3", "method4"]], // ServiceB 有 2 个方法
        ]);

        await measure(
            () => {
                serviceA.method1();
                serviceB.method3();
                serviceB.method4();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // 应该有 3 个方法调用
        expect(flatResults.length).toBe(3);

        const serviceACalls = flatResults.filter((r) => r.callee.startsWith("ServiceA:"));
        expect(serviceACalls.length).toBe(1);

        const serviceBCalls = flatResults.filter((r) => r.callee.startsWith("ServiceB:"));
        expect(serviceBCalls.length).toBe(2);
    });

    test("应该能够使用 getCalls 获取特定对象的方法调用", async () => {
        const serviceA = new ServiceA();
        const serviceB = new ServiceB();

        const measure = createMeasure([
            [serviceA, ["method1", "method2"]],
            [serviceB, ["method3", "method4"]],
        ]);

        await measure(
            () => {
                serviceA.method1();
                serviceA.method2();
                serviceB.method3();
            },
            { count: 1 },
        );

        // 获取 ServiceA 的 method1 调用
        const method1Calls = measure.getCalls("ServiceA:method1");
        expect(method1Calls.length).toBe(1);
        expect(method1Calls[0].callee).toBe("ServiceA:method1");

        // 获取 ServiceB 的 method3 调用
        const method3Calls = measure.getCalls("ServiceB:method3");
        expect(method3Calls.length).toBe(1);
        expect(method3Calls[0].callee).toBe("ServiceB:method3");
    });

    test("应该能够构建正确的跨对象调用树", async () => {
        class CallerService {
            callA(service: ServiceA): void {
                let sum = 0;
                for (let i = 0; i < 50; i++) {
                    sum += i;
                }
                service.method1();
            }
        }

        const callerService = new CallerService();
        const serviceA = new ServiceA();

        const measure = createMeasure([
            [callerService, ["callA"]],
            [serviceA, ["method1"]],
        ]);

        await measure(
            () => {
                callerService.callA(serviceA);
            },
            { count: 1 },
        );

        const tree = measure.results;

        // 应该有一个根节点（callA）
        expect(tree.length).toBe(1);
        expect(tree[0].callee).toBe("CallerService:callA");

        // callA 应该有一个子节点（method1）
        expect(tree[0].children.length).toBe(1);
        expect(tree[0].children[0].callee).toBe("ServiceA:method1");
    });

    test("应该返回正确的统计数据", async () => {
        const serviceA = new ServiceA();
        const serviceB = new ServiceB();

        const measure = createMeasure([
            [serviceA, ["method1"]],
            [serviceB, ["method3"]],
        ]);

        const stats = await measure(
            () => {
                serviceA.method1();
                serviceB.method3();
            },
            { warmup: 2, count: 10 },
        );

        // 验证统计数据存在且合理
        expect(stats.duration).toBeGreaterThan(0);
        expect(stats.max).toBeGreaterThanOrEqual(stats.duration);
        expect(stats.min).toBeLessThanOrEqual(stats.duration);
        expect(stats.max).toBeGreaterThanOrEqual(stats.min);
    });

    test("应该能够清空结果", async () => {
        const serviceA = new ServiceA();
        const serviceB = new ServiceB();

        const measure = createMeasure([
            [serviceA, ["method1"]],
            [serviceB, ["method3"]],
        ]);

        await measure(
            () => {
                serviceA.method1();
            },
            { count: 1 },
        );

        expect(measure.results.length).toBe(1);

        measure.clear();

        expect(measure.results.length).toBe(0);
    });

    test("应该能够渲染树形字符串", async () => {
        const serviceA = new ServiceA();
        const serviceB = new ServiceB();

        const measure = createMeasure([
            [serviceA, ["method1"]],
            [serviceB, ["method3"]],
        ]);

        await measure(
            () => {
                serviceA.method1();
                serviceB.method3();
            },
            { count: 1 },
        );

        const treeString = measure.toTree();

        // 验证树形字符串包含预期的内容
        expect(treeString).toContain("ServiceA:method1");
        expect(treeString).toContain("ServiceB:method3");
        expect(treeString).toContain("ms");
    });

    test("应该能够处理空对象数组", async () => {
        const measure = createMeasure([]);

        const stats = await measure(
            () => {
                // 什么都不做
            },
            { count: 1 },
        );

        // 应该能正常运行，但没有结果
        expect(measure.results.length).toBe(0);
        expect(stats.duration).toBeGreaterThanOrEqual(0);
    });

    test("应该能够处理单个对象使用新签名", async () => {
        const serviceA = new ServiceA();

        // 单个对象也可以使用新签名
        const measure = createMeasure([[serviceA, ["method1", "method2"]]]);

        await measure(
            () => {
                serviceA.method1();
                serviceA.method2();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        expect(flatResults.length).toBe(2);
        const callees = flatResults.map((r) => r.callee);
        expect(callees).toContain("ServiceA:method1");
        expect(callees).toContain("ServiceA:method2");
    });

    test("应该兼容旧的单对象签名", async () => {
        const serviceA = new ServiceA();

        // 旧签名：createMeasure(obj, methods)
        const measure = createMeasure(serviceA, ["method1", "method2"]);

        await measure(
            () => {
                serviceA.method1();
                serviceA.method2();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        expect(flatResults.length).toBe(2);

        // 旧签名不应该添加对象前缀
        const callees = flatResults.map((r) => r.callee);
        expect(callees).toContain("method1");
        expect(callees).toContain("method2");
        expect(callees).not.toContain("ServiceA:method1");
    });

    test("应该在未指定 methods 时自动获取所有方法（单对象）", async () => {
        class TestClass {
            method1(): number {
                let sum = 0;
                for (let i = 0; i < 100; i++) {
                    sum += i;
                }
                return sum;
            }

            method2(): number {
                let sum = 0;
                for (let i = 0; i < 200; i++) {
                    sum += i;
                }
                return sum;
            }

            _privateMethod(): number {
                return 42;
            }

            get accessor(): number {
                return 100;
            }

            set accessor(_value: number) {
                // do nothing
            }
        }

        const obj = new TestClass();

        // 不指定 methods，应该自动测量所有公共方法
        const measure = createMeasure(obj);

        await measure(
            () => {
                obj.method1();
                obj.method2();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // 应该有 2 个方法调用（method1 和 method2）
        expect(flatResults.length).toBe(2);

        const callees = flatResults.map((r) => r.callee);
        expect(callees).toContain("method1");
        expect(callees).toContain("method2");

        // 私有方法和访问器不应该被测量
        expect(callees).not.toContain("_privateMethod");
        expect(callees).not.toContain("accessor");
    });

    test("应该在未指定 methods 时自动获取所有方法（多对象）", async () => {
        class ServiceA {
            method1(): number {
                return 1;
            }

            method2(): number {
                return 2;
            }

            _internal(): number {
                return 0;
            }
        }

        class ServiceB {
            method3(): number {
                return 3;
            }

            method4(): number {
                return 4;
            }

            _helper(): number {
                return 0;
            }
        }

        const serviceA = new ServiceA();
        const serviceB = new ServiceB();

        // 不指定 methods，应该自动测量所有公共方法
        const measure = createMeasure([[serviceA], [serviceB]]);

        await measure(
            () => {
                serviceA.method1();
                serviceA.method2();
                serviceB.method3();
                serviceB.method4();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // 应该有 4 个方法调用
        expect(flatResults.length).toBe(4);

        const callees = flatResults.map((r) => r.callee);
        expect(callees).toContain("ServiceA:method1");
        expect(callees).toContain("ServiceA:method2");
        expect(callees).toContain("ServiceB:method3");
        expect(callees).toContain("ServiceB:method4");

        // 私有方法不应该被测量
        expect(callees).not.toContain("ServiceA:_internal");
        expect(callees).not.toContain("ServiceB:_helper");
    });

    test("应该支持简化语法直接传入对象数组（自动测量所有方法）", async () => {
        class ServiceA {
            method1(): number {
                return 1;
            }

            method2(): number {
                return 2;
            }

            _internal(): number {
                return 0;
            }
        }

        class ServiceB {
            method3(): number {
                return 3;
            }

            method4(): number {
                return 4;
            }

            _helper(): number {
                return 0;
            }
        }

        const serviceA = new ServiceA();
        const serviceB = new ServiceB();

        // 简化语法：直接传入对象数组
        const measure = createMeasure([serviceA, serviceB]);

        await measure(
            () => {
                serviceA.method1();
                serviceA.method2();
                serviceB.method3();
                serviceB.method4();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // 应该有 4 个方法调用
        expect(flatResults.length).toBe(4);

        const callees = flatResults.map((r) => r.callee);
        expect(callees).toContain("ServiceA:method1");
        expect(callees).toContain("ServiceA:method2");
        expect(callees).toContain("ServiceB:method3");
        expect(callees).toContain("ServiceB:method4");

        // 私有方法不应该被测量
        expect(callees).not.toContain("ServiceA:_internal");
        expect(callees).not.toContain("ServiceB:_helper");
    });

    test("应该支持混合使用指定方法和自动获取（多对象）", async () => {
        class ServiceA {
            method1(): number {
                return 1;
            }

            method2(): number {
                return 2;
            }
        }

        class ServiceB {
            method3(): number {
                return 3;
            }

            method4(): number {
                return 4;
            }
        }

        const serviceA = new ServiceA();
        const serviceB = new ServiceB();

        // ServiceA 指定方法，ServiceB 自动获取
        const measure = createMeasure([
            [serviceA, ["method1"]], // 只测量 method1
            [serviceB], // 自动测量所有方法
        ]);

        await measure(
            () => {
                serviceA.method1();
                serviceA.method2(); // 这个不会被测量
                serviceB.method3();
                serviceB.method4();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // 应该有 3 个方法调用（serviceA.method1 + serviceB 的两个方法）
        expect(flatResults.length).toBe(3);

        const callees = flatResults.map((r) => r.callee);
        expect(callees).toContain("ServiceA:method1");
        expect(callees).not.toContain("ServiceA:method2"); // 没有被测量
        expect(callees).toContain("ServiceB:method3");
        expect(callees).toContain("ServiceB:method4");
    });

    test("应该在自动获取方法时排除构造方法", async () => {
        class TestClass {
            constructor() {
                // 构造方法
            }

            method1(): number {
                return 1;
            }

            method2(): number {
                return 2;
            }
        }

        const obj = new TestClass();

        const measure = createMeasure(obj);

        await measure(
            () => {
                obj.method1();
                obj.method2();
            },
            { count: 1 },
        );

        const flatResults = measure.getFlatResults();

        // 应该只有 method1 和 method2，没有 constructor
        const callees = flatResults.map((r) => r.callee);
        expect(callees).toContain("method1");
        expect(callees).toContain("method2");
        expect(callees).not.toContain("constructor");
    });
});
