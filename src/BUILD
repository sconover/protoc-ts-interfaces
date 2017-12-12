package(default_visibility = ["//:__subpackages__"])

load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")
ts_library(
    name = "ts_lib",
    srcs = [
        "protoc-gen-ts_interfaces.ts",
    ],
    tsconfig = "//:tsconfig.json",
    # deps = ["//:node_modules"],
    # module_name = "sm",
)

exports_files(["protoc-gen-ts_interfaces.ts"])