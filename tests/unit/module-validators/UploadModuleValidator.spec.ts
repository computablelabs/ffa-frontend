import UploadModuleValidator from '../../../src/vuexModules/validators/UploadModuleValidator'
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import UploadModule from '../../../src/vuexModules/UploadModule'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'
import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'

describe('UploadModuleValidator.ts', () => {

  const uploadModule = getModule(UploadModule, appStore)
  const listingsModule = getModule(FfaListingsModule, appStore)

  const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'
  const fakeRealAddress2 = '0x34a7C759e4BdfCcb196535c00873c9c5B5eD5e02'

  beforeAll(() => {
    listingsModule.addCandidate(
      new FfaListing(
        'title',
        'description',
        'type',
        fakeRealAddress,
        'md5',
        '0xwallet',
        27,
        '0xowner',
        [],
        FfaListingStatus.candidate,
        120620,
        50))
    listingsModule.addCandidate(
      new FfaListing(
        'another title',
        'description',
        'type',
        fakeRealAddress2,
        'md5',
        'MIT',
        27,
        '0xowner',
        [],
        FfaListingStatus.candidate,
        120620,
        50))
  })

  it('correctly returns validates title', () => {

    uploadModule.setTitle('')
    let state = appStore.state.uploadModule
    let validator = new UploadModuleValidator(state, appStore)
    expect(validator.validate().valid).toBeTruthy()

    uploadModule.setTitle('nottitle')
    state = appStore.state.uploadModule
    validator = new UploadModuleValidator(state, appStore)
    expect(validator.validate().valid).toBeTruthy()

    uploadModule.setTitle('title')
    state = appStore.state.uploadModule
    validator = new UploadModuleValidator(state, appStore)
    expect(validator.validate().valid).toBeFalsy()

    uploadModule.setTitle('another title')
    state = appStore.state.uploadModule
    validator = new UploadModuleValidator(state, appStore)
    expect(validator.validate().valid).toBeFalsy()
  })
})
