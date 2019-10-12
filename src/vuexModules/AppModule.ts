import {
  Module,
  VuexModule,
  Mutation} from 'vuex-module-decorators'

import Servers from '../util/Servers'

import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import { Nos } from '@computable/computablejs/dist/@types'

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
  // public marketTokenToUSDRate: number = -1
  // public marketTokenToEthereumRate: number = -1
  public datatrustContractAllowance: number = -1
  public supportPrice: BigNumber = new BigNumber(-1)

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

  // @Mutation
  // public setMarketTokenToUSDRate(marketTokenToUSDRate: number) {
  //   this.marketTokenToUSDRate = marketTokenToUSDRate
  // }

  // @Mutation
  // public setMarketTokenToEthereumRate(marketTokenToEthereumRate: number) {
  //   this.marketTokenToEthereumRate = marketTokenToEthereumRate
  // }

  @Mutation
  public setDatatrustContractAllowance(allowance: number) {
    this.datatrustContractAllowance = allowance
  }

  @Mutation
  public setSupportPrice(weiValue: BigNumber) {
    this.supportPrice = weiValue
  }

  public get canVote(): boolean {

    if (this.stake < 0 || this.marketTokenBalance < 0) {
      return false
    }
    return this.marketTokenBalance > this.stake
  }

  public get ethereumToMarketTokenRate(): number {
    const web3 = new Web3(Servers.SkynetJsonRpc)
    const oneG = new BigNumber(1000)
    const oneBillion = oneG.times(oneG).times(oneG)

    const supportPrice = BigNumber.max(0, this.supportPrice)
    if (supportPrice.eq(0)) {
      return 0
    }

    const oneMarketTokenInWei = supportPrice.times(oneBillion)
    // console.log(`wei: ${oneMarketTokenInWei}`)
    const bn = web3.utils.toBN(oneMarketTokenInWei)
    // console.log(`bn: ${bn}`)
    const ether = web3.utils.fromWei(bn)
    // console.log(`eth: ${ether}`)
    return Number(ether)
  }

  public get marketTokenToEthereumRate(): number {
    if (this.ethereumToMarketTokenRate === 0) {
      return 0
    }
    return 1 / this.ethereumToMarketTokenRate
  }

  public get marketTokenToUSDRate(): number {
    return this.marketTokenToEthereumRate * Math.max(this.ethereumToUSDRate, 0.0)
  }
}
