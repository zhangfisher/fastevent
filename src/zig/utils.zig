const std = @import("std");
const Allocator = std.mem.Allocator;

/// 检查字符串是否包含通配符
pub fn hasWildcard(str: []const u8) bool {
    return std.mem.indexOf(u8, str, "*") != null;
}

/// 将事件类型字符串分割为路径段
pub fn splitEventPath(allocator: Allocator, event_type: []const u8, delimiter: []const u8) ![][]const u8 {
    var list = std.ArrayList([]const u8).init(allocator);
    errdefer list.deinit();

    var it = std.mem.split(u8, event_type, delimiter);
    while (it.next()) |segment| {
        const owned_segment = try allocator.dupe(u8, segment);
        errdefer allocator.free(owned_segment);
        try list.append(owned_segment);
    }

    return list.toOwnedSlice();
}

/// 释放splitEventPath返回的路径段数组
pub fn freeEventPath(allocator: Allocator, path: [][]const u8) void {
    for (path) |segment| {
        allocator.free(segment);
    }
    allocator.free(path);
}

/// 将路径段合并为事件类型字符串
pub fn joinEventPath(allocator: Allocator, path: []const []const u8, delimiter: []const u8) ![]u8 {
    if (path.len == 0) return allocator.dupe(u8, "");

    // 计算所需的总长度
    var total_len: usize = 0;
    for (path) |segment| {
        total_len += segment.len;
    }
    total_len += delimiter.len * (path.len - 1);

    // 分配内存并构建结果
    const result = try allocator.alloc(u8, total_len);
    errdefer allocator.free(result);

    var pos: usize = 0;
    for (path, 0..) |segment, i| {
        std.mem.copy(u8, result[pos..], segment);
        pos += segment.len;
        if (i < path.len - 1) {
            std.mem.copy(u8, result[pos..], delimiter);
            pos += delimiter.len;
        }
    }

    return result;
}

/// 检查事件类型是否匹配模式
pub fn matchEventType(event_type: []const u8, pattern: []const u8, delimiter: []const u8) bool {
    // 如果模式中没有通配符，直接比较字符串
    if (!hasWildcard(pattern)) {
        return std.mem.eql(u8, event_type, pattern);
    }

    var event_it = std.mem.split(u8, event_type, delimiter);
    var pattern_it = std.mem.split(u8, pattern, delimiter);

    // 逐段比较
    while (true) {
        const event_segment = event_it.next();
        const pattern_segment = pattern_it.next();

        // 如果两个迭代器都结束了，说明完全匹配
        if (event_segment == null and pattern_segment == null) {
            return true;
        }

        // 如果其中一个迭代器结束了但另一个没有，说明不匹配
        if (event_segment == null or pattern_segment == null) {
            return false;
        }

        // 如果当前段是通配符，继续下一段
        if (std.mem.eql(u8, pattern_segment.?, "*")) {
            continue;
        }

        // 比较当前段
        if (!std.mem.eql(u8, event_segment.?, pattern_segment.?)) {
            return false;
        }
    }
}

/// 创建调试信息
pub fn createDebugInfo(allocator: Allocator, event_type: []const u8, payload: ?*anyopaque) ![]u8 {
    var debug_info = std.ArrayList(u8).init(allocator);
    errdefer debug_info.deinit();

    try debug_info.writer().print("Event: {s}\n", .{event_type});
    if (payload) |p| {
        try debug_info.writer().print("Payload: {*}\n", .{p});
    } else {
        try debug_info.appendSlice("Payload: null\n");
    }

    return debug_info.toOwnedSlice();
}

/// 检查路径是否有效
pub fn isValidPath(path: []const []const u8) bool {
    if (path.len == 0) return false;

    for (path) |segment| {
        if (segment.len == 0) return false;
        if (std.mem.indexOf(u8, segment, "/") != null) return false;
    }

    return true;
}

test "utils - hasWildcard" {
    try std.testing.expect(hasWildcard("foo*"));
    try std.testing.expect(hasWildcard("foo/*/bar"));
    try std.testing.expect(!hasWildcard("foo/bar"));
}

test "utils - splitEventPath" {
    const allocator = std.testing.allocator;

    const path = try splitEventPath(allocator, "foo/bar/baz", "/");
    defer freeEventPath(allocator, path);

    try std.testing.expectEqual(@as(usize, 3), path.len);
    try std.testing.expectEqualStrings("foo", path[0]);
    try std.testing.expectEqualStrings("bar", path[1]);
    try std.testing.expectEqualStrings("baz", path[2]);
}

test "utils - joinEventPath" {
    const allocator = std.testing.allocator;

    const segments = [_][]const u8{ "foo", "bar", "baz" };
    const result = try joinEventPath(allocator, &segments, "/");
    defer allocator.free(result);

    try std.testing.expectEqualStrings("foo/bar/baz", result);
}

test "utils - matchEventType" {
    try std.testing.expect(matchEventType("foo/bar/baz", "foo/*/baz", "/"));
    try std.testing.expect(matchEventType("foo/bar/baz", "foo/bar/baz", "/"));
    try std.testing.expect(!matchEventType("foo/bar/baz", "foo/bar", "/"));
    try std.testing.expect(!matchEventType("foo/bar", "foo/bar/baz", "/"));
}

test "utils - isValidPath" {
    const segments1 = [_][]const u8{ "foo", "bar", "baz" };
    try std.testing.expect(isValidPath(&segments1));

    const segments2 = [_][]const u8{ "foo", "", "baz" };
    try std.testing.expect(!isValidPath(&segments2));

    const segments3 = [_][]const u8{ "foo", "bar/baz" };
    try std.testing.expect(!isValidPath(&segments3));

    const segments4 = [_][]const u8{};
    try std.testing.expect(!isValidPath(&segments4));
}
