import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Navigation from '../../../src/components/ui/Navigation.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const navbarClass = 'navbar'
const navbarMenuClass = 'navbar-menu'
const navbarEndClass = 'navbar-end'
const navbarItemClass = 'navbar-item'
const shareClass = 'share'
const browseClass = 'browse'
const supportClass = 'support'
const tileClass = 'tile'
const connectClass = 'connect'
const logoClass = 'logo'

/* tslint:disable:max-line-length */

const localVue = createLocalVue()

describe('Navigation.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('navigation', Navigation)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  it('correctly renders', () => {
    const wrapper = shallowMount(Navigation, {
      attachToDocument: true,
      localVue,
    })
    expect(wrapper.findAll(`.${navbarClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${navbarItemClass}`).length).toBe(4)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${shareClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${browseClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass} .${supportClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${navbarClass} .${navbarMenuClass} .${navbarEndClass}`).length).toBe(1)
    expect(wrapper.find(`.${connectClass}`).isVisible()).toBe(true)
    expect(wrapper.findAll(`.${connectClass}`).length).toBe(1)
    expect(wrapper.find(`.${tileClass}`).isVisible()).toBe(false)
    expect(wrapper.findAll(`.${tileClass}`).length).toBe(1)
  })
})
