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
      <VerticalSubway
        :voteBy="voteBy"
        :plurality="plurality"
        :votingFinished="false" />
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
import VotingContractModule from '../../src/functionModules/protocol/VotingContractModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'
import ContractsAddresses from '../models/ContractAddresses'

import { Errors, Labels, Messages } from '../util/Constants'

import EthereumLoader from '../components/ui/EthereumLoader.vue'
import VerticalSubway from '../components/ui/VerticalSubway.vue'

import Web3 from 'web3'
import EthereumModule from '../functionModules/ethereum/EthereumModule'
import VotingModule from '../vuexModules/VotingModule'

import CandidateObject from '../../src/interfaces/Candidate'
import ParameterizerContractModule from '../functionModules/protocol/ParameterizerContractModule';

const vuexModuleName = 'newListingModule'
const appVuexModule = 'appModule'

@Component({
  components: {
    EthereumLoader,
    VerticalSubway,
  },
})
export default class FfaCandidateView extends Vue {

  public get canVote(): boolean {
    return this.appModule.canVote
  }

  protected get isReady(): boolean {

    const prerequisitesMet = SharedModule.isReady(
                            this.requiresWeb3!,
                            this.requiresMetamask!,
                            this.requiresParameters!,
                            this.appModule,
                            this.web3Module)
    return prerequisitesMet && this.statusVerified && this.candidateFetched
  }

  protected get plurality() {
    return this.appModule.plurality
  }

  protected get voteBy() {
    return this.appModule.voteBy
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
  protected candidateFetched = false
  // protected candidate?: CandidateObject|object
  protected candidateKind?: number
  protected candidateOwner?: string
  protected candidateStake?: number
  protected candidateVoteBy?: number
  protected candidateYea?: number
  protected candidateNay?: number


  private appModule: AppModule = getModule(AppModule, this.$store)
  private web3Module: Web3Module = getModule(Web3Module, this.$store)
  private flashesModule: FlashesModule = getModule(FlashesModule, this.$store)

  public async mounted(this: FfaCandidateView) {
    console.log('FfaCandidateView mounted')
  }

  protected async created(this: FfaCandidateView) {

    if (!this.status || !this.listingHash) {
      this.$router.replace('/')
    }

    this.$store.subscribe(this.vuexSubscriptions)

    await EthereumModule.setEthereum(
        this.requiresWeb3!,
        this.requiresMetamask!,
        this.requiresParameters!,
        this.appModule,
        this.web3Module,
        this.flashesModule)
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {

    switch (mutation.type) {
      case `${appVuexModule}/setAppReady`:

        if (!!!mutation.payload) { return }

        const redirect = await FfaListingViewModule.getStatusRedirect(
                                ethereum.selectedAddress,
                                this.web3Module.web3.utils.stringToHex(this.listingHash!),
                                this.status!,
                                this.$router.currentRoute.fullPath,
                                this.web3Module)
        if (!!redirect) {
          return this.$router.replace(redirect!)
        }

        this.statusVerified = true
        console.log(`==> ${this.statusVerified}`)
        // TODO: load candidate details here, don't expect a return, just mutate state

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
