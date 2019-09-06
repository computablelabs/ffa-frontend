import { mount, Wrapper } from '@vue/test-utils'

import StaticFfaTags from '@/components/ui/StaticFfaTags.vue'

const tagContainerClass = 'tag-container'
const tagClass = 'ffa-tag'
const editableClass = 'editable'

describe('StaticFfaTags.vue', () => {

  let wrapper!: Wrapper<StaticFfaTags>

  it ('renders empty tags', () => {
    wrapper = mount(StaticFfaTags, {
      propsData: {
        tags: [],
      },
    })

    expect(wrapper.findAll(`.${tagContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${tagClass}`).length).toBe(0)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it ('renders non-editable tags by default', () => {
    wrapper = mount(StaticFfaTags, {
      propsData: {
        tags: [
          'foo',
          'bar',
        ],
      },
    })

    expect(wrapper.findAll(`.${tagContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${tagClass}`).length).toBe(2)
    expect(wrapper.findAll(`.${tagClass}.${editableClass}`).length).toBe(0)
  })
})
