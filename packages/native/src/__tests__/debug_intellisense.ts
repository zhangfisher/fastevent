/**
 * 诊断 IntelliSense 不显示事件名的问题
 */

import { FastEvent } from "../event";
import { FastEventScope } from "../scope";
import { ScopeEvents } from "../types";

type Events = {
    "rooms/*/users/online": { name: string; status?: number; root: boolean };
    "rooms/*/users/*/online": { name: string; status?: number };
    "rooms/*/users/*/offline": boolean;
    "rooms/*/posts/**": number;
    "rooms/*/posts/*/online": number;
};

const emitter = new FastEvent<Events>();
const useScope = emitter.scope(`rooms/x`);

class User extends FastEventScope {
    login(name: string) {}
    logout() {}
}

// 问题场景 1: 不显式指定类型参数
const jack = useScope.scope("users/jack", new User());
// jack.on(' 在编辑器中不提示 online/offline

// 问题场景 2: 尝试显式指定类型参数
const jack2 = useScope.scope<User, "users/jack">("users/jack", new User());
// 仍然不提示

// 问题场景 3: 使用类型断言
type JackType = FastEventScope<
    ScopeEvents<ScopeEvents<Events, "rooms/x">, "users/jack">,
    Record<string, any>,
    never
> & User;
const jack3 = useScope.scope("users/jack", new User()) as JackType;
// 可能会提示，但不优雅

// 检查事件类型
type ExpectedJackEvents = {
    online: { name: string; status?: number };
    "*": { name: string; status?: number };
    offline: boolean;
};

type ActualJackEvents = typeof jack.types.events;

// 对比类型
type TestEqual = ActualJackEvents extends ExpectedJackEvents ? true : false;

export { jack, jack2, jack3 };
