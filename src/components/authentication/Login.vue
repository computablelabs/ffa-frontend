<template>
  <div>
    <h2>Data DAO needs your permission</h2>
    <h3>The Data DAO uses Metamask to connect to smart contracts and the Datatrust</h3>

    <DrawerBlockchainStep
      label="Connect to Metamask"
      :state="metamaskStepState"
      :onButtonClick="onConnectClicked"/>

    <DrawerBlockchainStep
      label="Login to Datatrust"
      :state="datatrustStepState"
      :onButtonClick="onSignDatatrustClicked"/>
  </div>
</template>

<script lang="ts">
import { MutationPayload } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import uuid4 from 'uuid'

import DrawerBlockchainStep from '../../../src/components/ui/DrawerBlockchainStep.vue'

import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import MetamaskModule from '../../functionModules/metamask/MetamaskModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'
import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'

import AppModule from '../../vuexModules/AppModule'

import { Eventable } from '../../interfaces/Eventable'
import { Errors } from '../../util/Constants'

@Component({
  components: {
    DrawerBlockchainStep,
  },
})
export default class Login extends Vue {

  public processId!: string
  public message!: string
  public signature!: string

  public isAuthorizationProcessing = false

  public drawerStepState = DrawerBlockchainStepState.ready
  public appModule = getModule(AppModule, this.$store)
  public unsubscribe!: () => void

  get isMetamaskConnected(): boolean {
    return !EthereumModule.ethereumDisabled()
  }

  get isDatatrustAuthorized(): boolean {
    return this.appModule.hasJwt
  }

  get metamaskStepState(): DrawerBlockchainStepState {
    switch (this.isMetamaskConnected) {
      case true:
        return DrawerBlockchainStepState.completed
      case false:
        return DrawerBlockchainStepState.ready
      default:
        return DrawerBlockchainStepState.ready
    }
  }

  get datatrustStepState(): DrawerBlockchainStepState {
    if (!this.isMetamaskConnected) { return DrawerBlockchainStepState.upcoming }  
    if (this.isAuthorizationProcessing) { return DrawerBlockchainStepState.processing }
    if (this.isDatatrustAuthorized) { return DrawerBlockchainStepState.completed }
    return DrawerBlockchainStepState.ready
  }

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public async vuexSubscriptions(mutation: MutationPayload) {
    if (mutation.type !== 'eventModule/append') { return }

    const event = mutation.payload as Eventable

    if (event.processId !== this.processId || (!!!event.response || !!!this.message)) {
      return
    }

    this.signature = event.response.result
    const checksumAddress = this.appModule.web3.utils.toChecksumAddress(ethereum.selectedAddress)

    const [error, jwt] = await DatatrustModule.authorize(
      this.message!, 
      this.signature!, 
      checksumAddress)

    if (error) {
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) >= 0) {
        return
      }
      // TODO : Handle error
      return 
    }

    if (jwt) { this.appModule.setJwt(jwt!) }

    this.isAuthorizationProcessing = false
    this.processId = ''
  }

  public async onConnectClicked() {
    await MetamaskModule.enableEthereum(this.$store)
  }

  public onSignDatatrustClicked() {
    this.processId = uuid4()
    this.message = `timestamp: ${new Date().getTime()}`
    this.isAuthorizationProcessing = true
    MetamaskModule.sign(this.message, this.processId, this.$store)
  }
 }
</script>
