def proto_to_ts_interfaces(proto_files=[]):
    native.genrule(
        name="proto_to_ts_interfaces",
        cmd="outdir=$$(dirname $@); $(location @com_google_protobuf//:protoc) --plugin=protoc-gen-ts_interfaces=$(location //bin:plugin_bin) -I . $(location %s) --ts_interfaces_out=$$outdir" % proto_files[0],
        outs=["generated.d.ts"],
        srcs=[
            "//bin:plugin_bin",
            "//src:ts_lib", # forces this module to rebuild on modification of inputs, which doesn't happen otherwise (weird)
            proto_files[0],
        ],
        tools=[
            "@com_google_protobuf//:protoc",
            "//bin:plugin_bin",
        ],
    )
