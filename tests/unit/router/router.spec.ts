import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { router } from '../../../src/router' // TODO: figure out why @/router doesn't work
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../src/vuexModules/AppModule'

import App from '@/App.vue'
import FfaListingView from '../../../src/views/FfaListingView.vue'
import Navigation from '../../../src/components/ui/Navigation.vue'
import Drawer from '../../../src/components/ui/Drawer.vue'

import { FfaListingStatus } from '../../../src/models/FfaListing'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle, faPlusSquare } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle, faPlusSquare)
const homeRoute = '/'
const exploreRoute = '/explore'
const listingRoute = '/listings'
const listingAllRoute = '/listings/all'
const listingCandidatesRoute = '/listings/candidates'
const listingListedRoute = '/listings/listed'
const listingSingleCandidateRoute = '/listings/candidates/0xhash'
const listingSingleListedRoute = '/listings/listed/0xhash'
const userListingRoute = '/users/0xwallet/listings'
const userAllListingRoute = '/users/0xwallet/listings/all'
const userCandidatesRoute = '/users/0xwallet/listings/candidates'
const userListedRoute = '/users/0xwallet/listings/listed'
const userSingleCandidatesRoute = '/users/0xwallet/listings/candidates/0xhash'
const userSingleListedRoute = '/users/0xwallet/listings/listed/0xhash'
const listingNewRoute = '/listings/new'

describe('router', () => {

  let wrapper!: Wrapper<App>
  const appModule = getModule(AppModule, appStore)

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('navigation', Navigation)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
    localVue.component('drawer', Drawer)
    localVue.component('FfaListingView', FfaListingView)

    appModule.setAppReady(true)
    appModule.setMakerPayment(0)
    appModule.setCostPerByte(1)
    appModule.setStake(2)
    appModule.setPriceFloor(3)
    appModule.setPlurality(4)
    appModule.setVoteBy(5)
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

  describe('renders expected \'list of listings\' routes', () => {
    it('renders exploreRoute', () => {
      router.push(exploreRoute)
      expect(wrapper.find('section#listings').vm.$props.status).toBeUndefined()
      expect(wrapper.find('section#listings').vm.$props.walletAddress).toBeUndefined()
      expect(wrapper.find('section#listings').exists()).toBeTruthy()
    })
    it('renders listingRoute', () => {
      router.push(listingRoute)
      expect(wrapper.find('section#listings').vm.$props.status).toBeUndefined()
      expect(wrapper.find('section#listings').vm.$props.walletAddress).toBeUndefined()
      expect(wrapper.find('section#listings').exists()).toBeTruthy()
    })
    it('renders listingAllRoute', () => {
      router.push(listingAllRoute)
      expect(wrapper.find('section#listings').vm.$props.status).toBeUndefined()
      expect(wrapper.find('section#listings').vm.$props.walletAddress).toBeUndefined()
      expect(wrapper.find('section#listings').exists()).toBeTruthy()
    })
    it('renders listingCandidatesRoute', () => {
      router.push(listingCandidatesRoute)
      expect(wrapper.find('section#listings').vm.$props.status).toEqual(FfaListingStatus.candidate)
      expect(wrapper.find('section#listings').vm.$props.walletAddress).toBeUndefined()
      expect(wrapper.find('section#listings').exists()).toBeTruthy()
    })
    it('renders listingListedRoute', () => {
      router.push(listingListedRoute)
      expect(wrapper.find('section#listings').vm.$props.status).toEqual(FfaListingStatus.listed)
      expect(wrapper.find('section#listings').vm.$props.walletAddress).toBeUndefined()
      expect(wrapper.find('section#listings').exists()).toBeTruthy()
    })
  })

  describe('renders single listing routes', () => {
    it('renders listingSingleListedRoute', () => {
      router.push(listingSingleListedRoute)
      expect(wrapper.find('section#single-listing').vm.$props.status).toEqual(FfaListingStatus.listed)
      expect(wrapper.find('section#single-listing').vm.$props.walletAddress).toBeUndefined()
      expect(wrapper.find('section#single-listing').vm.$props.requiresWeb3).toBeTruthy()
      expect(wrapper.find('section#single-listing').exists()).toBeTruthy()
    })

    it('renders listingSingleCandidateRoute', () => {
      router.push(listingSingleCandidateRoute)
      expect(wrapper.find('section#single-listing').vm.$props.status).toEqual(FfaListingStatus.candidate)
      expect(wrapper.find('section#single-listing').vm.$props.walletAddress).toBeUndefined()
      expect(wrapper.find('section#single-listing').exists()).toBeTruthy()
    })
  })

  describe('renders user routes', () => {
    it('renders userListingRoute', () => {
      router.push(userListingRoute)
      expect(wrapper.find('section#listings').vm.$props.status).toBeUndefined()
      expect(wrapper.find('section#listings').vm.$props.walletAddress).toEqual('0xwallet')
      expect(wrapper.find('section#listings').exists()).toBeTruthy()
    })
    it('renders userAllListingRoute', () => {
      router.push(userAllListingRoute)
      expect(wrapper.find('section#listings').vm.$props.status).toBeUndefined()
      expect(wrapper.find('section#listings').vm.$props.walletAddress).toEqual('0xwallet')
      expect(wrapper.find('section#listings').exists()).toBeTruthy()
    })
    it('renders userCandidatesRoute', () => {
      router.push(userCandidatesRoute)
      expect(wrapper.find('section#listings').vm.$props.status).toEqual(FfaListingStatus.candidate)
      expect(wrapper.find('section#listings').vm.$props.walletAddress).toEqual('0xwallet')
      expect(wrapper.find('section#listings').exists()).toBeTruthy()
    })
    it('renders userListedRoute', () => {
      router.push(userListedRoute)
      expect(wrapper.find('section#listings').vm.$props.status).toEqual(FfaListingStatus.listed)
      expect(wrapper.find('section#listings').vm.$props.walletAddress).toEqual('0xwallet')
      expect(wrapper.find('section#listings').exists()).toBeTruthy()
    })
    it('renders listingNewRoute', () => {
      router.push(listingNewRoute)
      expect(wrapper.find('section#list').exists()).toBeTruthy()
    })
  })
})
