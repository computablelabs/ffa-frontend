import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'

import { SupportStep } from '../models/SupportStep'
import { WithdrawStep } from '../models/WithdrawStep'

@Module({ namespaced: true, name: 'supportWithdrawModule' })
export default class SupportWithdrawModule extends VuexModule {

  public supportValue = 0
  public supportStep = SupportStep.WrapEth
  public withdrawValue = 0
  public withdrawStep = WithdrawStep.CollectIncome
  public erc20TokenTransactionId = ''
  public approvePaymentTransactionId = ''
  public supportCollectiveTransactionId = ''

  @Mutation
  public resetAll() {
    this.supportValue = 0
    this.supportStep = SupportStep.WrapEth
    this.withdrawValue = 0
    this.withdrawStep = WithdrawStep.CollectIncome
    this.erc20TokenTransactionId = ''
    this.approvePaymentTransactionId = ''
    this.supportCollectiveTransactionId = ''
  }


  @Mutation
  public setSupportValue(supportValue: number) {
    console.log(`===> ${supportValue}`)
    this.supportValue = supportValue
    console.log(`===> ${this.supportValue}`)
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

  get namespace(): string {
    return 'supportWithdrawModule'
  }
}
