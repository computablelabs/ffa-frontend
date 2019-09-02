import EthereumModule from '../../functionModules/ethereum/EthereumModule'
import AppModule from '../../vuexModules/AppModule'
import Web3Module from '../../vuexModules/Web3Module'

export default class SharedModule {

  public static isReady(requiresWeb3: boolean,
                        requiresMetamask: boolean,
                        requiresParameters: boolean,
                        appModule: AppModule,
                        web3Module: Web3Module): boolean {

    if (!requiresWeb3 && !requiresMetamask && !requiresParameters) {
      return true
    }

    if (requiresWeb3 && EthereumModule.isWeb3Defined(web3Module)) {
      return true
    }

    if (requiresMetamask && EthereumModule.isMetamaskConnected(web3Module)) {
      return true
    }

    if (requiresParameters && appModule.areParametersSet) {
      return true
    }

    return false
  }
}
