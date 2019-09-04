import FlashesModule from '../../vuexModules/FlashesModule'
import Web3Module from '../../vuexModules/Web3Module'
import AppModule from '../../vuexModules/AppModule'
import MetamaskModule from '../../functionModules/metamask/MetamaskModule'
import ParameterizerContractModule from '../protocol/ParameterizerContractModule'
import MarketTokenContractModule from '../protocol/MarketTokenContractModule'
import Servers from '../../util/Servers'

export default class EthereumModule {

  public static async setEthereum(requiresWeb3: boolean,
                                  requiresMetamask: boolean,
                                  requiresParameters: boolean,
                                  appModule: AppModule,
                                  web3Module: Web3Module,
                                  flashesModule: FlashesModule) {

    console.log(`${requiresWeb3} ${requiresMetamask} ${requiresParameters}`)
    if (!requiresWeb3 && !requiresMetamask && !requiresParameters) {
      return appModule.setAppReady(true)
    }

    if (requiresMetamask || requiresParameters) {
      let ethereumEnabled = false
      let parametersSet = true

      if (!EthereumModule.isMetamaskConnected(web3Module)) {
        ethereumEnabled = await MetamaskModule.enableEthereum(flashesModule, web3Module)
      }
      if (requiresParameters && !appModule.areParametersSet) {
        parametersSet = false
        await EthereumModule.setParameters(appModule, web3Module)
        parametersSet = appModule.areParametersSet
      }
      return appModule.setAppReady(ethereumEnabled && parametersSet)
    }

    if (requiresWeb3) {
      if (!EthereumModule.isWeb3Defined(web3Module)) {
        web3Module.initialize(Servers.SkynetJsonRpc)
      }
      return appModule.setAppReady(EthereumModule.isWeb3Defined(web3Module))
    }
  }

  public static isMetamaskConnected(web3Module: Web3Module): boolean {
    return !EthereumModule.ethereumDisabled() && EthereumModule.isWeb3Defined(web3Module)
  }

  public static isWeb3Defined(web3Module: Web3Module): boolean {
    return !!web3Module.web3.eth
  }

  public static ethereumDisabled(): boolean {
    return typeof ethereum === 'undefined' ||
      ethereum === null ||
      typeof ethereum.selectedAddress === 'undefined' ||
      ethereum.selectedAddress === null ||
      typeof ethereum.selectedAddress !== 'string' ||
      ethereum.selectedAddress.length <= 0
  }

  public static async setParameters(appModule: AppModule, web3Module: Web3Module) {

    const [
      [makerPayment, costPerByte, stake, priceFloor, plurality, voteBy ],
      marketTokenBalance,
    ] = await Promise.all([
        ParameterizerContractModule.getParameters(web3Module),
        MarketTokenContractModule.getBalance(ethereum.selectedAddress, web3Module, {}),
      ])

    appModule.setMakerPayment(Number(makerPayment))
    appModule.setCostPerByte(Number(costPerByte))
    appModule.setStake(Number(stake))
    appModule.setPriceFloor(Number(priceFloor))
    appModule.setPlurality(Number(plurality))
    appModule.setVoteBy(Number(voteBy))
    appModule.setMarketTokenBalance(Number(marketTokenBalance))
  }
}
