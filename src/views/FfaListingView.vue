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

import SharedModule from '../functionModules/components/SharedModule'
import ListingModule from '../functionModules/protocol/ListingModule'
import FfaListingViewModule from '../functionModules/views/FfaListingViewModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'
import ContractsAddresses from '../models/ContractAddresses'

import { Errors, Labels, Messages } from '../util/Constants'

import Web3 from 'web3'
import EthereumModule from '../functionModules/ethereum/EthereumModule'

const vuexModuleName = 'listModule'

@Component
export default class FfaListingView extends Vue {

  @Prop()
  public status?: FfaListingStatus

  @Prop()
  public listingHash?: string

  @Prop()
  public walletAddress?: string

  @Prop({ default: false })
  public requiresWeb3?: boolean

  @Prop({ default: false })
  public requiresMetamask?: boolean

  @Prop({ default: false })
  public requiresParameters?: boolean

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
    const appModule = getModule(AppModule, this.$store)
    const flashesModule = getModule(FlashesModule, this.$store)

    EthereumModule.setEthereum(this.requiresWeb3!, this.requiresMetamask!, this.requiresParameters!,
      appModule, web3Module, flashesModule)
  }

  public mounted(this: FfaListingView) {
    console.log('FfaListingView mounted')
  }

  private get isReady(): boolean {
    const appModule = getModule(AppModule, this.$store)
    const web3Module = getModule(Web3Module, this.$store)

    return SharedModule.isReady(this.requiresWeb3!, this.requiresMetamask!, this.requiresParameters!,
      appModule, web3Module)
  }
}
</script>
