import {Module, VuexModule, Mutation, MutationAction} from 'vuex-module-decorators'
import MetaMask from '../models/MetaMask'

@Module({ namespaced: true, name: 'metaMaskModule' })
export default class MetaMaskModule extends VuexModule {
  public publicKey: string = ''

  @Mutation
  public setPublicKey(publicKey: string) {
    this.publicKey = publicKey
  }
}
