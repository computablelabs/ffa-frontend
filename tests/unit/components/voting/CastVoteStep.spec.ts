import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import VueRouter from 'vue-router'

import appStore from '../../../../src/store'

import CastVoteStep from '@/components/voting/CastVoteStep.vue'

import { VotingActionStep } from '../../../../src/models/VotingActionStep'
import { DrawerBlockchainStepState } from '../../../../src/models/DrawerBlockchainStepState'

import VotingModule from '../../../../src/vuexModules/VotingModule'

import { Labels } from '../../../../src/util/Constants'

// tslint:disable no-shadowed-variable
const localVue = createLocalVue()
localVue.use(VueRouter)
let wrapper!: Wrapper<CastVoteStep>
let votingModule: VotingModule

describe('VerticalSubway.vue', () => {
  beforeAll(() => {
    localVue.use(VueRouter)
    votingModule = getModule(VotingModule, appStore)

    wrapper = shallowMount(CastVoteStep, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
  })

  it('renders subcomponents correctly', () => {
    votingModule.setVotingStep(VotingActionStep.VotingAction)
    expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(2)

    votingModule.setVotingStep(VotingActionStep.ApprovalPending)
    expect(wrapper.findAll('drawerblockchainstep-stub').length).toBe(1)
  })

  it('correctly computes drawerLabel', () => {
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
    wrapper.setData({ voteValue: false })
    votingModule.setVotingStep(VotingActionStep.VotingActionPending)
    let rejectVoteState = getRejectVoteState(wrapper)
    expect(rejectVoteState).toBe(DrawerBlockchainStepState.processing)

    votingModule.setVotingStep(VotingActionStep.ApprovalPending)
    rejectVoteState = getRejectVoteState(wrapper)
    expect(rejectVoteState).toBe(DrawerBlockchainStepState.upcoming)
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
