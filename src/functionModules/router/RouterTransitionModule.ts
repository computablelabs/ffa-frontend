
import { Route } from 'vue-router'
import Vue from 'vue'
import { getModule } from 'vuex-module-decorators'
import NewListingModule from '../../vuexModules/NewListingModule'

import { ProcessStatus } from '../../models/ProcessStatus'
import { CloseDrawer } from '../../models/Events'

export default class RouterTransitionModule {

  public static executeTransition(to: Route, from: Route, app: Vue): any {
    if (to.path === from.path) {
      return false
    }

    switch (to.name) {
      case 'singleCandidate':
      case 'singleCandidateDetails':
      case 'singleCandidateCreated':
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
