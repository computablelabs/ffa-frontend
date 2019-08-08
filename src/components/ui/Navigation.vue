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
        <div class="navbar-item connect" v-if="!isConnected">
          <a href="" @click="setPublicKey">Connect</a>
        </div>
        <jazzicon :address="publicKey" :diameter="60" v-if="isConnected"/>
        <div class="tile" v-else>
          <img class="logo" src="http://placekitten.com/60/60"/>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import MetaMaskModule from '../../modules/MetaMaskModule'
import { enable } from '../../util/Metamask'
import { Messages, Errors } from '../../util/Constants'
import { getModule } from 'vuex-module-decorators'
import FlashesModule from '../../modules/FlashesModule'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'
import Web3Module from '../../modules/Web3Module'
import { setPublicKey } from '../../util/Metamask'
//  @ts-ignore
import Jazzicon from 'vue-jazzicon'

import '@/assets/style/ui/navigation.sass'
import ContractsAddresses from '../../models/ContractAddresses'

@Component({
  components: {
    [Jazzicon.name]: Jazzicon,
  },
})
export default class Navigation extends Vue {

  get publicKey() {
    return this.isEthGlobalDefined ? ethereum.selectedAddress : ''
  }

  get isEthGlobalDefined() {
    return typeof ethereum !== 'undefined'
  }

  get isConnected() {
    const metaMaskModule = getModule(MetaMaskModule, this.$store)
    return metaMaskModule.publicKey !== ''
  }
  protected async setPublicKey(e: Event) {

    e.preventDefault()
    e.stopPropagation()

    const flashesModule = getModule(FlashesModule, this.$store)
    const metaMaskModule = getModule(MetaMaskModule, this.$store)
    const web3Module = getModule(Web3Module, this.$store)

    setPublicKey(flashesModule, metaMaskModule, web3Module)
  }
}
</script>
