import Vue from 'vue'
import Router, { Route } from 'vue-router'
import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import NewListingModule from '../../vuexModules/NewListingModule'
import UploadModule from '../../vuexModules/UploadModule'

import { CloseDrawer, OpenDrawer } from '../../models/Events'

export default class CreateNewListingModule {

  public static emitDrawerEvent(component: Vue, currentRoute: Route): string {
    const resolved = component.$router.resolve({name: 'createNewListingAction'})
    return currentRoute.path === resolved.route.path ? OpenDrawer : CloseDrawer
  }

  public static isValid(appStore: Store<any>): boolean {
    const uploadModule = getModule(UploadModule, appStore)
    return uploadModule.hasFile &&
      uploadModule.hash.length > 0 &&
      uploadModule.filename.length > 0 &&
      uploadModule.description.length > 0
  }
}
