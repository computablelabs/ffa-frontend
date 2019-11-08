import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Navigation from '../../../../src/components/ui/Navigation.vue'

const navbarClass = 'navbar'
const navbarMenuClass = 'navbar-menu'
const navbarEndClass = 'navbar-end'
const navbarItemClass = 'navbar-item'
const shareClass = 'share'
const browseClass = 'browse'
const supportClass = 'support'
const tileClass = 'tile'
const connectClass = 'connect'
const logoClass = 'wordmark'

/* tslint:disable:max-line-length */
const localVue = createLocalVue()

describe('FlashMessage.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('navigation', Navigation)
    ethereum.selectedAddress = '0xt3st'
  })

  it('renders warning message', () => {
    const message = 'a bleak warning from the future'
    const wrapper = shallowMount(Navigation, {
      attachToDocument: true,
      localVue,
    })
    expect(wrapper.findAll(`.${navbarClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${navbarItemClass}`).length).toBe(4)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${shareClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${browseClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${supportClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${connectClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${logoClass}`).length).toBe(1)
  })

  describe('isConnected()', () => {
    it('correctly reacts ', () => {
      const wrapper = shallowMount(Navigation, {
        attachToDocument: true,
        localVue,
      })
      // @ts-ignore
      expect(wrapper.vm.isConnected).toBe(true)
    })
  })

  describe('isEthereumDefined()', () => {
    it('correctly reacts ', () => {
      const wrapper = shallowMount(Navigation, {
        attachToDocument: true,
        localVue,
      })
      // @ts-ignore
      expect(wrapper.vm.isEthereumDefined).toBe(true)
    })
  })

})

describe('Navigation.vue, ethereum global undefined', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    // @ts-ignore
    ethereum = undefined
  })

  // it('correctly renders', () => {
  //   const wrapper = shallowMount(Navigation, {
  //     attachToDocument: true,
  //     localVue,
  //   })
  //   expect(wrapper.find(`.${connectClass}`).isVisible()).toBe(true)
  //   expect(wrapper.find(`.${tileClass}`).isVisible()).toBe(false)
  // })

  // describe('isConnected()', () => {
  //   it('correctly reacts ', () => {
  //     const wrapper = shallowMount(Navigation, {
  //       attachToDocument: true,
  //       localVue,
  //     })
  //     // @ts-ignore
  //     expect(wrapper.vm.isConnected).toBe(false)
  //   })
  // })

  // describe('isEthereumDefined()', () => {
  //   it('correctly reacts ', () => {
  //     const wrapper = shallowMount(Navigation, {
  //       attachToDocument: true,
  //       localVue,
  //     })
  //     // @ts-ignore
  //     expect(wrapper.vm.isEthereumDefined).toBe(false)
  //   })
  // })
})
