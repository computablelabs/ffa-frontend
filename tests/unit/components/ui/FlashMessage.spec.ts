import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import FlashMessage from '@/components/ui/FlashMessage.vue'
import appStore from '../../../../src/store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FileUploader from '@/components/datatrust/FileUploader.vue'
import Flash, { FlashType } from '../../../../src/models/Flash'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle)
const notificationClass = 'notification'

describe('FlashMessage.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  it('renders FlashMessage component', () => {
    const wrapper = shallowMount(FlashMessage, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`.${notificationClass}`).length).toBe(1)
  })

  it('correctly renders Flash', () => {
    const message = 'Specs are fun!'
    const flash = new Flash(message, FlashType.info)
    const wrapper = shallowMount(FlashMessage, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        flash,
      },
    })
    expect(wrapper.text()).toEqual('Specs are fun!')
  })
})
