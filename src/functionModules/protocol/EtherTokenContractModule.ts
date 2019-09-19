import { call } from '@computable/computablejs/dist/helpers'
import EtherTokenContract from '@computable/computablejs/dist/contracts/ether-token'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import MetamaskModule from '../metamask/MetamaskModule'
import Web3Module from '../../vuexModules/Web3Module'
import ContractAddresses from '../../models/ContractAddresses'

import { Errors } from '../../util/Constants'

import Web3 from 'web3'


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
    web3: Web3,
    transactOpts: TransactOpts) {

    const contract = await EtherTokenContractModule.getEtherTokenContract(account, web3)
    const method = await contract.allowance(account, contractAddress, transactOpts)
    return await call(method)
  }

  public static async approve(
    account: string,
    contractAddress: string,
    amount: number,
    appStore: Store<any>,
    success: (
      response: any,
      appStore: Store<any>) => void,
    transactOpts: TransactOpts) {

    const web3Module = getModule(Web3Module, appStore)
    const contract = await EtherTokenContractModule.getEtherTokenContract(account, web3Module.web3)
    const method = await contract.approve(contractAddress, amount, transactOpts)
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.EtherTokenAddress, appStore, success)
  }

  public static async balanceOf(
    account: string,
    contractAddress: string,
    web3: Web3,
    transactOpts: TransactOpts): Promise<boolean> {

    const contract = await EtherTokenContractModule.getEtherTokenContract(account, web3)
    const method = await contract.balanceOf(account, transactOpts)
    return await call(method)
  }


  public static async increaseApproval(
    account: string,
    contractAddress: string,
    amount: number,
    appStore: Store<any>,
    success: (
      response: any,
      appStore: Store<any>) => void,
    transactOpts: TransactOpts) {

    const web3Module = getModule(Web3Module, appStore)
    const contract = await EtherTokenContractModule.getEtherTokenContract(account, web3Module.web3)
    const method = await contract.increaseApproval(contractAddress, amount, transactOpts)
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.EtherTokenAddress, appStore, success)
  }

  public static async decreaseApproval(
    account: string,
    contractAddress: string,
    amount: number,
    appStore: Store<any>,
    success: (
      response: any,
      appStore: Store<any>) => void,
    transactOpts: TransactOpts) {

    const web3Module = getModule(Web3Module, appStore)
    const contract = await EtherTokenContractModule.getEtherTokenContract(account, web3Module.web3)
    const method = await contract.decreaseApproval(contractAddress, amount, transactOpts)
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.EtherTokenAddress, appStore, success)
  }

  public static async deposit(
    account: string,
    amount: number,
    appStore: Store<any>,
    success: (
      response: any,
      appStore: Store<any>) => void,
    transactOpts: TransactOpts) {

    const web3Module = getModule(Web3Module, appStore)
    const contract = await EtherTokenContractModule.getEtherTokenContract(account, web3Module.web3)
    const method = await contract.deposit(amount, transactOpts)
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.EtherTokenAddress, appStore, success)
  }
}
