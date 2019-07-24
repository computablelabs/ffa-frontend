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
        <!-- <div class="tile">
          <img class="logo" src="http://placekitten.com/60/60"/>
        </div> -->
        <div>
          <a href="" v-on:click="setAddress">Connect</a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import MetaMaskModule from '../../modules/MetaMaskModule'
import { enable } from '../../util/Metamask'
import { Errors } from '../../util/Constants'
import { getModule } from 'vuex-module-decorators'
import FlashesModule from '../../modules/FlashesModule'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'

import '@/assets/style/ui/navigation.sass'

@Component
export default class Navigation extends Vue {
  protected async setAddress(e: Event) {
    e.preventDefault()
    e.stopPropagation()
    const flashesModule = getModule(FlashesModule, this.$store)
    const metaMaskModule = getModule(MetaMaskModule, this.$store)

    const result = await enable()
    // console.log(result)
    if (typeof result !== 'string') {
      const flash = new Flash(Errors.METAMASK_NOT_CONNECTED, FlashType.error)
      flashesModule.append(flash)
    } else {
      metaMaskModule.setAddress(result)
      const flash = new Flash('MetMask Connected', FlashType.info)
      flashesModule.append(flash)
    }
  }
}
</script>