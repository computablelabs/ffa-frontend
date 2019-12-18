import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import VueRouter, { Route } from 'vue-router'
import Web3 from 'web3'

import { router } from '../../../src/router'
import store from '../../../src/store'
import appStore from '../../../src/store'

import App from '@/App.vue'
import Navigation from '@/components/ui/Navigation.vue'
import Drawer from '@/components/ui/Drawer.vue'

import MetamaskModule from '../../../src/functionModules/metamask/MetamaskModule'
import SharedModule from '../../../src/functionModules/components/SharedModule'

import { FfaListingStatus } from '../../../src/models/FfaListing'
import { NavigationView } from '../../../src/models/NavigationView'

import Servers from '../../../src/util/Servers'

import AppModule from '../../../src/vuexModules/AppModule'

const localVue = createLocalVue()
const browseRoute = '/browse'
const listingsRoute = '/listings'
const listingsAllRoute = '/listings/all'
const listingsCandidatesRoute = '/listings/candidates'
const listingsListedRoute = '/listings/listed'
const usersListingsRoute = '/users/0xwallet/listings'
const usersAllListingsRoute = '/users/0xwallet/listings/all'
const usersCandidatesRoute = '/users/0xwallet/listings/candidates'
const usersListedRoute = '/users/0xwallet/listings/listed'
const listingsNewRoute = '/share'
const supportRoute = '/support'

let appModule: AppModule

