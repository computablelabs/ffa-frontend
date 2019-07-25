import TitleFieldValidator from '../../../src/modules/validators/TitleFieldValidator'
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../../src/modules/FfaListingsModule'
import FfaListing from '../../../src/models/FfaListing'

describe('TitleFieldValidator.ts', () => {

  const listingsModule = getModule(FfaListingsModule, appStore)

  beforeAll(() => {
    listingsModule.addUpload(new FfaListing('title', 'description', 'type', 'hash', 'md5', []))
    listingsModule.addUpload(new FfaListing('another title', 'description', 'type', 'hash', 'md5', []))
  })

  it('correctly returns validates title', () => {
    let validator = new TitleFieldValidator('title', '', appStore)
    expect(validator.validate().valid).toBeTruthy()
    validator = new TitleFieldValidator('title', 'nottitle', appStore)
    expect(validator.validate().valid).toBeTruthy()
    validator = new TitleFieldValidator('title', 'title', appStore)
    expect(validator.validate().valid).toBeFalsy()
    validator = new TitleFieldValidator('title', 'another title', appStore)
    expect(validator.validate().valid).toBeFalsy()
  })
})
