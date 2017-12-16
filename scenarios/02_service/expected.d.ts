export namespace baker {

  const enum Deliciousness {
    ITS_OK = "ITS_OK",
    QUITE_DELICIOUS_SIR = "QUITE_DELICIOUS_SIR"
  }
  
  interface PleaseBakeCakeRequest {
    size: number
  }
  
  interface PleaseBakeCakeResponse {
    deliciousness: baker.Deliciousness
  }
  
  interface BakerService {
    pleaseBakeCake(request: baker.PleaseBakeCakeRequest): Promise<baker.PleaseBakeCakeResponse>
  }

}
