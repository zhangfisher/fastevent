/**
 * 用于标记已封装对象的 Symbol
 */
const MEASURE_WRAPPED_SYMBOL = Symbol("createMeasure.wrapped");

/**
 * 获取高精度时间戳（跨平台）
 * 在浏览器和 Node.js 环境中都可用
 */
function getHighPrecisionTime(): number {
    // 优先使用 performance API（浏览器和 Node.js 8+）
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
        return performance.now();
    }
    // 兜底方案：使用 Date.now()
    return Date.now();
}

/**
 * 已封装对象的 WeakMap，用于跟踪包装状态
 */
const wrappedObjects = new WeakMap<object, Set<string>>();

/**
 * 测量选项
 */
export interface MeasureOptions {
    /** 预热次数（默认 5） */
    warmup?: number;
    /** 执行次数（默认 100） */
    count?: number;
}

/**
 * 测量统计结果
 */
export interface MeasureStats {
    /** 平均执行时长（毫秒） */
    duration: number;
    /** 最大执行时长（毫秒） */
    max: number;
    /** 最小执行时长（毫秒） */
    min: number;
}

/**
 * 树形结构的测量结果节点（results 中的每个元素）
 */
export interface MeasureResultNode {
    /** 唯一标识符 */
    id: number;
    /** 被调用的方法名 */
    callee: string;
    /** 调用深度（0表示顶层调用） */
    depth: number;
    /** 调用者方法名 */
    caller?: string;
    /** 调用者所在文件和行号（如 "file.js:123"） */
    file?: string;
    /** 执行时长（毫秒） */
    duration: number;
    /** 子调用列表 */
    children: MeasureResultNode[];
}

/**
 * 内部使用的平面测量结果
 */
interface FlatMeasureResult {
    id: number;
    callee: string;
    parentId: number | null; // 内部使用，构建树时需要
    depth: number;
    caller?: string;
    file?: string;
    duration: number;
}

/**
 * 测量函数类型
 */
export type MeasureFunction = (
    callback: () => void | Promise<void>,
    options?: MeasureOptions,
) => Promise<MeasureStats>;

/**
 * 测量函数扩展接口（直接包含 MeasureControl 成员）
 */
export interface MeasureObject extends MeasureFunction {
    /** 测量结果列表（树形结构，根节点数组） */
    results: MeasureResultNode[];
    /** 获取平面结构的结果 */
    getFlatResults: () => FlatMeasureResult[];
    /** 获取指定方法的所有调用 */
    getCalls: (methodName: string) => MeasureResultNode[];
    /** 将结果渲染为树形字符串（用于终端输出） */
    toTree: () => string;
    /** 清空测量结果 */
    clear: () => void;
    /** 是否启用测量 */
    enabled: boolean;
}

/**
 * 全局调用栈，用于追踪调用关系
 */
interface CallStackItem {
    id: number;
    methodName: string;
    depth: number;
}

/**
 * ID 生成器（全局递增纯数字）
 */
let idCounter = 0;
function generateId(): number {
    return ++idCounter;
}

/**
 * 解析栈信息，提取方法名和文件路径
 */
function parseStackTrace(stackLine: string | undefined): { caller?: string; file?: string } {
    if (!stackLine) return {};

    const trimmed = stackLine.trim();
    if (!trimmed) return {};

    // 栈信息格式: "at methodName (path/to/file:line:col)" 或 "at path/to/file:line:col"
    const methodNameMatch = trimmed.match(/at\s+(\w+)\s+\(([^)]+)\)/);
    const fileOnlyMatch = trimmed.match(/at\s+([^:]+:\d+:\d+)/);

    if (methodNameMatch) {
        // 格式: "at methodName (path/to/file:line:col)"
        const caller = methodNameMatch[1];
        const fileAndLine = methodNameMatch[2];
        // 提取文件路径和行号，去掉列号
        const file = fileAndLine.replace(/:\d+$/, "");
        return { caller, file };
    } else if (fileOnlyMatch) {
        // 格式: "at path/to/file:line:col" (没有方法名)
        const fileAndLine = fileOnlyMatch[1];
        const file = fileAndLine.replace(/:\d+$/, "");
        return { file };
    }

    return {};
}

