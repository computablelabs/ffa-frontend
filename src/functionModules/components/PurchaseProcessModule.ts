import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'
import EtherTokenContractModule from '../protocol/EtherTokenContractModule'
import EthereumModule from '../ethereum/EthereumModule'

import { PurchaseStep } from '../../models/PurchaseStep'
import ContractAddresses from '../../models/ContractAddresses'

import { Config } from '../../util/Config'

export default class PurchaseProcessModule {

  public static getPurchasePrice(store: Store<any>): number {
    const purchaseModule = getModule(PurchaseModule, store)
    const appModule = getModule(AppModule, store)
    if (!purchaseModule.listing) {
      return 0
    }
    return purchaseModule.listing.size * appModule.costPerByte
  }

  public static async checkEtherTokenBalance(store: Store<any>): Promise<void> {

    // await this.wait(Config.BlockchainWaitTime)

    await EthereumModule.getEtherTokenBalance(store)
    const etherTokenBalance = getModule(AppModule, store).etherTokenBalance

    if (etherTokenBalance >= PurchaseProcessModule.getPurchasePrice(store)) {
      getModule(PurchaseModule, store).setPurchaseStep(PurchaseStep.ApproveSpending)
    }
  }

  public static async checkDatatrustContractAllowance(store: Store<any>): Promise<void> {

    // await this.wait(Config.BlockchainWaitTime)


    EthereumModule.getEthereumContractAllowance(ContractAddresses.DatatrustAddress, store)
    const datatrustContractAllowance = getModule(AppModule, store).datatrustContractAllowance

    if (datatrustContractAllowance >= PurchaseProcessModule.getPurchasePrice(store)) {
      getModule(PurchaseModule, store).setPurchaseStep(PurchaseStep.PurchaseListing)
    }
  }

  public static async wait(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
