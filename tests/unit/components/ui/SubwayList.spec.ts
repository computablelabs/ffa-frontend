import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import SubwayList from '../../../../src/components/ui/SubwayList.vue'
import appStore from '../../../../src/store'

const localVue = createLocalVue()

describe('SubwayList.vue', () => {
  let wrapper!: Wrapper<SubwayList>

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the List view', () => {
    wrapper = mount(SubwayList, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll('.subway-item-top').length).toBe(1)
  })
})
