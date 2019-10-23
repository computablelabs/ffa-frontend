import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'

export enum DrawerState {
  beforeProcessing,
  processing,
  afterProcessing,
}

export enum DrawerMode {
  listing,
  buying,
}

@Module({ namespaced: true, name: 'drawerModule' })
export default class DrawerModule extends VuexModule {

  public status = DrawerState.beforeProcessing
  public mode = DrawerMode.listing
  public canClose = false // allow user to close drawer

  @Mutation
  public setDrawerState(status: DrawerState) {
    this.status = status
  }

  @Mutation
  public setDrawerMode(mode: DrawerMode) {
    this.mode = mode
  }

  @Mutation
  public setDrawerCanClose(canClose: boolean) {
    this.canClose = canClose
  }
}
