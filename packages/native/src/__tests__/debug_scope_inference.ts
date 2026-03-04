// 调试作用域类型推断问题

import { FastEvent } from "../event";
import { FastEventScope } from "../scope";

type Events = {
    "rooms/*/users/online": { name: string; status?: number; root: boolean };
    "rooms/*/users/*/online": { name: string; status?: number };
    "rooms/*/users/*/offline": boolean;
    "rooms/*/posts/**": number;
    "rooms/*/posts/*/online": number;
};

const emitter = new FastEvent<Events>();
const useScope = emitter.scope(`rooms/x`);

// 测试：useScope 的事件类型
type UseScopeEvents = typeof useScope.types.events;
// 期望: {
//     "users/online": { name: string; status?: number; root: boolean };
//     "users/*/online": { name: string; status?: number };
//     "users/*/offline": boolean;
//     "posts/**": number;
//     "posts/*/online": number;
// }

// 创建 User 类
class User extends FastEventScope {
    login(name: string) {}
    logout() {}
}

// 问题：jack 的类型推断
const jack = useScope.scope("users/jack", new User());

// 查看 jack 的事件类型
type JackEvents = typeof jack.types.events;

// 手动指定类型参数，验证类型定义是否正确
const jackTyped = useScope.scope<User, "users/jack">("users/jack", new User());
type JackTypedEvents = typeof jackTyped.types.events;

// 检查 jack 是否有 login/logout 方法
type JackHasLogin = "login" extends keyof typeof jack ? true : false;
type JackHasLogout = "logout" extends keyof typeof jack ? true : false;

// 测试 on 方法的类型推断
jack.on("online", (message) => {
    // 这个应该能正确推断类型
    type MessageType = typeof message.type;
    type PayloadType = typeof message.payload;
});

// 在编辑器中输入 jack.on(" 时，应该提示 "online", "offline" 等
// 但实际可能不提示

// 导出类型供测试使用
export type {
    UseScopeEvents,
    JackEvents,
    JackTypedEvents,
    JackHasLogin,
    JackHasLogout,
};
