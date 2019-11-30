import { createLocalVue, Wrapper, shallowMount, mount } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import VueRouter from 'vue-router'

import appStore from '../../../../src/store'

import { VotingActionStep } from '../../../../src/models/VotingActionStep'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { FfaDatatrustTaskType } from '../../../../src/models/DatatrustTaskDetails'

import { Errors } from '../../../../src/util/Constants'

import TaskPollerModule from '../../../../src/functionModules/task/TaskPollerModule'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'

import EventModule from '../../../../src/vuexModules/EventModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'
import ChallengeModule from '../../../../src/vuexModules/ChallengeModule'

import VotingApproveSpendingStep from '@/components/voting/VotingApproveSpendingStep.vue'

import VotingModule from '../../../../src/vuexModules/VotingModule'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable
const localVue = createLocalVue()
localVue.use(VueRouter)
let wrapper!: Wrapper<VotingApproveSpendingStep>
let votingModule: VotingModule
let eventModule!: EventModule
let flashesModule!: FlashesModule
let challengeModule!: ChallengeModule

const processId = '12345'

describe('VotingApproveSpendingStep.vue', () => {
  beforeAll(() => {
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
      wrapper = shallowMount(VotingApproveSpendingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(1)
    })
  })


  describe('contract calls', () => {
    it('makes the correct contract call', () => {
      MarketTokenContractModule.balanceOf = jest.fn(() => Promise.resolve('100'))
      MarketTokenContractModule.approve = jest.fn(() => Promise.resolve())

      wrapper = mount(VotingApproveSpendingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.find(`.process-button .button`).trigger('click')
      expect(MarketTokenContractModule.balanceOf).toHaveBeenCalled()
    })
  })

  describe('vuexSubscriptions processing', () => {
    beforeEach(() => {
      MarketTokenContractModule.balanceOf = jest.fn(() => Promise.resolve('100'))
      MarketTokenContractModule.approve = jest.fn()
    })

    afterEach(() => { wrapper.destroy() })

    it ('adds the transaction id', async () => {
      const transactionId = '0xtransaction'
      const spy = jest.fn()

      TaskPollerModule.createTaskPollerForEthereumTransaction = spy

      wrapper = mount(VotingApproveSpendingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ approvalProcessId: processId})

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
      votingModule.setStatus = jest.fn()
      votingModule.setVotingStep = jest.fn()
      TaskPollerModule.createTaskPollerForEthereumTransaction = jest.fn()

      wrapper = mount(VotingApproveSpendingStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
        propsData: {
          taskType: FfaDatatrustTaskType.voteApproveSpending,
        },
      })

      wrapper.setData({ approvalProcessId: processId})

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error(Errors.USER_DENIED_SIGNATURE),
      })

      await flushPromises()

      expect(votingModule.setStatus).toBeCalledWith(ProcessStatus.Ready)
      expect(votingModule.setVotingStep).toBeCalledWith(VotingActionStep.ApproveSpending)

      expect(TaskPollerModule.createTaskPollerForEthereumTransaction).not.toBeCalled()
    })

    it ('handles regular error when challenging', async () => {

      flashesModule.append = jest.fn()
      challengeModule.setStatus  = jest.fn()
      challengeModule.setChallengeStep  = jest.fn()

      wrapper = mount(VotingApproveSpendingStep, {
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

      expect(challengeModule.setStatus).toBeCalledWith(ProcessStatus.Ready)
      expect(challengeModule.setStatus).toBeCalledWith(VotingActionStep.ApproveSpending)
      expect(flashesModule.append).toBeCalled()
    })
  })
})
