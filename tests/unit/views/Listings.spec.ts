import { mount, createLocalVue, Wrapper, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Listings from '@/views/Listings.vue'
import appStore from '../../../src/store'
import { router } from '../../../src/router' // TODO: figure out why @/router doesn't work

const localVue = createLocalVue()
const exploreRoute = '/explore'
const homeRoute = '/home'
const tabClass = '.tabs'
const listingsHeaderClass = '.listing-header'


describe('Listings.vue', () => {
  let wrapper!: Wrapper<Listings>
  beforeAll(() => {
    localVue.use(VueRouter)
  })

  it('properly renders in the /explore route', () => {
    wrapper = mount(Listings, {
      localVue,
      store: appStore,
      router,
    })
    router.push(exploreRoute)
    expect(wrapper.findAll(tabClass).length).toBe(1)
    expect(wrapper.findAll(listingsHeaderClass).length).toBe(1)
  })

  it('properly renders in the /explore route', () => {
    wrapper = mount(Listings, {
      localVue,
      store: appStore,
      router,
    })
    router.push(homeRoute)
    expect(wrapper.findAll(tabClass).length).toBe(1)
    expect(wrapper.findAll(listingsHeaderClass).length).toBe(1)
  })

})
