import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'
import Web3 from 'web3'

@Module({ namespaced: true, name: 'web3Module' })
export default class Web3Module extends VuexModule {

  public web3: Web3 = Object()

  @Mutation
  public initialize(provider: any) {
    this.web3 = new Web3(provider)
  }

  @Mutation
  public disconnect() {
    this.web3 = Object()
  }
}
