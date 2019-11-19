import { createLocalVue, Wrapper, shallowMount, mount } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import VueRouter from 'vue-router'

import appStore from '../../../../src/store'

import CastVoteStep from '@/components/voting/CastVoteStep.vue'

import { VotingActionStep } from '../../../../src/models/VotingActionStep'
import { DrawerBlockchainStepState } from '../../../../src/models/DrawerBlockchainStepState'
import Flash from '../../../../src/models/Flash'

import VotingModule from '../../../../src/vuexModules/VotingModule'

import { Labels, Errors } from '../../../../src/util/Constants'

import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'
import TaskPollerModule from '../../../../src/functionModules/task/TaskPollerModule'

import EventModule from '../../../../src/vuexModules/EventModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable
const localVue = createLocalVue()
localVue.use(VueRouter)
let wrapper!: Wrapper<CastVoteStep>
let votingModule: VotingModule
let eventModule!: EventModule
let flashesModule!: FlashesModule

const processId = '12345'

describe('VerticalSubway.vue', () => {
  beforeEach(() => {
    localVue.use(VueRouter)
    votingModule = getModule(VotingModule, appStore)
    eventModule = getModule(EventModule, appStore)
    flashesModule = getModule(FlashesModule, appStore)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders subcomponents correctly', () => {
    wrapper = shallowMount(CastVoteStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    votingModule.setVotingStep(VotingActionStep.VotingAction)
    expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(2)

    votingModule.setVotingStep(VotingActionStep.ApprovalPending)
    expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(1)
  })

  it('correctly computes drawerLabel', () => {
    wrapper = shallowMount(CastVoteStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    votingModule.setVotingStep(VotingActionStep.ApproveSpending)
    let drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.VOTE)

    votingModule.setVotingStep(VotingActionStep.ApprovalPending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.VOTE)

    votingModule.setVotingStep(VotingActionStep.VotingAction)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.VOTE)

    votingModule.setVotingStep(VotingActionStep.VotingActionPending)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.VOTE)

    votingModule.setVotingStep(VotingActionStep.Complete)
    drawerLabel = getDrawerLabel(wrapper)
    expect(drawerLabel).toEqual(Labels.VOTE)
  })

  it('correctly computes drawerStepState', () => {
    wrapper = shallowMount(CastVoteStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    votingModule.setVotingStep(VotingActionStep.Error)
    let drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toEqual(DrawerBlockchainStepState.ready)

    votingModule.setVotingStep(VotingActionStep.ApproveSpending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toEqual(DrawerBlockchainStepState.upcoming)

    votingModule.setVotingStep(VotingActionStep.ApprovalPending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toEqual(DrawerBlockchainStepState.upcoming)

    votingModule.setVotingStep(VotingActionStep.VotingAction)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toEqual(DrawerBlockchainStepState.ready)

    votingModule.setVotingStep(VotingActionStep.VotingActionPending)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toEqual(DrawerBlockchainStepState.processing)

    votingModule.setVotingStep(VotingActionStep.Complete)
    drawerStepState = getDrawerStepState(wrapper)
    expect(drawerStepState).toEqual(DrawerBlockchainStepState.completed)
  })

  it('correctly computes choiceUpcoming', () => {
    wrapper = shallowMount(CastVoteStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    votingModule.setVotingStep(VotingActionStep.Error)
    let choiceUpcoming = getChoiceUpcoming(wrapper)
    expect(choiceUpcoming).toEqual(true)

    votingModule.setVotingStep(VotingActionStep.ApproveSpending)
    choiceUpcoming = getChoiceUpcoming(wrapper)
    expect(choiceUpcoming).toEqual(true)

    votingModule.setVotingStep(VotingActionStep.ApprovalPending)
    choiceUpcoming = getChoiceUpcoming(wrapper)
    expect(choiceUpcoming).toEqual(true)

    votingModule.setVotingStep(VotingActionStep.VotingAction)
    choiceUpcoming = getChoiceUpcoming(wrapper)
    expect(choiceUpcoming).toEqual(false)

    votingModule.setVotingStep(VotingActionStep.VotingActionPending)
    choiceUpcoming = getChoiceUpcoming(wrapper)
    expect(choiceUpcoming).toEqual(false)

    votingModule.setVotingStep(VotingActionStep.Complete)
    choiceUpcoming = getChoiceUpcoming(wrapper)
    expect(choiceUpcoming).toEqual(false)
  })

  it('correctly computes acceptVoteState', () => {
    wrapper = shallowMount(CastVoteStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    votingModule.setVotingStep(VotingActionStep.Error)
    let acceptVoteState = getAcceptVoteState(wrapper)
    expect(acceptVoteState).toEqual(DrawerBlockchainStepState.ready)

    votingModule.setVotingStep(VotingActionStep.ApproveSpending)
    acceptVoteState = getAcceptVoteState(wrapper)
    expect(acceptVoteState).toEqual(DrawerBlockchainStepState.upcoming)

    votingModule.setVotingStep(VotingActionStep.ApprovalPending)
    acceptVoteState = getAcceptVoteState(wrapper)
    expect(acceptVoteState).toEqual(DrawerBlockchainStepState.upcoming)

    votingModule.setVotingStep(VotingActionStep.VotingAction)
    acceptVoteState = getAcceptVoteState(wrapper)
    expect(acceptVoteState).toEqual(DrawerBlockchainStepState.ready)

    votingModule.setVotingStep(VotingActionStep.VotingActionPending)
    acceptVoteState = getAcceptVoteState(wrapper)
    expect(acceptVoteState).toEqual(DrawerBlockchainStepState.hidden)

    votingModule.setVotingStep(VotingActionStep.Complete)
    acceptVoteState = getAcceptVoteState(wrapper)
    expect(acceptVoteState).toEqual(DrawerBlockchainStepState.completed)
  })

  it('correctly computes rejectVoteState', () => {
    wrapper = shallowMount(CastVoteStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    wrapper.setData({ voteValue: false })
    votingModule.setVotingStep(VotingActionStep.VotingActionPending)
    let rejectVoteState = getRejectVoteState(wrapper)
    expect(rejectVoteState).toBe(DrawerBlockchainStepState.processing)

    votingModule.setVotingStep(VotingActionStep.ApprovalPending)
    rejectVoteState = getRejectVoteState(wrapper)
    expect(rejectVoteState).toBe(DrawerBlockchainStepState.upcoming)
  })

  it('casts a vote when clicked', () => {
    votingModule.setVotingStep(VotingActionStep.VotingAction)
    VotingContractModule.vote = jest.fn()

    wrapper = mount(CastVoteStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    const voteButtons = wrapper.findAll(`.process-button .button`)
    voteButtons.at(0).trigger('click')
    voteButtons.at(1).trigger('click')
    expect(VotingContractModule.vote).toHaveBeenCalledTimes(2)
  })

  describe('vuexSubscriptions processing', () => {

    it ('adds the transaction id', async () => {

      const transactionId = '0xtransaction'
      const spy = jest.fn()

      TaskPollerModule.createTaskPollerForEthereumTransaction = spy


      wrapper = mount(CastVoteStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ votingProcessId: processId})

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
      votingModule.setVotingStep = jest.fn((voteStep: VotingActionStep) => {
        // do nothing
      })

      flashesModule.append = jest.fn((flash: Flash) => {
        // do nothing
      })

      wrapper = mount(CastVoteStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ votingProcessId: processId})

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error(Errors.USER_DENIED_SIGNATURE),
      })

      await flushPromises()

      expect(votingModule.setVotingStep).toBeCalledWith(VotingActionStep.VotingAction)
      expect(flashesModule.append).not.toBeCalled()
    })

    it ('handles regular error', async () => {

      flashesModule.append = jest.fn()
      votingModule.setVotingStep  = jest.fn()


      wrapper = mount(CastVoteStep, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      wrapper.setData({ votingProcessId: processId})

      eventModule.append({
        timestamp: new Date().getTime(),
        processId,
        response: undefined,
        error: new Error('Estimate gas failure.  Likely contract operation error.  Check your params!'),
      })

      await flushPromises()

      expect(votingModule.setVotingStep).toBeCalledWith(VotingActionStep.Error)
      expect(flashesModule.append).toBeCalled()
    })
  })
})

function getDrawerLabel(wrapper: Wrapper<CastVoteStep>): string {
  // @ts-ignore
  return wrapper.vm.drawerLabel
}

function getDrawerStepState(wrapper: Wrapper<CastVoteStep>): string {
  // @ts-ignore
  return wrapper.vm.drawerStepState
}

function getChoiceUpcoming(wrapper: Wrapper<CastVoteStep>): string {
  // @ts-ignore
  return wrapper.vm.choiceUpcoming
}

function getAcceptVoteState(wrapper: Wrapper<CastVoteStep>): string {
  // @ts-ignore
  return wrapper.vm.acceptVoteState
}

function getRejectVoteState(wrapper: Wrapper<CastVoteStep>): string {
  // @ts-ignore
  return wrapper.vm.rejectVoteState
}
