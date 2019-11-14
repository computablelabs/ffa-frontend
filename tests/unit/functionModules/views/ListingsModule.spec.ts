import ListingsModule from '../../../../src/functionModules/views/ListingsModule'
import RouterTabMapping from '../../../../src/models/RouterTabMapping'
import { FfaListingStatus } from '../../../../src/models/FfaListing'
import { Labels } from '../../../../src/util/Constants'

describe('ListingsModule', () => {

  let routerTabMapping!: RouterTabMapping[]

  describe('routerTabMapping()', () => {
    it('correctly generates non user route mappings', () => {
      const walletAddress = undefined
      routerTabMapping = ListingsModule.routerTabMapping(walletAddress)
      expect(!!routerTabMapping).toBeTruthy()
      expect(routerTabMapping.length).toBe(2)
      // expect(routerTabMapping[0].route.name).toEqual('allListings')
      // expect(routerTabMapping[0].route.params.walletAddress).toBeUndefined()
      // expect(routerTabMapping[0].label).toEqual(Labels.ALL)
      expect(routerTabMapping[0].route.name).toEqual('listedListings')
      expect(routerTabMapping[0].route.params.walletAddress).toBeUndefined()
      expect(routerTabMapping[0].label).toEqual(Labels.LISTED)
      expect(routerTabMapping[1].route.name).toEqual('candidatesListings')
      expect(routerTabMapping[1].route.params.walletAddress).toBeUndefined()
      expect(routerTabMapping[1].label).toEqual(Labels.CANDIDATES)
    })

    it('correctly generates user route mappings', () => {
      const walletAddress = '0xwallet'
      routerTabMapping = ListingsModule.routerTabMapping(walletAddress)
      expect(!!routerTabMapping).toBeTruthy()
      expect(routerTabMapping.length).toBe(2)
      // expect(routerTabMapping[0].route.name).toEqual('userAllListings')
      // expect(routerTabMapping[0].route.params.walletAddress).toEqual(walletAddress)
      // expect(routerTabMapping[0].label).toEqual(Labels.ALL)
      expect(routerTabMapping[0].route.name).toEqual('userListed')
      expect(routerTabMapping[0].route.params.walletAddress).toEqual(walletAddress)
      expect(routerTabMapping[0].label).toEqual(Labels.LISTED)
      expect(routerTabMapping[1].route.name).toEqual('userCandidates')
      expect(routerTabMapping[1].route.params.walletAddress).toEqual(walletAddress)
      expect(routerTabMapping[1].label).toEqual(Labels.CANDIDATES)
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
