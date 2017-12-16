export namespace various {

  const enum ExampleEnum {
    FIRST_OPTION = "FIRST_OPTION",
    SECOND_OPTION = "SECOND_OPTION"
  }
  
  interface Primitives {
    exampleString: string
    exampleInt: number
    exampleLong: number
    exampleFloat: number
    exampleDouble: number
    exampleBool: boolean
    exampleBytes: Uint8Array | string
  }
  
  interface A {
    aStr: string
  }
  
  interface B {
    bStr: string
  }
  
  interface EitherAOrB {
    a?: various.A
    b?: various.B
  }
  
  interface Container {
    name: string
    onePrimitive: various.Primitives
    oneEnumValue: various.ExampleEnum
    choose: various.EitherAOrB
    c?: string
    d?: string
  }
  
  interface Repetition {
    names: string[]
    manyEnumValues: various.ExampleEnum[]
    manyContainers: various.Container[]
  }

}
