import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home.vue'
import List from '@/views/List.vue'
import Listings from '@/views/Listings.vue'
import ListDrawer from '@/views/drawers/ListDrawer.vue'
import ListingDetails from '@/views/FfaListingDetails.vue'

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
    // route level code-splitting
    // this generates a separate chunk (upload.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    components: {
      default: List,
      drawer: ListDrawer,
    },
    // left here for posterity
    // component: () => import(/* webpackChunkName: "upload" */ './views/List.vue'),
  },
  {
    path: '/listings',
    name: 'listings',
    component: Listings,
    prop: {
      route: 'listings',
    },
  },
  {
    path: '/experimental',
    name: 'listingDetails',
    component: ListingDetails,
  },
  {
    path: '/explore',
    name: 'explore',
    component: Listings,
    prop: {
      route: 'explore',
    },
  },
  {
    path: '/home',
    name: 'homeListings',
    component: Listings,
    prop: {
      route: 'home',
    },
  },
]

export const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})
