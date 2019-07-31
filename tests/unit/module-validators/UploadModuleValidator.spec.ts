import UploadModuleValidator from '../../../src/modules/validators/UploadModuleValidator'
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import UploadModule from '../../../src/modules/UploadModule'
import FfaListingsModule from '../../../src/modules/FfaListingsModule'
import FfaListing from '../../../src/models/FfaListing'

describe('UploadModuleValidator.ts', () => {

  const uploadModule = getModule(UploadModule, appStore)
  const listingsModule = getModule(FfaListingsModule, appStore)

  beforeAll(() => {
    listingsModule.addCandidate(new FfaListing('title', 'description', 'type', 'hash', 'md5', []))
    listingsModule.addCandidate(new FfaListing('another title', 'description', 'type', 'hash', 'md5', []))
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
