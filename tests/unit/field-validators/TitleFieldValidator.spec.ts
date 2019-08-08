import TitleFieldValidator from '../../../src/vuexModules/validators/TitleFieldValidator'
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'
import FfaListing from '../../../src/models/FfaListing'

describe('TitleFieldValidator.ts', () => {

  const listingsModule = getModule(FfaListingsModule, appStore)

  beforeAll(() => {
    listingsModule.addCandidate(new FfaListing('title', 'description', 'type', 'hash', 'md5', []))
    listingsModule.addCandidate(new FfaListing('another title', 'description', 'type', 'hash', 'md5', []))
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
