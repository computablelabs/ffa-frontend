import Vue from 'vue'
import Router, {Route} from 'vue-router'
import Home from '@/views/Home.vue'
import CreateNewListing from '@/views/CreateNewListing.vue'
import Listings from '@/views/Listings.vue'
import Config from '@/views/Config.vue'

import NewListingDrawer from '@/views/drawers/NewListingDrawer.vue'
import PurchaseDrawer from '@/views/drawers/PurchaseDrawer.vue'
import VotingDrawer from '@/views/drawers/VotingDrawer.vue'
import SupportDrawer from '@/views/drawers/SupportDrawer.vue'
import WithdrawDrawer from '@/views/drawers/WithdrawDrawer.vue'
import ChallengeDrawer from '@/views/drawers/ChallengeDrawer.vue'
import ResolveDrawer from '@/views/drawers/ResolveDrawer.vue'
import UnstakeDrawer from '@/views/drawers/UnstakeDrawer.vue'

import FfaListedView from '@/views/FfaListedView.vue'
import FfaCandidateView from '@/views/FfaCandidateView.vue'
import Support from '@/views/Support.vue'
import Login from '@/components/authentication/Login.vue'
import TermsOfService from '@/components/authentication/TermsOfService.vue'

import { FfaDatatrustTaskType } from './models/DatatrustTaskDetails'
import { FfaListingStatus } from './models/FfaListing'
import { Labels } from './util/Constants'

Vue.use(Router)

