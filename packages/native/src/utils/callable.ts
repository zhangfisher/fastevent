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
): T & (T[M] extends (...args: infer A) => infer R ? (...args: A) => R : never);
export function callable(instance: object, methodName?: string): any {
    const className = instance.constructor.name;
    // oxlint-disable-next-line typescript/no-implied-eval
    const callable = new Function(
        "instance",
        "methodName",
        `
        return function ${className}(...args) {
            return instance[methodName].apply(instance, args);
        };
    `,
    )(instance, methodName || "_call");

    Object.setPrototypeOf(callable, Object.getPrototypeOf(instance));
    Object.assign(callable, instance);
    return callable as any;
}

// ************** 示例 **************
// class My implements AsyncIterableIterator<any> {
//     buffer: any[] = Array.from({ length: 100 }, (_, i) => i + 1);
//     private index = 0;

//     constructor(public count: number = 0) {
//         this.buffer.push(count);
//     }

//     [Symbol.asyncIterator](): AsyncIterableIterator<any> {
//         return this;
//     }

//     async next(...[_value]: [] | [any]): Promise<IteratorResult<any, any>> {
//         if (this.index < this.buffer.length) {
//             return { done: false, value: this.buffer[this.index++] };
//         }
//         return { done: true, value: undefined };
//     }

//     async return?(value?: any): Promise<IteratorResult<any, any>> {
//         return { done: true, value };
//     }

//     async throw?(e?: any): Promise<IteratorResult<any, any>> {
//         throw e;
//     }

//     _call(a: number, b: boolean) {
//         console.log("this=", this);
//         console.log("args=", a);
//         console.log("buffer=", this.buffer);
//     }

//     add(value: number) {
//         this.buffer.push(value);
//     }

//     reset() {
//         this.index = 0;
//     }
// }

// const my = callable(new My(100), "_call");
// my.add(2);
// console.log(my.buffer);

// my(1, true);
