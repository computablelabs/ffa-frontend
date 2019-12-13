import { getModule } from 'vuex-module-decorators'
import { Store } from 'vuex'
import AppModule from '../../vuexModules/AppModule'

import MetamaskModule from '../metamask/MetamaskModule'
import ParameterizerContractModule from '../protocol/ParameterizerContractModule'
import MarketTokenContractModule from '../protocol/MarketTokenContractModule'
import EtherTokenContractModule from '../protocol/EtherTokenContractModule'
import ReserveContractModule from '../protocol/ReserveContractModule'
import CoinbaseModule from '../ethereum/CoinbaseModule'

import ContractAddresses from '../../models/ContractAddresses'
import { EthereumNetwork } from '../../models/EthereumNetwork'

import Servers from '../../util/Servers'

import BigNumber from 'bignumber.js'
import Web3 from 'web3'

export default class EthereumModule {

  public static async setEthereumPriceAndParameters(store: Store<any>): Promise<void> {
    await Promise.all([
      EthereumModule.setParameters(store),
      EthereumModule.setEthereumPrice(store),
    ])

    getModule(AppModule, store).setAppReady(true)
  }

  public static isMetamaskConnected(appModule: AppModule): boolean {
    return !EthereumModule.ethereumDisabled() && EthereumModule.isWeb3Defined(appModule)
  }

  public static isWeb3Defined(appModule: AppModule): boolean {
    return !!appModule.web3.eth
  }

  public static ethereumDisabled(): boolean {
    return !!!ethereum ||
      !!!ethereum.selectedAddress ||
      typeof ethereum.selectedAddress !== 'string' ||
      ethereum.selectedAddress.length === 0
  }

  public static async setParameters(appStore: Store<any>) {

    const appModule = getModule(AppModule, appStore)
    const [
      [makerPayment, costPerByte, stake, priceFloor, plurality, voteBy ],
      etherTokenBalanceInWei,
      totalReserveEtherTokenSupply,
      etherTokenReserveContractAllowance,
      etherTokenDatatrustContractAllowance,
      marketTokenTotalSupply,
      marketTokenBalance,
      marketTokenVotingContractAllowance,
      supportPrice,
      walletBalanceInWei,
    ] = await Promise.all([
          ParameterizerContractModule.getParameters(appModule.web3),

          EtherTokenContractModule.balanceOf(
            ethereum.selectedAddress,
            ethereum.selectedAddress,
            appModule.web3),

          EtherTokenContractModule.balanceOf(
            ethereum.selectedAddress,
            ContractAddresses.ReserveAddress!,
            appModule.web3),

          EtherTokenContractModule.allowance(
            ethereum.selectedAddress,
            ContractAddresses.ReserveAddress!,
            appModule.web3),

          EtherTokenContractModule.allowance(
            ethereum.selectedAddress,
            ContractAddresses.DatatrustAddress!,
            appModule.web3),

          MarketTokenContractModule.totalSupply(
            ethereum.selectedAddress,
            appModule.web3),

          MarketTokenContractModule.balanceOf(
            ethereum.selectedAddress,
            appModule.web3),

          MarketTokenContractModule.allowance(
            ethereum.selectedAddress,
            ContractAddresses.VotingAddress!,
            appModule.web3),

          ReserveContractModule.getSupportPrice(
            ethereum.selectedAddress,
            appModule.web3),

          appModule.web3.eth.getBalance(ethereum.selectedAddress, 'latest'),
        ])

    appModule.setMakerPayment(Number(makerPayment))
    appModule.setCostPerByte(Number(costPerByte))
    appModule.setStake(Number(stake))
    appModule.setPriceFloor(Number(priceFloor))
    appModule.setPlurality(Number(plurality))
    appModule.setVoteBy(Number(voteBy) * 1000)
    appModule.setEtherTokenBalance(Number(etherTokenBalanceInWei))
    appModule.setMarketTokenBalance(Number(marketTokenBalance))
    appModule.setTotalMarketTokenSupply(Number(marketTokenTotalSupply))
    appModule.setTotalReserveEtherTokenSupply(Number(totalReserveEtherTokenSupply))
    appModule.setEtherTokenReserveAllowance(Number(etherTokenReserveContractAllowance))
    appModule.setEtherTokenDatatrustAllowance(Number(etherTokenDatatrustContractAllowance))
    appModule.setMarketTokenVotingContractAllowance(Number(marketTokenVotingContractAllowance))
    appModule.setSupportPrice(Number(supportPrice))
    const big = new BigNumber(walletBalanceInWei)
    const walletBalanceInEth = Number(EthereumModule.weiToEther(big, appModule.web3))
    appModule.setEthereumBalance(Number(walletBalanceInEth))
  }

