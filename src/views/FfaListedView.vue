<template>
  <section id='ffa-listed'>
    <h1>Listed View</h1>
    <h2>status: {{ status }} </h2>
    <h2>listing hash: {{ listingHash }}</h2>
    <h2>wallet address: {{ walletAddress }}</h2>
    <h2>purchased: {{ hasPurchased }}</h2>
    <h2>status verified: {{ statusVerified }}</h2>
    <div v-if="isReady">
      <div class="tile is-ancestor is-hcentered">
        <div class="tile is-ancestor is-8">
          <div class="tile is-2">
            <FileUploader viewOnly="true"/>
          </div>
          <div class="tile">
            <StaticFileMetadata :ffaListing="ffaListing"/>
          </div>
        </div>
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
import NewListingModule from '../vuexModules/NewListingModule'
import UploadModule from '../vuexModules/UploadModule'
import FfaListingsModule from '../vuexModules/FfaListingsModule'
import AppModule from '../vuexModules/AppModule'

import SharedModule from '../functionModules/components/SharedModule'
import FfaListingViewModule from '../functionModules/views/FfaListingViewModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'
import ContractsAddresses from '../models/ContractAddresses'

import { Errors, Labels, Messages } from '../util/Constants'

import StaticFileMetadata from '../components/ui/StaticFileMetadata.vue'
import EthereumLoader from '../components/ui/EthereumLoader.vue'
import FileUploader from '../components/listing/FileUploader.vue'

import Web3 from 'web3'
import EthereumModule from '../functionModules/ethereum/EthereumModule'
import VotingModule from '../vuexModules/VotingModule'
import FileUploader from '../components/listing/FileUploader.vue'

const vuexModuleName = 'newListingModule'
const appVuexModule = 'appModule'

@Component({
  components: {
    StaticFileMetadata,
    EthereumLoader,
    FileUploader,
  },
})
export default class FfaListedView extends Vue {

  protected get hasPurchased(): boolean {
    return false
  }

  protected get isReady(): boolean {
    const appModule = getModule(AppModule, this.$store)
    const web3Module = getModule(Web3Module, this.$store)

    const prerequisitesMet = SharedModule.isReady(this.requiresWeb3!, this.requiresMetamask!,
      this.requiresParameters!, appModule, web3Module)

    return prerequisitesMet && this.statusVerified && this.candidateFetched
  }

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

  public get ffaListing(): FfaListing|undefined {

    if (!this.status && !this.listingHash) {
      return undefined
    }

    const ffaListingsModule = getModule(FfaListingsModule, this.$store)
    return ffaListingsModule.listed.find((l) => l.hash === this.listingHash)
  }

  protected statusVerified = false
  protected candidateFetched = true

  public mounted(this: FfaListedView) {
    console.log('FfaListedView mounted')
  }

  protected async created(this: FfaListedView) {

    const web3Module = getModule(Web3Module, this.$store)
    const appModule = getModule(AppModule, this.$store)
    const flashesModule = getModule(FlashesModule, this.$store)

    if (!this.status || !this.listingHash) {
      console.log('no status or listingHash!')
      this.$router.replace('/')
    }

    this.$store.subscribe(this.vuexSubscriptions)

    EthereumModule.setEthereum(this.requiresWeb3!, this.requiresMetamask!, this.requiresParameters!,
      appModule, web3Module, flashesModule)
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    const web3Module = getModule(Web3Module, this.$store)

    switch (mutation.type) {
      case `${appVuexModule}/setAppReady`:

        if (!!!mutation.payload) { return }

        const redirect = await FfaListingViewModule.getStatusRedirect(ethereum.selectedAddress,
          this.listingHash!, this.status!, this.$router.currentRoute.fullPath, web3Module)

        if (!!redirect) {
          console.log(`redirect ${redirect} has value!`)
          return this.$router.replace(redirect!)
        }

        this.statusVerified = true

        // TODO: load listed details here, don't expect a return, just mutate state

        return this.$forceUpdate()

      // TODO: catch that mutation here
      // case someOtherCaseThatSetsCandidateDetails:
      //   candidateFetched = true
      default:
        return
    }
  }
}
</script>
