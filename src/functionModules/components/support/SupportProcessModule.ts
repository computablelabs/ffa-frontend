import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../vuexModules/AppModule'
import SupportWithdrawModule from '../../../vuexModules/SupportWithdrawModule'

import { SupportStep } from '../../../models/SupportStep'


export default class SupportStepModule {

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
