import {FileDescriptorProto, DescriptorProto, FieldDescriptorProto} from "google-protobuf/google/protobuf/descriptor_pb";
import {CodeGeneratorRequest, CodeGeneratorResponse} from "google-protobuf/google/protobuf/compiler/plugin_pb";

export const GENERATED_TYPESCRIPT_DEFINITION_FILE_NAME: string = "generated.d.ts"

class StringWriter {
  content: string = ""

  append(str: string) {
    this.content += str
  }

  getContent(): string {
    return this.content;
  }
}

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

  startNamespace(name: string): TypescriptDeclarationComposer {
    this.appendSeparatorLineIfAlreadyStarted()
    this.appendLine(`declare namespace ${name} {`)
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

const TypeNumToTypeString: {[key: number]: string} = {};
// TypeNumToTypeString[1] = "number"; // TYPE_DOUBLE
// TypeNumToTypeString[2] = "number"; // TYPE_FLOAT
// TypeNumToTypeString[3] = "number"; // TYPE_INT64
// TypeNumToTypeString[4] = "number"; // TYPE_UINT64
TypeNumToTypeString[5] = "number"; // TYPE_INT32
// TypeNumToTypeString[6] = "number"; // TYPE_FIXED64
// TypeNumToTypeString[7] = "number"; // TYPE_FIXED32
// TypeNumToTypeString[8] = "boolean"; // TYPE_BOOL
TypeNumToTypeString[9] = "string"; // TYPE_STRING
// TypeNumToTypeString[10] = "Object"; // TYPE_GROUP
// TypeNumToTypeString[MESSAGE_TYPE] = "Object"; // TYPE_MESSAGE - Length-delimited aggregate.
// TypeNumToTypeString[BYTES_TYPE] = "Uint8Array"; // TYPE_BYTES
// TypeNumToTypeString[13] = "number"; // TYPE_UINT32
// TypeNumToTypeString[ENUM_TYPE] = "number"; // TYPE_ENUM
// TypeNumToTypeString[15] = "number"; // TYPE_SFIXED32
// TypeNumToTypeString[16] = "number"; // TYPE_SFIXED64
// TypeNumToTypeString[17] = "number"; // TYPE_SINT32 - Uses ZigZag encoding.
// TypeNumToTypeString[18] = "number"; // TYPE_SINT64 - Uses ZigZag encoding.

function tsTypeForProtoTypeNum(protoTypeNumber: number) {
  const result = TypeNumToTypeString[protoTypeNumber]!
}

export function transform(input: CodeGeneratorRequest): CodeGeneratorResponse {
  const tsComposer = new TypescriptDeclarationComposer()

  for (let protoFile of input.getProtoFileList()) {
    let tsComposerForMessages = null
    if (protoFile.hasPackage()) {
      tsComposer.startNamespace(protoFile.getPackage())
      tsComposerForMessages = tsComposer.withIndent()
    } else {
      tsComposerForMessages = tsComposer
    }
    for (let protoMessageType of protoFile.getMessageTypeList()) {
      transformProtoMessageTypeToTypescriptInterface(tsComposerForMessages, protoMessageType);
    }
    if (protoFile.hasPackage()) {
      tsComposer.endBlock()
    }
  }

  const outTsFile = new CodeGeneratorResponse.File()
  outTsFile.setName(GENERATED_TYPESCRIPT_DEFINITION_FILE_NAME)
  outTsFile.setContent(tsComposer.getContent())
  const codeGenResponse = new CodeGeneratorResponse()
  codeGenResponse.addFile(outTsFile)
      
  return codeGenResponse
}

function transformProtoMessageTypeToTypescriptInterface(tsComposer: TypescriptDeclarationComposer, protoMessageType: DescriptorProto) {
  tsComposer.startInterface(protoMessageType.getName());
  const tsComposerForFields = tsComposer.withIndent();
  for (let protoField of protoMessageType.getFieldList()) {
    transformProtoFieldToTypescriptInterfaceMember(tsComposerForFields, protoField);
  }
  tsComposer.endBlock();
}

function transformProtoFieldToTypescriptInterfaceMember(tsComposer: TypescriptDeclarationComposer, protoField: FieldDescriptorProto) {
  if (protoField.getType() == FieldDescriptorProto.Type.TYPE_MESSAGE) {
    let tsTypeName = protoField.getTypeName()
    if (tsTypeName.indexOf(".")==0) {
      // Slicing the leading dot off the fully qualified type name
      // is what they do in ts-protoc-gen. I suspect we're all missing something,
      // but, moving on...
      tsTypeName = tsTypeName.slice(1)
    }
    tsComposer.member(protoField.getName(), tsTypeName);
  } else {
    const tsType = TypeNumToTypeString[protoField.getType()];
    if (tsType == null) {
      throw new Error(`no ts type found for proto type number ${protoField.getType()}`);
    }
    tsComposer.member(protoField.getName(), tsType);
  }
}

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
