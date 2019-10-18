import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../vuexModules/AppModule'
import Web3Module from '../../vuexModules/Web3Module'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'

import MarketTokenContractModule from '../../functionModules/protocol/MarketTokenContractModule'

import { SupportStep } from '../../models/SupportStep'

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

  public static async afterCollectIncome(appStore: Store<any>) {
    const appModule = getModule(AppModule, appStore)
    const web3Module = getModule(Web3Module, appStore)
    const marketTokenBalance = await MarketTokenContractModule.balanceOf(
      ethereum.selectedAddress,
      web3Module.web3)
    appModule.setMarketTokenBalance(Number(marketTokenBalance))
  }

  public static supportValueToMarketTokens(appStore: Store<any>) {
    const appModule = getModule(AppModule, appStore)
    const web3Module = getModule(Web3Module, appStore)
    const supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    const wei = new BigNumber(supportWithdrawModule.supportValue).toString()
    // console.log(`wei: ${wei}`)
    const bn = web3Module.web3.utils.toBN(wei)
    // console.log(`bn: ${bn}`)
    const ether =  Number(web3Module.web3.utils.fromWei(bn))
    // console.log(`ether: ${ether}`)
    // console.log(`ethereumToMarketTokenRate: ${appModule.marketTokenToEthereumRate}`)
    //  console.log(`ether * appModule.marketTokenToEthereumRate: ${ether * appModule.marketTokenToEthereumRate}`)
    return ether * appModule.marketTokenToEthereumRate
  }
}
