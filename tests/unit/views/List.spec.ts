import { shallowMount } from '@vue/test-utils'
import List from '@/views/List.vue' // TODO: fix vs code lint issue here

const listClass = 'list'
const containerClass = 'container'
const dropzoneClass = 'dropzone'

describe('List.vue', () => {
  it('renders the List view', () => {
    // const message = 'a bleak warning from the future'
    // const flashType = warningType
    const wrapper = shallowMount(List, {
      attachToDocument: true,  // otherwise dropzone fails
    })
    expect(wrapper.findAll(`.${listClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${containerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${dropzoneClass}`).length).toBe(1)
  })
})
