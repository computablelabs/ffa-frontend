import { getModule } from 'vuex-module-decorators'

import appStore from '../../../src/store'
import SupportWithdrawModule from '../../../src/vuexModules/SupportWithdrawModule'

import { SupportStep } from '../../../src/models/SupportStep'
import { WithdrawStep } from '../../../src/models/WithdrawStep'


describe('SupportWithdrawModule.ts', () => {

  let module!: SupportWithdrawModule

  beforeEach(() => {
    module = getModule(SupportWithdrawModule, appStore)
  })

  afterEach(() => {
    module.resetAll()
  })

  it('correctly sets defaults', () => {
    expect(module.supportValue).toBe(0)
    expect(module.supportStep).toEqual(SupportStep.WrapEth)
    expect(module.withdrawValue).toBe(0)
    expect(module.withdrawStep).toEqual(WithdrawStep.CollectIncome)
  })

  it('correctly mutates', () => {
    module.setSupportValue(1)
    module.setSupportStep(SupportStep.Complete)
    module.setWithdrawValue(2)
    module.setWithdrawStep(WithdrawStep.UnwrapWETHPending)

    expect(module.supportValue).toBe(1)
    expect(module.supportStep).toEqual(SupportStep.Complete)
    expect(module.withdrawValue).toBe(2)
    expect(module.withdrawStep).toEqual(WithdrawStep.UnwrapWETHPending)
  })

  it('correctly resets', () => {
    module.setSupportValue(3)
    module.setSupportStep(SupportStep.Error)
    module.setWithdrawValue(4)
    module.setWithdrawStep(WithdrawStep.WithdrawWETHPending)
    module.resetAll()
    expect(module.supportValue).toBe(0)
    expect(module.supportStep).toEqual(SupportStep.WrapEth)
    expect(module.withdrawValue).toBe(0)
    expect(module.withdrawStep).toEqual(WithdrawStep.CollectIncome)
  })
})
