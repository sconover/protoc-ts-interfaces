import "mocha"
declare function require(name: string): any
const assert: any = require("assert")

import {transform} from "../src/protoc-gen-ts_interfaces";
import {CodeGeneratorRequest, CodeGeneratorResponse} from "google-protobuf/google/protobuf/compiler/plugin_pb"
import {FileDescriptorProto, DescriptorProto, FieldDescriptorProto, EnumDescriptorProto, 
        EnumValueDescriptorProto, MethodDescriptorProto, ServiceDescriptorProto} from "google-protobuf/google/protobuf/descriptor_pb"
import * as ts from "typescript"

function extractEnumInfo(node: ts.Node): any {
  const enumNode = (<ts.EnumDeclaration>node)
  const enumName = (<ts.Identifier>enumNode.name).escapedText
  const valueInfo = enumNode.members.map(m => (<ts.Identifier>m.name).escapedText)
  return [enumName, valueInfo]
}

function extractInterfaceInfo(node: ts.Node): any {
  const interfaceNode = (<ts.InterfaceDeclaration>node)
  const interfaceName = (<ts.Identifier>interfaceNode.name).escapedText
  const memberInfo = interfaceNode.members.map(m => {
    const memberKind = ts.SyntaxKind[m.kind]
    if (memberKind == "MethodSignature") {
      const methodSignature = (<ts.MethodSignature>m)
      const methodName = (<ts.Identifier>methodSignature.name).escapedText
      const parameterTypeNames = methodSignature.parameters.map(p => (<ts.Identifier>(<ts.TypeReferenceNode> p.type).typeName).escapedText)
      const returnTypeName = (<ts.Identifier>(<ts.TypeReferenceNode>methodSignature.type).typeName).escapedText
      return [methodName, parameterTypeNames, returnTypeName]
    } else if (memberKind == "PropertySignature") {
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
    } else {
      throw new Error("unsupported member kind: " + memberKind)
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

class EnumProtoBuilder {
  name: string
  protoValues: Array<EnumValueDescriptorProto> = new Array()

  setName(name: string): EnumProtoBuilder {
    this.name = name
    return this
  }

  addValue(name: string): EnumProtoBuilder {
    const protoValue = new EnumValueDescriptorProto()
    protoValue.setName(name)
    protoValue.setNumber(this.protoValues.length + 1)
    this.protoValues.push(protoValue)
    return this
  }

  build(): EnumDescriptorProto {
    const protoEnum = new EnumDescriptorProto()
    protoEnum.setName(this.name)
    for (let v of this.protoValues) {
      protoEnum.addValue(v)
    }
    return protoEnum
  }
}

class MessageTypeProtoBuilder {
  name: string
  protoEnumTypes: Array<EnumDescriptorProto> = new Array()
  protoMessageTypes: Array<DescriptorProto> = new Array()
  protoFields: Array<FieldDescriptorProto> = new Array()

  setName(name: string): MessageTypeProtoBuilder {
    this.name = name
    return this
  }

  addEnumType(protoEnum: EnumDescriptorProto): MessageTypeProtoBuilder {
    this.protoEnumTypes.push(protoEnum)
    return this
  }

  addMessageType(protoMessageType: DescriptorProto): MessageTypeProtoBuilder {
    this.protoMessageTypes.push(protoMessageType)
    return this
  }

  addPrimitiveField(name: string, protoTypeNumber: number): MessageTypeProtoBuilder {
    const protoField = new FieldDescriptorProto()
    protoField.setName(name)
    protoField.setType(protoTypeNumber)
    this.protoFields.push(protoField)
    return this
  }

  addMessageField(name: string, messageType: DescriptorProto, packageName: string = null): MessageTypeProtoBuilder {
    const protoField = new FieldDescriptorProto()
    protoField.setName(name)
    protoField.setType(FieldDescriptorProto.Type.TYPE_MESSAGE)
    if (packageName == null) {
      protoField.setTypeName(messageType.getName())
    } else {
      protoField.setTypeName("." + packageName + "." + messageType.getName())
    }
    this.protoFields.push(protoField)
    return this
  }

  addEnumField(name: string, enumType: EnumDescriptorProto): MessageTypeProtoBuilder {
    const protoField = new FieldDescriptorProto()
    protoField.setName(name)
    protoField.setType(FieldDescriptorProto.Type.TYPE_ENUM)
    protoField.setTypeName(enumType.getName())
    this.protoFields.push(protoField)
    return this
  }

  build(): DescriptorProto {
    const protoMessageType = new DescriptorProto()
    protoMessageType.setName(this.name)
    for (let e of this.protoEnumTypes) {
      protoMessageType.addEnumType(e)
    }
    for (let e of this.protoMessageTypes) {
      protoMessageType.addNestedType(e)
    }
    for (let f of this.protoFields) {
      protoMessageType.addField(f)
    }
    return protoMessageType
  }
}

class ServiceProtoBuilder {
  name: string
  protoRpcMethods: Array<MethodDescriptorProto> = new Array()

  setName(name: string): ServiceProtoBuilder {
    this.name = name
    return this
  }

  addRpcMethod(name: string, requestType: DescriptorProto, responseType: DescriptorProto): ServiceProtoBuilder {
    const protoRpcMethod = new MethodDescriptorProto()
    protoRpcMethod.setName(name)
    protoRpcMethod.setInputType(requestType.getName())
    protoRpcMethod.setOutputType(responseType.getName())
    this.protoRpcMethods.push(protoRpcMethod)
    return this
  }

  build(): ServiceDescriptorProto {
    const protoService = new ServiceDescriptorProto()
    protoService.setName(this.name)
    for (let r of this.protoRpcMethods) {
      protoService.addMethod(r)
    }
    return protoService
  }
}

class FileDescriptorProtoBuilder {
  packageName: string
  messageTypes: Array<DescriptorProto> = new Array()
  services: Array<ServiceDescriptorProto> = new Array()

  addMessageType(protoMessageType: DescriptorProto): FileDescriptorProtoBuilder {
    this.messageTypes.push(protoMessageType)
    return this
  }

  addService(protoService: ServiceDescriptorProto): FileDescriptorProtoBuilder {
    this.services.push(protoService)
    return this
  }

  setPackageName(packageName: string) {
    this.packageName = packageName
    return this
  }

  build(): FileDescriptorProto {
    const protoFile = new FileDescriptorProto()
    if (this.packageName != null) {
      protoFile.setPackage(this.packageName)
    }
    for (let m of this.messageTypes) {
      protoFile.addMessageType(m)
    }
    for (let s of this.services) {
      protoFile.addService(s)
    }
    return protoFile
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

  test("convert a complex proto package name to a set of nested typescript namespaces", () => {
    const codeGenResponse = transform(
      new CodeGeneratorRequestBuilder()
        .addProtoFile(
          new FileDescriptorProtoBuilder()
            .setPackageName("multi.level.package_example")
          .build())
        .build())

    const topLevel: ts.NamespaceDeclaration = (<ts.NamespaceDeclaration> childNode(codeGenResponse, 0))
    assert.equal("multi", topLevel.name.text)
    const secondLevel = (<ts.ModuleDeclaration>(<ts.ModuleBlock> topLevel.body).statements[0])
    assert.equal("level", secondLevel.name.text)
    const thirdLevel = (<ts.ModuleDeclaration>(<ts.ModuleBlock> secondLevel.body).statements[0])
    assert.equal("package_example", thirdLevel.name.text)
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
                .addPrimitiveField("fortuneContent", FieldDescriptorProto.Type.TYPE_STRING)
                .addPrimitiveField("fortuneNumber", FieldDescriptorProto.Type.TYPE_INT32)
                .build())
          .build())
        .build())

    assert.deepEqual(
      ["FortuneCookie", [
        ["fortuneContent", "StringKeyword"], 
        ["fortuneNumber", "NumberKeyword"]]], 
      extractInterfaceInfo(childNode(codeGenResponse, 0)))
  })

  test("a previously-defined message type may be used as the type of a field", () => {
    const fortuneCookieMessageType = 
      new MessageTypeProtoBuilder()
        .setName("FortuneCookie")
        .addPrimitiveField("fortuneContent", FieldDescriptorProto.Type.TYPE_STRING)
        .addPrimitiveField("fortuneNumber", FieldDescriptorProto.Type.TYPE_INT32)
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
        ["fortuneContent", "StringKeyword"], 
        ["fortuneNumber", "NumberKeyword"]]], 
      extractInterfaceInfo(childNode(codeGenResponse, 0)))

    assert.deepEqual(
      ["FinalBill", [
        ["amountCents", "NumberKeyword"], 
        ["cookie", "FortuneCookie"]]], 
      extractInterfaceInfo(childNode(codeGenResponse, 1)))
  })

  test("previously-defined message types referenced in the same namespace", () => {
    const fortuneCookieMessageType =
      new MessageTypeProtoBuilder()
        .setName("FortuneCookie")
        .addPrimitiveField("fortuneContent", FieldDescriptorProto.Type.TYPE_STRING)
        .addPrimitiveField("fortuneNumber", FieldDescriptorProto.Type.TYPE_INT32)
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
                .addPrimitiveField("amountCents", FieldDescriptorProto.Type.TYPE_INT32)
                .addMessageField("cookie", fortuneCookieMessageType, "single_level_package")
                .build())
          .build())
        .build())

    const namespaceNode = (<ts.NamespaceDeclaration>childNode(codeGenResponse, 0));

    assert.equal("single_level_package", namespaceNode.name.text)

    const interfaceNodes = childNodes(namespaceNode.body)

    assert.deepEqual(
      ["FortuneCookie", [
        ["fortuneContent", "StringKeyword"],
        ["fortuneNumber", "NumberKeyword"]]],
      extractInterfaceInfo(interfaceNodes[0]))

    assert.deepEqual(
      ["FinalBill", [
        ["amountCents", "NumberKeyword"],
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
                // .addPrimitiveField("originally_message", FieldDescriptorProto.Type.TYPE_MESSAGE) SUPPORTED (tested elsewhere)
                .addPrimitiveField("originally_bytes", FieldDescriptorProto.Type.TYPE_BYTES)
                .addPrimitiveField("originally_uint32", FieldDescriptorProto.Type.TYPE_UINT32)
                // .addPrimitiveField("originally_enum", FieldDescriptorProto.Type.TYPE_ENUM) SUPPORTED (tested elsewhere)
                .addPrimitiveField("originally_sfixed32", FieldDescriptorProto.Type.TYPE_SFIXED32)
                .addPrimitiveField("originally_sfixed64", FieldDescriptorProto.Type.TYPE_SFIXED64)
                .addPrimitiveField("originally_sint32", FieldDescriptorProto.Type.TYPE_SINT32)
                .addPrimitiveField("originally_sint64", FieldDescriptorProto.Type.TYPE_SINT64)
                .build())
          .build())
        .build())

    assert.deepEqual(
      ["Smorgasbord", [
        ["originallyDouble", "NumberKeyword"], 
        ["originallyFloat", "NumberKeyword"], 
        ["originallyInt64", "NumberKeyword"], 
        ["originallyUint64", "NumberKeyword"], 
        ["originallyInt32", "NumberKeyword"], 
        ["originallyFixed64", "NumberKeyword"], 
        ["originallyFixed32", "NumberKeyword"], 
        ["originallyBool", "BooleanKeyword"], 
        ["originallyString", "StringKeyword"], 
        ["originallyBytes", "UnionType"], 
        ["originallyUint32", "NumberKeyword"], 
        ["originallySfixed32", "NumberKeyword"], 
        ["originallySfixed64", "NumberKeyword"], 
        ["originallySint32", "NumberKeyword"], 
        ["originallySint64", "NumberKeyword"]]], 
      extractInterfaceInfo(childNode(codeGenResponse, 0)))
  })

  test("convert an enum nested in a message to a typescript const enum that within a module named the same as the message/interface", () => {
    const protoFortuneKindEnum = 
      new EnumProtoBuilder()
        .setName("FortuneKind")
        .addValue("A_WISE_SOUNDING_BUT_ACTUALLY_CONFUSED_STATEMENT")
        .addValue("SPECIFIC_PREDICTION_OF_WHAT_WILL_HAPPEN")
        .build()

    const codeGenResponse = transform(
      new CodeGeneratorRequestBuilder()
        .addProtoFile(
          new FileDescriptorProtoBuilder()
            .addMessageType(
              new MessageTypeProtoBuilder()
                .setName("FortuneCookie")
                .addEnumType(protoFortuneKindEnum)
                .addPrimitiveField("fortuneContent", FieldDescriptorProto.Type.TYPE_STRING)
                .addEnumField("fortune_kind", protoFortuneKindEnum)
                .build())
          .build())
        .build())

    const moduleDeclaration = (<ts.ModuleDeclaration>childNode(codeGenResponse, 0))
    assert.equal("FortuneCookie", (<ts.Identifier>moduleDeclaration.name).escapedText)
    assert.deepEqual(
      ["FortuneKind", [
        "A_WISE_SOUNDING_BUT_ACTUALLY_CONFUSED_STATEMENT", 
        "SPECIFIC_PREDICTION_OF_WHAT_WILL_HAPPEN"]], 
        extractEnumInfo((<ts.ModuleBlock>moduleDeclaration.body).statements[0]))

    assert.deepEqual(
      ["FortuneCookie", [
        ["fortuneContent", "StringKeyword"], 
        ["fortuneKind", "FortuneKind"]]], 
      extractInterfaceInfo(childNode(codeGenResponse, 1)))
  })

  test("convert a proto service to a ts interface containing method signatures that take " +
       "a request interface and return a promise to produce a response", () => {
    const requestType: DescriptorProto = new MessageTypeProtoBuilder()
      .setName("GetRandomFortuneRequest")
      .build();

    const responseType: DescriptorProto = new MessageTypeProtoBuilder()
      .setName("GetRandomFortuneResponse")
      .addPrimitiveField("fortuneContent", FieldDescriptorProto.Type.TYPE_STRING)
      .build();

    const codeGenResponse = transform(
      new CodeGeneratorRequestBuilder()
        .addProtoFile(
          new FileDescriptorProtoBuilder()
            .addMessageType(requestType)
            .addMessageType(responseType)
            .addService(
              new ServiceProtoBuilder()
                .setName("FortuneService")
                .addRpcMethod("GetRandomFortune", requestType, responseType)
                .build())
          .build())
        .build())

    assert.deepEqual(
      ["GetRandomFortuneRequest", []], 
      extractInterfaceInfo(childNode(codeGenResponse, 0)))

    assert.deepEqual(
      ["GetRandomFortuneResponse", [
        ["fortuneContent", "StringKeyword"]]], 
      extractInterfaceInfo(childNode(codeGenResponse, 1)))

    assert.deepEqual(
      ["FortuneService", [
        ["getRandomFortune", ["GetRandomFortuneRequest"], "Promise"]
      ]], 
      extractInterfaceInfo(childNode(codeGenResponse, 2)))
  })

  test("the same name in the same namespace results in a sanity-checking error " +
       "(rather than silently and erroneously continuing)", () => {
    try{
      const codeGenResponse = transform(
        new CodeGeneratorRequestBuilder()
          .addProtoFile(
            new FileDescriptorProtoBuilder()
              .addMessageType(
                new MessageTypeProtoBuilder()
                  .addEnumType(
                    new EnumProtoBuilder()
                      .setName("FortuneCookie")
                      .build())
                  .setName("FortuneCookie")
                  .build())
            .build())
          .build())
      assert.fail()
    } catch (err) {
    }
  })

  test("a message within a message, generates an interface that goes in a module named after the top-level message", () => {
    const codeGenResponse = transform(
      new CodeGeneratorRequestBuilder()
        .addProtoFile(
          new FileDescriptorProtoBuilder()
            .addMessageType(
              new MessageTypeProtoBuilder()
                .setName("TopLevel")
                .addMessageType(
                  new MessageTypeProtoBuilder()
                    .setName("Nested")
                    .build())
                .build())
          .build())
        .build())

    const moduleDeclaration = (<ts.ModuleDeclaration>childNode(codeGenResponse, 0))
    assert.equal("TopLevel", (<ts.Identifier>moduleDeclaration.name).escapedText)
    assert.deepEqual(
      ["Nested", []], 
        extractInterfaceInfo((<ts.ModuleBlock>moduleDeclaration.body).statements[0]))
  })

  //TODO: detect naming collisions and make sure good errors are raised, instead of silently overwriting
})
