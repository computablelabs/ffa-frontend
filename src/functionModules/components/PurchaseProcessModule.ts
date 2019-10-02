import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
import Web3Module from '../../vuexModules/Web3Module'
import PurchaseModule from '../../vuexModules/PurchaseModule'
import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'
import EtherTokenContractModule from '../../functionModules/protocol/EtherTokenContractModule'

import { PurchaseStep } from '../../models/PurchaseStep'
import ContractAddresses from '../../models/ContractAddresses'

import { Config } from '../../util/Config'

export default class PurchaseProcessModule {

  public static getPurchasePrice(store: Store<any>): number {
    const purchaseModule = getModule(PurchaseModule, store)
    const appModule = getModule(AppModule, store)

    return purchaseModule.listing.size * appModule.costPerByte
  }

  public static async checkMarketTokenBalance(store: Store<any>): Promise<void> {

    await this.wait(Config.BlockchainWaitTime)

    const newMarketTokenBalance = await this.updateMarketTokenBalance(store)

    if (newMarketTokenBalance >= PurchaseProcessModule.getPurchasePrice(store)) {
      const purchaseModule = getModule(PurchaseModule, store)
      purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
    }
    return
  }

  public static async updateMarketTokenBalance(store: Store<any>): Promise<number> {
    const web3Module = getModule(Web3Module, store)
    const appModule = getModule(AppModule, store)

    const balance = await MarketTokenContractModule.getBalance(ethereum.selectedAddress, web3Module.web3)

    appModule.setMarketTokenBalance(Number(balance))
    return Number(balance)
  }

  public static async checkDatatrustContractAllowance(store: Store<any>): Promise<void> {

    await this.wait(Config.BlockchainWaitTime)

    const newDatatrustAllowance = await this.updateDatatrustContractAllowance(store)

    if (newDatatrustAllowance >= PurchaseProcessModule.getPurchasePrice(store)) {
      const purchaseModule = getModule(PurchaseModule, store)
      purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
    }
    return
  }

  public static async updateDatatrustContractAllowance(store: Store<any>): Promise<number> {
    const web3Module = getModule(Web3Module, store)
    const allowance = await EtherTokenContractModule.allowance(
      ethereum.selectedAddress,
      ContractAddresses.DatatrustAddress,
      web3Module.web3,
      {})
    const appModule = getModule(AppModule, store)
    appModule.setDatatrustContractAllowance(allowance)
    return Number(allowance)
  }

  public static async wait(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
