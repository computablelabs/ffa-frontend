import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'

import UnstakeDrawer from '@/views/drawers/UnstakeDrawer.vue'

import VotingModule from '../../../../src/vuexModules/VotingModule'
import VueRouter from 'vue-router'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'

import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'

// tslint:disable no-shadowed-variable

let votingModule!: VotingModule

const unstakeDrawerWrapperClass = 'unstake-drawer-wrapper'
const unstakeErrorClass = 'unstake-error'
const blockchainExecutingMessageClass = 'blockchain-executing-message'
const drawerMessageClass = 'drawer-message-container'
const buttonClass = 'button'

describe('UnstakeDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<UnstakeDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    votingModule = getModule(VotingModule, appStore)
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders UnstakeDrawer view', () => {
    wrapper = mount(UnstakeDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${unstakeDrawerWrapperClass}`).length).toBe(1)
  })

  it('renders error', () => {
    wrapper = mount(UnstakeDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    votingModule.setUnstakeStatus(ProcessStatus.Error)

    expect(wrapper.findAll(`.${unstakeErrorClass}`).length).toBe(1)
  })

  it('renders processing', () => {
    wrapper = mount(UnstakeDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    votingModule.setUnstakeStatus(ProcessStatus.Executing)
    expect(wrapper.findAll(`.${blockchainExecutingMessageClass}`).length).toBe(1)
  })

  it('renders complete', () => {
    wrapper = mount(UnstakeDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    votingModule.setUnstakeStatus(ProcessStatus.Complete)
    expect(wrapper.findAll(`.${drawerMessageClass}`).length).toBe(1)
  })

  it('calls protocol', () => {

    const spy = jest.fn()
    VotingContractModule.unstake = spy

    wrapper = mount(UnstakeDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    wrapper.find(`.${buttonClass}`).trigger('click')
    expect(spy).toHaveBeenCalled()
  })
})
