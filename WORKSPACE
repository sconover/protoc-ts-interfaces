workspace(name = "protoc_ts_interface")

http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/6b498e36095350bd88d2ea89e1a87ce791e51d82.zip",
    strip_prefix = "rules_nodejs-6b498e36095350bd88d2ea89e1a87ce791e51d82",
)
load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories")
node_repositories(package_json = ["//:package.json"])

http_archive(
    name = "build_bazel_rules_typescript",
    url = "https://github.com/bazelbuild/rules_typescript/archive/0.6.0.zip",
    strip_prefix = "rules_typescript-0.6.0",
)
load("@build_bazel_rules_typescript//:defs.bzl", "ts_repositories")
ts_repositories()

# load("@build_bazel_rules_nodejs//:defs.bzl", "npm_install")
# npm_install(
#     name = "npm_install",
#     package_json = "//:package.json",
# )

# Include @bazel/typescript in package.json#devDependencies
# local_repository(
#     name = "build_bazel_rules_typescript",
#     path = "node_modules/@bazel/typescript",
# )

# load("@build_bazel_rules_typescript//:defs.bzl", "ts_repositories")

# ts_repositories()

http_archive(
    name = "com_google_protobuf",
    strip_prefix = "protobuf-3.5.0",
    urls = ["https://github.com/google/protobuf/archive/v3.5.0.tar.gz"],
)
