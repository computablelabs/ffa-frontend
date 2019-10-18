import { call } from '@computable/computablejs/dist/helpers'
import EtherTokenContract from '@computable/computablejs/dist/contracts/ether-token'

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import MetamaskModule from '../metamask/MetamaskModule'
import Web3Module from '../../vuexModules/Web3Module'
import ContractAddresses from '../../models/ContractAddresses'

import { Errors } from '../../util/Constants'

import Web3 from 'web3'

// TODO: remove imports when deposit() is fixed
import { Transaction } from '../../global'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

export default class EtherTokenContractModule {

  public static async getEtherTokenContract(account: string, web3: Web3): Promise<EtherTokenContract> {
    const contract = new EtherTokenContract(account)
    const initialized = await contract.at(web3, ContractAddresses.EtherTokenAddress)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return contract
  }

  public static async allowance(
    account: string,
    contractAddress: string,
    web3: Web3) {

    const contract = await EtherTokenContractModule.getEtherTokenContract(account, web3)
    const method = await contract.allowance(account, contractAddress)
    return await call(method)
  }

  public static async approve(
    account: string,
    contractAddress: string,
    amount: number,
    processId: string,
    appStore: Store<any>) {

    const contract = await EtherTokenContractModule.getEtherTokenContract(
      account,
      getModule(Web3Module, appStore).web3)
    const method = await contract.approve(contractAddress, amount)
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.EtherTokenAddress, processId, appStore)
  }

  public static async balanceOf(
    account: string,
    web3: Web3): Promise<string> {

    const contract = await EtherTokenContractModule.getEtherTokenContract(account, web3)
    const method = await contract.balanceOf(account)
    return await call(method)
  }

  public static async increaseApproval(
    account: string,
    contractAddress: string,
    amount: number,
    processId: string,
    appStore: Store<any>) {

    const contract = await EtherTokenContractModule.getEtherTokenContract(
      account,
      getModule(Web3Module, appStore).web3)
    const method = await contract.increaseApproval(contractAddress, amount)
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.EtherTokenAddress, processId, appStore)
  }

  public static async decreaseApproval(
    account: string,
    contractAddress: string,
    amount: number,
    processId: string,
    appStore: Store<any>) {

    const contract = await EtherTokenContractModule.getEtherTokenContract(
      account,
      getModule(Web3Module, appStore).web3)
    const method = await contract.decreaseApproval(contractAddress, amount)
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.EtherTokenAddress, processId, appStore)
  }

  // TODO: fix this when the computable.js is updated
  public static async deposit(
    account: string,
    amount: number,
    processId: string,
    appStore: Store<any>) {

    const contract = await EtherTokenContractModule.getEtherTokenContract(
      account,
      getModule(Web3Module, appStore).web3)
    const method: [Transaction, TransactOpts] = [
      await contract.deployed!.methods.deposit.call(amount),
      contract.assignTransactOpts({gas: contract.getGas('deposit'), value: amount}, {}),
    ]
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.EtherTokenAddress, processId, appStore)
  }

  public static async withdraw(
    account: string,
    amount: number,
    processId: string,
    appStore: Store<any>) {

    const contract = await EtherTokenContractModule.getEtherTokenContract(
      account,
      getModule(Web3Module, appStore).web3)
    const hex =  getModule(Web3Module, appStore).web3.utils.toHex(amount)
    const method = await contract.withdraw(hex)
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.EtherTokenAddress, processId, appStore)
  }
}
