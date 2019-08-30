<template>
  <section id='single-listing'>
    <h2>status: {{ status }} </h2>
    <h2>listing hash: {{ listingHash }}</h2>
    <h2>wallet address: {{ walletAddress }}</h2>
    <div v-if="isReady">
      <div class='message'>
        Ready
      </div>
    </div>
    <EthereumLoader v-else />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
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
import FfaListingViewModule from '../functionModules/views/FfaListingViewModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'
import ContractsAddresses from '../models/ContractAddresses'

import { Errors, Labels, Messages } from '../util/Constants'

import Web3 from 'web3'

const vuexModuleName = 'listModule'

@Component
export default class FfaListingView extends Vue {

  @Prop()
  public status?: FfaListingStatus

  @Prop()
  public listingHash?: string

  @Prop()
  public walletAddress?: string

  private statusValidated = false
  private componentReady = false

  public async created(this: FfaListingView) {
    if (this.$props.status === undefined || this.$props.status.length === 0) {
      this.$router.push('/')
    }
    const statusString = this.$props.status
    const typedStatusString = statusString as keyof typeof FfaListingStatus
    const parsedStatus = FfaListingStatus[typedStatusString]

    if (parsedStatus === undefined) {
      this.$router.push('/')
    }


    const web3Module = getModule(Web3Module, this.$store)

    if (web3Module.web3 !== undefined && web3Module.web3.eth !== undefined) {
      console.log('!!!!')
      const redirect = await FfaListingViewModule.getRedirect(
        ethereum.selectedAddress, this.$props.listingHash, this.$props.status,
        this.$route.fullPath, web3Module)
      console.log('>>> ' + redirect)
      if (redirect !== undefined) {
        this.$router.replace(redirect)
      }

      this.statusValidated = true
    }
  }

  public mounted(this: FfaListingView) {
    this.$store.subscribe(this.vuexSubscriptions)
    console.log('FfaListingView mounted')
  }

  private async vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `appModule/setEthereumEnabled`:
        console.log('!!!')
        const web3Module = getModule(Web3Module, this.$store)
        if (web3Module.web3 !== undefined && web3Module.web3.eth !== undefined) {

          const redirect = await FfaListingViewModule.getRedirect(
            ethereum.selectedAddress, this.$props.listingHash, this.$props.status,
            this.$route.fullPath, web3Module)
          console.log('///> ' + redirect)
          if (redirect !== undefined) {
            this.$router.replace(redirect)
          }

          this.statusValidated = true
        }
        return // this.$forceUpdate()
      default:
        return
    }
  }

  private get isReady(): boolean {
    const appModule = getModule(AppModule, this.$store)
    return appModule.appReady && this.statusValidated
  }
}
</script>
