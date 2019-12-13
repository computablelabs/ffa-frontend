<template>
  <section id='ffa-candidate' class="candidate-listed-view-common">
    <div v-if="isReady" class="vsubway-wrapper">
      <RouterTabs
        class="details-tabs"
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
        <h2 v-show="selectedTab === details" class="title-fancy">
          {{ listingTitle }}
        </h2>
        <VerticalSubway
          v-show="candidateExists && selectedTab === details"
          :listingHash="listingHash"
          :listingStatus="status"
          :plurality="plurality"
          :voteBy="voteBy"
          :isVotingClosed="isVotingClosed"
          :hasJwt="hasJwt"
          :onPreviewButtonClicked="onPreviewButtonClicked"
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
import NewListingModule from '../vuexModules/NewListingModule'
import UploadModule from '../vuexModules/UploadModule'
import FfaListingsModule from '../vuexModules/FfaListingsModule'
import AppModule from '../vuexModules/AppModule'
import VotingModule from '../vuexModules/VotingModule'
import DrawerModule, { DrawerState } from '../vuexModules/DrawerModule'

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
import { OpenDrawer,
  CloseDrawer,
  DrawerClosed,
  ApplicationResolved,
  CandidateForceUpdate,
  MetamaskAccountChanged } from '../models/Events'
import RouterTabMapping from '../models/RouterTabMapping'
import { VotingActionStep } from '../models/VotingActionStep'

import { Errors, Labels, Messages, Routes } from '../util/Constants'

import EthereumLoader from '../components/ui/EthereumLoader.vue'
import StaticFileMetadata from '../components/ui/StaticFileMetadata.vue'
import RouterTabs from '@/components/ui/RouterTabs.vue'

import VerticalSubway from '../components/voting/VerticalSubway.vue'
import VotingProcess from '../components/voting/VotingProcess.vue'

import Web3 from 'web3'
import { CancelTokenSource } from 'axios'

import CandidateObject from '../../src/interfaces/Candidate'

import '@/assets/style/components/voting.sass'
import '@/assets/style/views/ffa-listed-view.sass'

@Component({
  components: {
    EthereumLoader,
    VerticalSubway,
    StaticFileMetadata,
    VotingProcess,
    RouterTabs,
  },
})
export default class FfaCandidateView extends Vue {

  public listing = Labels.LISTING
  public details = Labels.DETAILS

  public routerTabMapping: RouterTabMapping[] = []
  public votingTimerId!: NodeJS.Timeout|undefined
  public statusVerified = false
  public candidateFetched = false
  public unsubscribe!: () => void
  public cancelTokenSource!: CancelTokenSource

  public appModule = getModule(AppModule, this.$store)
  public votingModule = getModule(VotingModule, this.$store)
  public ffaListingsModule = getModule(FfaListingsModule, this.$store)
  public drawerModule = getModule(DrawerModule, this.$store)

  @Prop()
  public status?: FfaListingStatus

  @Prop()
  public listingHash?: string

  @Prop()
  public walletAddress?: string

  @Prop({ default: false })
  public requiresParameters?: boolean

  @Prop()
  public selectedTab?: string

  @Prop()
  public raiseDrawer?: boolean

  public get prerequisitesMet(): boolean {
    return SharedModule.isReady(this.requiresParameters!, this.$store)
  }

  public get isReady(): boolean {
    return this.prerequisitesMet && this.statusVerified && this.candidateFetched
  }

  public get canVoteOrPreview(): boolean {
    return this.appModule.canVote &&
      this.appModule.marketTokenBalance >= this.votingModule.stake
  }

  public get hasJwt(): boolean {
    return this.appModule.hasJwt
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
    const votingText = this.canVoteOrPreview && !this.isVotingClosed ?
      Labels.VOTING_IS_OPEN : ''

    return `${Labels.THIS_IS_A_CANDIDATE} ${votingText}`
  }

  get listingTitle(): string {
    return !!this.candidate ? this.candidate.title : ''
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
    this.$root.$on(ApplicationResolved, this.postResolveApplication)
    this.$root.$on(MetamaskAccountChanged, this.metamaskAccountChanged)
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)

