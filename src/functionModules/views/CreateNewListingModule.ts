import Vue from 'vue'
import Router, { Route } from 'vue-router'
import { CloseDrawer, OpenDrawer } from '../../models/Events'

export default class CreateNewListingModule {

  public static emitDrawerEvent(component: Vue, currentRoute: Route) {
    const resolved = component.$router.resolve({name: 'createNewListingAction'})
    const drawerEvent = currentRoute.path === resolved.route.path ? OpenDrawer : CloseDrawer

    component.$nextTick(() => {
      console.log(`emitDrawerEvent() emitting: ${drawerEvent}`)
      component.$root.$emit(drawerEvent)
    })
  }

  public static redirectTo(routeName: string, router: Router) {
    console.log(`redirectTo: ${routeName}`)
    const resolved = router.resolve({name: routeName})
    if (router.currentRoute.path === resolved.route.path) {
      return
    }
    router.push(resolved.route)
  }
}
