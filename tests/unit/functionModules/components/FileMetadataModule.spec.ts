import { getModule } from 'vuex-module-decorators'
import FileMetadataModule from '../../../../src/functionModules/components/FileMetadataModule'
import AppModule from '../../../../src/vuexModules/AppModule'
import NewListingModule from '../../../../src/vuexModules/NewListingModule'
import UploadModule from '../../../../src/vuexModules/UploadModule'
import appStore from '../../../../src/store'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'

describe('FileMetadataModule.ts', () => {

  let appModule!: AppModule
  let newListingModule!: NewListingModule
  let uploadModule!: UploadModule

  const title = 'title'
  const emptyTitle = ''
  const description = 'description'
  const emptyDescription = ''
  const anotherEmptyTitle = ' '
  const provider = 'http://localhost:8545'

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3(provider)
    newListingModule = getModule(NewListingModule, appStore)
    uploadModule = getModule(UploadModule, appStore)
 })

  describe('titleDescriptionChanged()', () => {

    it('correctly sets ready state', () => {

      expect(uploadModule.title).toEqual('')
      expect(newListingModule.listing.title).toEqual('')
      expect(newListingModule.status).toEqual(ProcessStatus.NotReady)

      FileMetadataModule.titleDescriptionChanged(title, description, appStore)

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

      FileMetadataModule.titleDescriptionChanged(emptyTitle, description, appStore)

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

      FileMetadataModule.titleDescriptionChanged(title, emptyDescription, appStore)

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

      FileMetadataModule.titleDescriptionChanged(anotherEmptyTitle, description, appStore)

      expect(uploadModule.title).toEqual(anotherEmptyTitle)
      expect(newListingModule.listing.title).toEqual(title)
      expect(newListingModule.status).toEqual(ProcessStatus.NotReady)
    })
  })
})
