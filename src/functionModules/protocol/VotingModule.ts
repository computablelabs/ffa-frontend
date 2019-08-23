import ContractAddresses from '../../models/ContractAddresses'

import MetamaskModule from '../../functionModules/metamask/MetamaskModule'

import Web3Module from '../../vuexModules/Web3Module'
import FlashesModule from '../../vuexModules/FlashesModule'
import ListModule from '../../vuexModules/ListModule'
import UploadModule from '../../vuexModules/UploadModule'

import { buildTransaction, call } from '@computable/computablejs/dist/helpers'
import VotingContract from '@computable/computablejs/dist/contracts/voting'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import { Errors, ZERO_HASHED } from '../../util/Constants'

import Web3 from 'web3'

export default class VotingModule {

  public static async getVoting(account: string, web3: Web3): Promise<VotingContract> {
    const voting = new VotingContract(account)
    const initialized = await voting.at(web3, ContractAddresses.VotingAddress)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return voting
  }

  public static async vote(votesYes: boolean,
                           listingHash: string,
                           account: string,
                           web3Module: Web3Module,
                           flashesModule: FlashesModule,
                           listModule: ListModule,
                           uploadModule: UploadModule,
                           transactOpts: TransactOpts,
                           success: (response: any,
                                     flashesModule: FlashesModule,
                                     listModule: ListModule,
                                     uploadModule: UploadModule) => void) {

    const voteVal = votesYes ? 1 : 0
    const voting = await VotingModule.getVoting(account, web3Module.web3)
    const method =  await voting.vote(listingHash, voteVal, transactOpts)

    // method[0] can be used to estimate the gas vs the abi generated figures
    const est = await method[0].estimateGas({from: account})
    const unsigned = await buildTransaction(web3Module.web3, method)
    // build transaction adds `data` and `nonce` fields, but we still require `to` and `value`
    unsigned.to = ContractAddresses.ListingAddress
    unsigned.value = ZERO_HASHED
    // MM ignores any nonce, let's just remove it
    delete unsigned.nonce
    // take the larger of the two gas estimates to be safe
    if (est > unsigned.gas) {
      unsigned.gas = est
    }
    MetamaskModule.send(web3Module.web3, unsigned, flashesModule, listModule, uploadModule, success)
  }

  public static async isCandidate(listingHash: string,
                                  account: string,
                                  web3Module: Web3Module,
                                  transactOpts: TransactOpts): Promise<boolean> {

    const voting = await VotingModule.getVoting(account, web3Module.web3)
    const method = await voting.isCandidate(listingHash, transactOpts)
    return await call(method)
  }

  public static async pollClosed(listingHash: string,
                                 account: string,
                                 web3Module: Web3Module,
                                 transactOpts: TransactOpts): Promise<boolean> {

    const voting = await VotingModule.getVoting(account, web3Module.web3)
    const method = await voting.pollClosed(listingHash, transactOpts)
    return await call(method)
}

// TODO: double check the type of the plurality param
public static async didPass(listingHash: string,
                            plurality: number,
                            account: string,
                            web3Module: Web3Module,
                            transactOpts: TransactOpts): Promise<boolean> {

    const voting = await VotingModule.getVoting(account, web3Module.web3)
    const method = await voting.didPass(listingHash, plurality, transactOpts)
    return await call(method)
  }
}
