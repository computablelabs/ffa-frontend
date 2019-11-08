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

    const etherTokenBalance = await PurchaseProcessModule.updateEtherTokenBalance(store)

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

  public static async checketherTokenDatatrustContractAllowance(store: Store<any>): Promise<void> {
    EthereumModule.getEtherTokenContractAllowance(ContractAddresses.DatatrustAddress!, store)
    const etherTokenDatatrustContractAllowance = getModule(AppModule, store).etherTokenDatatrustContractAllowance

    if (etherTokenDatatrustContractAllowance >= PurchaseProcessModule.getPurchasePrice(store)) {
      getModule(PurchaseModule, store).setPurchaseStep(PurchaseStep.PurchaseListing)
    }
  }

  public static async checkListingPurchased(
    listing: FfaListing,
    store: Store<any>): Promise<boolean> {

    if (!listing || !listing.hash) {
      return false
    }

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

  public static updatePurchaseStep(store: Store<any>) {
    const purchaseModule = getModule(PurchaseModule, store)
    const appModule = getModule(AppModule, store)

    if (purchaseModule.purchaseStep === PurchaseStep.Complete) { return }

    const price = PurchaseProcessModule.getPurchasePrice(store)

    if (appModule.etherTokenBalance < price) {
      return purchaseModule.setPurchaseStep(PurchaseStep.CreateToken)
    }

    debugger

    if (appModule.etherTokenDatatrustContractAllowance < price) {
      debugger
      return purchaseModule.setPurchaseStep(PurchaseStep.ApproveSpending)
    }

    debugger

    return purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
  }
}
