import {
  Module,
  VuexModule,
  Mutation} from 'vuex-module-decorators'

import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import { PurchaseStep } from '../models/PurchaseStep'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'

const emptyListing = new FfaListing(
  '',
  '',
  '',
  '',
  '',
  '',
  0,
  '',
  [],
  FfaListingStatus.new,
  0,
  0)

@Module({ namespaced: true, name: 'purchaseModule' })
export default class PurchaseModule extends VuexModule implements FfaProcessModule {

  public namespace = 'purchaseModule'
  public status = ProcessStatus.NotReady
  public listing = emptyListing
  public percentComplete = 0
  public purchaseStep = PurchaseStep.CreateToken
  public erc20TokenTransactionId = ''
  public approvePaymentTransactionId = ''
  public purchaseListingTransactionId = ''

  @Mutation
  public reset() {
    this.listing = emptyListing
    this.status = ProcessStatus.NotReady
    this.purchaseStep = PurchaseStep.CreateToken
    this.percentComplete = 0
    this.erc20TokenTransactionId = ''
    this.approvePaymentTransactionId = ''
    this.purchaseListingTransactionId = ''
  }

  @Mutation
  public prepare(listing: FfaListing) {
    this.listing = listing
  }

  @Mutation
  public setPercentComplete(percentComplete: number) {
    this.percentComplete = percentComplete
  }

  @Mutation
  public setListing(listing: FfaListing) {
    this.listing = listing
  }

  @Mutation
  public setStatus(status: ProcessStatus) {
    this.status = status
  }

  @Mutation
  public setPurchaseStep(purchaseStep: PurchaseStep) {
    this.purchaseStep = purchaseStep
  }

  @Mutation
  public setErc20TokenTransactionId(transactionId: string) {
    this.erc20TokenTransactionId = transactionId
  }

  @Mutation
  public setApprovePaymentTransactionId(transactionId: string) {
    this.approvePaymentTransactionId = transactionId
  }

  @Mutation
  public setPurchaseListingTransactionId(transactionId: string) {
    this.purchaseListingTransactionId = transactionId
  }
}
