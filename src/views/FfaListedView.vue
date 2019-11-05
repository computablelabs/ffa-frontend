<template>
  <section id='ffa-listed'>
    <RouterTabs
      :mapping="routerTabMapping"
      :selected="selectedTab"/>
    <div
      v-if="isReady"
      class="container" >
        <!-- listing tab selected -->
        <StaticFileMetadata
          v-show="selectedTab === listing"
          :ffaListing="ffaListing"
        />
        <button
          v-if="enablePurchaseButton"
          v-show="selectedTab === listing"
          @click="onPurchaseClick"
          data-purchase="true">Purchase</button>
        <button
          v-if="canRequestDelivery"
          @click="onDeliveryClick"
          data-delivery="true">Request Delivery</button>

        <!-- details tab selected -->
        <button
          v-show="selectedTab === details && !challenged"
          @click="onChallengeClick"
          data-challenge="true">Challenge listing</button>

        <VerticalSubway
          v-show="selectedTab === details"
          :listingHash="listingHash"
          :listingStatus="status"
          :listing="ffaListing"
          :challenged="challenged"
          :plurality="plurality"
          @vote-clicked="onVoteClick"
        />

    </div>
    <EthereumLoader v-else />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import Web3 from 'web3'
import uuid4 from 'uuid'
import FileSaver from 'file-saver'

import { getModule } from 'vuex-module-decorators'
import FlashesModule from '../vuexModules/FlashesModule'
import NewListingModule from '../vuexModules/NewListingModule'
import UploadModule from '../vuexModules/UploadModule'
import FfaListingsModule from '../vuexModules/FfaListingsModule'
import AppModule from '../vuexModules/AppModule'
import VotingModule from '../vuexModules/VotingModule'
import PurchaseModule from '../vuexModules/PurchaseModule'
import ChallengeModule from '../vuexModules/ChallengeModule'

import SharedModule from '../functionModules/components/SharedModule'
import FfaListingViewModule from '../functionModules/views/FfaListingViewModule'
import VotingProcessModule from '../functionModules/components/VotingProcessModule'
import PurchaseProcessModule from '../functionModules/components/PurchaseProcessModule'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'
import EthereumModule from '../functionModules/ethereum/EthereumModule'
import VotingContractModule from '../functionModules/protocol/VotingContractModule'
import MetamaskModule from '../functionModules/metamask/MetamaskModule'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import Flash, {FlashType} from '../models/Flash'
import { ProcessStatus } from '../models/ProcessStatus'
import ContractAddresses from '../models/ContractAddresses'
import { OpenDrawer, DrawerClosed } from '../models/Events'
import RouterTabMapping from '../models/RouterTabMapping'
import { PurchaseStep } from '../models/PurchaseStep'

import { Errors, Labels, Messages } from '../util/Constants'

import VerticalSubway from '../components/voting/VerticalSubway.vue'
import StaticFileMetadata from '../components/ui/StaticFileMetadata.vue'
import EthereumLoader from '../components/ui/EthereumLoader.vue'
import RouterTabs from '../components/ui/RouterTabs.vue'
import FileUploader from '../components/listing/FileUploader.vue'

import '@/assets/style/views/ffa-listed-view.sass'

import { Eventable } from '../interfaces/Eventable'


@Component({
  components: {
    StaticFileMetadata,
    EthereumLoader,
    FileUploader,
    RouterTabs,
    VerticalSubway,
  },
})
export default class FfaListedView extends Vue {
  @Prop()
  public status?: FfaListingStatus

  @Prop()
  public listingHash?: string

  @Prop()
  public walletAddress?: string

  @Prop()
  public enablePurchaseButton!: boolean

  @Prop({ default: false })
  public requiresWeb3?: boolean

  @Prop({ default: false })
  public requiresMetamask?: boolean

  @Prop({ default: false })
  public requiresParameters?: boolean

  @Prop()
  public selectedTab?: string

  public authProcessId!: string
  public message!: string
  public signature!: string
  public deliveryPayload!: [Error?, any?]

  public appModule: AppModule = getModule(AppModule, this.$store)
  public flashesModule: FlashesModule = getModule(FlashesModule, this.$store)
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  public purchaseModule: PurchaseModule = getModule(PurchaseModule, this.$store)
  public votingModule: VotingModule = getModule(VotingModule, this.$store)
  public challengeModule: ChallengeModule = getModule(ChallengeModule, this.$store)

  public statusVerified = false
  public currentDrawer = ''

  public routerTabMapping: RouterTabMapping[] = []
  public listing = Labels.LISTING
  public details = Labels.DETAILS

