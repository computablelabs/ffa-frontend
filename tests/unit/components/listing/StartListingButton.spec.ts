import VueRouter from 'vue-router'
import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import StartProcessButton from '../../../../src/components/ui/StartProcessButton.vue'
import appStore from '../../../../src/store'

const localVue = createLocalVue()
const buttonClass = 'button'

describe('StartProcessButton.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
  })

  it('renders the start listing button', () => {
    const wrapper = shallowMount(StartProcessButton, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
  })
})
