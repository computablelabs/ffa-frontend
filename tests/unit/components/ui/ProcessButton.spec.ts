import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import ProcessButton from '../../../../src/components/ui/ProcessButton.vue'
import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import TaggersModule from '../../../../src/vuexModules/TaggersModule'

const localVue = createLocalVue()
const buttonClass = 'button'
const spinnerClass = 'spinner'
const editableClass = 'editable'

let wrapper!: Wrapper<ProcessButton>

afterEach(() => {
  wrapper.destroy()
})

describe('ProcessButton.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
  })

  it('renders the ProcessButton component with button default', () => {
    wrapper = mount(ProcessButton, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${spinnerClass}`).length).toBe(0)
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

    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(0)
    expect(wrapper.findAll(`.${spinnerClass}`).length).toBe(1)
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
    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(0)
    expect(wrapper.findAll(`.${spinnerClass}`).length).toBe(1)
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
