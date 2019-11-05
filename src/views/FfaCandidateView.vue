<template>
  <section id='ffa-candidate'>
    <div v-if="isReady" class="vsubway-wrapper">
      <RouterTabs
        :mapping="routerTabMapping"
        :selected="selectedTab"/>
      <div class="container">
        <div class="banner" :class="bannerIconClass">
          {{ bannerText }}
        </div>
        <!-- Listing -->
        <StaticFileMetadata
          v-show="candidateExists && selectedTab === listing"
          :ffaListing="candidate" />
        <!-- Details -->
        <VerticalSubway
          v-show="candidateExists && selectedTab === details"
          @vote-clicked="onVoteClick"
          :listingHash="listingHash"
          :listing="candidate"
          :plurality="plurality"
          :voteBy="voteBy"
          :isVotingClosed="isVotingClosed"
          :onVoteButtonClicked="onVoteButtonClicked"
          :onResolveApplicationButtonClicked="onResolveApplicationButtonClicked"
          :onResolveChallengeButtonClicked="onResolveChallengeButtonClicked" />
      </div>
    </div>
    <EthereumLoader v-else />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import axios from 'axios'

import { getModule } from 'vuex-module-decorators'
import FlashesModule from '../vuexModules/FlashesModule'
import NewListingModule from '../vuexModules/NewListingModule'
import UploadModule from '../vuexModules/UploadModule'
import FfaListingsModule from '../vuexModules/FfaListingsModule'
import AppModule from '../vuexModules/AppModule'
import VotingModule from '../vuexModules/VotingModule'
import DrawerModule from '../vuexModules/DrawerModule'

import SharedModule from '../functionModules/components/SharedModule'
import FfaListingViewModule from '../functionModules/views/FfaListingViewModule'
import VotingProcessModule from '../functionModules/components/VotingProcessModule'
import PurchaseProcessModule from '../functionModules/components/PurchaseProcessModule'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'
import EthereumModule from '../functionModules/ethereum/EthereumModule'

import VotingContractModule from '../../src/functionModules/protocol/VotingContractModule'
import ParameterizerContractModule from '../functionModules/protocol/ParameterizerContractModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import { ProcessStatus } from '../models/ProcessStatus'
import ContractsAddresses from '../models/ContractAddresses'
import { OpenDrawer, DrawerClosed } from '../models/Events'
import RouterTabMapping from '../models/RouterTabMapping'

import { Errors, Labels, Messages } from '../util/Constants'

import EthereumLoader from '../components/ui/EthereumLoader.vue'
import StaticFileMetadata from '../components/ui/StaticFileMetadata.vue'
import RouterTabs from '@/components/ui/RouterTabs.vue'

import VerticalSubway from '../components/voting/VerticalSubway.vue'
import VotingInterface from '../components/voting/VotingInterface.vue'

import Web3 from 'web3'

import CandidateObject from '../../src/interfaces/Candidate'

import '@/assets/style/components/voting.sass'

@Component({
  components: {
    EthereumLoader,
    VerticalSubway,
    StaticFileMetadata,
    VotingInterface,
    RouterTabs,
  },
})
export default class FfaCandidateView extends Vue {

  public get prerequisitesMet(): boolean {
    return SharedModule.isReady(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)
  }

  public get isReady(): boolean {
    return this.prerequisitesMet && this.statusVerified && this.candidateFetched
  }

  public get canVote(): boolean {
    return this.appModule.canVote
  }

  public get plurality() {
    return this.appModule.plurality
  }

