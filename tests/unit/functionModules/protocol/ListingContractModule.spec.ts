import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import Servers from '../../../../src/util/Servers'
import Web3 from 'web3'

describe('ListingContractModule.ts', () => {

  const web3 = new Web3('http://localhost:8545/')

  // const web3Module = getModule(Web3Module, appStore)
  // web3Module.initialize(Servers.SkynetJsonRpc)

  it('correctly returns Listing HOC', async () => {
    const listing = await ListingContractModule.getListingContract('account', web3)
    expect(listing).not.toBeNull()
    expect(listing.list).not.toBeNull()
    // const listings =
    //   await ListingContractModule.getAllListingsForAccount('0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048', appStore)
    // const listingHashes = listings.map((l) => l.returnValues.hash)
    // console.log(listingHashes)
  })
})
