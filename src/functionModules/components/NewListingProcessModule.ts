import { getModule } from 'vuex-module-decorators'
import Router, { Location } from 'vue-router'
import { Store } from 'vuex'

import NewListingModule from '../../vuexModules/NewListingModule'
import UploadModule from '../../vuexModules/UploadModule'

import { ProcessStatus } from '../../models/ProcessStatus'

export default class NewListingProcessModule {

  public static getDoneRedirect(router: Router, appStore: Store<any>): Location|null {

    const listingStatus = getModule(NewListingModule, appStore).status
    const datatrustStatus = getModule(UploadModule, appStore).datatrustStatus

    if (listingStatus !== ProcessStatus.Complete ||
      datatrustStatus !== ProcessStatus.Complete) {
      return null
    }
    const resolved = router.resolve({
      name: 'singleCandidateCreated',
      params: {
        listingHash: getModule(UploadModule, appStore).hash,
      },
    })
    return resolved.location
  }
}