export const routes = [
  // Generic routes
  {
    path: '/',
    name: 'home',
    redirect: '/listings/listed',
    // component: Home,
    // props: {
    //   foo: 'foo',
    // },
  },
  {
    path: '/browse',
    name: 'browse',
    redirect: '/listings/listed',
  },
  // listing routes, i.e. list of listings
  {
    path: '/listings',
    redirect: '/listings/listed',
  },
  {
    path: '/listings/all',
    name: 'allListings',
    component: Listings,
  },
  {
    path: '/listings/candidates',
    name: 'candidatesListings',
    component: Listings,
    props: {
      status: FfaListingStatus.candidate,
    },
  },
  {
    path: '/listings/listed',
    name: 'listedListings',
    component: Listings,
    props: {
      status: FfaListingStatus.listed,
    },
  },
  // single listing routes
  {
    path: '/listings/candidates/:listingHash',
    name: 'singleCandidate',
    component: FfaCandidateView,
    props: (route: Route) => ({
      status: FfaListingStatus.candidate,
      listingHash: route.params.listingHash,
      requiresParameters: true,
      selectedTab: Labels.LISTING,
    }),
  },
  {
    path: '/listings/candidates/:listingHash/details',
    name: 'singleCandidateDetails',
    component: FfaCandidateView,
    props: (route: Route) => ({
      status: FfaListingStatus.candidate,
      listingHash: route.params.listingHash,
      requiresParameters: true,
      selectedTab: Labels.DETAILS,
    }),
  },
  {
    path: '/listings/candidates/:listingHash/vote',
    name: 'singleCandidateVote',
    components: {
      default: FfaCandidateView,
      drawer: VotingDrawer,
    },
    props: {
      default: (route: Route) => ({
        status: FfaListingStatus.candidate,
        listingHash: route.params.listingHash,
        requiresParameters: true,
        selectedTab: Labels.DETAILS,
        raiseDrawer: true,
      }),
      drawer: (route: Route) => ({
        listingHash: route.params.listingHash,
      }),
    },
  },
  {
    path: '/listings/candidates/:listingHash/resolve',
    name: 'singleCandidateResolve',
    components: {
      default: FfaCandidateView,
      drawer: ResolveDrawer,
    },
    props: {
      default: (route: Route) => ({
        status: FfaListingStatus.candidate,
        listingHash: route.params.listingHash,
        requiresParameters: true,
        selectedTab: Labels.DETAILS,
        raiseDrawer: true,
      }),
      drawer: (route: Route) => ({
        listingHash: route.params.listingHash,
        resolveTaskType: FfaDatatrustTaskType.resolveApplication,
      }),
    },
  },
  {
    path: '/listings/candidates/:listingHash/created',
    name: 'singleCandidateCreated',
    components: {
      default: FfaCandidateView,
      drawer: NewListingDrawer,
    },
    props: {
      default: (route: Route) => ({
        status: FfaListingStatus.candidate,
        listingHash: route.params.listingHash,
        requiresParameters: true,
        selectedTab: Labels.DETAILS,
      }),
    },
  },
  {
    path: '/listings/listed/:listingHash',
    name: 'singleListed',
    component: FfaListedView,
    props: (route: Route) => ({
      status: FfaListingStatus.listed,
      listingHash: route.params.listingHash,
      enablePurchaseButton: true,
      requiresParameters: true,
      selectedTab: Labels.LISTING,
    }),
  },
  {
    path: '/listings/listed/:listingHash/details',
    name: 'singleListedDetails',
    component: FfaListedView,
    props: (route: Route) => ({
      status: FfaListingStatus.listed,
      listingHash: route.params.listingHash,
      requiresParameters: true,
      enablePurchaseButton: true,
      selectedTab: Labels.DETAILS,
    }),
  },
  {
    path: '/listings/listed/:listingHash/purchase',
    name: 'singleListedPurchase',
    components: {
      default: FfaListedView,
      drawer: PurchaseDrawer,
    },
    props: {
      default: (route: Route) => ({
        status: FfaListingStatus.listed,
        listingHash: route.params.listingHash,
        requiresParameters: true,
        enablePurchaseButton: true,
        selectedTab: Labels.LISTING,
      }),
      drawer: (route: Route) => ({
        listingHash: route.params.listingHash,
      }),
    },
  },
  {
    path: '/listings/listed/:listingHash/challenge',
    name: 'singleListedChallenge',
    components: {
      default: FfaListedView,
      drawer: ChallengeDrawer,
    },
    props: {
      default: (route: Route) => ({
        status: FfaListingStatus.listed,
        listingHash: route.params.listingHash,
        requiresParameters: true,
        selectedTab: Labels.DETAILS,
      }),
      drawer: (route: Route) => ({
        listingHash: route.params.listingHash,
      }),
    },
  },
  {
    path: '/listings/listed/:listingHash/vote',
    name: 'singleListedVote',
    components: {
      default: FfaListedView,
      drawer: VotingDrawer,
    },
    props: {
      default: (route: Route) => ({
        status: FfaListingStatus.listed,
        listingHash: route.params.listingHash,
        requiresMetamask: true,
        requiresParameters: true,
        enablePurchaseButton: true,
        selectedTab: Labels.DETAILS,
      }),
      drawer: (route: Route) => ({
        listingHash: route.params.listingHash,
      }),
    },
  },
  {
    path: '/listings/listed/:listingHash/resolve',
    name: 'singleListedResolve',
    components: {
      default: FfaListedView,
      drawer: ResolveDrawer,
    },
    props: {
      default: (route: Route) => ({
        status: FfaListingStatus.listed,
        listingHash: route.params.listingHash,
        requiresMetamask: true,
        requiresParameters: true,
        enablePurchaseButton: true,
        selectedTab: Labels.DETAILS,
      }),
      drawer: (route: Route) => ({
        listingHash: route.params.listingHash,
        resolveTaskType: FfaDatatrustTaskType.resolveChallenge,
      }),
    },
  },
  {
    path: '/listings/listed/:listingHash/unstake',
    name: 'singleListedUnstake',
    components: {
      default: FfaListedView,
      drawer: UnstakeDrawer,
    },
    props: {
      default: (route: Route) => ({
        status: FfaListingStatus.listed,
        listingHash: route.params.listingHash,
        requiresMetamask: true,
        requiresParameters: true,
        enablePurchaseButton: true,
        selectedTab: Labels.DETAILS,
      }),
      drawer: (route: Route) => ({
        listingHash: route.params.listingHash,
      }),
    },
  },
  // create new listing route
  {
    path: '/share',
    name: 'createNewListing',
    component: CreateNewListing,
    props: {
      requiresMetamask: true,
    },
  },
  {
    path: '/share/listing',
    name: 'createNewListingAction',
    components: {
      default: CreateNewListing,
      drawer: NewListingDrawer,
    },
    props: {
      default: {
        requiresMetamask: true,
        requiresParameters: true,
      },
      drawer: true,
    },
  },
  // user routes
  {
    path: '/users/:walletAddress/',
    name: 'userHome',
    component: Listings,
    props: {
      default: true,
    },
  },
  // user listing routes
  {
    path: '/users/:walletAddress/listings',
    redirect: '/users/:walletAddress/listings/all',
  },
  {
    path: '/users/:walletAddress/listings/all',
    name: 'userAllListings',
    component: Listings,
    props: (route: Route) => ({
      walletAddress: route.params.walletAddress,
    }),
  },
  {
    path: '/users/:walletAddress/listings/candidates',
    name: 'userCandidates',
    component: Listings,
    props: (route: Route) => ({
      walletAddress: route.params.walletAddress,
      status: FfaListingStatus.candidate,
    }),
  },
  {
    path: '/users/:walletAddress/listings/listed',
    name: 'userListed',
    component: Listings,
    props: (route: Route) => ({
      walletAddress: route.params.walletAddress,
      status: FfaListingStatus.listed,
    }),
  },
  // support home route
  {
    path: '/support',
    name: 'supportHome',
    component: Support,
    props: {
      requiresParameters: true,
    },
  },
  {
    path: '/support/support',
    name: 'supportCooperative',
    components: {
      default: Support,
      drawer: SupportDrawer,
    },
    props: {
      default: {
        requiresParameters: true,
      },
      drawer: true,
    },
  },
  {
    path: '/support/withdraw',
    name: 'withdraw',
    components: {
      default: Support,
      drawer: WithdrawDrawer,
    },
    props: {
      default: {
        requiresParameters: true,
      },
      drawer: true,
    },
  },
  {
    path: '/config',
    name: 'config',
    component: Config,
  },
  // authentication
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/terms-of-service',
    name: 'termsOfService',
    component: TermsOfService,
  },
  // everything else just points to home
  {
    path: '*',
    redirect: '/',
  },
]

export const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})
