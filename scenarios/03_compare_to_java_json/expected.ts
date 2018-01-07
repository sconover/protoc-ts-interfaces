export namespace various {

  export const enum ExampleEnum {
    FIRST_OPTION = "FIRST_OPTION",
    SECOND_OPTION = "SECOND_OPTION"
  }

  export interface Primitives {
    exampleString: string
    exampleInt: number
    exampleLong: number
    exampleFloat: number
    exampleDouble: number
    exampleBool: boolean
    exampleBytes: Uint8Array | string
  }

  export interface A {
    aStr: string
  }

  export interface B {
    bStr: string
  }

  export interface EitherAOrB {
    a?: various.A
    b?: various.B
  }

  export interface Container {
    name: string
    onePrimitive: various.Primitives
    oneEnumValue: various.ExampleEnum
    choose: various.EitherAOrB
    c?: string
    d?: string
  }

  export interface Repetition {
    names: string[]
    manyEnumValues: various.ExampleEnum[]
    manyContainers: various.Container[]
  }

}
