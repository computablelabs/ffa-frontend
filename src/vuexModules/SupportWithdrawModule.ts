import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'

import { SupportStep } from '../models/SupportStep'
import { WithdrawStep } from '../models/WithdrawStep'

@Module({ namespaced: true, name: 'supportWithdrawModule' })
export default class SupportWithdrawModule extends VuexModule {

  public supportValue = 0
  public supportStep = SupportStep.WrapETH
  public withdrawValue = 0
  public withdrawStep = WithdrawStep.CollectIncome
  public erc20TokenTransactionId = ''
  public approvePaymentTransactionId = ''
  public supportCollectiveTransactionId = ''

  public listingHashes: string[] = []
  public collectIncomeTransactionIds: string[] = []
  public withdrawTransactionId = ''
  public unwrapWETHTransacctionId = ''

  @Mutation
  public resetAll() {
    this.supportValue = 0
    this.supportStep = SupportStep.WrapETH
    this.withdrawValue = 0
    this.withdrawStep = WithdrawStep.CollectIncome
    this.erc20TokenTransactionId = ''
    this.approvePaymentTransactionId = ''
    this.supportCollectiveTransactionId = ''
    this.listingHashes = []
    this.collectIncomeTransactionIds = []
    this.withdrawTransactionId = ''
    this.unwrapWETHTransacctionId = ''
  }

  @Mutation
  public setSupportValue(supportValue: number) {
    this.supportValue = supportValue
  }

  @Mutation
  public setSupportStep(supportStep: SupportStep) {
    this.supportStep = supportStep
  }

  @Mutation
  public setWithdrawValue(withdrawValue: number) {
    this.withdrawValue = withdrawValue
  }

  @Mutation
  public setWithdrawStep(withdrawStep: WithdrawStep) {
    this.withdrawStep = withdrawStep
  }

  @Mutation
  public setErc20TokenTransactionId(erc20TokenTransactionId: string) {
    this.erc20TokenTransactionId = erc20TokenTransactionId
  }

  @Mutation
  public setApprovePaymentTransactionId(approvePaymentTransactionId: string) {
    this.approvePaymentTransactionId = approvePaymentTransactionId
  }

  @Mutation
  public setSupportCollectiveTransactionId(supportCollectiveTransactionId: string) {
    this.supportCollectiveTransactionId = supportCollectiveTransactionId
  }

  @Mutation
  public setListingHashes(listingHashes: string[]) {
    this.listingHashes = listingHashes
  }

  @Mutation
  public addCollectIncomeTransactionId(transactionId: string) {
    if (this.collectIncomeTransactionIds.indexOf(transactionId) >= 0) {
      return
    }
    this.collectIncomeTransactionIds.push(transactionId)
  }

  @Mutation
  public removeCollectIncomeTransactionId(transactionId: string) {
    if (this.collectIncomeTransactionIds.indexOf(transactionId) < 0) {
      return
    }
    const filtered = this.collectIncomeTransactionIds.filter((i) => i !== transactionId)
    this.collectIncomeTransactionIds = filtered
    if ( this.collectIncomeTransactionIds.length === 0) {
      this.withdrawStep = WithdrawStep.Withdraw
    }
  }

  @Mutation
  public setWithdrawTransactionId(withdrawTransactionId: string) {
    this.withdrawTransactionId = withdrawTransactionId
  }

  @Mutation
  public setUnwrapWETHTransactionId(unwrapWETHTransacctionId: string) {
    this.unwrapWETHTransacctionId = unwrapWETHTransacctionId
  }

  get namespace(): string {
    return 'supportWithdrawModule'
  }
}
