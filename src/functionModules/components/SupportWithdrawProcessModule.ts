import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../vuexModules/AppModule'
import Web3Module from '../../vuexModules/Web3Module'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'

import { SupportStep } from '../../models/SupportStep'

import ReserveContractModule from '../protocol/ReserveContractModule'

export default class SupportWithdrawProcessModule {

  public static async getSupportPrice(appStore: Store<any>) {
    const appModule = getModule(AppModule, appStore)
    const web3Module = getModule(Web3Module, appStore)
    const weiValue = await ReserveContractModule.getSupportPrice(ethereum.selectedAddress, web3Module.web3)
    appModule.setSupportPrice(weiValue)
  }

  public static checkEthereumBalance(appStore: Store<any>, minimumBalance: number) {
    const appModule = getModule(AppModule, appStore)
    const supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    const status = appModule.ethereumBalance >= minimumBalance ?
      SupportStep.WrapEth : SupportStep.InsufficientEth

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

}
