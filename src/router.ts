import Vue from 'vue'
import Router from 'vue-router'
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
    path: '/list',
    name: 'list',
    components: {
      default: List,
      drawer: ListDrawer,
    },
  },
  {
    path: '/experimental',
    name: 'experimental',
    component: FfaListingDetails,
  },
  {
    path: '/explore',
    name: 'explore',
    component: Listings,
    props: {
      route: 'explore',
    },
  },
  {
    path: '/home',
    name: 'homeListings',
    component: Listings,
    props: {
      route: 'home',
    },
  },
  {
    path: '/listing',
    redirect: '/listing/new',
  },
  {
    path: '/listing/candidates',
    name: 'listings',
    component: Listings,
    props: {
      route: 'listing',
      status: FfaListingStatus.candidate,
    },
  },
  {
    path: '/listing/:status/:listingHash',
    name: 'listings',
    component: FfaListingView,
    props: {
      route: 'listing',
    },
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
