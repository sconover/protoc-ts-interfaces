import "mocha"
declare function require(name: string): any
const assert: any = require("assert")

suite("bar", () => {
  test("barTest", () => {
    console.log("in a test")
    assert.deepEqual({x: 3}, {x: 3})
  })
})
