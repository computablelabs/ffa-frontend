import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'

import UnstakeDrawer from '@/views/drawers/UnstakeDrawer.vue'

import VotingModule from '../../../../src/vuexModules/VotingModule'
import VueRouter from 'vue-router'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'

import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'

import TaskPollerModule from '../../../../src/functionModules/task/TaskPollerModule'

import EventModule from '../../../../src/vuexModules/EventModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'

import { Labels, Errors } from '../../../../src/util/Constants'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

let votingModule!: VotingModule
let eventModule!: EventModule
let flashesModule!: FlashesModule

const unstakeDrawerWrapperClass = 'unstake-drawer-wrapper'
const unstakeErrorClass = 'unstake-error'
const blockchainExecutingMessageClass = 'blockchain-executing-message'
const drawerMessageClass = 'drawer-message-container'
const buttonClass = 'button'
const processId = '12345'

describe('UnstakeDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<UnstakeDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)

    votingModule = getModule(VotingModule, appStore)
    eventModule = getModule(EventModule, appStore)
    flashesModule = getModule(FlashesModule, appStore)
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

  describe('vuexSubscriptions processing', () => {

    it ('adds the transaction id', async () => {

      const transactionId = '0xtransaction'
      const spy = jest.fn()

      TaskPollerModule.createTaskPollerForEthereumTransaction = spy


      wrapper = mount(UnstakeDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ unstakeProcessId: processId})

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
      votingModule.resetUnstake = jest.fn()
      flashesModule.append = jest.fn()

      wrapper = mount(UnstakeDrawer, {
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

      expect(votingModule.resetUnstake).toBeCalled()
      expect(flashesModule.append).not.toBeCalled()
    })
  })
})
