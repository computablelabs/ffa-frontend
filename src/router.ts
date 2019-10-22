import Vue from 'vue'
import Router, {Route} from 'vue-router'
import Home from '@/views/Home.vue'
import CreateNewListing from '@/views/CreateNewListing.vue'
import Listings from '@/views/Listings.vue'

import NewListingDrawer from '@/views/drawers/NewListingDrawer.vue'
import PurchaseDrawer from '@/views/drawers/PurchaseDrawer.vue'
import VotingDrawer from '@/views/drawers/VotingDrawer.vue'
import SupportDrawer from '@/views/drawers/SupportDrawer.vue'
import WithdrawDrawer from '@/views/drawers/WithdrawDrawer.vue'
import ChallengeDrawer from '@/views/drawers/ChallengeDrawer.vue'
import TestHarness from '@/views/TestHarness.vue'

import FfaListedView from '@/views/FfaListedView.vue'
import FfaCandidateView from '@/views/FfaCandidateView.vue'
import FfaListingDetails from '@/views/FfaListingDetails.vue'
import Support from '@/views/Support.vue'

import { FfaListingStatus } from './models/FfaListing'

Vue.use(Router)

export const routes = [
  {
    path: '/test',
    name: 'TestHarness',
    component: TestHarness,
  },
  // Generic routes
  {
    path: '/',
    name: 'home',
    component: Home,
    props: {
      foo: 'foo',
    },
  },
  {
    path: '/explore',
    name: 'explore',
    redirect: '/listings/all',
  },
  // listing routes, i.e. list of listings
  {
    path: '/listings',
    redirect: '/listings/all',
  },
  {
    path: '/listings/all',
    name: 'allListings',
    component: Listings,
    props: {
    },
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
    components: {
      default: FfaCandidateView,
      drawer: VotingDrawer,
    },
    props: {
      default: (route: Route) => ({
        status: FfaListingStatus.candidate,
        listingHash: route.params.listingHash,
        requiresWeb3: true,
        requiresParameters: true,
      }),
    },
    children: [
      {
        path: 'details',
        component: FfaListingDetails,
      },
    ],
  },
  {
    path: '/listings/listed/:listingHash',
    name: 'singleListed',
    component: FfaListedView,
    props: (route: Route) => ({
      status: FfaListingStatus.listed,
      listingHash: route.params.listingHash,
      requiresWeb3: true,
      enablePurchaseButton: false,
      requiresParameters: true,
    }),
  },
  {
    path: '/listings/listed/:listingHash/purchase',
    name: 'purchaseListed',
    components: {
      default: FfaListedView,
      drawer: PurchaseDrawer,
    },
    props: {
      default: (route: Route) => ({
        status: FfaListingStatus.listed,
        listingHash: route.params.listingHash,
        requiresMetamask: true,
        requiresParameters: true,
        enablePurchaseButton: true,
      }),
      drawer: (route: Route) => ({
        listingHash: route.params.listingHash,
      }),
    },
  },
  {
    path: '/listings/listed/:listingHash/challenge',
    name: 'challengeListed',
    components: {
      default: FfaListedView,
      drawer: ChallengeDrawer,
    },
    props: {
      default: (route: Route) => ({
        status: FfaListingStatus.listed,
        listingHash: route.params.listingHash,
        requiresMetamask: true,
        requiresParameters: true,
        enablePurchaseButton: true,
      }),
      drawer: (route: Route) => ({
        listingHash: route.params.listingHash,
      }),
    },
  },
  {
    path: '/listings/listed/:listingHash/challenge/vote',
    name: 'voteChallengeListed',
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
      }),
      drawer: (route: Route) => ({
        listingHash: route.params.listingHash,
      }),
    },
  },
  // create new listing route
  {
    path: '/listings/new',
    name: 'createNewListing',
    components: {
      default: CreateNewListing,
      drawer: NewListingDrawer,
    },
    props: {
      default: {
        requiresMetamask: true,
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
    name: 'support',
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
