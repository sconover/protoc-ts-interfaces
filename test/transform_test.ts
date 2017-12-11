import "mocha"
declare function require(name: string): any
const assert: any = require("assert")

import {transform} from "../src/protoc-gen-ts_interfaces";
import {CodeGeneratorRequest, CodeGeneratorResponse} from "google-protobuf/google/protobuf/compiler/plugin_pb"
import {FileDescriptorProto, DescriptorProto, FieldDescriptorProto} from "google-protobuf/google/protobuf/descriptor_pb"
import * as ts from "typescript"

function extractInterfaceInfo(node: ts.Node): any {
  const interfaceNode = (<ts.InterfaceDeclaration>node)
  const interfaceName = (<ts.Identifier>interfaceNode.name).escapedText
  const memberInfo = interfaceNode.members.map(m => {
    const typeName = ts.SyntaxKind[(<ts.PropertySignature>m).type.kind]
    if (typeName == "TypeReference") {
      let typeName = (<ts.Identifier>(<ts.TypeReferenceNode> (<ts.PropertySignature>m).type).typeName).escapedText
      if (typeName==null) {
        // there might be some namespacing, for now just use this crappy heursitic to get the type name
        typeName = (<ts.Identifier>childNodes((<ts.TypeReferenceNode> (<ts.PropertySignature>m).type).typeName)[1]).escapedText
      }
      return [(<ts.Identifier>m.name).escapedText, typeName]
    } else {
      return [(<ts.Identifier>m.name).escapedText, ts.SyntaxKind[(<ts.PropertySignature>m).type.kind]]
    }
  })
  return [interfaceName, memberInfo]
}

// sometimes getChildren() causes problems
function childNodes(node: ts.Node): Array<ts.Node> {
  const results: Array<ts.Node> = new Array()
  node.forEachChild((childNode: ts.Node) => {
    results.push(childNode)
  })
  return results
}

class MessageTypeProtoBuilder {
  name: string
  fieldDescriptors: Array<FieldDescriptorProto> = new Array()

  setName(name: string): MessageTypeProtoBuilder {
    this.name = name
    return this
  }

  addPrimitiveField(name: string, protoTypeNumber: number): MessageTypeProtoBuilder {
    const fieldDescriptorProto = new FieldDescriptorProto()
    fieldDescriptorProto.setName(name)
    fieldDescriptorProto.setType(protoTypeNumber)
    this.fieldDescriptors.push(fieldDescriptorProto)
    return this
  }

  addMessageField(name: string, messageType: DescriptorProto, packageName: string = null): MessageTypeProtoBuilder {
    const fieldDescriptorProto = new FieldDescriptorProto()
    fieldDescriptorProto.setName(name)
    fieldDescriptorProto.setType(FieldDescriptorProto.Type.TYPE_MESSAGE)
    if (packageName == null) {
      fieldDescriptorProto.setTypeName(messageType.getName())
    } else {
      fieldDescriptorProto.setTypeName("." + packageName + "." + messageType.getName())
    }
    this.fieldDescriptors.push(fieldDescriptorProto)
    return this
  }

  build(): DescriptorProto {
    const messageTypeDescriptor = new DescriptorProto()
    messageTypeDescriptor.setName(this.name)
    for (let f of this.fieldDescriptors) {
      messageTypeDescriptor.addField(f)
    }
    return messageTypeDescriptor
  }
}

class FileDescriptorProtoBuilder {
  packageName: string
  messageTypes: Array<DescriptorProto> = new Array()

  addMessageType(descriptorProto: DescriptorProto): FileDescriptorProtoBuilder {
    this.messageTypes.push(descriptorProto)
    return this
  }

  setPackageName(packageName: string) {
    this.packageName = packageName
    return this
  }

  build(): FileDescriptorProto {
    const fileDescriptor = new FileDescriptorProto()
    if (this.packageName != null) {
      fileDescriptor.setPackage(this.packageName)
    }
    for (let m of this.messageTypes) {
      fileDescriptor.addMessageType(m)
    }
    return fileDescriptor
  }
}

class CodeGeneratorRequestBuilder {
  fileDescriptorProtos: Array<FileDescriptorProto> = new Array()

  addProtoFile(fileDescriptorProto: FileDescriptorProto): CodeGeneratorRequestBuilder {
    this.fileDescriptorProtos.push(fileDescriptorProto)
    return this
  }

