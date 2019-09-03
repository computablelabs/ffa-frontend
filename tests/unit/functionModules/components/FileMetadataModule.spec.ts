import { getModule } from 'vuex-module-decorators'
import FileMetadataModule from '../../../../src/functionModules/components/FileMetadataModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import NewListingModule from '../../../../src/vuexModules/NewListingModule'
import UploadModule from '../../../../src/vuexModules/UploadModule'
import appStore from '../../../../src/store'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import Web3 from 'web3'

describe('FileMetadataModule.ts', () => {

  let web3Module!: Web3Module
  let newListingModule!: NewListingModule
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
    newListingModule = getModule(NewListingModule, appStore)
    uploadModule = getModule(UploadModule, appStore)
 })

  describe('titleDescriptionChanged()', () => {

    it('correctly sets ready state', () => {

      expect(uploadModule.title).toEqual('')
      expect(newListingModule.listing.title).toEqual('')
      expect(newListingModule.status).toEqual(ProcessStatus.NotReady)

      FileMetadataModule.titleDescriptionChanged(title, description, newListingModule, uploadModule)

      expect(uploadModule.title).toEqual(title)
      expect(newListingModule.listing.title).toEqual(title)
      expect(newListingModule.status).toEqual(ProcessStatus.Ready)
    })

    it ('correctly set state for empty titles', () => {

      uploadModule.setTitle(title)
      newListingModule.setStatus(ProcessStatus.Ready)
      newListingModule.prepare(uploadModule.ffaListing)

      expect(uploadModule.title).toEqual(title)
      expect(newListingModule.listing.title).toEqual(title)
      expect(newListingModule.status).toEqual(ProcessStatus.Ready)

      FileMetadataModule.titleDescriptionChanged(emptyTitle, description, newListingModule, uploadModule)

      expect(uploadModule.title).toEqual(emptyTitle)
      expect(newListingModule.listing.title).toEqual(title)
      expect(newListingModule.listing.description).toEqual(description)
      expect(newListingModule.status).toEqual(ProcessStatus.NotReady)
    })

    it ('correctly set state for empty description', () => {

      uploadModule.setTitle(title)
      newListingModule.setStatus(ProcessStatus.Ready)
      newListingModule.prepare(uploadModule.ffaListing)

      expect(uploadModule.title).toEqual(title)
      expect(newListingModule.listing.title).toEqual(title)
      expect(newListingModule.status).toEqual(ProcessStatus.Ready)

      FileMetadataModule.titleDescriptionChanged(title, emptyDescription, newListingModule, uploadModule)

      expect(uploadModule.title).toEqual(title)
      expect(uploadModule.description).toEqual(emptyDescription)
      expect(newListingModule.listing.title).toEqual(title)
      expect(newListingModule.listing.description).toEqual(description)
      expect(newListingModule.status).toEqual(ProcessStatus.NotReady)
    })

    it ('correctly set state for trim to empty titles', () => {

      uploadModule.setTitle(title)
      newListingModule.setStatus(ProcessStatus.Ready)
      newListingModule.prepare(uploadModule.ffaListing)

      expect(uploadModule.title).toEqual(title)
      expect(newListingModule.listing.title).toEqual(title)
      expect(newListingModule.status).toEqual(ProcessStatus.Ready)

      FileMetadataModule.titleDescriptionChanged(anotherEmptyTitle, description, newListingModule, uploadModule)

      expect(uploadModule.title).toEqual(anotherEmptyTitle)
      expect(newListingModule.listing.title).toEqual(title)
      expect(newListingModule.status).toEqual(ProcessStatus.NotReady)
    })
  })
})
