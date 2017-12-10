def proto_to_ts_interfaces(proto_files=[]):
    locations = []
    for proto_file in proto_files:
        locations.append("$(location " + proto_file + ")")
    proto_file_locations = " ".join(locations)
    native.genrule(
        name="proto_to_ts_interfaces",
        cmd="outdir=$$(dirname $@); $(location @com_google_protobuf//:protoc) --plugin=protoc-gen-ts_interfaces=$(location //bin:plugin_bin) -I . %s --ts_interfaces_out=$$outdir" % proto_file_locations,
        outs=["generated.d.ts"],
        srcs=[
            "//bin:plugin_bin",
            "//src:ts_lib", # forces this module to rebuild on modification of inputs, which doesn't happen otherwise (weird)
        ] + proto_files,
        tools=[
            "@com_google_protobuf//:protoc",
            "//bin:plugin_bin",
        ],
    )
