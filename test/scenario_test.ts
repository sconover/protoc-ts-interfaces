import "mocha"
declare function require(name: string): any
const assert: any = require("assert")

var fs = require('fs')
var path = require('path')

import { various } from "../bazel-genfiles/scenarios/03_compare_to_java_json/proto.generated"

suite("scenario", () => {
  test("01_basic_messages", () => {
    const expectedContent = fs.readFileSync(path.join(__dirname, "../scenarios/01_basic_messages/expected.d.ts")).toString()
    const actualContent = fs.readFileSync(path.join(__dirname, "../bazel-genfiles/scenarios/01_basic_messages/proto.generated.d.ts")).toString()
    assert.equal(expectedContent, actualContent)
  })

  test("02_service", () => {
    const expectedContent = fs.readFileSync(path.join(__dirname, "../scenarios/02_service/expected.d.ts")).toString()
    const actualContent = fs.readFileSync(path.join(__dirname, "../bazel-genfiles/scenarios/02_service/proto.generated.d.ts")).toString()
    assert.equal(expectedContent, actualContent)
  })

  test("03_compare_to_java_json", () => {
    const expectedContent = fs.readFileSync(path.join(__dirname, "../scenarios/03_compare_to_java_json/expected.d.ts")).toString()
    const actualContent = fs.readFileSync(path.join(__dirname, "../bazel-genfiles/scenarios/03_compare_to_java_json/proto.generated.d.ts")).toString()
    assert.equal(expectedContent, actualContent)
  })

  test("json comparison: 03_compare_to_java_json", () => {
    const tsPrimitiveObj:various.Primitives = (<various.Primitives>new Object())
    tsPrimitiveObj.exampleString = "this is an example string value"
    tsPrimitiveObj.exampleInt = 77
    tsPrimitiveObj.exampleLong = 78
    tsPrimitiveObj.exampleFloat = 77.78
    tsPrimitiveObj.exampleDouble = 78.78
    tsPrimitiveObj.exampleBool = true

    const tsContainerObj:various.Container = (<various.Container>new Object())
    tsContainerObj.name = "this is the container name"
    tsContainerObj.onePrimitive = tsPrimitiveObj
    tsContainerObj.oneEnumValue = various.ExampleEnum.SECOND_OPTION

    const tsRepetitionObj:various.Repetition = (<various.Repetition>new Object())
    tsRepetitionObj.manyContainers = [
      tsContainerObj,
      (<various.Container>{name: "this is the second container"})
    ]
    tsRepetitionObj.manyEnumValues = [
      various.ExampleEnum.SECOND_OPTION, 
      various.ExampleEnum.SECOND_OPTION, 
      various.ExampleEnum.FIRST_OPTION
    ]
    tsRepetitionObj.names = ["name one", "name two"]
    // tsObj.exampleBytes = new TextEncoder("utf-8").encode("abc");

    var tsJsonStringifiedPretty = JSON.stringify(tsRepetitionObj, null, 2);
    const expectedJson = fs.readFileSync(path.join(__dirname, "../scenarios/03_compare_to_java_json/expected.json")).toString()
    assert.equal(expectedJson, tsJsonStringifiedPretty)
  })
})

