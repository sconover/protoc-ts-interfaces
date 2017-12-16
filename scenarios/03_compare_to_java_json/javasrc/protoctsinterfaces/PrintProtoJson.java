package protoctsinterfaces;

import com.google.protobuf.ByteString;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.util.JsonFormat;
import various.Various;

class PrintProtoJson {
  public static void main(String[] args) {
    Various.Repetition message = Various.Repetition.newBuilder()
      .addManyContainers(
        Various.Container.newBuilder()
          .setName("this is the container name")
          .setOnePrimitive(
            Various.Primitives.newBuilder()
              .setExampleString("this is an example string value")
              .setExampleInt(77)
              .setExampleLong(78)
              .setExampleFloat(77.78f)
              .setExampleDouble(78.78)
              .setExampleBool(true)
              .setExampleBytes(ByteString.copyFrom("abc".getBytes())))
          .setOneEnumValue(Various.ExampleEnum.SECOND_OPTION)
          .setChoose(Various.EitherAOrB.newBuilder()
            .setB(Various.B.newBuilder()
              .setBStr("this is b"))
            .build())
          .setD("this is d"))
      .addManyContainers(
        Various.Container.newBuilder()
          .setName("this is the second container"))
      .addManyEnumValues(Various.ExampleEnum.SECOND_OPTION)
      .addManyEnumValues(Various.ExampleEnum.SECOND_OPTION)
      .addManyEnumValues(Various.ExampleEnum.FIRST_OPTION)
      .addNames("name one")
      .addNames("name two")
      .build();

    try {
      System.out.println(JsonFormat.printer().print(message));
    } catch (InvalidProtocolBufferException e) {
      throw new RuntimeException(e);
    }
  }
}