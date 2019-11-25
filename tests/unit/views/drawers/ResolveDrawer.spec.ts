import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'

import ResolveDrawer from '@/views/drawers/ResolveDrawer.vue'

import VotingModule from '../../../../src/vuexModules/VotingModule'
import VueRouter from 'vue-router'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { FfaDatatrustTaskType } from '../../../../src/models/DatatrustTaskDetails'

import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'

// tslint:disable no-shadowed-variable

let votingModule!: VotingModule

const resolveDrawerWrapperClass = 'resolve-drawer-wrapper'
const unstakeErrorClass = 'resolve-error'
const blockchainExecutingMessageClass = 'blockchain-executing-message'
const drawerMessageClass = 'drawer-message-container'
const buttonClass = 'button'

describe('ResolveDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<ResolveDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    votingModule = getModule(VotingModule, appStore)
  })

  afterEach(() => {
    votingModule.setResolveApplicationStatus(ProcessStatus.Ready)
    votingModule.setResolveChallengeStatus(ProcessStatus.Ready)
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders ResolveDrawer view for application', () => {
    wrapper = mount(ResolveDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        resolveTaskType: FfaDatatrustTaskType.resolveApplication,
      },
    })

    expect(wrapper.findAll(`.${resolveDrawerWrapperClass}`).length).toBe(1)
  })

  it('renders ResolveDrawer view for challenge', () => {
    wrapper = mount(ResolveDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        resolveTaskType: FfaDatatrustTaskType.resolveChallenge,
      },
    })

    expect(wrapper.findAll(`.${resolveDrawerWrapperClass}`).length).toBe(1)
  })

  it('renders error for application', () => {
    wrapper = mount(ResolveDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        resolveTaskType: FfaDatatrustTaskType.resolveApplication,
      },
    })

    votingModule.setResolveApplicationStatus(ProcessStatus.Error)

    expect(wrapper.findAll(`.${unstakeErrorClass}`).length).toBe(1)
  })

  it('renders error for challenge', () => {
    wrapper = mount(ResolveDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        resolveTaskType: FfaDatatrustTaskType.resolveChallenge,
      },
    })

    votingModule.setResolveChallengeStatus(ProcessStatus.Error)

    expect(wrapper.findAll(`.${unstakeErrorClass}`).length).toBe(1)
  })

  it('renders processing for application', () => {
    wrapper = mount(ResolveDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        resolveTaskType: FfaDatatrustTaskType.resolveApplication,
      },
    })
    votingModule.setResolveApplicationStatus(ProcessStatus.Executing)
    expect(wrapper.findAll(`.${blockchainExecutingMessageClass}`).length).toBe(1)
  })

  it('renders processing for challenge', () => {
    wrapper = mount(ResolveDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        resolveTaskType: FfaDatatrustTaskType.resolveChallenge,
      },
    })
    votingModule.setResolveChallengeStatus(ProcessStatus.Executing)
    expect(wrapper.findAll(`.${blockchainExecutingMessageClass}`).length).toBe(1)
  })

  it('renders complete for application', () => {
    wrapper = mount(ResolveDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        resolveTaskType: FfaDatatrustTaskType.resolveApplication,
      },
    })
    votingModule.setResolveApplicationStatus(ProcessStatus.Complete)
    expect(wrapper.findAll(`.${drawerMessageClass}`).length).toBe(1)
  })

  it('renders complete for challenge', () => {
    wrapper = mount(ResolveDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        resolveTaskType: FfaDatatrustTaskType.resolveChallenge,
      },
    })
    votingModule.setResolveChallengeStatus(ProcessStatus.Complete)
    expect(wrapper.findAll(`.${drawerMessageClass}`).length).toBe(1)
  })

  it('calls protocol for application', () => {

    const spy = jest.fn()
    ListingContractModule.resolveApplication = spy

    wrapper = mount(ResolveDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        resolveTaskType: FfaDatatrustTaskType.resolveApplication,
      },
    })
    wrapper.find(`.${buttonClass}`).trigger('click')
    expect(spy).toHaveBeenCalled()
  })

  it('calls protocol for challenge', () => {

    const spy = jest.fn()
    ListingContractModule.resolveChallenge = spy

    wrapper = mount(ResolveDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        resolveTaskType: FfaDatatrustTaskType.resolveChallenge,
      },
    })

    wrapper.find(`.${buttonClass}`).trigger('click')
    expect(spy).toHaveBeenCalled()
  })
})
