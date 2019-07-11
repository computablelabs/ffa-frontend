import { shallowMount } from '@vue/test-utils'
import FlashMessage from '../../../src/components/ui/FlashMessage.vue'
import Flash from '../../../src/models/Flash'
import { FlashType } from '../../../src/models/Flash'

const notificationClass = 'notification'
const warningType = FlashType.warning
const warningClass = 'is-warning'


describe('FlashMessage.vue', () => {
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
