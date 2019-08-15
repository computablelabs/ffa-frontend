import ListModule from '../../vuexModules/ListModule'
import UploadModule from '../../vuexModules/UploadModule'

import { ProcessStatus } from '../../models/ProcessStatus'

export default class FileMetadataModule {

  public static titleChanged(title: string, listModule: ListModule, uploadModule: UploadModule) {

    uploadModule.setTitle(title)

    if (title.trim().length > 0) {
      listModule.prepare(uploadModule.ffaListing)
      listModule.setStatus(ProcessStatus.Ready)
    } else {
      listModule.setStatus(ProcessStatus.NotReady)
    }
  }
}
