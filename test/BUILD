load("//util:test.bzl", "ts_test")

ts_test(test_file = "foo_test.ts")
ts_test(test_file = "bar_test.ts")
ts_test(test_file = "transform_test.ts")
ts_test(test_file = "scenario_test.ts",
    more_data=[
        "//scenarios/01_basic_messages:expected.ts",
        "//scenarios/01_basic_messages:html_email.proto",
        "//scenarios/01_basic_messages:plain_email.proto",
        "//scenarios/01_basic_messages:plain_email_bonus.proto",
        "//scenarios/02_service:expected.ts",
        "//scenarios/02_service:baker.proto",
        "//scenarios/03_compare_to_java_json:various.proto",
    ])
