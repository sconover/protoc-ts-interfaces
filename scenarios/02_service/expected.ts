export namespace baker {

  export const enum Deliciousness {
    ITS_OK = "ITS_OK",
    QUITE_DELICIOUS_SIR = "QUITE_DELICIOUS_SIR"
  }

  export interface PleaseBakeCakeRequest {
    size: number
  }

  export interface PleaseBakeCakeResponse {
    deliciousness: baker.Deliciousness
  }

  export interface BakerService {
    pleaseBakeCake(request: baker.PleaseBakeCakeRequest): Promise<baker.PleaseBakeCakeResponse>
  }

}
