<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <router-link to="/">
      <div class="navbar-brand wordmark"/>
    </router-link>
    <div class="navbar-menu">
      <div class="navbar-start">
      </div>
      <div class="navbar-end is-vcentered">

        <div class="navbar-item share">
          <router-link to="/share">Share</router-link>
        </div>

        <div class="navbar-item browse">
          <router-link to="/browse">Browse</router-link>
        </div>

        <div class="navbar-item support">
          <router-link to="/support">Support</router-link>
        </div>

        <div v-show="isConnected" class="navbar-item user-identity">
          <JazzIcon
            class="jazzicon"
            :address="ethAddressString"
            :diameter="24"/>
          <div class="address">{{ ethAddressString }}</div>
        </div>

        <div
          @click="onConnectClicked"
          v-show="!isConnected"
          class="button connect is-primary">
          CONNECT
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import store from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import FlashesModule from '../../vuexModules/FlashesModule'
import AppModule from '../../vuexModules/AppModule'

import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'
import MetamaskModule from '../../functionModules/metamask/MetamaskModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'
import JwtModule from '../../functionModules/jwt/JwtModule'

import { Eventable } from '../../interfaces/Eventable'

import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'
import { MetamaskAccountChanged } from '../../models/Events'

import { Messages, Errors } from '../../util/Constants'

import uuid4 from 'uuid'
import JazzIcon from './JazzIcon.vue'

import '@/assets/style/ui/navigation.sass'

@Component({
  components: {
    JazzIcon,
  },
})
export default class Navigation extends Vue {

  protected processId!: string
  protected message!: string
  protected signature!: string
  protected unsubscribe!: () => void

  protected flashesModule = getModule(FlashesModule, this.$store)
  protected appModule = getModule(AppModule, this.$store)

  @NoCache
  get isConnected() {
    const ethereumDisabled = EthereumModule.ethereumDisabled()
    const hasJwt = getModule(AppModule, this.$store).hasJwt
    return !ethereumDisabled && hasJwt
  }

  @NoCache
  get ethAddressString(): string {
    const ethereumDisabled = EthereumModule.ethereumDisabled()
    if (ethereumDisabled) { return '' }
    return `${ethereum.selectedAddress.substring(0, 6)}...`
  }

  public created() {
    this.$root.$on(MetamaskAccountChanged, this.metamaskAccountChanged)
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted() {
    console.log('Navigation mounted')
  }

  public beforeDestroy() {
    this.$root.$off(MetamaskAccountChanged, this.metamaskAccountChanged)
    this.unsubscribe()
  }

  public async vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') {
      return
    }

    const event = mutation.payload as Eventable

    if (event.processId !== this.processId) {
      return
    }
    if (!!!event.response || !!!this.message) {
      return
    }

    this.signature = event.response.result
    const web3 = this.appModule.web3
    const checksumAddress = web3.utils.toChecksumAddress(ethereum.selectedAddress)
    const [error, jwt] = await DatatrustModule.authorize(this.message!, this.signature!, checksumAddress)
    // const flashesModule = getModule(FlashesModule, this.$store)

    if (error) {
      if (event.error.message.indexOf(Errors.USER_DENIED_SIGNATURE) > 0) {

        return

      } else {
        return
        // return this.flashesModule.append(new Flash(mutation.payload.error, FlashType.error))
      }
    }

    if (jwt) {
      this.appModule.setJwt(jwt!)
      this.$forceUpdate()
      // return flashesModule.append(new Flash('Authorize successful.', FlashType.success))
    }
  }

  public async onConnectClicked(e: Event) {
    const ethereumEnabled = await MetamaskModule.enableEthereum(this.$store)

    if (ethereumEnabled) {
      this.requestJwt()
    }
    this.$forceUpdate()
  }

  public requestJwt() {
    this.processId = uuid4()
    this.message = `timestamp: ${new Date().getTime()}`
    MetamaskModule.sign(this.message, this.processId, this.$store)
  }

  public metamaskAccountChanged() {

    if (EthereumModule.ethereumDisabled()) {

      this.appModule.setJwt(null)

    } else if (!JwtModule.isJwtValid(this.appModule.jwt, this.appModule.web3)) {

      this.appModule.setJwt(null)
      this.requestJwt()

    } else {

      this.requestJwt()
    }
    this.$forceUpdate()
  }

}
</script>
