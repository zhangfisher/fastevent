const std = @import("std");
const Allocator = std.mem.Allocator;

/// 事件监听器函数类型
pub const EventListener = *const fn (message: *EventMessage) anyerror!void;

/// 事件消息结构
pub const EventMessage = struct {
    type: []const u8,
    payload: ?*anyopaque,
    meta: ?std.StringHashMap([]const u8),

    pub fn init(type: []const u8, payload: ?*anyopaque, meta: ?std.StringHashMap([]const u8)) EventMessage {
        return .{
            .type = type,
            .payload = payload,
            .meta = meta,
        };
    }
};

/// 事件监听选项
pub const ListenOptions = struct {
    count: usize = 0, // 0表示无限次数
    prepend: bool = false,
};

/// 事件订阅者接口
pub const Subscriber = struct {
    off_fn: *const fn () void,

    pub fn off(self: *const Subscriber) void {
        self.off_fn();
    }
};

/// 事件选项
pub const EventOptions = struct {
    debug: bool = false,
    id: []const u8 = undefined,
    delimiter: []const u8 = "/",
    context: ?*anyopaque = null,
    ignore_errors: bool = true,
    meta: ?std.StringHashMap([]const u8) = null,

    // 回调函数
    on_add_listener: ?*const fn (path: []const []const u8, listener: EventListener) void = null,
    on_remove_listener: ?*const fn (path: []const []const u8, listener: EventListener) void = null,
    on_clear_listeners: ?*const fn () void = null,
    on_listener_error: ?*const fn (event_type: []const u8, err: anyerror) void = null,
    on_execute_listener: ?*const fn (message: *EventMessage, results: []const anyerror!void, listeners: []const EventListener) void = null,
};

/// 监听器节点结构
pub const ListenerNode = struct {
    listeners: std.ArrayList(ListenerEntry),
    children: std.StringHashMap(*ListenerNode),
    allocator: Allocator,

    pub fn init(allocator: Allocator) !*ListenerNode {
        const node = try allocator.create(ListenerNode);
        node.* = .{
            .listeners = std.ArrayList(ListenerEntry).init(allocator),
            .children = std.StringHashMap(*ListenerNode).init(allocator),
            .allocator = allocator,
        };
        return node;
    }

    pub fn deinit(self: *ListenerNode) void {
        var it = self.children.iterator();
        while (it.next()) |entry| {
            entry.value_ptr.*.deinit();
            self.allocator.destroy(entry.value_ptr.*);
        }
        self.children.deinit();
        self.listeners.deinit();
    }
};

/// 监听器条目，可以是普通监听器或带计数的监听器
pub const ListenerEntry = union(enum) {
    Simple: EventListener,
    Counted: struct {
        listener: EventListener,
        count: usize,
    },
};
