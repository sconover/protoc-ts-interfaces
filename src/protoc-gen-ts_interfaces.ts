import {CodeGeneratorRequest, CodeGeneratorResponse} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import {FileDescriptorProto} from "google-protobuf/google/protobuf/descriptor_pb";

const stdin = process.stdin;
stdin.on("readable", function () {
  try {
    let chunk

    while ((chunk = stdin.read())) {
        if (!(chunk instanceof Buffer)) throw new Error("Did not receive buffer")

        const typedInputBuff = new Uint8Array(chunk.length)
        typedInputBuff.set(chunk)

        const codeGenRequest = CodeGeneratorRequest.deserializeBinary(typedInputBuff)
    }
  } catch (err) {
    console.error("protoc-gen-ts_interfaces error: " + err.stack + "\n");
    process.exit(1);
  }
});

const outTsFile = new CodeGeneratorResponse.File()
outTsFile.setName("generated.d.ts");
outTsFile.setContent(
`
interface HelloInterface {
  name: string;
}
`
);
const codeGenResponse = new CodeGeneratorResponse()
codeGenResponse.addFile(outTsFile)

process.stdout.write(new Buffer(codeGenResponse.serializeBinary()));
