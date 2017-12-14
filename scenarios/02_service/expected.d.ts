export namespace baker {

  const enum Deliciousness {
    ITS_OK = 0,
    QUITE_DELICIOUS_SIR = 1
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
