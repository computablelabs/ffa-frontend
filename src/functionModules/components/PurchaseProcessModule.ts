import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'
import EtherTokenContractModule from '../protocol/EtherTokenContractModule'


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

    const newEtherTokenBalance = await this.updateEtherTokenBalance(store)

    if (newEtherTokenBalance >= PurchaseProcessModule.getPurchasePrice(store)) {
      const purchaseModule = getModule(PurchaseModule, store)
      purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
    }
  }

  public static async updateEtherTokenBalance(store: Store<any>): Promise<number> {

    const appModule = getModule(AppModule, store)

    const balance = await EtherTokenContractModule.balanceOf(ethereum.selectedAddress, appModule.web3)

    appModule.setEtherTokenBalance(Number(balance))
    return Number(balance)
  }

  public static async checkDatatrustContractAllowance(store: Store<any>): Promise<void> {

    // await this.wait(Config.BlockchainWaitTime)

    const newDatatrustAllowance = await this.updateDatatrustContractAllowance(store)


    if (newDatatrustAllowance >= PurchaseProcessModule.getPurchasePrice(store)) {
      const purchaseModule = getModule(PurchaseModule, store)
      purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
    }
    return
  }

  public static async updateDatatrustContractAllowance(store: Store<any>): Promise<number> {
    const appModule = getModule(AppModule, store)
    const allowance = await EtherTokenContractModule.allowance(
      ethereum.selectedAddress,
      ContractAddresses.DatatrustAddress,
      appModule.web3,
    )
    appModule.setDatatrustContractAllowance(allowance)
    return Number(allowance)
  }

  public static async wait(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
