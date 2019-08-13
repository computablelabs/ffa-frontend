<template>
  <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
      </div>
      <div class="navbar-end is-vcentered">
        <div class="navbar-item share">
          <router-link to="/list">Share</router-link>
        </div>
        <div class="navbar-item browse">
          <router-link to="/">Browse</router-link>
        </div>
        <div class="navbar-item support">
          <router-link to="/">Support</router-link>
        </div>
        <div class="navbar-item connect">
          <a href="" @click="setPublicKey">Connect</a>
        </div>
        <div class="tile">
          <img class="logo" src="http://placekitten.com/60/60"/>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import MetaMaskModule from '../../vuexModules/MetaMaskModule'
import { enable } from '../../util/Metamask'
import { Messages, Errors } from '../../util/Constants'
import { getModule } from 'vuex-module-decorators'
import FlashesModule from '../../vuexModules/FlashesModule'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'
import Web3Module from '../../vuexModules/Web3Module'
import { enableEthereum } from '../../util/Metamask'
import { NoCache } from 'vue-class-decorator'

import '@/assets/style/ui/navigation.sass'
import ContractsAddresses from '../../models/ContractAddresses'

@Component
export default class Navigation extends Vue {
  protected async setPublicKey(e: Event) {
    e.preventDefault()
    e.stopPropagation()
    const flashesModule = getModule(FlashesModule, this.$store)
    const metaMaskModule = getModule(MetaMaskModule, this.$store)
    const web3Module = getModule(Web3Module, this.$store)
    enableEthereum(flashesModule, metaMaskModule, web3Module)
  }
}
</script>
