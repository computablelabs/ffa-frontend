import { getModule } from 'vuex-module-decorators'
import { Store } from 'vuex'
import AppModule from '../../vuexModules/AppModule'
import Web3Module from '../../vuexModules/Web3Module'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

export default class SharedModule {

  public static isReady(
    requiresWeb3: boolean,
    requiresMetamask: boolean,
    requiresParameters: boolean,
    appStore: Store<any>): boolean {

    if (!requiresWeb3 && !requiresMetamask && !requiresParameters) {
      return true
    }

    const web3Module = getModule(Web3Module, appStore)
    const appModule = getModule(AppModule, appStore)

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
