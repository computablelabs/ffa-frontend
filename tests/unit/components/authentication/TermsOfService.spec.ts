import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'

import appStore from '../../../../src/store'

import TermsOfService from '../../../../src/components/authentication/TermsOfService.vue'

import AppModule from '../../../../src/vuexModules/AppModule'

import { DrawerBlockchainStepState } from '../../../../src/models/DrawerBlockchainStepState'

import Servers from '../../../../src/util/Servers'

import MetamaskModule from '../../../../src/functionModules/metamask/MetamaskModule'

const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'

describe('Login.vue', () => {

  let wrapper!: Wrapper<TermsOfService>
  let appModule!: AppModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  describe('rendering', () => {
    it('renders correctly', () => {
      wrapper = mount(TermsOfService, {
        attachToDocument: true,
        store: appStore,
      })
      console.log(wrapper.html())
    })
  })
})
