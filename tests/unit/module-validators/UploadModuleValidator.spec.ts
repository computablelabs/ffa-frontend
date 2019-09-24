import UploadModuleValidator from '../../../src/vuexModules/validators/UploadModuleValidator'
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import UploadModule from '../../../src/vuexModules/UploadModule'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'
import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'

describe('UploadModuleValidator.ts', () => {

  const uploadModule = getModule(UploadModule, appStore)
  const listingsModule = getModule(FfaListingsModule, appStore)

  beforeAll(() => {
    listingsModule.addCandidate(
      new FfaListing(
        'title',
        'description',
        'type',
        '0x123',
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
        '0x345',
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
