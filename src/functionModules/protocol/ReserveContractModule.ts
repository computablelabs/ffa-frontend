import { call } from '@computable/computablejs/dist/helpers'
import ReserveContract from '@computable/computablejs/dist/contracts/reserve'

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import MetamaskModule from '../metamask/MetamaskModule'
import Web3Module from '../../vuexModules/Web3Module'
import ContractAddresses from '../../models/ContractAddresses'

import { Errors } from '../../util/Constants'

import Web3 from 'web3'

export default class ReserveContractModule {

  public static async getReserveContract(account: string, web3: Web3): Promise<ReserveContract> {
    const contract = new ReserveContract(account)
    const initialized = await contract.at(web3, ContractAddresses.ReserveAddress)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return contract
  }

  public static async getSupportPrice(
    account: string,
    web3: Web3) {

    const contract = await ReserveContractModule.getReserveContract(account, web3)
    const method = await contract.getSupportPrice()
    return await call(method)
  }

  public static async support(
    account: string,
    amount: number,
    processId: string,
    appStore: Store<any>) {

    const web3Module = getModule(Web3Module, appStore)
    const contract = await ReserveContractModule.getReserveContract(account, web3Module.web3)
    const method = await contract.support(amount)
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.ReserveAddress, processId, appStore)
  }

  public static async withdraw(
    account: string,
    processId: string,
    appStore: Store<any>) {

    const web3Module = getModule(Web3Module, appStore)
    const contract = await ReserveContractModule.getReserveContract(account, web3Module.web3)
    const method = await contract.withdraw()
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.ReserveAddress, processId, appStore)
  }
}
