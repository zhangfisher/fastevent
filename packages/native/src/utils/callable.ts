/**
 *
 * 使一个类实例可以像函数一样调用
 *
 * class MyClass{
 *    _call(a:number,b:number){
 *    }
 * }
 *
 * const instance = new MyClass()
 * // 在实例同时也是一个函数
 * instance(1,2)
 *
 *
 *
 * @param instance
 * @param methodName
 * @returns
 */
type FunctionKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

type ClassInstance = { constructor: { name: string } } & object;

export function callable<T extends ClassInstance>(instance: T): T & ((...args: any[]) => any);
export function callable<T extends ClassInstance, M extends FunctionKeys<T>>(
    instance: T,
    methodName: M,
): T &
    (T[M] extends (...args: infer A) => infer R
        ? (...args: A) => R
        : never);
export function callable(instance: object, methodName?: string): any {
    const className = instance.constructor.name;
    // oxlint-disable-next-line typescript/no-implied-eval
    const callable = new Function(
        "instance",
        "methodName",
        `
        return function ${className}(...args) {
            return instance[methodName](...args);
        };
    `,
    )(instance, methodName || "_call");

    Object.setPrototypeOf(callable, Object.getPrototypeOf(instance));
    Object.assign(callable, instance);
    return callable as any;
}

// ************** 示例 **************
class My {
    buffer: any[] = [];
    constructor(public count: number = 0) {
        this.buffer.push(count);
    }

    _call(a: number, b: boolean) {
        console.log("this=", this);
        console.log("args=", a);
        console.log("buffer=", this.buffer);
    }

    add(value: number) {
        this.buffer.push(value);
    }
}

const my = callable(new My(100), "_call");
const my2 = callable(new My(100));
const my3 = new My(100);

my.add(2);
console.log(my.buffer);

my(1, true);
my2();
console.log(my.buffer);
console.log(my instanceof My);
console.log(my); // 显示为 [Function: bound] 而不是 My
console.dir(my); // 难以识别真实的类结构
