import { getModule } from 'vuex-module-decorators'
import FileListerModule from '../../../../src/functionModules/components/FileListerModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'
import UploadModule from '../../../../src/vuexModules/UploadModule'
import ListModule from '../../../../src/vuexModules/ListModule'
import appStore from '../../../../src/store'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'

describe('FileListerModule.ts', () => {
  let flashesModule!: FlashesModule
  let listModule!: ListModule
  let uploadModule!: UploadModule


  beforeAll(() => {
    flashesModule = getModule(FlashesModule, appStore)
    listModule = getModule(ListModule, appStore)
    uploadModule = getModule(UploadModule, appStore)
 })

  describe('success()', () => {
    it('correctly processes success response and set proper states', () => {

      expect(flashesModule.flashes.length).toBe(0)
      expect(listModule.transactionHash).toEqual('')
      expect(listModule.percentComplete).toBe(0)
      expect(listModule.status).toEqual(ProcessStatus.NotReady)
      expect(uploadModule.status).toEqual(ProcessStatus.NotReady)

      FileListerModule.success({result: '0xwhatever'})

      expect(flashesModule.flashes.length).toBe(1)
      expect(listModule.transactionHash).toEqual('0xwhatever')
      expect(listModule.percentComplete).toBe(100)
      expect(listModule.status).toEqual(ProcessStatus.Complete)
      expect(uploadModule.status).toEqual(ProcessStatus.Ready)
    })
  })
})
