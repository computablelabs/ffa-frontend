import { Route } from 'vue-router'
import Vue from 'vue'

import { CloseDrawer } from '../../models/Events'

export default class RouterTransitionModule {

  public static beforeTransition(to: Route, from: Route, app: Vue): any {
    if (to.path === from.path) {
      return false
    }
    return true
  }

  public static afterTransition(to: Route, from: Route, app: Vue) {
    // switch (to.name) {
    //   case 'home':
    //   case 'createNewListing':
    //   case 'allListings':
    //   case 'candidatesListings':
    //   case 'listedListings':
    //   case 'userAllListings':
    //   case 'userCandidates':
    //   case 'userListed':
    //   case 'supportHome':
    //   case 'singleCandidate':
    //   case 'singleListed':
    //     return app.$root.$emit(CloseDrawer)
    //   default:
    //     // do nothing
    // }
  }
}
