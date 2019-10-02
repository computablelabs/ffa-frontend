import DatatrustContract from '@computable/computablejs/dist/contracts/datatrust'

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import MetamaskModule from '../metamask/MetamaskModule'
import Web3Module from '../../vuexModules/Web3Module'
import ContractAddresses from '../../models/ContractAddresses'

import { Errors } from '../../util/Constants'

import Web3 from 'web3'

export default class DatatrustContractModule {

  public static async getDatatrustContract(account: string, web3: Web3): Promise<DatatrustContract> {
    const contract = new DatatrustContract(account)
    const initialized = await contract.at(web3, ContractAddresses.DatatrustAddress)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return contract
  }

  public static async purchase(
    account: string,
    listingHash: string,
    amount: number,
    processId: string,
    appStore: Store<any>) {

    const web3Module = getModule(Web3Module, appStore)
    const contract = await DatatrustContractModule.getDatatrustContract(account, web3Module.web3)
    const method = await contract.requestDelivery(listingHash, amount)
    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.EtherTokenAddress, processId, appStore)
  }
}
