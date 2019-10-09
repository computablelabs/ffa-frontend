import { shallowMount, createLocalVue, mount, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Currency from '@/components/ui/Currency.vue'
import appStore from '../../../../src/store'

const localVue = createLocalVue()
localVue.use(VueRouter)
const currencyClass = '.currency'
const topRowClass = '.top-row'
const pillboxClass = '.pillbox'
const valueClass = '.value'
const bottomRowClass = '.bottom-row'

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
        fiatValue: 0.12,
      },
    })

    expect(wrapper.findAll(currencyClass).length).toBe(1)
    expect(wrapper.findAll(topRowClass).length).toBe(1)
    expect(wrapper.find(pillboxClass).text()).toEqual('ABC')
    expect(wrapper.find(valueClass).text()).toEqual('234.560')
    expect(wrapper.find(bottomRowClass).text()).toEqual('(€XYZ 0.12)')
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
        fiatValue: 0.12,
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

})
