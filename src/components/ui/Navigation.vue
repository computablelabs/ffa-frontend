<template>
  <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
      </div>
      <div class="navbar-end is-vcentered">
        <div class="navbar-item share">
          <router-link to="/listings/new">Share</router-link>
        </div>
        <div class="navbar-item browse">
          <router-link to="/">Browse</router-link>
        </div>
        <div class="navbar-item support">
          <router-link to="/">Support</router-link>
        </div>
        <div class="connect" v-show="!isConnected">
          <a href="" @click="setPublicKey" class="button is-medium">START</a>
        </div>
        <div class="authorize">
          <JWTAuthorization />
        </div>
        <div class="tile" v-show="isConnected">
          <img class="logo" src="http://placekitten.com/30/30"/>
          <span class="name">
            Angry Zebra
          </span>
        </div>
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
import Web3Module from '../../vuexModules/Web3Module'

import MetamaskModule from '../../functionModules/metamask/MetamaskModule'

import ContractsAddresses from '../../models/ContractAddresses'
import Flash, { FlashType } from '../../models/Flash'

import { Messages, Errors } from '../../util/Constants'

import JWTAuthorization from './JWTAuthorization.vue'

import '@/assets/style/ui/navigation.sass'

@Component({
  components: {
    JWTAuthorization,
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
}
</script>
