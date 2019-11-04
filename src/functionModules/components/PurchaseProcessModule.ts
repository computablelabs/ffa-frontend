import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'
import EtherTokenContractModule from '../protocol/EtherTokenContractModule'
import EthereumModule from '../ethereum/EthereumModule'

import { PurchaseStep } from '../../models/PurchaseStep'
import ContractAddresses from '../../models/ContractAddresses'
import FfaListing from '../../models/FfaListing'

import DatatrustContractModule from '../../functionModules/protocol/DatatrustContractModule'
import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'

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

    const etherTokenBalance = await this.updateEtherTokenBalance(store)

    if (etherTokenBalance >= PurchaseProcessModule.getPurchasePrice(store)) {
      getModule(PurchaseModule, store).setPurchaseStep(PurchaseStep.ApproveSpending)
    }
  }

  public static async updateEtherTokenBalance(store: Store<any>): Promise<number> {

    const appModule = getModule(AppModule, store)
    const balance = await EtherTokenContractModule.balanceOf(ethereum.selectedAddress, appModule.web3)

    appModule.setEtherTokenBalance(Number(balance))
    return Number(balance)
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

  public static async checkDatatrustContractAllowance(store: Store<any>): Promise<void> {

    const newDatatrustAllowance = await this.updateDatatrustContractAllowance(store)

    EthereumModule.getContractAllowance(ContractAddresses.DatatrustAddress, store)
    const datatrustContractAllowance = getModule(AppModule, store).datatrustContractAllowance

    if (datatrustContractAllowance >= PurchaseProcessModule.getPurchasePrice(store)) {
      getModule(PurchaseModule, store).setPurchaseStep(PurchaseStep.PurchaseListing)
    }
  }

  public static async checkListingPurchased(
    listing: FfaListing,
    store: Store<any>): Promise<boolean> {

    const purchaseModule = getModule(PurchaseModule, store)
    const deliveryHash = DatatrustModule.generateDeliveryHash(listing.hash, store)

    const delivery = await DatatrustContractModule.getDelivery(
      ethereum.selectedAddress,
      deliveryHash,
      store,
    )

    const [owner, bytesRequested] = [delivery[0], delivery[1]]

    // owner is coming back with some letters uppercase for some reason?
    const isBuyer = ethereum.selectedAddress === owner.toLowerCase()
    const sizesMatch = listing.size === Number(bytesRequested)
    const purchased = isBuyer && sizesMatch

    if (purchased) { purchaseModule.setPurchaseStep(PurchaseStep.Complete) }

    return purchased
  }
}