  public static async setEthereumPrice(appStore: Store<any>) {
    const [error, price] = await CoinbaseModule.getEthereumPriceUSD()
    if (price) {
      getModule(AppModule, appStore).setEthereumToUSDRate(price)
    }
  }

  public static async getEthereumBalance(appStore: Store<any>): Promise<void> {
    const web3 = getModule(AppModule, appStore).web3
    const balanceInWei = await web3.eth.getBalance(ethereum.selectedAddress, 'latest')
    const big = new BigNumber(balanceInWei)
    const balanceInEth = EthereumModule.weiToEther(big, web3)
    getModule(AppModule, appStore).setEthereumBalance(Number(balanceInEth))
  }

  public static async getEtherTokenContractAllowance(
    spenderAddress: string,
    appStore: Store<any>): Promise<void> {

    this.getContractAllowance(
      spenderAddress,
      ContractAddresses.EtherTokenAddress!,
      appStore)
  }

  public static async getmarketTokenVotingContractAllowance(
    spenderAddress: string,
    appStore: Store<any>): Promise<void> {

    this.getContractAllowance(
      spenderAddress,
      ContractAddresses.MarketTokenAddress!,
      appStore)
  }

  public static async getContractAllowance(
    spenderAddress: string,
    tokenAddress: string,
    appStore: Store<any>): Promise<void> {

    let allowance: any

    switch (tokenAddress) {

      case ContractAddresses.EtherTokenAddress!:
        allowance = await EtherTokenContractModule.allowance(
          ethereum.selectedAddress,
          spenderAddress,
          getModule(AppModule, appStore).web3,
        )
        break

      case ContractAddresses.MarketTokenAddress!:
        allowance = await MarketTokenContractModule.allowance(
          ethereum.selectedAddress,
          spenderAddress,
          getModule(AppModule, appStore).web3,
        )
        break

      default:
        return
    }

    const appModule = getModule(AppModule, appStore)
    const allowanceValue = Number(allowance)

    switch (spenderAddress) {
      case ContractAddresses.ReserveAddress!:
        return appModule.setEtherTokenReserveAllowance(allowanceValue)

      case ContractAddresses.DatatrustAddress!:
        return appModule.setEtherTokenDatatrustAllowance(allowanceValue)

      case ContractAddresses.VotingAddress!:
        return appModule.setMarketTokenVotingContractAllowance(allowanceValue)

      default:
        return
    }
  }

  public static async getMarketTokenBalance(appStore: Store<any>): Promise<void> {
    const balanceInWei = await MarketTokenContractModule.balanceOf(
      ethereum.selectedAddress,
      getModule(AppModule, appStore).web3)

    getModule(AppModule, appStore).setMarketTokenBalance(Number(balanceInWei))
  }

  public static async getEtherTokenBalance(appStore: Store<any>): Promise<void> {
    const balanceInWei = await EtherTokenContractModule.balanceOf(
      ethereum.selectedAddress,
      ethereum.selectedAddress,
      getModule(AppModule, appStore).web3)

    getModule(AppModule, appStore).setEtherTokenBalance(Number(balanceInWei))
  }

  public static weiToEther(wei: number|BigNumber, web3: Web3): string {
    if (!!!web3.utils) {
      return '0'
    }
    let big: BigNumber
    if (BigNumber.isBigNumber(wei)) {
      big = wei
    } else {
      big = new BigNumber(wei.toFixed(0))
    }
    const s = big.toFormat(0).replace(/,/g, '')
    return web3.utils.fromWei(s)
  }

  public static getCurrentNetwork(): EthereumNetwork {
    if (!!!ethereum) {
      return EthereumNetwork.Unknown
    }

    const index = Number(ethereum.networkVersion)
    const key = EthereumNetwork[index] as keyof typeof EthereumNetwork
    if (!!!key) {
      return EthereumNetwork.Unknown
    }
    return EthereumNetwork[key]
  }

  public static async getLastBlock(appModule: AppModule): Promise<number> {
    const lastBlock = await appModule.web3.eth.getBlockNumber()
    if (lastBlock) {
      appModule.setLastBlock(lastBlock)
      return lastBlock
    }
    return 0
  }

  public static isSameChecksum(
    address1: string,
    address2: string,
    store: Store<any>): boolean {

    const web3 = getModule(AppModule, store).web3
    const checksum1 = web3.utils.toChecksumAddress(address1)
    const checksum2 = web3.utils.toChecksumAddress(address2)

    return checksum1 === checksum2
  }
}
