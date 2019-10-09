import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import ProcessButton from '../../../../src/components/ui/ProcessButton.vue'
import appStore from '../../../../src/store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getModule } from 'vuex-module-decorators'
import VotingModule from '../../../../src/vuexModules/VotingModule'

const localVue = createLocalVue()
const buttonClass = 'button'
const spinnerClass = 'is-loading'
const clickEventName = 'onClick'

let wrapper!: Wrapper<ProcessButton>

afterEach(() => {
  wrapper.destroy()
})

describe('ProcessButton.vue', () => {

  beforeAll(() => {
    library.add(faSpinner)

    localVue.use(VueRouter)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  it('renders the ProcessButton component with button default', () => {
    wrapper = mount(ProcessButton, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
    expect(wrapper.find(`.${buttonClass}`).classes()).not.toContain(spinnerClass)
  })

  it('renders the ProcessButton component with spinner from prop', () => {
    wrapper = mount(ProcessButton, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        processing: true,
      },
    })

    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
    expect(wrapper.find(`.${buttonClass}`).classes()).toContain(spinnerClass)
  })

  it('responds to button click', () => {
    wrapper = mount(ProcessButton, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        processing: false,
      },
    })

    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${spinnerClass}`).length).toBe(0)
    wrapper.find(`.${buttonClass}`).trigger('click')
    expect(wrapper.emitted('clicked' )).toBeTruthy()
  })

  it('does not toggle when given relevant prop', () => {
    wrapper = mount(ProcessButton, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        processing: false,
        noToggle: true,
      },
    })

    // No toggle
    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${spinnerClass}`).length).toBe(0)
    wrapper.find(`.${buttonClass}`).trigger('click')
    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${spinnerClass}`).length).toBe(0)
  })

  it('does not emit events when not clickable', () => {
    wrapper = mount(ProcessButton, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        processing: false,
        clickable: false,
      },
    })

    wrapper.find(`.${buttonClass}`).trigger('click')
    expect(wrapper.emitted().clicked).toBeFalsy()
  })

  it('calls the callback prop on button click', () => {

    const spy =  jest.fn(() => {
      const foo = 'bar'
    })

    wrapper = mount(ProcessButton, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        processing: false,
        onClickCallback: spy,
      },
    })

    wrapper.find(`.${buttonClass}`).trigger('click')
    expect(spy).toHaveBeenCalled()
  })

})
