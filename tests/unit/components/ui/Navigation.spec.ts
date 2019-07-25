import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Navigation from '@/components/ui/Navigation.vue'
import appStore from '../../../../src/store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FileUploader from '@/components/datatrust/FileUploader.vue'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle)
const navbarClass = 'navbar'
const navbarMenuClass = 'navbar-menu'
const navbarStartClass = 'navbar-start'
const navbarEndClass = 'navbar-end'
const navbarItemClass = 'navbar-item'
const shareClass = 'share'
const browseClass = 'browse'
const supportClass = 'support'
const logoClass = 'logo'
const connectClass = 'connect'

describe('Navigation.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  it('renders the Navigation component', () => {
    const wrapper = shallowMount(Navigation, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll('nav').length).toBe(1)
    expect(wrapper.findAll(`nav.${navbarClass}`).length).toBe(1)
    expect(wrapper.findAll(`nav .${navbarMenuClass}`).length).toBe(1)
    expect(wrapper.findAll(`nav .${navbarMenuClass} .${navbarStartClass}`).length).toBe(1)
    expect(wrapper.findAll(`nav .${navbarMenuClass} .${navbarEndClass}`).length).toBe(1)
    expect(wrapper.findAll(`nav .${navbarMenuClass} .${navbarEndClass} .${navbarItemClass}`).length).toBe(4)
    expect(wrapper.findAll(`nav .${navbarMenuClass} .${shareClass}`).length).toBe(1)
    expect(wrapper.findAll(`nav .${navbarMenuClass} .${browseClass}`).length).toBe(1)
    expect(wrapper.findAll(`nav .${navbarMenuClass} .${supportClass}`).length).toBe(1)
    expect(wrapper.findAll(`nav .${navbarMenuClass} .${logoClass}`).length).toBe(1)
    expect(wrapper.findAll(`nav .${navbarMenuClass} .${connectClass}`).length).toBe(1)
  })
})
