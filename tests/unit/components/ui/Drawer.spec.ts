import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Drawer from '@/components/ui/Drawer.vue'
import appStore from '../../../../src/store'
import FileUploader from '@/components/listing/FileUploader.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)
const drawerClass = 'drawer'

describe('Drawer.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
  })

  it('renders the Drawer component', () => {
    const wrapper = shallowMount(Drawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
  })
    expect(wrapper.findAll(`section.${drawerClass}`).length).toBe(1)
  })
})
