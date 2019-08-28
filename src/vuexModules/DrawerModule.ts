import {
  Module,
  VuexModule,
  Mutation,
  MutationAction } from 'vuex-module-decorators'

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

  public drawerState = DrawerState.beforeProcessing
  public drawerMode = DrawerMode.listing

  @Mutation
  public setDrawerState(drawerState: DrawerState) {
    this.drawerState = drawerState
  }

  @Mutation
  public setDrawerMode(drawerMode: DrawerMode) {
    this.drawerMode = drawerMode
  }
}