    if (this.requiresParameters) {
      await EthereumModule.setEthereumPriceAndParameters(this.$store)
    }
 }

  public mounted(this: FfaCandidateView) {
    this.votingModule.reset()
    this.$root.$emit(CandidateForceUpdate)
    console.log('FfaCandidateView mounted')
  }

  public beforeDestroy() {
    console.log('FfaCandidateView beforeDestroy()')
    this.$root.$off(DrawerClosed, this.onDrawerClosed)
    this.$root.$off(ApplicationResolved, this.postResolveApplication)
    this.$root.$off(MetamaskAccountChanged, this.metamaskAccountChanged)
    this.unsubscribe()
    if (this.votingTimerId) {
      clearTimeout(this.votingTimerId)
    }
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel()
    }
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
          this.appModule)

        if (!!redirect) {
          return this.$router.replace(redirect!)
        }

        VotingProcessModule.updateVotingStep(this.$store)

        this.statusVerified = true
        await EthereumModule.getLastBlock(this.appModule)
        this.ffaListingsModule.resetCandidates(this.appModule.lastBlock)
        if (this.cancelTokenSource) {
          this.cancelTokenSource.cancel()
        }
        this.cancelTokenSource = axios.CancelToken.source()
        const candidate = await DatatrustModule.getCandidate(this.listingHash, this.cancelTokenSource.token)
        this.votingModule.setCandidate(candidate!)
        if (candidate!.stake) {
          this.votingModule.setStake(candidate!.stake)
        }
        if (candidate!.voteBy) {
          this.votingModule.setVoteBy(candidate!.voteBy * 1000)
        }
        if (candidate!.totalYeaVotes) {
          this.votingModule.setYeaVotes(candidate!.totalYeaVotes.toFixed(0))
        }
        if (candidate!.totalNayVotes) {
          this.votingModule.setNayVotes(candidate!.totalNayVotes.toFixed(0))
        }
        this.ffaListingsModule.addCandidate(candidate!)
        this.candidateFetched = true

        this.setVoteTimer()
        this.$root.$emit(CandidateForceUpdate)
        return this.$forceUpdate()

      case 'ffaListingsModule/setCandidateDetails':
        this.candidateFetched = true
        this.$root.$emit(CandidateForceUpdate)
        return this.$forceUpdate()
    }
  }

  public filterCandidate(listingHash: string): FfaListing {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)!
  }

  public onDrawerClosed() {
    if (!this.$router.currentRoute.name!.startsWith('singleCandidate')) {
      return
    }

    let routeName: string
    switch (this.$router.currentRoute.name) {
      case 'singleCandidateDetails':
      case 'singleCandidateVote':
      case 'singleCandidateResolve':
      case 'singleCandidateCreated':
        routeName = 'singleCandidateDetails'
        break
      default:
        return
    }

    this.pushNewRoute(routeName)
  }

  public onPreviewButtonClicked() {
    if (!this.canVoteOrPreview || !this.hasJwt) {
      return
    }

    FfaListingViewModule.fetchPreview(this.listingHash!, this.appModule.jwt)
  }

  public onVoteButtonClicked() {
    this.drawerModule.setDrawerState(DrawerState.processing)
    this.pushNewRoute('singleCandidateVote')
  }

  public onResolveApplicationButtonClicked() {
    this.drawerModule.setDrawerState(DrawerState.processing)
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

  public setVoteTimer() {
    const timeWait = this.voteBy - new Date().getTime()
    if (timeWait < 0) {
      return
    }
    console.log(`setting timer for ${timeWait}ms`)
    this.votingTimerId = setTimeout(() => { this.closeVoting() }, timeWait)
  }

  public async closeVoting() {
    this.votingModule.setVotingStep(VotingActionStep.Error)
    await VotingProcessModule.updateCandidateDetails(this.listingHash!, this.$store)
    this.$forceUpdate()
    this.$root.$emit(CandidateForceUpdate)
  }

  public async postResolveApplication() {
    const blockchainStatus = await FfaListingViewModule.fetchListingStatus(
      ethereum.selectedAddress, this.listingHash!, this.appModule)

    this.$root.$off(DrawerClosed, this.onDrawerClosed)
    this.$root.$off(ApplicationResolved, this.postResolveApplication)
    this.unsubscribe()

    window.location.reload()

    // switch (blockchainStatus) {
    //   case FfaListingStatus.new:
    //     // candidate was rejected
    //     return this.$router.push({
    //       name: 'allListings',
    //     })

    //   case FfaListingStatus.listed:
    //     this.candidate.status = FfaListingStatus.listed
    //     this.ffaListingsModule.addToListed(this.candidate)
    //     this.ffaListingsModule.removeCandidate(this.listingHash!)

    //     this.$router.push({
    //       name: 'singleListed',
    //       params: {
    //         listingHash: this.listingHash!,
    //         status: FfaListingStatus.listed,
    //       },
    //     })

    //     return this.$root.$emit(CloseDrawer)

    //   default:
    //     // this is an error case
    //     // TODO: handle?
    // }
  }

  @Watch('candidateExists')
  public onCandidateChanged(newCandidate: string, oldCandidate: string) {
    this.$forceUpdate()
    this.$root.$emit(CandidateForceUpdate)
  }

  @Watch('raiseDrawer')
  public onRaiseDrawerChanged(newRaiseDrawer: boolean, oldRaiseDrawer: boolean) {
    if (newRaiseDrawer) {
      this.$root.$emit(OpenDrawer)
    }
  }

  private async metamaskAccountChanged() {

    if (EthereumModule.ethereumDisabled()) {
      getModule(AppModule, this.$store).reset()
    }

    if (SharedModule.isAuthenticated(this.$store)) {
      await EthereumModule.setEthereumPriceAndParameters(this.$store)
      this.$forceUpdate()
    } else {
      this.$router.push(Routes.AUTH_ROUTE)
    }

  }
}
</script>
