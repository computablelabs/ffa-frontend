import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import appStore from '../../../../src/store'

import SubwayItem from '@/components/voting/SubwayItem.vue'

import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'

// tslint:disable no-shadowed-variable
const localVue = createLocalVue()
localVue.use(VueRouter)


const subwayItemContainerClass = 'subway-item-container'
const subwayItemClass = 'item'
const subwayLineClass = 'line'

let wrapper!: Wrapper<SubwayItem>

describe('SubwayItem.vue', () => {
  beforeAll(() => {
    localVue.use(VueRouter)
    VotingContractModule.getStake = jest.fn(() => (Promise.resolve(0)))
    MarketTokenContractModule.balanceOf = jest.fn(() => ( Promise.resolve('100000000000000000')))

    wrapper = shallowMount(SubwayItem, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: { isIconTop: true },
    })
  })

  afterAll(() => {
    wrapper.destroy()
  })

  it('renders correctly', () => {
    let innerDivs = wrapper.findAll(`.${subwayItemContainerClass} > div`)
    expect(innerDivs.at(0).classes()).toContain(subwayItemClass)
    expect(innerDivs.at(1).classes()).toContain(subwayLineClass)

    wrapper.setProps({ isIconTop: false })

    innerDivs = wrapper.findAll(`.${subwayItemContainerClass} > div`)
    expect(innerDivs.at(0).classes()).toContain(subwayLineClass)
    expect(innerDivs.at(1).classes()).toContain(subwayItemClass)

    wrapper.setProps({ linesOnTopAndBottom: true })
    expect(wrapper.findAll('.line').length).toBe(2)
  })

  // Computed methods
  it('correctly computes subwayItemWrapperClass', () => {
    wrapper.setProps({ isIconTop: true })
    // @ts-ignore
    expect(wrapper.vm.subwayItemWrapperClass).toBe('subway-item-top')

    wrapper.setProps({ isIconTop: false })
    // @ts-ignore
    expect(wrapper.vm.subwayItemWrapperClass).toBe('subway-item-bottom')
  })

  it('correctly computes subwayItemContainerClass', () => {
    wrapper.setProps({ isIconTop: true })
    // @ts-ignore
    expect(wrapper.vm.subwayItemContainerClass).toBe('subway-item-container-top')

    wrapper.setProps({ isIconTop: false })
    // @ts-ignore
    expect(wrapper.vm.subwayItemContainerClass).toBe('subway-item-container-bottom')
  })

  it('correctly computes iconClass', () => {
    wrapper.setProps({ isIconTop: true })
    // @ts-ignore
    expect(wrapper.vm.iconClass).toBe('subway-icon-top')

    wrapper.setProps({ isIconTop: false })
    // @ts-ignore
    expect(wrapper.vm.iconClass).toBe('subway-icon-bottom')
  })
})
