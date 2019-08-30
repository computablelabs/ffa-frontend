<template>
  <section id='ffa-listing'>
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
      '{{ $route.params.status }}'
      '{{ $route.params.listingHash }}'
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

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'

import { Errors, Labels, Messages } from '../util/Constants'

import Web3 from 'web3'

const vuexModuleName = 'listModule'

@Component
export default class FfaListingView extends Vue {

  public beforeCreate(this: FfaListingView) {
    if (this.$route.params.status === undefined || this.$route.params.status.length === 0) {
      this.$router.push('/')
    }
    const statusString = this.$route.params.status
    const typedStatusString = statusString as keyof typeof FfaListingStatus
    const status = FfaListingStatus[typedStatusString]
    if (status === undefined) {
      this.$router.push('/')
    }
  }

  public mounted(this: FfaListingView) {
    this.$store.subscribe(this.vuexSubscriptions)
    console.log('FfaListingView mounted')
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `appModule/setEthereumEnabled`:
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