/**
 * 为方法添加测量行为（支持调用树追踪）
 */
function measureMethod(
    target: Function,
    enabled: { value: boolean },
    callStack: CallStackItem[],
    flatResults: FlatMeasureResult[],
    objectPrefix?: string,
): Function {
    const original = target;
    const name = target.name;
    const fullName = objectPrefix ? `${objectPrefix}:${name}` : name;

    return function (this: any, ...args: any) {
        // 如果未启用测量，直接执行原方法
        if (!enabled.value) {
            return original.apply(this, args);
        }

        const startTime = getHighPrecisionTime();
        const id = generateId();

        // 获取父调用信息
        const parentItem = callStack.length > 0 ? callStack[callStack.length - 1] : null;
        const depth = parentItem ? parentItem.depth + 1 : 0;
        const parentId = parentItem ? parentItem.id : null;

        // 将当前调用压入栈
        const currentItem: CallStackItem = { id, methodName: fullName, depth };
        callStack.push(currentItem);

        // 获取调用者信息（从调用栈中提取）
        const stack = new Error().stack;
        const stackLines = stack?.split("\n") || [];
        // 找到第一个不是我们内部函数的栈帧
        let callerInfo: { caller?: string; file?: string } = {};
        for (let i = 2; i < stackLines.length; i++) {
            const line = stackLines[i]?.trim();
            if (line && !line.includes("measure.ts") && !line.includes("measureMethod")) {
                callerInfo = parseStackTrace(line);
                break;
            }
        }

        // 执行原方法
        const result = original.apply(this, args);

        // 处理异步函数
        if (result && typeof result.then === "function") {
            return result.finally(() => {
                const endTime = getHighPrecisionTime();
                const duration = endTime - startTime;

                // 创建平面结果记录
                const flatResult: FlatMeasureResult = {
                    id,
                    callee: fullName,
                    parentId,
                    depth,
                    caller: callerInfo.caller,
                    file: callerInfo.file,
                    duration,
                };

                flatResults.push(flatResult);
                // 弹出当前调用
                callStack.pop();
            });
        }

        // 同步函数
        const endTime = getHighPrecisionTime();
        const duration = endTime - startTime;

        // 创建平面结果记录
        const flatResult: FlatMeasureResult = {
            id,
            callee: fullName,
            parentId,
            depth,
            caller: callerInfo.caller,
            file: callerInfo.file,
            duration,
        };

        flatResults.push(flatResult);

        // 弹出当前调用
        callStack.pop();

        return result;
    };
}

/**
 * 将平面结果列表转换为树形结构
 */
function buildTree(flatResults: FlatMeasureResult[]): MeasureResultNode[] {
    const nodeMap = new Map<number, MeasureResultNode>();
    const rootNodes: MeasureResultNode[] = [];

    // 创建所有节点
    for (const result of flatResults) {
        const node: MeasureResultNode = { ...result, children: [] };
        nodeMap.set(result.id, node);
    }

    // 构建树形结构
    for (const result of flatResults) {
        const node = nodeMap.get(result.id)!;

        if (result.parentId === null) {
            // 顶层节点
            rootNodes.push(node);
        } else {
            // 子节点，添加到父节点的children中
            const parentNode = nodeMap.get(result.parentId);
            if (parentNode) {
                parentNode.children.push(node);
            }
        }
    }

    return rootNodes;
}

/**
 * 将树形节点渲染为字符串
 */
function renderNode(node: MeasureResultNode, prefix: string = "", isLast: boolean = true): string {
    const connector = isLast ? "└──" : "├──";
    const durationStr = node.duration.toFixed(2);

    let result = `${prefix}${connector} ${node.callee} (${durationStr}ms)\n`;

    // 处理子节点
    const childPrefix = prefix + (isLast ? "    " : "│   ");
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const isLastChild = i === node.children.length - 1;
        result += renderNode(child, childPrefix, isLastChild);
    }

    return result;
}

