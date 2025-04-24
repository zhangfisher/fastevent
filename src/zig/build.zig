const std = @import("std");

pub fn build(b: *std.Build) void {
    // 标准目标，使用优化参数
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // 创建库
    const lib = b.addStaticLibrary(.{
        .name = "fastevent",
        .root_source_file = .{ .path = "src/zig/fastevent.zig" },
        .target = target,
        .optimize = optimize,
    });

    // 使库可以被其他项目引用
    b.installArtifact(lib);

    // 添加测试
    const main_tests = b.addTest(.{
        .root_source_file = .{ .path = "src/zig/fastevent.zig" },
        .target = target,
        .optimize = optimize,
    });

    // 创建"test"步骤
    const test_step = b.step("test", "Run library tests");
    test_step.dependOn(&main_tests.step);

    // 创建示例
    const example = b.addExecutable(.{
        .name = "fastevent-example",
        .root_source_file = .{ .path = "examples/basic.zig" },
        .target = target,
        .optimize = optimize,
    });
    example.addModule("fastevent", b.createModule(.{
        .source_file = .{ .path = "src/zig/fastevent.zig" },
    }));

    // 安装示例
    b.installArtifact(example);

    // 创建"run-example"步骤
    const run_example_cmd = b.addRunArtifact(example);
    run_example_cmd.step.dependOn(b.getInstallStep());
    const run_example_step = b.step("run-example", "Run the example");
    run_example_step.dependOn(&run_example_cmd.step);

    // 添加文档生成
    const docs = b.addInstallDirectory(.{
        .source_dir = lib.getEmittedDocs(),
        .install_dir = .prefix,
        .install_subdir = "docs",
    });

    // 创建"docs"步骤
    const docs_step = b.step("docs", "Generate documentation");
    docs_step.dependOn(&docs.step);
}
