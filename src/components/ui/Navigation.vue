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

        <!-- scaffolding -->
        <div class="navbar-item browse">
          <router-link to="/browse">Browse</router-link>
        </div>

        <div class="navbar-item support">
          <router-link to="/support">Support</router-link>
        </div>

        <div v-show="isConnected" class="navbar-item user-identity">
          <JazzIcon
            class="jazzicon"
            :address="ethAddress" 
            :diameter="24"/>
          <div class="address">{{ ethAddressString }}</div>
        </div>

        <div
          @click="setPublicKey" 
          v-show="!isConnected"
          class="button connect is-primary">
          CONNECT
        </div>

        <!-- <div class="connect" v-show="!isConnected">
          <a href="" @click="setPublicKey" class="button is-medium">START</a>
        </div> -->

        <!-- <div class="authorize">
          <JWTAuthorization />
        </div> -->

      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import store from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import FlashesModule from '../../vuexModules/FlashesModule'

import MetamaskModule from '../../functionModules/metamask/MetamaskModule'

import ContractAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'

import { Messages, Errors } from '../../util/Constants'

// import JWTAuthorization from './JWTAuthorization.vue'
import JazzIcon from './JazzIcon.vue'

import '@/assets/style/ui/navigation.sass'

@Component({
  components: {
    JazzIcon,
    // JWTAuthorization,
  },
})
export default class Navigation extends Vue {

  public mounted(this: Navigation) {
    console.log('Navigation mounted')
  }

  protected async setPublicKey(e: Event) {
    e.preventDefault()
    e.stopPropagation()
    const flashesModule = getModule(FlashesModule, this.$store)
    MetamaskModule.enableEthereum(this.$store)
  }

  get isEthereumDefined() {
    return (typeof ethereum !== 'undefined')
  }

  get isConnected() {
    return this.isEthereumDefined && !!ethereum.selectedAddress
  }

  get ethAddressString(): string {
    if (!ethereum.selectedAddress) { return '' }
    return `${ethereum.selectedAddress.substring(0, 6)}...`
  }

  get ethAddress(): string {
    return ethereum.selectedAddress
  }
}
</script>
