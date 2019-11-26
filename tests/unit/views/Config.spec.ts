import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'


import Navigation from '../../../src/components/ui/Navigation.vue'
import Drawer from '../../../src/components/ui/Drawer.vue'
import Config from '../../../src/views/Config.vue'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

const localVue = createLocalVue()

let wrapper!: Wrapper<Config>

const sectionId = 'config'

const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'

describe('Config.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('Navigation', Navigation)
    localVue.component('Drawer', Drawer)
  })

  afterEach(() => {
    flushPromises()
    wrapper.destroy()
  })

  it('renders Config', () => {
    wrapper = mount(Config, {})
    expect(wrapper.findAll(`#${sectionId}`).length).toBe(1)
    expect(wrapper.findAll(`h2`).length).toBe(1)
    expect(wrapper.find('h2').text().startsWith('FFA')).toBeTruthy()
    const h3s = wrapper.findAll('h3')
    expect(h3s.length).toBe(5)
    expect(h3s.at(0).text().startsWith('Ethereum Network')).toBeTruthy()
    expect(h3s.at(1).text().startsWith('Genesis Block')).toBeTruthy()
    expect(h3s.at(2).text().startsWith('JSON RPC')).toBeTruthy()
    expect(h3s.at(3).text().startsWith('Datatrust')).toBeTruthy()
    expect(h3s.at(4).text().startsWith('Listing Batch Size')).toBeTruthy()
  })
})
