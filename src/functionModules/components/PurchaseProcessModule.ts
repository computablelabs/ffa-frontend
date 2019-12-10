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
    if (!purchaseModule.listing) { return 0 }

    return purchaseModule.listing.size * appModule.costPerByte
  }

  public static async checkEtherTokenBalance(store: Store<any>): Promise<void> {

    const etherTokenBalance = await PurchaseProcessModule.updateEtherTokenBalance(store)
    const purchaseModule = getModule(PurchaseModule, store)

    if (etherTokenBalance >= PurchaseProcessModule.getPurchasePrice(store)) {
      return purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
    }

    return purchaseModule.setPurchaseStep(PurchaseStep.CreateToken)
  }

  public static async updateEtherTokenBalance(store: Store<any>): Promise<number> {

    const appModule = getModule(AppModule, store)
    const balance = await EtherTokenContractModule.balanceOf(
      ethereum.selectedAddress,
      ethereum.selectedAddress,
      appModule.web3,
    )
    appModule.setEtherTokenBalance(Number(balance))
    return Number(balance)
  }

  public static async checkEtherTokenDatatrustContractAllowance(store: Store<any>): Promise<void> {
    EthereumModule.getEtherTokenContractAllowance(ContractAddresses.DatatrustAddress!, store)
    const etherTokenDatatrustContractAllowance = getModule(AppModule, store).etherTokenDatatrustContractAllowance
    const purchaseModule = getModule(PurchaseModule, store)

    if (etherTokenDatatrustContractAllowance >= PurchaseProcessModule.getPurchasePrice(store)) {
      return purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
    }

    return purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
  }

  public static async checkListingPurchased(
    listing: FfaListing,
    store: Store<any>): Promise<boolean> {

    if (!listing || !listing.hash) { return false }

    const purchaseModule = getModule(PurchaseModule, store)
    const deliveryHash = DatatrustModule.generateDeliveryHash(listing.hash, store)

    const delivery = await DatatrustContractModule.getDelivery(
      ethereum.selectedAddress,
      deliveryHash,
      store,
    )

    const owner = delivery[0]

    const isDelivered = await DatatrustContractModule.isDelivered(
      ethereum.selectedAddress,
      deliveryHash,
      ethereum.selectedAddress,
      store,
    )

    // owner is coming back with some letters uppercase for some reason?
    const isBuyer = EthereumModule.isSameChecksum(owner, ethereum.selectedAddress, store)
    const purchased = isBuyer || isDelivered

    if (purchased) { purchaseModule.setPurchaseStep(PurchaseStep.Complete) }

    return purchased
  }

  public static updatePurchaseStep(store: Store<any>) {
    const purchaseModule = getModule(PurchaseModule, store)
    const appModule = getModule(AppModule, store)

    // TODO Add case in which user doesn't have enough CET

    if (purchaseModule.purchaseStep === PurchaseStep.Complete) { return }

    const price = PurchaseProcessModule.getPurchasePrice(store)

    if (appModule.etherTokenBalance < price) {
      return purchaseModule.setPurchaseStep(PurchaseStep.CreateToken)
    }

    if (appModule.etherTokenDatatrustContractAllowance < price) {
      return purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
    }

    return purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
  }
}
