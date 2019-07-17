import { mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import ListDrawer from '@/views/ListDrawer.vue'
import appStore from '../../../src/store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FileUploader from '@/components/datatrust/FileUploader.vue'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle)
const listDrawerClass = 'list-drawer'
const statusClass = 'status'

describe('ListDrawer.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  it('renders the ListDrawer view', () => {
    const wrapper = mount(ListDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`.${listDrawerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${statusClass}`).length).toBe(3)
  })
})
