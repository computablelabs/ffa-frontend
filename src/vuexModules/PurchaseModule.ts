import {
  Module,
  VuexModule,
  Mutation} from 'vuex-module-decorators'

import FfaListing from '../models/FfaListing'

@Module({ namespaced: true, name: 'drawerModule' })
export default class PurchaseModule extends VuexModule {

  public listing?: FfaListing

  @Mutation
  public setListing(listing: FfaListing) {
    this.listing = listing
  }
}
