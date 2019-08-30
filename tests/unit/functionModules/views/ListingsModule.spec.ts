import ListingsModule from '../../../../src/functionModules/views/ListingsModule'
import RouterTabMapping from '../../../../src/models/RouterTabMapping'
import { FfaListingStatus } from '../../../../src/models/FfaListing'
import { Labels } from '../../../../src/util/Constants'

describe('ListingsModule', () => {
  // let listingsModule!: ListingsModule

  const testKey: string = 'testKey'
  const testValue: string = 'testinput'

  let routerTabMapping!: RouterTabMapping[]

  describe('routerTabMapping()', () => {
    it('correctly generates non user route mappings', () => {
      const walletAddress = undefined
      routerTabMapping = ListingsModule.routerTabMapping(walletAddress)
      expect(!!routerTabMapping).toBeTruthy()
      expect(routerTabMapping.length).toBe(3)
      expect(routerTabMapping[0].route).toEqual('/listing/all')
      expect(routerTabMapping[0].label).toEqual(Labels.ALL)
      expect(routerTabMapping[1].route).toEqual('/listing/candidates')
      expect(routerTabMapping[1].label).toEqual(Labels.CANDIDATES)
      expect(routerTabMapping[2].route).toEqual('/listing/listed')
      expect(routerTabMapping[2].label).toEqual(Labels.LISTED)
    })

    it('correctly generates user route mappings', () => {
      const walletAddress = '0xwallet'
      routerTabMapping = ListingsModule.routerTabMapping(walletAddress)
      expect(!!routerTabMapping).toBeTruthy()
      expect(routerTabMapping.length).toBe(3)
      expect(routerTabMapping[0].route).toEqual('/users/0xwallet/listing/all')
      expect(routerTabMapping[0].label).toEqual(Labels.ALL)
      expect(routerTabMapping[1].route).toEqual('/users/0xwallet/listing/candidates')
      expect(routerTabMapping[1].label).toEqual(Labels.CANDIDATES)
      expect(routerTabMapping[2].route).toEqual('/users/0xwallet/listing/listed')
      expect(routerTabMapping[2].label).toEqual(Labels.LISTED)
    })
  })

  describe('selectedTab()', () => {
    it('correctly returns selected tab', () => {
      const walletAddress = '0xwallet'
      routerTabMapping = ListingsModule.routerTabMapping(walletAddress)
      let tab = ListingsModule.selectedTab(routerTabMapping, FfaListingStatus.candidate)
      expect(tab).toEqual(Labels.CANDIDATES)
      tab = ListingsModule.selectedTab(routerTabMapping, FfaListingStatus.listed)
      expect(tab).toEqual(Labels.LISTED)
      tab = ListingsModule.selectedTab(routerTabMapping, FfaListingStatus.new)
      expect(tab).toEqual(Labels.ALL)
      tab = ListingsModule.selectedTab(routerTabMapping, undefined)
      expect(tab).toEqual(Labels.ALL)
    })
  })
})
