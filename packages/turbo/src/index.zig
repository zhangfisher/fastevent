//! FastEvent是一个高性能的事件系统，支持事件监听、触发、作用域管理和通配符匹配等功能。
//! 它使用Zig语言实现，提供了类型安全和内存安全的事件处理机制。

pub const types = @import("types.zig");
pub const event = @import("event.zig");
pub const scope = @import("scope.zig");
pub const utils = @import("utils.zig");

// 重导出常用类型
pub const EventEmitter = event.EventEmitter;
pub const EventScope = scope.EventScope;
pub const EventMessage = types.EventMessage;
pub const EventListener = types.EventListener;
pub const ListenOptions = types.ListenOptions;
pub const Subscriber = types.Subscriber;
pub const EventOptions = types.EventOptions;

// 重导出常用函数
pub const createRootScope = scope.createRootScope;

/// 创建一个新的事件发射器
pub fn createEmitter(allocator: @import("std").mem.Allocator, options: EventOptions) !*EventEmitter {
    return EventEmitter.init(allocator, options);
}

test {
    // 运行所有测试
    @import("std").testing.refAllDecls(@This());
}

/// 使用示例
const example = @"
// 创建事件发射器
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
defer _ = gpa.deinit();
const allocator = gpa.allocator();

// 配置选项
const options = EventOptions{
    .debug = true,
    .delimiter = '/',
};

// 创建发射器
var emitter = try createEmitter(allocator, options);
defer emitter.deinit();

// 创建根作用域
var root_scope = try createRootScope(allocator, emitter);
defer root_scope.deinit();

// 添加事件监听器
try root_scope.on('user/login', userLoginHandler, .{});

// 触发事件
try emitter.emit('user/login', userInfo, null);

// 使用通配符监听
try root_scope.on('user/*', anyUserEventHandler, .{});

// 创建子作用域
var sub_scope = try root_scope.createScope();
defer sub_scope.deinit();

// 在子作用域中添加监听器
try sub_scope.on('chat/message', chatMessageHandler, .{});

// 当不再需要时，dispose()会自动清理所有监听器
sub_scope.dispose();
";