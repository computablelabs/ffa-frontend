import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
import FfaLIstingsModule from '../../vuexModules/FfaListingsModule'

import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import FfaListing from '../../models/FfaListing'
import { FfaListingStatus } from '../../models/FfaListing'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'

export default class FfaLIstingsComponentModule {

  public static async fetchListingsForStatus(
    status: FfaListingStatus,
    appStore: Store<any>,
    reset?: boolean) {

    const appModule = getModule(AppModule, appStore)
    const ffaListingsModule = getModule(FfaListingsModule, appStore)

    const shouldReset = !!reset && reset! === true

    let resetter: (lastBlock: number) => void
    let fetcher: () => Promise<void>

    switch (status) {
      case FfaListingStatus.listed:
        resetter = ffaListingsModule.resetListed
        fetcher = ffaListingsModule.fetchNextListed
        break
      case FfaListingStatus.candidate:
        resetter = ffaListingsModule.resetCandidates
        fetcher = ffaListingsModule.fetchNextCandidates
        break
      default:
        return
    }

    if (!resetter || !fetcher) {
      return
    }

    if (shouldReset) {
      await EthereumModule.getLastBlock(appModule)
      resetter(appModule.lastBlock)
    }

    await fetcher()
  }
}
