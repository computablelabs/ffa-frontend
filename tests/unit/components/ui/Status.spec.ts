import Vuex from 'vuex'
import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'
import Status from '@/components/ui/Status.vue'

const localVue = createLocalVue()
const statusClass = 'status'
const progressBarRef = 'progress-bar'
const labelRef = 'status-label'

describe('Status.vue', () => {

  let wrapper!: Wrapper<Status>

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the default Status component', () => {

    wrapper = shallowMount(Status, {
      attachToDocument: true,
      localVue,
      propsData: {
        label: 'alabel',
        percentComplete: 22,
      },
    })

    expect(wrapper.findAll(`.${statusClass}`).length).toBe(1)
    expect(wrapper.find(`.${statusClass}`).findAll('svg').length).toBe(1)
    expect(wrapper.find(`.${statusClass}`).findAll('path').length).toBe(1)
    expect(wrapper.find(`.${statusClass}`).findAll('circle').length).toBe(1)
    expect(wrapper.find(`.${statusClass}`).findAll({ ref: progressBarRef }).length).toBe(1)
    expect(wrapper.find(`.${statusClass}`).find('circle').attributes('stroke-dasharray')).toBe('94')

    // based on 22 percent complete
    expect(wrapper.find(`.${statusClass}`).find('circle').attributes('stroke-dashoffset')).toBe('73.32')
    expect(wrapper.find(`.${statusClass}`).find({ ref: labelRef }).text()).toBe('alabel...22%')
  })

  it('renders the percentage when updated', () => {

    wrapper = mount(Status, {
      attachToDocument: true,
      localVue,
      propsData: {
        label: 'alabel',
        percentComplete: 56,
      },
    })

    // based on 56 percent complete
    expect(wrapper.find(`.${statusClass}`).find('circle').attributes('stroke-dashoffset')).toBe('41.36')
  })
})
