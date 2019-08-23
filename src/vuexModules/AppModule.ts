import {
  Module,
  VuexModule,
  Mutation,
  MutationAction } from 'vuex-module-decorators'

@Module({ namespaced: true, name: 'appModule' })
export default class AppModule extends VuexModule {

  public appReady = false

  @Mutation
  public setAppReady(appReady: boolean) {
    this.appReady = appReady
  }
}
