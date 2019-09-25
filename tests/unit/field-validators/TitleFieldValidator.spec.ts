import TitleFieldValidator from '../../../src/vuexModules/validators/TitleFieldValidator'
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../../src/vuexModules/FfaListingsModule'
import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'

describe('TitleFieldValidator.ts', () => {

  const listingsModule = getModule(FfaListingsModule, appStore)

  beforeAll(() => {
    listingsModule.addPending(
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
        FfaListingStatus.new,
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
