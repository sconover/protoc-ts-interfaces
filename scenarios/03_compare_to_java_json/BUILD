load("//util:protoc.bzl", "proto_to_ts_interfaces")
load("@rules_intellij_generate//:def.bzl", "intellij_source_java_library")

proto_to_ts_interfaces(["various.proto"])
exports_files(["expected.ts", "various.proto"])

proto_library(
    name = "03_compare_to_java_json_proto",
    srcs = ["various.proto"],
)

java_proto_library(
    name = "java_proto",
    deps = [":03_compare_to_java_json_proto"],
)

intellij_source_java_library(
    name="lib",
    source_folder_to_wildcard_map={"javasrc":"**/*.java"},
    deps=[
        ":java_proto",

        "@com_google_code_gson_gson//jar",
        "@com_google_google_guava//jar",
        "@com_google_protobuf_java//:protobuf_java",
        "@com_google_protobuf_java_util//jar",
    ]
)

java_binary(
    name="gen_json_from_java",
    deps=[
        ":java_proto",
        ":lib",

        "@com_google_protobuf//:protobuf_java",
        "@com_google_protobuf_java_util//jar",
    ],
    srcs=glob(["javasrc/**/*.java"]),
    main_class="protoctsinterfaces.PrintProtoJson",
    args=[
        "bar.json"
    ]
)

load("@rules_intellij_generate//:def.bzl", "intellij_iml")
intellij_iml(
    name = "iml",
    java_source=":lib",
)

load("@rules_intellij_generate//:def.bzl", "intellij_modules_xml")
intellij_modules_xml(
    name = "modules_xml",
    deps = [
      ":iml",
    ]
)

load("@rules_intellij_generate//:def.bzl", "intellij_project")
intellij_project(
  name="idea_project",
  intellij_modules_xml=":modules_xml",
)
