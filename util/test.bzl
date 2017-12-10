def ts_test(test_file=None, more_data=[]):
    native.sh_test(
        name = test_file + "_test",
        size = "small",
        srcs = ["//util:run_tests.sh"],
        # deps = [""],
        data = [
            test_file,
            "@nodejs//:bin/node",
            "//:node_modules/mocha/bin/mocha",
            "//:node_modules/@types/node",
            "//src:protoc-gen-ts_interfaces.ts",
        ] + more_data,
    )
