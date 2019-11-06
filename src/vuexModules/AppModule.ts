import {
  Module,
  VuexModule,
  Mutation} from 'vuex-module-decorators'

import Servers from '../util/Servers'

import Web3 from 'web3'

import BigNumber from 'bignumber.js'

@Module({ namespaced: true, name: 'appModule' })
export default class AppModule extends VuexModule {

  public web3: Web3 = Object()
  public appReady = false
  public makerPayment = -1
  public costPerByte = -1
  public stake = -1
  public priceFloor = -1
  public plurality = -1
  public voteBy = -1
  public ethereumBalance = -1
  public ethereumToUSDRate = -1
  public etherTokenBalance = -1
  public marketTokenBalance = -1
  public datatrustContractAllowance = -1
  public etherTokenContractAllowance = -1
  public marketTokenContractAllowance = -1
  public reserveContractAllowance = -1
  public votingContractAllowance = -1
  public supportPrice = -1
  public jwt = ''

  public get areParametersSet(): boolean {
    return this.makerPayment > -1 &&
           this.costPerByte > -1 &&
           this.stake > -1 &&
           this.priceFloor > -1 &&
           this.plurality > -1 &&
           this.voteBy > -1 &&
           this.etherTokenBalance > -1 &&
           this.marketTokenBalance > -1 &&
           this.datatrustContractAllowance > -1 &&
           this.votingContractAllowance > -1 &&
           this.supportPrice > -1
  }

  @Mutation
  public initializeWeb3(provider: any) {
    this.web3 = new Web3(provider)
  }

  @Mutation
  public disconnectWeb3() {
    this.web3 = Object()
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
  public setDatatrustContractAllowance(allowance: number) {
    this.datatrustContractAllowance = allowance
  }

  @Mutation
  public setEtherTokenContractAllowance(allowance: number) {
    this.etherTokenContractAllowance = allowance
  }

  @Mutation
  public setReserveContractAllowance(weiValue: number) {
    this.reserveContractAllowance = weiValue
  }

  @Mutation
  public setMarketTokenContractAllowance(weiValue: number) {
    this.marketTokenContractAllowance = weiValue
  }

  @Mutation
  public setVotingContractAllowance(weiValue: number) {
    this.votingContractAllowance = weiValue
  }

  @Mutation
  public setSupportPrice(weiValue: number) {
    this.supportPrice = weiValue
  }

  @Mutation
  public setJWT(jwt: string) {
    this.jwt = jwt
  }

  public get canVote(): boolean {

    if (this.stake < 0 || this.marketTokenBalance < 0) {
      return false
    }
    return this.marketTokenBalance > this.stake
  }

  public get marketTokenToEthereumRate(): number {
    const web3 = new Web3(Servers.EthereumJsonRpcProvider!)
    const oneG = new BigNumber(1000)
    const oneBillion = oneG.times(oneG).times(oneG)

    const supportPrice = Math.max(0, this.supportPrice)
    if (supportPrice === 0) {
      return 0
    }

    const oneMarketTokenInWei = new BigNumber(supportPrice).times(oneBillion)
    // console.log(`wei: ${oneMarketTokenInWei}`)
    const ether = web3.utils.fromWei(oneMarketTokenInWei.toFixed(0))
    // console.log(`eth: ${ether}`)
    return Number(ether)
  }

  public get ethereumToMarketTokenRate(): number {
    if (this.marketTokenToEthereumRate === 0) {
      return 0
    }
    return 1 / this.marketTokenToEthereumRate
  }

  public get marketTokenToUSDRate(): number {
    return this.ethereumToMarketTokenRate * Math.max(this.ethereumToUSDRate, 0.0)
  }
}
