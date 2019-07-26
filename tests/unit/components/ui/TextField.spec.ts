import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import appStore from '../../../../src/store'
// import { library } from '@fortawesome/fontawesome-svg-core'
// import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
// import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import TextField from '@/components/ui/TextField.vue'
import FfaFieldValidation from '../../../../src/modules/validators/FfaFieldValidation'

const localVue = createLocalVue()
// library.add(faFileSolid, faFile, faCheckCircle)
const fieldClass = 'field'
const textFieldClass = 'text-field'
const controlClass = 'control'
const labelClass = 'label'
const inputClass = 'input'
const helpClass = 'help'
const isDangerClass = 'is-danger'

describe('TextField.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
  //  localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  it('renders the default TextField component with no toppings', () => {
    const wrapper = shallowMount(TextField, {
      attachToDocument: true,
    })
    expect(wrapper.findAll(`.${fieldClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fieldClass}.${textFieldClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fieldClass} .${controlClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fieldClass} .${controlClass} .${inputClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fieldClass} .${helpClass}`).length).toBe(0)
  })

  it('renders the TextField component with label', () => {
    const wrapper = shallowMount(TextField, {
      attachToDocument: true,
      propsData: {
        showLabel: true,
        label: 'das label',
      },
    })
    expect(wrapper.findAll(`.${fieldClass} .${controlClass} .${labelClass}`).length).toBe(1)
    expect(wrapper.find(`.${fieldClass} .${controlClass} .${labelClass}`).text()).toEqual('das label')
  })

  it('renders the TextField component with placeholder text', () => {
    const wrapper = shallowMount(TextField, {
      attachToDocument: true,
      propsData: {
        placeholder: 'placeholder',
      },
    })
    const input = wrapper.find(`.${fieldClass} .${controlClass} .${inputClass}`).element as HTMLInputElement
    expect(input.placeholder).toEqual('placeholder')
  })

  it('renders the TextField component with an initial value', () => {
    const wrapper = shallowMount(TextField, {
      attachToDocument: true,
      propsData: {
        value: 'le value',
      },
    })
    const input = wrapper.find(`.${fieldClass} .${controlClass} .${inputClass}`).element as HTMLInputElement
    expect(input.value).toEqual('le value')
  })

  it('renders the TextField component disabled', () => {
    const wrapper = mount(TextField, {
      attachToDocument: false,
      propsData: {
        editable: false,
      },
    })
    const input = wrapper.find(`.${fieldClass} .${controlClass} .${inputClass}`).element as HTMLInputElement
  })

  it('renders the TextField component with custom css classes on the input', () => {
    const wrapper = shallowMount(TextField, {
      attachToDocument: true,
      propsData: {
        classes: ['foo', 'bar'],
      },
    })
    expect(wrapper.findAll(`.${fieldClass} .${controlClass} .${inputClass}.foo`).length).toBe(1)
    expect(wrapper.findAll(`.${fieldClass} .${controlClass} .${inputClass}.bar`).length).toBe(1)
  })

  it('renders the error message and applies the is-danger style', () => {
    const wrapper = shallowMount(TextField, {
      attachToDocument: true,
      propsData: {
        validator: (title: string) => {
          const validation = new FfaFieldValidation('title')
          validation.valid = false
          validation.errorMessage = 'ich bin eine error'
          return validation
        },
      },
    })
    wrapper.find('input').setValue('foo')
    expect(wrapper.findAll(`.${fieldClass} .${helpClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fieldClass} .${isDangerClass}`).length).toBe(2)
    expect(wrapper.findAll(`.${fieldClass} input.${isDangerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fieldClass} p.${isDangerClass}`).length).toBe(1)
  })

  it('renders the error message and then removes it', () => {
    const wrapper = shallowMount(TextField, {
      attachToDocument: true,
      propsData: {
        validator: (title: string) => {
          const validation = new FfaFieldValidation('title')
          validation.valid = !(title === 'foo')
          validation.errorMessage = 'ich bin eine error'
          return validation
        },
      },
    })
    wrapper.find('input').setValue('foo')
    expect(wrapper.findAll(`.${fieldClass} .${helpClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fieldClass} .${isDangerClass}`).length).toBe(2)
    wrapper.find('input').setValue('bar')
    expect(wrapper.findAll(`.${fieldClass} .${helpClass}`).length).toBe(0)
    expect(wrapper.findAll(`.${fieldClass} .${isDangerClass}`).length).toBe(0)
  })

  it('triggers onChange when the TextField content changes', () => {
    let called = false
    const wrapper = shallowMount(TextField, {
      attachToDocument: true,
      propsData: {
        onChange: (title: string) => {
          called = true
        },
      },
    })
    wrapper.find('input').setValue('changed')
    expect(called).toBeTruthy()
  })
})
