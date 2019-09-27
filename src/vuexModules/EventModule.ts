import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { Eventable } from '../interfaces/Eventable'

@Module({ namespaced: true, name: 'eventModule' })
export default class EventModule extends VuexModule {
  public eventables: Eventable[] = []

  @Mutation
  public append(eventable: Eventable) {
    this.eventables.push(eventable)
  }
}
