import { getModule } from 'vuex-module-decorators'
import { Store } from 'vuex'
import AppModule from '../../vuexModules/AppModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

export default class SharedModule {

  public static isReady(requiresParameters: boolean, store: Store<any>): boolean {
    const appModule = getModule(AppModule, store)

    if (!requiresParameters || (requiresParameters && appModule.areParametersSet)) {
      return true
    }

    return false
  }

  public static isAuthenticated(store: Store<any>): boolean {
    const appModule = getModule(AppModule, store)

    const metamaskInstalled = !!ethereum && !!ethereum.isMetaMask
    const datatrustAuthorized = appModule.hasJwt
    const metamaskConnected = EthereumModule.isMetamaskConnected(appModule)

    return metamaskInstalled && metamaskConnected && datatrustAuthorized
  }
}
