import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import Web3 from 'web3'

import { call } from '@computable/computablejs/dist/helpers'

import DatatrustContract from '@computable/computablejs/dist/contracts/datatrust'

import MetamaskModule from '../metamask/MetamaskModule'

import AppModule from '../../vuexModules/AppModule'

import ContractAddresses from '../../models/ContractAddresses'

import { Errors } from '../../util/Constants'


export default class DatatrustContractModule {

  public static async getDatatrustContract(
    account: string,
    web3: Web3): Promise<DatatrustContract> {
    const contract = new DatatrustContract(account)
    const initialized = await contract.at(web3, ContractAddresses.DatatrustAddress!)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return contract
  }

  public static async purchase(
    account: string,
    deliveryHash: string,
    amount: number,
    processId: string,
    appStore: Store<any>) {

    const appModule = getModule(AppModule, appStore)
    const contract = await DatatrustContractModule.getDatatrustContract(
      account, appModule.web3)
    const method = await contract.requestDelivery(deliveryHash, amount)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.DatatrustAddress!, processId, appStore)
  }

  public static async getDelivery(
    account: string,
    deliveryHash: string,
    appStore: Store<any>) {

    const appModule = getModule(AppModule, appStore)

    const contract = await DatatrustContractModule.getDatatrustContract(
      account, appModule.web3)
    const method = await contract.getDelivery(deliveryHash)

    return await call(method)
  }

  public static async isDelivered(
    account: string,
    deliveryHash: string,
    owner: string,
    appStore: Store<any>) {

    const appModule = getModule(AppModule, appStore)

    const contract = await DatatrustContractModule.getDatatrustContract(
      account, appModule.web3)

    const options = {
      filter: {
        hash: deliveryHash,
        owner,
      },
      fromBlock: Number(process.env.VUE_APP_GENESIS_BLOCK!),
    }

    const res = await contract.deployed!.getPastEvents('Delivered', options)
    return res.length > 0
  }

  public static async purchaseCount(
    account: string,
    listingHash: string,
    appStore: Store<any>) {

      const appModule = getModule(AppModule, appStore)

      const contract = await DatatrustContractModule.getDatatrustContract(
        account, appModule.web3)

      const options = {
        filter: {
          hash: listingHash,
        },
        fromBlock: Number(process.env.VUE_APP_GENESIS_BLOCK!),
      }

      const res = await contract.deployed!.getPastEvents('ListingAccessed', options)
      return res.length
    }
}
