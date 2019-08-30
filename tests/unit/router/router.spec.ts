import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import App from '@/App.vue'
import VueRouter from 'vue-router'
import { router } from '../../../src/router' // TODO: figure out why @/router doesn't work
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../src/vuexModules/AppModule'

import Navigation from '../../../src/components/ui/Navigation.vue'
import Drawer from '../../../src/components/ui/Drawer.vue'

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

    appModule.setEthereumEnabled(true)
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

  describe('renders expected listing routes', () => {
    it('renders exploreRoute', () => {
      router.push(exploreRoute)
      expect(wrapper.find('section#listings').exists()).toBe(true)
    })
    it('renders listingRoute', () => {
      router.push(listingRoute)
      expect(wrapper.find('section#listings').exists()).toBe(true)
    })
    it('renders listingAllRoute', () => {
      router.push(listingAllRoute)
      expect(wrapper.find('section#listings').exists()).toBe(true)
    })
    it('renders listingCandidatesRoute', () => {
      router.push(listingCandidatesRoute)
      expect(wrapper.find('section#listings').exists()).toBe(true)
    })
    it('renders listingListedRoute', () => {
      router.push(listingListedRoute)
      expect(wrapper.find('section#listings').exists()).toBe(true)
    })
    it('renders listingSingleListedRoute', () => {
      router.push(listingSingleListedRoute)
      expect(wrapper.find('section#single-listing').exists()).toBe(true)
    })
    it('renders listingSingleCandidateRoute', () => {
      router.push(listingSingleCandidateRoute)
      expect(wrapper.find('section#single-listing').exists()).toBe(true)
    })
  })

  describe('renders user routes', () => {
    it('renders userListingRoute', () => {
      router.push(userListingRoute)
      expect(wrapper.find('section#listings').exists()).toBe(true)
    })
    it('renders userAllListingRoute', () => {
      router.push(userAllListingRoute)
      expect(wrapper.find('section#listings').exists()).toBe(true)
    })
    it('renders userCandidatesRoute', () => {
      router.push(userCandidatesRoute)
      expect(wrapper.find('section#listings').exists()).toBe(true)
    })
    it('renders userListedRoute', () => {
      router.push(userListedRoute)
      expect(wrapper.find('section#listings').exists()).toBe(true)
    })
    it('renders userSingleCandidatesRoute', () => {
      router.push(userSingleCandidatesRoute)
      expect(wrapper.find('section#single-listing').exists()).toBe(true)
    })
    it('renders userSingleListedRoute', () => {
      router.push(userSingleListedRoute)
      expect(wrapper.find('section#single-listing').exists()).toBe(true)
    })
    it('renders listingNewRoute', () => {
      router.push(listingNewRoute)
      expect(wrapper.find('section#list').exists()).toBe(true)
    })
  })
})
