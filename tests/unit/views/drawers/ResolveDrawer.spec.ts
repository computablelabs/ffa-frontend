import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import flushPromises from 'flush-promises'

import ResolveDrawer from '@/views/drawers/ResolveDrawer.vue'

import { Labels, Errors } from '../../../../src/util/Constants'

import VotingModule from '../../../../src/vuexModules/VotingModule'
import EventModule from '../../../../src/vuexModules/EventModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'

import VueRouter from 'vue-router'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { FfaDatatrustTaskType } from '../../../../src/models/DatatrustTaskDetails'

import TaskPollerModule from '../../../../src/functionModules/task/TaskPollerModule'

import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'

// tslint:disable no-shadowed-variable

let votingModule!: VotingModule
let eventModule!: EventModule
let flashesModule!: FlashesModule

const resolveDrawerWrapperClass = 'resolve-drawer-wrapper'
const unstakeErrorClass = 'resolve-error'
const blockchainExecutingMessageClass = 'blockchain-executing-message'
const drawerMessageClass = 'drawer-message-container'
const buttonClass = 'button'

const processId = '12345'

describe('ResolveDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<ResolveDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)

    votingModule = getModule(VotingModule, appStore)
    eventModule = getModule(EventModule, appStore)
    flashesModule = getModule(FlashesModule, appStore)
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

  describe('vuexSubscriptions processing', () => {

    it ('adds the transaction id', async () => {

      const transactionId = '0xtransaction'
      const spy = jest.fn()

      TaskPollerModule.createTaskPollerForEthereumTransaction = spy


      wrapper = mount(ResolveDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ resolveProcessId: processId})

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: {
          result: transactionId,
        },
        error: undefined,
      })

      await flushPromises()

      expect(spy).toBeCalled()
    })

    it ('handles user signature cancel', async () => {
      votingModule.setResolveApplicationStatus = jest.fn()
      flashesModule.append = jest.fn()

      wrapper = mount(ResolveDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ resolveProcessId: processId})

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error(Errors.USER_DENIED_SIGNATURE),
      })

      await flushPromises()

      expect(votingModule.setResolveApplicationStatus).toBeCalled()
      expect(flashesModule.append).not.toBeCalled()
    })

    it ('handles regular error', async () => {

      flashesModule.append = jest.fn()
      votingModule.setResolveApplicationStatus  = jest.fn()

      wrapper = mount(ResolveDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ resolveProcessId: processId})

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error('Estimate gas failure.  Likely contract operation error.  Check your params!'),
      })

      await flushPromises()

      expect(votingModule.setResolveApplicationStatus).toBeCalledWith(ProcessStatus.Ready)
    })
  })
})
