import Vue from 'vue'
import Router, { Route } from 'vue-router'
import { CloseDrawer, OpenDrawer } from '../../models/Events'

export default class CreateNewListingModule {

  public static emitDrawerEvent(component: Vue, currentRoute: Route) {
    const resolved = component.$router.resolve({name: 'createNewListingAction'})
    const drawerEvent = currentRoute.path === resolved.route.path ? OpenDrawer : CloseDrawer

    component.$nextTick(() => {
      component.$root.$emit(drawerEvent)
    })
  }
}
