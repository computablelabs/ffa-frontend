import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import FlashMessage from '@/components/ui/FlashMessage.vue'
import appStore from '../../../../src/store'
import FileUploader from '@/components/listing/FileUploader.vue'
import Flash, { FlashType } from '../../../../src/models/Flash'

const localVue = createLocalVue()

const notificationClass = 'notification'
const warningType = FlashType.warning
const warningClass = 'is-warning'

describe('FlashMessage.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
  })

  it('renders FlashMessage component', () => {
    const wrapper = shallowMount(FlashMessage, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`.${notificationClass}`).length).toBe(1)
  })

  it('renders warning message', () => {
    const message = 'a bleak warning from the future'
    const flash = new Flash(message, warningType)
    const wrapper = shallowMount(FlashMessage, {
      propsData: { flash },
    })
    expect(wrapper.findAll(`.${notificationClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${warningClass}`).length).toBe(1)
    expect(wrapper.text()).toMatch(message)
  })
})
