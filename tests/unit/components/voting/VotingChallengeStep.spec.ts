import { createLocalVue, Wrapper, shallowMount, mount } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import VueRouter from 'vue-router'

import appStore from '../../../../src/store'

import { VotingActionStep } from '../../../../src/models/VotingActionStep'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { DrawerBlockchainStepState } from '../../../../src/models/DrawerBlockchainStepState'

import { Errors } from '../../../../src/util/Constants'

import TaskPollerModule from '../../../../src/functionModules/task/TaskPollerModule'
import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'

import EventModule from '../../../../src/vuexModules/EventModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'
import ChallengeModule from '../../../../src/vuexModules/ChallengeModule'

import VotingChallengeStep from '@/components/voting/VotingChallengeStep.vue'

import VotingModule from '../../../../src/vuexModules/VotingModule'

import flushPromises from 'flush-promises'
// import { DrawerBlockchainStepState } from 'models/DrawerBlockchainStepState';

// tslint:disable no-shadowed-variable
const localVue = createLocalVue()
localVue.use(VueRouter)
let wrapper!: Wrapper<VotingChallengeStep>
let votingModule: VotingModule
let eventModule!: EventModule
let flashesModule!: FlashesModule
let challengeModule!: ChallengeModule

const processId = '12345'

describe('VotingChallengeStep.vue', () => {
  beforeEach(() => {
    localVue.use(VueRouter)
    votingModule = getModule(VotingModule, appStore)
    eventModule = getModule(EventModule, appStore)
    flashesModule = getModule(FlashesModule, appStore)
    challengeModule = getModule(ChallengeModule, appStore)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  describe('rendering', () => {
    it('renders subcomponents correctly', () => {
      wrapper = shallowMount(VotingChallengeStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(1)
    })
  })

  describe('contract calls', () => {
    it('makes the correct contract call', () => {
      ListingContractModule.challenge = jest.fn(() => Promise.resolve())

      challengeModule.setChallengeStep(VotingActionStep.VotingAction)

      wrapper = mount(VotingChallengeStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.find(`.process-button .button`).trigger('click')
      expect(ListingContractModule.challenge).toHaveBeenCalled()
    })
  })


  describe('vuexSubscriptions processing', () => {

    afterEach(() => {
      wrapper.destroy()
    })

    it ('adds the transaction id', async () => {
      const transactionId = '0xtransaction'
      const spy = jest.fn()

      TaskPollerModule.createTaskPollerForEthereumTransaction = spy

      wrapper = mount(VotingChallengeStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ challengeProcessId: processId})

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
      challengeModule.setStatus = jest.fn()
      challengeModule.setChallengeStep = jest.fn()
      TaskPollerModule.createTaskPollerForEthereumTransaction = jest.fn()

      wrapper = mount(VotingChallengeStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ challengeProcessId: processId})

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error(Errors.USER_DENIED_SIGNATURE),
      })

      await flushPromises()

      expect(challengeModule.setStatus).toBeCalledWith(ProcessStatus.Ready)
      expect(challengeModule.setChallengeStep).toBeCalledWith(VotingActionStep.VotingAction)

      expect(TaskPollerModule.createTaskPollerForEthereumTransaction).not.toBeCalled()
    })

    it ('handles regular errors', async () => {

      challengeModule.setChallengeStep  = jest.fn()

      wrapper = mount(VotingChallengeStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ approvalProcessId: processId})

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error('Estimate gas failure.  Likely contract operation error.  Check your params!'),
      })

      await flushPromises()

      expect(challengeModule.setChallengeStep).toBeCalledWith(VotingActionStep.Error)
    })
  })
})
