import FlashesModule from '../../vuexModules/FlashesModule'
import Web3Module from '../../vuexModules/Web3Module'
import AppModule from '../../vuexModules/AppModule'
import MetamaskModule from '../../functionModules/metamask/MetamaskModule'
import ParameterizerModule from '../../functionModules/protocol/ParameterizerModule'
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
      if (!EthereumModule.isMetamaskConnected(web3Module)) {
        await MetamaskModule.enableEthereum(flashesModule, web3Module)
      }
      if (requiresParameters && !appModule.areParametersSet) {
        await EthereumModule.setParameters(appModule, web3Module)
      }
      return appModule.setAppReady(true)
    }

    if (requiresWeb3) {
      if (!EthereumModule.isWeb3Defined(web3Module)) {
        web3Module.initialize(Servers.SkynetJsonRpc)
      }
      return appModule.setAppReady(true)
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

    const [ makerPayment,
            costPerByte,
            stake,
            priceFloor,
            plurality,
            voteBy ]: string[] = await ParameterizerModule.getParameters(web3Module)

    appModule.setMakerPayment(Number(makerPayment))
    appModule.setCostPerByte(Number(costPerByte))
    appModule.setStake(Number(stake))
    appModule.setPriceFloor(Number(priceFloor))
    appModule.setPlurality(Number(plurality))
    appModule.setVoteBy(Number(voteBy))
  }
}
