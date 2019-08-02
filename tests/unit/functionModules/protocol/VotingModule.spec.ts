import VotingModule from '../../../../src/functionModules/protocol/VotingModule'
import Web3 from 'web3'

describe('VotingModule.ts', () => {

  const web3 = new Web3('http://localhost:8545/')

  it('correctly returns Voting HOC', async () => {
    const voting = await VotingModule.getVoting('account', web3)
    expect(voting).not.toBeNull()
    expect(voting.vote).not.toBeNull()
  })
})
