const std = @import("std");
const types = @import("types.zig");
const event = @import("event.zig");

const Allocator = std.mem.Allocator;
const EventEmitter = event.EventEmitter;
const Subscriber = types.Subscriber;
const EventListener = types.EventListener;
const ListenOptions = types.ListenOptions;

/// 事件作用域，用于管理一组相关的事件监听器
pub const EventScope = struct {
    allocator: Allocator,
    emitter: *EventEmitter,
    subscribers: std.ArrayList(*Subscriber),
    is_disposed: bool,

    pub fn init(allocator: Allocator, emitter: *EventEmitter) !*EventScope {
        const scope = try allocator.create(EventScope);
        scope.* = .{
            .allocator = allocator,
            .emitter = emitter,
            .subscribers = std.ArrayList(*Subscriber).init(allocator),
            .is_disposed = false,
        };
        return scope;
    }

    pub fn deinit(self: *EventScope) void {
        self.dispose();
        self.subscribers.deinit();
        self.allocator.destroy(self);
    }

    /// 在作用域中添加事件监听器
    pub fn on(self: *EventScope, event_type: []const u8, listener: EventListener, options: ListenOptions) !void {
        if (self.is_disposed) return error.ScopeDisposed;

        const subscriber = try self.emitter.on(event_type, listener, options);
        try self.subscribers.append(subscriber);
    }

    /// 移除作用域中的特定事件监听器
    pub fn off(self: *EventScope, event_type: []const u8, listener: EventListener) void {
        if (self.is_disposed) return;

        self.emitter.off(event_type, listener);

        // 移除对应的订阅者
        var i: usize = 0;
        while (i < self.subscribers.items.len) {
            const subscriber = self.subscribers.items[i];
            // 注意：这里的比较可能不够准确，因为我们无法直接比较函数指针
            // 在实际应用中可能需要更复杂的机制来匹配订阅者
            if (@ptrToInt(subscriber.off_fn) == @ptrToInt(listener)) {
                _ = self.subscribers.orderedRemove(i);
                self.allocator.destroy(subscriber);
            } else {
                i += 1;
            }
        }
    }

    /// 清理作用域中的所有事件监听器
    pub fn dispose(self: *EventScope) void {
        if (self.is_disposed) return;
        self.is_disposed = true;

        // 移除所有订阅者
        for (self.subscribers.items) |subscriber| {
            subscriber.off();
            self.allocator.destroy(subscriber);
        }
        self.subscribers.clearRetainingCapacity();
    }

    /// 创建子作用域
    pub fn createScope(self: *EventScope) !*EventScope {
        if (self.is_disposed) return error.ScopeDisposed;

        const child_scope = try EventScope.init(self.allocator, self.emitter);
        const subscriber = try self.allocator.create(Subscriber);
        subscriber.* = .{
            .off_fn = struct {
                fn off(sub: *Subscriber) void {
                    child_scope.dispose();
                    child_scope.allocator.destroy(sub);
                }
            }.off,
        };
        try self.subscribers.append(subscriber);
        return child_scope;
    }

    /// 检查作用域是否已被清理
    pub fn isDisposed(self: *const EventScope) bool {
        return self.is_disposed;
    }
};

/// 创建根作用域
pub fn createRootScope(allocator: Allocator, emitter: *EventEmitter) !*EventScope {
    return EventScope.init(allocator, emitter);
}
