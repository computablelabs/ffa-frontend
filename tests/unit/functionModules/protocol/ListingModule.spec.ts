import ListingModule from '../../../../src/functionModules/protocol/ListingContractModule'
import Web3 from 'web3'

describe('ListingModule.ts', () => {

  const web3 = new Web3('http://localhost:8545/')

  it('correctly returns Listing HOC', async () => {
    const listing = await ListingModule.getListing('account', web3)
    expect(listing).not.toBeNull()
    expect(listing.list).not.toBeNull()
  })
})
