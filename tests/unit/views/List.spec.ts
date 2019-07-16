import { mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import List from '@/views/List.vue'
import appStore from '../../../src/store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FileUploader from '@/components/datatrust/FileUploader.vue'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle)
const listId = 'list'
const fileUploaderClass = 'file-uploader'

describe('List.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  it('renders the List view', () => {
    const wrapper = mount(List, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`section#${listId}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileUploaderClass}`).length).toBe(1)
  })
})
