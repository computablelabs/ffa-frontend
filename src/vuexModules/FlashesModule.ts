import {Module, VuexModule, Mutation, MutationAction} from 'vuex-module-decorators'
import Flash from '../models/Flash'

@Module({ namespaced: true, name: 'flashesModule' })
export default class FlashesModule extends VuexModule {
  public flashes: Flash[] = []

  @Mutation
  public append(flash: Flash) {
    const filtered = this.flashes.filter((f) => f.message === flash.message && f.type === flash.type)
    if (filtered.length > 0) {
      return
    }
    this.flashes.push(flash)
  }

  @Mutation
  public remove(flashId: string) {
    this.flashes = this.flashes.filter((flash) => flash.id !== flashId)
  }
}
