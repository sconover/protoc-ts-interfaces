import {FileDescriptorProto, EnumDescriptorProto, EnumValueDescriptorProto, 
        DescriptorProto, FieldDescriptorProto, MethodDescriptorProto, ServiceDescriptorProto} from "google-protobuf/google/protobuf/descriptor_pb";
import {CodeGeneratorRequest, CodeGeneratorResponse} from "google-protobuf/google/protobuf/compiler/plugin_pb";

export const GENERATED_TYPESCRIPT_DEFINITION_FILE_NAME: string = "generated.d.ts"

/** Accumulates ts interface file content */
class StringWriter {
  content: string = ""

  append(str: string) {
    this.content += str
  }

  getContent(): string {
    return this.content;
  }
}

/** A higher-level/convenient way of generating ts interface file content */
class TypescriptDeclarationComposer {
  writer: StringWriter
  prefix: string
  namespace: string
  alreadyStarted: boolean = false

  constructor(
    writer: StringWriter = new StringWriter(),
    prefix: string = "") {
    this.writer = writer
    this.prefix = prefix
  }

  appendSeparatorLineIfAlreadyStarted(): void {
    if (this.alreadyStarted) {
      this.appendLine("")
    }
  }

  startDeclaredNamespace(name: string): TypescriptDeclarationComposer {
    this.appendSeparatorLineIfAlreadyStarted()
    this.appendLine(`declare namespace ${name} {`)
    this.appendLine("")
    this.namespace = name
    this.alreadyStarted = true
    return this
  }

  startPlainNamespace(name: string): TypescriptDeclarationComposer {
    this.appendSeparatorLineIfAlreadyStarted()
    this.appendLine(`namespace ${name} {`)
    this.appendLine("")
    this.namespace = name
    this.alreadyStarted = true
    return this
  }

  startInterface(name: string): TypescriptDeclarationComposer {
    this.appendSeparatorLineIfAlreadyStarted()
    this.appendLine(`interface ${name} {`)
    this.alreadyStarted = true
    return this
  }

  startConstEnum(name: string): TypescriptDeclarationComposer {
    this.appendSeparatorLineIfAlreadyStarted()
    this.appendLine(`const enum ${name} {`)
    this.alreadyStarted = true
    return this
  }

  endBlock(): TypescriptDeclarationComposer {
    if (this.namespace != null) {
      this.appendSeparatorLineIfAlreadyStarted()
    }
    this.appendLine("}")
    return this
  }

  member(memberName: string, typeName: string): TypescriptDeclarationComposer {
    this.appendLine(`${memberName}: ${typeName}`)
    return this
  }

  rpcMethodSignature(methodName: string, requestTypeName: string, responseTypeName: string): TypescriptDeclarationComposer {
    this.appendLine(`${methodName}(request: ${requestTypeName}): Promise<${responseTypeName}>`)
    return this
  }

  enumValue(enumName: string, enumNumber: number): TypescriptDeclarationComposer {
    this.appendLine(`${enumName} = ${enumNumber},`) // there's a comma
    return this;
  }

  lastEnumValue(enumName: string, enumNumber: number): TypescriptDeclarationComposer {
    this.appendLine(`${enumName} = ${enumNumber}`) // note: no comma
    return this;
  }

  withIndent(): TypescriptDeclarationComposer {
    return new TypescriptDeclarationComposer(this.writer, this.prefix + "  ")
  }

  getContent(): string {
    return this.writer.getContent();
  }

  private appendLine(str: string) {
    this.writer.append(this.prefix + str + "\n")
  }
}

/** Given a proto enum type, write the corresponding ts "const enum" */
function transformProtoEnumTypeToTypescriptInterface(
  tsComposer: TypescriptDeclarationComposer, 
  protoEnumType: EnumDescriptorProto, 
  fullyQualifiedToShorthandTypeMap: any) {
  tsComposer.startConstEnum(protoEnumType.getName());
  const tsComposerForEnumValues = tsComposer.withIndent();
  const lastIndex = protoEnumType.getValueList().length - 1
  protoEnumType.getValueList().forEach((protoEnumValue, index) => {
    if (index == lastIndex) {
      transformProtoEnumValueToLastTypescriptEnumValue(tsComposerForEnumValues, protoEnumValue);
    } else {
      transformProtoEnumValueToTypescriptEnumValue(tsComposerForEnumValues, protoEnumValue);
    }
  });
  tsComposer.endBlock();
}

/** Given a proto message type, write the corresponding ts interface (with members corresponding to proto fields) */
function transformProtoMessageTypeToTypescriptInterface(
  tsComposer: TypescriptDeclarationComposer, 
  protoMessageType: DescriptorProto,
  fullyQualifiedToShorthandTypeMap: any) {
  tsComposer.startInterface(protoMessageType.getName());
  const tsComposerForFields = tsComposer.withIndent();
  for (let protoField of protoMessageType.getFieldList()) {
    transformProtoFieldToTypescriptInterfaceMember(tsComposerForFields, protoField, fullyQualifiedToShorthandTypeMap);
  }
  tsComposer.endBlock();
}

