<template>
  <section id='ffa-candidate'>
    <h1>Candidate View</h1>
    <h2>status: {{ status }} </h2>
    <h2>listing hash: {{ listingHash }}</h2>
    <h2>wallet address: {{ walletAddress }}</h2>
    <h2>stats verified : {{ statusVerified }}</h2>
    <div v-if="isReady">
      <!-- TODO: replace with actual candidate components here -->
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
import NewListingModule from '../vuexModules/NewListingModule'
import UploadModule from '../vuexModules/UploadModule'
import FfaListingsModule from '../vuexModules/FfaListingsModule'
import AppModule from '../vuexModules/AppModule'

import SharedModule from '../functionModules/components/SharedModule'
import ListingModule from '../functionModules/protocol/ListingContractModule'
import VotingContractModule from '../functionModules/protocol/VotingContractModule'
import FfaListingViewModule from '../functionModules/views/FfaListingViewModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'
import ContractsAddresses from '../models/ContractAddresses'

import { Errors, Labels, Messages } from '../util/Constants'

import EthereumLoader from '../components/ui/EthereumLoader.vue'

import Web3 from 'web3'
import EthereumModule from '../functionModules/ethereum/EthereumModule'
import VotingModule from '../vuexModules/VotingModule'

const vuexModuleName = 'newListingModule'
const appVuexModule = 'appModule'

@Component({
  components: {
    EthereumLoader,
  },
})
export default class FfaCandidateView extends Vue {

    public get canVote(): boolean {
    const appModule = getModule(AppModule, this.$store)
    return appModule.canVote
  }

  protected get isReady(): boolean {
    const appModule = getModule(AppModule, this.$store)
    const web3Module = getModule(Web3Module, this.$store)

    let prerequisitesMet = SharedModule.isReady(this.requiresWeb3!, this.requiresMetamask!,
      this.requiresParameters!, appModule, web3Module)

    prerequisitesMet = prerequisitesMet && this.statusVerified

    return prerequisitesMet && this.candidateFetched
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

  protected statusVerified = false
  protected candidateFetched = true

  public mounted(this: FfaCandidateView) {
    console.log('FfaCandidateView mounted')
  }

  protected async created(this: FfaCandidateView) {

    const web3Module = getModule(Web3Module, this.$store)
    const appModule = getModule(AppModule, this.$store)
    const flashesModule = getModule(FlashesModule, this.$store)

    if (!this.status || !this.listingHash) {
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
          return this.$router.replace(redirect!)
        }

        this.statusVerified = true

        // TODO: load candidate details here, don't expect a return, just mutate state
        console.log(`==> ${this.statusVerified}`)
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
