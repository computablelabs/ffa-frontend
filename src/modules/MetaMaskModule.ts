import {Module, VuexModule, Mutation, MutationAction} from 'vuex-module-decorators'
import MetaMask from '../models/MetaMask'

@Module({ namespaced: true, name: 'metaMaskModule' })
export default class MetaMaskModule extends VuexModule {
  public publicWalletAddress: string = ''

  @Mutation
  public setPublicWalletAddress(publicWalletAddress: string) {
    this.publicWalletAddress = publicWalletAddress
  }
}
