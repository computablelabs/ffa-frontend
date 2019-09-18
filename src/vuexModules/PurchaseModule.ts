import {
  Module,
  VuexModule,
  Mutation} from 'vuex-module-decorators'

import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'

import FfaListing from '../models/FfaListing'

@Module({ namespaced: true, name: 'purchaseModule' })
export default class PurchaseModule extends VuexModule implements FfaProcessModule {

  public namespace = 'purchaseModule'
  public status: ProcessStatus = ProcessStatus.NotReady
  public listing?: FfaListing
  public percentComplete = 0

  public reset(): void {
    throw new Error('Method not implemented.')
  }

  public prepare(target: any): void {
    throw new Error('Method not implemented.')
  }

  public setPercentComplete(percentComplete: number): void {
    throw new Error('Method not implemented.')
  }

  @Mutation
  public setListing(listing: FfaListing) {
    this.listing = listing
  }

  @Mutation
  public setStatus(status: ProcessStatus) {
    this.status = status
  }
}
