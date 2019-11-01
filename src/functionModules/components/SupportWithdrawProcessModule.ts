import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../vuexModules/AppModule'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'

import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import { SupportStep } from '../../models/SupportStep'
import { WithdrawStep } from '../../models/WithdrawStep'

import ReserveContractModule from '../protocol/ReserveContractModule'
import ListingContractModule from '../protocol/ListingContractModule'

export default class SupportWithdrawProcessModule {

  public static async getSupportPrice(appStore: Store<any>) {
    const appModule = getModule(AppModule, appStore)
    const weiValue = await ReserveContractModule.getSupportPrice(ethereum.selectedAddress, appModule.web3)
    appModule.setSupportPrice(weiValue)
  }

  public static async getUserListings(appStore: Store<any>) {
    const supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    const listings =
      await ListingContractModule.getAllListingsForAccount(ethereum.selectedAddress, appStore)

    supportWithdrawModule.setListingHashes(listings.map((l) => l.returnValues.hash))
  }

  public static checkEthereumBalance(appStore: Store<any>, minimumBalance: number) {
    const appModule = getModule(AppModule, appStore)
    const supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    const status = appModule.ethereumBalance >= minimumBalance ?
      SupportStep.WrapETH : SupportStep.InsufficientETH

    supportWithdrawModule.setSupportStep(status)
  }

  public static checkEtherTokenBalance(appStore: Store<any>, minimumBalance: number) {
    const appModule = getModule(AppModule, appStore)
    if (appModule.etherTokenBalance < minimumBalance) {
      return
    }
    const supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)
  }

  public static hasEnoughEth(ethThreshold: number, appStore: Store<any>): boolean {
    return getModule(AppModule, appStore).ethereumBalance >= ethThreshold
  }

  public static hasEnoughWeth(appStore: Store<any>): boolean {
    return getModule(AppModule, appStore).etherTokenBalance >=
      getModule(SupportWithdrawModule, appStore).supportValue
  }

  public static hasEnoughReserveApproval(appStore: Store<any>): boolean {
    return getModule(AppModule, appStore).reserveContractAllowance >=
      getModule(SupportWithdrawModule, appStore).supportValue
  }

  public static checkForIncome(appStore: Store<any>) {
    const supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    if (supportWithdrawModule.withdrawStep !== WithdrawStep.CollectIncome) {
      return
    }

    if (supportWithdrawModule.listingHashes.length === 0) {
      supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)
    }
  }

  public static async afterCollectIncome(appStore: Store<any>) {
    const appModule = getModule(AppModule, appStore)

    const marketTokenBalance = await MarketTokenContractModule.balanceOf(
      ethereum.selectedAddress,
      appModule.web3)
    appModule.setMarketTokenBalance(Number(marketTokenBalance))
  }

  public static weiToMarketTokens(wei: number, appStore: Store<any>) {
    const appModule = getModule(AppModule, appStore)
    if (!appModule.web3 || !appModule.web3.utils) {
      return 0
    }
    return Number(EthereumModule.weiToEther(wei, appModule.web3))
  }

  public static supportValueToMarketTokens(appStore: Store<any>): number {
    const supportPrice = getModule(AppModule, appStore).supportPrice
    const supportValue = getModule(SupportWithdrawModule, appStore).supportValue
    const wei = supportValue / (1000000000 * supportPrice)
    // console.log(`supportPrice: ${supportPrice}`)
    // console.log(`supportValue: ${supportValue}`)
    // console.log(`wei: ${wei}`)
    return Math.round(wei)
  }

  public static setWithdrawStep(appStore: Store<any>) {
    const appModule = getModule(AppModule, appStore)
    const supportWithdrawModule = getModule(SupportWithdrawModule, appStore)

    if (!appModule.web3.utils) {
      return
    }

    const currentWithdrawStep = supportWithdrawModule.withdrawStep

    if (currentWithdrawStep === WithdrawStep.Complete) {
      return
    }

    if (supportWithdrawModule.listingHashes.length === 0 &&
        currentWithdrawStep < WithdrawStep.CollectIncomePending) {
      return supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)
    }
  }

}
