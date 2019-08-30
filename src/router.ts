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
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/explore',
    name: 'explore',
    redirect: '/listing/all',
  },
  // listing routes
  {
    path: '/listing',
    redirect: '/listing/all',
  },
  {
    path: '/listing/all',
    name: 'allListings',
    component: Listings,
    props: {
    },
  },
  {
    path: '/listing/candidates',
    name: 'candidatesListings',
    component: Listings,
    props: {
      status: FfaListingStatus.candidate,
    },
  },
  {
    path: '/listing/listed',
    name: 'listedListings',
    component: Listings,
    props: {
      status: FfaListingStatus.listed,
    },
  },
  {
    path: '/listing/candidates/:listingHash',
    name: 'singleCandidate',
    component: FfaListingView,
    props: true,
    children: [
      {
        path: 'details',
        component: FfaListingDetails,
      },
    ],
  },
  {
    path: '/listing/listed/:listingHash',
    name: 'singleListed',
    component: FfaListingView,
    props: true,
    children: [
      {
        path: 'details',
        component: FfaListingDetails,
      },
    ],
  },
  {
    path: '/listing/new',
    name: 'listNew',
    components: {
      default: List,
      drawer: ListDrawer,
    },
  },
  // user routes
  {
    path: '/users/:walletAddress/',
    name: 'home',
    component: Listings,
    props: {
      default: true,
    },
  },
  {
    path: '/users/:walletAddress/listing',
    redirect: '/users/:walletAddress/listing/all',
  },
  {
    path: '/users/:walletAddress/listing/all',
    name: 'userAllListings',
    component: Listings,
    props: (route: Route) => ({
      walletAddress: route.params.walletAddress,
    }),
  },
  {
    path: '/users/:walletAddress/listing/candidates',
    name: 'userCandidates',
    component: Listings,
    props: (route: Route) => ({
      walletAddress: route.params.walletAddress,
      status: FfaListingStatus.candidate,
    }),
  },
  {
    path: '/users/:walletAddress/listing/listed',
    name: 'userListed',
    component: Listings,
    props: (route: Route) => ({
      walletAddress: route.params.walletAddress,
      status: FfaListingStatus.listed,
    }),
  },
  {
    path: '/users/:walletAddress/listing/candidates/:listingHash',
    name: 'singleUserCandidate',
    component: FfaListingView,
    props: (route: Route) => ({
      walletAddress: route.params.walletAddress,
      status: FfaListingStatus.candidate,
      listingHash: route.params.listingHash,
    }),
    children: [
      {
        path: 'details',
        component: FfaListingDetails,
      },
    ],
  },
  {
    path: '/users/:walletAddress/listing/listed/:listingHash',
    name: 'singleUserListed',
    component: FfaListingView,
    props: (route: Route) => ({
      walletAddress: route.params.walletAddress,
      status: FfaListingStatus.listed,
      listingHash: route.params.listingHash,
    }),
    children: [
      {
        path: 'details',
        component: FfaListingDetails,
      },
    ],
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
