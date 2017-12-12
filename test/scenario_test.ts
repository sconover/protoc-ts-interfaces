import "mocha"
declare function require(name: string): any
const assert: any = require("assert")

var fs = require('fs')
var path = require('path')

suite("scenario", () => {
  test("01_basic_messages", () => {
    const expectedContent = fs.readFileSync(path.join(__dirname, "../scenarios/01_basic_messages/expected.d.ts")).toString()
    const actualContent = fs.readFileSync(path.join(__dirname, "../bazel-genfiles/scenarios/01_basic_messages/generated.d.ts")).toString()
    assert.equal(expectedContent, actualContent)
  })

  test("02_service", () => {
    const expectedContent = fs.readFileSync(path.join(__dirname, "../scenarios/02_service/expected.d.ts")).toString()
    const actualContent = fs.readFileSync(path.join(__dirname, "../bazel-genfiles/scenarios/02_service/generated.d.ts")).toString()
    assert.equal(expectedContent, actualContent)
  })
})
