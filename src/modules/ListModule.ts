import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'
import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import FfaListing from '../models/FfaListing'

@Module({ namespaced: true, name: 'listModule' })
export default class ListModule extends VuexModule implements FfaProcessModule {

  public status: ProcessStatus = ProcessStatus.NotReady
  public listing: FfaListing = {
    title: '',
    description: '',
    type: '',
    hash: '',
    md5: '',
    tags: [],
    transactionHash: '',
  }
  public percentComplete = 0

  @Mutation
  public reset() {
    this.status = ProcessStatus.NotReady
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
  public setStatus(status: ProcessStatus) {
    this.status = status
  }

  get namespace(): string {
    return 'listModule'
  }

  get processStatus(): ProcessStatus {
    return this.status
  }
}
