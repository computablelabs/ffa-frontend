<!--//
  TODO: This is an EXPERIMENTAL view component and should be DELETED
//-->
<template>
  <section id='listing-detail'>
    <div v-if="!isReady">
      <div class='tile is-vertical'>
        <div class='tile message'>
          Connecting to blockchain
        </div>
        <div class='tile'>
        <font-awesome-icon
          class="fa-spin"
          :icon="['fab', 'ethereum']"
          :class="svgColorClass"/>
        </div>
      </div>
    </div>
    <div v-if="isReady">
      <div class='message'>
        Ready
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'

import { getModule } from 'vuex-module-decorators'
import Web3Module from '../vuexModules/Web3Module'
import FlashesModule from '../vuexModules/FlashesModule'
import ListModule from '../vuexModules/ListModule'
import UploadModule from '../vuexModules/UploadModule'
import FfaListingsModule from '../vuexModules/FfaListingsModule'
import AppModule from '../vuexModules/AppModule'

import ListingModule from '../functionModules/protocol/ListingModule'

import FfaListing from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'

import { Errors, Labels, Messages } from '../util/Constants'

import Web3 from 'web3'

const vuexModuleName = 'listModule'

@Component
export default class FfaListingDetails extends Vue {

  public mounted(this: FfaListingDetails) {
    this.$store.subscribe(this.vuexSubscriptions)
    console.log('FfaListingDetails mounted')
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `appModule/setAppReady`:
        return this.$forceUpdate()
      default:
        return
    }
  }

  private get isReady(): boolean {
    const appModule = getModule(AppModule, this.$store)
    return appModule.appReady
  }
}
</script>
