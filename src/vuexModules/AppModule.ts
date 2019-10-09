import {
  Module,
  VuexModule,
  Mutation} from 'vuex-module-decorators'

@Module({ namespaced: true, name: 'appModule' })
export default class AppModule extends VuexModule {

  public appReady: boolean = false
  public makerPayment: number = -1
  public costPerByte: number = -1
  public stake: number = -1
  public priceFloor: number = -1
  public plurality: number = -1
  public voteBy: number = -1
  public ethereumBalance: number = -1
  public ethereumToUSDRate: number = -1
  public etherTokenBalance: number = -1
  public marketTokenBalance: number = -1
  public marketTokenToUSDRate: number = -1
  public marketTokenToEthereumRate: number = -1
  public datatrustContractAllowance: number = -1

  public get areParametersSet(): boolean {
    return this.makerPayment > -1 &&
           this.costPerByte > -1 &&
           this.stake > -1 &&
           this.priceFloor > -1 &&
           this.plurality > -1 &&
           this.voteBy > -1 &&
           this.marketTokenBalance > -1 &&
           this.datatrustContractAllowance > -1
  }

  @Mutation
  public setAppReady(appReady: boolean) {
    this.appReady = appReady
  }

  @Mutation
  public setMakerPayment(makerPayment: number) {
    this.makerPayment = makerPayment
  }

  @Mutation
  public setCostPerByte(costPerByte: number) {
    this.costPerByte = costPerByte
  }

  @Mutation
  public setStake(stake: number) {
    this.stake = stake
  }

  @Mutation
  public setPriceFloor(priceFloor: number) {
    this.priceFloor = priceFloor
  }

  @Mutation
  public setPlurality(plurality: number) {
    this.plurality = plurality
  }

  @Mutation
  public setVoteBy(voteBy: number) {
    this.voteBy = voteBy
  }

  @Mutation
  public setEthereumBalance(ethereumBalance: number) {
    this.ethereumBalance = ethereumBalance
  }

  @Mutation
  public setEthereumToUSDRate(ethereumToUSDRate: number) {
    this.ethereumToUSDRate = ethereumToUSDRate
  }

  @Mutation
  public setEtherTokenBalance(etherTokenBlanace: number) {
    this.etherTokenBalance = etherTokenBlanace
  }

  @Mutation
  public setMarketTokenBalance(marketTokenBalance: number) {
    this.marketTokenBalance = marketTokenBalance
  }

  @Mutation
  public setMarketTokenToUSDRate(marketTokenToUSDRate: number) {
    this.marketTokenToUSDRate = marketTokenToUSDRate
  }

  @Mutation
  public setMarketTokenToEthereumRate(marketTokenToEthereumRate: number) {
    this.marketTokenToEthereumRate = marketTokenToEthereumRate
  }

  @Mutation
  public setDatatrustContractAllowance(allowance: number) {
    this.datatrustContractAllowance = allowance
  }

  public get canVote(): boolean {

    if (this.stake < 0 || this.marketTokenBalance < 0) {
      return false
    }
    return this.marketTokenBalance > this.stake
  }
}
