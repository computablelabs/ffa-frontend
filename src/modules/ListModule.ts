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
  }
  public percentComplete = 0
  public listingProcessing = false
  // @MutationAction({mutate: ['flashes']})
  // public async fetchAll() {
  //   const response = [{}] // : Response = await getJSON('https://hasgeek.github.io/events/api/events.json')
  //   return response
  // }

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

  @Mutation
  public setListingProcessing(listingProcessing: boolean) {
    this.listingProcessing = listingProcessing
  }

  // @Mutation
  // public nextStatus() {
  //   if (this.status === ProcessStatus.Error) {
  //     return
  //   }
  //   const currentStatusIndex = Number(this.status)
  //   const nextStatus = ProcessStatus[currentStatusIndex + 1] as keyof typeof ProcessStatus
  //   this.status = ProcessStatus[nextStatus]
  // }

  get namespace(): string {
    return 'listModule'
  }

  get processStatus(): ProcessStatus {
    return this.status
  }
}
