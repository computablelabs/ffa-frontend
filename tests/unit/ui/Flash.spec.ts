import { shallowMount } from '@vue/test-utils'
import Flash from '@/components/ui/Flash.vue'

const notificationClass = 'notification'
const warningType = 'warning'
const warningClass = 'is-warning'


describe('Flash.vue', () => {
  it('renders warning message', () => {
    const message = 'a bleak warning from the future'
    const flashType = warningType
    const wrapper = shallowMount(Flash, {
      propsData: { message, flashType },
    })
    expect(wrapper.findAll(`.${notificationClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${warningClass}`).length).toBe(1)
    expect(wrapper.text()).toMatch(message)
  })
})
