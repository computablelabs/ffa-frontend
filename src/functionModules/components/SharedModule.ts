import { getModule } from 'vuex-module-decorators'
import { Store } from 'vuex'
import AppModule from '../../vuexModules/AppModule'
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

    const appModule = getModule(AppModule, appStore)

    // if (requiresWeb3 && EthereumModule.isWeb3Defined(appModule)) {
    //   return true
    // }

    // if (requiresMetamask && EthereumModule.isMetamaskConnected(appModule)) {
    //   return true
    // }

    // if (requiresParameters && appModule.areParametersSet) {
    //   return true
    // }

    const isWeb3Defined = EthereumModule.isWeb3Defined(appModule)
    const isMetamaskConnected = EthereumModule.isMetamaskConnected(appModule)
    const areParametersSet = appModule.areParametersSet

    return isWeb3Defined && isMetamaskConnected && areParametersSet
  }
}
