import {  mount, shallowMount, Wrapper } from '@vue/test-utils'

import appStore from '../../../../src/store'

import TermsOfService from '../../../../src/components/authentication/TermsOfService.vue'

describe('TermsOfService.vue', () => {

  let wrapper!: Wrapper<TermsOfService>

  afterEach(() => {
    wrapper.destroy()
  })

  describe('rendering', () => {
    it('renders correctly', () => {
      wrapper = shallowMount(TermsOfService, {
        attachToDocument: true,
        store: appStore,
      })

      expect(wrapper.find('terms-stub').exists()).toBeTruthy()
      expect(wrapper.find('section.agreement-footer').exists()).toBeTruthy()
      expect(wrapper.find('span.checkmark').exists()).toBeTruthy()
      expect(wrapper.find('button.is-primary').exists()).toBeTruthy()
    })
  })

  describe('agree button', () => {
    it('renders properly', () => {
      wrapper = mount(TermsOfService, {
        attachToDocument: true,
        store: appStore,
      })

      expect(wrapper.vm.$data.checked).toBe(false)
      wrapper.find('label.container').trigger('click')
      expect(wrapper.vm.$data.checked).toBe(true)
    })
  })
})
