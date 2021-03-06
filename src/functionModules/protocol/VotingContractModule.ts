import { call } from '@computable/computablejs/dist/helpers'
import VotingContract from '@computable/computablejs/dist/contracts/voting'

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import ContractAddresses from '../../models/ContractAddresses'

import MetamaskModule from '../metamask/MetamaskModule'

import AppModule from '../../vuexModules/AppModule'

import { Errors } from '../../util/Constants'

import Web3 from 'web3'

export default class VotingContractModule {

  public static async getVoting(account: string, web3: Web3): Promise<VotingContract> {
    const voting = new VotingContract(account)
    const initialized = await voting.at(web3, ContractAddresses.VotingAddress!)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return voting
  }

  public static async vote(
    votesYes: boolean,
    listingHash: string,
    account: string,
    processId: string,
    appStore: Store<any>) {

    const voteVal = votesYes ? 1 : 0
    const voting = await VotingContractModule.getVoting(
      account,
      getModule(AppModule, appStore).web3)

    const method =  await voting.vote(listingHash, voteVal)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.VotingAddress!, processId, appStore)
  }

  public static async isCandidate(
    listingHash: string,
    account: string,
    web3: Web3): Promise<boolean> {

    const voting = await VotingContractModule.getVoting(account, web3)
    const method = await voting.isCandidate(listingHash)
    return await call(method)
  }

  public static async candidateIs(
    listingHash: string,
    kind: number,
    account: string,
    web3: Web3): Promise<boolean> {

    const voting = await VotingContractModule.getVoting(account, web3)
    const method = await voting.candidateIs(listingHash, kind)
    return await call(method)
  }

  public static async getCandidate(
    listingHash: string,
    account: string,
    web3: Web3): Promise<object> {

    const voting = await VotingContractModule.getVoting(account, web3)
    const method = await voting.getCandidate(listingHash)
    return await call(method)
  }

  public static async pollClosed(
    listingHash: string,
    account: string,
    web3: Web3): Promise<boolean> {

    const voting = await VotingContractModule.getVoting(account, web3)
    const method = await voting.pollClosed(listingHash)
    return await call(method)
  }

  // TODO: double check the type of the plurality param
  public static async didPass(
    listingHash: string,
    plurality: number,
    account: string,
    web3: Web3): Promise<boolean> {

    const voting = await VotingContractModule.getVoting(account, web3)
    const method = await voting.didPass(listingHash, plurality)
    return await call(method)
  }

  public static async getStake(
    listingHash: string,
    account: string,
    web3: Web3): Promise<number> {

    const voting = await VotingContractModule.getVoting(account, web3)
    const method = await voting.getStake(listingHash, account)
    return Number(await call(method))
  }

  public static async unstake(
    account: string,
    listingHash: string,
    processId: string,
    appStore: Store<any>): Promise<void>  {

      const voting = await VotingContractModule.getVoting(
        account,
        getModule(AppModule, appStore).web3)
      const method =  await voting.unstake(listingHash)

      MetamaskModule.buildAndSendTransaction(
        account, method, ContractAddresses.VotingAddress!, processId, appStore)
  }

}
