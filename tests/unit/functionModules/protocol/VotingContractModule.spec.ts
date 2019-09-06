import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'
import Web3 from 'web3'

describe('VotingContractModule.ts', () => {

  const web3 = new Web3('http://localhost:8545/')

  it('correctly returns Voting HOC', async () => {
    const voting = await VotingContractModule.getVoting('account', web3)
    expect(voting).not.toBeNull()
    expect(voting.vote).not.toBeNull()
  })
})
