load("//util:test.bzl", "ts_test")

ts_test(test_file = "foo_test.ts")
ts_test(test_file = "bar_test.ts")
ts_test(test_file = "transform_test.ts")
ts_test(test_file = "scenario_test.ts", 
    more_data=[
        "//scenarios/01_basic_messages:expected.d.ts",
        "//scenarios/01_basic_messages:html_email.proto",
        "//scenarios/01_basic_messages:plain_email.proto",
        "//scenarios/02_service:expected.d.ts",
        "//scenarios/02_service:baker.proto",
    ])
