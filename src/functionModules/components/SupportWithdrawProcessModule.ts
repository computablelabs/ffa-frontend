import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../vuexModules/AppModule'
import Web3Module from '../../vuexModules/Web3Module'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'

import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'

import { SupportStep } from '../../models/SupportStep'
import { WithdrawStep } from '../../models/WithdrawStep'

import ReserveContractModule from '../protocol/ReserveContractModule'
import ListingContractModule from '../protocol/ListingContractModule'

import BigNumber from 'bignumber.js'

export default class SupportWithdrawProcessModule {

  public static async getSupportPrice(appStore: Store<any>) {
    const appModule = getModule(AppModule, appStore)
    const web3Module = getModule(Web3Module, appStore)
    const weiValue = await ReserveContractModule.getSupportPrice(ethereum.selectedAddress, web3Module.web3)
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
    const web3 = getModule(Web3Module, appStore).web3
    if (!web3.utils) {
      return false
    }
    const etherTokenBalanceInWei =
      web3.utils.toWei(getModule(AppModule, appStore).etherTokenBalance.toFixed(0))
    return Number(etherTokenBalanceInWei) >=
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
      console.log('promoting withdrawStep to .Withdraw')
      supportWithdrawModule.setWithdrawStep(WithdrawStep.Withdraw)
    }
  }

  public static async afterCollectIncome(appStore: Store<any>) {
    const appModule = getModule(AppModule, appStore)
    const web3Module = getModule(Web3Module, appStore)
    const marketTokenBalance = await MarketTokenContractModule.balanceOf(
      ethereum.selectedAddress,
      web3Module.web3)
    appModule.setMarketTokenBalance(Number(marketTokenBalance))
  }

  public static weiToMarketTokens(wei: number, appStore: Store<any>) {
    const web3Module = getModule(Web3Module, appStore)
    if (!web3Module.web3 || !web3Module.web3.utils) {
      return 0
    }
    // console.log(`wei: ${wei}`)
    const bn = web3Module.web3.utils.toBN(wei.toFixed(0))
    // console.log(`bn: ${bn}`)
    const ether =  Number(web3Module.web3.utils.fromWei(bn))
    // console.log(`ether: ${ether}`)
    return ether
  }

  public static supportPriceToMarketTokens(appStore: Store<any>): number {
    const supportPrice = getModule(AppModule, appStore).supportPrice
    const supportValue = getModule(SupportWithdrawModule, appStore).supportValue
    const wei = supportValue / (1000000000 * supportPrice)
    // console.log(`supportPrice: ${supportPrice}`)
    // console.log(`supportValue: ${supportValue}`)
    // console.log(`wei: ${wei}`)
    return Math.round(wei)
  }
}