/** Given a proto service, write the corresponding ts interface (with method signatures corresponding to rpc's) */
function transformProtoServiceToTypescriptInterface(
  tsComposer: TypescriptDeclarationComposer, 
  protoService: ServiceDescriptorProto,
  fullyQualifiedToShorthandTypeMap: any) {
  tsComposer.startInterface(protoService.getName());
  const tsComposerForRpcMethods = tsComposer.withIndent();
  for (let protoRpcMethod of protoService.getMethodList()) {
    transformProtoRpcMethodToTypescriptInterfaceMethodSignature(tsComposerForRpcMethods, protoRpcMethod, fullyQualifiedToShorthandTypeMap);
  }
  tsComposer.endBlock();
}

// directly lifted from ts-protoc-gen
const TypeNumToTypeString: {[key: number]: string} = {};
TypeNumToTypeString[1] = "number"; // TYPE_DOUBLE
TypeNumToTypeString[2] = "number"; // TYPE_FLOAT
TypeNumToTypeString[3] = "number"; // TYPE_INT64
TypeNumToTypeString[4] = "number"; // TYPE_UINT64
TypeNumToTypeString[5] = "number"; // TYPE_INT32
TypeNumToTypeString[6] = "number"; // TYPE_FIXED64
TypeNumToTypeString[7] = "number"; // TYPE_FIXED32
TypeNumToTypeString[8] = "boolean"; // TYPE_BOOL
TypeNumToTypeString[9] = "string"; // TYPE_STRING
// TypeNumToTypeString[10] = "Object"; // TYPE_GROUP
// TypeNumToTypeString[MESSAGE_TYPE] = "Object"; // TYPE_MESSAGE - Length-delimited aggregate.
TypeNumToTypeString[12] = "Uint8Array"; // TYPE_BYTES
TypeNumToTypeString[13] = "number"; // TYPE_UINT32
TypeNumToTypeString[14] = "number"; // TYPE_ENUM
TypeNumToTypeString[15] = "number"; // TYPE_SFIXED32
TypeNumToTypeString[16] = "number"; // TYPE_SFIXED64
TypeNumToTypeString[17] = "number"; // TYPE_SINT32 - Uses ZigZag encoding.
TypeNumToTypeString[18] = "number"; // TYPE_SINT64 - Uses ZigZag encoding.

/** Given a proto field, write the corresponding member of a ts interface */
function transformProtoFieldToTypescriptInterfaceMember(
  tsComposer: TypescriptDeclarationComposer, 
  protoField: FieldDescriptorProto,
  fullyQualifiedToShorthandTypeMap: any) {
  if (protoField.getType() == FieldDescriptorProto.Type.TYPE_MESSAGE || 
      protoField.getType() == FieldDescriptorProto.Type.TYPE_ENUM) {
    tsComposer.member(protoField.getName(), toTsTypeName(protoField.getTypeName(), fullyQualifiedToShorthandTypeMap));
  } else if (protoField.getType() == FieldDescriptorProto.Type.TYPE_BYTES) {
    tsComposer.member(protoField.getName(), "Uint8Array | string");
  } else {
    const tsType = TypeNumToTypeString[protoField.getType()];
    if (tsType == null) {
      throw new Error(`no ts type found for proto type number ${protoField.getType()}`);
    }
    tsComposer.member(protoField.getName(), tsType);
  }
}

/** Given a proto field, write the corresponding member of a ts interface */
function transformProtoRpcMethodToTypescriptInterfaceMethodSignature(
  tsComposer: TypescriptDeclarationComposer, 
  protoRpcMethod: MethodDescriptorProto,
  fullyQualifiedToShorthandTypeMap: any) {
  tsComposer.rpcMethodSignature(
    lowerCaseFirstLetter(protoRpcMethod.getName()), 
    toTsTypeName(protoRpcMethod.getInputType(), fullyQualifiedToShorthandTypeMap), 
    toTsTypeName(protoRpcMethod.getOutputType(), fullyQualifiedToShorthandTypeMap))
}

/** Given a proto enum value, write the corresponding ts enum value */
function transformProtoEnumValueToTypescriptEnumValue(tsComposer: TypescriptDeclarationComposer, protoEnumValue: EnumValueDescriptorProto): void {
  tsComposer.enumValue(protoEnumValue.getName(), protoEnumValue.getNumber());
}

/** Given a proto enum value, write the corresponding ts enum value (last position in list) */
function transformProtoEnumValueToLastTypescriptEnumValue(tsComposer: TypescriptDeclarationComposer, protoEnumValue: EnumValueDescriptorProto): void {
  tsComposer.lastEnumValue(protoEnumValue.getName(), protoEnumValue.getNumber());
}

