const std = @import("std");
const fastevent = @import("fastevent");

pub fn main() !void {
    // 创建通用分配器
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // 创建事件发射器
    const options = fastevent.EventOptions{
        .debug = true,
        .delimiter = "/",
    };
    var emitter = try fastevent.createEmitter(allocator, options);
    defer emitter.deinit();

    // 创建根作用域
    var root_scope = try fastevent.createRootScope(allocator, emitter);
    defer root_scope.deinit();

    // 定义事件处理函数
    const UserInfo = struct {
        id: u32,
        name: []const u8,
    };

    const userLoginHandler = (struct {
        fn handler(message: *fastevent.EventMessage) !void {
            const user_info = @ptrCast(*const UserInfo, @alignCast(@alignOf(UserInfo), message.payload.?));
            std.debug.print("User logged in - ID: {d}, Name: {s}\n", .{
                user_info.id,
                user_info.name,
            });
        }
    }).handler;

    // 注册事件监听器
    _ = try root_scope.on("user/login", userLoginHandler, .{});

    // 注册通配符监听器
    const anyUserEventHandler = (struct {
        fn handler(message: *fastevent.EventMessage) !void {
            std.debug.print("Caught user event: {s}\n", .{message.type});
        }
    }).handler;

    _ = try root_scope.on("user/*", anyUserEventHandler, .{});

    // 创建子作用域
    var user_scope = try root_scope.createScope();
    defer user_scope.deinit();

    // 在子作用域中注册监听器
    const userLogoutHandler = (struct {
        fn handler(message: *fastevent.EventMessage) !void {
            const user_info = @ptrCast(*const UserInfo, @alignCast(@alignOf(UserInfo), message.payload.?));
            std.debug.print("User logged out - ID: {d}, Name: {s}\n", .{
                user_info.id,
                user_info.name,
            });
        }
    }).handler;

    _ = try user_scope.on("user/logout", userLogoutHandler, .{});

    // 创建用户信息
    const user = UserInfo{
        .id = 1,
        .name = "John Doe",
    };

    // 触发登录事件
    try emitter.emit("user/login", &user, null);

    // 使用retain保留事件
    try emitter.retain("user/status", &user, null);

    // 触发登出事件
    try emitter.emit("user/logout", &user, null);

    // 等待特定事件（带超时）
    const wait_handler = (struct {
        fn handler() !void {
            const message = try emitter.waitFor("user/update", 1000);
            if (message.payload) |payload| {
                const user_info = @ptrCast(*const UserInfo, @alignCast(@alignOf(UserInfo), payload));
                std.debug.print("Received user update - ID: {d}, Name: {s}\n", .{
                    user_info.id,
                    user_info.name,
                });
            }
        }
    }).handler;

    // 在另一个线程中等待事件
    const thread = try std.Thread.spawn(.{}, wait_handler, .{});

    // 短暂延迟后触发更新事件
    std.time.sleep(500 * std.time.ns_per_ms);
    try emitter.emit("user/update", &user, null);

    // 等待线程完成
    thread.join();

    std.debug.print("\nExample completed successfully!\n", .{});
}
