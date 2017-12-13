def proto_to_ts_interfaces(proto_files=[]):
    native.genrule(
        name="proto_to_ts_interfaces",
        cmd="outdir=$$(dirname $@); $(location @com_google_protobuf//:protoc) --plugin=protoc-gen-ts_interfaces=$(location //bin:plugin_bin) -I . $(SRCS) --ts_interfaces_out=$$outdir",
        outs=["proto.generated.d.ts"],
        srcs= proto_files,
        tools=[
            "@com_google_protobuf//:protoc",
            "//bin:plugin_bin",
            "//src:ts_lib", # forces this module to rebuild on modification of inputs, which doesn't happen otherwise (weird)
        ],
    )
