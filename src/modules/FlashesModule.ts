
import {Module, VuexModule, Mutation, MutationAction} from 'vuex-module-decorators'
import Flash from '../models/Flash'

@Module({ namespaced: true, name: 'flashesModule' })
export default class FlashesModule extends VuexModule {
  public flashes: Flash[] = []

  // @MutationAction({mutate: ['flashes']})
  // public async fetchAll() {
  //   const response = [{}] // : Response = await getJSON('https://hasgeek.github.io/events/api/events.json')
  //   return response
  // }

  @Mutation
  public append(flash: Flash) {
    this.flashes.push(flash)
  }

  @Mutation
  public remove(flashId: string) {
    this.flashes = this.flashes.filter((flash) => flash.id !== flashId)
  }
}
