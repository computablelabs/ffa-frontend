import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'

import appStore from '../../../../src/store'

import Login from '../../../../src/components/authentication/Login.vue'

import AppModule from '../../../../src/vuexModules/AppModule'

import { DrawerBlockchainStepState } from '../../../../src/models/DrawerBlockchainStepState'

import Servers from '../../../../src/util/Servers'

import MetamaskModule from '../../../../src/functionModules/metamask/MetamaskModule'

const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'

describe('Login.vue', () => {

  let wrapper!: Wrapper<Login>
  let appModule!: AppModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  describe('rendering', () => {
    it('renders correctly', () => {
      wrapper = shallowMount(Login, {
        attachToDocument: true,
        store: appStore,
      })

      expect(wrapper.findAll('h2').length).toBe(1)
      expect(wrapper.findAll('h3').length).toBe(1)
      expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(2)
    })
  })

  describe('onButtonClick', () => {
    it('calls the right callback when connecting to metamask', () => {
      ethereum.selectedAddress = ''
      wrapper = mount(Login, {
        attachToDocument: true,
        store: appStore,
      })

      MetamaskModule.enableEthereum = jest.fn()

      wrapper.find('.process-button .button').trigger('click')
      expect(MetamaskModule.enableEthereum).toBeCalled()

    })

    it('calls the right callback when authorizing datatrust', () => {
      ethereum.selectedAddress = fakeRealAddress
      wrapper = mount(Login, {
        attachToDocument: true,
        store: appStore,
      })

      wrapper.setData({ isAuthorizationProcessing: false})
      appModule.setJwt('')
      MetamaskModule.sign = jest.fn()

      wrapper.find('.process-button .button').trigger('click')
      expect(MetamaskModule.sign).toBeCalled()
    })
  })

  describe('computed properties', () => {
    it('computes metamaskStepState correctly', () => {
      ethereum.selectedAddress = fakeRealAddress
      wrapper = shallowMount(Login, {
        attachToDocument: true,
        store: appStore,
      })

      appModule.initializeWeb3(Servers.EthereumJsonRpcProvider!)
      const metamaskState = getIsMetamaskConnected(wrapper)
      expect(metamaskState).toBeTruthy()
    })

    it('computes metamaskStepState correctly', () => {
      ethereum.selectedAddress = ''
      wrapper = shallowMount(Login, {
        attachToDocument: true,
        store: appStore,
      })

      appModule.initializeWeb3(Servers.EthereumJsonRpcProvider!)
      const metamaskState = getIsMetamaskConnected(wrapper)
      expect(metamaskState).toBeFalsy()
    })

    it('computes isDatatrustAuthorized correctly', () => {
      wrapper = shallowMount(Login, {
        attachToDocument: true,
        store: appStore,
      })

      let isDatatrustAuthorized = getIsDatatrustAuthorized(wrapper)
      expect(isDatatrustAuthorized).toBeFalsy()

      appModule.setJwt('jwt')
      isDatatrustAuthorized = getIsDatatrustAuthorized(wrapper)
      expect(isDatatrustAuthorized).toBeTruthy()
    })

    it('computes metamaskStepState correctly', () => {
      ethereum.selectedAddress = fakeRealAddress
      wrapper = shallowMount(Login, {
        attachToDocument: true,
        store: appStore,
      })


      const metamaskStepState = getMetamaskStepState(wrapper)
      expect(metamaskStepState).toBe(DrawerBlockchainStepState.completed)
    })

    it('computes metamaskStepState correctly', () => {
      ethereum.selectedAddress = ''
      wrapper = shallowMount(Login, {
        attachToDocument: true,
        store: appStore,
      })

      MetamaskModule.enableEthereum = jest.fn()

      const metamaskStepState = getMetamaskStepState(wrapper)
      expect(metamaskStepState).toBe(DrawerBlockchainStepState.ready)
    })

    it('computes datatrustStepState correctly', () => {
      ethereum.selectedAddress = ''
      wrapper = shallowMount(Login, {
        attachToDocument: true,
        store: appStore,
      })

      const datatrustStepState = getDatatrustStepState(wrapper)
      expect(datatrustStepState).toBe(DrawerBlockchainStepState.upcoming)
    })

    it('computes datatrustStepState correctly', () => {
      ethereum.selectedAddress = fakeRealAddress
      wrapper = shallowMount(Login, {
        attachToDocument: true,
        store: appStore,
      })

      wrapper.setData({ isAuthorizationProcessing: true})

      const datatrustStepState = getDatatrustStepState(wrapper)
      expect(datatrustStepState).toBe(DrawerBlockchainStepState.processing)
    })

    it('computes datatrustStepState correctly', () => {
      ethereum.selectedAddress = fakeRealAddress
      wrapper = shallowMount(Login, {
        attachToDocument: true,
        store: appStore,
      })

      wrapper.setData({ isAuthorizationProcessing: false})
      appModule.setJwt('jwt')

      const datatrustStepState = getDatatrustStepState(wrapper)
      expect(datatrustStepState).toBe(DrawerBlockchainStepState.completed)
    })

    it('computes datatrustStepState correctly', () => {
      ethereum.selectedAddress = fakeRealAddress
      wrapper = shallowMount(Login, {
        attachToDocument: true,
        store: appStore,
      })

      wrapper.setData({ isAuthorizationProcessing: false})
      appModule.setJwt('')
      MetamaskModule.sign = jest.fn()

      const datatrustStepState = getDatatrustStepState(wrapper)
      expect(datatrustStepState).toBe(DrawerBlockchainStepState.ready)
    })
  })
})

const getIsMetamaskConnected = (wrapper: Wrapper<Login>) => {
  // @ts-ignore
  return wrapper.vm.isMetamaskConnected
}

const getIsDatatrustAuthorized = (wrapper: Wrapper<Login>) => {
  // @ts-ignore
  return wrapper.vm.isDatatrustAuthorized
}

const getMetamaskStepState = (wrapper: Wrapper<Login>) => {
  // @ts-ignore
  return wrapper.vm.metamaskStepState
}

const getDatatrustStepState = (wrapper: Wrapper<Login>) => {
  // @ts-ignore
  return wrapper.vm.datatrustStepState
}