  get candidate(): FfaListing {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)!
  }

  get challenged(): boolean {
    return this.challengeModule.listingChallenged
  }

  public get hasPurchased(): boolean {
    return false
  }

  protected get plurality() {
    return this.appModule.plurality
  }

  public get prerequisitesMet(): boolean {
    return SharedModule.isReady(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store,
    )
  }

  get deliveryHash(): string {
    return DatatrustModule.generateDeliveryHash(
      this.listingHash!,
      this.$store,
    )
  }

  public get isReady(): boolean {
    return this.prerequisitesMet && this.statusVerified
  }

  public get ffaListing(): FfaListing|undefined {
    if (!this.status && !this.listingHash) { return undefined }
    return this.ffaListingsModule.listed.find((l) => l.hash === this.listingHash)
  }

  get canRequestDelivery(): boolean {
    return this.purchaseModule.purchaseStep === PurchaseStep.Complete
  }

  public async created(this: FfaListedView) {
    this.votingModule.reset()
    if (!this.status || !this.listingHash) {
      console.log('no status or listingHash!')
      this.$router.replace('/')
    }

    this.routerTabMapping.push({
      route: {
        name: 'singleListed',
        params: {
          listingHash: this.listingHash!,
        },
      },
      label: this.listing,
    })
    this.routerTabMapping.push({
      route: {
        name: 'singleListedDetails',
        params: {
          listingHash: this.listingHash!,
        },
      },
      label: this.details,
    })

    this.$root.$on(DrawerClosed, this.onDrawerClosed)
    this.$store.subscribe(this.vuexSubscriptions)

    // if (this.prerequisitesMet) {
    //   return
    // }

    await EthereumModule.setEthereum(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)
  }

  public mounted(this: FfaListedView) {
    console.log('FfaListedView mounted')
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    if (mutation.type !== 'eventModule/append') {
      switch (mutation.type) {
        case `appModule/setAppReady`:

          if (!!!mutation.payload) { return }

          this.statusVerified = true

          const [error, listed, lastListedBlock] = await DatatrustModule.getListed()
          this.ffaListingsModule.setListed(listed!)
          this.purchaseModule.setListing(this.ffaListing!)
          await this.checkChallenged()
          await Promise.all([
            EthereumModule.getEtherTokenBalance(this.$store),
            EthereumModule.getEtherTokenContractAllowance(ContractAddresses.DatatrustAddress, this.$store),
            EthereumModule.getMarketTokenBalance(this.$store),
          ])

          // Check and set necessary purchase module steps
          await PurchaseProcessModule.checkEtherTokenBalance(this.$store)
          await PurchaseProcessModule.checkDatatrustContractAllowance(this.$store)
          await PurchaseProcessModule.checkListingPurchased(this.ffaListing!, this.$store)

          // Set Market Token Balance
          await VotingProcessModule.updateMarketTokenBalance(this.$store)

          return this.$forceUpdate()
        case 'challengeModule/setListingChallenged':
          // Challenge is a candidate
          if (mutation.payload === true) {
            await VotingProcessModule.updateChallenged(this.listingHash!, this.$store)
          }
          return
        default:
          return
      }
    }

    const event = mutation.payload as Eventable

    if (event.processId === this.authProcessId) {
      this.signature = event.response.result
      const web3 = getModule(AppModule, this.$store).web3
      const checksumAddress = web3.utils.toChecksumAddress(ethereum.selectedAddress)
      const [error, jwt] = await DatatrustModule.authorize(this.message!, this.signature!, checksumAddress)
      const flashesModule = getModule(FlashesModule, this.$store)

      if (error) { return flashesModule.append(new Flash(error.message, FlashType.error)) }

      if (jwt) {
        const appModule = getModule(AppModule, this.$store)
        appModule.setJWT(jwt!)
        flashesModule.append(new Flash('Authorize successful.', FlashType.success))
        return await this.fetchDelivery()
      }
    }
  }

  private filterCandidate(listingHash: string): FfaListing {
    return this.ffaListingsModule.candidates.find((candidate) => candidate.hash === this.listingHash)!
  }

  private async checkChallenged() {
    const listingChallenged = await VotingContractModule.candidateIs(
      this.listingHash!,
      2, // challenge application
      ethereum.selectedAddress,
      this.appModule.web3,
    )
    this.challengeModule.setListingChallenged(listingChallenged)
  }

  private onPurchaseClick() {
    this.currentDrawer = 'purchase'
    if (this.$route.name === 'singleListedPurchase') {
      return
    }
    this.$router.push({
      name: 'singleListedPurchase',
      params: {
        listingHash: this.listingHash!,
      },
    })
  }

  private onChallengeClick() {
    this.currentDrawer = 'challenge'
    if (this.$route.name === 'singleListedChallenge') {
      return
    }
    this.$router.push({
      name: 'singleListedChallenge',
      params: {
        listingHash: this.listingHash!,
      },
    })
  }

  private onVoteClick() {
    this.currentDrawer = 'vote'
    if (this.$route.name === 'singleListedVote') {
      return
    }
    this.$router.push({
      name: 'singleListedVote',
      params: {
        listingHash: this.listingHash!,
      },
    })
  }

  private onDrawerClosed() {
    if (!this.currentDrawer || this.currentDrawer.length === 0) {
      return
    }

    let routeName = 'singleListed'
    if (this.currentDrawer === 'challenge' || this.currentDrawer === 'vote') {
      routeName = 'singleListedDetails'
    }

    if (this.$router.currentRoute.name === routeName) {
      return
    }

    this.currentDrawer = ''

    this.$router.push({
      name: routeName,
      params: {
        listingHash: this.listingHash!,
      },
    })
  }

  private async fetchDelivery() {
    const [error, response] = await DatatrustModule.getDelivery(
      this.deliveryHash,
      this.listingHash!,
      this.appModule.jwt,
    )
    const blob = new Blob([response.data], { type: response.headers['content-type'] })
    FileSaver.saveAs(blob)
  }

  private async authorizeAndFetchDelivery() {
    this.authProcessId = uuid4()
    this.message = `timestamp: ${new Date().getTime()}`
    MetamaskModule.sign(this.message, this.authProcessId, this.$store)
  }

  private async onDeliveryClick() {
    !!this.appModule.jwt ? await this.fetchDelivery() : await this.authorizeAndFetchDelivery()
  }
}
</script>
