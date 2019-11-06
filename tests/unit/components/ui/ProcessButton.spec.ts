import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import ProcessButton from '../../../../src/components/ui/ProcessButton.vue'
import appStore from '../../../../src/store'

const localVue = createLocalVue()
const buttonClass = 'button'
const spinnerClass = 'is-loading'

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

    const spy =  jest.fn(() =>  ('foo'))

    wrapper = mount(ProcessButton, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        processing: false,
        onClickCallback: spy,
      },
    })

    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${spinnerClass}`).length).toBe(0)
    wrapper.find(`.${buttonClass}`).trigger('click')
    expect(spy).toHaveBeenCalled()
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

  it ('calls the interceptor', () => {
    const clickInterceptor = jest.fn()

    wrapper = mount(ProcessButton, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        processing: false,
        clickInterceptor,
      },
    })

    wrapper.find(`.${buttonClass}`).trigger('click')
    expect(clickInterceptor).toHaveBeenCalled()
  })

})
