
import { Route } from 'vue-router'
import Vue from 'vue'
import { getModule } from 'vuex-module-decorators'
import NewListingModule from '../../vuexModules/NewListingModule'

import { ProcessStatus } from '../../models/ProcessStatus'
import { CloseDrawer } from '../../models/Events'
import { emit } from 'cluster'

export default class RouterTransitionModule {

  public static beforeTransition(to: Route, from: Route, app: Vue): any {
    if (to.path === from.path) {
      return false
    }
    return true
  }

  public static afterTransition(to: Route, from: Route, app: Vue) {
    console.log(`RouterTransitionModule: current: ${app.$router.currentRoute.name}`)
    console.log(`RouterTransitionModule: to: ${to.name}`)
    console.log(`RouterTransitionModule: from: ${from.name}`)
    switch (to.name) {
      case 'home':
      case 'createNewListing':
      case 'allListings':
      case 'candidatesListings':
      case 'listedListings':
      case 'userAllListings':
      case 'userCandidates':
      case 'userListed':
      case 'supportHome':
      case 'singleCandidate':
      case 'singleListed':
        return app.$root.$emit(CloseDrawer)
      default:
        // do nothing
    }
  }
}
