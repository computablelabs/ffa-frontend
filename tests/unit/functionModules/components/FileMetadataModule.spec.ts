import { getModule } from 'vuex-module-decorators'
import FileMetadataModule from '../../../../src/functionModules/components/FileMetadataModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import ListModule from '../../../../src/vuexModules/ListModule'
import UploadModule from '../../../../src/vuexModules/UploadModule'
import appStore from '../../../../src/store'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import Web3 from 'web3'

describe('FileMetadataModule.ts', () => {

  let web3Module!: Web3Module
  let listModule!: ListModule
  let uploadModule!: UploadModule

  const title = 'title'
  const emptyTitle = ''
  const description = 'description'
  const emptyDescription = ''
  const anotherEmptyTitle = ' '
  const provider = 'http://localhost:8545'

  beforeAll(() => {
    web3Module = getModule(Web3Module, appStore)
    web3Module.initialize(provider)
    listModule = getModule(ListModule, appStore)
    uploadModule = getModule(UploadModule, appStore)
 })

  describe('titleDescriptionChanged()', () => {

    it('correctly sets ready state', () => {

      expect(uploadModule.title).toEqual('')
      expect(listModule.listing.title).toEqual('')
      expect(listModule.status).toEqual(ProcessStatus.NotReady)

      FileMetadataModule.titleDescriptionChanged(title, description, listModule, uploadModule)

      expect(uploadModule.title).toEqual(title)
      expect(listModule.listing.title).toEqual(title)
      expect(listModule.status).toEqual(ProcessStatus.Ready)
    })

    it ('correctly set state for empty titles', () => {

      uploadModule.setTitle(title)
      listModule.setStatus(ProcessStatus.Ready)
      listModule.prepare(uploadModule.ffaListing)

      expect(uploadModule.title).toEqual(title)
      expect(listModule.listing.title).toEqual(title)
      expect(listModule.status).toEqual(ProcessStatus.Ready)

      FileMetadataModule.titleDescriptionChanged(emptyTitle, description, listModule, uploadModule)

      expect(uploadModule.title).toEqual(emptyTitle)
      expect(listModule.listing.title).toEqual(title)
      expect(listModule.listing.description).toEqual(description)
      expect(listModule.status).toEqual(ProcessStatus.NotReady)
    })

    it ('correctly set state for empty description', () => {

      uploadModule.setTitle(title)
      listModule.setStatus(ProcessStatus.Ready)
      listModule.prepare(uploadModule.ffaListing)

      expect(uploadModule.title).toEqual(title)
      expect(listModule.listing.title).toEqual(title)
      expect(listModule.status).toEqual(ProcessStatus.Ready)

      FileMetadataModule.titleDescriptionChanged(title, emptyDescription, listModule, uploadModule)

      expect(uploadModule.title).toEqual(title)
      expect(uploadModule.description).toEqual(emptyDescription)
      expect(listModule.listing.title).toEqual(title)
      expect(listModule.listing.description).toEqual(description)
      expect(listModule.status).toEqual(ProcessStatus.NotReady)
    })

    it ('correctly set state for trim to empty titles', () => {

      uploadModule.setTitle(title)
      listModule.setStatus(ProcessStatus.Ready)
      listModule.prepare(uploadModule.ffaListing)

      expect(uploadModule.title).toEqual(title)
      expect(listModule.listing.title).toEqual(title)
      expect(listModule.status).toEqual(ProcessStatus.Ready)

      FileMetadataModule.titleDescriptionChanged(anotherEmptyTitle, description, listModule, uploadModule)

      expect(uploadModule.title).toEqual(anotherEmptyTitle)
      expect(listModule.listing.title).toEqual(title)
      expect(listModule.status).toEqual(ProcessStatus.NotReady)
    })
  })
})
