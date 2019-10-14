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
    expect(module.supportStep).toEqual(SupportStep.Initialize)
    expect(module.withdrawValue).toBe(0)
    expect(module.withdrawStep).toEqual(WithdrawStep.Initialize)
    expect(module.erc20TokenTransactionId).toEqual('')
    expect(module.approvePaymentTransactionId).toEqual('')
    expect(module.listingHashes.length).toBe(0)
    expect(module.collectIncomeTransactionIds.length).toBe(0)
    expect(module.withdrawTransactionId).toEqual('')
    expect(module.unwrapWETHTransacctionId).toEqual('')
  })

  it('correctly mutates', () => {
    module.setSupportValue(1)
    module.setSupportStep(SupportStep.Complete)
    module.setWithdrawValue(2)
    module.setWithdrawStep(WithdrawStep.UnwrapWETHPending)
    module.setListingHashes(['aaa', 'bbb'])

    expect(module.supportValue).toBe(1)
    expect(module.supportStep).toEqual(SupportStep.Complete)
    expect(module.withdrawValue).toBe(2)
    expect(module.withdrawStep).toEqual(WithdrawStep.UnwrapWETHPending)
    expect(module.listingHashes.length).toBe(2)
    expect(module.listingHashes[1]).toEqual('bbb')
  })

  it('correctly adds/removes collect income transaction ids', () => {
    expect(module.collectIncomeTransactionIds.length).toBe(0)
    module.addCollectIncomeTransactionId('000')
    expect(module.collectIncomeTransactionIds.length).toBe(1)
    expect(module.collectIncomeTransactionIds[0]).toEqual('000')
    module.removeCollectIncomeTransactionId('345')
    expect(module.collectIncomeTransactionIds.length).toBe(1)
    module.removeCollectIncomeTransactionId('000')
    expect(module.collectIncomeTransactionIds.length).toBe(0)
  })

  it('correctly resets', () => {
    module.setSupportValue(3)
    module.setSupportStep(SupportStep.Error)
    module.setWithdrawValue(4)
    module.setWithdrawStep(WithdrawStep.WithdrawPending)
    module.setErc20TokenTransactionId('123')
    module.setApprovePaymentTransactionId('465')
    module.setListingHashes(['foo', 'bar'])
    module.addCollectIncomeTransactionId('007')
    module.setWithdrawTransactionId('789')
    module.setUnwrapWETHTransactionId('000')
    module.resetAll()
    expect(module.supportValue).toBe(0)
    expect(module.supportStep).toEqual(SupportStep.Initialize)
    expect(module.withdrawValue).toBe(0)
    expect(module.withdrawStep).toEqual(WithdrawStep.Initialize)
    expect(module.erc20TokenTransactionId).toEqual('')
    expect(module.approvePaymentTransactionId).toEqual('')
    expect(module.listingHashes.length).toBe(0)
    expect(module.collectIncomeTransactionIds.length).toBe(0)
    expect(module.withdrawTransactionId).toEqual('')
    expect(module.unwrapWETHTransacctionId).toEqual('')
  })
})
