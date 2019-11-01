import { getModule } from 'vuex-module-decorators'
import { Store } from 'vuex'
import FlashesModule from '../../vuexModules/FlashesModule'
import AppModule from '../../vuexModules/AppModule'

import MetamaskModule from '../metamask/MetamaskModule'
import ParameterizerContractModule from '../protocol/ParameterizerContractModule'
import MarketTokenContractModule from '../protocol/MarketTokenContractModule'
import EtherTokenContractModule from '../protocol/EtherTokenContractModule'
import ReserveContractModule from '../protocol/ReserveContractModule'
import CoinbaseModule from '../ethereum/CoinbaseModule'

import ContractsAddresses from '../../models/ContractAddresses'

import Servers from '../../util/Servers'

import BigNumber from 'bignumber.js'
import Web3 from 'web3'

export default class EthereumModule {

  public static async setEthereum(
    requiresWeb3: boolean,
    requiresMetamask: boolean,
    requiresParameters: boolean,
    appStore: Store<any>) {

    const appModule = getModule(AppModule, appStore)

    if (!requiresWeb3 && !requiresMetamask && !requiresParameters) {
      appModule.setAppReady(true)
      return
    }

    if (requiresMetamask || requiresParameters) {

      let ethereumEnabled = EthereumModule.isMetamaskConnected(appModule)
      let parametersSet = true

      appModule.initializeWeb3(Servers.SkynetJsonRpc)

      if (!ethereumEnabled) {
        ethereumEnabled = await MetamaskModule.enableEthereum(appStore)
      }

      if (requiresParameters && !appModule.areParametersSet) {
        parametersSet = false
        await Promise.all([
          EthereumModule.setParameters(appStore),
          EthereumModule.setEthereumPrice(appStore),
        ])
        parametersSet = appModule.areParametersSet
      }

      appModule.setAppReady(EthereumModule.isWeb3Defined(appModule) && ethereumEnabled && parametersSet)
      return
    }

    if (requiresWeb3) {
      if (!EthereumModule.isWeb3Defined(appModule)) {
        appModule.initializeWeb3(Servers.SkynetJsonRpc)
      }
      appModule.setAppReady(EthereumModule.isWeb3Defined(appModule))
      return
    }
  }

  public static isMetamaskConnected(appModule: AppModule): boolean {
    return !EthereumModule.ethereumDisabled() && EthereumModule.isWeb3Defined(appModule)
  }

  public static isWeb3Defined(appModule: AppModule): boolean {
    return !!appModule.web3.eth
  }

  public static ethereumDisabled(): boolean {
    return !!!ethereum || !!!ethereum.selectedAddress || typeof ethereum.selectedAddress !== 'string'
  }

  public static async setParameters(appStore: Store<any>) {

    const appModule = getModule(AppModule, appStore)

    const [
      [makerPayment, costPerByte, stake, priceFloor, plurality, voteBy ],
      etherTokenBalanceInWei,
      marketTokenBalance,
      datatrustContractAllowance,
      supportPrice,
      walletBalanceInWei,
    ] = await Promise.all([
          ParameterizerContractModule.getParameters(appModule.web3),

          EtherTokenContractModule.balanceOf(
            ethereum.selectedAddress,
            appModule.web3),

          MarketTokenContractModule.balanceOf(
            ethereum.selectedAddress,
            appModule.web3),

          EtherTokenContractModule.allowance(
            ethereum.selectedAddress,
            ContractsAddresses.DatatrustAddress,
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
    appModule.setVoteBy(Number(voteBy))
    appModule.setEtherTokenBalance(Number(etherTokenBalanceInWei))
    appModule.setMarketTokenBalance(Number(marketTokenBalance))
    appModule.setDatatrustContractAllowance(Number(datatrustContractAllowance))
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

  public static async getContractAllowance(contractAddress: string, appStore: Store<any>): Promise<void> {

    const allowance = await EtherTokenContractModule.allowance(
      ethereum.selectedAddress,
      contractAddress,
      getModule(AppModule, appStore).web3,
    )

    const appModule = getModule(AppModule, appStore)
    const allowanceValue = Number(allowance)
    switch (contractAddress) {

      case ContractsAddresses.MarketTokenAddress:
        return appModule.setMarketTokenContractAllowance(allowanceValue)

      case ContractsAddresses.EtherTokenAddress:
        return appModule.setEtherTokenContractAllowance(allowanceValue)

      case ContractsAddresses.ReserveAddress:
        return appModule.setReserveContractAllowance(allowanceValue)

      case ContractsAddresses.DatatrustAddress:
        return appModule.setReserveContractAllowance(allowanceValue)

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
      console.log('########################')
      console.log(`wei: ${wei}`)
      big = new BigNumber(wei.toFixed(0))
      console.log(`big: ${big}`)
    }
    const bn = web3.utils.toBN(big)
    console.log(`bn: ${bn}`)
    return web3.utils.fromWei(bn)
  }
}
