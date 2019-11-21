import {
  Module,
  VuexModule,
  Mutation} from 'vuex-module-decorators'

import JwtModule from '../functionModules/jwt/JwtModule'

import Servers from '../util/Servers'

import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import JsCookie from 'js-cookie'

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
  public totalMarketTokenSupply = -1
  public totalReserveEtherTokenSupply = -1
  public etherTokenDatatrustContractAllowance = -1
  public etherTokenReserveContractAllowance = -1
  public marketTokenVotingContractAllowance = -1
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
           this.totalMarketTokenSupply > -1 &&
           this.totalReserveEtherTokenSupply > -1 &&
           this.etherTokenDatatrustContractAllowance > -1 &&
           this.etherTokenReserveContractAllowance > -1 &&
           this.marketTokenVotingContractAllowance > -1 &&
           this.supportPrice > -1
  }

  @Mutation
  public reset() {
    this.makerPayment = -1
    this.costPerByte = -1
    this.stake = -1
    this.priceFloor = -1
    this.plurality = -1
    this.voteBy = -1
    this.etherTokenBalance = -1
    this.marketTokenBalance = -1
    this.etherTokenDatatrustContractAllowance = -1
    this.etherTokenReserveContractAllowance = -1
    this.marketTokenVotingContractAllowance = -1
    this.supportPrice = -1
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
  public setTotalMarketTokenSupply(marketTokenSupply: number) {
    this.totalMarketTokenSupply = marketTokenSupply
  }

  @Mutation
  public setTotalReserveEtherTokenSupply(etherTokenSupply: number) {
    this.totalReserveEtherTokenSupply = etherTokenSupply
  }

  @Mutation
  public setEtherTokenReserveAllowance(allowance: number) {
    this.etherTokenReserveContractAllowance = allowance
  }

  @Mutation
  public setEtherTokenDatatrustAllowance(allowance: number) {
    this.etherTokenDatatrustContractAllowance = allowance
  }

  @Mutation
  public setMarketTokenVotingContractAllowance(weiValue: number) {
    this.marketTokenVotingContractAllowance = weiValue
  }

  @Mutation
  public setSupportPrice(weiValue: number) {
    this.supportPrice = weiValue
  }

  @Mutation
  public setJwt(jwt: string|null) {
    if (jwt === null) {
      this.jwt = ''
      JsCookie.remove('jwt')
      return
    }
    this.jwt = jwt
    if (!!!JsCookie.get('jwt'))  {
      JsCookie.set('jwt', jwt, {expires: JwtModule.expiry(jwt)})
    }
  }

  public get canVote(): boolean {

    if (this.stake < 0 || this.marketTokenBalance < 0) {
      return false
    }
    return this.marketTokenBalance > this.stake
  }

  public get hasJwt(): boolean {
    return !!this.jwt && this.jwt.length > 0
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
    const bn = web3.utils.toBN(oneMarketTokenInWei)
    const ether = web3.utils.fromWei(bn)
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
