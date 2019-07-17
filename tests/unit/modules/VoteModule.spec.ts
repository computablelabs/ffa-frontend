import { shallowMount } from '@vue/test-utils'
// import List from '@/views/List.vue' // TODO: fix vs code lint issue here
import { getModule } from 'vuex-module-decorators'
import VoteModule from '../../../src/modules/VoteModule'
import appStore from '../../../src/store'
import FfaProcessModule from '../../../src/modules/FfaProcessModule'
import { ProcessStatus } from '../../../src/models/ProcessStatus'

describe('VoteModule.ts', () => {

  it('correctly implements the correct interface', () => {
    const voteModule = getModule(VoteModule, appStore)
    expect((voteModule as FfaProcessModule).prepare).not.toBeNull()
    expect((voteModule as FfaProcessModule).namespace).not.toBeNull()
    expect((voteModule as FfaProcessModule).percentComplete).not.toBeNull()
    expect((voteModule as FfaProcessModule).status).not.toBeNull()
  })

  it('correctly initializes and exposes properties', () => {
    const voteModule = getModule(VoteModule, appStore)
    expect(VoteModule).not.toBeNull()
    expect(voteModule.namespace).not.toBeNull()
    expect(voteModule.namespace).toEqual('voteModule')
    expect(voteModule.voteInFavor).not.toBeNull()
    expect(voteModule.voteInFavor).toBeFalsy()
  })
})
