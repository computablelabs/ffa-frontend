import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'

import Navigation from '../../../../src/components/ui/Navigation.vue'
import { NavigationView } from '../../../../src/models/NavigationView'

const navbarClass = 'navbar'
const logoClass = 'wordmark'
const navbarMenuClass = 'navbar-menu'
const navbarEndClass = 'navbar-end'
const navbarItemClass = 'navbar-item'
const shareClass = 'share'
const browseClass = 'browse'
const supportClass = 'support'
const connectClass = 'connect'
const userIdentityClass = 'user-identity'
const jazziconClass = 'jazzicon'
const addressClass = 'address'

/* tslint:disable:max-line-length */
const localVue = createLocalVue()

describe('Navigation.vue', () => {

  const appModule = getModule(AppModule, appStore)

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('navigation', Navigation)
  })

  afterEach(() => {
    appModule.setJwt(null)
  })

  it('renders unconnected', () => {
    const wrapper = shallowMount(Navigation, {
      attachToDocument: true,
      localVue,
      store: appStore,
    })
    expect(wrapper.findAll(`.${navbarClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${logoClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${navbarItemClass}`).length).toBe(4)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${shareClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${browseClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${supportClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${connectClass}`).length).toBe(1)
  })

  it('renders connected', () => {
    const wrapper = shallowMount(Navigation, {
      attachToDocument: true,
      localVue,
      store: appStore,
    });

    (window as any).ethereum = {
      selectedAddress: '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048',
    }
    appModule.setJwt('jwt')

    expect(wrapper.findAll(`.${navbarClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${logoClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${navbarItemClass}`).length).toBe(4)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${shareClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${browseClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${supportClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${userIdentityClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${userIdentityClass} .${jazziconClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${userIdentityClass} .${addressClass}`).length).toBe(1)
  })

  it('isConnected is false w/o selectedAddress and jwt', () => {
    const wrapper = shallowMount(Navigation, {
      attachToDocument: true,
      localVue,
      store: appStore,
    });
    (window as any).ethereum = undefined
    appModule.setJwt(null)
    // @ts-ignore
    expect(wrapper.vm.isConnected).toBe(false)
  })

  it('isConnected is false w/o jwt', () => {
    const wrapper = shallowMount(Navigation, {
      attachToDocument: true,
      localVue,
      store: appStore,
    });

    (window as any).ethereum = {
      selectedAddress: '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048',
    }
    // @ts-ignore
    expect(wrapper.vm.isConnected).toBe(false);
    (window as any).ethereum = undefined
  })

  it('isConnected is false w/o ethereum', () => {
    const wrapper = shallowMount(Navigation, {
      attachToDocument: true,
      localVue,
      store: appStore,
    })

    appModule.setJwt('jwt')
    // @ts-ignore
    expect(wrapper.vm.isConnected).toBe(false)
  })

  it('isConnected is true w/ ethereum and jwt', () => {
    const wrapper = shallowMount(Navigation, {
      attachToDocument: true,
      localVue,
      store: appStore,
    });

    (window as any).ethereum = {
      selectedAddress: '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048',
    }
    appModule.setJwt('jwt')
    // @ts-ignore
    expect(wrapper.vm.isConnected).toBe(true)
  })

  it('renders correctly given the proper NavigationView prop', () => {
    const wrapper = shallowMount(Navigation, {
      attachToDocument: true,
      localVue,
      store: appStore,
      propsData: { navigationView: NavigationView.Full },
    })

    // console.log(wrapper.html())
    expect(wrapper.find('.share').isVisible()).toBeTruthy()
    expect(wrapper.find('.browse').isVisible()).toBeTruthy()
    expect(wrapper.find('.support').isVisible()).toBeTruthy()
    expect(wrapper.find('.connect').isVisible()).toBeTruthy()

    wrapper.setProps({ navigationView: NavigationView.Identity })

    expect(wrapper.find('.share').isVisible()).toBeFalsy()
    expect(wrapper.find('.browse').isVisible()).toBeFalsy()
    expect(wrapper.find('.support').isVisible()).toBeFalsy()
    expect(wrapper.find('.connect').isVisible()).toBeTruthy()

    wrapper.setProps({ navigationView: NavigationView.Minimal })
    expect(wrapper.find('.share').isVisible()).toBeFalsy()
    expect(wrapper.find('.browse').isVisible()).toBeFalsy()
    expect(wrapper.find('.support').isVisible()).toBeFalsy()
    expect(wrapper.find('.connect').isVisible()).toBeFalsy()
  })
})
