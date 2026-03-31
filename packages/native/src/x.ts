// 1. 定义一个具体的函数类型，限制参数必须是 boolean 和 number
type StrictMethodSignature = (a: boolean, b: number) => any;

// 2. 定义装饰器，使用泛型 T 继承自上面的类型
// 这样 T 就只能是符合 (a: boolean, b: number) => any 的函数
function logged<T extends StrictMethodSignature>(
    value: T,
    { kind, name }: ClassMethodDecoratorContext,
) {
    if (kind === "method") {
        // 返回的新函数也遵循同样的参数类型 T
        return function (this: any, ...args: Parameters<T>): ReturnType<T> {
            console.log(`starting ${String(name)} with arguments ${args.join(", ")}`);

            // 调用原始方法
            const ret = value.apply(this, args);

            console.log(`ending ${String(name)}`);
            return ret;
        };
    }
}

// --- 使用示例 ---

class C {
    // ✅ 正确：参数类型完全匹配
    @logged
    m(a: boolean, b: number) {
        console.log("Method executed", a, b);
    }

    // ❌ 错误：参数类型不匹配，TypeScript 会报错
    // Type '(x: string, y: number) => void' is not assignable to type 'StrictMethodSignature'
    // @logged
    // wrongMethod(x: string, y: number) {}
}

// --- 运行时测试 ---
const c = new C();
c.m(true, 123);
