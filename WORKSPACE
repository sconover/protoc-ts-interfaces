workspace(name = "protoc_ts_interfaces")

maven_jar(name="com_google_code_gson_gson",                      artifact="com.google.code.gson:gson:2.8.2")
maven_jar(name="com_google_google_guava",                        artifact="com.google.guava:guava:19.0")
maven_jar(name="com_google_protobuf_java_util",                  artifact="com.google.protobuf:protobuf-java-util:3.5.0")

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

http_archive(
    name = "com_google_protobuf",
    strip_prefix = "protobuf-3.5.0",
    urls = ["https://github.com/google/protobuf/archive/v3.5.0.tar.gz"],
)

http_archive(
    name = "com_google_protobuf_java",
    strip_prefix = "protobuf-3.5.0",
    urls = ["https://github.com/google/protobuf/archive/v3.5.0.tar.gz"],
)

rules_intellij_generate_sha = "c0dcaa85aeb0e266fb531e84018efdf173d4be17"
http_archive(
    name = "rules_intellij_generate",
    url = "https://github.com/sconover/rules_intellij_generate/archive/%s.tar.gz" % rules_intellij_generate_sha,
    strip_prefix = "rules_intellij_generate-%s/rules" % rules_intellij_generate_sha,
)
load("@rules_intellij_generate//:def.bzl", "repositories_for_intellij_generate")
repositories_for_intellij_generate()

http_archive(
    name = "rules_junit5",
    url = "https://github.com/sconover/rules_intellij_generate/archive/%s.tar.gz" % rules_intellij_generate_sha,
    strip_prefix = "rules_intellij_generate-%s/rules_junit5" % rules_intellij_generate_sha,
)
load("@rules_junit5//:def.bzl", "junit5_repositories")
junit5_repositories()