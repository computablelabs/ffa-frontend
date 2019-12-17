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

  public static isAuthenticated(): boolean {

    const metamaskInstalled = !!ethereum && !!ethereum.isMetaMask
    const datatrustAuthorized = document.cookie.split(';').filter((item) => item.trim().startsWith('jwt=')).length > 0
    // @ts-ignore
    const metamaskConnected = !!web3 && web3.currentProvider.isMetaMask

    return metamaskInstalled && metamaskConnected && datatrustAuthorized
  }
}