/**
 * 将树形结构渲染为字符串（用于终端输出）
 */
function renderTree(nodes: MeasureResultNode[]): string {
    if (nodes.length === 0) {
        return "(no measurements)\n";
    }

    let result = "";
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const isLast = i === nodes.length - 1;
        result += renderNode(node, "", isLast);
    }
    return result;
}

/**
 * 获取对象的名称（用于方法名前缀）
 */
function getObjectName(obj: object): string {
    if (!obj) return "Unknown";

    // 获取构造函数名称
    const constructor = obj.constructor;
    if (constructor && constructor.name) {
        return constructor.name;
    }

    // 兜底：使用对象类型
    const type = typeof obj;
    if (type === "object") {
        return "Object";
    }

    return type;
}

/**
 * 获取对象的所有方法名（排除构造方法、私有方法和访问器）
 */
function getAllMethodNames(obj: object): string[] {
    const methodNames: string[] = [];

    // 获取对象原型链上的所有属性
    const proto = Object.getPrototypeOf(obj);
    const allKeys = new Set([
        ...Object.keys(obj),
        ...Object.getOwnPropertyNames(proto),
        ...Object.keys(proto),
    ]);

    for (const key of allKeys) {
        // 排除构造方法
        if (key === "constructor") continue;

        // 排除以下划线开头的私有方法
        // if (key.startsWith("_")) continue;

        const descriptor =
            Object.getOwnPropertyDescriptor(obj, key) ||
            Object.getOwnPropertyDescriptor(proto, key);

        if (!descriptor) continue;

        // 排除访问器（get/set）
        if (descriptor.get || descriptor.set) continue;

        // 只包含可调用的方法
        const value = (obj as any)[key];
        if (typeof value === "function") {
            methodNames.push(key);
        }
    }

    return methodNames;
}

/**
 * 测量上下文接口
 */
interface MeasureContext {
    callStack: CallStackItem[];
    flatResults: FlatMeasureResult[];
    enabled: { value: boolean };
}

/**
 * 输入类型枚举
 */
enum InputType {
    EmptyArray,
    TupleArray,
    ObjectArray,
    SingleObject,
}

/**
 * 判断输入类型
 */
function detectInputType(
    objOrObjs: object | [object, string[]][] | [object][],
    isArray: boolean,
): InputType {
    if (!isArray) return InputType.SingleObject;

    const arr = objOrObjs as any[];
    if (arr.length === 0) return InputType.EmptyArray;
    if (Array.isArray(arr[0])) return InputType.TupleArray;
    if (typeof arr[0] === "object") return InputType.ObjectArray;

    return InputType.SingleObject;
}

/**
 * 解析输入为统一的对象-方法对格式
 */
function parseInputToMethodPairs(
    objOrObjs: object | [object, string[]][] | [object][],
    methods?: (string | keyof object)[],
): [object, string[]][] {
    const isArray = Array.isArray(objOrObjs);
    const inputType = detectInputType(objOrObjs, isArray);

    switch (inputType) {
        case InputType.EmptyArray:
            return [];

        case InputType.TupleArray:
            // 元组数组语法: createMeasure([[obj1, ['m1', 'm2']], [obj2]])
            const input = objOrObjs as ([object] | [object, string[]])[];
            return input.map(([obj, methods]) => [obj, methods || getAllMethodNames(obj)]);

        case InputType.ObjectArray:
            // 简化语法: createMeasure([obj1, obj2])
            const objs = objOrObjs as object[];
            return objs.map((obj) => [obj, getAllMethodNames(obj)]);

        case InputType.SingleObject:
            // 单对象签名: createMeasure(obj, ['m1', 'm2']) 或 createMeasure(obj)
            const obj = objOrObjs as object;
            const methodsList = methods || getAllMethodNames(obj);
            return [[obj, methodsList]];
    }
}

/**
 * 包装单个对象的方法
 */
