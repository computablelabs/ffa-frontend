import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import Servers from '../../../../src/util/Servers'
import Web3 from 'web3'

describe('ListingContractModule.ts', () => {

  const web3 = new Web3('http://localhost:8545/')


  it('correctly returns Listing HOC', async () => {
    const listing = await ListingContractModule.getListingContract('account', web3)
    expect(listing).not.toBeNull()
    expect(listing.list).not.toBeNull()
  })
})
