import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'
import VotingDrawer from '@/views/drawers/VotingDrawer.vue'

import VueRouter from 'vue-router'

describe('VotingDrawer.vue', () => {

  const localVue = createLocalVue()
  let wrapper!: Wrapper<VotingDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
  })

  afterEach(() => {
    if (wrapper !== undefined) {
      wrapper.destroy()
    }
  })

  it('renders VotingDrawer view', () => {
    wrapper = shallowMount(VotingDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll('votingprocess-stub').length).toBe(1)
  })
})