function wrapSingleObjectMethods(
    obj: object,
    methods: string[],
    context: MeasureContext,
    useObjectPrefix: boolean,
): void {
    // 获取或创建该对象的已包装方法集合
    let wrappedMethods = wrappedObjects.get(obj);
    if (!wrappedMethods) {
        wrappedMethods = new Set<string>();
        wrappedObjects.set(obj, wrappedMethods);
    }

    // 多对象模式时，使用对象名称作为前缀
    const objectPrefix = useObjectPrefix ? getObjectName(obj) : undefined;

    // 为指定方法包装测量行为
    for (const methodName of methods) {
        const methodNameStr = String(methodName);

        // 如果该方法已经被包装过，跳过
        if (wrappedMethods.has(methodNameStr)) {
            continue;
        }

        const method = (obj as any)[methodName];
        if (typeof method === "function") {
            // 创建包装后的方法
            const wrapped = measureMethod(
                method as Function,
                context.enabled,
                context.callStack,
                context.flatResults,
                objectPrefix,
            );
            // 保留方法名
            Object.defineProperty(wrapped, "name", {
                value: methodNameStr,
                configurable: true,
            });
            // 替换原方法
            (obj as any)[methodName] = wrapped;
            // 标记为已包装
            wrappedMethods.add(methodNameStr);
        }
    }
}

/**
 * 包装所有对象的方法
 */
function wrapAllObjectMethods(
    objectMethodPairs: [object, string[]][],
    context: MeasureContext,
    useObjectPrefix: boolean,
): void {
    for (const [obj, methods] of objectMethodPairs) {
        wrapSingleObjectMethods(obj, methods, context, useObjectPrefix);
    }
}

/**
 * 创建测量函数的核心逻辑
 */
function createMeasureFunctionCore(context: MeasureContext): MeasureObject {
    return async function (
        callback: () => void | Promise<void>,
        options: MeasureOptions = {},
    ): Promise<MeasureStats> {
        const { warmup: warmupCount = 5, count: executionCount = 100 } = options;

        // 预热阶段
        for (let i = 0; i < warmupCount; i++) {
            await callback();
        }

        // 清空调用栈和结果
        context.callStack.length = 0;
        context.flatResults.length = 0;
        idCounter = 0;

        // 启用测量
        context.enabled.value = true;

        // 测量阶段
        const durations: number[] = [];
        for (let i = 0; i < executionCount; i++) {
            // 清空调用栈（保持ID计数器）
            context.callStack.length = 0;
            const startId = idCounter + 1;

            const startTime = getHighPrecisionTime();
            await callback();
            const endTime = performance.now();

            const duration = endTime - startTime;
            durations.push(duration);

            // 移除这次迭代的结果（因为我们用外部计时）
            // 只保留最后一次的结果用于树形结构展示
            if (i < executionCount - 1) {
                context.flatResults.length = 0;
                idCounter = startId;
            }
        }

        // 禁用测量
        context.enabled.value = false;

        // 计算统计数据
        const sum = durations.reduce((a, b) => a + b, 0);
        const avg = sum / durations.length;
        const max = Math.max(...durations);
        const min = Math.min(...durations);

        return {
            duration: avg,
            max,
            min,
        };
    } as MeasureObject;
}

/**
 * 附加测量属性到函数
 */
function attachMeasureProperties(measureFunction: MeasureObject, context: MeasureContext): void {
    Object.defineProperty(measureFunction, "results", {
        get(): MeasureResultNode[] {
            return buildTree(context.flatResults);
        },
        enumerable: true,
        configurable: true,
    });

    Object.defineProperty(measureFunction, "enabled", {
        get(): boolean {
            return context.enabled.value;
        },
        enumerable: true,
        configurable: true,
    });

    measureFunction.clear = () => {
        context.flatResults.length = 0;
    };

    measureFunction.getFlatResults = () => {
        return [...context.flatResults];
    };

    measureFunction.getCalls = (methodName: string) => {
        const tree = buildTree(context.flatResults);

        // 递归查找所有匹配的节点
        const findCalls = (nodes: MeasureResultNode[]): MeasureResultNode[] => {
            const result: MeasureResultNode[] = [];
            for (const node of nodes) {
                if (node.callee === methodName) {
                    result.push(node);
                }
                if (node.children.length > 0) {
                    result.push(...findCalls(node.children));
                }
            }
            return result;
        };

        return findCalls(tree);
    };

    measureFunction.toTree = () => {
        const tree = buildTree(context.flatResults);
        return renderTree(tree);
    };
}