describe('router', () => {

  let wrapper!: Wrapper<App>

  beforeAll(() => {
    (window as any).web3 = new Web3(Servers.EthereumJsonRpcProvider)
    localVue.use(VueRouter)
    localVue.component('navigation', Navigation)
    localVue.component('drawer', Drawer)

    appModule = getModule(AppModule, appStore)

    MetamaskModule.enable = (): Promise<string|Error> => {
      return Promise.resolve('foo')
    }

  })

  beforeEach(() => {
    wrapper = mount(App, {
      attachToDocument: true,
      localVue,
      router,
      store: appStore,
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  describe('generic routes', () => {

    // it('renders homeRoute', () => {
    //   router.push(homeRoute)
    //   expect(wrapper.find('section#ffa-listings-view').vm.$props.status).toBeUndefined()
    //   expect(wrapper.find('section#ffa-listings-view').vm.$props.walletAddress).toBeUndefined()
    //   expect(wrapper.find('section#ffa-listings-view').exists()).toBeTruthy()
    // })

    it('renders browseRoute', () => {
      router.push(browseRoute)
      expect(wrapper.find('section#ffa-listings-view').vm.$props.status).toBe('listed')
      expect(wrapper.find('section#ffa-listings-view').vm.$props.walletAddress).toBeUndefined()
      expect(wrapper.find('section#ffa-listings-view').exists()).toBeTruthy()
    })
  })

  describe('new listings', () => {

    it('renders listingsNewRoute', () => {
      router.push(listingsNewRoute)
      expect(wrapper.find('section#create-new-listing').exists()).toBeTruthy()
      expect(wrapper.find('section#create-new-listing').vm).toBeDefined()
    })
  })

  // describe('renders expected \'list of listings\' routes', () => {

  //   it('renders listingRoute', () => {
  //     router.push(listingsRoute)
  //     expect(wrapper.find('section#ffa-listings-view').vm.$props.status).toBeUndefined()
  //     expect(wrapper.find('section#ffa-listings-view').vm.$props.walletAddress).toBeUndefined()
  //     expect(wrapper.find('section#ffa-listings-view').exists()).toBeTruthy()
  //   })

  //   it('renders listingAllRoute', () => {
  //     router.push(listingsAllRoute)
  //     expect(wrapper.find('section#ffa-listings-view').vm.$props.status).toBeUndefined()
  //     expect(wrapper.find('section#ffa-listings-view').vm.$props.walletAddress).toBeUndefined()
  //     expect(wrapper.find('section#ffa-listings-view').exists()).toBeTruthy()
  //   })

  //   it('renders listingCandidatesRoute', () => {
  //     router.push(listingsCandidatesRoute)
  //     expect(wrapper.find('section#ffa-listings-view').vm.$props.status).toEqual(FfaListingStatus.candidate)
  //     expect(wrapper.find('section#ffa-listings-view').vm.$props.walletAddress).toBeUndefined()
  //     expect(wrapper.find('section#ffa-listings-view').exists()).toBeTruthy()
  //   })

  //   it('renders listingListedRoute', () => {
  //     router.push(listingsListedRoute)
  //     expect(wrapper.find('section#ffa-listings-view').vm.$props.status).toEqual(FfaListingStatus.listed)
  //     expect(wrapper.find('section#ffa-listings-view').vm.$props.walletAddress).toBeUndefined()
  //     expect(wrapper.find('section#ffa-listings-view').exists()).toBeTruthy()
  //   })
  // })

  // these are removed for now...
  // describe('renders single listing routes', () => {

  //   it('renders listingsSingleListedRoute', () => {
  //     router.push(listingsSingleListedRoute)
  //     expect(wrapper.find('section#single-listing').vm.$props.status).toEqual(FfaListingStatus.listed)
  //     expect(wrapper.find('section#single-listing').vm.$props.walletAddress).toBeUndefined()
  //     expect(wrapper.find('section#single-listing').vm.$props.requiresWeb3).toBeTruthy()
  //     expect(wrapper.find('section#single-listing').exists()).toBeTruthy()
  //   })

  //   it('renders listingsSingleCandidateRoute', () => {
  //     router.push(listingsSingleCandidateRoute)
  //     expect(wrapper.find('section#ffa-candidate').vm.$props.status).toEqual(FfaListingStatus.candidate)
  //     expect(wrapper.find('section#ffa-candidate').vm.$props.walletAddress).toBeUndefined()
  //     expect(wrapper.find('section#ffa-candidate').exists()).toBeTruthy()
  //   })
  // })

  describe('renders user routes', () => {

    it('renders usersListingsRoute', () => {
      router.push(usersListingsRoute)
      expect(wrapper.find('section#ffa-listings-view').vm.$props.status).toBeUndefined()
      expect(wrapper.find('section#ffa-listings-view').vm.$props.walletAddress).toEqual('0xwallet')
      expect(wrapper.find('section#ffa-listings-view').exists()).toBeTruthy()
    })

    // it('renders usersAllListingsRoute', () => {
    //   router.push(usersAllListingsRoute)
    //   expect(wrapper.find('section#ffa-listings-view').vm.$props.status).toBeUndefined()
    //   expect(wrapper.find('section#ffa-listings-view').vm.$props.walletAddress).toEqual('0xwallet')
    //   expect(wrapper.find('section#ffa-listings-view').exists()).toBeTruthy()
    // })

    it('renders userCandidatesRoute', () => {
      router.push(usersCandidatesRoute)
      expect(wrapper.find('section#ffa-listings-view').vm.$props.status).toEqual(FfaListingStatus.candidate)
      expect(wrapper.find('section#ffa-listings-view').vm.$props.walletAddress).toEqual('0xwallet')
      expect(wrapper.find('section#ffa-listings-view').exists()).toBeTruthy()
    })

    it('renders userListedRoute', () => {
      router.push(usersListedRoute)
      expect(wrapper.find('section#ffa-listings-view').vm.$props.status).toEqual(FfaListingStatus.listed)
      expect(wrapper.find('section#ffa-listings-view').vm.$props.walletAddress).toEqual('0xwallet')
      expect(wrapper.find('section#ffa-listings-view').exists()).toBeTruthy()
    })
  })

  describe('support route', () => {
    it('renders support route', () => {
      router.push(supportRoute)
      expect(wrapper.find('section#support')).toBeDefined()
    })
  })

  describe('navigation guard', () => {
    it('guards navigation properly', () => {


      router.beforeEach((to: Route, from: Route, next: (val?: any) => void) => {
        appModule = getModule(AppModule, store)
        if (SharedModule.isAuthenticated()) {
          appModule.setNavigationView(NavigationView.Full)
          to.path === '/login' ? next('/home') : next()
        } else {
          if (to.path === '/login') {
            next()
          } else {
            appModule.setNavigationView(NavigationView.Minimal)
            next({
              path: '/login',
              query: { redirectFrom: to.fullPath },
            })
          }
        }
      })

      SharedModule.isAuthenticated = jest.fn(() => false)
      router.push('/login')
      expect(router.currentRoute.fullPath).toBe('/login')

      router.push('/listings/candidates')
      expect(router.currentRoute.fullPath).toBe('/login')
      expect(appModule.navigationView).toBe(NavigationView.Minimal)

      SharedModule.isAuthenticated = jest.fn(() => true)
      router.push('/listings/candidates')
      expect(router.currentRoute.fullPath).toBe('/listings/candidates')
      expect(appModule.navigationView).toBe(NavigationView.Full)

      router.push('/login')
      expect(router.currentRoute.fullPath).toBe('/listings/listed')
    })
  })
})
