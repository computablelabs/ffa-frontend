<!--//
  TODO: This is an EXPERIMENTAL view component and should be DELETED
//-->
<template>
  <section id='listing-detail'>
    <div class='message' v-if="isReady">
      Ready
    </div>
    <EthereumLoader v-else />
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

import EthereumLoader from '../components/ui/EthereumLoader.vue'

import Web3 from 'web3'

const vuexModuleName = 'listModule'

@Component({
  components: {
    EthereumLoader,
  },
})
export default class FfaListingDetails extends Vue {
  private appModule: AppModule = getModule(AppModule, this.$store)

  public mounted(this: FfaListingDetails) {
    this.$store.subscribe(this.vuexSubscriptions)
    console.log('FfaListingDetails mounted')
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
    return this.appModule.appReady
  }
}
</script>