/**
 * 为单个对象的指定方法添加测量行为，返回测量函数
 *
 * @param obj - 目标对象
 * @param methods - 需要测量的方法名数组（可选，未指定时自动测量所有方法）
 * @returns 测量函数（直接包含 results、getFlatResults、getCalls、toTree、clear、enabled 等成员）
 *
 * @example
 * ```typescript
 * // 指定要测量的方法
 * const measure = createMeasure(new MyClass(), ['method1', 'method2']);
 * const stats = await measure(
 *     () => { obj.method1(); },
 *     { warmupCount: 5, executionCount: 100 }
 * );
 * console.log(stats); // { duration: number, max: number, min: number }
 *
 * // 自动测量所有方法（排除构造方法、私有方法和访问器）
 * const measure = createMeasure(new MyClass());
 * const stats = await measure(
 *     () => { obj.anyMethod(); },
 *     { executionCount: 100 }
 * );
 * ```
 */
export function createMeasure(obj: object, methods?: (string | keyof object)[]): MeasureObject;

/**
 * 为多个对象分别指定不同的测量方法，返回测量函数
 *
 * @param objs - 对象和方法元组数组，每个元组包含 [对象, 方法名数组?]（方法数组可选）
 * @returns 测量函数（直接包含 results、getFlatResults、getCalls、toTree、clear、enabled 等成员）
 *
 * @example
 * ```typescript
 * // 指定每个对象要测量的方法
 * const measure = createMeasure([
 *     [userService, ['getUser', 'validateUser']],
 *     [postService, ['getPost', 'validatePost']]
 * ]);
 *
 * // 自动测量所有方法（简化语法）
 * const measure = createMeasure([
 *     userService,
 *     postService
 * ]);
 *
 * // 或使用元组语法（自动测量所有方法）
 * const measure = createMeasure([
 *     [userService],
 *     [postService]
 * ]);
 *
 * // 混合使用：某些对象指定方法，某些对象自动测量
 * const measure = createMeasure([
 *     [userService, ['getUser']], // 只测量 getUser
 *     [postService] // 自动测量所有方法
 * ]);
 *
 * const stats = await measure(
 *     () => {
 *         userService.getUser(1);
 *         postService.getPost(1);
 *     },
 *     { executionCount: 100 }
 * );
 * // 结果中的 callee 会是 "UserService:getUser", "PostService:getPost"
 *
 * // 访问详细结果
 * console.log(measure.results);
 * console.log(measure.toTree());
 * ```
 */
export function createMeasure(objs: ([object, string[]] | [object] | object)[]): MeasureObject;

/**
 * createMeasure 函数实现（重载实现）
 */
export function createMeasure(
    objOrObjs: object | ([object, string[]] | [object] | object)[],
    methods?: (string | keyof object)[],
): MeasureObject {
    // 创建测量上下文
    const context: MeasureContext = {
        callStack: [],
        flatResults: [],
        enabled: { value: false },
    };

    // 解析输入为统一格式
    const objectMethodPairs = parseInputToMethodPairs(objOrObjs, methods);
    // 判断是否是多对象模式（用于添加对象前缀）
    const isArray = Array.isArray(objOrObjs);
    const inputType = detectInputType(objOrObjs, isArray);
    const useObjectPrefix =
        inputType === InputType.TupleArray || inputType === InputType.ObjectArray;

    // 包装所有对象的方法
    wrapAllObjectMethods(objectMethodPairs, context, useObjectPrefix);

    // 创建测量函数核心
    const measureFunction = createMeasureFunctionCore(context);

    // 附加测量属性
    attachMeasureProperties(measureFunction, context);

    return measureFunction;
}
