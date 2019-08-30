import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'
import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import FfaListing, { FfaListingStatus } from '../models/FfaListing'

const emptyListing = {
  title: '',
  description: '',
  type: '',
  hash: '',
  md5: '',
  tags: [],
  status: FfaListingStatus.new,
  owner: '0xwall3t',
}

@Module({ namespaced: true, name: 'listModule' })
export default class ListModule extends VuexModule implements FfaProcessModule {

  public status: ProcessStatus = ProcessStatus.NotReady
  public percentComplete = 0
  // TODO: refactor this attribute out!
  // There are two "processing" contexts and this attribute is being used
  // to track the overarching listing process that includes listing (this class),
  // uploading and possibly voting.
  public listingProcessing = false
  public transactionHash = ''
  public listing: FfaListing = emptyListing

  @Mutation
  public reset() {
    this.status = ProcessStatus.NotReady
    this.percentComplete = 0
    this.listingProcessing = false
    this.transactionHash = ''
    this.listing = emptyListing
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

  @Mutation
  public setTransactionHash(transactionHash: string) {
    this.transactionHash = transactionHash
  }

  get namespace(): string {
    return 'listModule'
  }
}