function toTsTypeName(protoTypeName: string, fullyQualifiedToShorthandTypeMap: any): string {
  let tsTypeName = protoTypeName
  if (tsTypeName.indexOf(".")==0) {
    // Slicing the leading dot off the fully qualified type name
    // is what they do in ts-protoc-gen. I suspect we're all missing something,
    // but, moving on...
    tsTypeName = tsTypeName.slice(1)
  }
  if (fullyQualifiedToShorthandTypeMap[tsTypeName] != null) {
    return fullyQualifiedToShorthandTypeMap[tsTypeName]
  } else {
    return tsTypeName
  }
}

function lowerCaseFirstLetter(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

/** Core operation. Transforms protoc input, a series of proto files, into the
 * output, which is a single file containing all gen'd ts interfaces, based 
 * on the proto defs.
 */
export function transform(input: CodeGeneratorRequest): CodeGeneratorResponse {
  const tsComposer = new TypescriptDeclarationComposer()

  for (let protoFile of input.getProtoFileList()) {
    let tsInnerComposer = null
    let currentPackagePrefix = null
    let fullyQualifiedToShorthandTypeMap = {}
    const indentedComposers: Array<TypescriptDeclarationComposer> = new Array()
    if (protoFile.hasPackage()) {
      const packageParts = protoFile.getPackage().split(".")
      packageParts.forEach((packagePart, index) => {
        if (index == 0) {
          tsComposer.startDeclaredNamespace(packagePart)
          indentedComposers.push(tsComposer)
          tsInnerComposer = tsComposer.withIndent()
        } else {
          tsInnerComposer.startPlainNamespace(packagePart)
          indentedComposers.push(tsInnerComposer)
          tsInnerComposer = tsInnerComposer.withIndent()
        }
      })
      currentPackagePrefix = protoFile.getPackage() + "."
    } else {
      tsInnerComposer = tsComposer
      currentPackagePrefix = ""
    }
    for (let protoMessageType of protoFile.getMessageTypeList()) {
      // NOTE: this shifts inside-message proto enums to sibling-to-message ts enums.
      // TODO: fail if enum names collide because of this.
      for (let protoEnumType of protoMessageType.getEnumTypeList()) {
        transformProtoEnumTypeToTypescriptInterface(tsInnerComposer, protoEnumType, fullyQualifiedToShorthandTypeMap);

        // this says, make any fully-qualified references to proto enums defined within proto messages,
        // appear to be namespace-level const-enums in ts
        fullyQualifiedToShorthandTypeMap[currentPackagePrefix + protoMessageType.getName() + "." + protoEnumType.getName()] = 
          protoEnumType.getName()
      }
    }
    for (let protoEnumType of protoFile.getEnumTypeList()) {
      transformProtoEnumTypeToTypescriptInterface(tsInnerComposer, protoEnumType, fullyQualifiedToShorthandTypeMap);
      fullyQualifiedToShorthandTypeMap[currentPackagePrefix + protoEnumType.getName()] = protoEnumType.getName()
    }
    for (let protoMessageType of protoFile.getMessageTypeList()) {
      transformProtoMessageTypeToTypescriptInterface(tsInnerComposer, protoMessageType, fullyQualifiedToShorthandTypeMap);
      fullyQualifiedToShorthandTypeMap[currentPackagePrefix + protoMessageType.getName()] = protoMessageType.getName()
    }
    for (let protoService of protoFile.getServiceList()) {
      transformProtoServiceToTypescriptInterface(tsInnerComposer, protoService, fullyQualifiedToShorthandTypeMap);
    }
    for (let i = 0; i < indentedComposers.length; i++){
      indentedComposers[indentedComposers.length - i - 1].endBlock()
    }
  }

  const outTsFile = new CodeGeneratorResponse.File()
  outTsFile.setName(GENERATED_TYPESCRIPT_DEFINITION_FILE_NAME)
  outTsFile.setContent(tsComposer.getContent())
  const codeGenResponse = new CodeGeneratorResponse()
  codeGenResponse.addFile(outTsFile)
      
  return codeGenResponse
}

/** Top-level function, that deserializes CodeGeneratorRequest's,
 * transforms them to CodeGeneratorResponse's, serializes those
 * and writes them to the stdout stream.
 */
export function transformStream(stdin: NodeJS.ReadStream, stdout: NodeJS.WriteStream) {
  stdin.on("readable", function () {
    try {
      let chunk

      while ((chunk = stdin.read())) {
          if (!(chunk instanceof Buffer)) throw new Error("Did not receive buffer")

          const typedInputBuff = new Uint8Array(chunk.length)
          typedInputBuff.set(chunk)
          const codeGenRequest = CodeGeneratorRequest.deserializeBinary(typedInputBuff)

          const codeGenResponse = transform(codeGenRequest);
          stdout.write(new Buffer(codeGenResponse.serializeBinary()))
      }
    } catch (err) {
      console.error("protoc-gen-ts_interfaces error: " + err.stack + "\n");
      process.exit(1);
    }
  })
}
