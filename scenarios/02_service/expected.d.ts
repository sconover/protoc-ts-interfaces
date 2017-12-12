declare namespace baker {

  const enum Deliciousness {
    ITS_OK = 0,
    QUITE_DELICIOUS_SIR = 1
  }
  
  interface PleaseBakeCakeRequest {
    size: number
  }
  
  interface PleaseBakeCakeResponse {
    deliciousness: Deliciousness
  }
  
  interface BakerService {
    pleaseBakeCake(request: PleaseBakeCakeRequest): Promise<PleaseBakeCakeResponse>
  }

}
