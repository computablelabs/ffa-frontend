import { shallowMount } from '@vue/test-utils'
import List from '@/views/List.vue' // TODO: fix vs code lint issue here
import appStore from '../../../src/store'

const listId = 'list'
const dropzoneClass = 'dropzone'

describe('List.vue', () => {
  it('renders the List view', () => {
    const wrapper = shallowMount(List, {
      store: appStore,
      attachToDocument: true,  // otherwise dropzone fails
    })
    expect(wrapper.findAll(`section#${listId}`).length).toBe(1)
    expect(wrapper.findAll(`.${dropzoneClass}`).length).toBe(1)
  })
})
