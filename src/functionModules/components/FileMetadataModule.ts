import { getModule } from 'vuex-module-decorators'
import { Store } from 'vuex'
import NewListingModule from '../../vuexModules/NewListingModule'
import UploadModule from '../../vuexModules/UploadModule'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'

import { ProcessStatus } from '../../models/ProcessStatus'

export default class FileMetadataModule {

  public static titleDescriptionChanged(
    title: string,
    description: string,
    appStore: Store<any>) {

    const uploadModule = getModule(UploadModule, appStore)
    const newListingModule = getModule(NewListingModule, appStore)

    if (uploadModule.title !== title) {
      uploadModule.setTitle(title)
    }

    if (uploadModule.description !== description) {
      uploadModule.setDescription(description)
    }

    if (uploadModule.title.trim().length > 0 && uploadModule.description.trim().length > 0) {
      newListingModule.prepare(uploadModule.ffaListing)
      newListingModule.setStatus(ProcessStatus.Ready)
    } else {
      newListingModule.setStatus(ProcessStatus.NotReady)
    }
  }
}
