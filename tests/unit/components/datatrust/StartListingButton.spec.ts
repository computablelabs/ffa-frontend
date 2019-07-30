import VueRouter from 'vue-router'
import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import StartListingButton from '../../../../src/components/listing/StartListingButton.vue'
import appStore from '../../../../src/store'

const localVue = createLocalVue()
const startListingButtonClass = 'listing-button'

describe('StartListingButton.vue', () => {
  beforeAll(() => {
    localVue.use(VueRouter)
  })

  it('renders the start listing button', () => {
    const wrapper = shallowMount(StartListingButton, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll('button').length).toBe(1)
    expect(wrapper.findAll(`button.${startListingButtonClass}`).length).toBe(1)
  })
})