  build(): CodeGeneratorRequest {
    const codeGenRequest = new CodeGeneratorRequest()
    for (let f of this.fileDescriptorProtos) {
      codeGenRequest.addProtoFile(f)
    }
    return codeGenRequest
  }
}

function rootNode(codeGenResponse: CodeGeneratorResponse): ts.Node {
  const tsSourceFiles = codeGenResponse.getFileList().map(f => ts.createSourceFile(f.getName(), f.getContent(), ts.ScriptTarget.ES2015))
  return tsSourceFiles[0].getChildren()[0]
}

function childNode(codeGenResponse: CodeGeneratorResponse, index: number): ts.Node {
  return rootNode(codeGenResponse).getChildren()[index]
}

suite("transform", () => {
  test("convert a proto package name to a typescript namespace declaration", () => {
    const codeGenResponse = transform(
      new CodeGeneratorRequestBuilder()
        .addProtoFile(
          new FileDescriptorProtoBuilder()
            .setPackageName("single_level_package")
          .build())
        .build())

    assert.equal("single_level_package", (<ts.NamespaceDeclaration> childNode(codeGenResponse, 0)).name.text)
  })

  test("convert an empty message to an empty ts interface", () => {
    const codeGenResponse = transform(
      new CodeGeneratorRequestBuilder()
        .addProtoFile(
          new FileDescriptorProtoBuilder()
            .addMessageType(
              new MessageTypeProtoBuilder()
                .setName("EmptyFortuneCookie")
                .build())
          .build())
        .build())

    assert.deepEqual(["EmptyFortuneCookie", []], extractInterfaceInfo(childNode(codeGenResponse, 0)))
  })

  test("convert a message with fields to a ts interface with members", () => {
    const codeGenResponse = transform(
      new CodeGeneratorRequestBuilder()
        .addProtoFile(
          new FileDescriptorProtoBuilder()
            .addMessageType(
              new MessageTypeProtoBuilder()
                .setName("FortuneCookie")
                .addPrimitiveField("fortune_content", FieldDescriptorProto.Type.TYPE_STRING)
                .addPrimitiveField("fortune_number", FieldDescriptorProto.Type.TYPE_INT32)
                .build())
          .build())
        .build())

    assert.deepEqual(
      ["FortuneCookie", [
        ["fortune_content", "StringKeyword"], 
        ["fortune_number", "NumberKeyword"]]], 
      extractInterfaceInfo(childNode(codeGenResponse, 0)))
  })

  test("a previously-defined message type may be used as the type of a field", () => {
    const fortuneCookieMessageType = 
      new MessageTypeProtoBuilder()
        .setName("FortuneCookie")
        .addPrimitiveField("fortune_content", FieldDescriptorProto.Type.TYPE_STRING)
        .addPrimitiveField("fortune_number", FieldDescriptorProto.Type.TYPE_INT32)
        .build()
    const codeGenResponse = transform(
      new CodeGeneratorRequestBuilder()
        .addProtoFile(
          new FileDescriptorProtoBuilder()
            .addMessageType(fortuneCookieMessageType)
            .addMessageType(
              new MessageTypeProtoBuilder()
                .setName("FinalBill")
                .addPrimitiveField("amount_cents", FieldDescriptorProto.Type.TYPE_INT32)
                .addMessageField("cookie", fortuneCookieMessageType)
                .build())
          .build())
        .build())

    assert.deepEqual(
      ["FortuneCookie", [
        ["fortune_content", "StringKeyword"], 
        ["fortune_number", "NumberKeyword"]]], 
      extractInterfaceInfo(childNode(codeGenResponse, 0)))

    assert.deepEqual(
      ["FinalBill", [
        ["amount_cents", "NumberKeyword"], 
        ["cookie", "FortuneCookie"]]], 
      extractInterfaceInfo(childNode(codeGenResponse, 1)))
  })

  test("previously-defined message types referenced in the same namespace are non-qualified", () => {
    const fortuneCookieMessageType =
      new MessageTypeProtoBuilder()
        .setName("FortuneCookie")
        .addPrimitiveField("fortune_content", FieldDescriptorProto.Type.TYPE_STRING)
        .addPrimitiveField("fortune_number", FieldDescriptorProto.Type.TYPE_INT32)
        .build()
    const codeGenResponse = transform(
      new CodeGeneratorRequestBuilder()
        .addProtoFile(
          new FileDescriptorProtoBuilder()
            .setPackageName("single_level_package")
            .addMessageType(fortuneCookieMessageType)
            .addMessageType(
              new MessageTypeProtoBuilder()
                .setName("FinalBill")
                .addPrimitiveField("amount_cents", FieldDescriptorProto.Type.TYPE_INT32)
                .addMessageField("cookie", fortuneCookieMessageType, "single_level_package")
                .build())
          .build())
        .build())

    const namespaceNode = (<ts.NamespaceDeclaration>childNode(codeGenResponse, 0));

    assert.equal("single_level_package", namespaceNode.name.text)

    const interfaceNodes = childNodes(namespaceNode.body)

    assert.deepEqual(
      ["FortuneCookie", [
        ["fortune_content", "StringKeyword"],
        ["fortune_number", "NumberKeyword"]]],
      extractInterfaceInfo(interfaceNodes[0]))

    assert.deepEqual(
      ["FinalBill", [
        ["amount_cents", "NumberKeyword"],
        ["cookie", "FortuneCookie"]]],
      extractInterfaceInfo(interfaceNodes[1]))
  })

  test("demonstrate members of each primitive type", () => {
    const codeGenResponse = transform(
      new CodeGeneratorRequestBuilder()
        .addProtoFile(
          new FileDescriptorProtoBuilder()
            .addMessageType(
              new MessageTypeProtoBuilder()
                .setName("Smorgasbord")
                .addPrimitiveField("originally_double", FieldDescriptorProto.Type.TYPE_DOUBLE)
                .addPrimitiveField("originally_float", FieldDescriptorProto.Type.TYPE_FLOAT)
                .addPrimitiveField("originally_int64", FieldDescriptorProto.Type.TYPE_INT64)
                .addPrimitiveField("originally_uint64", FieldDescriptorProto.Type.TYPE_UINT64)
                .addPrimitiveField("originally_int32", FieldDescriptorProto.Type.TYPE_INT32)
                .addPrimitiveField("originally_fixed64", FieldDescriptorProto.Type.TYPE_FIXED64)
                .addPrimitiveField("originally_fixed32", FieldDescriptorProto.Type.TYPE_FIXED32)
                .addPrimitiveField("originally_bool", FieldDescriptorProto.Type.TYPE_BOOL)
                .addPrimitiveField("originally_string", FieldDescriptorProto.Type.TYPE_STRING)
                // .addPrimitiveField("originally_group", FieldDescriptorProto.Type.TYPE_GROUP) NOT PRIMITIVE / UNSUPPORTED FOR NOW.
                // .addPrimitiveField("originally_message", FieldDescriptorProto.Type.TYPE_MESSAGE) NOT PRIMITIVE / SUPPORTED (tested elsewhere)
                .addPrimitiveField("originally_bytes", FieldDescriptorProto.Type.TYPE_BYTES)
                .addPrimitiveField("originally_uint32", FieldDescriptorProto.Type.TYPE_UINT32)
                // .addPrimitiveField("originally_enum", FieldDescriptorProto.Type.TYPE_ENUM) UNSUPPORTED FOR NOW / TODO
                .addPrimitiveField("originally_sfixed32", FieldDescriptorProto.Type.TYPE_SFIXED32)
                .addPrimitiveField("originally_sfixed64", FieldDescriptorProto.Type.TYPE_SFIXED64)
                .addPrimitiveField("originally_sint32", FieldDescriptorProto.Type.TYPE_SINT32)
                .addPrimitiveField("originally_sint64", FieldDescriptorProto.Type.TYPE_SINT64)
                .build())
          .build())
        .build())

    assert.deepEqual(
      ["Smorgasbord", [
        ["originally_double", "NumberKeyword"], 
        ["originally_float", "NumberKeyword"], 
        ["originally_int64", "NumberKeyword"], 
        ["originally_uint64", "NumberKeyword"], 
        ["originally_int32", "NumberKeyword"], 
        ["originally_fixed64", "NumberKeyword"], 
        ["originally_fixed32", "NumberKeyword"], 
        ["originally_bool", "BooleanKeyword"], 
        ["originally_string", "StringKeyword"], 
        ["originally_bytes", "UnionType"], 
        ["originally_uint32", "NumberKeyword"], 
        ["originally_sfixed32", "NumberKeyword"], 
        ["originally_sfixed64", "NumberKeyword"], 
        ["originally_sint32", "NumberKeyword"], 
        ["originally_sint64", "NumberKeyword"]]], 
      extractInterfaceInfo(childNode(codeGenResponse, 0)))
  })
})
