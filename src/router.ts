import Vue from 'vue'
import Router, {Route} from 'vue-router'
import Home from '@/views/Home.vue'
import List from '@/views/List.vue'
import Listings from '@/views/Listings.vue'
import ListDrawer from '@/views/drawers/ListDrawer.vue'
import FfaListingView from '@/views/FfaListingView.vue'
import FfaListingDetails from '@/views/FfaListingDetails.vue'

import { FfaListingStatus } from './models/FfaListing'

Vue.use(Router)

export const routes = [
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
    component: FfaListingView,
    props: (route: Route) => ({
      status: FfaListingStatus.candidate,
      listingHash: route.params.listingHash,
      requiresWeb3: true,
    }),
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
    component: FfaListingView,
    props: (route: Route) => ({
      status: FfaListingStatus.listed,
      listingHash: route.params.listingHash,
      requiresWeb3: true,
    }),
    children: [
      {
        path: 'details',
        component: FfaListingDetails,
      },
    ],
  },
  // create new listing route
  {
    path: '/listings/new',
    name: 'listNew',
    components: {
      default: List,
      drawer: ListDrawer,
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
