import { shallowMount } from '@vue/test-utils'
// import List from '@/views/List.vue' // TODO: fix vs code lint issue here
import { getModule } from 'vuex-module-decorators'
import VotingModule from '../../../src/vuexModules/VotingModule'
import appStore from '../../../src/store'
import FfaProcessModule from '../../../src/interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../../../src/models/ProcessStatus'

describe('VotingModule.ts', () => {

  it('correctly implements the correct interface', () => {
    const votingModule = getModule(VotingModule, appStore)
    expect((votingModule as FfaProcessModule).prepare).not.toBeNull()
    expect((votingModule as FfaProcessModule).namespace).not.toBeNull()
    expect((votingModule as FfaProcessModule).percentComplete).not.toBeNull()
    expect((votingModule as FfaProcessModule).status).not.toBeNull()
  })

  it('correctly initializes and exposes properties', () => {
    const votingModule = getModule(VotingModule, appStore)
    expect(VotingModule).not.toBeNull()
    expect(votingModule.namespace).not.toBeNull()
    expect(votingModule.namespace).toEqual('votingModule')
  })
})
