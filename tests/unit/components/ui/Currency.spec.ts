import { shallowMount, createLocalVue, mount, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Currency from '@/components/ui/Currency.vue'
import appStore from '../../../../src/store'

const localVue = createLocalVue()
localVue.use(VueRouter)
const currencyClass = '.currency'
const topRowClass = '.top-row-non-editable'
const pillboxClass = '.token-tag'
const valueClass = '.value'
const bottomRowClass = '.bottom-row'
const editorClass = '.input'

describe('Currency.vue', () => {

  let wrapper!: Wrapper<Currency>

  beforeAll(() => {
    localVue.use(VueRouter)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders with no props', () => {
    wrapper = mount(Currency, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(currencyClass).length).toBe(1)
    expect(wrapper.findAll(topRowClass).length).toBe(1)
    expect(wrapper.findAll(pillboxClass).length).toBe(1)
    expect(wrapper.findAll(valueClass).length).toBe(1)
    expect(wrapper.findAll(bottomRowClass).length).toBe(1)
  })

  it('renders values', () => {

    wrapper = mount(Currency, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        currencySymbol: 'ABC',
        currencyValue: 234.56,
        currencyPrecision: 3,
        fiatSymbol: '€XYZ',
        fiatRate: 0.12,
      },
    })

    expect(wrapper.findAll(currencyClass).length).toBe(1)
    expect(wrapper.findAll(topRowClass).length).toBe(1)
    expect(wrapper.find(pillboxClass).text()).toEqual('ABC')
    expect(wrapper.find(valueClass).text()).toEqual('234.560')
    expect(wrapper.find(bottomRowClass).text()).toEqual('(€XYZ 28.15)')
  })

  it('hides fiat', () => {

    wrapper = mount(Currency, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        currencySymbol: 'ABC',
        currencyValue: 234.56,
        fiatSymbol: '€XYZ',
        fiatRate: 0.12,
        hideFiat: true,
      },
    })

    expect(wrapper.findAll(currencyClass).length).toBe(1)
    expect(wrapper.findAll(topRowClass).length).toBe(1)
    expect(wrapper.find(pillboxClass).text()).toEqual('ABC')
    expect(wrapper.find(valueClass).text()).toEqual('235')
    const bottomRow = wrapper.find(bottomRowClass).element as HTMLDivElement
    expect(bottomRow.className.indexOf('hidden')).toBeGreaterThanOrEqual(0)
  })

  it('renders the editor', async () => {

    wrapper = mount(Currency, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        currencySymbol: 'ABC',
        currencyValue: 234.56,
        fiatSymbol: '€XYZ',
        fiatRate: 0.12,
        editable: true,
      },
    })

    expect(wrapper.findAll(editorClass).length).toBe(1)
  })

  it('supports editing the currency value', () => {

    wrapper = mount(Currency, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        currencySymbol: 'ABC',
        currencyValue: 234.56,
        fiatSymbol: '€XYZ',
        fiatRate: 0.12,
        editable: true,
      },
    })

    const editor = wrapper.find(editorClass).element as HTMLInputElement
    expect(editor.value).toBe('234.56')
    editor.value = '123.45'
    wrapper.find(editorClass).trigger('input')
    expect(wrapper.find(bottomRowClass).text()).toEqual('(€XYZ 14.81)')
  })

  it('calls onChange when the input value changes', () => {

    const callback = jest.fn((n: number) => {
      // do nothing
    })

    wrapper = mount(Currency, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        currencySymbol: 'ABC',
        currencyValue: 234.56,
        fiatSymbol: '€XYZ',
        fiatRate: 0.12,
        editable: true,
        onChange: callback,
      },
    })

    const editor = wrapper.find(editorClass).element as HTMLInputElement
    expect(editor.value).toBe('234.56')
    editor.value = '123.45'
    wrapper.find(editorClass).trigger('input')
    expect(callback).toBeCalledWith(123.45)
  })

  it('responds to prop changes', () => {

    wrapper = mount(Currency, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        currencySymbol: 'ABC',
        currencyValue: 234.56,
        fiatSymbol: '€XYZ',
        fiatRate: 0.12,
        editable: true,
      },
    })

    expect(wrapper.findAll(editorClass).length).toBe(1)

    wrapper.setProps({
      currencySymbol: 'ABC',
      currencyValue: 100,
      fiatSymbol: '€XYZ',
      fiatRate: 0.12,
      editable: false,
    })

    expect(wrapper.findAll(editorClass).length).toBe(0)
    expect(wrapper.findAll(valueClass).length).toBe(1)
    expect(wrapper.find(valueClass).text()).toEqual('100')
    expect(wrapper.find(bottomRowClass).text()).toEqual('(€XYZ 12.00)')
  })
})