  get candidate(): FfaListing {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)!
  }

  get candidateExists(): boolean {
    return this.candidateFetched && !!this.candidate
  }

  get bannerIconClass(): string {
    return 'voting-dark-icon'
  }

  get bannerText(): string {
    const votingText = this.canVote && !this.isVotingClosed ?
      Labels.VOTING_IS_OPEN : ''

    return `${Labels.THIS_IS_A_CANDIDATE} ${votingText}`
  }

  @NoCache
  get voteBy(): number {
    return this.votingModule.voteBy
  }

  @NoCache
  get isVotingClosed(): boolean {
    if (!this.voteBy) {
      return true
    }
    return new Date().getTime() > this.voteBy
  }

  public routerTabMapping: RouterTabMapping[] = []

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

  @Prop()
  public selectedTab?: string

  @Prop()
  public raiseDrawer?: boolean

  public statusVerified = false
  public candidateFetched = false
  public listing = Labels.LISTING
  public details = Labels.DETAILS

  public appModule = getModule(AppModule, this.$store)
  public votingModule = getModule(VotingModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)
  public ffaListingsModule = getModule(FfaListingsModule, this.$store)
  public drawerModule = getModule(DrawerModule, this.$store)


  public async created(this: FfaCandidateView) {

    this.votingModule.reset()

    if (!this.status || !this.listingHash) {
      this.$router.replace('/')
    }

    const resolvedSingleCandidate = this.$router.resolve('singleCandidate')
    const resolvedSingleCandidateDetails = this.$router.resolve('singleCandidateDetails')

    this.routerTabMapping.push({
      route: {
        name: 'singleCandidate',
        params: {
          listingHash: this.listingHash!,
        },
      },
      label: this.listing,
    })
    this.routerTabMapping.push({
      route: {
        name: 'singleCandidateDetails',
        params: {
          listingHash: this.listingHash!,
        },
      },
      label: this.details,
    })

    this.$root.$on(DrawerClosed, this.onDrawerClosed)
    this.$store.subscribe(this.vuexSubscriptions)

    await EthereumModule.setEthereum(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)
 }

  public async mounted(this: FfaCandidateView) {
    console.log('FfaCandidateView mounted')
  }

  public beforeDestroy() {
    this.$root.$off(DrawerClosed, this.onDrawerClosed)
  }

  public async vuexSubscriptions(mutation: MutationPayload, state: any) {

    switch (mutation.type) {

      case 'appModule/setAppReady':

        if (!!!mutation.payload) { return }

        switch (this.$router.currentRoute.name) {
          case 'singleCandidate':
          case 'singleCandidateDetails':
          case 'singleCandidateVote':
          case 'singleCandidateResolve':
          case 'singleCandidateCreated':
            break
          default:
            return
        }

        if (this.listingHash! !== this.$router.currentRoute.params.listingHash) {
          console.log('LISTING HASH MISMATCH!')
          return
        }

        const redirect = await FfaListingViewModule.getStatusRedirect(
          ethereum.selectedAddress,
          this.listingHash!,
          this.status!,
          this.$router.currentRoute.fullPath,
          this.appModule)

        if (!!redirect) {
          return this.$router.replace(redirect!)
        }

        this.statusVerified = true

        const [error, candidates, lastCandidateBlock] = await DatatrustModule.getCandidates()
        this.ffaListingsModule.setCandidates(candidates!)

        // Update the candidate information from the blockchain call
        await VotingProcessModule.updateCandidateDetails(this.$store, this.listingHash!)

        const candidate = this.filterCandidate(this.listingHash!)
        this.votingModule.setCandidate(candidate)

      case 'ffaListingsModule/setCandidateDetails':
        this.candidateFetched = true
        return this.$forceUpdate()
    }
  }

  public filterCandidate(listingHash: string): FfaListing {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)!
  }

  public onVoteClick() {
    const resolved = this.$router.resolve({
      name: 'singleCandidateVote',
      // params: {
      //   listingHash: this.listingHash,
      // },
    })
    if (this.$router.currentRoute.name === resolved.route.name) {
      return
    }
    this.$router.push(resolved.location)
  }

  public onDrawerClosed() {
    const resolved = this.$router.resolve({
      name: 'singleCandidateDetails',
    })
    if (this.$router.currentRoute.name === resolved.route.name) {
      return
    }
    this.$router.push(resolved.location)
  }

  public onVoteButtonClicked() {
    this.pushNewRoute('singleCandidateVote')
  }

  public onResolveApplicationButtonClicked() {
    this.pushNewRoute('singleCandidateResolve')
  }

  public onResolveChallengeButtonClicked() {
    // do nothing
  }

  public pushNewRoute(routeName: string) {
    const resolved = this.$router.resolve({
      name: routeName,
      params: {
        listingHash: this.listingHash!,
      },
    })
    if (this.$router.currentRoute.name === resolved.route.name) {
      return
    }
    this.$router.push(resolved.location)
  }

  @Watch('candidateExists')
  public onCandidateChanged(newCandidate: string, oldCandidate: string) {
    this.$forceUpdate()
  }

  @Watch('raiseDrawer')
  public onRaiseDrawerChanged(newRaiseDrawer: boolean, oldRaiseDrawer: boolean) {
    if (newRaiseDrawer) {
      this.$root.$emit(OpenDrawer)
    }
  }
}
</script>
