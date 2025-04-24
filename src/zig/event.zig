const std = @import("std");
const types = @import("types.zig");
const Allocator = std.mem.Allocator;

const EventListener = types.EventListener;
const EventMessage = types.EventMessage;
const ListenOptions = types.ListenOptions;
const Subscriber = types.Subscriber;
const EventOptions = types.EventOptions;
const ListenerNode = types.ListenerNode;
const ListenerEntry = types.ListenerEntry;

/// 事件发射器
pub const EventEmitter = struct {
    allocator: Allocator,
    options: EventOptions,
    root: *ListenerNode,
    retained_events: std.StringHashMap(std.ArrayList(EventMessage)),

    pub fn init(allocator: Allocator, options: EventOptions) !*EventEmitter {
        const emitter = try allocator.create(EventEmitter);
        emitter.* = .{
            .allocator = allocator,
            .options = options,
            .root = try ListenerNode.init(allocator),
            .retained_events = std.StringHashMap(std.ArrayList(EventMessage)).init(allocator),
        };
        return emitter;
    }

    pub fn deinit(self: *EventEmitter) void {
        var it = self.retained_events.iterator();
        while (it.next()) |entry| {
            entry.value_ptr.deinit();
        }
        self.retained_events.deinit();
        self.root.deinit();
        self.allocator.destroy(self.root);
        self.allocator.destroy(self);
    }

    /// 添加事件监听器
    pub fn on(self: *EventEmitter, event_type: []const u8, listener: EventListener, options: ListenOptions) !*Subscriber {
        const path = try self.splitEventPath(event_type);
        defer self.allocator.free(path);

        var node = self.root;
        for (path) |segment| {
            var child = node.children.get(segment) orelse {
                const new_node = try ListenerNode.init(self.allocator);
                try node.children.put(segment, new_node);
                new_node;
            };
            node = child;
        }

        const entry = if (options.count > 0)
            ListenerEntry{ .Counted = .{ .listener = listener, .count = options.count } }
        else
            ListenerEntry{ .Simple = listener };

        if (options.prepend) {
            try node.listeners.insert(0, entry);
        } else {
            try node.listeners.append(entry);
        }

        if (self.options.on_add_listener) |callback| {
            callback(path, listener);
        }

        // 处理保留的事件
        if (self.retained_events.get(event_type)) |events| {
            for (events.items) |msg| {
                _ = try self.executeListener(listener, &msg);
            }
        }

        const subscriber = try self.allocator.create(Subscriber);
        subscriber.* = .{
            .off_fn = struct {
                fn off(sub: *Subscriber) void {
                    self.off(event_type, listener);
                    self.allocator.destroy(sub);
                }
            }.off,
        };

        return subscriber;
    }

    /// 移除事件监听器
    pub fn off(self: *EventEmitter, event_type: []const u8, listener: ?EventListener) void {
        const path = self.splitEventPath(event_type) catch return;
        defer self.allocator.free(path);

        if (self.options.on_remove_listener) |callback| {
            if (listener) |l| {
                callback(path, l);
            }
        }

        var node = self.root;
        var nodes = std.ArrayList(*ListenerNode).init(self.allocator);
        defer nodes.deinit();

        // 找到目标节点
        for (path) |segment| {
            if (node.children.get(segment)) |child| {
                try nodes.append(node);
                node = child;
            } else {
                return;
            }
        }

        // 移除监听器
        if (listener) |l| {
            var i: usize = 0;
            while (i < node.listeners.items.len) {
                const entry = node.listeners.items[i];
                const current = switch (entry) {
                    .Simple => |simple| simple,
                    .Counted => |counted| counted.listener,
                };
                if (current == l) {
                    _ = node.listeners.orderedRemove(i);
                } else {
                    i += 1;
                }
            }
        } else {
            node.listeners.clearRetainingCapacity();
        }

        // 清理空节点
        if (node.listeners.items.len == 0 and node.children.count() == 0) {
            var i: usize = nodes.items.len;
            while (i > 0) : (i -= 1) {
                const parent = nodes.items[i - 1];
                const segment = path[i - 1];
                _ = parent.children.remove(segment);
                if (parent.listeners.items.len > 0 or parent.children.count() > 0) {
                    break;
                }
            }
        }
    }

    /// 触发事件
    pub fn emit(self: *EventEmitter, event_type: []const u8, payload: ?*anyopaque, meta: ?std.StringHashMap([]const u8)) !void {
        var message = EventMessage.init(event_type, payload, meta);
        const path = try self.splitEventPath(event_type);
        defer self.allocator.free(path);

        var results = std.ArrayList(anyerror!void).init(self.allocator);
        defer results.deinit();

        var listeners = std.ArrayList(EventListener).init(self.allocator);
        defer listeners.deinit();

        try self.collectListeners(self.root, path, 0, &listeners);

        for (listeners.items) |listener| {
            const result = self.executeListener(listener, &message);
            try results.append(result);
        }

        if (self.options.on_execute_listener) |callback| {
            callback(&message, results.items, listeners.items);
        }
    }

    /// 保留事件
    pub fn retain(self: *EventEmitter, event_type: []const u8, payload: ?*anyopaque, meta: ?std.StringHashMap([]const u8)) !void {
        var events = self.retained_events.get(event_type) orelse {
            var list = std.ArrayList(EventMessage).init(self.allocator);
            try self.retained_events.put(event_type, list);
            list;
        };
        try events.append(EventMessage.init(event_type, payload, meta));
        try self.emit(event_type, payload, meta);
    }

    /// 释放保留的事件
    pub fn release(self: *EventEmitter, event_type: []const u8) void {
        if (self.retained_events.get(event_type)) |events| {
            events.deinit();
            _ = self.retained_events.remove(event_type);
        }
    }

    // 内部辅助函数

    fn splitEventPath(self: *EventEmitter, event_type: []const u8) ![][]const u8 {
        var list = std.ArrayList([]const u8).init(self.allocator);
        var it = std.mem.split(u8, event_type, self.options.delimiter);
        while (it.next()) |segment| {
            try list.append(segment);
        }
        return list.toOwnedSlice();
    }

    fn executeListener(self: *EventEmitter, listener: EventListener, message: *EventMessage) anyerror!void {
        if (self.options.ignore_errors) {
            listener(message) catch |err| {
                if (self.options.on_listener_error) |callback| {
                    callback(message.type, err);
                }
            };
        } else {
            try listener(message);
        }
    }

    fn collectListeners(self: *EventEmitter, node: *ListenerNode, path: [][]const u8, depth: usize, result: *std.ArrayList(EventListener)) !void {
        // 添加当前节点的监听器
        for (node.listeners.items) |*entry| {
            switch (entry.*) {
                .Simple => |listener| try result.append(listener),
                .Counted => |*counted| {
                    if (counted.count > 0) {
                        try result.append(counted.listener);
                        counted.count -= 1;
                        if (counted.count == 0) {
                            // 移除用完的监听器
                            for (node.listeners.items, 0..) |e, i| {
                                if (std.meta.activeTag(e) == .Counted and &e.Counted == counted) {
                                    _ = node.listeners.orderedRemove(i);
                                    break;
                                }
                            }
                        }
                    }
                },
            }
        }

        if (depth >= path.len) return;

        // 处理通配符
        if (node.children.get("*")) |wildcard| {
            try self.collectListeners(wildcard, path, depth + 1, result);
        }

        // 处理具体路径
        if (node.children.get(path[depth])) |child| {
            try self.collectListeners(child, path, depth + 1, result);
        }
    }
};
