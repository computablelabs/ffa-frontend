import { getModule } from 'vuex-module-decorators'
import ListModule from '../../vuexModules/ListModule'
import UploadModule from '../../vuexModules/UploadModule'
import store from '../../store'

import { ProcessStatus } from '../../models/ProcessStatus'

export default class FileMetadataModule {

  public static titleChanged(title: string) {

    const listModule = getModule(ListModule, store)
    const uploadModule = getModule(UploadModule, store)

    uploadModule.setTitle(title)

    if (title.trim().length > 0) {
      listModule.prepare(uploadModule.ffaListing)
      listModule.setStatus(ProcessStatus.Ready)
    } else {
      listModule.setStatus(ProcessStatus.NotReady)
    }
  }
}
