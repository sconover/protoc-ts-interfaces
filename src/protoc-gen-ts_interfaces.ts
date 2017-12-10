import {FileDescriptorProto} from "google-protobuf/google/protobuf/descriptor_pb";
import {CodeGeneratorRequest, CodeGeneratorResponse} from "google-protobuf/google/protobuf/compiler/plugin_pb";

export const GENERATED_TYPESCRIPT_DEFINITION_FILE_NAME: string = "generated.d.ts"

export function transform(input: CodeGeneratorRequest): CodeGeneratorResponse {
  const outTsFile = new CodeGeneratorResponse.File()
  outTsFile.setName(GENERATED_TYPESCRIPT_DEFINITION_FILE_NAME)
  outTsFile.setContent(
`interface HelloInterface {
  name: string;
}
`
  )
  const codeGenResponse = new CodeGeneratorResponse()
  codeGenResponse.addFile(outTsFile)
      
  return codeGenResponse
}

export function transformStream(stdin: NodeJS.ReadStream, stdout: NodeJS.WriteStream) {
  const codeGenResponse = transform(new CodeGeneratorRequest());
  process.stdout.write(new Buffer(codeGenResponse.serializeBinary()));
  
  // stdin.on("readable", function () {
  //   try {
  //     let chunk

  //     while ((chunk = stdin.read())) {
  //         if (!(chunk instanceof Buffer)) throw new Error("Did not receive buffer")

  //         const typedInputBuff = new Uint8Array(chunk.length)
  //         typedInputBuff.set(chunk)
  //         const codeGenRequest = CodeGeneratorRequest.deserializeBinary(typedInputBuff)
  //     }
  //   } catch (err) {
  //     console.error("protoc-gen-ts_interfaces error: " + err.stack + "\n");
  //     process.exit(1);
  //   }
  // })
}
