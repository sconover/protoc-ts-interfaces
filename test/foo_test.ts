import "mocha"
declare function require(name: string): any
const assert: any = require("assert")

suite("foo", () => {
  test("fooTest", () => {
    console.log("in a test")
    assert.deepEqual({x: 2}, {x: 2})
  })
})
