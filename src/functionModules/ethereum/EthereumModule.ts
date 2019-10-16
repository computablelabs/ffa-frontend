import { getModule } from 'vuex-module-decorators'
import { Store } from 'vuex'
import FlashesModule from '../../vuexModules/FlashesModule'
import Web3Module from '../../vuexModules/Web3Module'
import AppModule from '../../vuexModules/AppModule'

import MetamaskModule from '..//metamask/MetamaskModule'
import ParameterizerContractModule from '../protocol/ParameterizerContractModule'
import MarketTokenContractModule from '../protocol/MarketTokenContractModule'
import EtherTokenContractModule from '../protocol/EtherTokenContractModule'
import ReserveContractModule from '../protocol/ReserveContractModule'

import ContractsAddresses from '../../models/ContractAddresses'

import Servers from '../../util/Servers'

export default class EthereumModule {

  public static async setEthereum(
    requiresWeb3: boolean,
    requiresMetamask: boolean,
    requiresParameters: boolean,
    appStore: Store<any>) {

    const appModule = getModule(AppModule, appStore)
    const web3Module = getModule(Web3Module, appStore)
    const flashesModule = getModule(FlashesModule, appStore)

    console.log(`${requiresWeb3} ${requiresMetamask} ${requiresParameters}`)
    if (!requiresWeb3 && !requiresMetamask && !requiresParameters) {
      appModule.setAppReady(true)
      return
    }

    if (requiresMetamask || requiresParameters) {

      let ethereumEnabled = EthereumModule.isMetamaskConnected(web3Module)
      let parametersSet = true

      if (!ethereumEnabled) {
        ethereumEnabled = await MetamaskModule.enableEthereum(flashesModule, web3Module)
      }

      if (requiresParameters && !appModule.areParametersSet) {
        parametersSet = false
        await EthereumModule.setParameters(appStore)
        parametersSet = appModule.areParametersSet
      }

      appModule.setAppReady(ethereumEnabled && parametersSet)
      return
    }

    if (requiresWeb3) {
      if (!EthereumModule.isWeb3Defined(web3Module)) {
        web3Module.initialize(Servers.SkynetJsonRpc)
      }
      appModule.setAppReady(EthereumModule.isWeb3Defined(web3Module))
      return
    }
  }

  public static isMetamaskConnected(web3Module: Web3Module): boolean {
    return !EthereumModule.ethereumDisabled() && EthereumModule.isWeb3Defined(web3Module)
  }

  public static isWeb3Defined(web3Module: Web3Module): boolean {
    return !!web3Module.web3.eth
  }

  public static ethereumDisabled(): boolean {
    return !!!ethereum || !!!ethereum.selectedAddress || typeof ethereum.selectedAddress !== 'string'
  }

  public static async setParameters(appStore: Store<any>) {

    const appModule = getModule(AppModule, appStore)
    const web3Module = getModule(Web3Module, appStore)

    const [
      [makerPayment, costPerByte, stake, priceFloor, plurality, voteBy ],
      marketTokenBalance,
      datatrustContractAllowance,
      supportPrice,
    ] = await Promise.all([
          ParameterizerContractModule.getParameters(web3Module.web3),
          MarketTokenContractModule.getBalance(
            ethereum.selectedAddress,
            web3Module.web3),
          EtherTokenContractModule.allowance(
            ethereum.selectedAddress,
            ContractsAddresses.DatatrustAddress,
            web3Module.web3,
            ),
          ReserveContractModule.getSupportPrice(
            ethereum.selectedAddress,
            web3Module.web3),
        ])

    appModule.setMakerPayment(Number(makerPayment))
    appModule.setCostPerByte(Number(costPerByte))
    appModule.setStake(Number(stake))
    appModule.setPriceFloor(Number(priceFloor))
    appModule.setPlurality(Number(plurality))
    appModule.setVoteBy(Number(voteBy))
    appModule.setMarketTokenBalance(Number(marketTokenBalance))
    appModule.setDatatrustContractAllowance(Number(datatrustContractAllowance))
    appModule.setSupportPrice(Number(supportPrice))
  }
}
