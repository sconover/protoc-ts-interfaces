import "mocha"
declare function require(name: string): any
const assert: any = require("assert")

import {transform} from "../src/protoc-gen-ts_interfaces";
import {CodeGeneratorRequest, CodeGeneratorResponse} from "google-protobuf/google/protobuf/compiler/plugin_pb"
import * as ts from "typescript"

suite("transform", () => {
  test("hello", () => {
    const codeGenResponse = transform(new CodeGeneratorRequest());
    assert.deepEqual(["generated.d.ts"], codeGenResponse.getFileList().map(f => f.getName()))
    assert.deepEqual(["interface HelloInterface {\n  name: string;\n}\n"], codeGenResponse.getFileList().map(f => f.getContent()))

    const tsSourceFiles = codeGenResponse.getFileList().map(f => ts.createSourceFile(f.getName(), f.getContent(), ts.ScriptTarget.ES2015))
    const rootNode = tsSourceFiles[0].getChildren()[0]
    const firstNode = rootNode.getChildren()[0]

    assert.equal("InterfaceDeclaration", ts.SyntaxKind[firstNode.kind])
    const helloInterfaceNode = (<ts.InterfaceDeclaration>firstNode)
    assert.equal("HelloInterface", (<ts.Identifier>helloInterfaceNode.name).escapedText)
    assert.deepEqual(["name"], helloInterfaceNode.members.map(m => (<ts.Identifier>m.name).escapedText))
    assert.deepEqual(["StringKeyword"], helloInterfaceNode.members.map(m => ts.SyntaxKind[(<ts.PropertySignature>m).type.kind]))
  })
})
