
import { Route } from 'vue-router'
import Vue from 'vue'
import { getModule } from 'vuex-module-decorators'
import NewListingModule from '../../vuexModules/NewListingModule'

import { ProcessStatus } from '../../models/ProcessStatus'
import { CloseDrawer } from '../../models/Events'
import { emit } from 'cluster'

export default class RouterTransitionModule {

  public static executeTransition(to: Route, from: Route, app: Vue): any {
    if (to.path === from.path) {
      return false
    }

    switch (to.name) {
      case 'allListings':
      case 'candidatesListings':
      case 'listedListings':
      case 'userAllListings':
      case 'userCandidates':
      case 'userListed':
      case 'supportHome':
        return true

      case 'singleCandidate':
      case 'singleCandidateDetails':
      case 'singleCandidateCreated':
        if (from.name !== 'createNewListingAction') {
          return true
        }
        if (getModule(NewListingModule, app.$store).status === ProcessStatus.Complete) {
          console.log(`RouterTransitionModule NewListingModule is Complete`)
          return true
        }
        console.log(`RouterTransitionModule emit: ${CloseDrawer}`)
        app.$root.$emit(CloseDrawer)
        return true
      default:
        // do nothing
        return true
      }
  }
}
