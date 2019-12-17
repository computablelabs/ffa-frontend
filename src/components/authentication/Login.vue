<template>
  <div id="login">
    <div class="login-card">
      <h2 class="center">Data DAO needs your permission</h2>
      <h3 class="login-message center">The Data DAO uses Metamask to connect to smart contracts and the Datatrust</h3>
      <DrawerBlockchainStep
        class="center"
        label="Connect to Metamask"
        :useDarkIcons="false"
        :state="metamaskStepState"
        :onButtonClick="onConnectClicked"/>
      <DrawerBlockchainStep
        class="center"
        label="Login to Datatrust"
        :useDarkIcons="false"
        :state="datatrustStepState"
        :onButtonClick="onSignDatatrustClicked"/>
    </div>
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

import '@/assets/style/components/login.sass'

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
    return this.isMetamaskConnected ?
            DrawerBlockchainStepState.completed :
            DrawerBlockchainStepState.ready
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
