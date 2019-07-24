import {Module, VuexModule, Mutation, MutationAction} from 'vuex-module-decorators'
import MetaMask from '../models/MetaMask'

@Module({ namespaced: true, name: 'metaMaskModule' })
export default class MetaMaskModule extends VuexModule {
  public address: string = ''

  @Mutation
  public setAddress(address: string) {
    this.address = address
  }
}